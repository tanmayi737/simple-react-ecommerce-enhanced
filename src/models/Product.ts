export interface ProductReview {
  rating: number;
  comment: string;
  date?: string;
  reviewerName?: string;
  reviewerEmail?: string;
}

export interface Product {
  id: number;
  title: string;
  images?: string[];
  price: number;
  rating: number;
  thumbnail?: string;
  description?: string;
  category: string;
  brand?: string;
  stock?: number;
  discountPercentage?: number;
  tags?: string[];
  reviews?: ProductReview[];
}
