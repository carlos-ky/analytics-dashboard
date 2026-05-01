# Analytics Dashboard

Dashboard moderne de gestion de contenu construit avec **React, TypeScript, Tailwind CSS et Supabase**. Permet à un utilisateur de gérer ses articles, ses projets portfolio et ses messages reçus, avec des statistiques en temps réel.

[**Live Demo →**](https://analytics-dashboard-one-tau.vercel.app/)

## Fonctionnalités

- **Authentification** : signup, login, logout via Supabase Auth
- **Routes protégées** : redirection automatique vers /login si non authentifié
- **CRUD Articles** : création, lecture, modification, suppression d'articles avec gestion de statut (brouillon/publié)
- **CRUD Projets** : gestion de projets portfolio avec stack technique, liens GitHub et Live
- **Boîte de messages** : lecture, marquage lu/non lu, suppression, réponse par email
- **Dashboard global** : stats en temps réel + graphique des articles publiés par mois
- **Sécurité multi-utilisateur** : Row Level Security Supabase — chaque utilisateur ne voit que ses propres données
- **Responsive** : desktop et mobile

## Stack

- **Frontend** : React 19, TypeScript, Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router v6
- **Backend-as-a-Service** : Supabase (PostgreSQL + Auth + RLS)
- **Charts** : Recharts
- **Déploiement** : Vercel

## Architecture

```
src/
├── components/       # Composants réutilisables (Layout, Modals, ProtectedRoute)
├── contexts/         # React Context pour l'authentification
├── lib/              # Client Supabase
├── pages/            # Pages principales (Login, Dashboard, Articles, Projects, Messages)
└── types/            # Types TypeScript partagés
```

## Installation locale

```bash
# Cloner le repo
git clone https://github.com/carlos-ky/analytics-dashboard.git
cd analytics-dashboard

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env.local à la racine avec :
# VITE_SUPABASE_URL=votre_url_supabase
# VITE_SUPABASE_ANON_KEY=votre_clé_anon

# Lancer en dev
npm run dev
```

## Schéma de base de données

3 tables principales avec Row Level Security activée :

- `articles` : titre, contenu, extrait, statut, timestamps
- `projects` : titre, description, stack technique (array), URLs, statut
- `messages` : nom, email, sujet, message, statut lu/non lu

Chaque table a 4 policies RLS (SELECT/INSERT/UPDATE/DELETE) qui vérifient `auth.uid() = user_id`.

## Auteur

**Carlos KY** — Frontend Developer
[Portfolio](https://portfolio-flame-chi-66.vercel.app/) · [GitHub](https://github.com/carlos-ky)

## Licence

MIT