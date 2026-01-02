/**
 * safety.logic.ts
 * Reusable logic block for generating safety/warnings content
 */
import { ProductModel, SafetyInfo } from '../models/ProductModel';
import { SafetySection } from '../models/PageModel';
export interface SafetyBlockInput {
    product: ProductModel;
}
export interface SafetyBlockOutput {
    section: SafetySection;
    rawSafety: SafetyInfo;
}
/**
 * Generates safety block content from product model
 * Pure function - no side effects
 */
export declare function generateSafetyBlock(input: SafetyBlockInput): SafetyBlockOutput;
/**
 * Extracts safety notes block for page assembly
 */
export declare function safetyNotesBlock(product: ProductModel): SafetySection;
/**
 * Parses side effects string into array
 */
export declare function parseSideEffects(sideEffectsText: string): string[];
/**
 * Determines skin type suitability from product data
 */
export declare function determineSuitability(skinTypes: string[], sideEffects: string): string[];
/**
 * Generates safety score based on side effects
 */
export declare function calculateSafetyScore(sideEffects: string[]): number;
//# sourceMappingURL=safety.logic.d.ts.map