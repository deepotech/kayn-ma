/**
 * Deduplicate an array of objects by their _id or id field.
 * Useful for preventing duplicate listings in UI state.
 */

type Identifiable = {
    _id?: string | { toString(): string };
    id?: string | { toString(): string };
};

export function dedupeById<T extends Identifiable>(list: T[]): T[] {
    if (!list || list.length === 0) return [];

    const map = new Map<string, T>();

    for (const item of list) {
        if (!item) continue;
        const rawId = item._id || item.id;
        if (!rawId) continue;
        const id = typeof rawId === 'string' ? rawId : rawId.toString();
        map.set(id, item);
    }

    return Array.from(map.values());
}

