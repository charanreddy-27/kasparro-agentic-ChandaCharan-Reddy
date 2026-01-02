/**
 * ProductModel.ts
 * Core data models for the multi-agent content generation system
 */

// Raw product data input interface
export interface RawProductData {
  product_name: string;
  concentration: string;
  skin_type: string[];
  key_ingredients: string[];
  benefits: string[];
  how_to_use: string;
  side_effects: string;
  price: number;
}

// Normalized internal product model
export interface ProductModel {
  id: string;
  name: string;
  concentration: string;
  skinTypes: string[];
  ingredients: IngredientInfo[];
  benefits: BenefitInfo[];
  usage: UsageInfo;
  safety: SafetyInfo;
  pricing: PricingInfo;
  metadata: ProductMetadata;
}

export interface IngredientInfo {
  name: string;
  isPrimary: boolean;
}

export interface BenefitInfo {
  description: string;
  category: BenefitCategory;
}

export type BenefitCategory = 'aesthetic' | 'health' | 'protective' | 'corrective';

export interface UsageInfo {
  instructions: string;
  frequency: string;
  timing: string;
  amount: string;
}

export interface SafetyInfo {
  sideEffects: string[];
  warnings: string[];
  suitableFor: string[];
}

export interface PricingInfo {
  basePrice: number;
  currency: string;
  formattedPrice: string;
}

export interface ProductMetadata {
  createdAt: string;
  version: string;
  sourceHash: string;
}

// Comparison product model (for fictional products)
export interface ComparisonProduct {
  name: string;
  ingredients: string[];
  benefits: string[];
  price: number;
  concentration?: string;
  skinTypes?: string[];
}
