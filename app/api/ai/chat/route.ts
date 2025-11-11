import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set")
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory, fileAnalysis } = body

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    if (!genAI) {
      return NextResponse.json({
        response: `Mode démonstration activé. 

Pour utiliser l'IA Gemini, veuillez configurer la variable d'environnement GEMINI_API_KEY.

Réponse de démonstration à votre question: "${message}"

Dans un environnement de production avec Gemini configuré, je pourrais analyser vos données d'eaux usées, détecter des tendances, identifier des risques d'épidémies, et générer des visualisations personnalisées.`,
        analysis: null,
      })
    }

    // Liste des modèles à essayer dans l'ordre (mis à jour janvier 2025)
    const candidateModels = [
      "gemini-2.5-flash"
    ]

    const systemPrompt = `Tu es un expert en analyse de données d'eaux usées et en épidémiologie. 
Tu aides les utilisateurs à comprendre leurs données, détecter des tendances, et identifier des risques potentiels.

Contexte: L'utilisateur travaille avec un système de surveillance des eaux usées pour la détection précoce d'épidémies.
Tu dois fournir des réponses claires, précises et actionnables en français.

Si l'utilisateur pose des questions sur les données, fournis des analyses détaillées.
Si l'utilisateur demande des visualisations, suggère les types de graphiques appropriés.`

    let fileContext = ""
    if (fileAnalysis) {
      fileContext = `\n\nContexte du fichier analysé:
${fileAnalysis.summary ? `Résumé: ${fileAnalysis.summary}` : ""}
${fileAnalysis.insights ? `Insights: ${fileAnalysis.insights.join(", ")}` : ""}
Utilise ces informations pour répondre à la question de l'utilisateur.`
    }

    const fullPrompt = `${systemPrompt}${fileContext}

Historique de la conversation:
${conversationHistory
  .map((msg: any) => `${msg.role}: ${msg.content}`)
  .join("\n")}

Utilisateur: ${message}
Assistant:`

    let text = ""
    let lastError: Error | null = null
    let successModel = ""

    for (const modelName of candidateModels) {
      try {
        console.log(`🔄 Tentative avec le modèle: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        text = response.text()
        successModel = modelName
        console.log(`✅ Succès avec le modèle: ${modelName}`)
        break
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`❌ Échec avec ${modelName}: ${errorMsg}`)
        lastError = err instanceof Error ? err : new Error(String(err))
        continue
      }
    }

    if (!text) {
      console.error("❌ Aucun modèle n'a fonctionné")
      return NextResponse.json(
        {
          error: "Aucun modèle Gemini disponible n'a pu traiter la requête",
          details: lastError?.message || "Tous les modèles ont échoué",
          hint: `Modèles essayés: ${candidateModels.join(", ")}. Vérifiez votre clé API sur https://makersuite.google.com/app/apikey`,
        },
        { status: 500 }
      )
    }

    // Extraire des données structurées si présentes
    let analysis = null
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      // Pas de JSON, ce n'est pas grave
    }

    return NextResponse.json({
      response: text,
      analysis,
      modelUsed: successModel, // Pour déboguer
    })

  } catch (error) {
    console.error("❌ Error in chat API:", error)
    return NextResponse.json(
      {
        error: "Une erreur s'est produite lors du traitement de votre demande",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}