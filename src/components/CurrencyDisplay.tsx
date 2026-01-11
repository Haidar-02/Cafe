import { formatCurrency } from "@/lib/currencies";
import { useRTL } from "@/lib/rtl-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface CurrencyDisplayProps {
  amountUsd: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const CurrencyDisplay = ({ amountUsd, className = "", size = 'md' }: CurrencyDisplayProps) => {
  const { isRTL } = useRTL();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  
  const rate = settings?.exchangeRate || 89500;
  const amountLbp = amountUsd * rate;

  const sizeClasses = {
    xs: "text-[10px]",
    sm: "text-xs font-bold",
    md: "text-sm",
    lg: "text-lg font-black"
  };

  return (
    <div className={`flex flex-col leading-tight ${className}`}>
      <span className={`${sizeClasses[size]} text-primary`}>
        {formatCurrency(amountUsd, 'USD', isRTL)}
      </span>
      <span className="text-[9px] opacity-60">
        {isRTL ? `${amountLbp.toLocaleString()} ل.ل` : `${amountLbp.toLocaleString()} LBP`}
      </span>
    </div>
  );
};