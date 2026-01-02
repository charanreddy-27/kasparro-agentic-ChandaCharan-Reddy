/**
 * QuestionModel.ts
 * Models for generated questions and FAQ content
 */
export type QuestionCategory = 'informational' | 'safety' | 'usage' | 'purchase' | 'comparison';
export interface GeneratedQuestion {
    id: string;
    question: string;
    answer: string;
    category: QuestionCategory;
    priority: number;
}
export interface QuestionSet {
    productId: string;
    questions: GeneratedQuestion[];
    generatedAt: string;
    totalCount: number;
    byCategory: Record<QuestionCategory, number>;
}
export interface FAQItem {
    question: string;
    answer: string;
    category: QuestionCategory;
}
export interface FAQPage {
    pageType: 'faq';
    productName: string;
    items: FAQItem[];
    generatedAt: string;
    totalQuestions: number;
}
//# sourceMappingURL=QuestionModel.d.ts.map