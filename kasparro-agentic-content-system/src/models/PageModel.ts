/**
 * PageModel.ts
 * Models for generated page content
 */

import { FAQItem, QuestionCategory } from './QuestionModel';

// Product Page Model
export interface ProductPageSection {
  id: string;
  title: string;
  content: unknown;
}

export interface ProductPage {
  pageType: 'product';
  productName: string;
  sections: {
    description: DescriptionSection;
    ingredients: IngredientsSection;
    benefits: BenefitsSection;
    usage: UsageSection;
    safety: SafetySection;
    pricing: PricingSection;
  };
  generatedAt: string;
}

export interface DescriptionSection {
  headline: string;
  summary: string;
  targetAudience: string[];
}

export interface IngredientsSection {
  primary: string[];
  all: string[];
  concentration: string;
}

export interface BenefitsSection {
  highlights: string[];
  detailed: Array<{
    benefit: string;
    description: string;
  }>;
}

export interface UsageSection {
  instructions: string;
  steps: string[];
  timing: string;
  frequency: string;
}

export interface SafetySection {
  sideEffects: string[];
  warnings: string[];
  suitableFor: string[];
}

export interface PricingSection {
  price: number;
  currency: string;
  formatted: string;
}

// Comparison Page Model
export interface ComparisonPage {
  pageType: 'comparison';
  title: string;
  products: ComparisonProductEntry[];
  comparisonMatrix: ComparisonMatrix;
  summary: ComparisonSummary;
  generatedAt: string;
}

export interface ComparisonProductEntry {
  name: string;
  ingredients: string[];
  benefits: string[];
  price: number;
  priceFormatted: string;
}

export interface ComparisonMatrix {
  categories: ComparisonCategory[];
}

export interface ComparisonCategory {
  name: string;
  attributes: ComparisonAttribute[];
}

export interface ComparisonAttribute {
  attribute: string;
  productA: string | number | boolean;
  productB: string | number | boolean;
}

export interface ComparisonSummary {
  productAAdvantages: string[];
  productBAdvantages: string[];
  recommendation: string;
}

// FAQ Page Model (re-exported for convenience)
export interface FAQPageOutput {
  pageType: 'faq';
  productName: string;
  categories: Array<{
    category: QuestionCategory;
    items: FAQItem[];
  }>;
  totalQuestions: number;
  generatedAt: string;
}
