"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  INITIAL_CATEGORIES,
  INITIAL_DISCOUNTS,
  INITIAL_INQUIRIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from "@/lib/seedData";
import {
  Category,
  ContactInquiry,
  DiscountCode,
  Locale,
  Order,
  Product,
  SizeCode,
  UserAccount,
} from "@/lib/types";

export interface CartItem {
  productId: string;
  colorId: string;
  size: SizeCode;
  quantity: number;
}

interface StoreContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  discounts: DiscountCode[];
  setDiscounts: React.Dispatch<React.SetStateAction<DiscountCode[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  inquiries: ContactInquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<ContactInquiry[]>>;
  isLoadingStore: boolean;
  refreshStore: () => Promise<void>;
  cart: CartItem[];
  addToCart: (
    productId: string,
    colorId: string,
    size: SizeCode,
    quantity?: number
  ) => { ok: boolean; message: string };
  updateCartQuantity: (
    productId: string,
    colorId: string,
    size: SizeCode,
    quantity: number
  ) => { ok: boolean; message?: string };
  removeFromCart: (productId: string, colorId: string, size: SizeCode) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotalUzs: number;
  appliedPromo: DiscountCode | null;
  discountAmountUzs: number;
  applyPromoCode: (code: string) => { ok: boolean; message: string };
  removePromoCode: () => void;
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("uz");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [discounts, setDiscounts] = useState<DiscountCode[]>(INITIAL_DISCOUNTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [inquiries, setInquiries] =
    useState<ContactInquiry[]>(INITIAL_INQUIRIES);
  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(null);
  const [adminToken, setAdminTokenState] = useState<string | null>(null);

  const refreshStore = useCallback(async () => {
    try {
      setIsLoadingStore(true);
      const res = await fetch("/api/store", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.discounts)) setDiscounts(data.discounts);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.inquiries)) setInquiries(data.inquiries);
      }
    } catch {
      // Static deployment (e.g. GitHub Pages): use local state + seed data
    } finally {
      setIsLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    refreshStore();
    try {
      const savedLocale = localStorage.getItem("nnn_locale") as Locale | null;
      if (savedLocale && ["uz", "ru", "en"].includes(savedLocale)) {
        setLocaleState(savedLocale);
      }
      const savedCart = localStorage.getItem("nnn_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem("nnn_wishlist");
      if (savedWishlist) {
        setWishlistIds(JSON.parse(savedWishlist));
      } else {
        setWishlistIds(["prod-monolith-overcoat", "prod-axis-blazer"]);
      }
      const savedPromo = localStorage.getItem("nnn_promo");
      if (savedPromo) {
        setAppliedPromoCode(savedPromo);
      }
      const savedUser = localStorage.getItem("nnn_user");
      if (savedUser) {
        setCurrentUserState(JSON.parse(savedUser));
      }
      const savedAdmin = localStorage.getItem("nnn_admin_token");
      if (savedAdmin) {
        setAdminTokenState(savedAdmin);
      }
    } catch {
      // ignore localStorage errors
    }
  }, [refreshStore]);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    try {
      localStorage.setItem("nnn_locale", loc);
    } catch {}
  };

  const saveCart = (next: CartItem[]) => {
    setCart(next);
    try {
      localStorage.setItem("nnn_cart", JSON.stringify(next));
    } catch {}
  };

  const setCurrentUser = (user: UserAccount | null) => {
    setCurrentUserState(user);
    try {
      if (user) localStorage.setItem("nnn_user", JSON.stringify(user));
      else localStorage.removeItem("nnn_user");
    } catch {}
  };

  const setAdminToken = (token: string | null) => {
    setAdminTokenState(token);
    try {
      if (token) localStorage.setItem("nnn_admin_token", token);
      else localStorage.removeItem("nnn_admin_token");
    } catch {}
  };

  const addToCart = (
    productId: string,
    colorId: string,
    size: SizeCode,
    quantity = 1
  ): { ok: boolean; message: string } => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { ok: false, message: "Mahsulot topilmadi" };
    }
    const sizeStock = product.sizes.find((s) => s.size === size);
    if (!sizeStock || sizeStock.stock <= 0) {
      return {
        ok: false,
        message: "Ushbu o'lcham hozirda omborda qolmagan",
      };
    }

    const existingIndex = cart.findIndex(
      (i) =>
        i.productId === productId && i.colorId === colorId && i.size === size
    );
    const currentQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    if (currentQty + quantity > sizeStock.stock) {
      return {
        ok: false,
        message: `Omborda faqat ${sizeStock.stock} dona mavjud`,
      };
    }

    const next = [...cart];
    if (existingIndex > -1) {
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: currentQty + quantity,
      };
    } else {
      next.push({ productId, colorId, size, quantity });
    }
    saveCart(next);
    return { ok: true, message: "Savatga qo'shildi" };
  };

  const updateCartQuantity = (
    productId: string,
    colorId: string,
    size: SizeCode,
    quantity: number
  ): { ok: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId, colorId, size);
      return { ok: true };
    }
    const product = products.find((p) => p.id === productId);
    const sizeStock = product?.sizes.find((s) => s.size === size);
    if (sizeStock && quantity > sizeStock.stock) {
      return {
        ok: false,
        message: `Omborda maksimal ${sizeStock.stock} dona mavjud`,
      };
    }
    const next = cart.map((item) =>
      item.productId === productId &&
      item.colorId === colorId &&
      item.size === size
        ? { ...item, quantity }
        : item
    );
    saveCart(next);
    return { ok: true };
  };

  const removeFromCart = (
    productId: string,
    colorId: string,
    size: SizeCode
  ) => {
    const next = cart.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.colorId === colorId &&
          item.size === size
        )
    );
    saveCart(next);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedPromoCode("");
    try {
      localStorage.removeItem("nnn_promo");
    } catch {}
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotalUzs = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return sum + (p ? p.priceUzs * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const appliedPromo = useMemo(() => {
    if (!appliedPromoCode) return null;
    const found = discounts.find(
      (d) =>
        d.code.toUpperCase() === appliedPromoCode.toUpperCase() && d.active
    );
    if (!found) return null;
    if (cartSubtotalUzs < found.minOrderUzs) return null;
    return found;
  }, [appliedPromoCode, discounts, cartSubtotalUzs]);

  const discountAmountUzs = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "PERCENTAGE") {
      return Math.round((cartSubtotalUzs * appliedPromo.value) / 100);
    }
    return appliedPromo.value;
  }, [appliedPromo, cartSubtotalUzs]);

  const applyPromoCode = (code: string): { ok: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { ok: false, message: "Promo-kodni kiriting" };
    }
    const found = discounts.find(
      (d) => d.code.toUpperCase() === clean && d.active
    );
    if (!found) {
      return {
        ok: false,
        message: "Bunday promo-kod topilmadi yoki faol emas (Masalan: NNN10)",
      };
    }
    if (cartSubtotalUzs < found.minOrderUzs) {
      return {
        ok: false,
        message: `${clean} promo-kodi kamida ${found.minOrderUzs.toLocaleString(
          "ru-RU"
        )} UZS xarid uchun amal qiladi`,
      };
    }
    setAppliedPromoCode(found.code);
    try {
      localStorage.setItem("nnn_promo", found.code);
    } catch {}
    return {
      ok: true,
      message: `${found.code} muvaffaqiyatli qo'llanildi`,
    };
  };

  const removePromoCode = () => {
    setAppliedPromoCode("");
    try {
      localStorage.removeItem("nnn_promo");
    } catch {}
  };

  const toggleWishlist = (productId: string) => {
    const next = wishlistIds.includes(productId)
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];
    setWishlistIds(next);
    try {
      localStorage.setItem("nnn_wishlist", JSON.stringify(next));
    } catch {}
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <StoreContext.Provider
      value={{
        locale,
        setLocale,
        products,
        setProducts,
        categories,
        setCategories,
        discounts,
        setDiscounts,
        orders,
        setOrders,
        users,
        setUsers,
        inquiries,
        setInquiries,
        isLoadingStore,
        refreshStore,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotalUzs,
        appliedPromo,
        discountAmountUzs,
        applyPromoCode,
        removePromoCode,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        currentUser,
        setCurrentUser,
        adminToken,
        setAdminToken,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return ctx;
}
