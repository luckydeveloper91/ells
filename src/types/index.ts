export interface Prize {
  id: number;
  name: string;
  description?: string;
  image?: string;
  probability: number;
  position: number; // 1-12 for positioning in the grid
  is_active: boolean;
  codes?: PrizeCode[];
}

export interface PrizeCode {
  id: number;
  code: string;
  prizeId: number;
  is_used: boolean;
  used_at?: Date;
  usedBy?: string;
  created_at: Date;
}

export interface Settings {
  backgroundImage?: string;
  backgroundMusic?: string;
  searchButton?: string;
  backgroundInner?: string;
  spinButton?: string;
  title: string;
  description?: string;
  buttonText: string;
  theme: 'default' | 'festive' | 'elegant' | 'playful';
}

export interface DrawResult {
  prizeId: number;
  prizeName: string;
  prizeImage?: string;
  isWinner: boolean;
  message: string;
  code?: string;
}

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}