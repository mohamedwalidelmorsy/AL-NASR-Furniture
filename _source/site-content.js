/* AL NASR FURNITURE — centralized content, config, catalog and translations.
   Everything marked PENDING / sample must be replaced with approved data before launch.
   UI reads only from window.ALNASR; no business content lives in the page template. */
(function () {
  var PENDING = "PENDING";

  var config = {
    brand: { en: "AL NASR FURNITURE", ar: "النصر للأثاث" },
    logo: PENDING,                 // final wordmark artwork file — text wordmark used until supplied
    whatsappNumber: PENDING,       // international digits only, e.g. "201XXXXXXXXX"
    email: PENDING,                // business sales email
    domain: PENDING,
    social: { instagram: PENDING, facebook: PENDING, linkedin: PENDING },
    legalEntity: { en: "Al Nasr for Import & Export", ar: "مؤسسة النصر للاستيراد والتصدير", registration: PENDING }, // commercial registration / tax details PENDING
    privacyPolicy: PENDING,        // legal text pending review
    rfq: {
      endpoint: PENDING,           // server endpoint that accepts POST JSON and returns 2xx (+ optional {reference})
      consentTextVersion: PENDING
    },
    storageKeys: { inquiry: "alnasr.inquiry.v1", draft: "alnasr.rfqDraft.v1" }
  };

  var countries = [
    { code: "SA", g: "gcc", en: "Saudi Arabia", ar: "السعودية" },
    { code: "AE", g: "gcc", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
    { code: "KW", g: "gcc", en: "Kuwait", ar: "الكويت" },
    { code: "QA", g: "gcc", en: "Qatar", ar: "قطر" },
    { code: "BH", g: "gcc", en: "Bahrain", ar: "البحرين" },
    { code: "OM", g: "gcc", en: "Oman", ar: "عُمان" },
    { code: "EG", g: "other", en: "Egypt", ar: "مصر" },
    { code: "JO", g: "other", en: "Jordan", ar: "الأردن" },
    { code: "IQ", g: "other", en: "Iraq", ar: "العراق" },
    { code: "LB", g: "other", en: "Lebanon", ar: "لبنان" },
    { code: "LY", g: "other", en: "Libya", ar: "ليبيا" },
    { code: "MA", g: "other", en: "Morocco", ar: "المغرب" },
    { code: "DZ", g: "other", en: "Algeria", ar: "الجزائر" },
    { code: "TN", g: "other", en: "Tunisia", ar: "تونس" },
    { code: "SD", g: "other", en: "Sudan", ar: "السودان" },
    { code: "TR", g: "other", en: "Türkiye", ar: "تركيا" },
    { code: "GB", g: "other", en: "United Kingdom", ar: "المملكة المتحدة" },
    { code: "DE", g: "other", en: "Germany", ar: "ألمانيا" },
    { code: "FR", g: "other", en: "France", ar: "فرنسا" },
    { code: "US", g: "other", en: "United States", ar: "الولايات المتحدة" },
    { code: "XX", g: "other", en: "Other country", ar: "دولة أخرى" }
  ];

  /* Product categories — aligned with the approved product groups ("Our Products", Phase 4 source content). */
  var categories = [
    { id: "bedrooms", slug: "bedrooms", sort: 1, name: { en: "Bedroom Sets", ar: "غرف النوم" },
      desc: { en: "Modern and classic designs to suit different tastes.", ar: "تصميمات مودرن وكلاسيك تناسب مختلف الأذواق." } },
    { id: "kids-bedrooms", slug: "kids-bedrooms", sort: 2, name: { en: "Kids' Bedroom Sets", ar: "غرف الأطفال" },
      desc: { en: "Practical furniture in a variety of designs for family needs.", ar: "أثاث عملي بتصميمات متنوعة تناسب احتياجات الأسرة." } },
    { id: "corner-sofas", slug: "corner-sofas", sort: 3, name: { en: "Corner Sofas", ar: "الركن" },
      desc: { en: "A variety of corner sofa designs for living rooms.", ar: "تصميمات متنوعة لغرف المعيشة." } },
    { id: "living-rooms", slug: "living-rooms", sort: 4, name: { en: "Living Room Sofa Sets", ar: "الانتريهات" },
      desc: { en: "Seating sets with multiple design, fabric and finish options.", ar: "أطقم جلوس بخيارات متعددة من التصميمات والأقمشة والتشطيبات." } },
    { id: "china-cabinets", slug: "china-cabinets", sort: 5, name: { en: "China Cabinets", ar: "النيش" },
      desc: { en: "Elegant designs that complement dining room furniture.", ar: "تصميمات أنيقة ومتكاملة مع أثاث غرف السفرة." } },
    { id: "dining-rooms", slug: "dining-rooms", sort: 6, name: { en: "Dining Room Sets", ar: "غرف السفرة" },
      desc: { en: "Coordinated tables, chairs and designs to suit different spaces.", ar: "طاولات وكراسي وتصميمات متناسقة تناسب مختلف المساحات." } }
  ];

  var styles = {
    modern: { en: "Modern", ar: "مودرن" },
    classic: { en: "Classic", ar: "كلاسيك" },
    contemporary: { en: "Contemporary", ar: "معاصر" }
  };

  /* VISUAL CATALOG PREVIEW — products built from the Google Drive catalog ("الكتالوج").
     All images are AI-generated illustrative designs (see catalog-import/drive-inventory.json → audit).
     Codes are internal preview IDs, not manufacturer product codes. Pieces, materials and dimensions are
     intentionally empty: text embedded in the posters is unverified and not transcribed. */
  var ILLU_DESC = {
    en: "Illustrative design from the AL NASR FURNITURE catalog. The image is AI-generated and shows a design concept; final pieces, materials, finishes and dimensions are confirmed during quotation.",
    ar: "تصميم توضيحي من كتالوج النصر للأثاث. الصورة مُنشأة بالذكاء الاصطناعي وتعرض فكرة تصميمية، ويتم تأكيد القطع والخامات والتشطيبات والمقاسات النهائية أثناء إعداد عرض السعر."
  };
  var previewProducts = [
   {
    "id": "pv-br-01",
    "slug": "soft-arc-bedroom-set",
    "code": "PV-BR-01",
    "cat": "bedrooms",
    "name": {
     "en": "Soft Arc Bedroom Set",
     "ar": "طقم غرفة نوم بخطوط منحنية ناعمة"
    },
    "images": {
     "en": {
      "card": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-03-640.webp",
      "full": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-03-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1Bbn0sWcvhlnFFy7GFZfm1dFDe__aL_V4"
     },
     "ar": {
      "card": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-01-640.webp",
      "full": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-01-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1SGtOOAB_BNKAVOFPob1-yag3DYGxUFqx"
     }
    }
   },
   {
    "id": "pv-br-02",
    "slug": "curve-bedroom-set",
    "code": "PV-BR-02",
    "cat": "bedrooms",
    "name": {
     "en": "Curve Bedroom Set",
     "ar": "طقم غرفة نوم بخطوط منحنية"
    },
    "images": {
     "en": {
      "card": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-07-640.webp",
      "full": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-07-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "18Eb4iamYjmvNHTBiyMp35bX51FZ56-_9"
     },
     "ar": {
      "card": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-07-640.webp",
      "full": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-07-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1P_UgohZgKmmKftNTHBUpjil8QEDPestN"
     }
    }
   },
   {
    "id": "pv-br-03",
    "slug": "upholstered-bedroom-set",
    "code": "PV-BR-03",
    "cat": "bedrooms",
    "name": {
     "en": "Upholstered Bedroom Set",
     "ar": "طقم غرفة نوم منجد"
    },
    "images": {
     "en": {
      "card": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-08-640.webp",
      "full": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-08-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1_PvqoKUr8bjMF1Xx6iWtjg_8Ci9uhS_0"
     },
     "ar": {
      "card": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-06-640.webp",
      "full": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-06-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "10YMYJ3fqvNuV2GLkXcG4YZz9uNTVmckz"
     }
    }
   },
   {
    "id": "pv-br-04",
    "slug": "luxe-bedroom-set",
    "code": "PV-BR-04",
    "cat": "bedrooms",
    "name": {
     "en": "Luxe Bedroom Set",
     "ar": "طقم غرفة نوم فاخر"
    },
    "images": {
     "en": {
      "card": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-10-640.webp",
      "full": "assets/furniture/bedroom-sets/en/img-bedroom-sets-en-10-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1vMfGO5zUzLWQTw3XiRUXISSe3ZRuKQDi"
     },
     "ar": {
      "card": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-08-640.webp",
      "full": "assets/furniture/bedroom-sets/ar/img-bedroom-sets-ar-08-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1OT8h5F0xPzxyTfANIYvdkpNfKcQJ1-8f"
     }
    }
   },
   {
    "id": "pv-kb-01",
    "slug": "arch-line-kids-bedroom-set",
    "code": "PV-KB-01",
    "cat": "kids-bedrooms",
    "name": {
     "en": "Arch Line Kids Bedroom Set",
     "ar": "طقم غرفة أطفال بخطوط مقوسة"
    },
    "images": {
     "en": {
      "card": "assets/furniture/kids-bedrooms/en/img-kids-bedrooms-en-03-640.webp",
      "full": "assets/furniture/kids-bedrooms/en/img-kids-bedrooms-en-03-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1fvYt6Z7oAcgH1DcaajBKlRHXHYICeSDV"
     },
     "ar": {
      "card": "assets/furniture/kids-bedrooms/ar/img-kids-bedrooms-ar-03-640.webp",
      "full": "assets/furniture/kids-bedrooms/ar/img-kids-bedrooms-ar-03-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1ecoWHChpxwJIUFJaaW0bXszeT08zZfUP"
     }
    }
   },
   {
    "id": "pv-kb-02",
    "slug": "butterfly-charm-kids-bedroom-set",
    "code": "PV-KB-02",
    "cat": "kids-bedrooms",
    "name": {
     "en": "Butterfly Charm Kids Bedroom Set",
     "ar": "طقم غرفة أطفال بتفاصيل فراشة"
    },
    "images": {
     "en": {
      "card": "assets/furniture/kids-bedrooms/en/img-kids-bedrooms-en-04-640.webp",
      "full": "assets/furniture/kids-bedrooms/en/img-kids-bedrooms-en-04-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1AmxBraaiEN6zHGWpp0mUAqX5swxRdW_K"
     },
     "ar": {
      "card": "assets/furniture/kids-bedrooms/ar/img-kids-bedrooms-ar-04-640.webp",
      "full": "assets/furniture/kids-bedrooms/ar/img-kids-bedrooms-ar-04-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1rArr0OuJBGFItT0zjWjR2k_G3WPuFXvP"
     }
    }
   },
   {
    "id": "pv-kb-03",
    "slug": "study-nook-kids-bedroom-set",
    "code": "PV-KB-03",
    "cat": "kids-bedrooms",
    "name": {
     "en": "Study Nook Kids Bedroom Set",
     "ar": "طقم غرفة أطفال مع وحدة تخزين"
    },
    "images": {
     "en": {
      "card": "assets/furniture/kids-bedrooms/en/img-kids-bedrooms-en-08-640.webp",
      "full": "assets/furniture/kids-bedrooms/en/img-kids-bedrooms-en-08-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1TwGoJ_RwiWSZcfnsxXEyuNy9JNhYqCEo"
     },
     "ar": {
      "card": "assets/furniture/kids-bedrooms/ar/img-kids-bedrooms-ar-08-640.webp",
      "full": "assets/furniture/kids-bedrooms/ar/img-kids-bedrooms-ar-08-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1xx7lBbgQy2YdO4mbIQL9yiCc3VXjCa3m"
     }
    }
   },
   {
    "id": "pv-co-01",
    "slug": "cocoa-modular-sectional",
    "code": "PV-CO-01",
    "cat": "corner-sofas",
    "name": {
     "en": "Cocoa Modular Sectional",
     "ar": "ركنة معيارية كاكاو"
    },
    "images": {
     "en": {
      "card": "assets/furniture/corner-sofas/en/img-corner-sofas-en-09-640.webp",
      "full": "assets/furniture/corner-sofas/en/img-corner-sofas-en-09-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1CIXknCQpZa_IB5MWDSjoL5KGC1WfjB6e"
     },
     "ar": {
      "card": "assets/furniture/corner-sofas/ar/img-corner-sofas-ar-06-640.webp",
      "full": "assets/furniture/corner-sofas/ar/img-corner-sofas-ar-06-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1zOdxzqGpcZxGnZQW7T2nTpKydSSiBZ8r"
     }
    }
   },
   {
    "id": "pv-co-02",
    "slug": "minimal-white-sectional",
    "code": "PV-CO-02",
    "cat": "corner-sofas",
    "name": {
     "en": "Minimal White Sectional",
     "ar": "ركنة بيضاء مينيمال"
    },
    "images": {
     "en": {
      "card": "assets/furniture/corner-sofas/en/img-corner-sofas-en-06-640.webp",
      "full": "assets/furniture/corner-sofas/en/img-corner-sofas-en-06-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1f3qSLno1HcEWE28LqOqFXcp10SW9S9O5"
     },
     "ar": {
      "card": "assets/furniture/corner-sofas/ar/img-corner-sofas-ar-10-640.webp",
      "full": "assets/furniture/corner-sofas/ar/img-corner-sofas-ar-10-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1nl1u1ydGB4dnLKFeyutK85MnfaC4l0UF"
     }
    }
   },
   {
    "id": "pv-co-03",
    "slug": "olive-curve-sofa",
    "code": "PV-CO-03",
    "cat": "corner-sofas",
    "name": {
     "en": "Olive Curve Sofa",
     "ar": "كنبة منحنية زيتونية"
    },
    "images": {
     "en": {
      "card": "assets/furniture/corner-sofas/en/img-corner-sofas-en-01-640.webp",
      "full": "assets/furniture/corner-sofas/en/img-corner-sofas-en-01-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "13Xe65UDpmuY9fTdjAlRMfwnIbAdnyPU8"
     },
     "ar": {
      "card": "assets/furniture/corner-sofas/ar/img-corner-sofas-ar-01-640.webp",
      "full": "assets/furniture/corner-sofas/ar/img-corner-sofas-ar-01-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1Nw1YgwyZRIwY6RGk0CGMSYxPB1Z3TTfA"
     }
    }
   },
   {
    "id": "pv-lr-01",
    "slug": "soft-arc-corner-sofa",
    "code": "PV-LR-01",
    "cat": "living-rooms",
    "name": {
     "en": "Soft Arc Corner Sofa",
     "ar": "ركنة قوس ناعم"
    },
    "images": {
     "en": {
      "card": "assets/furniture/living-room-sofas/en/img-living-room-sofas-en-07-640.webp",
      "full": "assets/furniture/living-room-sofas/en/img-living-room-sofas-en-07-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1BhVKi0afHLkmlaS7m-ex3Z4yM1It4bYi"
     },
     "ar": {
      "card": "assets/furniture/living-room-sofas/ar/img-living-room-sofas-ar-07-640.webp",
      "full": "assets/furniture/living-room-sofas/ar/img-living-room-sofas-ar-07-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1q7IIpFGsV5c56aqcAtogz3MI_v37UBQe"
     }
    }
   },
   {
    "id": "pv-lr-02",
    "slug": "teal-sectional-sofa",
    "code": "PV-LR-02",
    "cat": "living-rooms",
    "name": {
     "en": "Teal Sectional Sofa",
     "ar": "ركنة تيل لاين"
    },
    "images": {
     "en": {
      "card": "assets/furniture/living-room-sofas/en/img-living-room-sofas-en-08-640.webp",
      "full": "assets/furniture/living-room-sofas/en/img-living-room-sofas-en-08-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1fevSqveUPw89MtSckglKPpj8NX6G_y52"
     },
     "ar": {
      "card": "assets/furniture/living-room-sofas/ar/img-living-room-sofas-ar-08-640.webp",
      "full": "assets/furniture/living-room-sofas/ar/img-living-room-sofas-ar-08-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1o9GU9BDsNmH59-BLFp5ZvMMYDwTEUbMh"
     }
    }
   },
   {
    "id": "pv-lr-03",
    "slug": "luxury-corner-sofa",
    "code": "PV-LR-03",
    "cat": "living-rooms",
    "name": {
     "en": "Luxury Corner Sofa",
     "ar": "ركنة رويال كونتراست"
    },
    "images": {
     "en": {
      "card": "assets/furniture/living-room-sofas/en/img-living-room-sofas-en-10-640.webp",
      "full": "assets/furniture/living-room-sofas/en/img-living-room-sofas-en-10-1400.webp",
      "w": 1122,
      "h": 1402,
      "drive": "1uDuf5f3esOyJnS9P8_tnrGoN0122Lvdq"
     },
     "ar": {
      "card": "assets/furniture/living-room-sofas/ar/img-living-room-sofas-ar-10-640.webp",
      "full": "assets/furniture/living-room-sofas/ar/img-living-room-sofas-ar-10-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1qDSM3rT1fDdHFtxuqDgE58naJXWCZbBI"
     }
    }
   },
   {
    "id": "pv-cc-01",
    "slug": "elegant-buffet-and-display-set",
    "code": "PV-CC-01",
    "cat": "china-cabinets",
    "name": {
     "en": "Elegant Buffet & Display Set",
     "ar": "طقم بوفيه ونيش أنيق"
    },
    "images": {
     "en": {
      "card": "assets/furniture/china-cabinets/en/img-china-dining-mixed-en-02-640.webp",
      "full": "assets/furniture/china-cabinets/en/img-china-dining-mixed-en-02-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1GngAdIo8zynnLE6gGcbk_ixsLIi4-VWx"
     },
     "ar": {
      "card": "assets/furniture/china-cabinets/ar/img-china-dining-mixed-ar-02-640.webp",
      "full": "assets/furniture/china-cabinets/ar/img-china-dining-mixed-ar-02-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1d5kSqiC1YYwG69uQfaGD9zyMcNJUwGan"
     }
    }
   },
   {
    "id": "pv-cc-02",
    "slug": "mirrored-sideboard-set",
    "code": "PV-CC-02",
    "cat": "china-cabinets",
    "name": {
     "en": "Mirrored Sideboard Set",
     "ar": "طقم بوفيه مرايا"
    },
    "images": {
     "en": {
      "card": "assets/furniture/china-cabinets/en/img-china-dining-mixed-en-04-640.webp",
      "full": "assets/furniture/china-cabinets/en/img-china-dining-mixed-en-04-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1UfSi3PEWsroKEfS-_grcLRLT_HoJTYAO"
     },
     "ar": {
      "card": "assets/furniture/china-cabinets/ar/img-china-dining-mixed-ar-04-640.webp",
      "full": "assets/furniture/china-cabinets/ar/img-china-dining-mixed-ar-04-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1N9OwoNBXxeeitriCu3aptzP3FzBQ1XJU"
     }
    }
   },
   {
    "id": "pv-cc-03",
    "slug": "curved-display-cabinet-set",
    "code": "PV-CC-03",
    "cat": "china-cabinets",
    "name": {
     "en": "Curved Display Cabinet Set",
     "ar": "طقم نيش منحني"
    },
    "images": {
     "en": {
      "card": "assets/furniture/china-cabinets/en/img-china-dining-mixed-en-05-640.webp",
      "full": "assets/furniture/china-cabinets/en/img-china-dining-mixed-en-05-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1Epd_1D8AKMnN4OGcT05gh3FDcoMfusBw"
     },
     "ar": {
      "card": "assets/furniture/china-cabinets/ar/img-china-dining-mixed-ar-05-640.webp",
      "full": "assets/furniture/china-cabinets/ar/img-china-dining-mixed-ar-05-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1W88pro7ivDKSE94N7l9mAxj_Lo6w93V0"
     }
    }
   },
   {
    "id": "pv-dr-01",
    "slug": "dining-room-set",
    "code": "PV-DR-01",
    "cat": "dining-rooms",
    "name": {
     "en": "Dining Room Set",
     "ar": "طقم سفرة"
    },
    "images": {
     "en": {
      "card": "assets/furniture/dining-room-sets/en/img-china-dining-mixed-en-03-640.webp",
      "full": "assets/furniture/dining-room-sets/en/img-china-dining-mixed-en-03-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1XqGqMxxJ7XMlrlD78P1-eu6g43jokxNl"
     },
     "ar": {
      "card": "assets/furniture/dining-room-sets/ar/img-china-dining-mixed-ar-03-640.webp",
      "full": "assets/furniture/dining-room-sets/ar/img-china-dining-mixed-ar-03-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1CPcm40iyLyUthou1c1Un1Ap7aY1Qw8Mo"
     }
    }
   },
   {
    "id": "pv-dr-02",
    "slug": "luxury-dining-set",
    "code": "PV-DR-02",
    "cat": "dining-rooms",
    "name": {
     "en": "Luxury Dining Set",
     "ar": "طقم سفرة فاخر"
    },
    "images": {
     "en": {
      "card": "assets/furniture/dining-room-sets/en/img-china-dining-mixed-en-07-640.webp",
      "full": "assets/furniture/dining-room-sets/en/img-china-dining-mixed-en-07-1400.webp",
      "w": 1055,
      "h": 1491,
      "drive": "1k24X5fqRxekds9Zjz4Ee3q2UGbT2gJv5"
     },
     "ar": {
      "card": "assets/furniture/dining-room-sets/ar/img-china-dining-mixed-ar-07-640.webp",
      "full": "assets/furniture/dining-room-sets/ar/img-china-dining-mixed-ar-07-1400.webp",
      "w": 1024,
      "h": 1536,
      "drive": "1eVUNtUqHeJli9q6jD3KM1Z1QXo8zS-Qj"
     }
    }
   }
  ];
  var collections = previewProducts.map(function (p, i) {
    return { id: p.id, slug: p.slug, code: p.code, cat: p.cat, style: null, unit: "set", sort: i, illustrative: true, sample: false,
      name: p.name, desc: ILLU_DESC, pieces: [], materials: null, customization: null, images: p.images };
  });

  var i18n = {
    en: {
      dir: "ltr", arrow: "→", back: "←", switchTo: "العربية", switchCode: "AR",
      skip: "Skip to content",
      nav: { home: "Home", collections: "Collections", about: "About Us", sourcing: "Sourcing & Export", shipping: "Shipping & Payment Guide", custom: "Custom Manufacturing & Projects", contact: "Contact", rfq: "Request a Quote", inquiry: "Inquiry List", inquiryShort: "Inquiry", menu: "Menu", close: "Close menu", lang: "Language", primary: "Main navigation" },
      sample: "Sample", illustrative: "Illustrative design", illustrativeAlt: "illustrative catalog design (AI-generated image)",
      wa: { general: "Hello AL NASR FURNITURE, I have a wholesale furniture inquiry.", product: "Hello AL NASR FURNITURE, I would like to ask about {name} (Ref. {code}). {url}" },
      ph: { hero: "Hero photograph — approved furniture image", category: "Category cover — 4:3", collection: "Collection photo — 3:4", gallery: "Gallery image", about: "Approved company / product photograph", overview: "Set overview" },
      hero: {
        eyebrow: "Egyptian furniture manufacturing & export solutions",
        title: "Egyptian furniture, produced and exported for wholesale buyers.",
        body: "AL NASR FURNITURE supplies Egyptian furniture to importers, wholesalers, distributors and retail showrooms — coordinating design, production, quality checks, packaging and export through the manufacturing network we work with in Egypt.",
        cta1: "Explore Collections", cta2: "Request a Quote", note: "B2B supply only, with an initial focus on GCC markets. Every order is quoted individually."
      },
      featured: { eyebrow: "Our products", title: "Furniture categories", viewAll: "View all collections", cta: "View collections" },
      intro: {
        eyebrow: "About AL NASR", title: "One commercial partner from design to shipment.",
        body: "We combine a range of designs, attention to detail and coordinated production to serve importers and furniture traders. Buyers deal with AL NASR FURNITURE as a single point of contact, while we coordinate manufacturing, quality checks, packaging and export with our partners in Egypt.",
        link: "About AL NASR"
      },
      why: {
        eyebrow: "What we offer", title: "Manufacturing, export and quality — coordinated in one place",
        items: [
          { title: "Manufacturing & supply", body: "Bedroom sets, kids' bedrooms, corner sofas, living room sets, china cabinets and dining rooms in modern and classic designs — with made-to-order designs, sizes and finishes subject to production feasibility.", link: "Custom manufacturing", to: "custom-manufacturing" },
          { title: "B2B export solutions", body: "Export packaging, shipping documents and international shipping arrangements, coordinated according to destination and contract terms.", link: "Shipping & payment guide", to: "shipping-payment" },
          { title: "Quality & inspection", body: "Products are reviewed against the agreed specifications before packing. Independent pre-shipment inspection can be arranged on request.", link: "Quality control process", to: "sourcing-export" }
        ]
      },
      process: {
        eyebrow: "How we work", title: "From inquiry to shipment",
        steps: [
          { title: "Inquiry & quotation", body: "Send products, quantities and specifications. We prepare a quotation covering products, delivery, payment and shipping terms." },
          { title: "Specifications & order", body: "Design, materials, colours, sizes, finishes and packing are agreed before the order is confirmed." },
          { title: "Production & quality control", body: "Products are made with our manufacturing partner and reviewed against the agreed specifications." },
          { title: "Packing & shipment", body: "Export packing, container loading and shipping documents are prepared, and goods ship under the agreed delivery term." }
        ],
        note: "A quote request does not confirm an order or a price. Every order is agreed individually.",
        link: "See the full 10-step export process"
      },
      projects: {
        eyebrow: "Custom & projects", title: "Custom designs and project furnishing",
        body: "Send your own designs, drawings and specifications, or tell us about a hotel, residential or commercial project. Each request is reviewed for production feasibility and quoted separately.",
        link: "Custom manufacturing & projects"
      },
      cta: { title: "Looking for a furniture supplier in Egypt?", body: "Send us the products you need. We will review your request and prepare a quotation — or talk to our sales team directly on WhatsApp.", rfq: "Request a Quote", wa: "WhatsApp Sales" },
      footer: {
        tagline: "Egyptian furniture manufacturing & export solutions for international B2B buyers.",
        explore: "Explore", guides: "Buyer guides", company: "Company", contact: "Contact", email: "Email", whatsapp: "WhatsApp",
        pending: "Pending confirmation", privacy: "Privacy notice",
        legal: "AL NASR FURNITURE is the commercial brand of Al Nasr for Import & Export (مؤسسة النصر للاستيراد والتصدير). Registration details will be published once confirmed.",
        wordmark: "Provisional text wordmark — final logo pending.", rights: "AL NASR FURNITURE"
      },
      crumbs: { home: "Home", label: "Breadcrumb" },
      collections: {
        title: "Collections", intro: "Browse Egyptian furniture by category. Select collections and quantities to build one wholesale quotation request.",
        search: "Search all collections", searchPh: "Search by name or reference code", clear: "Clear search",
        results: "{n} results for “{q}”", noResults: "No collections match “{q}”.", noResultsHint: "Try another name or reference code, or browse by category.",
        count: "{n} collections", count1: "1 collection", allCats: "All categories"
      },
      category: {
        filter: "Style", all: "All", count: "{n} collections", count1: "1 collection", search: "Search in this category",
        empty: "No collections match your search or filters.", reset: "Reset filters", others: "Other categories"
      },
      card: { view: "View details", ref: "Internal ref." },
      detail: {
        sampleNotice: "Illustrative design — this catalog image is AI-generated. Text inside the image (set contents, materials, dimensions) has not been verified; final specifications are confirmed during quotation.", piecesPending: "Set contents to be confirmed",
        category: "Category", pieces: "Included pieces", piece: "Piece", qty: "Qty", dims: "Dimensions (W × D × H)",
        onRequest: "Available on request", cm: "cm", materials: "Materials & finishes", description: "Description",
        quantity: "Requested quantity", units: { set: "sets", piece: "pieces" }, dec: "Decrease quantity", inc: "Increase quantity",
        add: "Add to Inquiry", update: "Update Inquiry", inList: "In your inquiry list: {q} {u}", viewList: "View inquiry list",
        wa: "Ask on WhatsApp", rfq: "Request a Quote", related: "Related collections",
        gallery: "Image gallery", enlarge: "View larger image", prev: "Previous image", next: "Next image", close: "Close image viewer",
        imageOf: "Image {i} of {n}", thumb: "Show image {i}", noPrice: "Prices are quoted individually based on volume, specifications and destination."
      },
      inquiry: {
        title: "Inquiry List", intro: "Collections you have shortlisted for one quotation request. Adjust quantities, add notes, then continue to the request form.",
        emptyTitle: "Your inquiry list is empty", emptyBody: "Add collections from the catalog to request one consolidated quotation — or send a general inquiry without selecting products.",
        browse: "Browse Collections", general: "Send a general inquiry", qty: "Quantity", note: "Notes for this collection (optional)",
        notePh: "e.g. finish, colour or size changes", remove: "Remove", summary: "Summary", selected: "{n} collections selected", selected1: "1 collection selected",
        continueRfq: "Continue to quote request", continueBrowsing: "Continue browsing",
        notCart: "This is a shortlist for a quotation, not an order. No prices or payment are involved.", saved: "Saved in this browser.", guide: "How shipping & payment work"
      },
      toast: { added: "Added to your inquiry list", updated: "Inquiry quantity updated", removed: "Removed from inquiry list", undo: "Undo", waPending: "WhatsApp number is pending configuration.", cleared: "Inquiry list cleared" },
      contact: {
        eyebrow: "Contact", title: "Contact our export sales team", intro: "Choose the channel that suits you: a direct WhatsApp conversation, or a quotation request through the form below.",
        waTitle: "Chat on WhatsApp", waBody: "Opens a direct conversation with sales. No form required.", waBtn: "Chat with Sales on WhatsApp", waPending: "WhatsApp number pending",
        emailTitle: "Email", emailPending: "Business email pending",
        rfqTitle: "Request a Quotation", rfqBody: "Send us the details of the products you need. We will review your request and prepare a quotation for exporting furniture from Egypt.",
        includesTitle: "Depending on the deal, a quotation may cover",
        includes: ["Products and quantities", "Specifications and dimensions", "Shipment volume", "Packaging options", "Delivery and shipping terms", "Payment method", "Estimated production and shipping time"]
      },
      form: {
        name: "Full name", company: "Company name", buyerType: "Buyer type", country: "Destination country", email: "Business email",
        phone: "Phone / WhatsApp", phoneHint: "Include country code, e.g. +971 50 123 4567", pref: "Preferred contact method",
        prefs: { email: "Email", whatsapp: "WhatsApp", phone: "Phone call" }, contactHint: "Provide at least one: email or phone / WhatsApp.",
        inquiryType: "Inquiry type",
        inquiryTypes: [{ v: "wholesale", l: "Wholesale collections" }, { v: "custom", l: "Custom design" }, { v: "project", l: "Project / hotel furnishing" }, { v: "shipping", l: "Shipping & logistics" }, { v: "general", l: "General inquiry" }],
        tradeTitle: "Trade preferences", tradeHint: "Preferences are discussed and confirmed in the quotation — they do not commit either party.",
        shipTerm: "Preferred delivery term", payTerm: "Preferred payment term", destPort: "Destination port / city", destPortPh: "e.g. Jebel Ali, Dubai",
        noPref: "No preference / discuss",
        shipTerms: [{ v: "EXW", l: "EXW — Ex Works" }, { v: "FOB", l: "FOB — Free On Board" }, { v: "CFR", l: "CFR — Cost and Freight" }, { v: "CIF", l: "CIF — Cost, Insurance and Freight" }],
        payTerms: [{ v: "advance-30-70", l: "30% advance + 70% against shipping documents" }, { v: "lc-at-sight", l: "Irrevocable L/C at sight" }, { v: "tt", l: "Direct bank transfer (T/T)" }],
        termsGuide: "Shipping & payment guide",
        message: "Additional requirements", messagePhItems: "Specifications, customization requests, delivery destination, timing…", messagePhGeneral: "Describe the furniture types, quantities and specifications you are looking for…",
        messagePhCustom: "Describe the design, dimensions, materials, finishes and quantities. Our team will advise how to share drawings and images.",
        messagePhProject: "Describe the project type, number of units, products needed, specifications and timing…",
        messagePhShipping: "Describe the products, quantities, destination and any shipping or packaging requirements…",
        required: "Required", optional: "Optional", select: "Select…", selectCountry: "Select country", gcc: "GCC countries", other: "Other countries",
        buyerTypes: [{ v: "showroom", l: "Furniture showroom" }, { v: "importer", l: "Importer" }, { v: "wholesaler", l: "Wholesaler" }, { v: "distributor", l: "Distributor" }, { v: "retail-chain", l: "Retail chain" }, { v: "project", l: "Project developer / contractor" }, { v: "other", l: "Other" }],
        consent: "I agree that AL NASR FURNITURE may use these details to respond to my inquiry.", privacy: "Privacy notice", privacyPending: "(text pending legal review)",
        submit: "Send quote request", submitting: "Sending request…", selectedTitle: "Selected collections", noneSelected: "No collections selected. Your request will be sent as a general sourcing inquiry.",
        editList: "Edit inquiry list", browse: "Browse collections", notOrder: "Sending this request does not place an order.",
        err: {
          name: "Enter your full name.", country: "Select the destination country.", contact: "Provide an email address or a phone / WhatsApp number.",
          email: "Enter a valid email address, e.g. name@company.com.", phone: "Enter a valid international number with country code, e.g. +971 50 123 4567.",
          message: "Describe your requirements, or add collections to your inquiry list.", consent: "Please confirm consent so we can respond to your inquiry."
        },
        summaryTitle: "Please correct the following before sending:",
        notConfiguredTitle: "Request not sent",
        notConfigured: "Online quote requests are not yet connected to the AL NASR sales inbox, so this request has not been sent. Your details and selections are kept in this browser. Please contact sales on WhatsApp in the meantime.",
        networkTitle: "Connection problem", network: "We could not reach the server. Your details are kept — check your connection and try again.",
        serverTitle: "Request not accepted", server: "The server did not accept the request. Your details are kept — please try again.",
        retry: "Try again",
        successTitle: "Request received", successBody: "Thank you. Our sales team will review your requirements and follow up using your preferred contact method.",
        reference: "Reference", clearQ: "Clear your inquiry list now that the request has been received?", clear: "Clear inquiry list", keep: "Keep list", newReq: "Send another request"
      },
      about: {
        eyebrow: "About us", title: "About AL NASR FURNITURE",
        lead: "Egyptian furniture manufacturing & export solutions for importers, furniture traders and project buyers.",
        whoTitle: "Who we are",
        whoBody: [
          "AL NASR FURNITURE is the commercial brand of Al Nasr for Import & Export (مؤسسة النصر للاستيراد والتصدير), an Egyptian business focused on supplying and exporting Egyptian furniture to international markets. We combine coordinated manufacturing, a variety of designs and attention to detail to meet the needs of importers, furniture traders and buyers in different markets.",
          "Through the manufacturing and showroom network we work with in Egypt, we offer a complete range of home furniture — bedroom sets, kids' bedrooms, corner sofas, living room sets, china cabinets and dining rooms — in modern and classic designs, with designs, sizes and finishes that can be produced to customer requirements.",
          "We follow each order from design and specifications, through production, finishing and quality review, to packaging and export preparation — so every stage is coordinated to the requirements of the order and the target market."
        ],
        productsTitle: "Our products",
        mqTitle: "Manufacturing, quality & export",
        mq: [
          { title: "Manufacturing & quality", body: "We pay attention to every stage of furniture production — from selecting materials and defining specifications, through manufacturing and finishing, to reviewing products and preparing them for packing and shipment." },
          { title: "Made-to-order", body: "Made-to-order production can be coordinated, covering designs, sizes, finishes and quantities, according to available capabilities and agreement with the customer." },
          { title: "Export services", body: "Export of Egyptian furniture for importers, wholesalers, retailers and project furnishing companies — with packaging, export documents and international shipping coordinated according to destination and contract terms." }
        ],
        visionTitle: "Our vision",
        visionBody: "To become a trusted partner in manufacturing and exporting Egyptian furniture, and to expand the presence of our products in global markets through quality, design variety and long-term business relationships.",
        partnersTitle: "Our manufacturing & export network",
        partnersBody: "Production, finishing and showroom presentation are carried out through the manufacturing and showroom network we work with in Egypt, while AL NASR FURNITURE manages the commercial relationship with buyers. Partner names and facility imagery will be published only once their use is authorized.",
        ctaTitle: "Let's work together", ctaBody: "Whether you are a furniture importer, wholesaler, retailer or project developer, we are ready to discuss your requirements and offer furniture solutions suited to your market.",
        cta1: "Explore Collections", cta2: "Talk to Sales"
      },
      sourcing: {
        eyebrow: "Sourcing & Export", title: "How export orders are handled",
        lead: "From the first inquiry to shipment — how a wholesale furniture order is specified, produced, checked, packed and shipped with our partners in Egypt.",
        coordTitle: "Export coordination",
        coordBody: [
          "Our export service is built for importers, wholesalers, retailers and project furnishing companies who want one accountable contact in Egypt.",
          "We coordinate packaging, export documents and international shipping arrangements with our partners according to the destination and the contract terms — so buyers do not have to manage each supplier separately."
        ],
        processTitle: "The export process in 10 steps",
        steps: [
          { title: "Inquiry", body: "The customer sends the required products, quantities, dimensions, designs and specifications." },
          { title: "Quotation", body: "The request is reviewed and a quotation is prepared covering products, quantities, specifications, and delivery, payment and shipping terms." },
          { title: "Specification confirmation", body: "Design, materials, colours, dimensions, final finishes and packaging requirements are agreed." },
          { title: "Order confirmation", body: "Once the commercial and technical details and contract terms are agreed, the order is confirmed and execution begins." },
          { title: "Production", body: "Products are manufactured and prepared to the agreed specifications, in coordination with the manufacturer." },
          { title: "Quality control (QC)", body: "Products are reviewed against the agreed specifications, including dimensions, materials, finishes and condition before packing." },
          { title: "Export packaging", body: "Packing materials and methods suited to the furniture and the transport mode are selected, to reduce the risk of scratches, impact and damage." },
          { title: "Container loading", body: "Products are arranged in the container to suit the shipment, make use of the available space and protect the goods." },
          { title: "Shipping documents", body: "Required documents are prepared according to the shipment, the importing country and the agreed payment and delivery terms." },
          { title: "Shipment", body: "Goods are shipped to the agreed port of arrival or place of delivery, under the delivery term specified in the contract." }
        ],
        qcTitle: "Quality control & inspection",
        qcBody: "Products are reviewed before shipment to check that they match the specifications agreed with the customer. Depending on the order, checks may include:",
        qcChecks: ["Materials review", "Dimensions and measurements", "Design and colours", "Finish quality", "Product condition before packing", "Packaging review", "Container loading check"],
        qcMedia: "Photos or videos of preparation and inspection stages can be provided at the customer's request and by prior agreement.",
        tpiTitle: "Independent pre-shipment inspection",
        tpiBody: "An independent inspection of the shipment can be arranged before shipping, at the customer's request and by prior agreement between both parties.",
        tpiExamplesLabel: "Examples of international inspection companies",
        tpiExamples: ["SGS", "Bureau Veritas", "Intertek"],
        tpiDisclaimer: "Listed only as examples of third-party inspection providers — not partners of, or certifications held by, AL NASR FURNITURE.",
        tpiScope: "Depending on the agreed scope, inspection may cover quantities, dimensions, specifications, finish quality, packaging and container loading.",
        tpiArrange: "The inspection company, scope, cost and timing are agreed in advance, and an inspection report can be issued according to the agreed service.",
        guidesTitle: "Buyer guides",
        guides: [
          { title: "Shipping & payment guide", body: "Payment terms, delivery terms, Egyptian export ports, containers, CBM and transit time.", to: "shipping-payment" },
          { title: "Custom manufacturing & projects", body: "Made-to-order designs and furniture for hotel, residential and commercial projects.", to: "custom-manufacturing" }
        ],
        faqTitle: "Questions from wholesale buyers",
        faq: [
          { q: "Can specifications be customized?", a: "Customization requests can be included in your inquiry. Whether a change is possible depends on the collection and manufacturing capabilities, and is confirmed during the quotation discussion." },
          { q: "Which delivery and payment terms are available?", a: "We work with EXW, FOB, CFR and CIF delivery terms and three payment options. The applicable terms are agreed for each order before confirmation; not every option is available for every order." },
          { q: "What details help us prepare a quotation?", a: "Collection references, quantities per collection, destination country and port, any specification or finish changes, your preferred delivery term and your preferred contact method." },
          { q: "Are prices, lead times or transit times published?", a: "No. They depend on volume, specifications, destination and sailing schedules, and are given as estimates in each quotation." }
        ],
        ctaTitle: "Ready to discuss an export order?"
      },
      ship: {
        eyebrow: "Buyer guide", title: "Shipping & payment guide",
        lead: "How payment, delivery terms, ports, containers and shipment volume are handled for furniture export orders from Egypt. All terms are agreed per order before confirmation.",
        tocLabel: "On this page",
        toc: ["Payment terms", "Delivery terms", "Export ports", "Containers", "CBM", "Transit time"],
        payTitle: "Payment terms",
        payIntro: "We offer three payment options. The appropriate method is chosen according to the nature of the transaction and the contract terms.",
        payments: [
          { title: "30% advance payment + 70% against shipping documents", term: "", body: "30% of the order value is paid in advance on order confirmation. The remaining 70% is paid against the shipping documents, according to the document-release terms agreed in the contract." },
          { title: "Irrevocable letter of credit at sight", term: "L/C at Sight", body: "Transactions can be made through an irrevocable documentary credit, with payment on presentation of shipping documents that comply with the credit terms, under the banking procedures agreed between both parties." },
          { title: "Direct bank transfer", term: "T/T", body: "The order value can be paid by direct bank transfer according to the payment terms agreed between both parties and set out in the quotation and commercial contract." }
        ],
        payNote: "The payment method, its conditions and the required documents are agreed before the order is confirmed and execution begins. Not every option is automatically available for every order.",
        incoTitle: "Delivery terms (Incoterms® 2020)",
        incoIntro: "We offer different delivery terms depending on the shipment destination, the nature of the order and the buyer's requirements. Terms are interpreted under Incoterms® 2020 and apply to the named place or port stated in the contract.",
        incoLabels: { seller: "Seller", buyer: "Buyer", cost: "Main transport cost", risk: "Risk transfers", insurance: "Insurance" },
        incoterms: [
          { code: "EXW", name: "Ex Works", mode: "Any transport mode", seller: "Prepares the goods and makes them available for collection at the agreed named place. Not required to load or export-clear the goods.", buyer: "Loading, export clearance, all transport, import clearance and subsequent procedures, as per the contract.", cost: "Buyer, from the named place.", risk: "When the goods are placed at the buyer's disposal at the named place.", insurance: "No obligation on either party; the buyer insures if desired." },
          { code: "FOB", name: "Free On Board", mode: "Sea & inland waterway only", seller: "Prepares the goods, handles export clearance and delivers them on board the vessel at the named port of shipment.", buyer: "Nominates the vessel, arranges and pays sea freight, and handles import clearance and duties.", cost: "Buyer pays the main sea freight.", risk: "When the goods are on board the vessel at the port of shipment.", insurance: "No obligation on either party; the buyer arranges cover if desired." },
          { code: "CFR", name: "Cost and Freight", mode: "Sea & inland waterway only", seller: "Handles export clearance; arranges and pays sea freight to the agreed port of destination.", buyer: "Import clearance and duties, and destination charges not included in the freight contract.", cost: "Seller pays sea freight to the destination port.", risk: "When the goods are on board the vessel at the port of shipment — before the main voyage.", insurance: "Not included; the seller has no obligation to insure. Buyer cover is recommended." },
          { code: "CIF", name: "Cost, Insurance and Freight", mode: "Sea & inland waterway only", seller: "As CFR, plus obtaining cargo insurance for the voyage to the destination port.", buyer: "Import clearance and duties, and destination charges not included in the freight contract.", cost: "Seller pays sea freight and insurance.", risk: "When the goods are on board the vessel at the port of shipment.", insurance: "Seller provides minimum cover (Institute Cargo Clauses C) unless broader cover is agreed separately." }
        ],
        incoNotes: [
          "FOB, CFR and CIF are rules for sea and inland waterway transport.",
          "For containerised cargo handed over at a terminal before loading on board, FCA or another rule may be more appropriate depending on the actual delivery arrangements; this is discussed case by case.",
          "Under CFR and CIF the seller pays freight to destination, but risk passes to the buyer at the port of shipment."
        ],
        portsTitle: "Egyptian export ports",
        portsIntro: "Shipments can be arranged from suitable Egyptian ports, depending on the destination, shipping line availability and cost.",
        ports: [{ name: "Alexandria Port", alt: "ميناء الإسكندرية" }, { name: "El Dekheila Port", alt: "ميناء الدخيلة" }, { name: "Damietta Port", alt: "ميناء دمياط" }, { name: "Port Said", alt: "ميناء بورسعيد" }],
        portsNote: "The final port of shipment depends on the nature of the order, where the goods are prepared, the available shipping line and the transport cost. These are possible departure ports — not a guarantee that every route is available at all times.",
        contTitle: "Container types & loading capacity",
        contIntro: "The container type is chosen according to shipment volume, furniture dimensions, packaging and how products are arranged inside, to make the best use of loading space.",
        containers: [
          { name: "20 FT Standard", alt: "", range: "28–33", body: "Suited to small and medium shipments, depending on furniture volume and packing method." },
          { name: "40 FT Standard", alt: "", range: "56–60", body: "Suited to larger shipments, taking product dimensions and loading requirements into account." },
          { name: "40 FT High Cube", alt: "", range: "68–76", body: "Greater internal height than the standard 40 FT, giving extra flexibility when loading furniture and packing materials." }
        ],
        contUnit: "CBM · approx. loading volume",
        contNoteTitle: "Actual loading capacity",
        contNote: [
          "These figures are indicative planning estimates, not guaranteed capacity. Usable furniture volume is lower than a container's geometric internal volume, and varies with item dimensions, packaging, knock-down (KD) versus assembled products, weight limits, and the loading and stowage method.",
          "The most suitable container for each shipment is determined from the order details, product dimensions and packing method."
        ],
        cbmTitle: "Calculating shipment volume (CBM)",
        cbmIntro: "Total shipment volume in cubic metres is used to determine the number of containers needed and to estimate shipping costs.",
        cbmFormula: "CBM = Length (m) × Width (m) × Height (m)",
        cbmExampleLabel: "Illustrative example",
        cbmExample: "One carton of 2.00 × 0.60 × 0.50 m = 0.60 CBM. 20 such cartons = 12.0 CBM.",
        cbmFactorsTitle: "The calculation depends on",
        cbmFactors: ["Number of furniture pieces", "Dimensions of each piece after packing", "Packaging method and preparation", "Whether the furniture can be knocked down and reassembled", "How products are arranged in the container", "Space needed to protect products in transit"],
        cbmNote: "Total CBM must use actual packed dimensions multiplied by quantities. A total below a container's rated range does not by itself guarantee that the goods will physically fit.",
        transitTitle: "Transit time",
        transitBody: "Sea transit time varies with the destination country and port, the shipping line, the number of transshipment stops, sailing schedules and port operating conditions.",
        transitFactors: ["Destination country and port", "Shipping line and sailing schedule", "Transshipment stops", "Port operations", "Sea transport conditions"],
        transitNote: "An estimated transit time is provided for each order with the quotation. Actual times may vary with sailing schedules and transport conditions. We do not publish fixed transit times.",
        ctaTitle: "Plan your shipment with us", ctaBody: "Share products, quantities, destination and your preferred terms — we will prepare a quotation covering volume, packaging and shipping.", cta: "Request a Shipping & Furniture Quotation"
      },
      custom: {
        eyebrow: "Custom manufacturing & projects", title: "Custom furniture & project supply",
        lead: "Alongside our wholesale collections, we review made-to-order designs and furnishing requests for qualified projects — subject to production feasibility.",
        customTitle: "Custom furniture",
        customBody: "We can review designs supplied by the customer and produce furniture to the required dimensions and specifications, depending on production feasibility. Not every design can be manufactured; feasibility is confirmed after review.",
        sendTitle: "What you can send",
        send: ["Design images", "Drawings and dimensions", "Preferred wood type or materials", "Colours and finishes", "Quantities", "Special technical requirements"],
        sendNote: "After reviewing the details, we prepare a suitable quotation. Our sales team will advise how to share drawings and image files after your first inquiry.",
        projTitle: "Projects & hotels",
        projBody: "We can review furniture requests for residential, commercial and hotel projects according to the required specifications and quantities.",
        projTypesTitle: "Project types",
        projTypes: ["Hotels", "Residential developments", "Furnished apartments", "Commercial projects", "Large-scale furniture orders"],
        projCatsTitle: "Products that can be evaluated",
        projCats: ["Bedrooms", "Living rooms", "Dining rooms", "Hotel furniture", "Residential furniture", "Real-estate project furniture", "Custom designs", "Large orders to specification"],
        assessTitle: "How each project is assessed",
        assessBody: "Quantities, production duration, customization, contract and shipping terms are determined separately for every project.",
        focusNote: "Our core business remains wholesale supply to furniture importers, wholesalers, distributors and showrooms; project requests are evaluated individually.",
        ctaTitle: "Have a project or custom design in mind?", ctaBody: "Tell us about the project, quantities and specifications. We will review feasibility and come back to you with next steps.",
        cta: "Discuss Your Project", cta2: "Send a custom design request"
      },
      privacy: { title: "Privacy notice", body: "The privacy notice for this website is pending legal review and will be published here before personal information is collected in production.", status: "Status: PENDING legal review" },
      notFound: { title: "Page not found", body: "The page you are looking for does not exist or has moved.", home: "Back to home", browse: "Browse collections" },
      meta: { home: "Egyptian Furniture Manufacturing & Export Solutions", collections: "Collections", about: "About Us", sourcing: "Sourcing & Export", shipping: "Shipping & Payment Guide", custom: "Custom Manufacturing & Projects", contact: "Contact & Request a Quote", inquiry: "Inquiry List", privacy: "Privacy", notFound: "Page not found" }
    },

    ar: {
      dir: "rtl", arrow: "←", back: "→", switchTo: "English", switchCode: "EN",
      skip: "انتقل إلى المحتوى",
      nav: { home: "الرئيسية", collections: "المجموعات", about: "من نحن", sourcing: "التوريد والتصدير", shipping: "دليل الشحن والدفع", custom: "التصنيع حسب الطلب والمشروعات", contact: "تواصل معنا", rfq: "اطلب عرض سعر", inquiry: "قائمة الاستفسار", inquiryShort: "الاستفسار", menu: "القائمة", close: "إغلاق القائمة", lang: "اللغة", primary: "التنقل الرئيسي" },
      sample: "نموذج", illustrative: "تصميم توضيحي", illustrativeAlt: "تصميم توضيحي من الكتالوج (صورة مُنشأة بالذكاء الاصطناعي)",
      wa: { general: "مرحبًا النصر للأثاث، لدي استفسار بخصوص توريد الأثاث بالجملة.", product: "مرحبًا النصر للأثاث، أود الاستفسار عن {name} (المرجع {code}). {url}" },
      ph: { hero: "صورة رئيسية — صورة أثاث معتمدة", category: "صورة الفئة — 4:3", collection: "صورة المجموعة — 3:4", gallery: "صورة المعرض", about: "صورة معتمدة للشركة / المنتجات", overview: "صورة الطقم كاملًا" },
      hero: {
        eyebrow: "حلول تصنيع وتصدير الأثاث المصري",
        title: "أثاث مصري يُصنَّع ويُصدَّر لمشتري الجملة.",
        body: "تورّد النصر للأثاث الأثاث المصري للمستوردين وتجار الجملة والموزعين ومعارض التجزئة، وتنسّق التصميم والتصنيع وفحص الجودة والتغليف والتصدير من خلال شبكة جهات التصنيع التي نتعاون معها في مصر.",
        cta1: "استعرض المجموعات", cta2: "اطلب عرض سعر", note: "نتعامل مع الشركات فقط، مع تركيز مبدئي على أسواق دول الخليج. يُسعَّر كل طلب على حدة."
      },
      featured: { eyebrow: "منتجاتنا", title: "فئات الأثاث", viewAll: "عرض كل المجموعات", cta: "عرض المجموعات" },
      intro: {
        eyebrow: "عن النصر", title: "شريك تجاري واحد من التصميم حتى الشحن.",
        body: "نجمع بين تنوع التصميمات والاهتمام بالتفاصيل وتنسيق التصنيع لتلبية احتياجات المستوردين وتجار الأثاث. يتعامل العميل مع النصر للأثاث كجهة تواصل واحدة، بينما ننسّق التصنيع وفحص الجودة والتغليف والتصدير مع شركائنا في مصر.",
        link: "تعرّف على النصر"
      },
      why: {
        eyebrow: "ما نقدمه", title: "التصنيع والتصدير والجودة في مكان واحد",
        items: [
          { title: "التصنيع والتوريد", body: "غرف نوم وغرف أطفال وركن وانتريهات ونيش وسفرة بتصميمات مودرن وكلاسيك، مع تنسيق التصميمات والمقاسات والتشطيبات حسب الطلب وفقًا لإمكانية التصنيع.", link: "التصنيع حسب الطلب", to: "custom-manufacturing" },
          { title: "حلول التصدير للشركات", body: "تنسيق التغليف للتصدير ومستندات الشحن وترتيبات الشحن الدولي وفقًا لوجهة الشحنة وشروط التعاقد.", link: "دليل الشحن والدفع", to: "shipping-payment" },
          { title: "الجودة والفحص", body: "تُراجَع المنتجات وفقًا للمواصفات المتفق عليها قبل التغليف، ويمكن ترتيب فحص مستقل قبل الشحن بناءً على طلب العميل.", link: "مراحل فحص الجودة", to: "sourcing-export" }
        ]
      },
      process: {
        eyebrow: "طريقة عملنا", title: "من الاستفسار حتى الشحن",
        steps: [
          { title: "الاستفسار وعرض السعر", body: "أرسل المنتجات والكميات والمواصفات، ونُعدّ عرض سعر يشمل المنتجات وشروط التسليم والدفع والشحن." },
          { title: "المواصفات وتأكيد الطلب", body: "يتم الاتفاق على التصميم والخامات والألوان والمقاسات والتشطيبات والتغليف قبل تأكيد الطلب." },
          { title: "التصنيع وفحص الجودة", body: "تُصنَّع المنتجات بالتنسيق مع جهة التصنيع وتُراجَع وفقًا للمواصفات المتفق عليها." },
          { title: "التغليف والشحن", body: "يتم التغليف للتصدير وتحميل الحاوية وتجهيز مستندات الشحن، ثم الشحن وفق شرط التسليم المتفق عليه." }
        ],
        note: "طلب عرض السعر لا يُعدّ تأكيدًا لطلب أو لسعر. يتم الاتفاق على كل طلب بشكل منفصل.",
        link: "اطّلع على خطوات التصدير العشر كاملة"
      },
      projects: {
        eyebrow: "التصميمات الخاصة والمشروعات", title: "تصميمات خاصة وتجهيز المشروعات",
        body: "أرسل تصميماتك ورسوماتك ومواصفاتك، أو حدّثنا عن مشروعك الفندقي أو السكني أو التجاري. تتم دراسة كل طلب وفقًا لإمكانية التصنيع وتسعيره بشكل منفصل.",
        link: "التصنيع حسب الطلب والمشروعات"
      },
      cta: { title: "هل تبحث عن مورد للأثاث والموبيليا من مصر؟", body: "أرسل لنا تفاصيل المنتجات المطلوبة، وسنعمل على دراسة طلبك وإعداد عرض سعر — أو تحدّث مباشرة مع فريق المبيعات على واتساب.", rfq: "اطلب عرض سعر", wa: "مبيعات واتساب" },
      footer: {
        tagline: "حلول تصنيع وتصدير الأثاث المصري لمشتري الأعمال الدوليين.",
        explore: "استكشف", guides: "أدلة المشتري", company: "الشركة", contact: "التواصل", email: "البريد الإلكتروني", whatsapp: "واتساب",
        pending: "بانتظار التأكيد", privacy: "إشعار الخصوصية",
        legal: "النصر للأثاث (AL NASR FURNITURE) علامة تجارية تابعة لمؤسسة النصر للاستيراد والتصدير. ستُنشر بيانات التسجيل بعد تأكيدها.",
        wordmark: "شعار نصي مؤقت — الشعار النهائي قيد الاعتماد.", rights: "النصر للأثاث"
      },
      crumbs: { home: "الرئيسية", label: "مسار التنقل" },
      collections: {
        title: "المجموعات", intro: "تصفّح الأثاث المصري حسب الفئة. اختر المجموعات والكميات لإعداد طلب عرض سعر واحد بالجملة.",
        search: "ابحث في كل المجموعات", searchPh: "ابحث بالاسم أو الرمز المرجعي", clear: "مسح البحث",
        results: "{n} نتيجة لـ «{q}»", noResults: "لا توجد مجموعات تطابق «{q}».", noResultsHint: "جرّب اسمًا أو رمزًا مرجعيًا آخر، أو تصفّح حسب الفئة.",
        count: "{n} مجموعات", count1: "مجموعة واحدة", allCats: "كل الفئات"
      },
      category: {
        filter: "الطراز", all: "الكل", count: "{n} مجموعات", count1: "مجموعة واحدة", search: "ابحث في هذه الفئة",
        empty: "لا توجد مجموعات تطابق البحث أو عوامل التصفية.", reset: "إعادة ضبط التصفية", others: "فئات أخرى"
      },
      card: { view: "عرض التفاصيل", ref: "مرجع داخلي" },
      detail: {
        sampleNotice: "تصميم توضيحي — صورة الكتالوج مُنشأة بالذكاء الاصطناعي. النصوص داخل الصورة (مكونات الطقم والخامات والمقاسات) غير موثقة، ويتم تأكيد المواصفات النهائية أثناء إعداد عرض السعر.", piecesPending: "مكونات الطقم قيد التأكيد",
        category: "الفئة", pieces: "القطع المتضمنة", piece: "القطعة", qty: "العدد", dims: "المقاسات (عرض × عمق × ارتفاع)",
        onRequest: "متاح عند الطلب", cm: "سم", materials: "الخامات والتشطيبات", description: "الوصف",
        quantity: "الكمية المطلوبة", units: { set: "أطقم", piece: "قطع" }, dec: "تقليل الكمية", inc: "زيادة الكمية",
        add: "أضف إلى الاستفسار", update: "تحديث الاستفسار", inList: "في قائمة الاستفسار: {q} ({u})", viewList: "عرض قائمة الاستفسار",
        wa: "اسأل عبر واتساب", rfq: "اطلب عرض سعر", related: "مجموعات ذات صلة",
        gallery: "معرض الصور", enlarge: "عرض الصورة بحجم أكبر", prev: "الصورة السابقة", next: "الصورة التالية", close: "إغلاق عارض الصور",
        imageOf: "صورة {i} من {n}", thumb: "عرض الصورة {i}", noPrice: "تُحدَّد الأسعار لكل طلب حسب الكمية والمواصفات ووجهة الشحن."
      },
      inquiry: {
        title: "قائمة الاستفسار", intro: "المجموعات التي اخترتها لطلب عرض سعر واحد. عدّل الكميات وأضف ملاحظاتك، ثم انتقل إلى نموذج الطلب.",
        emptyTitle: "قائمة الاستفسار فارغة", emptyBody: "أضف مجموعات من الكتالوج لطلب عرض سعر موحّد — أو أرسل استفسارًا عامًا دون اختيار منتجات.",
        browse: "تصفّح المجموعات", general: "أرسل استفسارًا عامًا", qty: "الكمية", note: "ملاحظات لهذه المجموعة (اختياري)",
        notePh: "مثال: تغيير التشطيب أو اللون أو المقاس", remove: "إزالة", summary: "الملخص", selected: "{n} مجموعات مختارة", selected1: "مجموعة واحدة مختارة",
        continueRfq: "المتابعة إلى طلب عرض السعر", continueBrowsing: "متابعة التصفح",
        notCart: "هذه قائمة مختصرة لطلب عرض سعر وليست طلب شراء. لا توجد أسعار أو مدفوعات.", saved: "محفوظة في هذا المتصفح.", guide: "كيف يتم الشحن والدفع"
      },
      toast: { added: "تمت الإضافة إلى قائمة الاستفسار", updated: "تم تحديث الكمية", removed: "تمت الإزالة من قائمة الاستفسار", undo: "تراجع", waPending: "رقم واتساب قيد الإعداد.", cleared: "تم مسح قائمة الاستفسار" },
      contact: {
        eyebrow: "تواصل معنا", title: "تواصل مع فريق مبيعات التصدير", intro: "اختر الطريقة المناسبة لك: محادثة مباشرة على واتساب، أو طلب عرض سعر من خلال النموذج أدناه.",
        waTitle: "تحدّث عبر واتساب", waBody: "يفتح محادثة مباشرة مع المبيعات دون الحاجة إلى نموذج.", waBtn: "تحدّث مع المبيعات عبر واتساب", waPending: "رقم واتساب قيد الإعداد",
        emailTitle: "البريد الإلكتروني", emailPending: "البريد الإلكتروني قيد الإعداد",
        rfqTitle: "اطلب عرض سعر", rfqBody: "أرسل لنا تفاصيل المنتجات المطلوبة، وسنعمل على دراسة طلبك وإعداد عرض سعر لتصدير الأثاث والموبيليا من مصر.",
        includesTitle: "يشمل عرض السعر، بحسب طبيعة الصفقة",
        includes: ["المنتجات والكميات", "المواصفات والمقاسات", "حجم الشحنة", "خيارات التغليف", "شروط التسليم والشحن", "طريقة الدفع", "مدة التنفيذ والشحن التقديرية"]
      },
      form: {
        name: "الاسم الكامل", company: "اسم الشركة", buyerType: "نوع المشتري", country: "دولة الوجهة", email: "البريد الإلكتروني للعمل",
        phone: "الهاتف / واتساب", phoneHint: "أدخل رمز الدولة، مثال: ‎+971 50 123 4567", pref: "وسيلة التواصل المفضلة",
        prefs: { email: "البريد الإلكتروني", whatsapp: "واتساب", phone: "مكالمة هاتفية" }, contactHint: "أدخل وسيلة واحدة على الأقل: البريد الإلكتروني أو الهاتف / واتساب.",
        inquiryType: "نوع الاستفسار",
        inquiryTypes: [{ v: "wholesale", l: "مجموعات بالجملة" }, { v: "custom", l: "تصميم خاص" }, { v: "project", l: "تجهيز مشروع / فندق" }, { v: "shipping", l: "الشحن والخدمات اللوجستية" }, { v: "general", l: "استفسار عام" }],
        tradeTitle: "التفضيلات التجارية", tradeHint: "تتم مناقشة التفضيلات وتأكيدها في عرض السعر، ولا تُعدّ التزامًا على أي طرف.",
        shipTerm: "شرط التسليم المفضل", payTerm: "طريقة الدفع المفضلة", destPort: "ميناء / مدينة الوصول", destPortPh: "مثال: جبل علي، دبي",
        noPref: "بدون تفضيل / للنقاش",
        shipTerms: [{ v: "EXW", l: "EXW — التسليم من المصنع" }, { v: "FOB", l: "FOB — التسليم على ظهر السفينة" }, { v: "CFR", l: "CFR — التكلفة والشحن" }, { v: "CIF", l: "CIF — التكلفة والتأمين والشحن" }],
        payTerms: [{ v: "advance-30-70", l: "30% مقدمًا + 70% مقابل مستندات الشحن" }, { v: "lc-at-sight", l: "اعتماد مستندي غير قابل للإلغاء عند الاطلاع" }, { v: "tt", l: "تحويل بنكي مباشر (T/T)" }],
        termsGuide: "دليل الشحن والدفع",
        message: "متطلبات إضافية", messagePhItems: "المواصفات، طلبات التعديل، وجهة التسليم، التوقيت…", messagePhGeneral: "صف أنواع الأثاث والكميات والمواصفات التي تبحث عنها…",
        messagePhCustom: "صف التصميم والمقاسات والخامات والتشطيبات والكميات. سيوضح لك فريقنا طريقة إرسال الرسومات والصور.",
        messagePhProject: "صف نوع المشروع وعدد الوحدات والمنتجات المطلوبة والمواصفات والتوقيت…",
        messagePhShipping: "صف المنتجات والكميات وبلد الوصول وأي متطلبات للشحن أو التغليف…",
        required: "مطلوب", optional: "اختياري", select: "اختر…", selectCountry: "اختر الدولة", gcc: "دول الخليج", other: "دول أخرى",
        buyerTypes: [{ v: "showroom", l: "صالة عرض أثاث" }, { v: "importer", l: "مستورد" }, { v: "wholesaler", l: "تاجر جملة" }, { v: "distributor", l: "موزّع" }, { v: "retail-chain", l: "سلسلة متاجر" }, { v: "project", l: "مطوّر مشروعات / مقاول" }, { v: "other", l: "أخرى" }],
        consent: "أوافق على أن تستخدم النصر للأثاث هذه البيانات للرد على استفساري.", privacy: "إشعار الخصوصية", privacyPending: "(النص قيد المراجعة القانونية)",
        submit: "إرسال طلب عرض السعر", submitting: "جارٍ إرسال الطلب…", selectedTitle: "المجموعات المختارة", noneSelected: "لم تُختر أي مجموعات. سيُرسل طلبك كاستفسار توريد عام.",
        editList: "تعديل قائمة الاستفسار", browse: "تصفّح المجموعات", notOrder: "إرسال هذا الطلب لا يُعدّ طلب شراء.",
        err: {
          name: "أدخل اسمك الكامل.", country: "اختر دولة الوجهة.", contact: "أدخل بريدًا إلكترونيًا أو رقم هاتف / واتساب.",
          email: "أدخل بريدًا إلكترونيًا صحيحًا، مثال: name@company.com.", phone: "أدخل رقمًا دوليًا صحيحًا مع رمز الدولة، مثال: ‎+971 50 123 4567.",
          message: "صف متطلباتك، أو أضف مجموعات إلى قائمة الاستفسار.", consent: "يرجى تأكيد الموافقة حتى نتمكن من الرد على استفسارك."
        },
        summaryTitle: "يرجى تصحيح ما يلي قبل الإرسال:",
        notConfiguredTitle: "لم يُرسل الطلب",
        notConfigured: "لم يتم بعد ربط طلبات عروض الأسعار الإلكترونية بصندوق مبيعات النصر للأثاث، لذلك لم يُرسل هذا الطلب. بياناتك واختياراتك محفوظة في هذا المتصفح. يرجى التواصل مع المبيعات عبر واتساب في الوقت الحالي.",
        networkTitle: "مشكلة في الاتصال", network: "تعذّر الوصول إلى الخادم. بياناتك محفوظة — تحقق من الاتصال وحاول مرة أخرى.",
        serverTitle: "لم يُقبل الطلب", server: "لم يقبل الخادم الطلب. بياناتك محفوظة — يرجى المحاولة مرة أخرى.",
        retry: "حاول مرة أخرى",
        successTitle: "تم استلام الطلب", successBody: "شكرًا لك. سيراجع فريق المبيعات متطلباتك ويتواصل معك عبر وسيلة التواصل المفضلة لديك.",
        reference: "الرقم المرجعي", clearQ: "هل تريد مسح قائمة الاستفسار بعد استلام الطلب؟", clear: "مسح قائمة الاستفسار", keep: "الإبقاء على القائمة", newReq: "إرسال طلب آخر"
      },
      about: {
        eyebrow: "من نحن", title: "عن النصر للأثاث",
        lead: "حلول تصنيع وتصدير الأثاث المصري للمستوردين وتجار الأثاث وشركات تجهيز المشروعات.",
        whoTitle: "من نحن",
        whoBody: [
          "النصر للأثاث (AL NASR FURNITURE) علامة تجارية تابعة لمؤسسة النصر للاستيراد والتصدير، وهي مؤسسة مصرية تعمل في توريد وتصدير الأثاث والموبيليا المصرية إلى الأسواق العالمية. نجمع بين تنسيق التصنيع، وتنوع التصميمات، والاهتمام بالتفاصيل، لتقديم منتجات تلبي احتياجات المستوردين وتجار الأثاث والعملاء في مختلف الأسواق.",
          "من خلال شبكة المعارض وجهات التصنيع التي نتعاون معها في مصر، نقدم مجموعة متكاملة من الأثاث المنزلي، تشمل غرف النوم، وغرف الأطفال، والركن، والانتريهات، والنيش، والسفرة، بتصميمات متنوعة تجمع بين الطابع العصري والكلاسيكي، مع إمكانية تنفيذ التصميمات والمقاسات والتشطيبات وفقًا لمتطلبات العملاء.",
          "نحرص على متابعة مراحل العمل بدايةً من تحديد التصميم والمواصفات، مرورًا بالتصنيع والتشطيب ومراجعة جودة المنتجات، وصولًا إلى التغليف وتجهيز الشحنات للتصدير، بما يضمن تنسيق جميع المراحل وفقًا لمتطلبات كل طلب والسوق المستهدف."
        ],
        productsTitle: "منتجاتنا",
        mqTitle: "التصنيع والجودة والتصدير",
        mq: [
          { title: "التصنيع والجودة", body: "نولي اهتمامًا بمراحل تصنيع الأثاث، بدءًا من اختيار الخامات وتحديد المواصفات، مرورًا بأعمال التصنيع والتشطيب، وصولًا إلى مراجعة المنتجات وتجهيزها للتغليف والشحن." },
          { title: "التصنيع حسب الطلب", body: "نتيح إمكانية تنسيق التصنيع حسب الطلب (Made-to-Order)، بما يشمل التصميمات والمقاسات والتشطيبات والكميات، وفقًا للإمكانات المتاحة والاتفاق مع العميل." },
          { title: "خدمات التصدير", body: "نقدم خدمات تصدير الأثاث المصري للمستوردين وتجار الجملة والتجزئة وشركات تجهيز المشروعات، مع تنسيق التعبئة والتغليف، وتجهيز مستندات التصدير، وترتيبات الشحن الدولي وفقًا لوجهة الشحنة وشروط التعاقد." }
        ],
        visionTitle: "رؤيتنا",
        visionBody: "أن نصبح شريكًا موثوقًا في تصنيع وتصدير الأثاث المصري، وأن نوسع حضور منتجاتنا في الأسواق العالمية من خلال الجودة، وتنوع التصميمات، وبناء علاقات تجارية طويلة الأجل.",
        partnersTitle: "شبكة التصنيع والتصدير",
        partnersBody: "تتم أعمال التصنيع والتشطيب والعرض من خلال شبكة المعارض وجهات التصنيع التي نتعاون معها في مصر، بينما تتولى النصر للأثاث إدارة العلاقة التجارية مع المشترين. ستُعرض أسماء الشركاء وصور منشآتهم فقط بعد الحصول على إذن باستخدامها.",
        ctaTitle: "لنعمل معًا", ctaBody: "سواء كنت مستوردًا للأثاث، أو تاجر جملة، أو تاجر تجزئة، أو مطوّرًا للمشروعات، فنحن مستعدون لمناقشة متطلباتك وتقديم حلول أثاث تناسب سوقك.",
        cta1: "استعرض المجموعات", cta2: "تحدّث مع المبيعات"
      },
      sourcing: {
        eyebrow: "التوريد والتصدير", title: "كيف تُنفَّذ طلبات التصدير",
        lead: "من الاستفسار الأول حتى الشحن — كيف يتم تحديد مواصفات طلب الأثاث بالجملة وتصنيعه وفحصه وتغليفه وشحنه مع شركائنا في مصر.",
        coordTitle: "تنسيق التصدير",
        coordBody: [
          "صُممت خدمة التصدير لدينا للمستوردين وتجار الجملة والتجزئة وشركات تجهيز المشروعات الذين يريدون جهة تواصل واحدة مسؤولة في مصر.",
          "ننسّق مع شركائنا التعبئة والتغليف ومستندات التصدير وترتيبات الشحن الدولي وفقًا لوجهة الشحنة وشروط التعاقد، حتى لا يضطر المشتري إلى التعامل مع كل مورد على حدة."
        ],
        processTitle: "خطوات تنفيذ طلب التصدير",
        steps: [
          { term: "Inquiry", title: "استلام طلب العميل", body: "يرسل العميل المنتجات المطلوبة والكميات والمقاسات والتصميمات والمواصفات." },
          { term: "Quotation", title: "إعداد عرض السعر", body: "تتم مراجعة الطلب وإعداد عرض سعر يشمل المنتجات والكميات والمواصفات وشروط التسليم والدفع والشحن." },
          { term: "Specification Confirmation", title: "تأكيد المواصفات", body: "يتم الاتفاق على التصميم والخامات والألوان والمقاسات والتشطيبات النهائية ومتطلبات التغليف." },
          { term: "Order Confirmation", title: "تأكيد الطلب", body: "بعد الاتفاق على التفاصيل التجارية والفنية وشروط التعاقد، يتم تأكيد الطلب والبدء في إجراءات التنفيذ." },
          { term: "Production", title: "التصنيع والتجهيز", body: "يتم تصنيع وتجهيز المنتجات وفقًا للمواصفات المتفق عليها وبالتنسيق مع جهة التصنيع." },
          { term: "Quality Control — QC", title: "فحص الجودة", body: "تتم مراجعة المنتجات وفقًا للمواصفات المتفق عليها، بما يشمل الأبعاد والخامات والتشطيبات وحالة المنتجات قبل التغليف." },
          { term: "Export Packaging", title: "التغليف للتصدير", body: "يتم اختيار مواد وطريقة التغليف المناسبة لطبيعة الأثاث وطريقة النقل، بهدف تقليل مخاطر الخدوش والصدمات والتلف." },
          { term: "Container Loading", title: "تحميل الحاوية", body: "يتم ترتيب المنتجات داخل الحاوية بطريقة مناسبة لطبيعة الشحنة والاستفادة من المساحة المتاحة مع مراعاة حماية المنتجات." },
          { term: "Shipping Documents", title: "تجهيز مستندات الشحن", body: "يتم تجهيز المستندات المطلوبة وفقًا لطبيعة الشحنة والدولة المستوردة وشروط الدفع والتسليم المتفق عليها." },
          { term: "Shipment", title: "الشحن إلى الوجهة", body: "يتم ترتيب شحن البضاعة إلى ميناء الوصول أو مكان التسليم المتفق عليه، وفقًا لشرط التسليم المحدد في العقد." }
        ],
        qcTitle: "الجودة والفحص",
        qcBody: "نولي اهتمامًا بمراجعة المنتجات قبل الشحن للتحقق من مطابقتها للمواصفات المتفق عليها مع العميل. يمكن أن يشمل الفحص، حسب طبيعة الطلب:",
        qcChecks: ["مراجعة الخامات", "التحقق من المقاسات والأبعاد", "مراجعة التصميم والألوان", "فحص جودة التشطيب", "مراجعة حالة المنتجات قبل التغليف", "مراجعة التغليف", "فحص تحميل الحاوية"],
        qcMedia: "يمكن توفير صور أو مقاطع فيديو لمراحل التجهيز والفحص بناءً على طلب العميل والاتفاق المسبق.",
        tpiTitle: "الفحص المستقل قبل الشحن",
        tpiBody: "يمكن ترتيب فحص مستقل للشحنة قبل الشحن، بناءً على طلب العميل والاتفاق المسبق بين الطرفين.",
        tpiExamplesLabel: "من أمثلة شركات الفحص والتفتيش الدولية",
        tpiExamples: ["SGS", "Bureau Veritas", "Intertek"],
        tpiDisclaimer: "مذكورة كأمثلة لجهات فحص مستقلة فقط، وليست شركاء متعاقدين مع النصر للأثاث ولا شهادات حاصلة عليها.",
        tpiScope: "يمكن أن يشمل الفحص مطابقة الكميات والمقاسات والمواصفات وجودة التشطيب والتغليف وتحميل الحاوية، بحسب نطاق الفحص المتفق عليه.",
        tpiArrange: "يتم تحديد شركة الفحص ونطاق العمل وتكلفته وموعده مسبقًا، مع إمكانية إصدار تقرير فحص وفقًا للخدمة المتفق عليها.",
        guidesTitle: "أدلة المشتري",
        guides: [
          { title: "دليل الشحن والدفع", body: "طرق الدفع وشروط التسليم والموانئ المصرية والحاويات وحساب الحجم ومدة الشحن.", to: "shipping-payment" },
          { title: "التصنيع حسب الطلب والمشروعات", body: "تنفيذ التصميمات الخاصة وتوريد الأثاث للمشروعات الفندقية والسكنية والتجارية.", to: "custom-manufacturing" }
        ],
        faqTitle: "أسئلة مشتري الجملة",
        faq: [
          { q: "هل يمكن تعديل المواصفات؟", a: "يمكنك إدراج طلبات التعديل في استفسارك. إمكانية التعديل تعتمد على المجموعة وإمكانات التصنيع، ويتم تأكيدها أثناء مناقشة عرض السعر." },
          { q: "ما شروط التسليم والدفع المتاحة؟", a: "نتعامل بشروط التسليم EXW وFOB وCFR وCIF، وبثلاث طرق للدفع. يتم الاتفاق على الشروط المطبقة لكل طلب قبل تأكيده، ولا تتوفر كل الخيارات لكل الطلبات." },
          { q: "ما البيانات التي تساعد في إعداد عرض السعر؟", a: "الرموز المرجعية للمجموعات، والكمية لكل مجموعة، ودولة وميناء الوصول، وأي تعديلات في المواصفات أو التشطيب، وشرط التسليم المفضل، ووسيلة التواصل المفضلة." },
          { q: "هل تُنشر الأسعار أو مدد التنفيذ أو مدد الشحن؟", a: "لا. تعتمد على الكمية والمواصفات والوجهة وجداول الإبحار، وتُقدَّم بشكل تقديري في كل عرض سعر." }
        ],
        ctaTitle: "هل أنت مستعد لمناقشة طلب تصدير؟"
      },
      ship: {
        eyebrow: "دليل المشتري", title: "دليل الشحن والدفع",
        lead: "كيف تتم معالجة الدفع وشروط التسليم والموانئ والحاويات وحجم الشحنة في طلبات تصدير الأثاث من مصر. يتم الاتفاق على جميع الشروط لكل طلب قبل تأكيده.",
        tocLabel: "في هذه الصفحة",
        toc: ["طرق الدفع", "شروط التسليم", "موانئ الشحن", "الحاويات", "حساب الحجم (CBM)", "مدة الشحن"],
        payTitle: "طرق الدفع",
        payIntro: "نوفر لعملائنا ثلاثة خيارات للدفع، ويتم تحديد الطريقة المناسبة وفقًا لطبيعة الصفقة وشروط التعاقد.",
        payments: [
          { title: "دفعة مقدمة 30% والباقي 70% مقابل مستندات الشحن", term: "30% Advance Payment + 70% Against Shipping Documents", body: "يتم سداد 30% من قيمة الطلب مقدمًا عند تأكيد الطلب، وسداد الـ70% المتبقية مقابل مستندات الشحن وفقًا للشروط المتفق عليها في العقد، بما في ذلك إجراءات تسليم المستندات." },
          { title: "اعتماد مستندي غير قابل للإلغاء والدفع عند الاطلاع", term: "Irrevocable Letter of Credit at Sight (L/C at Sight)", body: "يمكن تنفيذ المعاملات من خلال اعتماد مستندي غير قابل للإلغاء، على أن يتم السداد عند تقديم مستندات الشحن المطابقة لشروط الاعتماد، وفقًا للإجراءات المصرفية المتفق عليها بين الطرفين." },
          { title: "تحويل بنكي مباشر", term: "Direct Bank Transfer (T/T)", body: "يمكن سداد قيمة الطلب عن طريق التحويل البنكي المباشر وفقًا لشروط الدفع المتفق عليها بين الطرفين، والمحددة في عرض السعر والعقد التجاري." }
        ],
        payNote: "يتم الاتفاق على طريقة الدفع وشروطها والمستندات المطلوبة قبل تأكيد الطلب وبدء التنفيذ، ولا تتوفر كل طرق الدفع تلقائيًا لكل الطلبات.",
        incoTitle: "شروط التسليم (Incoterms® 2020)",
        incoIntro: "نوفر خيارات مختلفة لشروط التسليم وفقًا لوجهة الشحنة وطبيعة الطلب ومتطلبات المشتري. تُفسَّر الشروط وفق قواعد Incoterms® 2020، وتُطبَّق على المكان أو الميناء المحدد في العقد.",
        incoLabels: { seller: "البائع", buyer: "المشتري", cost: "تكلفة النقل الرئيسي", risk: "انتقال المخاطر", insurance: "التأمين" },
        incoterms: [
          { code: "EXW", name: "التسليم من المصنع — Ex Works", mode: "أي وسيلة نقل", seller: "يجهّز البضاعة ويتيحها للاستلام في المكان المحدد المتفق عليه، ولا يلتزم بتحميلها أو بالتخليص التصديري.", buyer: "التحميل والتخليص التصديري وكل مراحل النقل والتخليص الجمركي في بلد الوصول والإجراءات اللاحقة وفقًا لشروط التعاقد.", cost: "على المشتري من المكان المحدد.", risk: "عند وضع البضاعة تحت تصرف المشتري في المكان المحدد.", insurance: "لا يوجد التزام على أي طرف، ويؤمّن المشتري إذا رغب." },
          { code: "FOB", name: "التسليم على ظهر السفينة — Free On Board", mode: "النقل البحري والنهري فقط", seller: "يجهّز البضاعة ويتولى التخليص التصديري ويسلّمها على متن السفينة في ميناء الشحن المحدد.", buyer: "يحدد السفينة ويرتّب الشحن البحري ويدفع تكلفته، ويتولى التخليص والرسوم في بلد الوصول.", cost: "يدفع المشتري الشحن البحري الرئيسي.", risk: "عند وضع البضاعة على متن السفينة في ميناء الشحن.", insurance: "لا يوجد التزام على أي طرف، ويرتّب المشتري التأمين إذا رغب فيه." },
          { code: "CFR", name: "التكلفة والشحن — Cost and Freight", mode: "النقل البحري والنهري فقط", seller: "يتولى التخليص التصديري ويرتّب ويدفع تكلفة الشحن البحري حتى ميناء الوصول المتفق عليه.", buyer: "التخليص والرسوم في بلد الوصول، وتكاليف ميناء الوصول غير المشمولة في عقد النقل.", cost: "يدفع البائع الشحن البحري حتى ميناء الوصول.", risk: "عند تحميل البضاعة على السفينة في ميناء الشحن — قبل الرحلة البحرية.", insurance: "غير مشمول، ولا يلتزم البائع بتوفير التأمين. يُنصح المشتري بالتأمين." },
          { code: "CIF", name: "التكلفة والتأمين والشحن — Cost, Insurance and Freight", mode: "النقل البحري والنهري فقط", seller: "مثل CFR، إضافة إلى توفير التأمين على البضاعة حتى ميناء الوصول.", buyer: "التخليص والرسوم في بلد الوصول، وتكاليف ميناء الوصول غير المشمولة في عقد النقل.", cost: "يدفع البائع الشحن البحري والتأمين.", risk: "عند تحميل البضاعة على السفينة في ميناء الشحن.", insurance: "يوفّر البائع الحد الأدنى من التغطية (Institute Cargo Clauses C) ما لم يُتفق على تغطية أوسع بشكل منفصل." }
        ],
        incoNotes: [
          "شروط FOB وCFR وCIF مخصصة للنقل البحري والنقل عبر الممرات المائية الداخلية.",
          "في الشحنات المعبأة في حاويات والتي تُسلَّم في محطة الحاويات قبل تحميلها على السفينة، قد يكون شرط FCA أو شرط آخر أكثر ملاءمة وفقًا لترتيبات التسليم الفعلية، ويُناقش ذلك حسب كل حالة.",
          "في شرطي CFR وCIF يدفع البائع الشحن حتى ميناء الوصول، لكن المخاطر تنتقل إلى المشتري في ميناء الشحن."
        ],
        portsTitle: "موانئ الشحن المصرية",
        portsIntro: "يمكن ترتيب الشحنات من الموانئ المصرية المناسبة وفقًا لوجهة الشحنة وتوفر خطوط الملاحة والتكلفة.",
        ports: [{ name: "ميناء الإسكندرية", alt: "Alexandria Port" }, { name: "ميناء الدخيلة", alt: "El Dekheila Port" }, { name: "ميناء دمياط", alt: "Damietta Port" }, { name: "ميناء بورسعيد", alt: "Port Said" }],
        portsNote: "يتم تحديد ميناء الشحن النهائي وفقًا لطبيعة الطلب، وموقع تجهيز البضاعة، وخط الملاحة المتاح، وتكلفة النقل. هذه موانئ شحن محتملة، ولا تعني توفر كل الخطوط في كل الأوقات.",
        contTitle: "أنواع الحاويات وسعات التحميل",
        contIntro: "يتم اختيار نوع الحاوية البحرية المناسبة وفقًا لحجم الشحنة، وأبعاد قطع الأثاث، وطبيعة التغليف، وطريقة ترتيب المنتجات داخل الحاوية، بهدف الاستفادة المثلى من مساحة التحميل.",
        containers: [
          { name: "كونتينر 20 قدم", alt: "20 FT Standard", range: "28–33", body: "مناسب للشحنات الصغيرة والمتوسطة، وفقًا لحجم الأثاث وطريقة التعبئة." },
          { name: "كونتينر 40 قدم", alt: "40 FT Standard", range: "56–60", body: "مناسب للشحنات الأكبر حجمًا، مع مراعاة أبعاد المنتجات ومتطلبات التحميل." },
          { name: "كونتينر 40 قدم هاي كيوب", alt: "40 FT HC — High Cube", range: "68–76", body: "يتميز بارتفاع داخلي أكبر من الكونتينر القياسي، مما يوفر مرونة إضافية عند تحميل الأثاث ومواد التغليف." }
        ],
        contUnit: "متر مكعب (CBM) · سعة تحميل تقديرية",
        contNoteTitle: "السعة الفعلية للتحميل",
        contNote: [
          "السعات المذكورة تقديرية لأغراض التخطيط وليست سعة مضمونة. الحجم القابل للاستخدام فعليًا للأثاث أقل من الحجم الهندسي الداخلي للحاوية، ويختلف حسب أبعاد القطع، ونوع التغليف، وما إذا كانت المنتجات مفككة (KD) أو مجمعة، وحدود الوزن، وطريقة الرص والتحميل.",
          "يتم تحديد الكونتينر الأنسب لكل شحنة بناءً على تفاصيل الطلب ومقاسات المنتجات وطريقة التعبئة."
        ],
        cbmTitle: "حساب حجم الشحنة (CBM)",
        cbmIntro: "يتم حساب الحجم الإجمالي للشحنة بالمتر المكعب لتحديد عدد الحاويات المناسبة وتقدير تكاليف الشحن.",
        cbmFormula: "CBM = الطول (م) × العرض (م) × الارتفاع (م)",
        cbmExampleLabel: "مثال توضيحي",
        cbmExample: "كرتونة مقاسها 2.00 × 0.60 × 0.50 م = 0.60 متر مكعب، و20 كرتونة مماثلة = 12.0 متر مكعب.",
        cbmFactorsTitle: "يعتمد الحساب على",
        cbmFactors: ["عدد قطع الأثاث", "أبعاد كل قطعة بعد التغليف", "طريقة التغليف والتجهيز", "إمكانية فك الأثاث وتركيبه", "طريقة ترتيب المنتجات داخل الحاوية", "المساحة اللازمة لحماية المنتجات أثناء النقل"],
        cbmNote: "يُحسب الحجم الإجمالي من المقاسات الفعلية بعد التغليف مضروبة في الكميات. وكون الحجم الإجمالي أقل من سعة الحاوية التقديرية لا يضمن وحده أن البضاعة ستتسع فيها فعليًا.",
        transitTitle: "مدة الشحن",
        transitBody: "تختلف مدة الشحن البحري وفقًا للدولة وميناء الوصول وخط الملاحة، وعدد محطات الترانزيت، ومواعيد الإبحار، والظروف التشغيلية للموانئ.",
        transitFactors: ["دولة وميناء الوصول", "خط الملاحة ومواعيد الإبحار", "محطات الترانزيت", "الظروف التشغيلية للموانئ", "ظروف النقل البحري"],
        transitNote: "يتم تحديد مدة الشحن التقديرية لكل طلب عند تقديم عرض السعر، مع مراعاة أن المدة الفعلية قد تختلف وفقًا لجدول الإبحار وظروف النقل البحري. لا ننشر مددًا ثابتة للشحن.",
        ctaTitle: "خطّط لشحنتك معنا", ctaBody: "شاركنا المنتجات والكميات والوجهة والشروط المفضلة، وسنُعدّ عرض سعر يشمل الحجم والتغليف والشحن.", cta: "اطلب عرض سعر للأثاث والشحن"
      },
      custom: {
        eyebrow: "التصنيع حسب الطلب والمشروعات", title: "التصميمات الخاصة وأثاث المشروعات",
        lead: "إلى جانب مجموعات الجملة، ندرس طلبات التصنيع حسب الطلب وتجهيز المشروعات المؤهلة، وفقًا لإمكانية التصنيع.",
        customTitle: "التصميمات الخاصة",
        customBody: "يمكن دراسة التصميمات التي يقدمها العميل وتنفيذ المنتجات وفقًا للمقاسات والمواصفات المطلوبة، بحسب إمكانية التصنيع. لا يمكن ضمان تنفيذ كل تصميم، ويتم تأكيد الإمكانية بعد المراجعة.",
        sendTitle: "يمكنك إرسال",
        send: ["صور التصميم", "الرسومات والمقاسات", "نوع الخشب أو الخامات المطلوبة", "الألوان والتشطيبات", "الكميات", "المتطلبات الفنية الخاصة"],
        sendNote: "بعد مراجعة التفاصيل، يتم إعداد عرض سعر مناسب. سيوضح لك فريق المبيعات طريقة إرسال الرسومات والصور بعد استفسارك الأول.",
        projTitle: "الأثاث للمشروعات والفنادق",
        projBody: "يمكن دراسة طلبات الأثاث المخصصة للمشروعات السكنية والتجارية والفندقية وفقًا للمواصفات والكميات المطلوبة.",
        projTypesTitle: "أنواع المشروعات",
        projTypes: ["الفنادق", "المشروعات السكنية", "الشقق المفروشة", "المشروعات التجارية", "طلبات الأثاث الكبيرة"],
        projCatsTitle: "المنتجات التي يمكن دراسة توريدها",
        projCats: ["غرف النوم", "غرف المعيشة", "غرف الطعام", "الأثاث الفندقي", "الأثاث السكني", "أثاث المشروعات العقارية", "التصميمات الخاصة", "الطلبات الكبيرة حسب المواصفات"],
        assessTitle: "كيف تتم دراسة كل مشروع",
        assessBody: "يتم تحديد الكميات ومدة التنفيذ والتعديلات المطلوبة وشروط التعاقد والشحن لكل مشروع بصورة منفصلة.",
        focusNote: "يظل نشاطنا الأساسي هو التوريد بالجملة لمستوردي وتجار وموزعي ومعارض الأثاث، وتتم دراسة طلبات المشروعات بشكل فردي.",
        ctaTitle: "لديك مشروع أو تصميم خاص؟", ctaBody: "حدّثنا عن المشروع والكميات والمواصفات، وسنراجع إمكانية التنفيذ ونتواصل معك بالخطوات التالية.",
        cta: "ناقش مشروعك", cta2: "أرسل طلب تصميم خاص"
      },
      privacy: { title: "إشعار الخصوصية", body: "إشعار الخصوصية لهذا الموقع قيد المراجعة القانونية، وسيُنشر هنا قبل جمع أي بيانات شخصية في النسخة النهائية.", status: "الحالة: قيد المراجعة القانونية (PENDING)" },
      notFound: { title: "الصفحة غير موجودة", body: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", home: "العودة إلى الرئيسية", browse: "تصفّح المجموعات" },
      meta: { home: "حلول تصنيع وتصدير الأثاث المصري", collections: "المجموعات", about: "من نحن", sourcing: "التوريد والتصدير", shipping: "دليل الشحن والدفع", custom: "التصنيع حسب الطلب والمشروعات", contact: "تواصل واطلب عرض سعر", inquiry: "قائمة الاستفسار", privacy: "الخصوصية", notFound: "الصفحة غير موجودة" }
    }
  };

  window.ALNASR = { PENDING: PENDING, config: config, countries: countries, categories: categories, styles: styles, collections: collections, i18n: i18n };
})();
