# App Store Connect Setup — Step by Step

Esta guía te ayuda a configurar la aplicación en App Store Connect para IAP (in-app purchases).

---

## Requisitos previos

- **Apple Developer Account** — necesitas registrarte en https://developer.apple.com
- **Costo:** $99/año
- **Tiempo:** ~10-15 minutos (después de aprobación de Apple)

---

## 1. Registrarse en Apple Developer Program

1. Ve a https://developer.apple.com/programs/enroll/
2. Click en **"Enroll"**
3. Inicia sesión con tu Apple ID (o crea uno)
4. Sigue los pasos:
   - Selecciona **"Individual"** (o tu tipo de organización)
   - Acepta los términos
   - Completa el registro de programas
   - Paga los $99

Espera 48-72 horas a que Apple apruebe tu cuenta.

---

## 2. Acceder a App Store Connect

1. Ve a https://appstoreconnect.apple.com
2. Inicia sesión con tu Apple ID

---

## 3. Crear la App

1. Click en **"My Apps"** (esquina superior izquierda)
2. Click en el botón **"+"** → **"New App"**
3. Rellena:
   - **Name:** EvidenceVault
   - **Primary Language:** English
   - **Bundle ID:** **com.evidencevault.app** (IMPORTANTE — debe coincidir con app.json)
   - **SKU:** evidencevault-001 (cualquier identificador único)
   - **User Access:** Select all roles (para simplicidad)
4. Click **"Create"**

---

## 4. Configurar In-App Purchases (Subscriptions)

### 4.1 Crear un grupo de subscripción

1. En tu app, ve a **"In-App Purchases"** (lado izquierdo)
2. Click en el botón **"+"** → **"Subscription Group"**
3. Rellena:
   - **Reference Name:** Premium Subscriptions
   - **ID:** premium-subscriptions
4. Click **"Create"**

### 4.2 Crear el producto mensual

1. En el mismo tab de **"In-App Purchases"**, click **"+"** → **"Subscription"**
2. Selecciona **"Premium Subscriptions"** (el grupo que acabas de crear)
3. Rellena:
   - **Reference Name:** EvidenceVault Premium Monthly
   - **Product ID:** **evidencevault_premium_monthly** (IMPORTANTE — debe coincidir con RevenueCat)
   - **Subscription Duration:** One Month (mensual, se renueva automáticamente)
   - **Free Trial:** None (sin prueba gratuita por ahora)
   - **Price Tier:** Tier 4 (~$4.99 USD)
4. Click **"Create"**

### 4.3 Localización y metadatos

1. En la sección **"Localizations"**, asegúrate de que English está seleccionado
2. Rellena:
   - **Display Name:** Premium Edition
   - **Description:** Unlock unlimited AI assistant, full PDF export, and priority support
3. Click **"Save"**

### 4.4 Configurar la renovación

1. En **"Renewal Information"**:
   - **Renewal Type:** Automatically renew
   - **Billing Cycle:** Monthly
2. Click **"Save"**

### 4.5 Estado de review

1. En la sección **"Submit for Review"**:
   - **Pricing and Availability** → Click en tu app
   - Asegúrate de que el país está configurado
2. Click **"Submit for Review"** (para el producto de subscription)

Espera a que Apple apruebe (normalmente 1-2 días).

---

## 5. (Opcional) Crear producto anual

Repite los pasos 4.2-4.5, pero:
- **Product ID:** `evidencevault_premium_annual`
- **Subscription Duration:** One Year
- **Price Tier:** Tier 42 (~$49.99 USD, ~40% descuento vs. mensual)

---

## 6. Generar la In-App Purchase Key (para RevenueCat)

1. Ve a **App Store Connect** → **"Users and Access"** (lado izquierdo)
2. Click en **"Keys"** (subtab)
3. En la sección **"In-App Purchases"**, click **"+"**
4. Rellena:
   - **Key Name:** RevenueCat iOS Key
5. Click **"Generate"**
6. **Descarga el archivo .p8** (guárdalo en lugar seguro)
7. Anota:
   - **Key ID** — visible en la pantalla
   - **Issuer ID** — visible en la pantalla (arriba en "Certificates, Identifiers & Profiles")

**Necesitarás estos 3 valores en RevenueCat:**
- El archivo .p8
- Key ID
- Issuer ID

---

## 7. Configurar certificados (para EAS)

1. Ve a **"Certificates, Identifiers & Profiles"** (side left)
2. Click en **"Identifiers"** → **"+"**
3. Selecciona **"App IDs"** → **"Continue"**
4. Rellena:
   - **App Type:** App
   - **Description:** EvidenceVault
   - **Bundle ID:** com.evidencevault.app (IMPORTANTE)
5. Enable **"In-App Purchase"** capability
6. Click **"Continue"** → **"Register"**

---

## 8. Testear con Sandbox Account

Para probar IAP antes de publicar:

1. Ve a **"Users and Access"**
2. Click en **"Sandbox Testers"**
3. Click **"+"** para crear un tester:
   - Email: cualquier email de test
   - Password: contraseña fuerte
4. En tu dev build, loguéate con este email en la app
5. Intenta comprar — te pedirá confirmación pero no cobrará

---

## Checklist

- [ ] Apple Developer Account creada y activa
- [ ] App registrada en App Store Connect
- [ ] Bundle ID configurado: `com.evidencevault.app`
- [ ] Producto mensual creado: `evidencevault_premium_monthly`
- [ ] (Opcional) Producto anual creado: `evidencevault_premium_annual`
- [ ] In-App Purchase Key (.p8) descargada
- [ ] Key ID y Issuer ID anotados
- [ ] Certificados configurados
- [ ] Sandbox tester creado para testing

---

## Próximo Paso

Una vez que tengas el archivo .p8, Key ID, e Issuer ID, ve a [SETUP_REVENUECAT.md](SETUP_REVENUECAT.md).
