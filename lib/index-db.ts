import { StoryIndexDbSchema, StoryIndexDbSchemaType } from "@/types/story";
import { IDBPDatabase, openDB } from "idb";

let dbInstance: IDBPDatabase<StoryIndexDbSchema> | null = null;

export const getStoryIndexDB = async (): Promise<
    IDBPDatabase<StoryIndexDbSchema>
> => {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB<StoryIndexDbSchema>("Stories", 2, {
        upgrade(db, oldVersion, _newVersion, tx) {
            if (oldVersion === 0) {
                const store = db.createObjectStore("stories", {
                    keyPath: "id",
                    autoIncrement: true,
                });
                store.createIndex("created", "created");
                store.createIndex("author-id", "authorId");
                return;
            }

            if (oldVersion === 1) {
                const store = tx.objectStore("stories");
                if (!store.indexNames.contains("created")) {
                    store.createIndex("created", "created");
                }
                if (!store.indexNames.contains("author-id")) {
                    store.createIndex("author-id", "authorId");
                }
            }
        },
    });

    return dbInstance;
};

export const getDraft = async (
    id: number,
): Promise<StoryIndexDbSchemaType | undefined> => {
    const db = await getStoryIndexDB();
    return db.get("stories", id);
};

export const saveDraft = async (
    draft: StoryIndexDbSchemaType,
    userId: string,
): Promise<number> => {
    if (!draft.authorId || draft.authorId !== userId) {
        throw new Error(
            "Unauthorized: draft authorId does not match the current user.",
        );
    }

    const db = await getStoryIndexDB();
    const now = Date.now();
    const { id, ...draftWithoutId } = draft;

    if (id) {
        return db.put("stories", {
            ...draft,
            id,
            created: draft.created ?? now,
            updated: now,
        });
    }

    return db.add("stories", {
        ...draftWithoutId,
        created: draft.created ?? now,
        updated: now,
    } as StoryIndexDbSchemaType);
};

export const deleteDraft = async (id: number): Promise<void> => {
    const db = await getStoryIndexDB();
    await db.delete("stories", id);
};

export const deleteAllUserDrafts = async (userId: string): Promise<void> => {
    const db = await getStoryIndexDB();
    const tx = db.transaction("stories", "readwrite");
    const index = tx.store.index("author-id");
    let cursor = await index.openCursor(IDBKeyRange.only(userId));

    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }

    await tx.done;
};

export const getDraftsByUserId = async (
    userId: string,
): Promise<StoryIndexDbSchemaType[]> => {
    const db = await getStoryIndexDB();
    const drafts = await db.getAllFromIndex(
        "stories",
        "author-id",
        IDBKeyRange.only(userId),
    );
    return drafts.sort((a, b) => b.created - a.created);
};
