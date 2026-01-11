"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface RTLContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations = {
  en: {
    menu: "Menu",
    pos: "POS",
    admin: "Administration",
    kitchen: "Kitchen",
    cart: "Cart",
    place_order: "Place Order",
    status: "Status",
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    paid: "Paid",
    cancelled: "Cancelled",
    total: "Total",
    items: "Items",
    add_to_cart: "Add to Cart",
    stock_warning: "Low Stock!",
    out_of_stock: "Out of Stock",
    daily_revenue: "Daily Revenue",
  },
  ar: {
    menu: "القائمة",
    pos: "نقطة البيع",
    admin: "الإدارة",
    kitchen: "المطبخ",
    cart: "السلة",
    place_order: "إرسال الطلب",
    status: "الحالة",
    pending: "قيد الانتظار",
    preparing: "جاري التحضير",
    ready: "جاهز",
    paid: "تم الدفع",
    cancelled: "ملغي",
    total: "المجموع",
    items: "الأصناف",
    add_to_cart: "أضف للسلة",
    stock_warning: "مخزون منخفض!",
    out_of_stock: "نفد من المخزن",
    daily_revenue: "الإيرادات اليومية",
  }
};

const RTLContext = createContext<RTLContextType | undefined>(undefined);

export const RTLProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('ar'); // Default to Arabic as requested

  useEffect(() => {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const isRTL = lang === 'ar';
  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <RTLContext.Provider value={{ lang, setLang, isRTL, t }}>
      <div className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </RTLContext.Provider>
  );
};

export const useRTL = () => {
  const context = useContext(RTLContext);
  if (!context) throw new Error('useRTL must be used within RTLProvider');
  return context;
};