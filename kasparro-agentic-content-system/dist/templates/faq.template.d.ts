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
export declare const FAQ_TEMPLATE: FAQTemplateSchema;
/**
 * Gets template section by category
 */
export declare function getTemplateSectionByCategory(template: FAQTemplateSchema, category: QuestionCategory): FAQTemplateSection | undefined;
/**
 * Validates FAQ content against template requirements
 */
export declare function validateFAQAgainstTemplate(questionCounts: Record<QuestionCategory, number>, template: FAQTemplateSchema): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=faq.template.d.ts.map