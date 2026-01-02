"use strict";
/**
 * price.logic.ts
 * Reusable logic block for generating pricing content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePriceBlock = generatePriceBlock;
exports.priceBlock = priceBlock;
exports.formatPrice = formatPrice;
exports.calculatePricePerUnit = calculatePricePerUnit;
exports.getPriceTier = getPriceTier;
exports.generatePriceComparisonText = generatePriceComparisonText;
/**
 * Generates price block content from product model
 * Pure function - no side effects
 */
function generatePriceBlock(input) {
    const { product } = input;
    return {
        section: {
            price: product.pricing.basePrice,
            currency: product.pricing.currency,
            formatted: product.pricing.formattedPrice
        },
        rawPricing: product.pricing
    };
}
/**
 * Extracts price block for page assembly
 */
function priceBlock(product) {
    return {
        price: product.pricing.basePrice,
        currency: product.pricing.currency,
        formatted: product.pricing.formattedPrice
    };
}
/**
 * Formats price with currency symbol
 */
function formatPrice(price, currency = 'INR') {
    const currencySymbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${price}`;
}
/**
 * Calculates price per ml/unit if volume is available
 */
function calculatePricePerUnit(price, volume, unit = 'ml') {
    const pricePerUnit = (price / volume).toFixed(2);
    return `₹${pricePerUnit}/${unit}`;
}
/**
 * Determines price tier category
 */
function getPriceTier(price) {
    if (price < 500)
        return 'budget';
    if (price < 1000)
        return 'mid-range';
    if (price < 2000)
        return 'premium';
    return 'luxury';
}
/**
 * Generates price comparison text
 */
function generatePriceComparisonText(priceA, priceB) {
    const diff = priceA - priceB;
    const percentDiff = Math.abs((diff / priceB) * 100).toFixed(0);
    if (diff < 0) {
        return `${percentDiff}% more affordable`;
    }
    else if (diff > 0) {
        return `${percentDiff}% more expensive`;
    }
    return 'Same price point';
}
//# sourceMappingURL=price.logic.js.map