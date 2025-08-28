import { useState, useEffect, useCallback } from "react";
import { Note } from "@/types/notes";
import { StorageService } from "@/lib/storage";
import { EncryptionService } from "@/lib/encryption";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from storage on mount
  useEffect(() => {
    const loadedNotes = StorageService.loadNotes();
    setNotes(loadedNotes);
    setIsLoading(false);
  }, []);

  // Auto-save notes whenever notes change
  useEffect(() => {
    if (!isLoading) {
      StorageService.saveNotes(notes);
    }
  }, [notes, isLoading]);

  const createNote = useCallback((): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      htmlContent: "",
      pinned: false,
      encrypted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    };

    setNotes(prev => [newNote, ...prev]);
    setCurrentNote(newNote);
    return newNote;
  }, []);

  const updateNote = useCallback((updatedNote: Partial<Note> & { id: string }) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === updatedNote.id 
          ? { ...note, ...updatedNote, updatedAt: new Date() }
          : note
      )
    );

    if (currentNote?.id === updatedNote.id) {
      setCurrentNote(prev => prev ? { ...prev, ...updatedNote, updatedAt: new Date() } : null);
    }
  }, [currentNote]);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
    }
  }, [currentNote]);

  const togglePin = useCallback((noteId: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === noteId
          ? { ...note, pinned: !note.pinned, updatedAt: new Date() }
          : note
      )
    );
  }, []);

  const encryptNote = useCallback(async (noteId: string, password: string): Promise<boolean> => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note || note.encrypted) return false;

      const encryptedData = await EncryptionService.encrypt(note.htmlContent, password);
      
      updateNote({
        id: noteId,
        encrypted: true,
        htmlContent: "", // Clear plaintext content
        encryptedData
      });

      return true;
    } catch (error) {
      console.error("Failed to encrypt note:", error);
      return false;
    }
  }, [notes, updateNote]);

  const decryptNote = useCallback(async (noteId: string, password: string): Promise<boolean> => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note || !note.encrypted || !note.encryptedData) return false;

      const decryptedContent = await EncryptionService.decrypt(note.encryptedData, password);
      
      updateNote({
        id: noteId,
        encrypted: false,
        htmlContent: decryptedContent,
        encryptedData: undefined
      });

      return true;
    } catch (error) {
      console.error("Failed to decrypt note:", error);
      return false;
    }
  }, [notes, updateNote]);

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.htmlContent.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Sort by pinned first, then by updated date
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  return {
    notes: filteredNotes,
    currentNote,
    searchQuery,
    isLoading,
    setCurrentNote,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    encryptNote,
    decryptNote
  };
}
