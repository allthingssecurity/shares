export interface Transaction {
  id: number;
  share: string;
  openingDate: string | null;
  openingQty: number;
  openingAmt: number;
  purchaseDate: string | null;
  purchaseQty: number;
  purchaseAmt: number;
  saleDate: string | null;
  saleQty: number;
  saleAmt: number;
  gainType?: 'LTCG' | 'STCG';
  gain?: number;
}

export interface ClosingBalance {
  share: string;
  openingQty: number;
  openingAmt: number;
  purchaseQty: number;
  purchaseAmt: number;
  saleQty: number;
  saleAmt: number;
  closingQty: number;
  closingAmt: number;
  avgCostPrice: number;
  realizedGain: number;
  ltcg: number;
  stcg: number;
  firstPurchaseDate: string | null;
  transactions: Transaction[];
}

export interface Summary {
  totalShares: number;
  totalOpeningValue: number;
  totalPurchaseValue: number;
  totalSaleValue: number;
  totalClosingValue: number;
  totalRealizedGain: number;
  totalUnrealizedGain: number;
  portfolioReturn: string | number;
}

export interface TaxDetails {
  taxableGain: number;
  rate: number;
  baseTax: number;
  cess: number;
  totalTax: number;
  effectiveRate: string;
}

export interface CapitalGains {
  totalLTCG: number;
  totalSTCG: number;
  ltcgExemption: number;
  ltcgAfterExemption: number;
  ltcgTax: TaxDetails;
  stcgTax: TaxDetails;
  totalTax: number;
  netGain: number;
}

export interface TaxConfig {
  financialYear: string;
  stcg: {
    rate: number;
    description: string;
    holdingPeriod: number;
    cess: number;
  };
  ltcg: {
    rate: number;
    description: string;
    holdingPeriod: number;
    exemptionLimit: number;
    cess: number;
    indexationBenefit: boolean;
  };
}

export interface LedgerData {
  sessionId?: string;
  transactions: Transaction[];
  closingBalances: ClosingBalance[];
  summary: Summary;
  capitalGains: CapitalGains;
  taxConfig: TaxConfig;
}
