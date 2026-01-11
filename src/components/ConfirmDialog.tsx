"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRTL } from "@/lib/rtl-context";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'destructive'
}: ConfirmDialogProps) => {
  const { isRTL } = useRTL();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8 bg-white max-w-sm">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-xl font-black">
            {title || (isRTL ? "هل أنت متأكد؟" : "Are you sure?")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium opacity-70">
            {description || (isRTL ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-3">
          <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-stone-200 font-bold">
            {cancelText || (isRTL ? "إلغاء" : "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`flex-1 h-12 rounded-2xl font-black text-white ${variant === 'destructive' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'}`}
          >
            {confirmText || (isRTL ? "تأكيد" : "Confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;