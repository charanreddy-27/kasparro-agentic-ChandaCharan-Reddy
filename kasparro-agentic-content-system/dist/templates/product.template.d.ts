/**
 * product.template.ts
 * Declarative template for Product page generation
 */
/**
 * Product Page Template Schema
 * Defines the structure and source mappings for product page generation
 */
export interface ProductTemplateSchema {
    pageType: 'product';
    version: string;
    sections: ProductTemplateSection[];
    metadata: ProductTemplateMetadata;
}
export interface ProductTemplateSection {
    id: string;
    title: string;
    required: boolean;
    source: string;
    order: number;
    fields: ProductTemplateField[];
}
export interface ProductTemplateField {
    name: string;
    type: 'string' | 'array' | 'object' | 'number';
    required: boolean;
    source: string;
}
export interface ProductTemplateMetadata {
    requiredSections: string[];
    optionalSections: string[];
}
/**
 * Product Page Template Definition
 * Declarative, field-driven template for product page
 */
export declare const PRODUCT_TEMPLATE: ProductTemplateSchema;
/**
 * Gets template section by ID
 */
export declare function getTemplateSectionById(template: ProductTemplateSchema, sectionId: string): ProductTemplateSection | undefined;
/**
 * Validates product content against template requirements
 */
export declare function validateProductAgainstTemplate(content: Record<string, unknown>, template: ProductTemplateSchema): {
    valid: boolean;
    errors: string[];
};
/**
 * Gets ordered sections from template
 */
export declare function getOrderedSections(template: ProductTemplateSchema): ProductTemplateSection[];
//# sourceMappingURL=product.template.d.ts.map