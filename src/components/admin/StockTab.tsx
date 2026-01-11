"use client";

import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, AlertTriangle, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { AdminTableHeader } from "./shared/AdminTableHeader";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import ConfirmDialog from "../ConfirmDialog";

const ITEMS_PER_PAGE = 10;

interface StockTabProps {
  stock: any[];
  onEdit: (item: any) => void;
  onNew: () => void;
  refresh: () => void;
}

export const StockTab = ({ stock, onEdit, onNew, refresh }: StockTabProps) => {
  const { isRTL } = useRTL();
  const [search, setSearch] = useState("");
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleDelete = async () => {
    if (deleteItem) {
      await api.deleteStockItem(deleteItem.id);
      setDeleteItem(null);
      refresh();
    }
  };

  const sortedAndFiltered = useMemo(() => {
    let result = stock.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [stock, search, sortConfig]);

  const totalPages = Math.ceil(sortedAndFiltered.length / ITEMS_PER_PAGE);
  const paginated = sortedAndFiltered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="font-black text-lg self-start sm:self-center">{isRTL ? 'إدارة المخزون' : 'Stock Management'}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
             <Search size={16} className={`${isRTL ? 'right-3' : 'left-3'} absolute top-1/2 -translate-y-1/2 text-muted-foreground`} />
             <Input 
                placeholder={isRTL ? "بحث في المخزون..." : "Search stock..."} 
                className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl h-10`} 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
             />
          </div>
          <Button size="sm" className="rounded-xl h-10 px-4 bg-primary text-white" onClick={onNew}>
            <Plus size={16} className="mr-2" /> {isRTL ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </div>
      
      {sortedAndFiltered.length === 0 ? (
        <div className="p-20 text-center text-muted-foreground bg-white rounded-3xl border-2 border-dashed">
          {isRTL ? 'لا توجد أصناف في المخزن' : 'No items found in stock'}
        </div>
      ) : (
        <>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b">
                  <tr>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('name')}>
                       <div className="flex items-center justify-center gap-2">Item <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('qty')}>
                       <div className="flex items-center justify-center gap-2">Quantity <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center">Cost Criteria</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-center">
                  {paginated.map((s: any) => {
                    const isLow = s.qty <= (s.low_stock_threshold || 0);
                    return (
                      <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 font-bold">{s.name}</td>
                        <td className="p-3">
                          <div className="flex flex-col items-center">
                            <span className={isLow ? 'text-red-600 font-black text-base' : 'font-bold text-base'}>
                              {s.qty}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">{s.unit}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {s.price ? (
                            <div className="text-[11px] font-bold text-primary bg-primary/5 rounded-lg px-2 py-1 inline-block">
                              {s.price}$ per {s.price_qty || 1} {s.unit}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-3">
                           {isLow ? (
                             <div className="flex items-center justify-center gap-1 text-red-500 font-bold text-[10px]">
                                <AlertTriangle size={12} /> {isRTL ? 'مخزون منخفض' : 'Low Stock'}
                             </div>
                           ) : (
                             <span className="text-green-500 font-bold text-[10px] uppercase">{isRTL ? 'متوفر' : 'In Stock'}</span>
                           )}
                        </td>
                        <td className="p-3 flex justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onEdit(s)}>
                            <Edit2 size={14}/>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteItem(s)}>
                            <Trash2 size={14}/>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-xl"><ChevronLeft size={16} /></Button>
              <span className="text-xs font-bold">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rounded-xl"><ChevronRight size={16} /></Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog 
        open={!!deleteItem} 
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        title={isRTL ? "حذف من المخزون؟" : "Delete from Stock?"}
        description={isRTL ? `هل أنت متأكد من حذف ${deleteItem?.name}؟` : `Are you sure you want to delete ${deleteItem?.name}?`}
      />
    </div>
  );
};