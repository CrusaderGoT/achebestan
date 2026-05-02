import { StoryIndexDbSchema, StoryIndexDbSchemaType } from "@/types/story";
import { IDBPDatabase, openDB } from "idb";

let dbInstance: IDBPDatabase<StoryIndexDbSchema> | null = null;

export const getStoryIndexDB = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await openDB<StoryIndexDbSchema>("Stories", 1, {
        upgrade(db) {
            const store = db.createObjectStore("stories", {
                keyPath: "id",
                autoIncrement: true,
            });
            store.createIndex("book-id", "bookId");
            store.createIndex("created", "created");
        },
    });

    return dbInstance;
};

export const storyIndexDB = async () => {
    const db = await getStoryIndexDB();
    const drafts = await db.getAll("stories");

    return {
        db,
        drafts,
    };
};

export const getDraft = async (id: number) => {
    const db = await getStoryIndexDB();
    return await db.get("stories", id);
};

export const saveDraft = async (
    draft: Partial<StoryIndexDbSchemaType>,
): Promise<number> => {
    const db = await getStoryIndexDB();
    const now = Date.now();
    const { id, ...draftWithoutId } = draft;

    if (id) {
        const data = {
            ...draft,
            id: id,
            created: draft.created || now,
            updated: now,
        };
        return await db.put("stories", data as StoryIndexDbSchemaType);
    } else {
        const data = {
            ...draftWithoutId,
            created: draft.created || now,
            updated: now,
        };
        return await db.add("stories", data as StoryIndexDbSchemaType);
    }
};

export const deleteDraft = async (id: number): Promise<void> => {
    const db = await getStoryIndexDB();
    await db.delete("stories", id);
};

export const deleteAllDrafts = async (): Promise<void> => {
    const db = await getStoryIndexDB();
    const tx = db.transaction("stories", "readwrite");
    await tx.store.clear();
    await tx.done;
};

// Fix: getAllFromIndex returns ascending (oldest first). Reversing here keeps
// the name accurate and stays consistent with the merge hook's sort order.
export const getDraftsByDate = async (): Promise<StoryIndexDbSchemaType[]> => {
    const db = await getStoryIndexDB();
    const all = await db.getAllFromIndex("stories", "created");
    return all.reverse(); // newest first
};
