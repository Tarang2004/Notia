import { useState } from "react";
import { Note } from "@/types/notes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Pin, 
  Lock, 
  Trash2, 
  Eye, 
  EyeOff,
  FileText,
  Sparkles,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  notes: Note[];
  currentNote: Note | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNote: () => void;
  onSelectNote: (note: Note) => void;
  onTogglePin: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onRequestDecrypt: (noteId: string) => void;
}

export function Sidebar({
  notes,
  currentNote,
  searchQuery,
  onSearchChange,
  onCreateNote,
  onSelectNote,
  onTogglePin,
  onDeleteNote,
  onRequestDecrypt
}: SidebarProps) {
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.htmlContent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPinnedFilter = !showPinnedOnly || note.pinned;
      return matchesSearch && matchesPinnedFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'asc' 
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }
    });

  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const regularNotes = filteredNotes.filter(note => !note.pinned);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getNotePreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg" data-testid="sidebar">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Notia</h1>
            <p className="text-sm text-gray-600">AI-powered notes</p>
          </div>
        </div>
        
        <Button
          onClick={onCreateNote}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            data-testid="search-input"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showPinnedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className="flex-1"
          >
            <Pin className="w-3 h-3 mr-1" />
            {showPinnedOnly ? 'All Notes' : 'Pinned Only'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSortToggle}
            className="px-2"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {filteredNotes.length} notes
          </Badge>
          {pinnedNotes.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pinnedNotes.length} pinned
            </Badge>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </p>
            {!searchQuery && (
              <Button onClick={onCreateNote} variant="outline" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Create your first note
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2 px-2">
                  <Pin className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Pinned Notes
                  </span>
                </div>
                {pinnedNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isSelected={currentNote?.id === note.id}
                    onSelect={() => onSelectNote(note)}
                    onTogglePin={() => onTogglePin(note.id)}
                    onDelete={() => onDeleteNote(note.id)}
                    onRequestDecrypt={() => onRequestDecrypt(note.id)}
                    formatDate={formatDate}
                    getNotePreview={getNotePreview}
                  />
                ))}
              </div>
            )}

            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <div className="flex items-center space-x-2 mb-2 px-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      All Notes
                    </span>
                  </div>
                )}
                {regularNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isSelected={currentNote?.id === note.id}
                    onSelect={() => onSelectNote(note)}
                    onTogglePin={() => onTogglePin(note.id)}
                    onDelete={() => onDeleteNote(note.id)}
                    onRequestDecrypt={() => onRequestDecrypt(note.id)}
                    formatDate={formatDate}
                    getNotePreview={getNotePreview}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>AI-powered writing assistant</span>
        </div>
      </div>
    </div>
  );
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onRequestDecrypt: () => void;
  formatDate: (date: Date) => string;
  getNotePreview: (content: string) => string;
}

function NoteItem({
  note,
  isSelected,
  onSelect,
  onTogglePin,
  onDelete,
  onRequestDecrypt,
  formatDate,
  getNotePreview
}: NoteItemProps) {
  return (
    <div
      className={cn(
        "group p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 hover:bg-gray-50",
        isSelected && "bg-blue-50 border border-blue-200 shadow-sm"
      )}
      onClick={onSelect}
      data-testid={`note-item-${note.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">
              {note.title || 'Untitled Note'}
            </h3>
            {note.pinned && (
              <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />
            )}
            {note.encrypted && (
              <Lock className="w-3 h-3 text-red-500 flex-shrink-0" />
            )}
          </div>
          
          {!note.encrypted && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {getNotePreview(note.htmlContent)}
            </p>
          )}
          
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>{formatDate(note.updatedAt)}</span>
            {note.tags && note.tags.length > 0 && (
              <span>• {note.tags.length} tags</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {note.encrypted ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDecrypt();
            }}
            className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
            title="Decrypt note"
          >
            <Eye className="w-3 h-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className="h-7 w-7 p-0 hover:bg-amber-100 hover:text-amber-600"
            title={note.pinned ? "Unpin note" : "Pin note"}
          >
            <Pin className="w-3 h-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (note.encrypted) {
              onRequestDecrypt();
              return;
            }
            onDelete();
          }}
          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
          title={note.encrypted ? "Decrypt before deleting" : "Delete note"}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
