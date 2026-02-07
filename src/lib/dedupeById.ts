/**
 * Deduplicate an array of objects by their _id field.
 * Useful for preventing duplicate listings in UI state.
 */

// Helper type that allows optional _id since IListingBase has _id?
type Identifiable = { _id?: string | { toString(): string } };

export function dedupeById<T extends Identifiable>(list: T[]): T[] {
    if (!list || list.length === 0) return [];

    const map = new Map<string, T>();

    for (const item of list) {
        if (!item._id) continue; // Skip items without ID
        const id = typeof item._id === 'string' ? item._id : item._id.toString();
        map.set(id, item);
    }

    return Array.from(map.values());
}
