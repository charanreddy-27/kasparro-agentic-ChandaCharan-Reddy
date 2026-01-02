/**
 * usage.logic.ts
 * Reusable logic block for generating usage/instructions content
 */
import { ProductModel, UsageInfo } from '../models/ProductModel';
import { UsageSection } from '../models/PageModel';
export interface UsageBlockInput {
    product: ProductModel;
}
export interface UsageBlockOutput {
    section: UsageSection;
    rawUsage: UsageInfo;
}
/**
 * Generates usage block content from product model
 * Pure function - no side effects
 */
export declare function generateUsageBlock(input: UsageBlockInput): UsageBlockOutput;
/**
 * Extracts usage block for page assembly
 */
export declare function extractUsageBlock(product: ProductModel): UsageSection;
/**
 * Generates timing recommendation based on ingredients
 */
export declare function recommendUsageTiming(ingredients: string[]): string;
/**
 * Formats usage frequency for display
 */
export declare function formatUsageFrequency(frequency: string): string;
//# sourceMappingURL=usage.logic.d.ts.map