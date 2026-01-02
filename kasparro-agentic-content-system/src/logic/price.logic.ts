/**
 * price.logic.ts
 * Reusable logic block for generating pricing content
 */

import { ProductModel, PricingInfo } from '../models/ProductModel';
import { PricingSection } from '../models/PageModel';

export interface PriceBlockInput {
  product: ProductModel;
}

export interface PriceBlockOutput {
  section: PricingSection;
  rawPricing: PricingInfo;
}

/**
 * Generates price block content from product model
 * Pure function - no side effects
 */
export function generatePriceBlock(input: PriceBlockInput): PriceBlockOutput {
  const { product } = input;
  
  return {
    section: {
      price: product.pricing.basePrice,
      currency: product.pricing.currency,
      formatted: product.pricing.formattedPrice
    },
    rawPricing: product.pricing
  };
}

/**
 * Extracts price block for page assembly
 */
export function priceBlock(product: ProductModel): PricingSection {
  return {
    price: product.pricing.basePrice,
    currency: product.pricing.currency,
    formatted: product.pricing.formattedPrice
  };
}

/**
 * Formats price with currency symbol
 */
export function formatPrice(price: number, currency: string = 'INR'): string {
  const currencySymbols: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${price}`;
}

/**
 * Calculates price per ml/unit if volume is available
 */
export function calculatePricePerUnit(price: number, volume: number, unit: string = 'ml'): string {
  const pricePerUnit = (price / volume).toFixed(2);
  return `₹${pricePerUnit}/${unit}`;
}

/**
 * Determines price tier category
 */
export function getPriceTier(price: number): 'budget' | 'mid-range' | 'premium' | 'luxury' {
  if (price < 500) return 'budget';
  if (price < 1000) return 'mid-range';
  if (price < 2000) return 'premium';
  return 'luxury';
}

/**
 * Generates price comparison text
 */
export function generatePriceComparisonText(priceA: number, priceB: number): string {
  const diff = priceA - priceB;
  const percentDiff = Math.abs((diff / priceB) * 100).toFixed(0);
  
  if (diff < 0) {
    return `${percentDiff}% more affordable`;
  } else if (diff > 0) {
    return `${percentDiff}% more expensive`;
  }
  return 'Same price point';
}
