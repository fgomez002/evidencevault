# RevenueCat Setup — Complete Integration Guide

Esta guía te ayuda a conectar RevenueCat con App Store y Google Play.

---

## Requisitos previos

Antes de empezar, necesitas haber completado:

1. ✅ [App Store Connect Setup](SETUP_APPSTORE.md) — tienes:
   - Bundle ID: `com.evidencevault.app`
   - Product ID: `evidencevault_premium_monthly`
   - In-App Purchase Key (.p8 file)
   - Key ID
   - Issuer ID

2. ✅ [Google Play Setup](SETUP_GOOGLEPLAY.md) — tienes:
   - Package Name: `com.evidencevault.app`
   - Product ID: `evidencevault_premium_monthly`
   - Service Account JSON key

---

## 1. Crear cuenta en RevenueCat

1. Ve a https://revenuecat.com
2. Click en **"Start free"**
3. Crea una cuenta con:
   - Email
   - Password
   - Nombre
4. Verifica tu email
5. Acceso instantáneo al dashboard

---

## 2. Crear un proyecto en RevenueCat

1. En el dashboard, click en **"+ Create new project"**
2. Nombre: `EvidenceVault`
3. Currency: USD (o tu moneda)
4. Click **"Create"**

---

## 3. Conectar App Store

### 3.1 Agregar la app de iOS

1. En tu proyecto, click en **"Apps"** (lado izquierdo)
2. Click en **"+ New app"**
3. Selecciona **"iOS"**
4. Rellena:
   - **App name:** EvidenceVault iOS
   - **Platform:** iOS
   - **Bundle ID:** com.evidencevault.app
5. Click **"Create app"**

### 3.2 Conectar In-App Purchase Key

1. En tu app de iOS, ve a **"Configuration"** (tab)
2. Bajo **"Credentials"**, click en **"+ Add credentials"**
3. Selecciona **"In-App Purchases Key"**
4. Sube el archivo .p8 que descargaste de App Store Connect
5. Completa:
   - **Key ID:** [Pega el Key ID de App Store]
   - **Issuer ID:** [Pega el Issuer ID de App Store]
6. Click **"Add"**

RevenueCat ahora puede leer tus productos y transacciones de App Store.

---

## 4. Conectar Google Play

### 4.1 Agregar la app de Android

1. En tu proyecto, click en **"Apps"** (lado izquierdo)
2. Click en **"+ New app"**
3. Selecciona **"Android"**
4. Rellena:
   - **App name:** EvidenceVault Android
   - **Platform:** Android
   - **Package name:** com.evidencevault.app
5. Click **"Create app"**

### 4.2 Conectar Service Account

1. En tu app de Android, ve a **"Configuration"** (tab)
2. Bajo **"Credentials"**, click en **"+ Add credentials"**
3. Selecciona **"Google Service Account Key"**
4. Sube el JSON key que descargaste de Google Cloud Console
5. Click **"Add"**

RevenueCat ahora puede leer tus productos y transacciones de Google Play.

---

## 5. Configurar Products en RevenueCat

### 5.1 Importar productos

1. Ve a **"Products"** (lado izquierdo)
2. RevenueCat debería detectar automáticamente:
   - `evidencevault_premium_monthly` (iOS + Android)
3. Si no aparece, click en **"+ New product"** y agrega:
   - **ID:** evidencevault_premium_monthly
   - **iOS ID:** evidencevault_premium_monthly
   - **Android ID:** evidencevault_premium_monthly

### 5.2 (Opcional) Importar producto anual

Si creaste un producto anual, agrega:
- **ID:** evidencevault_premium_annual
- **iOS ID:** evidencevault_premium_annual
- **Android ID:** evidencevault_premium_annual

---

## 6. Configurar Entitlements (Derechos de acceso)

Una entitlement es un "acceso" que el usuario obtiene cuando compra. La app verifica que el usuario tenga este acceso.

### 6.1 Crear entitlement

1. Ve a **"Entitlements"** (lado izquierdo)
2. Click en **"+ New entitlement"**
3. Rellena:
   - **Identifier:** **premium** (IMPORTANTE — debe coincidir exactamente con el código de la app)
   - **Display name:** Premium Edition
   - **Description:** Unlocks AI assistant and full PDF export
4. Click **"Create"**

### 6.2 Vincular productos a entitlement

1. Aún en la sección de Entitlements, click en tu entitlement **"premium"**
2. En **"Products"**, selecciona:
   - `evidencevault_premium_monthly`
   - (Opcional) `evidencevault_premium_annual`
3. Click **"Save"**

---

## 7. Configurar Offerings (Lo que ven los usuarios)

Una "offering" es lo que los usuarios ven cuando quieren comprar. Puede incluir múltiples "packages" (monthly, annual, etc.).

### 7.1 Crear offering

1. Ve a **"Offerings"** (lado izquierdo)
2. Click en **"+ New offering"**
3. Rellena:
   - **Identifier:** current (normalmente "current" es la offering activa)
   - **Display name:** Premium Subscription
   - **Description:** Full access to AI and reports
4. Click **"Create"**

### 7.2 Agregar packages

1. En tu offering "current", click en **"+ Add package"**
2. Primera opción (Monthly):
   - **Identifier:** monthly
   - **Display name:** Monthly
   - **Product:** evidencevault_premium_monthly
3. Click **"Add"**

4. Agregar segunda opción (Opcional, si tienes annual):
   - **Identifier:** annual
   - **Display name:** Annual
   - **Product:** evidencevault_premium_annual
5. Click **"Add"**

---

## 8. Obtener SDK Keys

Estas son las claves que usarás en tu app.

### 8.1 iOS Key

1. En tu app iOS, ve a **"Configuration"**
2. En la sección **"SDK Keys"**, copia el **iOS Key** (empieza con `appl_`)

### 8.2 Android Key

1. En tu app Android, ve a **"Configuration"**
2. En la sección **"SDK Keys"**, copia el **Android Key** (empieza con `goog_`)

---

## 9. Actualizar el repositorio

Ahora que tienes las SDK keys, actualiza tu proyecto:

### 9.1 Actualizar .env.local

```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx
```

### 9.2 Actualizar GitHub Secrets

Ve a tu repo: https://github.com/fgomez002/evidencevault

1. Settings → Secrets and variables → Actions
2. Click en **"New repository secret"**
3. Crea:
   - Name: `REVENUECAT_IOS_KEY`, Value: `appl_xxxxxxxx`
   - Name: `REVENUECAT_ANDROID_KEY`, Value: `goog_xxxxxxxx`

---

## 10. Configurar Webhook (para sincronizar con Supabase)

RevenueCat puede enviar eventos (compras, renovaciones, cancelaciones) a tu backend.

### 10.1 En RevenueCat

1. Ve a **"Integrations"** (lado izquierdo)
2. Click en **"Webhooks"**
3. Click en **"+ New webhook"**
4. Rellena:
   - **Event types:** Select ALL (New purchase, renewal, expiration, cancellation)
   - **Webhook URL:** `https://flmwxsanyanpkcpefjfb.supabase.co/functions/v1/revenuecat-webhook`
5. En **"Custom headers"**, agrega:
   - Header name: `Authorization`
   - Header value: [Genera un string aleatorio fuerte, ej. `sk-rc-webhook-abc123...long-string...`]
6. Click **"Save"**

### 10.2 En Supabase

1. Ve a tu proyecto: https://supabase.com/dashboard/project/flmwxsanyanpkcpefjfb
2. Ve a **"Edge Functions"** → **"revenuecat-webhook"**
3. Click en **"Settings"** → **"Secrets"**
4. Agrega:
   ```
   REVENUECAT_WEBHOOK_AUTH=sk-rc-webhook-abc123...long-string...
   ```
   (El mismo valor que usaste en RevenueCat)

---

## 11. Testear

### 11.1 Dev build con Sandbox

1. Construye un dev build:
   ```bash
   eas build --profile development --platform ios
   ```

2. Instala en un simulador o dispositivo

3. En la app, ve a **"Settings"** → **"Premium"** (o el paywall)

4. Intenta comprar con un **Sandbox account** (de App Store Connect)

5. Verifica que:
   - La compra se procesa
   - RevenueCat reconoce la compra
   - `profiles.subscription_tier` se actualiza en Supabase (en 5-10 segundos)
   - La app muestra "Premium" 🎉

---

## 12. Checklist

- [ ] Cuenta RevenueCat creada
- [ ] Proyecto creado en RevenueCat
- [ ] App Store conectada (In-App Purchase Key)
- [ ] Google Play conectada (Service Account)
- [ ] Productos importados correctamente
- [ ] Entitlement "premium" creado
- [ ] Offering "current" creado con packages
- [ ] SDK keys obtenidas
- [ ] .env.local actualizado con SDK keys
- [ ] GitHub secrets actualizados
- [ ] Webhook configurado en RevenueCat
- [ ] REVENUECAT_WEBHOOK_AUTH seteo en Supabase
- [ ] Dev build testeado con Sandbox account

---

## Próximo Paso

Una vez que todo esté configurado:

1. **Construir dev build:**
   ```bash
   eas build --profile development --platform ios   # o android
   ```

2. **Testear en dispositivo/simulador**

3. **Cuando esté listo para producción:**
   ```bash
   eas build --profile production --platform ios
   eas submit --platform ios
   ```

---

## Troubleshooting

### "SDK key doesn't work"
- Verifica que hayas copiado correctamente (sin espacios)
- Regenera la key en RevenueCat si dudastes

### "Webhook doesn't receive events"
- Verifica que el URL es exacto (copia-pega, no escribas)
- Verifica que el header Authorization es correcto
- En RevenueCat, test el webhook manualmente (Test webhook button)

### "Compra procesa pero app no muestra premium"
- Espera 10-30 segundos (el webhook tarda)
- En RevenueCat dashboard, verifica que la transacción aparece
- En Supabase, verifica que `profiles.subscription_tier` se actualiza
- Revisa los logs del Edge Function en Supabase

---

## Referencias

- [RevenueCat Docs](https://docs.revenuecat.com)
- [EvidenceVault REVENUECAT.md](../REVENUECAT.md) — setup técnico en la app
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
