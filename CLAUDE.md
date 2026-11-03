# CariocAce Replay : instructions pour Claude

Ce dépôt publie « une main à deviner » (GitHub Pages) : une page d'accueil qui crée et joue des mains envoyées par lien, plus
deux pages figées de l'ancien mode (`main-2/`, `main-3/`). Tous les `index.html` sont générés par `python3 tools/build.py`
à partir de `tools/replay-source.html`. Ne jamais les éditer à la main.

## Comment une main arrive aux invités

La page d'accueil (`index.html`, générée par `python3 tools/build.py --site` à partir de `tools/replay-source.html`) fait deux choses :
- **Créer** : l'auteur colle une main (ou l'appli de notes la lui envoie par le bouton « Faire deviner »), tape le titre, voit l'aperçu et copie le lien.
- **Jouer** : le lien `…/CariocAceReplay/#h=1.<main et titre encodés>` ouvre la main pour l'invité. Rien n'est publié ni construit : la main est dans le lien.

L'auteur n'a plus besoin de Claude pour envoyer une main. Si l'auteur demande à Claude de fabriquer un lien :
1. **Poser la question du titre** (« Quel titre afficher en haut de la page ? », exemple : « Main Event KSOP buy-in 1000 euros »). Un titre par main, jamais réutilisé sans demander.
2. Retirer les lignes `Tags`, `Note`, `Commentaire`, `Correction` (notes privées, le lien est lisible par tous), puis encoder comme `b64enc(JSON.stringify({t: titre, h: main}))` de la page.
3. Après toute modification de `tools/replay-source.html` : `python3 tools/build.py --site`, jouer la page dans un navigateur (Playwright : création du lien, jeu invité, bandeau en haut, pas de débordement, envoi ntfy au bon format, essayer aussi un échec 503 puis un succès), vérifier par `sha256sum` que `main-2/` et `main-3/` n'ont pas changé, puis commit + push sur `main`. Mise en ligne : 1 à 2 minutes (cache GitHub Pages ~10 min, ajouter `?v=N` pour tester).

## Règles fixes

- Le bandeau « CariocAce Replay » reste toujours visible en haut de la page, avant et pendant la main.
- Les réponses partent en notification ntfy vers le canal de `tools/config.json`. Ne pas changer le canal sans que l'auteur le demande.
- Une seule réponse envoyée par navigateur et par main.
- Ne pas toucher au dépôt `CariocAce-Hands` (l'appli de prise de note) : il a son propre service worker. Seule modification faite à la demande de l'auteur (3 nov. 2026) : le bouton « Faire deviner » de l'éditeur, qui ouvre la page de création avec la main (sans tags, note ni commentaire). Tout autre changement dans cette appli seulement sur demande.
- Icône de l'écran d'accueil (`icon-180/192/512.png`, `manifest.webmanifest`) : l'icône de CariocAce Hands avec « Replay » en petit, en noir, sur le pique. Liens ajoutés seulement à la page d'accueil, jamais aux pages figées.
- Termes de poker en anglais (fold, call, raise). Interface en français. Noir et platine, pas de vert, pas d'or, pas de serif.
- **Ne jamais modifier ni reconstruire une main déjà publiée** (`main-2/`, `main-3/`) sans demande explicite de l'auteur (`build.py` les laisse telles quelles ; `--force` ou `--all` seulement sur demande). Ce sont des pages figées de l'ancien mode ; les nouvelles mains passent par des liens.
- Le code source de la page est `tools/replay-source.html`. Les évolutions s'appliquent à la page d'accueil et donc à tous les liens (ils lisent la version en ligne) ; les pages figées gardent leur version tant que l'auteur ne demande pas de les reconstruire.
- Ordre d'action postflop : SB parle en premier à chaque street. Le parseur insère automatiquement un « check » (décision à part entière pour Hero) pour tout joueur encore en main qui agit avant le premier bet/raise listé sans avoir son propre check dans le texte. Vaut pour les nouvelles mains ; les anciennes ne sont pas reconstruites.
- Notification ntfy (page d'accueil) : titre « Titre · Prénom : score », puis les réponses, puis la main (sans tags ni notes) ; toucher la notification rouvre le lien (`click`). Le corps JSON complet doit rester sous 4096 octets : si trop long, la main est raccourcie (lien gardé), jamais les réponses.
- Le même canal ntfy sert toutes les mains. Les mains récentes mettent le titre de la main dans le titre de la notification (« Titre · Prénom : score ») et font jusqu'à 3 essais d'envoi ; `main-2` garde l'ancienne version (sans titre de main dans la notification, un seul essai).
