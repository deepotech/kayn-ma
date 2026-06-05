export interface FAQItem {
    question: string;
    answer: string;
}

export interface EditorialSection {
    title: string;
    // content can be a string (paragraph) or an array of strings (bullet points)
    content: string | string[];
}

export interface LanguageGuide {
    title: string;
    sections: EditorialSection[];
    faqs: FAQItem[];
}

export interface CityGuide {
    ar: LanguageGuide;
    fr: LanguageGuide;
}
