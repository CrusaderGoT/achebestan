// hooks/useBookmarks.ts
import { useLocalStorage } from '@mantine/hooks';
import { useCallback } from 'react';
import { Bookmark } from '../types/bookmark';

export function useBookmarks(postId?: string) {
  const storageKey = postId ? `bookmarks-${postId}` : 'bookmarks';
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>({
    key: storageKey,
    defaultValue: [],
  });

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setBookmarks(prev => [...prev, newBookmark]);
    return newBookmark;
  }, [setBookmarks]);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, [setBookmarks]);

  const scrollToBookmark = useCallback((bookmark: Bookmark) => {
    const indicator = document.querySelector(`[data-bookmark-id="${bookmark.id}"]`);
    if (indicator) {
      indicator.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      indicator.classList.add('bookmark-pulse');
      setTimeout(() => {
        indicator.classList.remove('bookmark-pulse');
      }, 1500);
    }
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    scrollToBookmark,
  };
}
