import { GoogleGenAI } from "@google/genai";
import { AIAnalysis, GlossaryTerm, GrammarIssue } from "@/types/notes";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" 
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry API calls
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`AI API attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await delay(RETRY_DELAY * attempt);
      }
    }
  }
  
  throw lastError!;
}

export async function summarizeContent(content: string): Promise<string> {
  try {
    const prompt = `You are a professional content analyst. Please provide a concise, engaging 2-3 sentence summary of the following content. Focus on the main ideas and key insights. Make it easy to understand for someone who hasn't read the original content.

Content to summarize:
${content}

Summary:`;

    const response = await retryOperation(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 150,
        }
      });
    });

    return response.text || "Unable to generate summary";
  } catch (error) {
    console.error("Error summarizing content:", error);
    return "Summary unavailable due to technical issues";
  }
}

export async function suggestTags(content: string): Promise<string[]> {
  try {
    const systemPrompt = `You are a content organization expert. Your task is to analyze the given content and suggest 4-6 relevant, specific tags that would help categorize and organize this content effectively.

Guidelines for tag suggestions:
- Use clear, descriptive terms (2-3 words max)
- Avoid overly generic terms like "general" or "misc"
- Focus on main topics, themes, and concepts
- Use lowercase, no spaces (use hyphens if needed)
- Make tags searchable and useful for organization

Respond with JSON in this exact format:
{"tags": ["tag1", "tag2", "tag3", "tag4"]}`;

    const response = await retryOperation(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              tags: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 6
              }
            },
            required: ["tags"]
          }
        },
        contents: content,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        }
      });
    });

    const rawJson = response.text;
    if (rawJson) {
      try {
        const data = JSON.parse(rawJson);
        if (data.tags && Array.isArray(data.tags)) {
          return data.tags.slice(0, 6); // Ensure max 6 tags
        }
      } catch (parseError) {
        console.warn("Failed to parse tags JSON, attempting fallback:", parseError);
        // Fallback: extract meaningful words from content
        const words = content.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3 && word.length < 12)
          .slice(0, 5);
        return words;
      }
    }
    return [];
  } catch (error) {
    console.error("Error suggesting tags:", error);
    return [];
  }
}

export async function extractGlossaryTerms(content: string): Promise<GlossaryTerm[]> {
  try {
    const systemPrompt = `You are a content analysis expert specializing in identifying key technical terms, acronyms, and specialized concepts.

Your task is to identify terms in the content that would benefit from definitions or explanations. Focus on:
- Technical jargon or industry-specific terms
- Acronyms and abbreviations
- Complex concepts that might need clarification
- Specialized terminology

For each term, provide a clear, concise definition that would help a general audience understand the content better.

Respond with JSON in this exact format:
{"terms": [{"term": "API", "definition": "Application Programming Interface - a set of rules that allows programs to communicate with each other"}]}

Limit to 5-8 most important terms.`;

    const response = await retryOperation(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              terms: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    term: { type: "string" },
                    definition: { type: "string" }
                  },
                  required: ["term", "definition"]
                },
                minItems: 1,
                maxItems: 8
              }
            },
            required: ["terms"]
          }
        },
        contents: content,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 400,
        }
      });
    });

    const rawJson = response.text;
    if (rawJson) {
      try {
        const data = JSON.parse(rawJson);
        if (data.terms && Array.isArray(data.terms)) {
          return data.terms.slice(0, 8); // Ensure max 8 terms
        }
      } catch (parseError) {
        console.warn("Failed to parse glossary JSON:", parseError);
      }
    }
    return [];
  } catch (error) {
    console.error("Error extracting glossary terms:", error);
    return [];
  }
}

export async function checkGrammar(content: string): Promise<GrammarIssue[]> {
  try {
    const systemPrompt = `You are a professional writing editor and grammar expert. Your task is to analyze the given content for writing issues that could be improved.

Look for:
- Grammar errors (subject-verb agreement, tense consistency, etc.)
- Spelling mistakes
- Punctuation issues
- Awkward phrasing or unclear sentences
- Style improvements (word choice, sentence structure)

For each issue found, provide:
1. The specific text with the problem
2. A suggested correction
3. A brief explanation of the issue

Respond with JSON in this exact format:
{"issues": [{"text": "team's", "suggestion": "teams", "issue": "Subject-verb agreement issue"}]}

Only include genuine issues that would improve the writing. If the content is well-written, return an empty issues array.`;

    const response = await retryOperation(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    suggestion: { type: "string" },
                    issue: { type: "string" }
                  },
                  required: ["text", "suggestion", "issue"]
                }
              }
            },
            required: ["issues"]
          }
        },
        contents: content,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        }
      });
    });

    const rawJson = response.text;
    if (rawJson) {
      try {
        const data = JSON.parse(rawJson);
        if (data.issues && Array.isArray(data.issues)) {
          return data.issues.slice(0, 10); // Ensure max 10 issues
        }
      } catch (parseError) {
        console.warn("Failed to parse grammar JSON:", parseError);
      }
    }
    return [];
  } catch (error) {
    console.error("Error checking grammar:", error);
    return [];
  }
}

export async function analyzeContent(content: string): Promise<AIAnalysis> {
  if (!content.trim()) {
    return {
      summary: "No content to analyze",
      suggestedTags: [],
      glossaryTerms: [],
      grammarIssues: []
    };
  }

  try {
    console.log("Starting AI analysis of content...");
    
    // Run all analysis functions in parallel with individual error handling
    const [summary, tags, glossaryTerms, grammarIssues] = await Promise.allSettled([
      summarizeContent(content),
      suggestTags(content),
      extractGlossaryTerms(content),
      checkGrammar(content)
    ]);

    const result: AIAnalysis = {
      summary: summary.status === 'fulfilled' ? summary.value : "Summary unavailable",
      suggestedTags: tags.status === 'fulfilled' ? tags.value : [],
      glossaryTerms: glossaryTerms.status === 'fulfilled' ? glossaryTerms.value : [],
      grammarIssues: grammarIssues.status === 'fulfilled' ? grammarIssues.value : []
    };

    console.log("AI analysis completed successfully:", result);
    return result;
    
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return {
      summary: "Analysis failed due to technical issues",
      suggestedTags: [],
      glossaryTerms: [],
      grammarIssues: []
    };
  }
}
