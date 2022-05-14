export type Purchase = {
  steamId: string;
  appId: number;
  removed?: boolean;
  name?: string;
  type?: string;
  headerImage?: string;
  developers?: string[];
  publishers?: string[];
  price?: number;
  priceFormatted?: string;
  datePurchased: Date
};