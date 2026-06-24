# EAS Builds & Deployment — Complete Guide

Esta guía te ayuda a configurar EAS (Expo Application Services) para construir y submitear tu app a las tiendas.

---

## Requisitos previos

- ✅ Expo account (https://expo.dev — es gratuito)
- ✅ EAS CLI instalado
- ✅ App Store Connect account (para iOS)
- ✅ Google Play Developer account (para Android)
- ✅ Certificados de code signing configurados

---

## 1. Instalar y Configurar EAS CLI

### 1.1 Instalar EAS

```bash
npm install -g eas-cli
```

### 1.2 Login

```bash
eas login
```

Elige tu email de Expo y contraseña.

### 1.3 Configurar el proyecto

```bash
cd D:\claude\EvidenceVault
eas build:configure
```

Elige:
- **iOS:** Sí (necesitas Apple Developer account)
- **Android:** Sí (necesitas Google Play account)

EAS creará un archivo `eas.json` con la configuración.

---

## 2. Configurar app.json para EAS

Tu `app.json` ya tiene la mayoría de cosas, pero verifica:

```json
{
  "expo": {
    "name": "EvidenceVault",
    "slug": "evidencevault",
    "version": "0.1.0",
    "orientation": "portrait",
    "scheme": "evidencevault",
    "ios": {
      "bundleIdentifier": "com.evidencevault.app",
      "supportsTablet": true,
      "buildNumber": "1"
    },
    "android": {
      "package": "com.evidencevault.app",
      "versionCode": 1
    }
  }
}
```

**Importante:**
- Increment `buildNumber` (iOS) y `versionCode` (Android) cada vez que haces un build
- Version debe coincidir con tu CHANGELOG.md

---

## 3. Revisar eas.json

Después de `eas build:configure`, verifica `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview2": {
      "android": {
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "preview3": {
      "developmentClient": true
    },
    "production": {}
  }
}
```

Esto ya está bien. Los profiles son:
- **preview** — simulador (rápido, testing)
- **preview2** — device builds sin signing (testing)
- **preview3** — development build (dev testing con IAP/biometrics)
- **production** — signed build for App Store/Google Play

---

## 4. Certificados de Code Signing — iOS

### 4.1 Generar certificados de Apple

EAS puede manejar esto automáticamente (recomendado):

```bash
eas credentials
```

Sigue los prompts:
1. Selecciona **iOS**
2. **Build credentials** → **Create new**
3. EAS te preguntará si quieres:
   - **Distribution certificate** — EAS genera automáticamente
   - **Provisioning profile** — EAS genera automáticamente
4. Confirma y espera a que EAS complete

EAS guardará los certificados de forma segura en su servidor.

### 4.2 (Alternativa) Usar tus propios certificados

Si ya tienes certificados en App Store Connect:

```bash
eas credentials
```

Selecciona **iOS** → **Upload existing** → carga tus certificados (.p12, .mobileprovision).

---

## 5. Certificados de Code Signing — Android

### 5.1 Generar keystore

EAS puede generar automáticamente:

```bash
eas credentials
```

Sigue los prompts:
1. Selecciona **Android**
2. **App signing credentials** → **Create new**
3. EAS genera un **keystore** (archivo de certificado para firmar APKs)
4. Confirma

EAS guardará el keystore de forma segura.

### 5.2 (Importante) Guardar keystore para el futuro

EAS te mostrará el comando para descargar el keystore:

```bash
eas credentials show --platform android
```

Descarga y guarda en lugar seguro. Si pierdes el keystore, no puedes actualizar tu app en Google Play.

---

## 6. Build para Development (Testing IAP + Biometrics)

### 6.1 iOS Development Build

```bash
eas build --platform ios --profile development
```

Selecciona:
- **iOS simulator?** No (quieres un device build)
- **Use a different Apple account?** No

EAS construirá y te dará un enlace para descargar el .ipa.

**Para instalar en device:**
```bash
# Abre Xcode y arrastra el .ipa para instalar
# O usa: xcrun simctl install booted path/to/build.ipa
```

### 6.2 Android Development Build

```bash
eas build --platform android --profile development
```

Selecciona las opciones. EAS construirá un APK.

**Para instalar:**
```bash
adb install path/to/build.apk
```

### 6.3 Testing

1. En la app, ve a **Settings** → **Premium**
2. Intenta comprar
3. Si RevenueCat está configurado, debería funcionar

---

## 7. Build para Production

### 7.1 Actualizar versión

Antes de hacer un build de producción:

```bash
# En package.json
{
  "version": "0.1.0"  // incrementa si es necesario
}

# En app.json
{
  "expo": {
    "version": "0.1.0",
    "ios": {
      "buildNumber": "2"  // incrementa
    },
    "android": {
      "versionCode": 2  // incrementa
    }
  }
}

# En CHANGELOG.md
## [0.1.0] - 2026-06-23
### Added
- MVP release
```

### 7.2 iOS Production Build

```bash
eas build --platform ios --profile production
```

EAS construirá un build de producción, lo firmará, y estará listo para submitear a App Store.

### 7.3 Android Production Build

```bash
eas build --platform android --profile production
```

EAS construirá un signed APK/AAB (Android App Bundle) listo para Google Play.

---

## 8. Submitear a las Tiendas

### 8.1 Submitear a App Store (iOS)

Opción A — Automático (recomendado):

```bash
eas submit --platform ios --latest
```

Elige:
- **App Store Connect API key?** Sí, déjalo generar
- Confirma

EAS submitirá automáticamente a App Store. Espera a que Apple revise (1-3 días).

Opción B — Manual:

1. Descarga el build de EAS
2. Ve a App Store Connect
3. Crea una nueva versión (build number)
4. Sube el .ipa
5. Rellena metadatos (descripción, keywords, screenshots)
6. Submitea para review

### 8.2 Submitear a Google Play (Android)

Opción A — Automático (recomendado):

```bash
eas submit --platform android --latest
```

Elige:
- **Generate a new Google Service Account?** Sí, o usa el existente
- Confirma

EAS submitirá automáticamente. Google normalmente aprueba en 2-4 horas.

Opción B — Manual:

1. Descarga el AAB de EAS
2. Ve a Google Play Console
3. Crea una nueva release
4. Sube el AAB
5. Rellena metadatos
6. Submitea para review

---

## 9. Monitorear Build & Review

### 9.1 En EAS Dashboard

Ve a https://expo.dev/builds para ver:
- Estado del build (building, complete, failed)
- Descargar logs si algo falla
- Re-trigger builds si necesitas

### 9.2 En App Store Connect

Ve a https://appstoreconnect.apple.com para ver:
- Estado de la revisión (processing, ready for sale, rejected)
- Mensajes de Apple si hay problemas

### 9.3 En Google Play Console

Ve a https://play.google.com/console para ver:
- Estado de la release (in review, processing, live)
- Porcentaje de rollout (puedes hacer un rollout progresivo)

---

## 10. Actualizaciones Over-The-Air (OTA)

Expo tiene una característica para actualizar la app sin hacer un nuevo build (útil para bugfixes rápidos).

### 10.1 Publicar update

```bash
eas update --platform ios --message "Fixed bug in AI assistant"
```

Los usuarios recibirán la actualización automáticamente cuando abran la app.

### 10.2 (Nota de seguridad)

OTA updates **NO** pueden cambiar:
- Módulos nativos (native code)
- Certificados
- Permisos

Para esos cambios, necesitas un nuevo build (eas build).

---

## 11. Workflow de Release Recomendado

```bash
# 1. Actualiza versión
# - app.json (version, buildNumber, versionCode)
# - package.json (version)
# - CHANGELOG.md

# 2. Commit y push
git add .
git commit -m "chore: bump version to 0.1.0"
git push

# 3. Crear tag
git tag v0.1.0
git push origin v0.1.0

# 4. EAS construirá automáticamente (via GitHub Actions) y submitirá
# (Si configuraste el workflow de release.yml)

# O manualmente:
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## 12. Troubleshooting

### "Build failed — iOS certificate issue"
```bash
eas credentials
# Revoca y regenera los certificados
```

### "Submit failed — App Store authentication"
```bash
# EAS necesita acceso a tu Apple Developer account
eas submit --platform ios --latest --wait
```

### "APK won't install on device"
```bash
# Verifica que el versionCode es más alto que la versión anterior
# En app.json: "android": { "versionCode": 2 }
```

### "OTA update not received by users"
```bash
# Los usuarios solo reciben OTA si tienen
# - La app abierta
# - Conexión a internet
# Para bugfixes críticos, haz un nuevo build
```

---

## Checklist Antes de Build de Producción

- [ ] Versión incrementada en app.json + package.json + CHANGELOG.md
- [ ] Tests pasan: `npm run typecheck && npm test`
- [ ] Linting limpio: `npm run lint`
- [ ] Credenciales de Apple guardadas (eas credentials)
- [ ] Credenciales de Android guardadas (eas credentials)
- [ ] Store listings completos en App Store Connect y Google Play
- [ ] Screenshots de la app cargados
- [ ] Privacy policy y T&Cs listos
- [ ] RevenueCat configurado y testeado

---

## Referencias

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
