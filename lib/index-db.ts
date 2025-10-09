import { StoryInsertType } from "@/types/story";
import { DBSchema, openDB, IDBPDatabase } from "idb";

export type StoryIndexDbSchemaType = StoryInsertType & {
    id?: number;
    created: number;
    updated: number;
};

export type StoryIndexDbSchema = DBSchema & {
    stories: {
        value: StoryIndexDbSchemaType;
        key: number; // Changed from string to number since autoIncrement generates numbers
        indexes: { "book-id": number; created: number }; // Replaced draft-id with created for better indexing
    };
};

let dbInstance: IDBPDatabase<StoryIndexDbSchema> | null = null;

export const getStoryIndexDB = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await openDB<StoryIndexDbSchema>("Stories", 1, {
        upgrade(db) {
            // Create a store of objects
            const store = db.createObjectStore("stories", {
                keyPath: "id",
                autoIncrement: true,
            });
            // Create indexes
            store.createIndex("book-id", "bookId");
            store.createIndex("created", "created"); // Index by creation date
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
    draft: Partial<StoryIndexDbSchemaType>
): Promise<number> => {
    const db = await getStoryIndexDB();
    const now = Date.now();

    // If draft has an id, we're updating; otherwise, we're creating new
    if (draft.id) {
        // Updating existing draft
        const data: StoryIndexDbSchemaType = {
            ...(draft as StoryInsertType),
            id: draft.id,
            created: draft.created || now,
            updated: now,
        };
        return await db.put("stories", data);
    } else {
        // Creating new draft - omit id to let autoIncrement work
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...draftWithoutId } = draft;
        const data = {
            ...(draftWithoutId as StoryInsertType),
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

export const getDraftsByDate = async (): Promise<StoryIndexDbSchemaType[]> => {
    const db = await getStoryIndexDB();
    // Get all drafts sorted by creation date (newest first)
    return await db.getAllFromIndex("stories", "created");
};
