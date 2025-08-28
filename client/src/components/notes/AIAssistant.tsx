import { AIAnalysis } from "@/types/notes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Tag, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Brain,
  Lightbulb,
  FileText
} from "lucide-react";

interface AIAssistantProps {
  analysis: AIAnalysis;
  isAnalyzing: boolean;
  error: string | null;
  onRefresh: () => void;
  onAddTag: (tag: string) => void;
}

export function AIAssistant({
  analysis,
  isAnalyzing,
  error,
  onRefresh,
  onAddTag
}: AIAssistantProps) {
  const hasContent = analysis.summary || 
    (analysis.suggestedTags && analysis.suggestedTags.length > 0) ||
    (analysis.glossaryTerms && analysis.glossaryTerms.length > 0) ||
    (analysis.grammarIssues && analysis.grammarIssues.length > 0);

  if (error) {
    return (
      <div className="w-full md:w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Analysis Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-96 bg-white border-l border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Writing Assistant</h2>
            <p className="text-purple-100 text-sm">Powered by Gemini AI</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">AI is analyzing your content...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        )}

        {!isAnalyzing && !hasContent && (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No analysis yet</h3>
            <p className="text-gray-500 text-sm">
              Open AI from the editor to analyze your note
            </p>
          </div>
        )}

        {!isAnalyzing && hasContent && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="summary" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="tags" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                Tags
              </TabsTrigger>
              <TabsTrigger value="glossary" className="text-xs">
                <BookOpen className="w-3 h-3 mr-1" />
                Terms
              </TabsTrigger>
              <TabsTrigger value="grammar" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Grammar
              </TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-purple-800">
                    <Sparkles className="w-4 h-4" />
                    <span>Content Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {analysis.summary || "No summary available"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tags Tab */}
            <TabsContent value="tags" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>Suggested Tags</span>
                  </CardTitle>
                  <CardDescription>
                    AI-recommended tags to help organize your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.suggestedTags && analysis.suggestedTags.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {analysis.suggestedTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => onAddTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Click on any tag to add it to your note
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No tags suggested</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Glossary Tab */}
            <TabsContent value="glossary" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <span>Key Terms</span>
                  </CardTitle>
                  <CardDescription>
                    Important terms and concepts found in your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.glossaryTerms && analysis.glossaryTerms.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.glossaryTerms.map((term, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <dt className="font-semibold text-gray-800 mb-1">
                            {term.term}
                          </dt>
                          <dd className="text-sm text-gray-600">
                            {term.definition}
                          </dd>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No key terms identified</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Grammar Tab */}
            <TabsContent value="grammar" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                    <span>Writing Suggestions</span>
                  </CardTitle>
                  <CardDescription>
                    Grammar, spelling, and style improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.grammarIssues && analysis.grammarIssues.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.grammarIssues.map((issue, index) => (
                        <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-800 mb-1">
                                {issue.issue}
                              </p>
                              <div className="text-xs space-y-1">
                                <p className="text-amber-700">
                                  <span className="font-medium">Current:</span> "{issue.text}"
                                </p>
                                <p className="text-green-700">
                                  <span className="font-medium">Suggestion:</span> "{issue.suggestion}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 font-medium">Great writing!</p>
                      <p className="text-green-600 text-sm">No issues found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>AI powered by Gemini</span>
          <span>Real-time analysis</span>
        </div>
      </div>
    </div>
  );
}
