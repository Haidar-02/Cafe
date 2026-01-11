"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { showSuccess } from "@/utils/toast";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  refresh: () => void;
}

export const UserModal = ({ open, onOpenChange, item, refresh }: UserModalProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await api.saveUser({
      id: item?.id,
      name: data.get('name'),
      username: data.get('username'),
      password: data.get('password'),
      role: data.get('role'),
      salary: parseFloat(data.get('salary') as string) || 0
    });
    onOpenChange(false);
    refresh();
    showSuccess("User saved");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-white overflow-hidden max-w-sm w-[95vw] rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b shrink-0 bg-stone-50">
          <h2 className="text-xl font-black">{item ? 'Edit Employee' : 'New Employee'}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          <form className="p-8 space-y-5" id="userForm" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Full Name</Label>
              <Input name="name" defaultValue={item?.name} required className="rounded-xl h-11" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Username</Label>
              <Input name="username" defaultValue={item?.username} required className="rounded-xl h-11" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Monthly Salary ($)</Label>
              <Input name="salary" type="number" step="0.01" defaultValue={item?.salary} className="rounded-xl h-11" />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">Password {item && '(Leave empty to keep current)'}</Label>
              <Input name="password" type="password" className="rounded-xl h-11" />
            </div>
            
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase opacity-60">Role</Label>
                <Select name="role" defaultValue={item?.role || 'cashier'}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-xl">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t bg-stone-50/50 shrink-0">
          <Button form="userForm" type="submit" className="w-full h-14 rounded-2xl font-black shadow-lg">
            Save Employee
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};