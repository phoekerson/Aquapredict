import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import * as XLSX from "xlsx"

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set")
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    // Lire le fichier Excel
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // Convertir toutes les feuilles en JSON
    const sheetsData: Record<string, any[]> = {}
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      sheetsData[sheetName] = jsonData
    })

    // Préparer les données pour Gemini (limiter la taille)
    const dataSummary = JSON.stringify(sheetsData).slice(0, 50000) // Limiter à 50KB

    if (!genAI) {
      // Mode démonstration sans API
      return NextResponse.json({
        summary:
          "Mode démonstration: L'API Gemini n'est pas configurée. Veuillez définir GEMINI_API_KEY pour analyser les fichiers.",
        charts: [
          {
            type: "bar",
            title: "Exemple de graphique en barres",
            data: [
              { name: "Jan", value: 100 },
              { name: "Fév", value: 150 },
              { name: "Mar", value: 200 },
            ],
            xKey: "name",
            yKey: "value",
          },
        ],
        tables: [
          {
            title: "Aperçu des données",
            headers: ["Colonne 1", "Colonne 2", "Colonne 3"],
            rows: [
              ["Donnée 1", "Donnée 2", "Donnée 3"],
              ["Donnée 4", "Donnée 5", "Donnée 6"],
            ],
          },
        ],
        insights: [
          "Le fichier a été chargé avec succès",
          "Configurez GEMINI_API_KEY pour une analyse complète",
        ],
      })
    }

    // Essayer plusieurs modèles compatibles si l'un n'est pas disponible
    const candidateModels = [
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ] as const

    const prompt = `Tu es un expert en analyse de données. Analyse ce fichier Excel de données d'eaux usées et fournis:

1. Un résumé détaillé des données (nombre de lignes, colonnes, types de données, valeurs manquantes)
2. Des suggestions de graphiques appropriés (bar, line, pie) avec les données formatées en JSON
3. Des tableaux récapitulatifs des données importantes
4. Des insights clés et recommandations

Format de réponse JSON:
{
  "summary": "résumé textuel",
  "charts": [
    {
      "type": "bar" | "line" | "pie",
      "title": "Titre du graphique",
      "data": [{"name": "...", "value": ...}, ...],
      "xKey": "name",
      "yKey": "value"
    }
  ],
  "tables": [
    {
      "title": "Titre du tableau",
      "headers": ["Col1", "Col2", ...],
      "rows": [["val1", "val2", ...], ...]
    }
  ],
  "insights": ["insight 1", "insight 2", ...]
}

Données du fichier:
${dataSummary}

Réponds UNIQUEMENT avec du JSON valide, sans markdown.`

    let text = ""
    let lastError: unknown = null
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        text = response.text()
        break
      } catch (err) {
        lastError = err
        continue
      }
    }

    if (!text) {
      throw lastError ?? new Error("Aucun modèle Gemini compatible n'a répondu.")
    }

    // Extraire le JSON de la réponse
    let analysis
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (error) {
      // Si l'extraction JSON échoue, créer une réponse de base
      analysis = {
        summary: text || "Analyse complétée. Les données ont été traitées.",
        charts: [],
        tables: [],
        insights: ["Les données ont été analysées avec succès"],
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing file:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse du fichier",
        details: error instanceof Error ? error.message : "Unknown error",
        hint:
          "Modèles essayés: gemini-1.5-flash-8b, gemini-1.5-flash, gemini-1.5-pro. Vous pouvez ajuster la liste dans /app/api/ai/analyze-file/route.ts",
      },
      { status: 500 }
    )
  }
}

