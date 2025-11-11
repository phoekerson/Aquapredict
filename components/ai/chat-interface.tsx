"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Send, Loader2, Bot, User, FileSpreadsheet, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onAnalysisComplete?: (analysis: any) => void
}

export function ChatInterface({ onAnalysisComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Bonjour ! Je suis votre assistant IA pour l'analyse des données d'eaux usées. Posez-moi des questions ou chargez un fichier Excel pour que je l'analyse.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ]
      const validExtensions = [".xlsx", ".xls", ".csv"]

      const isValidType =
        validTypes.includes(file.type) ||
        validExtensions.some((ext) => file.name.endsWith(ext))

      if (isValidType) {
        setAttachedFile(file)
      } else {
        alert("Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV")
      }
    }
  }

  const handleRemoveFile = () => {
    setAttachedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return

    let messageContent = input
    let fileData = null

    // Si un fichier est attaché, l'analyser d'abord
    if (attachedFile) {
      setIsLoading(true)
      try {
        const formData = new FormData()
        formData.append("file", attachedFile)

        const fileResponse = await fetch("/api/ai/analyze-file", {
          method: "POST",
          body: formData,
        })

        if (fileResponse.ok) {
          const fileAnalysis = await fileResponse.json()
          fileData = fileAnalysis

          // Ajouter un message système sur le fichier analysé
          const fileMessage: Message = {
            id: `file-${Date.now()}`,
            role: "assistant",
            content: `Fichier "${attachedFile.name}" analysé avec succès. ${fileAnalysis.summary || "Les données ont été traitées."}`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, fileMessage])

          // Si l'analyse contient des données structurées, les passer au callback
          if (fileAnalysis && onAnalysisComplete) {
            onAnalysisComplete(fileAnalysis)
          }

          // Si l'utilisateur n'a pas de message texte, utiliser un message par défaut
          if (!input.trim()) {
            messageContent = `Analyse le fichier "${attachedFile.name}" que je viens de charger.`
          } else {
            messageContent = `${input}\n\n[Fichier "${attachedFile.name}" joint et analysé]`
          }
        }
      } catch (error) {
        console.error("Error analyzing file:", error)
        // Continuer même si l'analyse du fichier échoue
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent || (attachedFile ? `Analyse le fichier "${attachedFile.name}"` : ""),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent || userMessage.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          fileAnalysis: fileData, // Inclure l'analyse du fichier dans le contexte
        }),
      })

      let data: any = {}
      try {
        data = await response.json()
      } catch (parseError) {
        console.warn("Unable to parse chat response JSON:", parseError)
      }

      if (!response.ok || data.error) {
        const errorMessage =
          data?.error ||
          data?.details ||
          `Erreur serveur (${response.status}). Vérifiez que GEMINI_API_KEY est correctement configuré.`

        const assistantErrorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❗ ${errorMessage}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantErrorMessage])
        return
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response ||
          data.error ||
          "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Si l'analyse contient des données structurées, les passer au callback
      if (data.analysis && onAnalysisComplete) {
        onAnalysisComplete(data.analysis)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const friendlyMessage =
        error instanceof Error
          ? error.message
          : "Impossible de contacter l'assistant pour le moment."
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❗ ${friendlyMessage}\n\nSi le problème persiste, vérifiez que GEMINI_API_KEY est correctement configuré.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Assistant IA - Analyse de données
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 space-y-2">
          {/* Fichier attaché */}
          {attachedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="text-sm flex-1 truncate">{attachedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRemoveFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="chat-file-upload"
                disabled={isLoading}
              />
              <label htmlFor="chat-file-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-[60px] w-[60px]"
                  disabled={isLoading}
                  title="Joindre un fichier Excel (optionnel)"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez une question ou demandez une analyse... (fichier Excel optionnel)"
                className="flex-1 min-h-[60px] max-h-[120px] p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedFile)}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

