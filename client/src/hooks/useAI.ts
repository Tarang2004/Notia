import { useState, useCallback } from "react";
import { AIAnalysis } from "@/types/notes";
import { analyzeContent } from "@/lib/gemini";

export function useAI() {
  const [analysis, setAnalysis] = useState<AIAnalysis>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeNote = useCallback(async (content: string) => {
    if (!content.trim()) {
      setAnalysis({});
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeContent(content);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to analyze content. Please check your API key and try again.");
      console.error("AI analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis({});
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeNote,
    clearAnalysis
  };
}
