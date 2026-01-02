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
export declare function generatePriceBlock(input: PriceBlockInput): PriceBlockOutput;
/**
 * Extracts price block for page assembly
 */
export declare function priceBlock(product: ProductModel): PricingSection;
/**
 * Formats price with currency symbol
 */
export declare function formatPrice(price: number, currency?: string): string;
/**
 * Calculates price per ml/unit if volume is available
 */
export declare function calculatePricePerUnit(price: number, volume: number, unit?: string): string;
/**
 * Determines price tier category
 */
export declare function getPriceTier(price: number): 'budget' | 'mid-range' | 'premium' | 'luxury';
/**
 * Generates price comparison text
 */
export declare function generatePriceComparisonText(priceA: number, priceB: number): string;
//# sourceMappingURL=price.logic.d.ts.map