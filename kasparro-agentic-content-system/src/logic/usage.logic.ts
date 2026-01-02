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
export function generateUsageBlock(input: UsageBlockInput): UsageBlockOutput {
  const { product } = input;
  
  const steps = parseUsageSteps(product.usage.instructions);
  
  return {
    section: {
      instructions: product.usage.instructions,
      steps,
      timing: product.usage.timing,
      frequency: product.usage.frequency
    },
    rawUsage: product.usage
  };
}

/**
 * Extracts usage block for page assembly
 */
export function extractUsageBlock(product: ProductModel): UsageSection {
  const steps = parseUsageSteps(product.usage.instructions);
  
  return {
    instructions: product.usage.instructions,
    steps,
    timing: product.usage.timing,
    frequency: product.usage.frequency
  };
}

/**
 * Parses usage instructions into discrete steps
 */
function parseUsageSteps(instructions: string): string[] {
  // Handle common instruction patterns
  const steps: string[] = [];
  
  // Extract amount
  const amountMatch = instructions.match(/(\d+[-–]\d+\s*drops?|\d+\s*drops?|small amount|pea-sized)/i);
  if (amountMatch) {
    steps.push(`Use ${amountMatch[1]}`);
  }
  
  // Extract timing
  const timingMatch = instructions.match(/(morning|evening|night|twice daily|daily)/i);
  if (timingMatch) {
    steps.push(`Apply in the ${timingMatch[1]}`);
  }
  
  // Extract application order
  const orderMatch = instructions.match(/(before|after)\s+(sunscreen|moisturizer|serum|cleanser)/i);
  if (orderMatch) {
    steps.push(`Apply ${orderMatch[1]} ${orderMatch[2]}`);
  }
  
  // If no steps extracted, create default steps from instruction
  if (steps.length === 0) {
    steps.push('Cleanse face thoroughly');
    steps.push(instructions);
    steps.push('Follow with moisturizer if needed');
  }
  
  return steps;
}

/**
 * Generates timing recommendation based on ingredients
 */
export function recommendUsageTiming(ingredients: string[]): string {
  const photosensitiveIngredients = ['Vitamin C', 'Retinol', 'AHA', 'BHA', 'Glycolic Acid'];
  
  const hasPhotosensitive = ingredients.some(ing => 
    photosensitiveIngredients.some(pi => ing.toLowerCase().includes(pi.toLowerCase()))
  );
  
  if (hasPhotosensitive) {
    return 'morning with sunscreen recommended';
  }
  
  return 'morning or evening';
}

/**
 * Formats usage frequency for display
 */
export function formatUsageFrequency(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    'daily': 'Once daily',
    'twice': 'Twice daily',
    'weekly': 'Once weekly',
    'as needed': 'As needed'
  };
  
  const lowerFreq = frequency.toLowerCase();
  for (const [key, value] of Object.entries(frequencyMap)) {
    if (lowerFreq.includes(key)) {
      return value;
    }
  }
  
  return frequency;
}
