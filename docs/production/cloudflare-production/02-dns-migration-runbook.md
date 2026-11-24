# DNS migration runbook: Spaceship → Cloudflare (prepared, NOT executed)

**Status 2026-11-25:** preparation only. No DNS record, nameserver or DNSSEC setting has been changed. Every step below needs the owner's go-ahead (see 01-owner-information-required.md §7).

**Why the nameservers move:** a Worker can serve `alnasrfurniture.com` only if the zone uses Cloudflare's nameservers; Workers custom domains do not support a CNAME setup. The registrar stays Spaceship, and the mailboxes stay on Spacemail.

## Facts measured 2026-11-25 (authoritative servers)

| Item | Value | Why it matters |
|---|---|---|
| Nameservers | `launch1.spaceship.net`, `launch2.spaceship.net`; **TTL 172800 s (48 h)** at the `.com` registry | Resolvers may use either the old or the new nameservers for up to 48 h after the switch. Both must serve identical records |
| DNSSEC | **On.** DS `15841 13 2 6EBCEF…0BC3` at the registry, **TTL 86400 s (24 h)**; DNSKEY TTL 3600 s | The DS must be removed and expired **before** the switch, or validating resolvers fail to resolve the domain (site **and** e-mail) |
| MX | `0 mx1.spacemail.com`, `0 mx2.spacemail.com` (TTL 300) | Incoming mail |
| SPF | TXT `@` `v=spf1 include:spf.spacemail.com ~all` (TTL 300) | Outgoing mail authentication |
| DKIM | TXT `spacemail._domainkey` (RSA public key, TTL 300) | Outgoing mail signing; copy the value **exactly** |
| Autodiscover | SRV `_autodiscover._tcp` → `0 0 443 autoconfig.spacemail.com` (TTL 300) | Mail-client setup |
| DMARC | **None** | Optional to add after the move |
| Website | No A/AAAA/`www` records today | No existing site to preserve |
| Snapshot | Complete public snapshot taken 2026-11-25 (NS, SOA, MX ×2, SPF, DKIM, SRV, DNSKEY ×2, DS); no `www`/`mail`/`autoconfig` names | Matches this table; the Spaceship panel export is still needed for names that cannot be discovered by query |

## 0. Preconditions (all must be true)
1. The production Worker has passed its `workers.dev` check: deployed with indexing off, production smoke test, controlled RFQ (00-production-config.md).
2. The Cloudflare account is business-owned, with 2FA and a second administrator.
3. The owner has approved the cut-over window and is reachable during it.

## 1. Full backup of the Spaceship DNS (before touching anything)
1. Spaceship → Domain → **DNS / Advanced DNS**. Screenshot **every** record and copy each into the backup file: type, host, value, priority, TTL.
2. Spacemail → mailbox / domain settings. Note any **required DNS records** Spacemail lists that are not in the table above.
3. Take a public snapshot from the authoritative server and keep it in a private folder (not in the repository):
   ```bash
   D=alnasrfurniture.com; NS=launch1.spaceship.net; OUT=dns-backup-spaceship-$(date +%F).txt
   # `while read t n` works the same in zsh and bash (zsh does not word-split "$q" in a for loop).
   while read -r t n; do echo "== $t $n"; dig +noall +answer "$t" "$n" @"$NS"; done > "$OUT" <<EOF
   NS $D
   SOA $D
   MX $D
   TXT $D
   CAA $D
   TXT _dmarc.$D
   TXT spacemail._domainkey.$D
   SRV _autodiscover._tcp.$D
   CNAME www.$D
   DNSKEY $D
   EOF
   dig +noall +answer DS "$D" @a.gtld-servers.net >> "$OUT"
   ```
   A full zone transfer is not available, so the panel screenshots are the source of truth for names not listed above.

## 2. E-mail baseline (before the migration)
1. From the business mailbox, send to an external Gmail and reply back. Both must arrive.
2. In Gmail, "Show original": record **SPF = PASS** and **DKIM = PASS** (`d=alnasrfurniture.com`). This is the reference for step 7.

## 3. Prepare the Cloudflare zone (no effect on live traffic)
1. Cloudflare → **Add a domain** → `alnasrfurniture.com` → **Free** plan. Choose manual record entry, or review the import line by line; never trust the scan alone.
2. Recreate **every** record from the backup:
   - MX `@` → `mx1.spacemail.com` (priority 0), MX `@` → `mx2.spacemail.com` (priority 0);
   - TXT `@` `v=spf1 include:spf.spacemail.com ~all`;
   - TXT `spacemail._domainkey`, the exact DKIM value;
   - SRV `_autodiscover._tcp`: priority 0, weight 0, port 443, target `autoconfig.spacemail.com`;
   - any extra Spacemail record found in step 1.
3. Set every mail-related record to **DNS only** (grey cloud). Add **no** A/AAAA for `@`/`www`; the Worker custom domain creates those later.
4. Add the **Resend** records shown in the Resend dashboard (`send` MX + TXT, `resend._domainkey` TXT), DNS only.
5. Note the **two Cloudflare nameservers** assigned to the zone.

## 4. Verify before switching
Query each record directly on a Cloudflare nameserver. The answers must match the backup **exactly** (values, priorities):
```bash
CF=<first-assigned>.ns.cloudflare.com; D=alnasrfurniture.com
while read -r t n; do echo "== $t $n"; dig +short "$t" "$n" @"$CF"; done <<EOF
MX $D
TXT $D
TXT spacemail._domainkey.$D
SRV _autodiscover._tcp.$D
MX send.$D
TXT send.$D
TXT resend._domainkey.$D
EOF
```
Any difference → fix it in Cloudflare and repeat. Do not continue with a mismatch.

## 5. Remove DNSSEC and wait for the DS to expire
1. Spaceship → Domain → **DNSSEC → disable** (this removes the DS at the `.com` registry).
2. Confirm at the registry: `dig +short DS alnasrfurniture.com @a.gtld-servers.net` must print **nothing**.
3. **Wait at least 24 h** (DS TTL 86400 s) after that empty answer.
4. Confirm public resolvers no longer hold the DS. Each must print nothing:
   ```bash
   dig +short DS alnasrfurniture.com @1.1.1.1
   dig +short DS alnasrfurniture.com @8.8.8.8
   dig +short DS alnasrfurniture.com @9.9.9.9
   ```
5. Re-check that the site and e-mail still resolve: `dig +short MX alnasrfurniture.com @1.1.1.1` lists both Spacemail servers.

## 6. Switch the nameservers (the only step that touches e-mail)
1. Spaceship → Domain → **Nameservers → Custom** → the two Cloudflare nameservers. Spaceship keeps the old records stored as **inactive**, which is the rollback copy.
2. Cloudflare → zone → **Check nameservers**. Wait for the zone status **Active**.
3. For up to **48 h** (NS TTL), some resolvers still ask Spaceship. That is safe only because both serve the same records (step 4).

## 7. E-mail verification after the switch
1. Repeat step 2 (send and receive) at **+1 h, +24 h and +48 h**. Expect SPF PASS, DKIM PASS and no bounces.
2. `dig +short NS alnasrfurniture.com @1.1.1.1` shows the Cloudflare pair.
3. Resend dashboard → domain **Verified** (it may take until the switch is visible).

## 8. Attach the site and verify SSL (production deploy separately approved)
1. Uncomment the `routes` in `wrangler.production.jsonc` for the canonical host and the other host, then `npm run cf:deploy:production`. Cloudflare creates the DNS records and the certificate.
2. Cloudflare → SSL/TLS → **Edge Certificates**: certificate **Active** for both hosts; turn on **Always Use HTTPS**.
3. Check:
   - `curl -sI https://alnasrfurniture.com/en` → `HTTP/2 200`;
   - `curl -sI https://www.alnasrfurniture.com/en` → redirect to the canonical host;
   - `curl -sI http://alnasrfurniture.com/en` → redirect to `https`;
   - `openssl s_client -connect alnasrfurniture.com:443 -servername alnasrfurniture.com </dev/null | grep -E 'subject|issuer|Verify return code'` → `Verify return code: 0`.
4. Production smoke test: `SMOKE_MODE=production BASE_URL=https://alnasrfurniture.com SITE_URL=https://alnasrfurniture.com node cloudflare/shared/smoke-test.mjs`. It must report 0 failures, with indexing still off.
5. One real RFQ through the production form reaches the RFQ inbox.

## 9. Re-enable DNSSEC
1. Cloudflare → DNS → Settings → **Enable DNSSEC**. Copy the DS values: key tag, algorithm 13, digest type 2, digest.
2. Spaceship → Domain → DNSSEC → **add DS** with exactly those values.
3. Verify:
   - `dig +short DS alnasrfurniture.com @a.gtld-servers.net` shows the **new** key tag;
   - Cloudflare shows DNSSEC **Success** (it can take up to a day);
   - `dig +dnssec alnasrfurniture.com @1.1.1.1` returns the `ad` flag.

## 10. Rollback, by stage

| Failure seen | Rollback | Time to effect |
|---|---|---|
| Record mismatch in step 4 | Fix in Cloudflare; nothing live has changed | Immediate |
| Something wrong after step 5, before step 6 | Re-enable DNSSEC at Spaceship with its own DS (Spaceship re-signs) | DS TTL up to 24 h |
| Mail broken after step 6 | 1. Add or fix the missing record in Cloudflare (minutes, TTL 300). 2. If still broken: Spaceship → nameservers back to `launch1`/`launch2.spaceship.net`; the inactive records become active again. **Keep DNSSEC off** during this | Up to 48 h (NS TTL) |
| Site broken after step 8, mail fine | `npx wrangler rollback <previous version-id> -c wrangler.production.jsonc`, or remove the custom-domain routes (the site goes offline, mail is unaffected) | About 1 minute |
| DNSSEC validation failures after step 9 | Remove the DS at Spaceship and wait for its TTL; the domain then resolves unsigned | Up to 24 h |

Rollback of a Worker version was exercised for real on staging on 2026-11-25: `wrangler rollback` to `83e696d7` returned the site to 24/24 pages 200 within seconds.
