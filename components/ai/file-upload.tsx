"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileAnalyzed?: (analysis: any) => void
}

export function FileUpload({ onFileAnalyzed }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Vérifier que c'est un fichier Excel
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ]
      const validExtensions = [".xlsx", ".xls", ".csv"]

      const isValidType =
        validTypes.includes(selectedFile.type) ||
        validExtensions.some((ext) => selectedFile.name.endsWith(ext))

      if (isValidType) {
        setFile(selectedFile)
        setError(null)
        setSuccess(false)
      } else {
        setError("Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV")
        setFile(null)
      }
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".xlsx,.xls,.csv"
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(droppedFile)
      input.files = dataTransfer.files
      handleFileSelect({ target: input } as any)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleRemove = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setIsAnalyzing(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/ai/analyze-file", {
        method: "POST",
        body: formData,
      })

      let data: any = {}
      try {
        data = await response.json()
      } catch {
        // ignore json parse error; we'll fallback to generic
      }

      if (!response.ok) {
        const message =
          data?.error ||
          data?.details ||
          "Erreur lors de l'analyse du fichier. Vérifiez le format (.xlsx, .xls, .csv) et la taille du fichier."
        throw new Error(message)
      }

      setSuccess(true)

      if (onFileAnalyzed) {
        onFileAnalyzed(data)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors de l'analyse"
      )
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Charger et analyser un fichier Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone de dépôt */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            file
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          {file ? (
            <div className="space-y-2">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-2" />
                Retirer
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">
                  Glissez-déposez un fichier Excel ici
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou cliquez pour sélectionner
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild={true}>
                  <span>Sélectionner un fichier</span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Messages d'état */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-600 dark:text-green-400 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Fichier analysé avec succès ! Les résultats sont affichés ci-dessous.
          </motion.div>
        )}

        {/* Bouton d'analyse */}
        {file && !success && (
          <Button
            onClick={handleUpload}
            disabled={isUploading || isAnalyzing}
            className="w-full"
          >
            {isUploading || isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? "Téléchargement..." : "Analyse en cours..."}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Analyser avec l'IA
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

