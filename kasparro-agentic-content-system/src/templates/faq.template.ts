/**
 * faq.template.ts
 * Declarative template for FAQ page generation
 */

import { QuestionCategory } from '../models/QuestionModel';

/**
 * FAQ Page Template Schema
 * Defines the structure and source mappings for FAQ page generation
 */
export interface FAQTemplateSchema {
  pageType: 'faq';
  version: string;
  sections: FAQTemplateSection[];
  metadata: FAQTemplateMetadata;
}

export interface FAQTemplateSection {
  id: string;
  category: QuestionCategory;
  title: string;
  minQuestions: number;
  maxQuestions: number;
  source: string;
  priority: number;
}

export interface FAQTemplateMetadata {
  totalMinQuestions: number;
  sortBy: 'category' | 'priority';
  includeCategories: QuestionCategory[];
}

/**
 * FAQ Template Definition
 * Declarative, field-driven template for FAQ page
 */
export const FAQ_TEMPLATE: FAQTemplateSchema = {
  pageType: 'faq',
  version: '1.0.0',
  sections: [
    {
      id: 'informational',
      category: 'informational',
      title: 'General Information',
      minQuestions: 1,
      maxQuestions: 5,
      source: 'QuestionGenerationAgent.informational',
      priority: 1
    },
    {
      id: 'usage',
      category: 'usage',
      title: 'How to Use',
      minQuestions: 1,
      maxQuestions: 5,
      source: 'QuestionGenerationAgent.usage',
      priority: 2
    },
    {
      id: 'safety',
      category: 'safety',
      title: 'Safety & Side Effects',
      minQuestions: 1,
      maxQuestions: 5,
      source: 'QuestionGenerationAgent.safety',
      priority: 3
    },
    {
      id: 'purchase',
      category: 'purchase',
      title: 'Purchase Information',
      minQuestions: 1,
      maxQuestions: 3,
      source: 'QuestionGenerationAgent.purchase',
      priority: 4
    },
    {
      id: 'comparison',
      category: 'comparison',
      title: 'Product Comparisons',
      minQuestions: 1,
      maxQuestions: 3,
      source: 'QuestionGenerationAgent.comparison',
      priority: 5
    }
  ],
  metadata: {
    totalMinQuestions: 5,
    sortBy: 'category',
    includeCategories: ['informational', 'safety', 'usage', 'purchase', 'comparison']
  }
};

/**
 * Gets template section by category
 */
export function getTemplateSectionByCategory(
  template: FAQTemplateSchema, 
  category: QuestionCategory
): FAQTemplateSection | undefined {
  return template.sections.find(s => s.category === category);
}

/**
 * Validates FAQ content against template requirements
 */
export function validateFAQAgainstTemplate(
  questionCounts: Record<QuestionCategory, number>,
  template: FAQTemplateSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  let totalQuestions = 0;
  
  for (const section of template.sections) {
    const count = questionCounts[section.category] || 0;
    totalQuestions += count;
    
    if (count < section.minQuestions) {
      errors.push(`${section.title} requires at least ${section.minQuestions} question(s), got ${count}`);
    }
  }
  
  if (totalQuestions < template.metadata.totalMinQuestions) {
    errors.push(`Total questions must be at least ${template.metadata.totalMinQuestions}, got ${totalQuestions}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
