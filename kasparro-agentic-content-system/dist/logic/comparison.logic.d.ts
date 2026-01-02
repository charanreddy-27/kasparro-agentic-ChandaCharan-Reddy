/**
 * comparison.logic.ts
 * Reusable logic block for generating product comparison content
 */
import { ProductModel, ComparisonProduct } from '../models/ProductModel';
import { ComparisonMatrix, ComparisonCategory, ComparisonSummary, ComparisonProductEntry } from '../models/PageModel';
export interface ComparisonBlockInput {
    productA: ProductModel;
    productB: ComparisonProduct;
}
export interface ComparisonBlockOutput {
    matrix: ComparisonMatrix;
    summary: ComparisonSummary;
    productEntries: {
        productA: ComparisonProductEntry;
        productB: ComparisonProductEntry;
    };
}
/**
 * Generates ingredient comparison block
 */
export declare function ingredientComparisonBlock(productA: ProductModel, productB: ComparisonProduct): ComparisonCategory;
/**
 * Generates full comparison block from two products
 */
export declare function generateComparisonBlock(input: ComparisonBlockInput): ComparisonBlockOutput;
//# sourceMappingURL=comparison.logic.d.ts.map