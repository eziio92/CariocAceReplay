# CariocAce Replay : instructions pour Claude

Ce dépôt publie des pages « une main à deviner » (GitHub Pages). Chaque main est un dossier `<slug>/index.html`
généré par `python3 tools/build.py` à partir de `tools/hands.json`. Ne jamais éditer les `index.html` à la main.

## À chaque nouvelle main à publier

1. **Poser la question du titre avant de construire quoi que ce soit** : « Quel titre afficher en haut de la page ? »
   (exemple : « Main Event KSOP buy-in 1000 euros »). Un titre par main, jamais réutilisé sans demander. Ne pas deviner.
2. Enregistrer la main dans `tools/hands/<slug>.txt` (`main-3`, `main-4`, …) en retirant les lignes `Tags :` et `Note :` :
   ce sont les notes privées de l'auteur et le dépôt est public.
3. Ajouter l'entrée `{slug, title, file}` dans `tools/hands.json`, puis lancer `python3 tools/build.py <slug>` (uniquement la nouvelle main).
4. Jouer la page dans un navigateur (Playwright) : le bandeau reste en haut, le titre s'affiche, pas de débordement, l'envoi ntfy part au bon format (essayer aussi un échec 503 puis un succès).
   Avant le commit, vérifier par empreinte (`sha256sum`) que les pages déjà publiées n'ont pas changé.
5. Commit + push sur `main`. Le lien est `https://eziio92.github.io/CariocAceReplay/<slug>/` (1 à 2 minutes de mise en ligne).

## Règles fixes

- Le bandeau « CariocAce Replay » reste toujours visible en haut de la page, avant et pendant la main.
- Les réponses partent en notification ntfy vers le canal de `tools/config.json`. Ne pas changer le canal sans que l'auteur le demande.
- Une seule réponse envoyée par navigateur et par main.
- Ne pas toucher au dépôt `CariocAce-Hands` (l'appli de prise de note) : il a son propre service worker.
- Termes de poker en anglais (fold, call, raise). Interface en français. Noir et platine, pas de vert, pas d'or, pas de serif.
- **Ne jamais modifier ni reconstruire une main déjà publiée** sans demande explicite de l'auteur (`build.py` les laisse telles quelles ; `--force` ou `--all` seulement sur demande).
- Le code source de la page est `tools/replay-source.html`. Les évolutions s'appliquent aux nouvelles mains ; les anciennes gardent leur version tant que l'auteur ne demande pas de les reconstruire.
- Ordre d'action postflop : SB parle en premier à chaque street. Le parseur insère automatiquement un « check » (décision à part entière pour Hero) pour tout joueur encore en main qui agit avant le premier bet/raise listé sans avoir son propre check dans le texte. Vaut pour les nouvelles mains ; les anciennes ne sont pas reconstruites.
- Le même canal ntfy sert toutes les mains. Les mains récentes mettent le titre de la main dans le titre de la notification (« Titre · Prénom : score ») et font jusqu'à 3 essais d'envoi ; `main-2` garde l'ancienne version (sans titre de main dans la notification, un seul essai).
