export interface Note {
  id: string;
  title: string;
  htmlContent: string;
  pinned: boolean;
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  encryptedData?: {
    cipherText: string;
    iv: string;
    salt: string;
  };
  tags?: string[];
}

export interface AIAnalysis {
  summary?: string;
  suggestedTags?: string[];
  glossaryTerms?: GlossaryTerm[];
  grammarIssues?: GrammarIssue[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  position?: { start: number; end: number };
}

export interface GrammarIssue {
  text: string;
  suggestion: string;
  issue: string;
  position?: { start: number; end: number };
}

export interface EncryptionResult {
  cipherText: string;
  iv: string;
  salt: string;
}
