"use strict";
/**
 * safety.logic.ts
 * Reusable logic block for generating safety/warnings content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSafetyBlock = generateSafetyBlock;
exports.safetyNotesBlock = safetyNotesBlock;
exports.parseSideEffects = parseSideEffects;
exports.determineSuitability = determineSuitability;
exports.calculateSafetyScore = calculateSafetyScore;
/**
 * Generates safety block content from product model
 * Pure function - no side effects
 */
function generateSafetyBlock(input) {
    const { product } = input;
    const warnings = generateWarnings(product);
    return {
        section: {
            sideEffects: product.safety.sideEffects,
            warnings,
            suitableFor: product.safety.suitableFor
        },
        rawSafety: product.safety
    };
}
/**
 * Extracts safety notes block for page assembly
 */
function safetyNotesBlock(product) {
    const warnings = generateWarnings(product);
    return {
        sideEffects: product.safety.sideEffects,
        warnings,
        suitableFor: product.safety.suitableFor
    };
}
/**
 * Generates warnings based on product ingredients and characteristics
 */
function generateWarnings(product) {
    const warnings = [];
    // Check for Vitamin C - requires sunscreen
    const hasVitaminC = product.ingredients.some(ing => ing.name.toLowerCase().includes('vitamin c'));
    if (hasVitaminC) {
        warnings.push('Use sunscreen when using this product during the day');
    }
    // Check for acids
    const hasAcids = product.ingredients.some(ing => ing.name.toLowerCase().includes('acid') ||
        ing.name.toLowerCase().includes('aha') ||
        ing.name.toLowerCase().includes('bha'));
    if (hasAcids) {
        warnings.push('Patch test recommended before first use');
    }
    // Add standard warnings
    warnings.push('For external use only');
    warnings.push('Discontinue use if irritation occurs');
    // Pregnancy warning for certain ingredients
    const hasRetinol = product.ingredients.some(ing => ing.name.toLowerCase().includes('retinol'));
    if (hasRetinol) {
        warnings.push('Consult a doctor before use if pregnant or nursing');
    }
    return warnings;
}
/**
 * Parses side effects string into array
 */
function parseSideEffects(sideEffectsText) {
    if (!sideEffectsText)
        return [];
    // Split by common delimiters
    const effects = sideEffectsText
        .split(/[,;]/)
        .map(e => e.trim())
        .filter(e => e.length > 0);
    // If no split occurred, return as single item
    if (effects.length === 0) {
        return [sideEffectsText];
    }
    return effects;
}
/**
 * Determines skin type suitability from product data
 */
function determineSuitability(skinTypes, sideEffects) {
    const suitable = [...skinTypes];
    // Add warnings for sensitive skin if side effects mention it
    if (sideEffects.toLowerCase().includes('sensitive')) {
        if (!suitable.includes('Sensitive')) {
            suitable.push('Sensitive (with caution)');
        }
    }
    return suitable;
}
/**
 * Generates safety score based on side effects
 */
function calculateSafetyScore(sideEffects) {
    let score = 100;
    const severityKeywords = {
        'severe': 20,
        'allergic': 15,
        'burn': 15,
        'irritation': 10,
        'redness': 5,
        'tingling': 3,
        'mild': 2
    };
    for (const effect of sideEffects) {
        const lowerEffect = effect.toLowerCase();
        for (const [keyword, penalty] of Object.entries(severityKeywords)) {
            if (lowerEffect.includes(keyword)) {
                score -= penalty;
            }
        }
    }
    return Math.max(0, score);
}
//# sourceMappingURL=safety.logic.js.map