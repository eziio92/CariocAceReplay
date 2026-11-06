# CariocAce Replay

Une main à deviner : la main se rejoue toute seule et s'arrête à chaque décision de Hero.

- **Page d'accueil** (`/`) : l'auteur colle une main, tape un titre et obtient un lien à envoyer. La main est encodée dans le lien (après le `#`, format court de 110 à 170 caractères pour tenir dans WhatsApp) : rien à publier.
- **Lien reçu** : la personne met son prénom, joue la main ; ses réponses partent en notification vers le canal ntfy de `tools/config.json`.
- `main-2/` et `main-3/` : pages figées de l'ancien mode (une page par main), conservées telles quelles.

Site statique. Les pages sont générées par `python3 tools/build.py` (voir `CLAUDE.md`).
