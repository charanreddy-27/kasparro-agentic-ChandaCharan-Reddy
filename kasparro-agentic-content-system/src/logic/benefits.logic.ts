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
export function generateBenefitsBlock(input: BenefitsBlockInput): BenefitsBlockOutput {
  const { product } = input;
  
  const highlights = product.benefits.map(b => b.description);
  
  const detailed = product.benefits.map(benefit => ({
    benefit: benefit.description,
    description: generateBenefitDescription(benefit, product)
  }));

  return {
    section: {
      highlights,
      detailed
    },
    rawBenefits: product.benefits
  };
}

/**
 * Generates a descriptive text for a benefit based on product context
 */
function generateBenefitDescription(benefit: BenefitInfo, product: ProductModel): string {
  const benefitDescriptions: Record<string, string> = {
    'Brightening': `${product.name} helps achieve a brighter, more radiant complexion through its ${product.concentration} formula.`,
    'Fades dark spots': `The active ingredients in ${product.name} work to reduce the appearance of dark spots and hyperpigmentation over time.`,
    'Hydrating': `Provides deep hydration suitable for ${product.skinTypes.join(' and ')} skin types.`,
    'Anti-aging': `Helps reduce visible signs of aging with consistent use.`,
    'Smoothing': `Improves skin texture for a smoother appearance.`
  };

  return benefitDescriptions[benefit.description] || 
    `${benefit.description} - a key benefit of ${product.name} for ${product.skinTypes.join(' and ')} skin.`;
}

/**
 * Categorizes a benefit string into a category
 */
export function categorizeBenefit(benefitText: string): BenefitCategory {
  const lowerBenefit = benefitText.toLowerCase();
  
  if (lowerBenefit.includes('bright') || lowerBenefit.includes('glow') || lowerBenefit.includes('radiant')) {
    return 'aesthetic';
  }
  if (lowerBenefit.includes('protect') || lowerBenefit.includes('shield') || lowerBenefit.includes('defense')) {
    return 'protective';
  }
  if (lowerBenefit.includes('fade') || lowerBenefit.includes('reduce') || lowerBenefit.includes('correct')) {
    return 'corrective';
  }
  return 'health';
}

/**
 * Extracts benefit highlights for quick display
 */
export function extractBenefitHighlights(benefits: BenefitInfo[], maxCount: number = 3): string[] {
  return benefits
    .slice(0, maxCount)
    .map(b => b.description);
}
