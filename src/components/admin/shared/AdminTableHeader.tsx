"use client";

import React from 'react';

interface AdminTableHeaderProps {
  cols: string[];
}

export const AdminTableHeader = ({ cols }: AdminTableHeaderProps) => (
  <thead className="bg-stone-50 border-b">
    <tr>
      {cols.map((c, i) => (
        <th key={i} className="p-3 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{c}</th>
      ))}
    </tr>
  </thead>
);