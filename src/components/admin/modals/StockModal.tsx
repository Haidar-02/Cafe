"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";

interface StockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  refresh: () => void;
}

export const StockModal = ({ open, onOpenChange, item, refresh }: StockModalProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    
    await api.saveStockItem({
      id: item?.id,
      name: data.get('name') as string,
      qty: parseFloat(data.get('qty') as string) || 0,
      price: parseFloat(data.get('price') as string) || 0,
      price_qty: parseFloat(data.get('price_qty') as string) || 1,
      unit: data.get('unit') as string,
      low_stock_threshold: parseFloat(data.get('threshold') as string) || 0
    });
    
    onOpenChange(false);
    refresh();
    showSuccess("Stock updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-white overflow-hidden max-w-sm w-[95vw] rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b shrink-0 bg-stone-50">
          <h2 className="text-xl font-black">{item ? 'Edit Stock Item' : 'New Stock Item'}</h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <form className="p-8 space-y-5" id="stockForm" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Item Name</Label>
              <Input name="name" defaultValue={item?.name} required className="rounded-xl h-11" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase opacity-60">Current Qty</Label>
                  <Input name="qty" type="number" step="0.01" defaultValue={item?.qty} required className="rounded-xl h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase opacity-60">Unit</Label>
                  <Input name="unit" placeholder="e.g. liter, grams" defaultValue={item?.unit} required className="rounded-xl h-11" />
                </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Pricing Criteria</Label>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold opacity-60">Price ($)</Label>
                    <Input name="price" type="number" step="0.01" defaultValue={item?.price} className="rounded-xl h-10 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold opacity-60">Per Quantity</Label>
                    <Input name="price_qty" type="number" step="0.01" defaultValue={item?.price_qty || 1} className="rounded-xl h-10 bg-white" />
                  </div>
               </div>
               <p className="text-[9px] text-muted-foreground italic px-1">
                 This will define the value as e.g. "6$ per 2.5 liter"
               </p>
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase opacity-60">Low Stock Alert Threshold</Label>
                <Input name="threshold" type="number" step="0.01" defaultValue={item?.low_stock_threshold || 5} required className="rounded-xl h-11" />
            </div>
          </form>
        </div>
        <div className="p-6 border-t bg-stone-50/50 shrink-0">
          <Button form="stockForm" type="submit" className="w-full h-14 rounded-2xl font-black shadow-lg">Save Item</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};