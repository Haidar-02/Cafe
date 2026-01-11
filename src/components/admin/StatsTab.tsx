"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useRTL } from "@/lib/rtl-context";
import { Wallet, Receipt, Users, PackageOpen, Filter, Settings2, Banknote, BarChart3, PieChart, TrendingUp, Info, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#8b4513', '#d2691e', '#deb887', '#f4a460', '#bc8f8f'];

export const StatsTab = () => {
  const { isRTL } = useRTL();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly' | 'all'>('all');
  
  const [includeSalaries, setIncludeSalaries] = useState(true);
  const [includeStock, setIncludeStock] = useState(false);
  const [includeExpenses, setIncludeExpenses] = useState(true);

  const { data: stats } = useQuery({
    queryKey: ['stats', timeframe],
    queryFn: () => api.getStats(timeframe)
  });

  const unpaidRevenue = (stats?.totalPotentialRevenue || 0) - (stats?.totalRevenue || 0);
  const avgOrderValue = (stats?.totalRevenue || 0) / (stats?.orderCount || 1);
  
  const totalOutgoings = 
    (includeSalaries ? (stats?.totalSalaries || 0) : 0) + 
    (includeStock ? (stats?.stockValue || 0) : 0) +
    (includeExpenses ? (stats?.totalExpenses || 0) : 0);

  const netProfit = (stats?.totalRevenue || 0) - totalOutgoings;

  const StatInfo = ({ title, info }: { title: string, info: string }) => (
    <div className="flex items-center gap-1.5 mb-0.5">
      <Label className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{title}</Label>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="cursor-help p-0.5 rounded-full hover:bg-stone-100 transition-colors">
            <Info size={11} className="text-primary opacity-60" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-[220px] text-[11px] p-3 bg-stone-900 text-stone-50 rounded-2xl border border-stone-800 shadow-2xl animate-in fade-in zoom-in duration-200"
        >
          <p className="leading-relaxed font-medium">{info}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-black">{isRTL ? 'التقارير المالية' : 'Financial Reports'}</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border">
            <div className="p-2 text-primary bg-primary/5 rounded-xl ml-1">
               <Filter size={14} />
            </div>
            <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
              <SelectTrigger className="h-9 border-none bg-transparent shadow-none font-bold text-xs focus:ring-0 min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border shadow-xl">
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border text-xs font-bold">
            <div className="flex items-center gap-2">
              <Checkbox id="incSal" checked={includeSalaries} onCheckedChange={(c) => setIncludeSalaries(!!c)} />
              <label htmlFor="incSal" className="cursor-pointer">{isRTL ? 'الرواتب' : 'Salaries'}</label>
            </div>
            <div className="h-4 w-px bg-stone-200" />
            <div className="flex items-center gap-2">
              <Checkbox id="incStock" checked={includeStock} onCheckedChange={(c) => setIncludeStock(!!c)} />
              <label htmlFor="incStock" className="cursor-pointer">{isRTL ? 'المخزون' : 'Stock'}</label>
            </div>
            <div className="h-4 w-px bg-stone-200" />
            <div className="flex items-center gap-2">
              <Checkbox id="incExp" checked={includeExpenses} onCheckedChange={(c) => setIncludeExpenses(!!c)} />
              <label htmlFor="incExp" className="cursor-pointer">{isRTL ? 'المصاريف' : 'Expenses'}</label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4 rounded-[28px] bg-white border-none shadow-sm flex items-start gap-3">
          <div className="bg-green-50 p-2.5 rounded-xl text-green-600"><Wallet size={20} /></div>
          <div className="space-y-0.5">
            <StatInfo 
              title={isRTL ? 'الإيرادات' : 'Revenue'} 
              info={isRTL ? 'إجمالي المبالغ المحصلة من الطلبات التي تم دفعها.' : 'Total income from orders marked as Paid.'} 
            />
            <CurrencyDisplay amountUsd={stats?.totalRevenue || 0} size="md" />
          </div>
        </Card>

        <Card className="p-4 rounded-[28px] bg-white border-none shadow-sm flex items-start gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><Receipt size={20} /></div>
          <div className="space-y-0.5">
            <StatInfo 
              title={isRTL ? 'الطلبات' : 'Orders'} 
              info={isRTL ? 'عدد الطلبات التي تمت معالجتها خلال الفترة المحددة.' : 'Count of all orders processed in the selected timeframe.'} 
            />
            <p className="text-xl font-black">{stats?.orderCount || 0}</p>
          </div>
        </Card>

        <Card className="p-4 rounded-[28px] bg-white border-none shadow-sm flex items-start gap-3">
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600"><TrendingUp size={20} /></div>
          <div className="space-y-0.5">
            <StatInfo 
              title={isRTL ? 'معدل الطلب' : 'Avg Order'} 
              info={isRTL ? 'متوسط قيمة الطلب الواحد خلال هذه الفترة.' : 'Average revenue per individual order.'} 
            />
            <CurrencyDisplay amountUsd={avgOrderValue} size="md" />
          </div>
        </Card>

        <Card className="p-4 rounded-[28px] bg-white border-none shadow-sm flex items-start gap-3 opacity-80">
          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600"><Users size={20} /></div>
          <div className="space-y-0.5">
            <StatInfo 
              title={isRTL ? 'الرواتب' : 'Salaries'} 
              info={isRTL ? 'تكلفة الرواتب الموزعة حسب الفترة المحددة.' : 'Pro-rated salary overhead calculated for the selected period.'} 
            />
            <CurrencyDisplay amountUsd={stats?.totalSalaries || 0} size="md" />
          </div>
        </Card>

        <Card className="p-4 rounded-[28px] bg-white border-none shadow-sm flex items-start gap-3 opacity-80">
          <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600"><PackageOpen size={20} /></div>
          <div className="space-y-0.5">
            <StatInfo 
              title={isRTL ? 'المخزون' : 'Stock'} 
              info={isRTL ? 'القيمة الإجمالية المقدرة لجميع الأصناف المتوفرة في المخزن حالياً.' : 'Estimated asset value of all current items in stock.'} 
            />
            <CurrencyDisplay amountUsd={stats?.stockValue || 0} size="md" />
          </div>
        </Card>

        <Card className="p-4 rounded-[28px] bg-white border-none shadow-sm flex items-start gap-3 opacity-80">
          <div className="bg-red-50 p-2.5 rounded-xl text-red-600"><Banknote size={20} /></div>
          <div className="space-y-0.5">
            <StatInfo 
              title={isRTL ? 'المصاريف' : 'Expenses'} 
              info={isRTL ? 'إجمالي المصاريف التشغيلية المسجلة خلال هذه الفترة.' : 'Total business expenses logged during this period.'} 
            />
            <CurrencyDisplay amountUsd={stats?.totalExpenses || 0} size="md" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-8 rounded-[40px] bg-stone-100 border-none shadow-inner flex flex-col justify-center">
          <StatInfo 
            title={isRTL ? 'الإيرادات غير المحصلة' : 'Unpaid Revenue'} 
            info={isRTL ? 'مبالغ الطلبات النشطة التي لم يتم دفعها بعد.' : 'Revenue from orders that are still active and pending payment.'} 
          />
          <CurrencyDisplay amountUsd={unpaidRevenue} size="lg" className="text-stone-800" />
          <p className="text-[10px] opacity-50 mt-2 italic">
            {isRTL ? 'طلبات بانتظار الدفع' : 'Outstanding payments from active orders'}
          </p>
        </Card>

        <Card className="lg:col-span-2 p-8 rounded-[40px] bg-white text-stone-900 border-none shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <Settings2 size={200} className="text-stone-900" />
            </motion.div>
          </div>
          
          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                 <Sparkles size={16} className="text-amber-500" />
               </motion.div>
               <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{isRTL ? 'صافي الربح' : 'Net Profit Analysis'}</span>
            </div>
            
            <div className="flex items-center gap-3 mb-1 justify-center md:justify-start">
              <h3 className="text-stone-900 text-lg font-black uppercase tracking-tight">
                {isRTL ? 'الربح المتوقع' : 'Projected Profit'}
              </h3>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} className="cursor-help p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors">
                    <Info size={14} className="text-amber-600" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-[240px] text-[11px] p-4 bg-stone-800 text-stone-50 rounded-2xl border border-stone-700 shadow-2xl"
                >
                  <p className="leading-relaxed">
                    {isRTL ? 'الإيرادات ناقص جميع التكاليف المحددة في خيارات الحساب أعلاه.' : 'Revenue minus the costs toggled in the calculation filters above.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <CurrencyDisplay 
                amountUsd={netProfit} 
                size="lg" 
                className={`text-4xl font-black ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`} 
              />
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`p-2 rounded-xl ${netProfit >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
              >
                {netProfit >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
              </motion.div>
            </div>
          </div>
          
          <div className="h-px md:h-20 w-full md:w-px bg-gradient-to-b from-transparent via-stone-200 to-transparent" />
          
          <div className="text-[10px] space-y-3 text-center md:text-right relative z-10">
            <p className="font-bold text-muted-foreground uppercase tracking-widest">{isRTL ? 'المعادلة المطبقة:' : 'Calculation logic'}</p>
            <div className="flex flex-col gap-1 text-stone-400 font-medium italic bg-stone-50 p-4 rounded-2xl border border-stone-100">
               <p className="text-stone-600">Total Revenue</p>
               {includeSalaries && <p className="text-red-500/60">- {timeframe} Salaries</p>}
               {includeStock && <p className="text-red-500/60">- Current Stock Value</p>}
               {includeExpenses && <p className="text-red-500/60">- {timeframe} Expenses</p>}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 border-b p-6">
            <BarChart3 className="text-primary" size={20} />
            <CardTitle className="text-base font-black">{isRTL ? 'الأكثر مبيعاً' : 'Most Sold Products'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topProducts || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8f8f8' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', backgroundColor: '#1c1917', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="qty" fill="#8b4513" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 border-b p-6">
            <PieChart className="text-primary" size={20} />
            <CardTitle className="text-base font-black">{isRTL ? 'الإيرادات حسب الفئة' : 'Revenue by Category'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats?.categoryPerformance || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.categoryPerformance || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                   formatter={(value: number) => `$${value.toLocaleString()}`}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', backgroundColor: '#1c1917', color: '#fff' }}
                   itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};