"use client";

import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { api } from "@/lib/api";
import ConfirmDialog from "../ConfirmDialog";

const ITEMS_PER_PAGE = 10;

interface UsersTabProps {
  users: any[];
  onEdit: (user: any) => void;
  onNew: () => void;
  refresh: () => void;
}

export const UsersTab = ({ users, onEdit, onNew, refresh }: UsersTabProps) => {
  const { isRTL } = useRTL();
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleDelete = async () => {
    if (deleteItem) {
      await api.deleteUser(deleteItem.id);
      setDeleteItem(null);
      refresh();
    }
  };

  const sortedUsers = useMemo(() => {
    let result = [...users];
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
  }, [users, sortConfig]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginated = sortedUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-black text-lg">{isRTL ? 'الموظفين' : 'Users Management'}</h2>
        <Button size="sm" className="rounded-xl h-10 px-4 bg-primary text-white" onClick={onNew}><Plus size={16} className="mr-2" /> {isRTL ? 'جديد' : 'New User'}</Button>
      </div>

      {users.length === 0 ? (
        <div className="p-20 text-center text-muted-foreground bg-white rounded-3xl border-2 border-dashed">
          {isRTL ? 'لا يوجد موظفين مسجلين' : 'No users registered'}
        </div>
      ) : (
        <>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b">
                  <tr>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('name')}>
                       <div className="flex items-center justify-center gap-2">Name <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center cursor-pointer hover:bg-stone-100" onClick={() => handleSort('username')}>
                       <div className="flex items-center justify-center gap-2">Username <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="p-3 text-center">Role</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-center">
                  {paginated.map((u: any) => (
                    <tr key={u.id}>
                      <td className="p-3 font-bold">{u.name}</td>
                      <td className="p-3 text-muted-foreground">@{u.username}</td>
                      <td className="p-3"><Badge variant="secondary" className="rounded-full">{u.role}</Badge></td>
                      <td className="p-3 flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(u)}><Edit2 size={14}/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteItem(u)}><Trash2 size={14}/></Button>
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
        title={isRTL ? "حذف الموظف؟" : "Delete Employee?"}
        description={isRTL ? `هل أنت متأكد من حذف ${deleteItem?.name}؟` : `Are you sure you want to delete ${deleteItem?.name}?`}
      />
    </div>
  );
};