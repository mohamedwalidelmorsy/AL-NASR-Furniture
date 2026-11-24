# Post-launch backlog (non-blocking)

**2026-11-25:** the owner switched priority to an immediate MVP launch. These items were deliberately deferred. None blocks the launch.

| # | Item | Why / evidence | Needs |
|---|---|---|---|
| B1 | Turn online RFQ on | MVP ships with `NEXT_PUBLIC_RFQ_ENABLED=false` (contact links only, nothing submitted) | Resend account + domain verification, 3 Worker secrets, consent text + version, privacy notice; then rebuild with `true` |
| B2 | Favicon / app icon | `/favicon.ico` → 404; this is the only console error in Lighthouse and the reason Best-practices is 96 | Final logo (square 512 px) |
| B3 | Final logo, legal entity names, registration numbers | Placeholders remain (01-owner-information-required.md §2–3) | Owner |
| B4 | Product imagery | 55/55 products use labelled AI-generated images | Owner decision / authentic photos |
| B5 | Mobile LCP on image-led pages | Lighthouse (staging `51bc65c9`, median of 3): mobile `/ar` 85 (LCP 4.42 s), product 90 (3.62 s), `/en/collections` 93 (3.21 s). `/en` and `/ar/contact` mobile 100. Desktop 100 everywhere; Accessibility 100; CLS 0. Dominated by image load time | Image size/priority tuning |
| B6 | Edge cache for optimised images | Repeat transforms are re-computed (TTFB ~300 ms) | Worker change |
| B7 | DMARC record | None exists | DNS (after the zone is on Cloudflare) |
| B8 | HSTS | After a few weeks of stable HTTPS | Dashboard |
| B9 | Leave the OpenNext 1.20.17 pin | Return to the latest release once one contains the cookie fix (#1507) | Dependency bump + cookie smoke checks |
| B10 | GitHub CI (lint/typecheck/tests on PRs) | No CI exists | Workflow file |
| B11 | Merge `deployment/cloudflare-staging` into `main` | Production is deployed from the validated staging branch for the MVP | Owner approval |
| B12 | Uptime monitor and alerts | 00-production-config.md §4 | Free external monitor |
| B13 | Search indexing | Off until the owner approves | `NEXT_PUBLIC_ALLOW_INDEXING=true` + `CF_CONFIRM_INDEXING=yes` + `ALLOW_INDEXING="true"` |
