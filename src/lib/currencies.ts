export const LBP_RATE = 89500; // Lebanese Pound market rate

export const formatCurrency = (amount: number, currency: 'USD' | 'LBP', isRTL: boolean) => {
  if (currency === 'USD') {
    return isRTL ? `${amount.toLocaleString()} $` : `$${amount.toLocaleString()}`;
  }
  return isRTL ? `${amount.toLocaleString()} ل.ل` : `${amount.toLocaleString()} LBP`;
};

export const usdToLbp = (usd: number) => usd * LBP_RATE;