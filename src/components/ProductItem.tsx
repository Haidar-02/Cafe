"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useRTL } from "@/lib/rtl-context";

interface ProductItemProps {
  product: any;
  categories: any[];
  onAddToCart: (product: any) => void;
  t: (key: string) => string;
}

export const ProductItem = ({ product, categories, onAddToCart, t }: ProductItemProps) => {
  const { isRTL } = useRTL();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[24px] md:rounded-[32px] overflow-hidden group bg-white">
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          <motion.img 
            src={product.image || '/placeholder.svg'} 
            className="object-cover w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute bottom-2 right-2 md:bottom-3 md:right-3 p-2 bg-white/90 backdrop-blur rounded-xl md:rounded-2xl shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <Info size={16} className="text-primary md:size-[18px]" />
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-[32px] md:rounded-[40px] max-w-[95vw] md:max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl">
              <div className="aspect-video relative">
                 <img src={product.image || '/placeholder.svg'} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5 md:p-6">
                    <h2 className="text-xl md:text-2xl font-black text-white">{isRTL ? product.name_ar : product.name}</h2>
                 </div>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                   <Badge variant="secondary" className="rounded-full px-3 md:px-4 h-7 md:h-8 text-[10px] md:text-xs">{categories.find(c => c.id === product.category_id)?.[isRTL ? 'name_ar' : 'name']}</Badge>
                   <CurrencyDisplay amountUsd={product.price} size="lg" className="items-end" />
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{isRTL ? product.description_ar : product.description}</p>
                <Button className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl text-base md:text-lg font-black" onClick={() => onAddToCart(product)}>
                  {t('add_to_cart')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent className="p-3 md:p-5 space-y-3 md:space-y-4">
          <div className="min-h-[40px] md:min-h-0">
             <h3 className="font-bold text-sm md:text-lg leading-tight truncate">{isRTL ? product.name_ar : product.name}</h3>
             <CurrencyDisplay amountUsd={product.price} size="xs" className="md:hidden" />
             <CurrencyDisplay amountUsd={product.price} size="sm" className="hidden md:flex" />
          </div>
          <Button className="w-full rounded-xl md:rounded-2xl h-9 md:h-11 text-xs md:text-sm font-bold shadow-sm md:group-hover:bg-primary md:group-hover:text-white transition-colors" onClick={() => onAddToCart(product)}>
            {t('add_to_cart')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};