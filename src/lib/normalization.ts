export interface NormalizedField {
    label: string;
    slug: string;
}

/**
 * Strict slugify function:
 * - lowercase
 * - trim
 * - replace spaces/underscores with "-"
 * - remove diacritics
 * - keep only alphanumeric and hyphens
 * - remove duplicate hyphens
 */
export function slugify(text: string | null | undefined): string {
    if (!text) return '';

    return text.toString()
        .toLowerCase()
        .normalize('NFD') // Split accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .trim()
        .replace(/[\s_]+/g, '-')     // Replace spaces & underscores with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars (except -)
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start
        .replace(/-+$/, '');         // Trim - from end
}

/**
 * Normalizes a field into { label, slug }
 */
export function normalizeField(label: string | null | undefined): NormalizedField {
    const safeLabel = label ? label.trim() : '';
    return {
        label: safeLabel,
        slug: slugify(safeLabel)
    };
}
