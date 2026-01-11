"use client";

import React, { useState, useEffect } from 'react';
import { useRTL } from "@/lib/rtl-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Languages, ShoppingCart, LayoutGrid, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";
import * as Icons from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { ProductItem } from "@/components/ProductItem";

const DynamicIcon = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => {
  const IconComp = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComp size={size} className={className} />;
};

const Index = () => {
  const { t, isRTL, setLang, lang } = useRTL();
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('cafe_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [lastOrder, setLastOrder] = useState<number | null>(null);

  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [0, -10]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    localStorage.setItem('cafe_cart', JSON.stringify(cart));
  }, [cart]);

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: api.getProducts });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i);
      return [...prev, {...product, qty: 1}];
    });
    showSuccess(isRTL ? "تمت الإضافة للسلة" : "Added to cart");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-arabic pb-20 relative overflow-x-hidden">
      <motion.div 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="fixed inset-0 pointer-events-none z-0"
      >
        <div className="absolute top-[-10%] left-[-5%] w-64 h-64 md:w-96 md:h-96 bg-primary/5 blur-[80px] md:blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 md:w-[500px] md:h-[500px] bg-primary/10 blur-[100px] md:blur-[150px] rounded-full" />
      </motion.div>

      <motion.header 
        style={{ y: headerY }}
        className="bg-white/80 backdrop-blur-xl border-b p-3 md:p-4 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 md:gap-4"
          >
             <AnimatedLogo className="h-10 w-10 md:h-14 md:h-14" />
             <div className="flex flex-col">
                <motion.h1 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl font-black leading-tight"
                >
                  مقهى الشرقاوي
                </motion.h1>
                <motion.span 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[8px] md:text-[10px] uppercase mt-0.5 tracking-tighter text-muted-foreground font-bold"
                >
                  Premium Quality Coffee
                </motion.span>
             </div>
          </motion.div>
          <Button variant="outline" size="sm" className="rounded-full gap-2 h-8 md:h-10 text-[11px] md:text-sm border-primary/20 hover:bg-primary/5 text-primary" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
            <Languages size={14} className="md:size-4" /> {lang === 'ar' ? 'English' : 'عربي'}
          </Button>
        </div>
      </motion.header>

      <div className="relative h-[25vh] md:h-[40vh] overflow-hidden flex items-center justify-center bg-primary">
         <motion.div 
           style={{ y: useTransform(scrollY, [0, 500], [0, 150]) }}
           className="absolute inset-0 opacity-40"
         >
           <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" />
         </motion.div>
         <div className="absolute inset-0 bg-black/40" />
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative z-10 text-center text-white px-4"
         >
            <h2 className="text-2xl md:text-6xl font-black mb-2 md:mb-4 drop-shadow-2xl">
              {isRTL ? "قهوة | سردة | رواق" : "Art in Every Cup"}
            </h2>
         </motion.div>
      </div>

      <div className="p-3 md:p-4 bg-white/90 backdrop-blur-md border-b sticky top-[65px] md:top-[89px] z-40 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-sm">
        <div className="max-w-6xl mx-auto flex gap-2 md:gap-3">
          <Button 
            variant={activeCategory === 'all' ? 'default' : 'secondary'} 
            className="rounded-full px-4 md:px-6 gap-2 h-9 md:h-11 text-xs md:text-sm transition-all"
            onClick={() => setActiveCategory('all')}
          >
            <LayoutGrid size={16} />
            {isRTL ? 'الكل' : 'All'}
          </Button>
          {categories.map((cat: any) => (
            <Button 
              key={cat.id} 
              variant={activeCategory === cat.id ? 'default' : 'secondary'}
              className="rounded-full px-4 md:px-6 gap-2 h-9 md:h-11 text-xs md:text-sm transition-all"
              onClick={() => setActiveCategory(cat.id)}
            >
              <DynamicIcon name={cat.icon} size={16} />
              {isRTL ? cat.name_ar : cat.name}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-3 md:p-4 max-w-6xl mx-auto w-full space-y-8 md:space-y-12 py-8 md:py-12 relative z-10">
        {activeCategory === 'all' ? (
          categories.map((cat: any) => {
            const catProducts = products.filter((p: any) => p.category_id === cat.id);
            if (catProducts.length === 0) return null;
            return (
              <section key={cat.id} className="space-y-4 md:space-y-8">
                <div className="flex items-center gap-2 md:gap-3 border-b pb-2 md:pb-4">
                  <motion.div 
                    whileInView={{ rotate: [0, 10, -10, 0] }}
                    className="bg-primary/5 p-2 md:p-3 rounded-xl md:rounded-2xl text-primary"
                  >
                    <DynamicIcon name={cat.icon} size={20} className="md:size-7" />
                  </motion.div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight">{isRTL ? cat.name_ar : cat.name}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8">
                  {catProducts.map(p => <ProductItem key={p.id} product={p} categories={categories} onAddToCart={addToCart} t={t} />)}
                </div>
              </section>
            );
          })
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8">
            {products.filter((p: any) => p.category_id === activeCategory).map(p => (
              <ProductItem key={p.id} product={p} categories={categories} onAddToCart={addToCart} t={t} />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }} className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="h-14 w-14 md:h-20 md:w-20 rounded-full shadow-2xl bg-primary text-white relative flex items-center justify-center p-0 hover:scale-110 transition-transform active:scale-95">
                  <ShoppingCart size={24} className="md:size-8" />
                  <Badge className="absolute -top-1 -right-1 h-6 w-6 md:h-8 md:w-8 flex items-center justify-center rounded-full bg-red-500 border-2 md:border-4 border-stone-50 shadow-lg text-[10px] md:text-sm font-black text-white animate-bounce">{cartCount}</Badge>
                </Button>
              </SheetTrigger>
              <SheetContent className="rounded-l-[32px] md:rounded-l-[40px] w-full max-w-md flex flex-col p-0 bg-white border-none shadow-2xl">
                <SheetHeader className="p-6 md:p-8 border-b flex-row justify-between items-center space-y-0">
                  <SheetTitle className="flex items-center gap-3 text-xl md:text-2xl font-black"><ShoppingCart className="text-primary" /> {t('cart')}</SheetTitle>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 rounded-xl text-xs" onClick={() => setCart([])}>
                    <Trash2 size={16} /> {isRTL ? 'مسح الكل' : 'Clear All'}
                  </Button>
                </SheetHeader>
                <ScrollArea className="flex-1 px-6 md:px-8 pt-4 md:pt-6">
                  <div className="space-y-3 md:space-y-4 pb-8">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-stone-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-stone-100">
                        <div className="flex-1 pr-2">
                          <p className="font-black text-sm md:text-lg truncate max-w-[120px] md:max-w-none">{isRTL ? item.name_ar : item.name}</p>
                          <CurrencyDisplay amountUsd={item.price * item.qty} size="xs" />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-sm border">
                           <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl" onClick={() => updateQty(item.id, -1)}><Minus size={12} /></Button>
                           <span className="font-black w-5 md:w-6 text-center text-sm md:text-lg">{item.qty}</span>
                           <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl" onClick={() => updateQty(item.id, 1)}><Plus size={12} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-6 md:p-8 border-t bg-stone-50/50 space-y-4 md:space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest">{t('total')}</span>
                    <CurrencyDisplay amountUsd={cartTotal} size="lg" className="items-end" />
                  </div>
                  <Button className="w-full h-14 md:h-16 rounded-[16px] md:rounded-[20px] text-lg md:text-xl font-black shadow-xl" onClick={async () => {
                    const res = await api.createOrder({ items: cart, total: cartTotal });
                    setCart([]);
                    setLastOrder(res.id);
                  }}>
                    {t('place_order')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!lastOrder} onOpenChange={(open) => !open && setLastOrder(null)}>
        <DialogContent className="rounded-[32px] md:rounded-[40px] border-none shadow-2xl bg-white p-6 md:p-10 max-w-[90vw] md:max-w-sm text-center space-y-4 md:space-y-6">
           <div className="mx-auto bg-green-50 text-green-600 p-3 md:p-4 rounded-full w-fit">
              <CheckCircle2 size={36} className="md:size-[48px]" />
           </div>
           <div>
             <h2 className="text-xl md:text-2xl font-black mb-1 md:mb-2">{isRTL ? "تم إرسال الطلب!" : "Order Placed!"}</h2>
             <p className="text-sm md:text-base text-muted-foreground font-bold">{isRTL ? "رقم طلبك هو:" : "Your order number is:"}</p>
           </div>
           <div className="bg-stone-50 py-4 md:py-6 rounded-2xl md:rounded-3xl border-2 border-dashed border-stone-200">
             <span className="text-4xl md:text-6xl font-black text-primary">#{lastOrder}</span>
           </div>
           <Button className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl text-base md:text-lg font-black" onClick={() => setLastOrder(null)}>
              {isRTL ? "حسناً" : "Great!"}
           </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;