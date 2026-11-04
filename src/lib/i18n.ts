import { Locale, ShippingOption } from "./types";

export function formatUzs(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} UZS`;
}

/**
 * Validates Uzbekistan phone numbers:
 * Accepts +998 XX XXX XX XX, 998XXXXXXXXX, or 9 digits with valid mobile/city prefix
 */
export function validateUzPhone(input: string): {
  valid: boolean;
  normalized: string;
  errorUz?: string;
} {
  const digits = input.replace(/\D/g, "");
  let core = digits;
  if (digits.startsWith("998") && digits.length === 12) {
    core = digits.slice(3);
  } else if (digits.length === 9) {
    core = digits;
  } else {
    return {
      valid: false,
      normalized: input,
      errorUz:
        "O'zbekiston raqami +998 (XX) XXX-XX-XX formatida bo'lishi kerak (masalan: +998 90 123 45 67)",
    };
  }

  // Valid Uzbekistan operator & Tashkent codes: 90,91,93,94,95,97,98,99,88,77,33,50,55,71,78
  const validPrefixes = [
    "90",
    "91",
    "93",
    "94",
    "95",
    "97",
    "98",
    "99",
    "88",
    "77",
    "33",
    "50",
    "55",
    "71",
    "78",
  ];
  const prefix = core.slice(0, 2);
  if (!validPrefixes.includes(prefix)) {
    return {
      valid: false,
      normalized: input,
      errorUz: `Noto'g'ri operator kodi (${prefix}). Faqat O'zbekiston operator kodlari qabul qilinadi.`,
    };
  }

  const normalized = `+998 ${core.slice(0, 2)} ${core.slice(2, 5)} ${core.slice(5, 7)} ${core.slice(7, 9)}`;
  return { valid: true, normalized };
}

export function formatUzPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  const withoutCountry = digits.startsWith("998") ? digits.slice(3) : digits;
  const trimmed = withoutCountry.slice(0, 9);

  if (trimmed.length === 0) return "+998 ";
  if (trimmed.length <= 2) return `+998 ${trimmed}`;
  if (trimmed.length <= 5)
    return `+998 ${trimmed.slice(0, 2)} ${trimmed.slice(2)}`;
  if (trimmed.length <= 7)
    return `+998 ${trimmed.slice(0, 2)} ${trimmed.slice(2, 5)} ${trimmed.slice(5)}`;
  return `+998 ${trimmed.slice(0, 2)} ${trimmed.slice(2, 5)} ${trimmed.slice(5, 7)} ${trimmed.slice(7, 9)}`;
}

export const UZBEKISTAN_REGIONS = [
  {
    id: "Toshkent shahri",
    nameUz: "Toshkent shahri",
    nameRu: "г. Ташкент",
    nameEn: "Tashkent City",
    districts: [
      "Mirobod tumani",
      "Yunusobod tumani",
      "Mirzo Ulug'bek tumani",
      "Shayxontohur tumani",
      "Yakkasaroy tumani",
      "Chilonzor tumani",
      "Olmazor tumani",
      "Yashnobod tumani",
      "Sergeli tumani",
      "Uchtepa tumani",
    ],
  },
  {
    id: "Toshkent viloyati",
    nameUz: "Toshkent viloyati",
    nameRu: "Ташкентская область",
    nameEn: "Tashkent Region",
    districts: ["Chirchiq", "Olmaliq", "Angren", "Qibray", "Zangiota", "Bo'stonliq"],
  },
  {
    id: "Samarqand",
    nameUz: "Samarqand viloyati",
    nameRu: "Самаркандская область",
    nameEn: "Samarkand Region",
    districts: ["Samarqand shahri", "Urgut", "Kattaqo'rg'on", "Toyloq"],
  },
  {
    id: "Buxoro",
    nameUz: "Buxoro viloyati",
    nameRu: "Бухарская область",
    nameEn: "Bukhara Region",
    districts: ["Buxoro shahri", "Kogon", "G'ijduvon", "Vobkent"],
  },
  {
    id: "Farg'ona",
    nameUz: "Farg'ona viloyati",
    nameRu: "Ферганская область",
    nameEn: "Fergana Region",
    districts: ["Farg'ona shahri", "Marg'ilon", "Qo'qon", "Quvasoy"],
  },
  {
    id: "Andijon",
    nameUz: "Andijon viloyati",
    nameRu: "Андижанская область",
    nameEn: "Andijan Region",
    districts: ["Andijon shahri", "Asaka", "Shahrixon", "Xonobod"],
  },
  {
    id: "Namangan",
    nameUz: "Namangan viloyati",
    nameRu: "Наманганская область",
    nameEn: "Namangan Region",
    districts: ["Namangan shahri", "Chust", "Pop", "To'raqo'rg'on"],
  },
  {
    id: "Xorazm",
    nameUz: "Xorazm viloyati",
    nameRu: "Хорезмская область",
    nameEn: "Khorezm Region",
    districts: ["Urganch shahri", "Xiva shahri", "Hazorasp"],
  },
  {
    id: "Qashqadaryo",
    nameUz: "Qashqadaryo viloyati",
    nameRu: "Кашкадарьинская область",
    nameEn: "Kashkadarya Region",
    districts: ["Qarshi shahri", "Shahrisabz", "Kitob"],
  },
  {
    id: "Navoiy",
    nameUz: "Navoiy viloyati",
    nameRu: "Навоийская область",
    nameEn: "Navoi Region",
    districts: ["Navoiy shahri", "Zarafshon", "Karmana"],
  },
];

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "TASHKENT_EXPRESS",
    nameUz: "Toshkent VIP Express Kuryer (2-3 soat ichida)",
    nameRu: "VIP Экспресс по Ташкенту (за 2-3 часа)",
    nameEn: "Tashkent VIP Express Courier (within 2-3 hours)",
    etaUz: "Bugun, 2–3 soat ichida",
    etaRu: "Сегодня, 2–3 часа",
    etaEn: "Today, 2–3 hours",
    priceUzs: 45000,
    freeThresholdUzs: 2500000,
  },
  {
    id: "REGIONAL_COURIER",
    nameUz: "Viloyatlar bo'ylab Express Yetkazib berish (BTS / Fargo)",
    nameRu: "Доставка по регионам Узбекистана (BTS / Fargo)",
    nameEn: "Uzbekistan Regional Express Delivery (BTS / Fargo)",
    etaUz: "1–2 ish kuni",
    etaRu: "1–2 рабочих дня",
    etaEn: "1–2 business days",
    priceUzs: 65000,
    freeThresholdUzs: 3000000,
  },
  {
    id: "SHOWROOM_PICKUP",
    nameUz: "NNN Flagship Showroomdan olib ketish (Toshkent, Taras Shevchenko 21)",
    nameRu: "Самовывоз из флагманского шоурума NNN (ул. Т. Шевченко 21)",
    nameEn: "NNN Flagship Showroom Pickup (Tashkent, 21 Taras Shevchenko)",
    etaUz: "1 soatda tayyor bo'ladi",
    etaRu: "Готово через 1 час",
    etaEn: "Ready in 1 hour",
    priceUzs: 0,
    freeThresholdUzs: 0,
  },
];

export const DICTIONARY: Record<
  Locale,
  {
    nav: {
      home: string;
      shop: string;
      studio3d: string;
      about: string;
      contact: string;
      wishlist: string;
      cart: string;
      account: string;
      admin: string;
    };
    hero: {
      eyebrow: string;
      slogan: string;
      description: string;
      shopCta: string;
      explore3d: string;
      seasonTag: string;
    };
    sections: {
      newArrivals: string;
      featuredCollections: string;
      bestSellers: string;
      brandStory: string;
      viewAll: string;
      interactive3dBadge: string;
      fallback360Badge: string;
    };
    product: {
      mode3d: string;
      mode360: string;
      modeGallery: string;
      selectColor: string;
      selectSize: string;
      sizeGuide: string;
      addToCart: string;
      addedToCart: string;
      outOfStock: string;
      lowStock: string;
      inStock: string;
      fabricComposition: string;
      careInstructions: string;
      deliveryAndReturns: string;
      relatedProducts: string;
      fullscreen: string;
      exitFullscreen: string;
      resetCamera: string;
      autoRotate: string;
      lightingPreset: string;
      wireframe: string;
    };
    cart: {
      title: string;
      empty: string;
      continueShopping: string;
      subtotal: string;
      shipping: string;
      discount: string;
      total: string;
      promoPlaceholder: string;
      applyPromo: string;
      proceedToCheckout: string;
      freeShippingUnlocked: string;
    };
    checkout: {
      title: string;
      contactInfo: string;
      deliveryAddress: string;
      shippingMethod: string;
      paymentMethod: string;
      placeOrder: string;
      phoneLabel: string;
      regionLabel: string;
      districtLabel: string;
      addressLabel: string;
    };
  }
> = {
  uz: {
    nav: {
      home: "Bosh sahifa",
      shop: "Katalog",
      studio3d: "3D Studio",
      about: "Brend haqida",
      contact: "Aloqa",
      wishlist: "Tanlanganlar",
      cart: "Savat",
      account: "Kabinet",
      admin: "Admin Panel",
    },
    hero: {
      eyebrow: "KUZ / QISH 2026 — MONOLITH KOLLEKSIYASI",
      slogan: "Less Noise. More Identity.",
      description:
        "Zamonaviy erkaklar uchun me'moriy bichim, og'ir vaznli premium matolar va real-vaqtda interaktiv 3D ko'rish texnologiyasi.",
      shopCta: "Kolleksiyani Ko'rish",
      explore3d: "3D Kiyim Ko'rish",
      seasonTag: "TOSHKENT · MILAN ATELIER",
    },
    sections: {
      newArrivals: "Yangi Tushganlar",
      featuredCollections: "Tanlangan Kolleksiyalar",
      bestSellers: "Bestsellerlar",
      brandStory: "Brend Falsafasi",
      viewAll: "Barchasini ko'rish",
      interactive3dBadge: "3D INTERAKTIV",
      fallback360Badge: "360° STUDIO",
    },
    product: {
      mode3d: "3D Model",
      mode360: "360° Aylana",
      modeGallery: "Galereya",
      selectColor: "Rangni tanlang",
      selectSize: "O'lchamni tanlang",
      sizeGuide: "O'lchamlar jadvali",
      addToCart: "Savatga Qo'shish",
      addedToCart: "Savatga qo'shildi",
      outOfStock: "Sotuvda qolmagan",
      lowStock: "Kam qoldi",
      inStock: "Mavjud",
      fabricComposition: "Mato tarkibi va xususiyatlari",
      careInstructions: "Parvarishlash bo'yicha ko'rsatma",
      deliveryAndReturns: "O'zbekiston bo'ylab yetkazish va qaytarish",
      relatedProducts: "O'xshash Modellar",
      fullscreen: "To'liq ekran",
      exitFullscreen: "Kichraytirish",
      resetCamera: "Markazga qaytarish",
      autoRotate: "Avto-aylanish",
      lightingPreset: "Studiya nuri",
      wireframe: "To'r ko'rinishi",
    },
    cart: {
      title: "Xarid Savati",
      empty: "Savatingiz hozircha bo'sh",
      continueShopping: "Xaridni davom ettirish",
      subtotal: "Mahsulotlar qiymati",
      shipping: "Yetkazib berish",
      discount: "Chegirma",
      total: "Jami to'lov",
      promoPlaceholder: "Promo-kod (masalan: NNN10)",
      applyPromo: "Qo'llash",
      proceedToCheckout: "Rasmiylashtirishga o'tish",
      freeShippingUnlocked: "Bepul VIP yetkazib berish faollashdi",
    },
    checkout: {
      title: "Buyurtmani Rasmiylashtirish",
      contactInfo: "1. Xaridor ma'lumotlari",
      deliveryAddress: "2. Yetkazib berish manzili (O'zbekiston)",
      shippingMethod: "3. Yetkazib berish usuli",
      paymentMethod: "4. To'lov tizimi (Click / Payme / Naqd)",
      placeOrder: "Buyurtmani Tasdiqlash",
      phoneLabel: "Telefon raqami (+998)",
      regionLabel: "Viloyat / Shahar",
      districtLabel: "Tuman / Shahar",
      addressLabel: "Ko'cha, uy, xonadon va mo'ljal",
    },
  },
  ru: {
    nav: {
      home: "Главная",
      shop: "Каталог",
      studio3d: "3D Студия",
      about: "О бренде",
      contact: "Контакты",
      wishlist: "Избранное",
      cart: "Корзина",
      account: "Кабинет",
      admin: "Админ",
    },
    hero: {
      eyebrow: "ОСЕНЬ / ЗИМА 2026 — КОЛЛЕКЦИЯ MONOLITH",
      slogan: "Less Noise. More Identity.",
      description:
        "Архитектурный крой для современного мужчины, плотные премиальные ткани и интерактивный 3D-просмотр в реальном времени.",
      shopCta: "Смотреть коллекцию",
      explore3d: "3D Просмотр",
      seasonTag: "ТАШКЕНТ · МИЛАН АТЕЛЬЕ",
    },
    sections: {
      newArrivals: "Новые Поступления",
      featuredCollections: "Избранные Коллекции",
      bestSellers: "Бестселлеры",
      brandStory: "Философия Бренда",
      viewAll: "Смотреть все",
      interactive3dBadge: "3D МОДЕЛЬ",
      fallback360Badge: "360° ОБЗОР",
    },
    product: {
      mode3d: "3D Модель",
      mode360: "360° Обзор",
      modeGallery: "Галерея",
      selectColor: "Выберите цвет",
      selectSize: "Выберите размер",
      sizeGuide: "Таблица размеров",
      addToCart: "Добавить в корзину",
      addedToCart: "Добавлено в корзину",
      outOfStock: "Нет в наличии",
      lowStock: "Мало на складе",
      inStock: "В наличии",
      fabricComposition: "Состав ткани и характеристики",
      careInstructions: "Рекомендации по уходу",
      deliveryAndReturns: "Доставка по Узбекистану и возврат",
      relatedProducts: "Похожие изделия",
      fullscreen: "Полный экран",
      exitFullscreen: "Свернуть",
      resetCamera: "Сброс камеры",
      autoRotate: "Авто-вращение",
      lightingPreset: "Свет студии",
      wireframe: "Каркас сетки",
    },
    cart: {
      title: "Корзина Покупок",
      empty: "Ваша корзина пока пуста",
      continueShopping: "Перейти в каталог",
      subtotal: "Стоимость товаров",
      shipping: "Доставка",
      discount: "Скидка",
      total: "Итого к оплате",
      promoPlaceholder: "Промокод (например: NNN10)",
      applyPromo: "Применить",
      proceedToCheckout: "Оформить заказ",
      freeShippingUnlocked: "Бесплатная VIP-доставка активирована",
    },
    checkout: {
      title: "Оформление Заказа",
      contactInfo: "1. Контактные данные",
      deliveryAddress: "2. Адрес доставки (Узбекистан)",
      shippingMethod: "3. Способ доставки",
      paymentMethod: "4. Способ оплаты (Click / Payme / Наличные)",
      placeOrder: "Подтвердить Заказ",
      phoneLabel: "Номер телефона (+998)",
      regionLabel: "Область / Город",
      districtLabel: "Район / Город",
      addressLabel: "Улица, дом, квартира, ориентир",
    },
  },
  en: {
    nav: {
      home: "Home",
      shop: "Catalog",
      studio3d: "3D Studio",
      about: "Maison",
      contact: "Contact",
      wishlist: "Wishlist",
      cart: "Bag",
      account: "Account",
      admin: "Admin",
    },
    hero: {
      eyebrow: "AUTUMN / WINTER 2026 — MONOLITH COLLECTION",
      slogan: "Less Noise. More Identity.",
      description:
        "Architectural tailoring, heavyweight luxury textiles, and real-time interactive 3D garment inspection.",
      shopCta: "Shop Collection",
      explore3d: "Inspect in 3D",
      seasonTag: "TASHKENT · MILAN ATELIER",
    },
    sections: {
      newArrivals: "New Arrivals",
      featuredCollections: "Curated Collections",
      bestSellers: "Best Sellers",
      brandStory: "Brand Manifesto",
      viewAll: "View All",
      interactive3dBadge: "3D INTERACTIVE",
      fallback360Badge: "360° SEQUENCE",
    },
    product: {
      mode3d: "3D Model",
      mode360: "360° Spin",
      modeGallery: "Editorial",
      selectColor: "Select Color",
      selectSize: "Select Size",
      sizeGuide: "Size Guide",
      addToCart: "Add to Bag",
      addedToCart: "Added to Bag",
      outOfStock: "Sold Out",
      lowStock: "Low Stock",
      inStock: "In Stock",
      fabricComposition: "Fabric Composition & Origin",
      careInstructions: "Garment Care",
      deliveryAndReturns: "Uzbekistan Delivery & Returns",
      relatedProducts: "Complete the Silhouette",
      fullscreen: "Fullscreen",
      exitFullscreen: "Exit Fullscreen",
      resetCamera: "Reset View",
      autoRotate: "Auto Rotate",
      lightingPreset: "Studio Lighting",
      wireframe: "Mesh Wireframe",
    },
    cart: {
      title: "Shopping Bag",
      empty: "Your shopping bag is currently empty",
      continueShopping: "Explore Collection",
      subtotal: "Subtotal",
      shipping: "Estimated Delivery",
      discount: "Promo Discount",
      total: "Total (UZS)",
      promoPlaceholder: "Promo code (e.g. NNN10)",
      applyPromo: "Apply",
      proceedToCheckout: "Proceed to Checkout",
      freeShippingUnlocked: "Complimentary VIP Delivery Unlocked",
    },
    checkout: {
      title: "Checkout",
      contactInfo: "1. Client Details",
      deliveryAddress: "2. Delivery Destination (Uzbekistan)",
      shippingMethod: "3. Delivery Service",
      paymentMethod: "4. Payment Method (Click / Payme / Cash)",
      placeOrder: "Authorize & Place Order",
      phoneLabel: "Phone Number (+998)",
      regionLabel: "Region / City",
      districtLabel: "District",
      addressLabel: "Street address, building, apartment",
    },
  },
};

export function getLocalizedText(
  item: { [key: string]: any },
  fieldPrefix: string,
  locale: Locale
): string {
  const suffix = locale === "uz" ? "Uz" : locale === "ru" ? "Ru" : "En";
  return item[`${fieldPrefix}${suffix}`] || item[`${fieldPrefix}Uz`] || "";
}
