import { Note } from "@/types/notes";

const STORAGE_KEY = "ai-notes-app";

export class StorageService {
  static saveNotes(notes: Note[]): void {
    try {
      const serializedNotes = notes.map(note => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedNotes));
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  }

  static loadNotes(): Note[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsedNotes = JSON.parse(data);
      return parsedNotes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
    } catch (error) {
      console.error("Failed to load notes:", error);
      return [];
    }
  }

  static clearNotes(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear notes:", error);
    }
  }
}
