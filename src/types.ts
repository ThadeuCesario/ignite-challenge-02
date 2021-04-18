export interface Product {
  id: string;
  title?: string;
  price?: number;
  image?: string;
  amount?: number;
}

export interface Stock {
  id: number;
  amount: number;
}
