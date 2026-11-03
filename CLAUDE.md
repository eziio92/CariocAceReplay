# CariocAce Replay : instructions pour Claude

Ce dépôt publie des pages « une main à deviner » (GitHub Pages). Chaque main est un dossier `<slug>/index.html`
généré par `python3 tools/build.py` à partir de `tools/hands.json`. Ne jamais éditer les `index.html` à la main.

## À chaque nouvelle main à publier

1. **Poser la question du titre avant de construire quoi que ce soit** : « Quel titre afficher en haut de la page ? »
   (exemple : « Main Event KSOP buy-in 1000 euros »). Un titre par main, jamais réutilisé sans demander. Ne pas deviner.
2. Enregistrer la main dans `tools/hands/<slug>.txt` (`main-3`, `main-4`, …) en retirant les lignes `Tags :` et `Note :` :
   ce sont les notes privées de l'auteur et le dépôt est public.
3. Ajouter l'entrée `{slug, title, file}` dans `tools/hands.json`, puis lancer `python3 tools/build.py`.
4. Jouer la page une fois dans un navigateur (Playwright) : le bandeau reste en haut, le titre s'affiche, pas de débordement.
5. Commit + push sur `main`. Le lien est `https://eziio92.github.io/CariocAceReplay/<slug>/` (1 à 2 minutes de mise en ligne).

## Règles fixes

- Le bandeau « CariocAce Replay » reste toujours visible en haut de la page, avant et pendant la main.
- Les réponses partent en notification ntfy vers le canal de `tools/config.json`. Ne pas changer le canal sans que l'auteur le demande.
- Une seule réponse envoyée par navigateur et par main.
- Ne pas toucher au dépôt `CariocAce-Hands` (l'appli de prise de note) : il a son propre service worker.
- Termes de poker en anglais (fold, call, raise). Interface en français. Noir et platine, pas de vert, pas d'or, pas de serif.
- Le code source de la page est `tools/replay-source.html`. Toute évolution se fait là, puis on reconstruit toutes les mains.
