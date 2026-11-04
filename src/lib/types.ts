export type Locale = "uz" | "ru" | "en";

export type GarmentArchetype =
  | "overcoat"
  | "blazer"
  | "hoodie"
  | "overshirt"
  | "trousers"
  | "tote"
  | "turtleneck"
  | "trench";

export interface ProductColor {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  hex: string;
  secondaryHex?: string;
  roughness: number;
  metalness: number;
}

export type SizeCode = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface ProductSizeStock {
  size: SizeCode;
  stock: number;
  chestCm: string;
  shoulderCm: string;
  lengthCm: string;
}

export interface Frame360 {
  angle: number;
  imageUrl: string;
  label: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  subtitleUz: string;
  subtitleRu: string;
  subtitleEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  priceUzs: number;
  compareAtPriceUzs?: number;
  categoryId: string;
  categorySlug: string;
  garmentArchetype: GarmentArchetype;
  model3dUrl?: string; // External .glb/.gltf URL or procedural studio model identifier
  has3dModel: boolean; // When false, automatically falls back to 360-degree sequence viewer
  frames360: Frame360[];
  gallery: string[];
  fabricUz: string;
  fabricRu: string;
  fabricEn: string;
  careUz: string;
  careRu: string;
  careEn: string;
  origin: string;
  weightGsm: number;
  fitType: "OVERSIZED" | "RELAXED_TAILORED" | "ARCHITECTURAL" | "REGULAR";
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  colors: ProductColor[];
  sizes: ProductSizeStock[];
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  heroImage: string;
  featured: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_UZS";
  value: number;
  minOrderUzs: number;
  active: boolean;
  usageCount: number;
  maxUses: number;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
}

export interface ShippingOption {
  id: "TASHKENT_EXPRESS" | "REGIONAL_COURIER" | "SHOWROOM_PICKUP";
  nameUz: string;
  nameRu: string;
  nameEn: string;
  etaUz: string;
  etaRu: string;
  etaEn: string;
  priceUzs: number;
  freeThresholdUzs: number;
}

export interface OrderItem {
  productId: string;
  sku: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  size: SizeCode;
  quantity: number;
  unitPriceUzs: number;
  image: string;
}

export type PaymentMethod = "CLICK" | "PAYME" | "CASH_ON_DELIVERY";

export type PaymentStatus =
  | "PENDING_MERCHANT"
  | "SANDBOX_VERIFIED"
  | "PAID"
  | "FAILED"
  | "COD_PENDING";

export type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  region: string;
  district: string;
  addressLine: string;
  deliveryMethod: ShippingOption["id"];
  shippingCostUzs: number;
  subtotalUzs: number;
  discountCode?: string;
  discountAmountUzs: number;
  totalUzs: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  paymentGatewayUrl?: string;
  status: OrderStatus;
  telegramNotified: boolean;
  telegramLog?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  region?: string;
  address?: string;
  totalSpentUzs: number;
  ordersCount: number;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  appointmentDate?: string;
  createdAt: string;
}
