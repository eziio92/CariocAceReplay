# CariocAce Replay : instructions pour Claude

Ce dépôt publie « une main à deviner » (GitHub Pages) : une page d'accueil qui crée et joue des mains envoyées par lien, plus
deux pages figées de l'ancien mode (`main-2/`, `main-3/`). Tous les `index.html` sont générés par `python3 tools/build.py`
à partir de `tools/replay-source.html`. Ne jamais les éditer à la main.

## Comment une main arrive aux invités

La page d'accueil (`index.html`, générée par `python3 tools/build.py --site` à partir de `tools/replay-source.html`) fait deux choses :
- **Créer** : l'auteur colle une main (ou l'appli de notes la lui envoie par le bouton « Faire deviner »), tape le titre, voit l'aperçu et copie le lien.
- **Jouer** : le lien `…/CariocAceReplay/#h=2.<main et titre en base 62>` ouvre la main pour l'invité. Rien n'est publié ni construit : la main est dans le lien.
  - **Format court `#h=2.`** (depuis le 6 nov. 2026) : la main analysée par `parseHand` est rangée en bits (positions, cartes, actions, montants) puis écrite en base 62 (chiffres et lettres seulement). Un lien fait 110 à 170 caractères avec un titre de 33 caractères. À l'ouverture, les bits redonnent un texte de main canonique que `parseHand` relit. Le code est dans `tools/replay-source.html` (bloc « Lien court (v2) », fonctions `p2Pack`, `p2Unpack`).
  - **Pourquoi** : constat de l'auteur le 6 nov. 2026 (capture d'écran) : dans WhatsApp sur iPhone, seuls les ~200 premiers caractères d'un lien restent cliquables ; l'ancien format `#h=1.` (JSON en base64, 360 à 690 caractères) était donc inutilisable dans WhatsApp. Ne jamais revenir à un format plus long par défaut.
  - **Garde-fou** : `p2Pack` relit sa propre sortie et ne rend le lien court que si la main relue est strictement la même (sinon `null`, et la page fabrique l'ancien lien `#h=1.`, par exemple pour une position hors liste comme MP3). La page affiche un avertissement si un lien dépasse 200 caractères.
  - **Anciens liens** : `#h=1.` (JSON en base64) et `#new=` (envoyé par le bouton « Faire deviner ») restent lus. Ne pas casser leur décodage.

L'auteur n'a plus besoin de Claude pour envoyer une main. Si l'auteur demande à Claude de fabriquer un lien :
1. **Poser la question du titre** (« Quel titre afficher en haut de la page ? », exemple : « Main Event KSOP buy-in 1000 euros »). Un titre par main, jamais réutilisé sans demander.
2. Retirer les lignes `Tags`, `Note`, `Commentaire`, `Correction` (notes privées, le lien est lisible par tous), puis encoder avec `p2Pack(main, titre)` de la page (lien `#h=2.` + `code`) ; si `p2Pack` rend `null`, encoder comme `b64enc(JSON.stringify({t: titre, h: main}))` (lien `#h=1.`, long).
3. Après toute modification de `tools/replay-source.html` : `python3 tools/build.py --site`, lancer `node tools/test-links.js` (codec des liens courts : cas limites, 3 000 mains aléatoires, entrées hostiles), jouer la page dans un navigateur (Playwright : création du lien, jeu invité, bandeau en haut, pas de débordement, envoi ntfy au bon format, essayer aussi un échec 503 puis un succès), vérifier par `sha256sum` que `main-2/` et `main-3/` n'ont pas changé, puis commit + push sur `main`. Mise en ligne : 1 à 2 minutes (cache GitHub Pages ~10 min, ajouter `?v=N` pour tester).

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
- Tailles proposées après le flop : 20, 33, 40, 50, 66, 80, 100 % du pot, All-in, Autre (`PCTS` dans `tools/replay-source.html`). La taille jugée « identique » est la taille proposée la plus proche de celle jouée.
- Showdown : les cartes des adversaires notées dans la main sont retournées dès qu'il n'y a plus d'action possible (tapis, même préflop, avant le flop) ou à la fin de la river ; bloc unique sous la table, conservé dans le récap.
- Notification ntfy (page d'accueil) : titre « Titre · Prénom : score », puis les réponses, puis la main (sans tags ni notes) ; toucher la notification rouvre le lien (`click`). Le corps JSON complet doit rester sous 4096 octets : si trop long, la main est raccourcie (lien gardé), jamais les réponses.
- Le même canal ntfy sert toutes les mains. Les mains récentes mettent le titre de la main dans le titre de la notification (« Titre · Prénom : score ») et font jusqu'à 3 essais d'envoi ; `main-2` garde l'ancienne version (sans titre de main dans la notification, un seul essai).
