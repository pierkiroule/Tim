# MikadoTimer

Webapp React qui répartit le temps d'une réunion entre ses sujets et redistribue automatiquement l'avance ou le retard sur ceux qui restent.

Le cadrage proposé au démarrage est de 3 heures d’échanges, 30 sujets et 15 minutes de pause prévue. Un bouton permet de charger un cadrage démo de 3 minutes, 10 sujets et 1 minute de pause.

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
2. Le chronomètre s'appuie sur l'horloge réelle et rattrape immédiatement le temps écoulé après une mise en veille, un changement d'onglet ou la restauration de la page.
3. Un sujet terminé en avance libère du temps pour chacun des sujets suivants.
4. Un dépassement réduit en direct leur budget disponible.
5. Une pause peut être lancée à tout moment ; chaque seconde écoulée est redistribuée en direct sur les sujets restants.
6. Le tableau de bord, Mister Time et le graphe radial sont dérivés du même état.

Les entrées sont bornées à 1–480 minutes et 1–100 sujets. Une durée de pause prévue peut être ajoutée à l’heure de fin.

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

## Messages audio

Le bouton haut-parleur de l’en-tête active ou désactive ensemble les signatures sonores et la voix de Mister Time. Les messages sont **désactivés par défaut** et la préférence est conservée localement, indépendamment de la réunion.

Quatre événements seulement sont annoncés : le démarrage de la réunion, l’arrivée à 80 % du temps d’un sujet, le début d’une pause et la reprise (avec le nombre de situations et leur temps disponible). L’activation ne rejoue jamais les événements déjà passés et la désactivation interrompt immédiatement une phrase en cours.

Cette fonction utilise les API natives Web Audio et SpeechSynthesis. Elle se dégrade sans bloquer le chronomètre lorsqu’une API est absente ou désactivée par le navigateur.

## Téléphone, veille et arrière-plan

Pendant une réunion en cours, pauses comprises, l'application demande au navigateur de garder l'écran éveillé lorsque l'API Screen Wake Lock est disponible. Le verrou est relâché à la fin de la réunion, puis redemandé automatiquement au retour dans l'application si le navigateur l'a libéré pendant un passage en arrière-plan.

Les navigateurs mobiles pouvant suspendre les minuteurs JavaScript quand une autre application ou un autre onglet passe au premier plan, MikadoTimer ne dépend pas de la fréquence de rafraîchissement : au retour, il calcule le temps réellement écoulé avec l'horloge du téléphone. L'état courant est également sauvegardé localement et restauré si le système décharge complètement la page. Les restrictions du système peuvent toujours éteindre l'écran, mais elles ne figent pas le décompte.
