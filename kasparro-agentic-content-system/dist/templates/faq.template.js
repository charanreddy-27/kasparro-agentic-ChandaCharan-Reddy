"use strict";
/**
 * faq.template.ts
 * Declarative template for FAQ page generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQ_TEMPLATE = void 0;
exports.getTemplateSectionByCategory = getTemplateSectionByCategory;
exports.validateFAQAgainstTemplate = validateFAQAgainstTemplate;
/**
 * FAQ Template Definition
 * Declarative, field-driven template for FAQ page
 */
exports.FAQ_TEMPLATE = {
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
function getTemplateSectionByCategory(template, category) {
    return template.sections.find(s => s.category === category);
}
/**
 * Validates FAQ content against template requirements
 */
function validateFAQAgainstTemplate(questionCounts, template) {
    const errors = [];
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
//# sourceMappingURL=faq.template.js.map