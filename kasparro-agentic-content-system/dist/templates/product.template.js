"use strict";
/**
 * product.template.ts
 * Declarative template for Product page generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT_TEMPLATE = void 0;
exports.getTemplateSectionById = getTemplateSectionById;
exports.validateProductAgainstTemplate = validateProductAgainstTemplate;
exports.getOrderedSections = getOrderedSections;
/**
 * Product Page Template Definition
 * Declarative, field-driven template for product page
 */
exports.PRODUCT_TEMPLATE = {
    pageType: 'product',
    version: '1.0.0',
    sections: [
        {
            id: 'description',
            title: 'Product Description',
            required: true,
            source: 'ContentLogicAgent.generateDescriptionBlock',
            order: 1,
            fields: [
                { name: 'headline', type: 'string', required: true, source: 'product.name' },
                { name: 'summary', type: 'string', required: true, source: 'generated' },
                { name: 'targetAudience', type: 'array', required: true, source: 'product.skinTypes' }
            ]
        },
        {
            id: 'ingredients',
            title: 'Key Ingredients',
            required: true,
            source: 'ContentLogicAgent.generateIngredientsBlock',
            order: 2,
            fields: [
                { name: 'primary', type: 'array', required: true, source: 'logic.extractPrimaryIngredients' },
                { name: 'all', type: 'array', required: true, source: 'product.ingredients' },
                { name: 'concentration', type: 'string', required: true, source: 'product.concentration' }
            ]
        },
        {
            id: 'benefits',
            title: 'Benefits',
            required: true,
            source: 'ContentLogicAgent.generateBenefitsBlock',
            order: 3,
            fields: [
                { name: 'highlights', type: 'array', required: true, source: 'logic.extractBenefitHighlights' },
                { name: 'detailed', type: 'array', required: false, source: 'logic.generateDetailedBenefits' }
            ]
        },
        {
            id: 'usage',
            title: 'How to Use',
            required: true,
            source: 'ContentLogicAgent.extractUsageBlock',
            order: 4,
            fields: [
                { name: 'instructions', type: 'string', required: true, source: 'product.usage.instructions' },
                { name: 'steps', type: 'array', required: true, source: 'logic.parseUsageSteps' },
                { name: 'timing', type: 'string', required: true, source: 'product.usage.timing' },
                { name: 'frequency', type: 'string', required: true, source: 'product.usage.frequency' }
            ]
        },
        {
            id: 'safety',
            title: 'Safety Information',
            required: true,
            source: 'ContentLogicAgent.safetyNotesBlock',
            order: 5,
            fields: [
                { name: 'sideEffects', type: 'array', required: true, source: 'product.safety.sideEffects' },
                { name: 'warnings', type: 'array', required: true, source: 'logic.generateWarnings' },
                { name: 'suitableFor', type: 'array', required: true, source: 'product.safety.suitableFor' }
            ]
        },
        {
            id: 'pricing',
            title: 'Pricing',
            required: true,
            source: 'ContentLogicAgent.priceBlock',
            order: 6,
            fields: [
                { name: 'price', type: 'number', required: true, source: 'product.pricing.basePrice' },
                { name: 'currency', type: 'string', required: true, source: 'product.pricing.currency' },
                { name: 'formatted', type: 'string', required: true, source: 'product.pricing.formattedPrice' }
            ]
        }
    ],
    metadata: {
        requiredSections: ['description', 'ingredients', 'benefits', 'usage', 'safety', 'pricing'],
        optionalSections: []
    }
};
/**
 * Gets template section by ID
 */
function getTemplateSectionById(template, sectionId) {
    return template.sections.find(s => s.id === sectionId);
}
/**
 * Validates product content against template requirements
 */
function validateProductAgainstTemplate(content, template) {
    const errors = [];
    for (const section of template.sections) {
        if (section.required && !content[section.id]) {
            errors.push(`Missing required section: ${section.title}`);
        }
        if (content[section.id]) {
            const sectionContent = content[section.id];
            for (const field of section.fields) {
                if (field.required && sectionContent[field.name] === undefined) {
                    errors.push(`Missing required field: ${section.id}.${field.name}`);
                }
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Gets ordered sections from template
 */
function getOrderedSections(template) {
    return [...template.sections].sort((a, b) => a.order - b.order);
}
//# sourceMappingURL=product.template.js.map