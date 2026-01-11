"use client";

import React from 'react';
import { useRTL } from "@/lib/rtl-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, Play } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const Kitchen = () => {
  const { isRTL, t } = useRTL();
  const queryClient = useQueryClient();
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: api.getOrders });

  // Filter for orders that are NOT "ready" and NOT "cancelled"
  const activeOrders = orders.filter((o: any) => o.status !== 'ready' && o.status !== 'cancelled');

  const updateStatus = async (id: number, nextStatus: string) => {
    await api.updateOrderStatus(id, nextStatus);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    showSuccess(isRTL ? "تم تحديث الحالة" : "Status updated");
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center border-b border-stone-200 pb-4">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Clock className="text-primary" /> {t('kitchen')}
          <Badge variant="secondary" className="ml-2 rounded-full">{activeOrders.length}</Badge>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {activeOrders.map((order: any) => (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={order.id}>
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-4 bg-stone-50 border-b flex flex-row items-center justify-between">
                  <div>
                    <span className="text-2xl font-black">#{order.id}</span>
                    <p className="text-[10px] text-muted-foreground uppercase">{new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                  <Badge className="rounded-full" style={{ backgroundColor: order.color + '20', color: order.color }}>
                    {isRTL ? order.label_ar : order.label}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center border-b border-stone-50 pb-1">
                        <span className="text-sm font-bold">{item.qty}x</span>
                        <span className="text-sm">{isRTL ? (item.name_ar || item.name) : item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    {order.status === 'pending' && (
                      <Button className="w-full h-10 rounded-xl gap-2" variant="secondary" onClick={() => updateStatus(order.id, 'preparing')}>
                        <Play size={14} /> {isRTL ? 'بدء' : 'Start'}
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button className="w-full h-10 rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(order.id, 'ready')}>
                        <Check size={14} /> {isRTL ? 'جاهز' : 'Ready'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {activeOrders.length === 0 && (
            <div className="col-span-full p-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
              {isRTL ? 'لا توجد طلبات نشطة' : 'No active orders'}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Kitchen;