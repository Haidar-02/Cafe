"use client";

import React from 'react';
import * as Icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export const DynamicIcon = ({ name, size = 16, className = "" }: DynamicIconProps) => {
  const IconComp = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComp size={size} className={className} />;
};