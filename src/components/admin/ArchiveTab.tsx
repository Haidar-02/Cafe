"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Trash2, RotateCcw, History, Receipt, ArchiveX } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { AdminTableHeader } from "./shared/AdminTableHeader";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ConfirmDialog from "../ConfirmDialog";

const ITEMS_PER_PAGE = 10;

interface ArchiveTabProps {
  archivedOrders: any[];
  archivedExpenses: any[];
  refresh: () => void;
}

export const ArchiveTab = ({ archivedOrders, archivedExpenses, refresh }: ArchiveTabProps) => {
  const { isRTL } = useRTL();
  const [view, setView] = useState<"orders" | "expenses">("orders");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const currentData = view === "orders" ? archivedOrders : archivedExpenses;
  const filtered = currentData.filter(item => 
    view === "orders" 
      ? String(item.id).includes(search)
      : (item.title?.toLowerCase().includes(search.toLowerCase()) || item.category?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleUnarchive = async (id: number) => {
    if (view === "orders") {
      await api.unarchiveOrder(id);
    } else {
      await api.unarchiveExpense(id);
    }
    refresh();
    showSuccess(isRTL ? "تم الاسترجاع" : "Item unarchived");
  };

  const handleDelete = async () => {
    if (deleteItem) {
      if (view === "orders") {
        await api.deleteOrder(deleteItem.id);
      } else {
        await api.deleteExpense(deleteItem.id);
      }
      setDeleteItem(null);
      refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-black text-lg self-start">{isRTL ? 'الأرشيف' : 'System Archive'}</h2>
          <Tabs value={view} onValueChange={(v: any) => { setView(v); setPage(1); setSearch(""); }}>
            <TabsList className="bg-stone-100 rounded-xl h-9 p-1">
              <TabsTrigger value="orders" className="rounded-lg text-[10px] font-black h-7 gap-1">
                <History size={12} /> {isRTL ? 'الطلبات' : 'Orders'}
              </TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-lg text-[10px] font-black h-7 gap-1">
                <Receipt size={12} /> {isRTL ? 'المصاريف' : 'Expenses'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="relative w-full max-w-xs">
           <Search size={16} className={`${isRTL ? 'right-3' : 'left-3'} absolute top-1/2 -translate-y-1/2 text-muted-foreground`} />
           <Input placeholder={isRTL ? "بحث في الأرشيف..." : "Search archive..."} className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl h-10`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-stone-200">
           <div className="bg-stone-50 p-6 rounded-full mb-4 text-stone-300">
              <ArchiveX size={48} />
           </div>
           <h3 className="text-lg font-black text-stone-600 mb-1">{isRTL ? 'لا توجد سجلات' : 'No Records Found'}</h3>
           <p className="text-sm text-stone-400 max-w-[280px]">
              {isRTL ? 'لم يتم العثور على أي بيانات مؤرشفة تطابق بحثك حالياً.' : 'We couldn\'t find any archived data matching your search criteria.'}
           </p>
        </div>
      ) : (
        <>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <AdminTableHeader cols={view === "orders" ? ['Order', 'Date', 'Status', 'Total', 'Action'] : ['Expense', 'Category', 'Date', 'Amount', 'Action']} />
                <tbody className="divide-y text-center">
                  {paginated.map((item: any) => (
                    <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                      {view === "orders" ? (
                        <>
                          <td className="p-3 font-bold">#{item.id}</td>
                          <td className="p-3 text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="p-3"><Badge variant="outline" className="rounded-full text-[10px]">{isRTL ? item.label_ar : item.label}</Badge></td>
                          <td className="p-3"><CurrencyDisplay amountUsd={item.total} size="sm" className="items-center" /></td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-bold">{item.title}</td>
                          <td className="p-3"><span className="text-[10px] font-bold opacity-60 uppercase">{item.category}</span></td>
                          <td className="p-3 text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="p-3"><CurrencyDisplay amountUsd={item.amount} size="sm" className="items-center" /></td>
                        </>
                      )}
                      <td className="p-3 flex justify-center gap-1.5">
                         <Tooltip delayDuration={0}>
                           <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleUnarchive(item.id)}>
                                <RotateCcw size={14} />
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent className="bg-stone-900 text-white rounded-lg text-[10px] font-bold">
                             {isRTL ? "استعادة" : "Restore"}
                           </TooltipContent>
                         </Tooltip>

                         <Tooltip delayDuration={0}>
                           <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteItem(item)}>
                                <Trash2 size={14} />
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent className="bg-red-600 text-white rounded-lg text-[10px] font-bold border-none">
                             {isRTL ? "حذف نهائي" : "Delete Permanently"}
                           </TooltipContent>
                         </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl"><ChevronLeft size={16} /></Button>
              <span className="text-xs font-bold">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl"><ChevronRight size={16} /></Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog 
        open={!!deleteItem} 
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        title={isRTL ? "حذف نهائي؟" : "Permanent Delete?"}
        description={isRTL ? "سيتم حذف هذا السجل نهائياً من الأرشيف." : "This record will be permanently removed from the archive."}
      />
    </div>
  );
};