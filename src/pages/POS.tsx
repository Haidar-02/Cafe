"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, LayoutGrid, ReceiptText, X } from "lucide-react";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRTL } from "@/lib/rtl-context";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";
import { Badge } from "@/components/ui/badge";

const DynamicIcon = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => {
  const IconComp = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComp size={size} className={className} />;
};

const POS = () => {
  const { isRTL, t } = useRTL();
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: api.getProducts });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
  
  const cartTotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  const filteredProducts = products.filter((p: any) => {
    const nameMatch = (isRTL ? p.name_ar : p.name).toLowerCase().includes(query.toLowerCase());
    const categoryMatch = activeCategory === 'all' || p.category_id === activeCategory;
    return nameMatch && categoryMatch;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    await api.createOrder({ items: cart, total: cartTotal });
    setCart([]);
    setIsSheetOpen(false);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    showSuccess(isRTL ? "تم إكمال الطلب" : "Order completed");
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const addToCart = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, qty: i.qty+1} : i);
      return [...prev, {...p, qty: 1}];
    });
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-[500px]">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full flex flex-col gap-3">
          <div className="relative">
            <Search className={`${isRTL ? 'right-4' : 'left-4'} absolute top-1/2 -translate-y-1/2 text-muted-foreground`} size={16} />
            <Input 
              placeholder={isRTL ? "ابحث عن منتج..." : "Search products..."} 
              className={`${isRTL ? 'pr-10' : 'pl-10'} h-10 rounded-xl bg-white border-none shadow-sm text-sm`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            <Button 
              variant={activeCategory === 'all' ? 'default' : 'secondary'} 
              size="sm" 
              className="rounded-full px-4 h-9 gap-2 text-xs font-bold"
              onClick={() => setActiveCategory('all')}
            >
              <LayoutGrid size={14} />
              {isRTL ? 'الكل' : 'All'}
            </Button>
            {categories.map((c: any) => (
              <Button 
                key={c.id} 
                variant={activeCategory === c.id ? 'default' : 'secondary'} 
                size="sm" 
                className="rounded-full px-4 h-9 gap-2 text-xs font-bold"
                onClick={() => setActiveCategory(c.id)}
              >
                <DynamicIcon name={c.icon} size={14} />
                {isRTL ? c.name_ar : c.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Floating Cart Trigger */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl shadow-xl gap-3 font-black shrink-0 relative overflow-hidden transition-transform active:scale-95">
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">{isRTL ? 'مراجعة الطلب' : 'View Order'}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-none px-2 rounded-lg">{cartCount}</Badge>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-md p-0 flex flex-col rounded-l-[32px] border-none shadow-2xl bg-white overflow-hidden">
            <SheetHeader className="p-6 bg-stone-50 border-b flex-row justify-between items-center space-y-0 shrink-0">
              <SheetTitle className="flex items-center gap-3 text-xl font-black">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <ReceiptText size={20} />
                </div>
                {t('cart')}
              </SheetTitle>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500 rounded-full hover:bg-red-50" onClick={() => setCart([])}>
                <Trash2 size={18} />
              </Button>
            </SheetHeader>
            
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-3 py-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-stone-50/50 p-3 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors group">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-bold text-sm truncate">{isRTL ? item.name_ar : item.name}</p>
                      <CurrencyDisplay amountUsd={item.price * item.qty} size="xs" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border">
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-stone-50" onClick={() => updateCartQty(item.id, -1)}>
                         <Minus size={12} className="text-muted-foreground" />
                       </Button>
                       <span className="font-black w-5 text-center text-xs">{item.qty}</span>
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-stone-50" onClick={() => updateCartQty(item.id, 1)}>
                         <Plus size={12} className="text-primary" />
                       </Button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-60 flex flex-col items-center justify-center text-muted-foreground text-sm gap-4 opacity-40">
                    <div className="bg-stone-100 p-6 rounded-full">
                      <ShoppingCart size={40} />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-[10px]">{isRTL ? 'السلة فارغة' : 'Cart is empty'}</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 bg-stone-900 border-t space-y-5 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-stone-400 font-bold text-[9px] uppercase tracking-widest">{t('total')}</span>
                  <p className="text-white text-xs opacity-50">{cartCount} {isRTL ? 'أصناف' : 'items'}</p>
                </div>
                <CurrencyDisplay amountUsd={cartTotal} size="lg" className="items-end text-white" />
              </div>
              <Button 
                className="w-full h-14 rounded-2xl text-base font-black shadow-xl gap-3 transition-transform active:scale-95 bg-white text-stone-900 hover:bg-stone-100" 
                onClick={handleCheckout} 
                disabled={cart.length === 0}
              >
                <CreditCard size={18} /> {isRTL ? 'إكمال الدفع' : 'Complete Payment'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Small Product Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 pb-20">
          {filteredProducts.map((p: any) => {
            const inCart = cart.find(i => i.id === p.id);
            return (
              <button 
                key={p.id} 
                className={`bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-all text-center border-2 flex flex-col items-center group relative ${inCart ? 'border-primary' : 'border-transparent'}`}
                onClick={() => addToCart(p)}
              >
                <div className="aspect-square w-full rounded-lg bg-stone-50 mb-1.5 overflow-hidden relative">
                  <img src={p.image || '/placeholder.svg'} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                  {inCart && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                      <Badge className="bg-primary text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center p-0 border-2 border-white shadow-lg">
                        {inCart.qty}
                      </Badge>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-[10px] leading-tight line-clamp-2 w-full mb-1 h-6">{isRTL ? p.name_ar : p.name}</h4>
                <div className="mt-auto">
                   <CurrencyDisplay amountUsd={p.price} size="sm" className="items-center bg-primary/5 rounded-lg py-1 px-1.5" />
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default POS;