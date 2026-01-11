"use client";

import React, { useState } from 'react';
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { DynamicIcon } from "./shared/DynamicIcon";
import { api } from "@/lib/api";
import ConfirmDialog from "../ConfirmDialog";

interface PrefsTabProps {
  settings: any;
  categories: any[];
  onEditCat: (cat: any) => void;
  onNewCat: () => void;
  refresh: () => void;
}

export const PrefsTab = ({ settings, categories, onEditCat, onNewCat, refresh }: PrefsTabProps) => {
  const { isRTL } = useRTL();
  const [deleteCat, setDeleteCat] = useState<any>(null);

  const handleDelete = async () => {
    if (deleteCat) {
      await api.deleteCategory(deleteCat.id);
      setDeleteCat(null);
      refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 rounded-3xl bg-white border-none shadow-sm">
        <CardTitle className="text-lg mb-4">System Settings</CardTitle>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Exchange Rate (1 USD = ? LBP)</Label>
            <Input 
              type="number" 
              defaultValue={settings?.exchangeRate} 
              onBlur={async (e) => { 
                await api.saveSettings({ ...settings, exchangeRate: parseInt(e.target.value) }); 
                refresh(); 
              }} 
              className="rounded-xl" 
            />
          </div>
        </div>
      </Card>
      
      <Card className="p-6 rounded-3xl bg-white border-none shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-lg">Categories</CardTitle>
          <Button size="xs" variant="outline" className="rounded-lg" onClick={onNewCat}><Plus size={12}/> {isRTL ? 'جديد' : 'Add'}</Button>
        </div>
        <div className="space-y-2">
          {categories.map((c:any) => (
            <div key={c.id} className="flex items-center justify-between p-2 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2">
                <DynamicIcon name={c.icon} />
                <span className="text-sm font-bold">{isRTL ? c.name_ar : c.name}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditCat(c)}><Edit2 size={12}/></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteCat(c)}><Trash2 size={12}/></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ConfirmDialog 
        open={!!deleteCat} 
        onOpenChange={(open) => !open && setDeleteCat(null)}
        onConfirm={handleDelete}
        title={isRTL ? "حذف الفئة؟" : "Delete Category?"}
        description={isRTL ? `هل أنت متأكد من حذف فئة ${deleteCat?.name_ar || deleteCat?.name}؟` : `Are you sure you want to delete ${deleteCat?.name}?`}
      />
    </div>
  );
};