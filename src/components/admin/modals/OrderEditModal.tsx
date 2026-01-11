"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MinusCircle, PlusCircle, Trash2, Plus, Search } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

interface OrderEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  setOrder: (order: any) => void;
  refresh: () => void;
}

export const OrderEditModal = ({ open, onOpenChange, order, setOrder, refresh }: OrderEditModalProps) => {
  const { isRTL } = useRTL();
  const [productSearch, setProductSearch] = useState("");
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: api.getProducts, enabled: open });

  const filteredProducts = products.filter((p: any) => 
    (isRTL ? p.name_ar : p.name).toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order) return;
    const data = new FormData(e.currentTarget);
    const newTotal = order.items.reduce((s:number, i:any) => s + (i.price * i.qty), 0);
    await api.saveOrder({ ...order, total: newTotal });
    await api.updateOrderStatus(order.id, data.get('status') as string);
    onOpenChange(false);
    refresh();
    showSuccess("Order updated");
  };

  const updateItemQty = (idx: number, delta: number) => {
    const newItems = [...order.items];
    newItems[idx].qty = Math.max(1, newItems[idx].qty + delta);
    setOrder({ ...order, items: newItems });
  };

  const removeItem = (idx: number) => {
    const newItems = order.items.filter((_: any, i: number) => i !== idx);
    setOrder({ ...order, items: newItems });
  };

  const addProduct = (product: any) => {
    const existingIdx = order.items.findIndex((i: any) => i.product_id === product.id);
    if (existingIdx > -1) {
      updateItemQty(existingIdx, 1);
    } else {
      const newItem = {
        product_id: product.id,
        name: product.name,
        name_ar: product.name_ar,
        price: product.price,
        qty: 1
      };
      setOrder({ ...order, items: [...order.items, newItem] });
    }
    setProductSearch("");
    showSuccess(isRTL ? "تمت الإضافة" : "Added to order");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-white overflow-hidden max-w-md w-[95vw] rounded-[40px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
           <h2 className="text-xl font-black">Order #{order?.id}</h2>
           <Clock size={24} className="opacity-20" />
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 px-8 py-8">
          <form className="space-y-6" id="orderEditForm" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-60">Order Status</Label>
              <Select name="status" defaultValue={order?.status}>
                <SelectTrigger className="rounded-2xl h-12 bg-stone-50 border-none"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white rounded-2xl border shadow-xl">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase opacity-60">Add Products</Label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder={isRTL ? "بحث عن منتج لإضافته..." : "Search product to add..."} 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 rounded-2xl h-11 bg-stone-50 border-none"
                />
                {productSearch && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-2xl shadow-2xl p-2 space-y-1">
                    {filteredProducts.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addProduct(p)}
                        className="w-full text-left p-3 hover:bg-stone-50 rounded-xl transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <p className="text-sm font-bold">{isRTL ? p.name_ar : p.name}</p>
                          <p className="text-[10px] opacity-60">${p.price}</p>
                        </div>
                        <Plus size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="text-center p-4 text-xs text-muted-foreground italic">No products found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-60">Current Items</Label>
              <div className="bg-stone-50 p-4 rounded-3xl space-y-3 border">
                {order?.items.map((it:any, idx:number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-stone-200">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{isRTL ? it.name_ar : it.name}</p>
                        <p className="text-[10px] text-muted-foreground">${it.price} ea</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateItemQty(idx, -1)}>
                          <MinusCircle size={16} className="text-muted-foreground" />
                        </Button>
                        <span className="text-sm font-black w-6 text-center">{it.qty}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateItemQty(idx, 1)}>
                          <PlusCircle size={16} className="text-primary" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50" onClick={() => removeItem(idx)}>
                          <Trash2 size={14} />
                        </Button>
                    </div>
                  </div>
                ))}
                {order?.items.length === 0 && (
                   <div className="text-center py-6 text-muted-foreground text-xs italic">No items in order</div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t bg-stone-50/50 shrink-0">
          <div className="flex justify-between items-center mb-6">
             <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Grand Total:</span>
             <CurrencyDisplay amountUsd={order?.items.reduce((s:number, i:any) => s + (i.price * i.qty), 0) || 0} size="lg" className="items-end" />
          </div>
          <Button form="orderEditForm" type="submit" className="w-full rounded-2xl h-16 text-lg font-black shadow-xl" disabled={order?.items.length === 0}>
            Save All Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};