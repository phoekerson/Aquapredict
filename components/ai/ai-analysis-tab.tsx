"use client"

import { useState } from "react"
import { ChatInterface } from "./chat-interface"
import { FileUpload } from "./file-upload"
import { AnalysisResults } from "./analysis-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Upload, BarChart3 } from "lucide-react"

export function AIAnalysisTab() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const handleAnalysisComplete = (analysis: any) => {
    if (analysis) {
      setAnalysisResults(analysis)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat avec l'IA
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Analyser un fichier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-1">
              <ChatInterface onAnalysisComplete={handleAnalysisComplete} />
            </div>
            {analysisResults && (
              <div className="lg:col-span-1">
                <AnalysisResults analysis={analysisResults} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-6">
            <FileUpload onFileAnalyzed={handleAnalysisComplete} />
            {analysisResults && (
              <AnalysisResults analysis={analysisResults} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

