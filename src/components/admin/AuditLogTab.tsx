"use client";

import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ShieldAlert, History } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ConfirmDialog from "../ConfirmDialog";
import { showSuccess } from "@/utils/toast";

const ITEMS_PER_PAGE = 15;

export const AuditLogTab = () => {
  const { isRTL } = useRTL();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: logs = [], refetch } = useQuery({ 
    queryKey: ['audit-logs'], 
    queryFn: api.getLogs,
    refetchInterval: 10000 // Auto refresh logs every 10s
  });

  const filtered = useMemo(() => {
    let result = logs.filter((l: any) => 
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDir === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [logs, search, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleClear = async () => {
    await api.clearLogs();
    setClearConfirm(false);
    refetch();
    showSuccess(isRTL ? "تم مسح السجلات" : "Logs cleared");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <History size={20} />
          </div>
          <h2 className="font-black text-lg">{isRTL ? 'سجل العمليات' : 'Audit Logs'}</h2>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
             <Search size={16} className={`${isRTL ? 'right-3' : 'left-3'} absolute top-1/2 -translate-y-1/2 text-muted-foreground`} />
             <Input 
                placeholder={isRTL ? "بحث في السجلات..." : "Search logs..."} 
                className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl h-10`} 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
             />
          </div>
          <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 text-red-500 hover:bg-red-50 gap-2 font-bold" onClick={() => setClearConfirm(true)}>
            <Trash2 size={16} /> {isRTL ? 'مسح' : 'Clear'}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-20 text-center text-muted-foreground bg-white rounded-3xl border-2 border-dashed flex flex-col items-center gap-3">
          <ShieldAlert size={48} className="opacity-20" />
          <p className="font-bold">{isRTL ? 'لا توجد سجلات حالياً' : 'No audit logs found'}</p>
        </div>
      ) : (
        <>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-stone-50 border-b">
                  <tr>
                    <th className="p-4 text-center cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                       <div className="flex items-center justify-center gap-1.5 uppercase tracking-wider font-black text-muted-foreground">
                         Time <ArrowUpDown size={12} />
                       </div>
                    </th>
                    <th className="p-4 text-center uppercase tracking-wider font-black text-muted-foreground">User</th>
                    <th className="p-4 text-center uppercase tracking-wider font-black text-muted-foreground">Action</th>
                    <th className="p-4 text-left uppercase tracking-wider font-black text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-center">
                  {paginated.map((l: any) => (
                    <tr key={l.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-4">
                        <span className="bg-stone-100 px-2.5 py-1 rounded-full font-bold">
                          {l.user_name}
                        </span>
                      </td>
                      <td className="p-4">
                         <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter ${
                            l.action.includes('Delete') || l.action.includes('Clear') ? 'bg-red-50 text-red-600' :
                            l.action.includes('Create') ? 'bg-green-50 text-green-600' :
                            'bg-blue-50 text-blue-600'
                         }`}>
                           {l.action}
                         </span>
                      </td>
                      <td className="p-4 text-left text-muted-foreground italic max-w-xs truncate">
                        {l.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl"><ChevronLeft size={16} /></Button>
              <span className="text-xs font-bold">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl"><ChevronRight size={16} /></Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog 
        open={clearConfirm} 
        onOpenChange={setClearConfirm}
        onConfirm={handleClear}
        title={isRTL ? "مسح السجل بالكامل؟" : "Clear Entire Audit Log?"}
        description={isRTL ? "هذا الإجراء سيحذف جميع سجلات العمليات السابقة نهائياً." : "This will permanently delete all recorded user actions from history."}
      />
    </div>
  );
};