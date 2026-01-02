/**
 * ingredients.logic.ts
 * Reusable logic block for generating ingredients content
 */
import { ProductModel, IngredientInfo } from '../models/ProductModel';
import { IngredientsSection } from '../models/PageModel';
export interface IngredientsBlockInput {
    product: ProductModel;
}
export interface IngredientsBlockOutput {
    section: IngredientsSection;
    rawIngredients: IngredientInfo[];
}
/**
 * Generates ingredients block content from product model
 * Pure function - no side effects
 */
export declare function generateIngredientsBlock(input: IngredientsBlockInput): IngredientsBlockOutput;
/**
 * Extracts ingredients block for page assembly
 */
export declare function extractIngredientsBlock(product: ProductModel): IngredientsSection;
/**
 * Categorizes ingredients by type
 */
export declare function categorizeIngredients(ingredients: IngredientInfo[]): Record<string, string[]>;
/**
 * Gets ingredient benefits mapping
 */
export declare function getIngredientBenefits(ingredientName: string): string[];
/**
 * Checks for potential ingredient interactions
 */
export declare function checkIngredientInteractions(ingredients: string[]): string[];
//# sourceMappingURL=ingredients.logic.d.ts.map