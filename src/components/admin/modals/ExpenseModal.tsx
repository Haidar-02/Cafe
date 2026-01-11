"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  refresh: () => void;
}

export const ExpenseModal = ({ open, onOpenChange, item, refresh }: ExpenseModalProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    
    await api.saveExpense({
      id: item?.id,
      title: data.get('title') as string,
      amount: parseFloat(data.get('amount') as string) || 0,
      category: data.get('category') as string,
      date: data.get('date') as string
    });
    
    onOpenChange(false);
    refresh();
    showSuccess("Expense saved");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-white overflow-hidden max-w-sm w-[95vw] rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b shrink-0 bg-stone-50">
          <h2 className="text-xl font-black">{item ? 'Edit Expense' : 'New Expense'}</h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <form className="p-8 space-y-5" id="expenseForm" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Title / Description</Label>
              <Input name="title" defaultValue={item?.title} placeholder="e.g. Electricity bill" required className="rounded-xl h-11" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Amount ($)</Label>
              <Input name="amount" type="number" step="0.01" defaultValue={item?.amount} required className="rounded-xl h-11" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Category</Label>
              <Input name="category" placeholder="e.g. Repairs, Taxes, Utilities" defaultValue={item?.category} required className="rounded-xl h-11" />
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase opacity-60">Date</Label>
                <Input name="date" type="date" defaultValue={item?.date || new Date().toISOString().split('T')[0]} required className="rounded-xl h-11" />
            </div>
          </form>
        </div>
        <div className="p-6 border-t bg-stone-50/50 shrink-0">
          <Button form="expenseForm" type="submit" className="w-full h-14 rounded-2xl font-black shadow-lg">Save Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};