/**
 * comparison.template.ts
 * Declarative template for Comparison page generation
 */
/**
 * Comparison Page Template Schema
 * Defines the structure and source mappings for comparison page generation
 */
export interface ComparisonTemplateSchema {
    pageType: 'comparison';
    version: string;
    sections: ComparisonTemplateSection[];
    comparisonCategories: ComparisonCategoryTemplate[];
    metadata: ComparisonTemplateMetadata;
}
export interface ComparisonTemplateSection {
    id: string;
    title: string;
    required: boolean;
    source: string;
    order: number;
}
export interface ComparisonCategoryTemplate {
    id: string;
    name: string;
    attributes: ComparisonAttributeTemplate[];
    source: string;
}
export interface ComparisonAttributeTemplate {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    sourceA: string;
    sourceB: string;
}
export interface ComparisonTemplateMetadata {
    productCount: number;
    requireFictionalProduct: boolean;
    fictionalProductSchema: FictionalProductSchema;
}
export interface FictionalProductSchema {
    requiredFields: string[];
    optionalFields: string[];
}
/**
 * Comparison Page Template Definition
 * Declarative, field-driven template for comparison page
 */
export declare const COMPARISON_TEMPLATE: ComparisonTemplateSchema;
/**
 * Default fictional product for comparison
 * This is the structured fictional Product B
 */
export declare const FICTIONAL_PRODUCT_B: {
    name: string;
    ingredients: string[];
    benefits: string[];
    price: number;
    concentration: string;
    skinTypes: string[];
};
/**
 * Gets comparison category by ID
 */
export declare function getComparisonCategoryById(template: ComparisonTemplateSchema, categoryId: string): ComparisonCategoryTemplate | undefined;
/**
 * Validates comparison content against template requirements
 */
export declare function validateComparisonAgainstTemplate(content: Record<string, unknown>, template: ComparisonTemplateSchema): {
    valid: boolean;
    errors: string[];
};
/**
 * Gets ordered sections from template
 */
export declare function getOrderedComparisonSections(template: ComparisonTemplateSchema): ComparisonTemplateSection[];
//# sourceMappingURL=comparison.template.d.ts.map