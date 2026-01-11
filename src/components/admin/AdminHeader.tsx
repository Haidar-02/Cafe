"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, LogOut } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { api } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminHeaderProps {
  userName: string;
}

export const AdminHeader = ({ userName }: AdminHeaderProps) => {
  const { isRTL, lang, setLang } = useRTL();

  return (
    <header className="bg-primary px-5 py-2.5 flex justify-between items-center sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-xl shadow-inner">
          <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain" />
        </div>
        <div className="text-white">
          <h1 className="text-base font-black leading-tight">{isRTL ? "مقهى الشرقاوي" : "Al-Sherkawi Café"}</h1>
          <Badge variant="secondary" className="rounded-full text-[8px] px-1.5 py-0 bg-white/20 text-white border-none">{userName}</Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="rounded-full text-white h-8 text-xs hover:bg-white/10" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          <Globe size={14} className="mr-1.5" /> {lang === 'ar' ? 'EN' : 'AR'}
        </Button>
        
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-red-500 rounded-full transition-colors" 
              onClick={() => api.logout()}
            >
              <LogOut size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-stone-900 text-white border-none rounded-lg text-[10px] font-bold">
            {isRTL ? "تسجيل الخروج" : "Logout"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};