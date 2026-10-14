# 🎨 Notes • Drawing Magic (PWA)

> Application Progressive Web App (PWA) de dessin d'apparence 100% innocente conçue pour les tours de mentalisme et de magie moderne.

---

## 🎩 Le Principe du Tour

1. **Dessin collectif des spectateurs** :
   - Le magicien tend son smartphone à un premier spectateur en lui demandant de tracer quelques traits, puis à un deuxième, un troisième, etc.
   - L'écran ressemble fidèlement à un carnet de croquis classique (outils crayon, gomme, palette de couleurs, épaisseur, annuler, effacer).

2. **Le switch secret (1ère pose face contre table)** :
   - Avant de montrer le dessin au dernier spectateur, le téléphone est posé **face contre table**.
   - Grâce aux capteurs de mouvement et d'orientation (`DeviceOrientation` et `DeviceMotionEvent`), l'application capture silencieusement le dessin des spectateurs et le remplace par la **prédiction secrète** pré-configurée par le magicien.
   - Une vibration haptique ultra-discrète (30 ms) confirme dans les doigts du magicien que le tour est enclenché.

3. **La révélation** :
   - Le téléphone est repris en main et montré au public ou au dernier spectateur : le dessin correspond exactement à la prédiction !

4. **Le nettoyage magique (2ème pose face contre table)** :
   - Le téléphone est reposé **face contre table**.
   - L'application restaure automatiquement le **dessin d'origine** réalisé par les spectateurs.
   - Si quelqu'un examine le téléphone par la suite, le gribouillage initial est de retour : **aucune preuve, tour 100% clean**.

---

## 🤫 Accès au Panneau Secret du Magicien

Pour garantir l'illusion devant les spectateurs, l'accès aux réglages est totalement camouflé :

- **Sur smartphone** : Effectuez un **appui long maintenu (~800 ms) sur l'icône de la Corbeille**.
  - Un clic court efface simplement la page de façon normale.
  - Un maintien ouvre discrètement la fenêtre de configuration sans effacer le dessin.
- **Sur ordinateur / répétitions** :
  - Touche **`M`** : Ouvre / ferme le panneau secret.
  - Touche **`P`** : Affiche la barre d'entraînement rapide au bas de l'écran (simulation des poses 1 et 2 en un clic).

---

## ✨ Fonctionnalités du Panneau Secret

- **Préréglages de mentalisme instantanés** :
  - ⭐️ Étoile
  - ❤️ Cœur
  - 🏠 Maison
  - ⛵ Bateau
  - 💡 Ampoule
  - 🌳 Arbre
  - 🚗 Voiture
  - 🐱 Chat
  - 🕒 Horloge (3h00)
- **Dessin libre personnalisé** :
  - Possibilité de tracer votre propre dessin, symbole, mot ou nombre secret sur un canvas dédié.
- **Diagnostic des capteurs en direct** :
  - Affichage de l'inclinaison angulaire (`Beta`), du vecteur gravité Z et de l'état `Face contre table`.
- **Activation iOS Safari en 1 clic** :
  - Bouton officiel permettant de déclencher la demande d'autorisation système d'Apple sur iPhone.
- **Purger le cache & Recharger** :
  - Bouton pour vider instantanément tous les caches PWA / Service Worker et forcer la dernière mise à jour.

---

## 🛠️ Stack Technique

- **Frontend** : React 19 + Vite
- **Styling** : Vanilla CSS moderne (design système sur-mesure, respect du `safe-area-inset-top` pour Dynamic Island et encoches iPhone)
- **Canvas** : HTML5 2D Canvas haute performance avec lissage des courbes de Bézier quadratiques
- **Capteurs** : API `DeviceOrientation` + `DeviceMotionEvent` + filtre de variance statistique de stabilité
- **PWA** : Service Worker (`sw.js`) avec stratégie Network-First, manifest PWA installable et fonctionnement 100% hors-ligne

---

## 🚀 Installation & Développement Local

```bash
# Cloner le dépôt
git clone https://github.com/splitter77/drawing_magic.git
cd drawing_magic

# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev -- --host
```

L'application sera accessible sur :
- Votre PC : `http://localhost:5173/apps/drawing/`
- Votre smartphone (sur le même Wi-Fi) : `http://<IP-LOCALE>:5173/apps/drawing/`

---

## 📦 Déploiement en Production

Le projet est configuré pour être servi depuis le sous-répertoire `/apps/drawing/` (ex: `https://wamprod.com/apps/drawing/`) :

```bash
npm run build
```

Copiez simplement le contenu du dossier `dist/` dans le répertoire `/apps/drawing/` de votre serveur web.
