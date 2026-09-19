# MikadoTimer

Webapp React qui répartit le temps d'une réunion entre ses sujets et redistribue automatiquement l'avance ou le retard sur ceux qui restent.

## Stack

- React 19 ;
- Vite ;
- JavaScript moderne et CSS natif ;
- Vitest pour le moteur métier ;
- ESLint pour la qualité du code ;
- déploiement statique sur Vercel.

## Démarrage local

```bash
npm install
npm run dev
```

Vite affiche ensuite l'URL locale, généralement <http://localhost:5173>.

## Commandes

| Commande | Utilité |
| --- | --- |
| `npm run dev` | Lance le serveur de développement. |
| `npm run build` | Produit le bundle optimisé dans `dist/`. |
| `npm run preview` | Sert localement le bundle de production. |
| `npm run lint` | Vérifie le code JavaScript et JSX. |
| `npm test` | Exécute les tests unitaires une fois. |

## Structure

```text
src/
├── components/           # Composants d'interface spécialisés
├── data/                 # Contenu éditorial de Mister Timer
├── domain/               # Moteur métier pur et tests unitaires
├── hooks/                # État React et boucle du chronomètre
├── styles/               # Design system et styles responsive
├── App.jsx               # Composition de l'application
└── main.jsx              # Point d'entrée React
```

La logique de calcul est isolée dans `src/domain/meeting.js`. Les composants ne recalculent pas les règles d'allocation : ils consomment les fonctions du domaine et restent centrés sur l'affichage. Le hook `useMeetingTimer` possède l'état de la réunion et expose les actions de configuration, lecture, passage au sujet suivant, renommage et réinitialisation.

## Fonctionnement

1. La durée totale est divisée à parts égales entre les sujets.
2. Le chronomètre utilise `performance.now()` pour mesurer le temps écoulé.
3. Un sujet terminé en avance libère du temps pour chacun des sujets suivants.
4. Un dépassement réduit en direct leur budget disponible.
5. Le tableau de bord, Mister Timer et le graphe radial sont dérivés du même état.

Les entrées sont bornées à 1–480 minutes et 2–100 sujets. Trois formats prédéfinis permettent aussi de préparer instantanément une réunion de 60, 90 ou 120 minutes.

## Déploiement Vercel

Le dépôt contient `vercel.json` avec le preset Vite, la commande de build et le dossier de sortie. Depuis le tableau de bord Vercel :

1. importer le dépôt Git ;
2. conserver le framework **Vite** détecté automatiquement ;
3. lancer le déploiement.

En ligne de commande :

```bash
npx vercel
```

Aucune variable d'environnement n'est nécessaire.

## Accessibilité

- structure sémantique et libellés explicites ;
- statut et assistant annoncés aux technologies d'assistance ;
- description du graphe SVG ;
- navigation clavier et indicateurs de focus visibles ;
- raccourcis `Espace` pour lancer la réunion et `Entrée` pour le sujet suivant ;
- animations réduites lorsque `prefers-reduced-motion` est activé.
