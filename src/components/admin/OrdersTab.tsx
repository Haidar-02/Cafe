"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Trash2, ChevronLeft, ChevronRight, CheckCircle2, CreditCard, Edit2, Archive } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { api } from "@/lib/api";
import ConfirmDialog from "../ConfirmDialog";

interface OrdersTabProps {
  paginatedOrders: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  orderDateFilter: boolean;
  setOrderDateFilter: (f: boolean) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (s: string) => void;
  orderPage: number;
  totalOrderPages: number;
  setOrderPage: (p: number | ((prev: number) => number)) => void;
  onEdit: (order: any) => void;
  refresh: () => void;
  isAdmin: boolean;
}

export const OrdersTab = ({
  paginatedOrders,
  searchQuery,
  setSearchQuery,
  orderDateFilter,
  setOrderDateFilter,
  orderStatusFilter,
  setOrderStatusFilter,
  orderPage,
  totalOrderPages,
  setOrderPage,
  onEdit,
  refresh,
  isAdmin
}: OrdersTabProps) => {
  const { isRTL } = useRTL();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmState, setConfirmState] = useState<{ type: 'bulk' | 'all' | 'delete-all' | 'single' | null, data?: any }>({ type: null });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleConfirmed = async () => {
    if (confirmState.type === 'bulk') {
      await api.archiveOrders(selectedIds);
      setSelectedIds([]);
    } else if (confirmState.type === 'all') {
      await api.archiveAllOrders();
    } else if (confirmState.type === 'delete-all') {
      await api.clearOrders();
    } else if (confirmState.type === 'single') {
      await api.deleteOrder(confirmState.data);
    }
    setConfirmState({ type: null });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative w-full">
          <Search size={16} className={`${isRTL ? 'right-3' : 'left-3'} absolute top-1/2 -translate-y-1/2 text-muted-foreground`} />
          <Input placeholder={isRTL ? "رقم الطلب..." : "Order ID..."} className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl h-10`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant={orderDateFilter ? 'default' : 'outline'} size="sm" className="rounded-xl h-10 gap-2" onClick={() => setOrderDateFilter(!orderDateFilter)}>
            <Calendar size={14} /> {isRTL ? 'اليوم' : 'Today'}
          </Button>
          <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
            <SelectTrigger className="h-10 rounded-xl text-xs min-w-[120px] w-auto"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block" />
          <Button variant="outline" size="sm" className="rounded-xl h-10 text-primary gap-2" onClick={() => setConfirmState({ type: 'bulk' })} disabled={selectedIds.length === 0}>
            <Archive size={14} /> {isRTL ? 'أرشفة المختار' : 'Archive Selected'}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl h-10 text-primary gap-2" onClick={() => setConfirmState({ type: 'all' })}>
            <Archive size={14} /> {isRTL ? 'أرشفة الكل' : 'Archive All'}
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" className="rounded-xl h-10 text-red-500 hover:bg-red-50 gap-2" onClick={() => setConfirmState({ type: 'delete-all' })}>
              <Trash2 size={14} /> {isRTL ? 'حذف السجل' : 'Delete All'}
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b">
              <tr>
                <th className="p-3"></th>
                {['Order', 'Time', 'Status', 'Payment', 'Total', 'Action'].map((c, i) => (
                  <th key={i} className="p-3 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y text-center">
              {paginatedOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-stone-50">
                  <td className="p-3">
                    <Checkbox checked={selectedIds.includes(o.id)} onCheckedChange={() => toggleSelect(o.id)} className="rounded-md" />
                  </td>
                  <td className="p-3 font-bold">#{o.id}</td>
                  <td className="p-3 text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3"><Badge className="rounded-full text-[10px]" style={{ backgroundColor: o.color + '20', color: o.color }}>{isRTL ? o.label_ar : o.label}</Badge></td>
                  <td className="p-3">
                     <button 
                       onClick={async () => { await api.updateOrderPayment(o.id, o.payment_status === 'paid' ? 'unpaid' : 'paid'); refresh(); }}
                       className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors flex items-center gap-1 mx-auto ${o.payment_status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                     >
                       {o.payment_status === 'paid' ? <CheckCircle2 size={10} /> : <CreditCard size={10} />}
                       {o.payment_status === 'paid' ? (isRTL ? 'مدفوع' : 'Paid') : (isRTL ? 'غير مدفوع' : 'Unpaid')}
                     </button>
                  </td>
                  <td className="p-3"><CurrencyDisplay amountUsd={o.total} size="sm" className="items-center" /></td>
                  <td className="p-3 flex justify-center gap-1.5">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onEdit(o)}><Edit2 size={14}/></Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={async () => { await api.archiveOrder(o.id); refresh(); }}><Archive size={14}/></Button>
                     {isAdmin && (
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => setConfirmState({ type: 'single', data: o.id })}><Trash2 size={14}/></Button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {totalOrderPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button variant="outline" size="sm" disabled={orderPage === 1} onClick={() => setOrderPage(p => p - 1)} className="rounded-xl"><ChevronLeft size={16} /></Button>
          <span className="text-xs font-bold">{orderPage} / {totalOrderPages}</span>
          <Button variant="outline" size="sm" disabled={orderPage === totalOrderPages} onClick={() => setOrderPage(p => p + 1)} className="rounded-xl"><ChevronRight size={16} /></Button>
        </div>
      )}

      <ConfirmDialog 
        open={confirmState.type !== null}
        onOpenChange={(open) => !open && setConfirmState({ type: null })}
        onConfirm={handleConfirmed}
        title={
          confirmState.type === 'delete-all' || confirmState.type === 'single' ? (isRTL ? "حذف الطلب؟" : "Delete Order?") : (isRTL ? "أرشفة الطلبات؟" : "Archive Orders?")
        }
        description={
          confirmState.type === 'bulk' ? (isRTL ? `هل تريد أرشفة ${selectedIds.length} طلب؟` : `Archive ${selectedIds.length} orders?`) :
          confirmState.type === 'all' ? (isRTL ? 'أرشفة جميع الطلبات النشطة؟' : 'Archive all active orders?') :
          confirmState.type === 'single' ? (isRTL ? `هل تريد حذف الطلب رقم #${confirmState.data}؟` : `Are you sure you want to delete order #${confirmState.data}?`) :
          (isRTL ? 'سيتم حذف جميع سجلات الطلبات نهائياً.' : 'This will permanently delete all order history.')
        }
      />
    </div>
  );
};