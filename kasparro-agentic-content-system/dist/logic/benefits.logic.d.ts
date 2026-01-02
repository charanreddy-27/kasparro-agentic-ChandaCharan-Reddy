/**
 * benefits.logic.ts
 * Reusable logic block for generating benefits content
 */
import { ProductModel, BenefitInfo, BenefitCategory } from '../models/ProductModel';
import { BenefitsSection } from '../models/PageModel';
export interface BenefitsBlockInput {
    product: ProductModel;
}
export interface BenefitsBlockOutput {
    section: BenefitsSection;
    rawBenefits: BenefitInfo[];
}
/**
 * Generates benefits block content from product model
 * Pure function - no side effects
 */
export declare function generateBenefitsBlock(input: BenefitsBlockInput): BenefitsBlockOutput;
/**
 * Categorizes a benefit string into a category
 */
export declare function categorizeBenefit(benefitText: string): BenefitCategory;
/**
 * Extracts benefit highlights for quick display
 */
export declare function extractBenefitHighlights(benefits: BenefitInfo[], maxCount?: number): string[];
//# sourceMappingURL=benefits.logic.d.ts.map