# Guide de contribution

## Architecture du projet

### Structure modulaire

Le projet suit une architecture modulaire claire :

```
app/                    # App Router Next.js 16
├── api/                # API Routes (Route Handlers)
│   ├── sensors/        # Gestion des capteurs IoT
│   ├── analysis/       # Analyses IA avec Gemini
│   ├── alerts/         # Système d'alertes
│   └── stats/          # Statistiques globales
├── layout.tsx           # Layout racine
└── page.tsx            # Page principale (Dashboard)

components/
├── ui/                 # Composants UI de base (shadcn/ui)
│   ├── card.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   └── alert.tsx
└── dashboard/          # Composants spécifiques au dashboard
    ├── stats-card.tsx
    ├── risk-indicator.tsx
    ├── sensor-chart.tsx
    ├── alerts-list.tsx
    └── sensors-map.tsx

lib/
├── prisma.ts           # Client Prisma (singleton)
├── gemini.ts           # Intégration Google Gemini API
└── utils.ts            # Utilitaires (cn, etc.)

types/
└── index.ts            # Types TypeScript partagés

prisma/
├── schema.prisma       # Schéma de base de données
└── seed.ts             # Script de seed
```

## Bonnes pratiques

### 1. Composants

- **Server Components par défaut** : Utilisez les Server Components quand possible
- **Client Components** : Marquez avec `"use client"` uniquement si nécessaire (interactivité, hooks, etc.)
- **Composants réutilisables** : Créez des composants dans `components/` pour la réutilisabilité
- **Props typées** : Toujours typer les props avec TypeScript

### 2. API Routes

- **Validation** : Validez toujours les entrées avec Zod si nécessaire
- **Gestion d'erreurs** : Utilisez try/catch et retournez des codes HTTP appropriés
- **Edge Runtime** : Non utilisé car Prisma n'est pas compatible (utilise Node.js runtime)

### 3. Base de données

- **Prisma Client** : Utilisez le singleton depuis `lib/prisma.ts`
- **Migrations** : Utilisez `npm run db:migrate` pour créer des migrations
- **Seed** : Utilisez `npm run db:seed` pour remplir avec des données de test

### 4. Styling

- **Tailwind CSS** : Utilisez les classes Tailwind
- **shadcn/ui** : Utilisez les composants de base depuis `components/ui/`
- **Animations** : Utilisez Framer Motion pour les animations
- **Responsive** : Utilisez les breakpoints Tailwind (sm, md, lg, xl)

### 5. Types

- **Types centralisés** : Définissez les types dans `types/index.ts`
- **Types Prisma** : Utilisez les types générés par Prisma quand possible
- **Interfaces** : Préférez les interfaces pour les types d'objets

## Ajouter une nouvelle fonctionnalité

### Exemple : Ajouter un nouveau type de capteur

1. **Mettre à jour le schéma Prisma** :
```prisma
// prisma/schema.prisma
model Sensor {
  // ... champs existants
  newField String?
}
```

2. **Générer le client** :
```bash
npm run db:generate
npm run db:push
```

3. **Créer/Modifier l'API Route** :
```typescript
// app/api/sensors/route.ts
// Ajouter la logique pour le nouveau champ
```

4. **Mettre à jour les types** :
```typescript
// types/index.ts
export interface Sensor {
  // ... champs existants
  newField?: string
}
```

5. **Mettre à jour les composants** :
```typescript
// components/dashboard/sensors-map.tsx
// Utiliser le nouveau champ
```

## Tests

Pour tester l'application :

1. **Lancer le serveur de développement** :
```bash
npm run dev
```

2. **Vérifier les API Routes** :
- Utilisez Postman, Insomnia ou curl
- Ou utilisez les composants React qui appellent les APIs

3. **Vérifier la base de données** :
```bash
npm run db:studio
```

## Débogage

### Problèmes courants

1. **Erreur Prisma** : Vérifiez que `npm run db:generate` a été exécuté
2. **Erreur Gemini API** : Vérifiez que `GEMINI_API_KEY` est défini dans `.env`
3. **Erreur de build** : Vérifiez que toutes les dépendances sont installées avec `npm install`

## Performance

- **Server Components** : Utilisez-les pour réduire le JavaScript côté client
- **Images** : Utilisez le composant `Image` de Next.js pour l'optimisation
- **API Routes** : Utilisez la mise en cache quand approprié
- **Base de données** : Utilisez les index Prisma pour les requêtes fréquentes

