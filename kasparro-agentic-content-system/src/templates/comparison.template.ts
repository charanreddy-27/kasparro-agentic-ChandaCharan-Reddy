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
export const COMPARISON_TEMPLATE: ComparisonTemplateSchema = {
  pageType: 'comparison',
  version: '1.0.0',
  sections: [
    {
      id: 'header',
      title: 'Comparison Overview',
      required: true,
      source: 'generated',
      order: 1
    },
    {
      id: 'products',
      title: 'Product Details',
      required: true,
      source: 'ContentLogicAgent.generateComparisonBlock.productEntries',
      order: 2
    },
    {
      id: 'matrix',
      title: 'Comparison Matrix',
      required: true,
      source: 'ContentLogicAgent.generateComparisonBlock.matrix',
      order: 3
    },
    {
      id: 'summary',
      title: 'Summary & Recommendation',
      required: true,
      source: 'ContentLogicAgent.generateComparisonBlock.summary',
      order: 4
    }
  ],
  comparisonCategories: [
    {
      id: 'ingredients',
      name: 'Ingredients',
      source: 'logic.ingredientComparisonBlock',
      attributes: [
        { name: 'ingredientList', type: 'array', sourceA: 'productA.ingredients', sourceB: 'productB.ingredients' }
      ]
    },
    {
      id: 'benefits',
      name: 'Benefits',
      source: 'logic.benefitsComparisonBlock',
      attributes: [
        { name: 'benefitList', type: 'array', sourceA: 'productA.benefits', sourceB: 'productB.benefits' }
      ]
    },
    {
      id: 'pricing',
      name: 'Pricing',
      source: 'logic.pricingComparisonBlock',
      attributes: [
        { name: 'price', type: 'number', sourceA: 'productA.pricing.basePrice', sourceB: 'productB.price' },
        { name: 'formattedPrice', type: 'string', sourceA: 'productA.pricing.formattedPrice', sourceB: 'generated' }
      ]
    },
    {
      id: 'features',
      name: 'Features',
      source: 'logic.featuresComparisonBlock',
      attributes: [
        { name: 'concentration', type: 'string', sourceA: 'productA.concentration', sourceB: 'productB.concentration' },
        { name: 'ingredientCount', type: 'number', sourceA: 'productA.ingredients.length', sourceB: 'productB.ingredients.length' }
      ]
    }
  ],
  metadata: {
    productCount: 2,
    requireFictionalProduct: true,
    fictionalProductSchema: {
      requiredFields: ['name', 'ingredients', 'benefits', 'price'],
      optionalFields: ['concentration', 'skinTypes']
    }
  }
};

/**
 * Default fictional product for comparison
 * This is the structured fictional Product B
 */
export const FICTIONAL_PRODUCT_B = {
  name: 'RadiantClear Serum',
  ingredients: ['Niacinamide', 'Salicylic Acid', 'Green Tea Extract'],
  benefits: ['Pore minimizing', 'Oil control', 'Soothing'],
  price: 799,
  concentration: '5% Niacinamide',
  skinTypes: ['Oily', 'Acne-prone']
};

/**
 * Gets comparison category by ID
 */
export function getComparisonCategoryById(
  template: ComparisonTemplateSchema,
  categoryId: string
): ComparisonCategoryTemplate | undefined {
  return template.comparisonCategories.find(c => c.id === categoryId);
}

/**
 * Validates comparison content against template requirements
 */
export function validateComparisonAgainstTemplate(
  content: Record<string, unknown>,
  template: ComparisonTemplateSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const section of template.sections) {
    if (section.required && !content[section.id]) {
      errors.push(`Missing required section: ${section.title}`);
    }
  }
  
  // Validate product count
  const products = content['products'] as unknown[];
  if (products && products.length !== template.metadata.productCount) {
    errors.push(`Expected ${template.metadata.productCount} products, got ${products.length}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gets ordered sections from template
 */
export function getOrderedComparisonSections(
  template: ComparisonTemplateSchema
): ComparisonTemplateSection[] {
  return [...template.sections].sort((a, b) => a.order - b.order);
}
