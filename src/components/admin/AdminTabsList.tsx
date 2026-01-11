"use client";

import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, ChefHat, History, Archive, Package, Truck, Users, BarChart3, Settings, Receipt, ShieldCheck } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface AdminTabsListProps {
  isAdmin: boolean;
}

export const AdminTabsList = ({ isAdmin }: AdminTabsListProps) => {
  const { isRTL } = useRTL();
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: api.getOrders, refetchInterval: 5000 });
  
  const activeOrdersCount = orders.filter((o: any) => o.status !== 'ready' && o.status !== 'cancelled').length;

  return (
    <div className="bg-white border-b px-2 overflow-x-auto scrollbar-hide">
      <TabsList className="bg-transparent h-12 gap-1 flex justify-start min-w-max px-2">
        <TabsTrigger value="pos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
          <ShoppingBag size={14} className="mr-1.5" /> POS
        </TabsTrigger>
        <TabsTrigger value="kitchen" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs relative">
          <ChefHat size={14} className="mr-1.5" /> 
          {isRTL ? 'المطبخ' : 'Kitchen'}
          {activeOrdersCount > 0 && (
            <Badge className="ml-1.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[9px] flex items-center justify-center animate-pulse border-none">
              {activeOrdersCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
          <History size={14} className="mr-1.5" /> {isRTL ? 'الطلبات' : 'Orders'}
        </TabsTrigger>
        
        {isAdmin && (
          <>
            <TabsTrigger value="products" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
              <Package size={14} className="mr-1.5" /> {isRTL ? 'المنتجات' : 'Products'}
            </TabsTrigger>
            <TabsTrigger value="stock" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
              <Truck size={14} className="mr-1.5" /> {isRTL ? 'المخزون' : 'Stock'}
            </TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
              <Receipt size={14} className="mr-1.5" /> {isRTL ? 'المصاريف' : 'Expenses'}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
              <Users size={14} className="mr-1.5" /> {isRTL ? 'الموظفين' : 'Users'}
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
              <BarChart3 size={14} className="mr-1.5" /> {isRTL ? 'إحصائيات' : 'Stats'}
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
              <ShieldCheck size={14} className="mr-1.5" /> {isRTL ? 'السجلات' : 'Logs'}
            </TabsTrigger>
            <TabsTrigger value="prefs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
              <Settings size={14} className="mr-1.5" /> {isRTL ? 'إعدادات' : 'Settings'}
            </TabsTrigger>
          </>
        )}
        <TabsTrigger value="archive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-3 font-bold text-xs">
          <Archive size={14} className="mr-1.5" /> {isRTL ? 'الأرشيف' : 'Archive'}
        </TabsTrigger>
      </TabsList>
    </div>
  );
};