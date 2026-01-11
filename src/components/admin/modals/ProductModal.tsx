"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image as ImageIcon, X, DollarSign, Banknote } from "lucide-react";
import { useRTL } from "@/lib/rtl-context";
import { api } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import { useQuery } from "@tanstack/react-query";

export const ProductModal = ({
  open,
  onOpenChange,
  item,
  categories,
  refresh,
}: any) => {
  const { isRTL } = useRTL();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Price linking logic
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.getSettings,
  });
  const rate = settings?.exchangeRate || 89500;

  const [usdPrice, setUsdPrice] = useState<string>("");
  const [lbpPrice, setLbpPrice] = useState<string>("");

  const formatCommas = (val: string | number) => {
    const str = String(val).replace(/,/g, "");
    const num = parseFloat(str);
    if (isNaN(num)) return "";
    return num.toLocaleString();
  };

  useEffect(() => {
    if (open) {
      setImagePreview(item?.image || "");
      setSelectedFile(null);
      const initialPrice = item?.price || 0;
      setUsdPrice(String(initialPrice));
      setLbpPrice(
        initialPrice > 0 ? formatCommas(Math.round(initialPrice * rate)) : ""
      );
    }
  }, [open, item, rate]);

  const handleUsdChange = (val: string) => {
    setUsdPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setLbpPrice(formatCommas(Math.round(num * rate)));
    } else {
      setLbpPrice("");
    }
  };

  const handleLbpChange = (val: string) => {
    const raw = val.replace(/,/g, "");
    // Only allow numeric input
    if (raw !== "" && isNaN(Number(raw))) return;

    setLbpPrice(formatCommas(raw));
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      setUsdPrice((num / rate).toFixed(2));
    } else {
      setUsdPrice("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData(e.currentTarget);
      let imageUrl = item?.image || "";

      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        imageUrl = uploadRes.url;
      }

      await api.saveProduct({
        id: item?.id,
        name: data.get("name"),
        name_ar: data.get("name_ar"),
        description: data.get("description"),
        description_ar: data.get("description_ar"),
        price: parseFloat(usdPrice) || 0,
        category_id: parseInt(data.get("category_id") as string),
        image: imageUrl,
      });

      onOpenChange(false);
      refresh();
      showSuccess(isRTL ? "تم حفظ المنتج" : "Product saved");
    } catch (err) {
      showError(isRTL ? "فشل حفظ المنتج" : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-white overflow-hidden max-w-2xl w-[95vw] rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black">
            {item
              ? isRTL
                ? "تعديل منتج"
                : "Edit Product"
              : isRTL
              ? "إضافة منتج"
              : "Add Product"}
          </h2>
          <ImageIcon size={24} className="opacity-20" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <form
            className="p-8 space-y-6"
            id="product-form"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isRTL ? "الاسم (EN)" : "Name (EN)"}</Label>
                <Input
                  name="name"
                  defaultValue={item?.name}
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "الاسم (عربي)" : "Name (AR)"}</Label>
                <Input
                  name="name_ar"
                  defaultValue={item?.name_ar}
                  className="text-right rounded-xl h-11"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isRTL ? "الفئة" : "Category"}</Label>
                <Select
                  name="category_id"
                  defaultValue={String(
                    item?.category_id || (categories && categories[0]?.id)
                  )}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl">
                    {categories?.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {isRTL ? c.name_ar : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {isRTL ? "التسعير" : "Pricing"}
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <DollarSign size={12} />
                      <span className="text-[10px] font-bold">USD</span>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={usdPrice}
                      onChange={(e) => handleUsdChange(e.target.value)}
                      required
                      className="rounded-xl h-10 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Banknote size={12} />
                      <span className="text-[10px] font-bold">LBP</span>
                    </div>
                    <Input
                      type="text"
                      value={lbpPrice}
                      onChange={(e) => handleLbpChange(e.target.value)}
                      className="rounded-xl h-10 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "الوصف (EN)" : "Description (EN)"}</Label>
              <Textarea
                name="description"
                defaultValue={item?.description}
                className="rounded-xl min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "الوصف (عربي)" : "Description (AR)"}</Label>
              <Textarea
                name="description_ar"
                defaultValue={item?.description_ar}
                className="text-right rounded-xl min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? "الصورة" : "Product Image"}</Label>
              <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-4 bg-stone-50 transition-colors hover:bg-stone-100/50">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded-2xl shadow-md border-4 border-white"
                    />
                    <button
                      title="attach"
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setSelectedFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground py-4">
                    <ImageIcon size={40} className="mb-2 opacity-20" />
                    <p className="text-xs font-medium">
                      {isRTL ? "اضغط لرفع صورة" : "Click to upload image"}
                    </p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="max-w-xs cursor-pointer"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-stone-50/50 shrink-0">
          <Button
            form="product-form"
            type="submit"
            className="w-full h-14 rounded-2xl text-lg font-black shadow-lg transition-transform active:scale-95"
            disabled={loading}
          >
            {loading
              ? isRTL
                ? "جاري الحفظ..."
                : "Saving..."
              : isRTL
              ? "حفظ المنتج"
              : "Save Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
