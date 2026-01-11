"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicIcon } from "../shared/DynamicIcon";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";

const ICON_LIST = [
  "Coffee", "Croissant", "Utensils", "Pizza", "IceCream", 
  "Wine", "Beer", "Milk", "Candy", "Cookie",
  "Soup", "Sandwich", "Cake", "Donut", "GlassWater",
  "CupSoda", "Dessert", "Popcorn", "Salad", "Egg",
  "Fish", "Ham", "Carrot", "Apple", "Cherry"
];

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  refresh: () => void;
}

export const CategoryModal = ({ open, onOpenChange, item, refresh }: CategoryModalProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await api.saveCategory({ id: item?.id, name: data.get('name'), name_ar: data.get('name_ar'), icon: data.get('icon') });
    onOpenChange(false);
    refresh();
    showSuccess("Category saved");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-white overflow-hidden max-w-sm w-[95vw] rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b shrink-0">
          <h2 className="text-xl font-black">Category Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <form className="p-8 space-y-4" id="catForm" onSubmit={handleSubmit}>
            <div className="space-y-1.5"><Label>Name (EN)</Label><Input name="name" defaultValue={item?.name} required className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Name (AR)</Label><Input name="name_ar" defaultValue={item?.name_ar} required className="rounded-xl text-right" /></div>
            <div className="space-y-1.5">
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {ICON_LIST.map(icon => (
                    <label key={icon} className="cursor-pointer group">
                      <input type="radio" name="icon" value={icon} defaultChecked={item?.icon === icon} className="hidden peer" />
                      <div className="p-2 border-2 rounded-lg peer-checked:border-primary peer-checked:bg-primary/10 transition-all flex items-center justify-center h-10 w-10">
                        <DynamicIcon name={icon} size={18} />
                      </div>
                    </label>
                  ))}
                </div>
            </div>
          </form>
        </div>
        <div className="p-6 border-t shrink-0">
          <Button form="catForm" type="submit" className="w-full h-11 rounded-xl shadow-lg">Save Category</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};