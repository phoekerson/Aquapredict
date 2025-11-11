# Pandemic Early Warning Dashboard

Application Next.js 16 complète pour la surveillance en temps réel des eaux usées et la détection précoce d'épidémies à l'aide d'IA (Google Gemini) et de capteurs IoT.

## 🚀 Stack technique

- **Next.js 16** (App Router, TypeScript, Server Components, Server Actions)
- **Tailwind CSS** + **shadcn/ui** pour le design
- **Recharts** pour les graphiques
- **Framer Motion** pour les animations
- **Lucide-react** pour les icônes
- **Google Gemini API** pour l'IA prédictive et les résumés
- **Prisma** + **SQLite** pour la base de données
- **API REST** interne (Route Handlers dans `/app/api`)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Clé API Google Gemini

## 🛠️ Installation

1. **Cloner le projet** (ou utiliser le projet existant)

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :
Créez un fichier `.env` à la racine du projet :
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=votre_cle_api_gemini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Initialiser la base de données** :
```bash
npm run db:generate
npm run db:push
npm run db:seed  # Optionnel : ajouter des données de démonstration
```

5. **Lancer le serveur de développement** :
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
├── app/
│   ├── api/              # API Routes
│   │   ├── sensors/      # Gestion des capteurs
│   │   ├── analysis/     # Analyses IA
│   │   ├── alerts/       # Alertes
│   │   └── stats/        # Statistiques
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Page d'accueil (Dashboard)
├── components/
│   ├── ui/               # Composants UI de base (shadcn)
│   └── dashboard/        # Composants du dashboard
├── lib/
│   ├── prisma.ts         # Client Prisma
│   ├── gemini.ts         # Intégration Google Gemini
│   └── utils.ts          # Utilitaires
├── prisma/
│   └── schema.prisma     # Schéma de base de données
└── types/
    └── index.ts          # Types TypeScript
```

## 🎯 Fonctionnalités

### Dashboard
- **Statistiques en temps réel** : nombre de capteurs, lectures, niveau de risque
- **Indicateur de risque** : visualisation du niveau de risque actuel avec confiance
- **Graphiques** : évolution de la charge bactérienne et virale
- **Carte des capteurs** : vue d'ensemble du réseau de capteurs
- **Liste des alertes** : alertes actives nécessitant une attention

### API REST

#### Capteurs
- `GET /api/sensors` - Liste tous les capteurs
- `POST /api/sensors` - Créer un nouveau capteur
- `GET /api/sensors/[id]/readings` - Récupérer les lectures d'un capteur
- `POST /api/sensors/[id]/readings` - Ajouter une lecture

#### Analyses
- `GET /api/analysis` - Liste les analyses
- `POST /api/analysis` - Créer une nouvelle analyse (avec IA)

#### Alertes
- `GET /api/alerts` - Liste les alertes
- `PATCH /api/alerts` - Mettre à jour une alerte

#### Statistiques
- `GET /api/stats` - Statistiques globales du dashboard

## 🔧 Scripts disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run start` - Lancer le serveur de production
- `npm run lint` - Lancer ESLint
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la base de données
- `npm run db:seed` - Remplir la base de données avec des données de démonstration
- `npm run db:studio` - Ouvrir Prisma Studio
- `npm run db:migrate` - Créer une migration

## 🗄️ Base de données

Le schéma Prisma inclut :
- **Sensor** : Informations sur les capteurs IoT
- **SensorReading** : Lectures des capteurs (température, pH, charge bactérienne, etc.)
- **Analysis** : Analyses IA avec prédictions
- **Alert** : Alertes générées par le système

## 🤖 Intégration Google Gemini

L'application utilise Google Gemini pour :
- Analyser les données des capteurs
- Générer des résumés en français
- Produire des prédictions de risque sur 7 jours
- Recommander des actions

## 🎨 Design

L'interface utilise :
- **shadcn/ui** pour les composants de base
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations fluides
- **Recharts** pour les visualisations de données

## 📝 Notes

- Les API routes utilisent le runtime Node.js (pas Edge) car Prisma n'est pas compatible avec Edge Runtime
- L'application se rafraîchit automatiquement toutes les 30 secondes
- Les alertes sont générées automatiquement lorsque le niveau de risque est élevé ou critique

## 🔐 Sécurité

- Ne commitez jamais le fichier `.env`
- Utilisez des variables d'environnement pour les clés API
- Validez toutes les entrées utilisateur

## 📄 Licence

Ce projet est un prototype éducatif.
