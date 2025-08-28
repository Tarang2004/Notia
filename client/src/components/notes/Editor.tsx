import { useCallback, useRef, useEffect, useState } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Save,
  Lock,
  Pin,
  Wand2,
  Bot,
  Download,
  X,
  FileText,
  Sparkles,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { Note } from "@/types/notes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface EditorProps {
  currentNote: Note | null;
  onUpdateNote: (updates: Partial<Note> & { id: string }) => void;
  onTogglePin: (noteId: string) => void;
  onRequestEncrypt: (noteId: string) => void;
  onAnalyzeContent: (content: string) => void;
  isAnalyzing: boolean;
  onToggleAIAssistant: () => void;
  isAIAssistantOpen: boolean;
  onRequestDecrypt: (noteId: string) => void;
}

export function Editor({
  currentNote,
  onUpdateNote,
  onTogglePin,
  onRequestEncrypt,
  onAnalyzeContent,
  isAnalyzing,
  onToggleAIAssistant,
  isAIAssistantOpen,
  onRequestDecrypt
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Update editor content when current note changes
  useEffect(() => {
    if (editorRef.current && currentNote) {
      editorRef.current.innerHTML = currentNote.htmlContent;
      setSaveStatus('saved');
    }
  }, [currentNote?.id]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const normalizeSpaces = (html: string): string => {
    // Replace HTML entity &nbsp; and Unicode NO-BREAK SPACE with regular spaces
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/\xA0/g, ' ');
  };

  const saveNow = useCallback(() => {
    if (!currentNote || !editorRef.current) return;
    try {
      setSaveStatus('saving');
      const rawHtml = editorRef.current.innerHTML;
      const normalized = normalizeSpaces(rawHtml);
      onUpdateNote({ id: currentNote.id, htmlContent: normalized });
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (e) {
      setSaveStatus('unsaved');
    }
  }, [currentNote, onUpdateNote]);

  const handleContentChange = useCallback(() => {
    // Immediately persist content to avoid loss when switching notes
    saveNow();
  }, [saveNow]);

  const handleTitleChange = useCallback((title: string) => {
    if (currentNote) {
      onUpdateNote({ id: currentNote.id, title });
      setLastSaved(new Date());
    }
  }, [currentNote, onUpdateNote]);

  const handleFontSizeChange = useCallback((size: string) => {
    execCommand('fontSize', '7'); // Use largest size first
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      if (selectedText) {
        execCommand('insertHTML', `<span style="font-size: ${size}px">${selectedText}</span>`);
        saveNow();
      }
    }
  }, [execCommand, saveNow]);

  const handleAIAnalyze = useCallback(() => {
    onToggleAIAssistant();
    if (!isAIAssistantOpen && editorRef.current && currentNote) {
      const content = editorRef.current.innerText;
      if (content.trim()) {
        onAnalyzeContent(content);
      }
    }
  }, [currentNote, onAnalyzeContent, onToggleAIAssistant, isAIAssistantOpen]);

  const handleDownloadNote = useCallback(async () => {
    if (!currentNote) return;
    if (currentNote.encrypted) return;

    try {
      const filename = `${(currentNote.title || 'note').replace(/[^a-z0-9]/gi, '_')}.html`;
      const normalized = normalizeSpaces(currentNote.htmlContent);
      const blob = new Blob([normalized], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "⬇️ Note downloaded",
        description: `"${currentNote.title}" has been downloaded as ${filename}`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "❌ Download failed",
        description: "Unable to download the note. Please try again.",
        variant: "destructive"
      });
    }
  }, [currentNote, toast]);

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" data-testid="no-note-selected">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Your Workspace</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Create your first note to start organizing your thoughts, ideas, and knowledge. 
            Your AI assistant is ready to help enhance your writing.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI-powered writing assistant</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="note-editor">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <Input
                type="text"
                value={currentNote.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-3xl font-bold bg-transparent border-none outline-none flex-1 p-0 focus-visible:ring-0 hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="Give your note a title..."
                data-testid="input-note-title"
              />
              
              {/* Note Metadata */}
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Created {currentNote.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Updated {currentNote.updatedAt.toLocaleDateString()}</span>
                </div>
                {currentNote.tags && currentNote.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span>Tags:</span>
                    {currentNote.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Save Status */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Saved</span>
                    {lastSaved && (
                      <span className="text-xs text-gray-400 ml-1">
                        {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRequestEncrypt(currentNote.id)}
                      disabled={currentNote.encrypted}
                      className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title={currentNote.encrypted ? "Note is encrypted" : "Encrypt note"}
                      data-testid="button-encrypt"
                    >
                      <Lock className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{currentNote.encrypted ? "Note is encrypted" : "Encrypt note"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTogglePin(currentNote.id)}
                      disabled={currentNote.encrypted}
                      className={`h-10 w-10 p-0 transition-colors ${
                        currentNote.pinned 
                          ? "text-amber-500 hover:bg-amber-50" 
                          : "hover:bg-gray-100 hover:text-gray-700"
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                      title={currentNote.encrypted ? "Cannot pin encrypted notes" : (currentNote.pinned ? "Unpin note" : "Pin note")}
                      data-testid="button-pin"
                    >
                      <Pin className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{currentNote.pinned ? "Unpin note" : "Pin note"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadNote}
                      disabled={currentNote.encrypted}
                      className="h-10 w-10 p-0 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={currentNote.encrypted ? "Cannot download encrypted notes" : "Download as HTML"}
                      data-testid="button-download"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download as HTML</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Enhanced Toolbar */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 flex-wrap gap-2">
            {/* Format Buttons */}
            <div className="flex items-center space-x-1 flex-wrap gap-1">
              <div className="flex items-center space-x-1 pr-4 border-r border-gray-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { execCommand('bold'); saveNow(); }}
                  className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm transition-all"
                  title="Bold"
                  data-testid="button-bold"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { execCommand('italic'); saveNow(); }}
                  className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm transition-all"
                  title="Italic"
                  data-testid="button-italic"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { execCommand('underline'); saveNow(); }}
                  className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm transition-all"
                  title="Underline"
                  data-testid="button-underline"
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Alignment */}
              <div className="flex items-center space-x-1 pr-4 border-r border-gray-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { execCommand('justifyLeft'); saveNow(); }}
                  className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm transition-all"
                  title="Align Left"
                  data-testid="button-align-left"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { execCommand('justifyCenter'); saveNow(); }}
                  className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm transition-all"
                  title="Align Center"
                  data-testid="button-align-center"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { execCommand('justifyRight'); saveNow(); }}
                  className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm transition-all"
                  title="Align Right"
                  data-testid="button-align-right"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Font Size */}
              <div className="pr-4 border-r border-gray-300">
                <Select onValueChange={handleFontSizeChange} defaultValue="16">
                  <SelectTrigger className="w-24 h-9 bg-white border-gray-300" data-testid="select-font-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="24">24px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* AI Actions */}
            <Button
              onClick={handleAIAnalyze}
              disabled={isAnalyzing}
              className={`h-10 px-6 transition-all duration-200 ${
                isAIAssistantOpen 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg'
              }`}
              data-testid="button-ai-analyze"
            >
              {isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : isAIAssistantOpen ? (
                <X className="w-4 h-4 mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isAIAssistantOpen ? 'Close AI' : 'AI Enhance'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div
            ref={editorRef}
            contentEditable={!currentNote.encrypted}
            className="w-full min-h-[60vh] md:min-h-[600px] p-4 md:p-8 bg-white rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 text-base leading-relaxed outline-none shadow-sm hover:shadow-md transition-all duration-200 prose prose-lg max-w-none"
            onInput={handleContentChange}
            suppressContentEditableWarning={true}
            data-testid="contenteditable-editor"
          />
          
          {currentNote.encrypted && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 bg-opacity-95 flex items-center justify-center rounded-2xl">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Lock className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Note is Encrypted</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  This note is protected with a password. Enter your password to unlock and view the content.
                </p>
                <Button
                  onClick={() => onRequestDecrypt(currentNote.id)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  data-testid="button-unlock-note"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Enter Password to Unlock
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
