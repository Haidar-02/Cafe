"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit2, Trash2, LayoutGrid, List, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { api } from "@/lib/api";
import ConfirmDialog from "../ConfirmDialog";

const ITEMS_PER_PAGE = 20;

interface ProductsTabProps {
  products: any[];
  categories: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  catFilter: string;
  setCatFilter: (f: string) => void;
  onEdit: (product: any) => void;
  onNew: () => void;
  refresh: () => void;
}

export const ProductsTab = ({
  products,
  categories,
  searchQuery,
  setSearchQuery,
  catFilter,
  setCatFilter,
  onEdit,
  onNew,
  refresh
}: ProductsTabProps) => {
  const { isRTL } = useRTL();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleDelete = async () => {
    if (deleteItem) {
      await api.deleteProduct(deleteItem.id);
      setDeleteItem(null);
      refresh();
    }
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let result = products.filter((p: any) => {
      const catMatch = catFilter === 'all' || String(p.category_id) === catFilter;
      const searchMatch = (isRTL ? p.name_ar : p.name).toLowerCase().includes(searchQuery.toLowerCase());
      return catMatch && searchMatch;
    });

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
  }, [products, catFilter, searchQuery, isRTL, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedAndFilteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="flex flex-1 gap-2 w-full">
          <div className="relative flex-1">
            <Search size={14} className={`${isRTL ? 'right-3' : 'left-3'} absolute top-1/2 -translate-y-1/2 text-muted-foreground`} />
            <Input placeholder={isRTL ? "بحث..." : "Search..."} className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl h-9 text-xs`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="h-9 rounded-xl text-[10px] min-w-[120px] w-auto bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{isRTL ? c.name_ar : c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex bg-stone-100 p-1 rounded-xl">
             <Button variant={viewMode === 'grid' ? 'white' : 'ghost'} size="icon" className="h-7 w-7 rounded-lg shadow-sm" onClick={() => setViewMode('grid')}><LayoutGrid size={14}/></Button>
             <Button variant={viewMode === 'table' ? 'white' : 'ghost'} size="icon" className="h-7 w-7 rounded-lg shadow-sm" onClick={() => setViewMode('table')}><List size={14}/></Button>
          </div>
          <Button size="sm" className="rounded-xl h-9 px-4 bg-primary text-white flex-1 md:flex-initial text-xs" onClick={onNew}>
            <Plus size={14} className="mr-1.5" /> {isRTL ? 'جديد' : 'New'}
          </Button>
        </div>
      </div>

      {sortedAndFilteredProducts.length === 0 ? (
        <div className="p-20 text-center text-muted-foreground bg-white rounded-3xl border-2 border-dashed">
          {isRTL ? 'لم يتم العثور على منتجات' : 'No products found'}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {paginatedProducts.map((p: any) => (
                <Card key={p.id} className="rounded-xl border-none shadow-sm overflow-hidden group bg-white hover:ring-2 hover:ring-primary/20 transition-all flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-stone-50">
                    <img src={p.image || '/placeholder.svg'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 px-1">
                      <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg bg-white/95 text-blue-600" onClick={() => onEdit(p)}><Edit2 size={12} /></Button>
                      <Button variant="destructive" size="icon" className="h-7 w-7 rounded-lg bg-red-500" onClick={() => setDeleteItem(p)}><Trash2 size={12} /></Button>
                    </div>
                  </div>
                  <CardContent className="p-2 space-y-1 text-center flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-[10px] leading-tight truncate w-full">{isRTL ? p.name_ar : p.name}</h3>
                    <CurrencyDisplay amountUsd={p.price} size="sm" className="items-center bg-stone-50 rounded-lg py-1 px-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
               <div className="overflow-x-auto">
                 <table className="w-full text-xs">
                   <thead className="bg-stone-50 border-b">
                     <tr>
                       <th className="p-2.5 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('name')}>
                         <div className="flex items-center justify-center gap-1.5">Name <ArrowUpDown size={10}/></div>
                       </th>
                       <th className="p-2.5 text-center">Category</th>
                       <th className="p-2.5 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('price')}>
                         <div className="flex items-center justify-center gap-1.5">Price <ArrowUpDown size={10}/></div>
                       </th>
                       <th className="p-2.5 text-center">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y text-center">
                     {paginatedProducts.map((p: any) => (
                       <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                         <td className="p-2.5">
                           <div className="flex items-center gap-2 justify-center">
                             <img src={p.image || '/placeholder.svg'} className="w-6 h-6 rounded-md object-cover" />
                             <span className="font-bold">{isRTL ? p.name_ar : p.name}</span>
                           </div>
                         </td>
                         <td className="p-2.5">
                           <span className="text-[9px] font-black uppercase bg-stone-100 px-1.5 py-0.5 rounded-md">
                             {categories.find(c => c.id === p.category_id)?.[isRTL ? 'name_ar' : 'name'] || '-'}
                           </span>
                         </td>
                         <td className="p-2.5"><CurrencyDisplay amountUsd={p.price} size="sm" className="items-center bg-stone-50 rounded-lg py-1 px-2 inline-flex" /></td>
                         <td className="p-2.5 flex justify-center gap-1.5">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={() => onEdit(p)}><Edit2 size={12}/></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteItem(p)}><Trash2 size={12}/></Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button variant="outline" size="xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-lg h-8"><ChevronLeft size={14} /></Button>
              <span className="text-[10px] font-bold">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rounded-lg h-8"><ChevronRight size={14} /></Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog 
        open={!!deleteItem} 
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        title={isRTL ? "حذف المنتج؟" : "Delete Product?"}
        description={isRTL ? `هل أنت متأكد من حذف ${deleteItem?.name_ar || deleteItem?.name}؟` : `Are you sure you want to delete ${deleteItem?.name}?`}
      />
    </div>
  );
};