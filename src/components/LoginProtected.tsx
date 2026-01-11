"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { User, Loader2, Globe } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { showSuccess, showError } from "@/utils/toast";
import { api } from "@/lib/api";

interface UserData {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
}

interface LoginProtectedProps {
  children: (user: UserData) => React.ReactNode;
}

const LoginProtected = ({ children }: LoginProtectedProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const { isRTL, lang, setLang } = useRTL();

  useEffect(() => {
    const savedUser = localStorage.getItem('cafe_user');
    const token = localStorage.getItem('cafe_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      showError(isRTL ? "يرجى إدخال اسم المستخدم وكلمة المرور" : "Please enter username and password");
      return;
    }
    
    setLoading(true);
    try {
      const userData = await api.auth(username, password);
      setUser(userData);
      showSuccess(isRTL ? "تم تسجيل الدخول" : "Logged in successfully");
    } catch (err) {
      showError(isRTL ? "بيانات غير صحيحة" : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (user) return <>{children(user)}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4 font-arabic">
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="sm" className="rounded-full gap-2 bg-white/50 backdrop-blur-sm" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          <Globe size={14} />
          {lang === 'ar' ? 'English' : 'عربي'}
        </Button>
      </div>
      
      <Card className="w-full max-w-sm border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-primary p-6 md:p-8 text-center text-white">
          <div className="mx-auto bg-white/20 p-3 md:p-4 rounded-full w-fit mb-3 md:mb-4">
            <User className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <CardTitle className="text-xl md:text-2xl">{isRTL ? "تسجيل الدخول" : "Login"}</CardTitle>
          <div className="mt-2 text-[9px] md:text-[10px] opacity-60">
             Admin: admin / 123 | Cashier: cashier / 000
          </div>
        </div>
        <CardContent className="p-6 md:p-8 space-y-4">
          <Input 
            placeholder={isRTL ? "اسم المستخدم" : "Username"}
            className="rounded-xl h-12"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder={isRTL ? "كلمة المرور" : "Password"}
            className="rounded-xl h-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <Button className="w-full h-12 rounded-xl text-lg mt-2" onClick={handleLogin} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isRTL ? "دخول" : "Login")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginProtected;