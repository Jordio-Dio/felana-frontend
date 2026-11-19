# Application Android (Capacitor)

Le projet web Vite/React est encapsulé dans une application Android via Capacitor.

- **Nom de l'application** : Hiba Création
- **Identifiant (package)** : `com.hibacreation.app`
- **Version** : 1.0.0 (versionCode 1)
- **Android minimum** : 7.0 (API 24)
- **Android cible** : 16 (API 36)

## Résultat du build

| Fichier | Usage |
| --- | --- |
| `release/Hiba-Creation-1.0.0-release.apk` | Installation directe sur un téléphone (APK signé) |
| `release/Hiba-Creation-1.0.0-release.aab` | Publication sur le Google Play Store |

## Reconstruire

```bash
# À chaque modification du code web : rebuild + copie des fichiers + APK release
npm run apk:release

# Variante debug (non signée pour publication)
npm run apk:debug
```

Les fichiers générés se trouvent dans :

- APK : `android/app/build/outputs/apk/release/app-release.apk`
- AAB : `android/app/build/outputs/bundle/release/app-release.aab`

Pour ouvrir le projet dans Android Studio : `npx cap open android`

## Signature (IMPORTANT)

La signature release utilise :

- **Keystore** : `android/app/release.keystore`
- **Alias** : `hiba`
- **Mot de passe (store + clé)** : `HibaCreation2026!`
- Ces informations sont aussi dans `android/keystore.properties`.

> ⚠️ Sauvegardez `android/app/release.keystore` et son mot de passe en lieu sûr.
> Sans ce fichier, vous ne pourrez plus publier de mise à jour de l'application
> sur le Play Store sous le même identifiant. Ces fichiers sont volontairement
> exclus de Git (voir `.gitignore`).

Empreinte SHA-256 du certificat (`apksigner verify --print-certs`) :
`d906701728dd7d707a1ba8f3493260b9a940161e03bf472e7bbf756672de59ec`

## Icône et écran de démarrage

Les sources se trouvent dans `assets/` (`icon.png`, `icon-background.png`,
`icon-foreground.png`, `splash.png`, `splash-dark.png`). Pour les régénérer :

```bash
npx @capacitor/assets generate --android
```

> Après régénération, remettre les icônes adaptatives « plein cadre » :
> `<background>` = `@mipmap/ic_launcher_background` sans `inset` (voir
> `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`).

## Configuration

`capacitor.config.ts` : `webDir` = `dist`, schéma `https`, contenu mixte désactivé.
L'API de production est définie dans `.env.production`
(`VITE_API_BASE_URL=https://api-felana.wanna-group.com/api`), reprise au moment
du `vite build`.

## Installation sur un téléphone

1. Copier `release/Hiba-Creation-1.0.0-release.apk` sur le téléphone.
2. Autoriser l'installation depuis une source inconnue si demandé.
3. Installer, puis ouvrir « Hiba Création ».
