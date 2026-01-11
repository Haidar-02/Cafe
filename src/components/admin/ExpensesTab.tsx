"use client";

import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Archive, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ConfirmDialog from "../ConfirmDialog";

const ITEMS_PER_PAGE = 10;

interface ExpensesTabProps {
  onEdit: (item: any) => void;
  onNew: () => void;
  refresh: () => void;
}

export const ExpensesTab = ({ onEdit, onNew, refresh }: ExpensesTabProps) => {
  const { isRTL } = useRTL();
  const [search, setSearch] = useState("");
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: api.getExpenses });

  const handleDelete = async () => {
    if (deleteItem) {
      await api.deleteExpense(deleteItem.id);
      setDeleteItem(null);
      refresh();
    }
  };

  const sortedAndFiltered = useMemo(() => {
    let result = expenses.filter((e: any) => 
      e.title.toLowerCase().includes(search.toLowerCase()) || 
      e.category.toLowerCase().includes(search.toLowerCase())
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
  }, [expenses, search, sortConfig]);

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
        <h2 className="font-black text-lg self-start sm:self-center">{isRTL ? 'إدارة المصاريف' : 'Expense Management'}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
             <Search size={16} className={`${isRTL ? 'right-3' : 'left-3'} absolute top-1/2 -translate-y-1/2 text-muted-foreground`} />
             <Input placeholder={isRTL ? "بحث..." : "Search..."} className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl h-10`} value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button size="sm" className="rounded-xl h-10 px-4 bg-primary text-white" onClick={onNew}>
            <Plus size={16} className="mr-2" /> {isRTL ? 'جديد' : 'New'}
          </Button>
        </div>
      </div>
      
      {sortedAndFiltered.length === 0 ? (
        <div className="p-20 text-center text-muted-foreground bg-white rounded-3xl border-2 border-dashed">
          {isRTL ? 'لا توجد مصاريف' : 'No expenses found'}
        </div>
      ) : (
        <>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b">
                  <tr>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('title')}>
                      <div className="flex items-center justify-center gap-2">Title <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('category')}>
                      <div className="flex items-center justify-center gap-2">Category <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('date')}>
                      <div className="flex items-center justify-center gap-2">Date <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('amount')}>
                      <div className="flex items-center justify-center gap-2">Amount <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-center">
                  {paginated.map((e: any) => (
                    <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3 font-bold">{e.title}</td>
                      <td className="p-3">
                        <span className="bg-stone-100 text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-muted-foreground">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                         <CurrencyDisplay amountUsd={e.amount} size="sm" className="items-center" />
                      </td>
                      <td className="p-3 flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onEdit(e)}>
                          <Edit2 size={14}/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={async () => { 
                           await api.archiveExpense(e.id); 
                           refresh(); 
                        }}>
                          <Archive size={14}/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteItem(e)}>
                          <Trash2 size={14}/>
                        </Button>
                      </td>
                    </tr>
                  ))}
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
        title={isRTL ? "حذف المصروف؟" : "Delete Expense?"}
        description={isRTL ? `هل أنت متأكد من حذف ${deleteItem?.title}؟` : `Are you sure you want to delete ${deleteItem?.title}?`}
      />
    </div>
  );
};