"use strict";
/**
 * ingredients.logic.ts
 * Reusable logic block for generating ingredients content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIngredientsBlock = generateIngredientsBlock;
exports.extractIngredientsBlock = extractIngredientsBlock;
exports.categorizeIngredients = categorizeIngredients;
exports.getIngredientBenefits = getIngredientBenefits;
exports.checkIngredientInteractions = checkIngredientInteractions;
/**
 * Generates ingredients block content from product model
 * Pure function - no side effects
 */
function generateIngredientsBlock(input) {
    const { product } = input;
    const primaryIngredients = product.ingredients
        .filter(i => i.isPrimary)
        .map(i => i.name);
    const allIngredients = product.ingredients.map(i => i.name);
    return {
        section: {
            primary: primaryIngredients,
            all: allIngredients,
            concentration: product.concentration
        },
        rawIngredients: product.ingredients
    };
}
/**
 * Extracts ingredients block for page assembly
 */
function extractIngredientsBlock(product) {
    const primaryIngredients = product.ingredients
        .filter(i => i.isPrimary)
        .map(i => i.name);
    const allIngredients = product.ingredients.map(i => i.name);
    return {
        primary: primaryIngredients,
        all: allIngredients,
        concentration: product.concentration
    };
}
/**
 * Categorizes ingredients by type
 */
function categorizeIngredients(ingredients) {
    const categories = {
        vitamins: [],
        acids: [],
        hydrators: [],
        antioxidants: [],
        other: []
    };
    for (const ingredient of ingredients) {
        const name = ingredient.name.toLowerCase();
        if (name.includes('vitamin')) {
            categories.vitamins.push(ingredient.name);
        }
        else if (name.includes('acid') || name.includes('aha') || name.includes('bha')) {
            categories.acids.push(ingredient.name);
        }
        else if (name.includes('hyaluronic') || name.includes('glycerin') || name.includes('hydra')) {
            categories.hydrators.push(ingredient.name);
        }
        else if (name.includes('antioxidant') || name.includes('vitamin e') || name.includes('green tea')) {
            categories.antioxidants.push(ingredient.name);
        }
        else {
            categories.other.push(ingredient.name);
        }
    }
    return categories;
}
/**
 * Gets ingredient benefits mapping
 */
function getIngredientBenefits(ingredientName) {
    const benefitsMap = {
        'vitamin c': ['Brightening', 'Antioxidant protection', 'Collagen support'],
        'hyaluronic acid': ['Deep hydration', 'Plumping effect', 'Moisture retention'],
        'niacinamide': ['Pore minimizing', 'Oil control', 'Brightening'],
        'retinol': ['Anti-aging', 'Cell turnover', 'Fine line reduction'],
        'salicylic acid': ['Exfoliation', 'Pore cleansing', 'Acne control']
    };
    const lowerName = ingredientName.toLowerCase();
    for (const [key, benefits] of Object.entries(benefitsMap)) {
        if (lowerName.includes(key)) {
            return benefits;
        }
    }
    return [];
}
/**
 * Checks for potential ingredient interactions
 */
function checkIngredientInteractions(ingredients) {
    const warnings = [];
    const lowerIngredients = ingredients.map(i => i.toLowerCase());
    // Vitamin C + Niacinamide (actually fine but common misconception)
    // Vitamin C + Retinol (should be used at different times)
    if (lowerIngredients.some(i => i.includes('vitamin c')) &&
        lowerIngredients.some(i => i.includes('retinol'))) {
        warnings.push('Vitamin C and Retinol are best used at different times of day');
    }
    // AHA/BHA + Retinol
    if ((lowerIngredients.some(i => i.includes('aha') || i.includes('bha') || i.includes('glycolic'))) &&
        lowerIngredients.some(i => i.includes('retinol'))) {
        warnings.push('AHA/BHA and Retinol may cause irritation when used together');
    }
    return warnings;
}
//# sourceMappingURL=ingredients.logic.js.map