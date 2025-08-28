import { useState } from "react";
import { Note } from "@/types/notes";
import { useNotes } from "@/hooks/useNotes";
import { useAI } from "@/hooks/useAI";
import { useEncryption } from "@/hooks/useEncryption";
import { Sidebar } from "./Sidebar";
import { Editor } from "./Editor";
import { AIAssistant } from "./AIAssistant";
import { PasswordModal } from "./PasswordModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, BookOpen, Shield, Download } from "lucide-react";

export function NotesApp() {
  const {
    notes,
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
  } = useNotes();

  const { analysis, isAnalyzing, error, analyzeNote, clearAnalysis } = useAI();
  
  const {
    isPasswordModalOpen,
    pendingAction,
    requestPassword,
    submitPassword,
    cancelPassword
  } = useEncryption();

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; noteId: string | null }>({
    isOpen: false,
    noteId: null
  });

  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const { toast } = useToast();

  const handleSelectNote = (note: Note) => {
    setCurrentNote(note);
    clearAnalysis();
  };

  const handleCreateNote = () => {
    const note = createNote();
    clearAnalysis();
    toast({
      title: "✨ New note created",
      description: "Start writing your thoughts and ideas!",
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setConfirmDelete({ isOpen: true, noteId });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.noteId) {
      deleteNote(confirmDelete.noteId);
      toast({
        title: "🗑️ Note deleted",
        description: "The note has been permanently removed.",
      });
    }
    setConfirmDelete({ isOpen: false, noteId: null });
  };

  const handleRequestEncrypt = (noteId: string) => {
    requestPassword('encrypt', noteId, async (password: string) => {
      const success = await encryptNote(noteId, password);
      if (success) {
        toast({
          title: "🔒 Note encrypted",
          description: "Your note is now password protected and secure.",
        });
      } else {
        toast({
          title: "❌ Encryption failed",
          description: "Unable to encrypt the note. Please try again.",
          variant: "destructive"
        });
      }
      return success;
    });
  };

  const handleRequestDecrypt = (noteId: string) => {
    requestPassword('decrypt', noteId, async (password: string) => {
      const success = await decryptNote(noteId, password);
      if (success) {
        const note = notes.find(n => n.id === noteId);
        if (note) {
          setCurrentNote({ ...note, encrypted: false });
        }
        toast({
          title: "🔓 Note decrypted",
          description: "Your note is now accessible again.",
        });
      }
      return success;
    });
  };

  const handleAnalyzeContent = (content: string) => {
    analyzeNote(content);
  };

  const handleAddTag = (tag: string) => {
    if (currentNote) {
      const currentTags = currentNote.tags || [];
      if (!currentTags.includes(tag)) {
        updateNote({
          id: currentNote.id,
          tags: [...currentTags, tag]
        });
        toast({
          title: "🏷️ Tag added",
          description: `Added "${tag}" to your note.`,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your workspace</h2>
          <p className="text-gray-600">Preparing your notes and AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50" data-testid="notes-app">
      <div className="hidden md:block md:w-80 flex-shrink-0">
        <Sidebar
          notes={notes}
          currentNote={currentNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateNote={handleCreateNote}
          onSelectNote={handleSelectNote}
          onTogglePin={togglePin}
          onDeleteNote={handleDeleteNote}
          onRequestDecrypt={handleRequestDecrypt}
        />
      </div>
      <div className="block md:hidden w-full flex-shrink-0 max-h-[45%]">
        <Sidebar
          notes={notes}
          currentNote={currentNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateNote={handleCreateNote}
          onSelectNote={handleSelectNote}
          onTogglePin={togglePin}
          onDeleteNote={handleDeleteNote}
          onRequestDecrypt={handleRequestDecrypt}
        />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Editor
          currentNote={currentNote}
          onUpdateNote={updateNote}
          onTogglePin={togglePin}
          onRequestEncrypt={handleRequestEncrypt}
          onAnalyzeContent={handleAnalyzeContent}
          isAnalyzing={isAnalyzing}
          onToggleAIAssistant={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          isAIAssistantOpen={isAIAssistantOpen}
          onRequestDecrypt={handleRequestDecrypt}
        />
        
        {isAIAssistantOpen && (
          <div className="w-full md:w-96 flex-shrink-0">
            <AIAssistant
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              error={error}
              onRefresh={() => currentNote && handleAnalyzeContent(currentNote.htmlContent)}
              onAddTag={handleAddTag}
            />
          </div>
        )}
      </div>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        type={pendingAction?.type || null}
        onSubmit={submitPassword}
        onCancel={cancelPassword}
      />

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete Note"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, noteId: null })}
        isDestructive
      />
    </div>
  );
}
