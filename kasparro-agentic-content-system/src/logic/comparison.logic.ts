/**
 * comparison.logic.ts
 * Reusable logic block for generating product comparison content
 */

import { ProductModel, ComparisonProduct } from '../models/ProductModel';
import { 
  ComparisonMatrix, 
  ComparisonCategory, 
  ComparisonAttribute,
  ComparisonSummary,
  ComparisonProductEntry
} from '../models/PageModel';

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
export function ingredientComparisonBlock(
  productA: ProductModel, 
  productB: ComparisonProduct
): ComparisonCategory {
  const allIngredients = new Set([
    ...productA.ingredients.map(i => i.name),
    ...productB.ingredients
  ]);

  const attributes: ComparisonAttribute[] = [];
  
  for (const ingredient of allIngredients) {
    const inA = productA.ingredients.some(i => 
      i.name.toLowerCase() === ingredient.toLowerCase()
    );
    const inB = productB.ingredients.some(i => 
      i.toLowerCase() === ingredient.toLowerCase()
    );
    
    attributes.push({
      attribute: ingredient,
      productA: inA ? 'Yes' : 'No',
      productB: inB ? 'Yes' : 'No'
    });
  }

  return {
    name: 'Ingredients',
    attributes
  };
}

/**
 * Generates full comparison block from two products
 */
export function generateComparisonBlock(input: ComparisonBlockInput): ComparisonBlockOutput {
  const { productA, productB } = input;
  
  const ingredientCategory = ingredientComparisonBlock(productA, productB);
  const benefitsCategory = generateBenefitsComparison(productA, productB);
  const pricingCategory = generatePricingComparison(productA, productB);
  const featuresCategory = generateFeaturesComparison(productA, productB);

  const matrix: ComparisonMatrix = {
    categories: [
      ingredientCategory,
      benefitsCategory,
      pricingCategory,
      featuresCategory
    ]
  };

  const summary = generateComparisonSummary(productA, productB);

  return {
    matrix,
    summary,
    productEntries: {
      productA: {
        name: productA.name,
        ingredients: productA.ingredients.map(i => i.name),
        benefits: productA.benefits.map(b => b.description),
        price: productA.pricing.basePrice,
        priceFormatted: productA.pricing.formattedPrice
      },
      productB: {
        name: productB.name,
        ingredients: productB.ingredients,
        benefits: productB.benefits,
        price: productB.price,
        priceFormatted: `₹${productB.price}`
      }
    }
  };
}

/**
 * Generates benefits comparison category
 */
function generateBenefitsComparison(
  productA: ProductModel, 
  productB: ComparisonProduct
): ComparisonCategory {
  const allBenefits = new Set([
    ...productA.benefits.map(b => b.description),
    ...productB.benefits
  ]);

  const attributes: ComparisonAttribute[] = [];
  
  for (const benefit of allBenefits) {
    const inA = productA.benefits.some(b => 
      b.description.toLowerCase() === benefit.toLowerCase()
    );
    const inB = productB.benefits.some(b => 
      b.toLowerCase() === benefit.toLowerCase()
    );
    
    attributes.push({
      attribute: benefit,
      productA: inA ? 'Yes' : 'No',
      productB: inB ? 'Yes' : 'No'
    });
  }

  return {
    name: 'Benefits',
    attributes
  };
}

/**
 * Generates pricing comparison category
 */
function generatePricingComparison(
  productA: ProductModel, 
  productB: ComparisonProduct
): ComparisonCategory {
  const priceDiff = productA.pricing.basePrice - productB.price;
  const priceDiffPercent = ((priceDiff / productB.price) * 100).toFixed(1);

  return {
    name: 'Pricing',
    attributes: [
      {
        attribute: 'Base Price',
        productA: productA.pricing.basePrice,
        productB: productB.price
      },
      {
        attribute: 'Formatted Price',
        productA: productA.pricing.formattedPrice,
        productB: `₹${productB.price}`
      },
      {
        attribute: 'Price Difference',
        productA: priceDiff > 0 ? `+₹${priceDiff}` : `₹${priceDiff}`,
        productB: priceDiff < 0 ? `+₹${Math.abs(priceDiff)}` : `-₹${Math.abs(priceDiff)}`
      }
    ]
  };
}

/**
 * Generates features comparison category
 */
function generateFeaturesComparison(
  productA: ProductModel, 
  productB: ComparisonProduct
): ComparisonCategory {
  return {
    name: 'Features',
    attributes: [
      {
        attribute: 'Concentration',
        productA: productA.concentration,
        productB: productB.concentration || 'Not specified'
      },
      {
        attribute: 'Ingredient Count',
        productA: productA.ingredients.length,
        productB: productB.ingredients.length
      },
      {
        attribute: 'Benefit Count',
        productA: productA.benefits.length,
        productB: productB.benefits.length
      }
    ]
  };
}

/**
 * Generates comparison summary with advantages
 */
function generateComparisonSummary(
  productA: ProductModel, 
  productB: ComparisonProduct
): ComparisonSummary {
  const productAAdvantages: string[] = [];
  const productBAdvantages: string[] = [];

  // Price comparison
  if (productA.pricing.basePrice < productB.price) {
    productAAdvantages.push('More affordable price point');
  } else if (productB.price < productA.pricing.basePrice) {
    productBAdvantages.push('More affordable price point');
  }

  // Ingredient count
  if (productA.ingredients.length > productB.ingredients.length) {
    productAAdvantages.push('More comprehensive ingredient list');
  } else if (productB.ingredients.length > productA.ingredients.length) {
    productBAdvantages.push('More comprehensive ingredient list');
  }

  // Unique ingredients
  const uniqueToA = productA.ingredients.filter(i => 
    !productB.ingredients.some(bi => bi.toLowerCase() === i.name.toLowerCase())
  );
  if (uniqueToA.length > 0) {
    productAAdvantages.push(`Contains unique ingredient(s): ${uniqueToA.map(i => i.name).join(', ')}`);
  }

  const uniqueToB = productB.ingredients.filter(i => 
    !productA.ingredients.some(ai => ai.name.toLowerCase() === i.toLowerCase())
  );
  if (uniqueToB.length > 0) {
    productBAdvantages.push(`Contains unique ingredient(s): ${uniqueToB.join(', ')}`);
  }

  // Benefits comparison
  const uniqueBenefitsA = productA.benefits.filter(b => 
    !productB.benefits.some(bb => bb.toLowerCase() === b.description.toLowerCase())
  );
  if (uniqueBenefitsA.length > 0) {
    productAAdvantages.push(`Unique benefits: ${uniqueBenefitsA.map(b => b.description).join(', ')}`);
  }

  const uniqueBenefitsB = productB.benefits.filter(b => 
    !productA.benefits.some(ab => ab.description.toLowerCase() === b.toLowerCase())
  );
  if (uniqueBenefitsB.length > 0) {
    productBAdvantages.push(`Unique benefits: ${uniqueBenefitsB.join(', ')}`);
  }

  // Generate recommendation
  const recommendation = generateRecommendation(productA, productB, productAAdvantages, productBAdvantages);

  return {
    productAAdvantages,
    productBAdvantages,
    recommendation
  };
}

/**
 * Generates recommendation text based on comparison
 */
function generateRecommendation(
  productA: ProductModel,
  productB: ComparisonProduct,
  advantagesA: string[],
  advantagesB: string[]
): string {
  if (advantagesA.length > advantagesB.length) {
    return `${productA.name} offers more advantages overall, making it a strong choice for ${productA.skinTypes.join(' and ')} skin types.`;
  } else if (advantagesB.length > advantagesA.length) {
    return `${productB.name} offers more advantages overall and may be worth considering as an alternative.`;
  }
  return `Both products have their merits. Choose ${productA.name} for its ${productA.ingredients[0]?.name || 'formulation'}, or ${productB.name} for its unique benefits.`;
}
