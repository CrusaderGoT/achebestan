// types/bookmark.ts
export interface Bookmark {
    id: string;
    containerSelector: string;
    position: number;
    contextText: string;
    timestamp: number;
    userNote?: string;
  }
  