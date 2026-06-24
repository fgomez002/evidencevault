# Google Play Console Setup — Step by Step

Esta guía te ayuda a configurar la aplicación en Google Play Console para IAP (in-app purchases).

---

## Requisitos previos

- **Google Play Developer Account** — necesitas registrarte en https://play.google.com/console
- **Costo:** $25 (pago único, diferente de Apple)
- **Tiempo:** ~15-20 minutos
- **Google Account:** Necesitas una cuenta de Google activa

---

## 1. Registrarse en Google Play Developer

1. Ve a https://play.google.com/console
2. Click en **"Get started"**
3. Inicia sesión con tu cuenta de Google
4. Sigue los pasos:
   - Acepta los términos de Google Play Developer Program
   - Proporciona información de contacto
   - Paga los $25 (tarjeta de crédito)

Acceso instantáneo (no necesita esperar como Apple).

---

## 2. Acceder a Google Play Console

1. Ve a https://play.google.com/console
2. Inicia sesión con tu cuenta de Google

---

## 3. Crear la App

1. Click en el botón **"Create App"**
2. Rellena:
   - **App name:** EvidenceVault
   - **Default language:** English
   - **App or game:** App
   - **Free or Paid:** Free (puedes monetizar vía IAP)
3. Click **"Create App"**

---

## 4. Configurar In-App Products (Subscriptions)

### 4.1 Acceder al tab de Monetization

1. En el menú lateral, ve a **"Products"** → **"Subscriptions"**
2. Click en el botón **"Create subscription"**

### 4.2 Crear el producto mensual

1. Rellena:
   - **Product ID:** **evidencevault_premium_monthly** (IMPORTANTE — debe coincidir con iOS y RevenueCat)
   - **Default language name:** Premium Edition
   - **Default language description:** Unlock unlimited AI assistant, full PDF export, and priority support
2. En **"Subscription period"**: Select "Monthly"
3. Click **"Save"**

### 4.3 Configurar precios

1. En la sección **"Pricing and taxes"**:
   - Click en tu país (ej. United States)
   - Price: $4.99 (o equivalente)
2. Click **"Save"**

### 4.4 Activar el producto

1. En la sección de **"Status"**, selecciona **"Active"**
2. Click **"Save"**

---

## 5. (Opcional) Crear producto anual

Repite los pasos 4.2-4.4, pero:
- **Product ID:** `evidencevault_premium_annual`
- **Subscription period:** Yearly
- **Price:** $49.99 (o equivalente)

---

## 6. Generar Service Account para RevenueCat

Google Play requiere un **Service Account** para que RevenueCat acceda a tus datos de subscripción.

### 6.1 Crear Service Account en Google Cloud Console

1. Ve a https://console.cloud.google.com
2. Click en el selector de proyecto (arriba a la izquierda)
3. Click en **"New Project"**
4. Nombre: `EvidenceVault RevenueCat`
5. Click **"Create"**

### 6.2 Habilitar Google Play Developer API

1. En el menú lateral, ve a **"APIs & Services"** → **"Library"**
2. Busca **"Google Play Developer API"**
3. Click en el resultado
4. Click **"Enable"**

### 6.3 Crear una Service Account Key

1. Ve a **"APIs & Services"** → **"Credentials"** (lado izquierdo)
2. Click en **"+ Create Credentials"** → **"Service Account"**
3. Rellena:
   - **Service account name:** RevenueCat Integration
   - **Service account ID:** (se genera automáticamente)
4. Click **"Create and Continue"**
5. En **"Grant this service account access to project"**:
   - Selecciona rol: **"Editor"**
   - Click **"Continue"**
6. Click **"Done"**

### 6.4 Descargar JSON Key

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Bajo **"Service Accounts"**, click en **"RevenueCat Integration"**
3. Click en el tab **"Keys"**
4. Click en **"Add Key"** → **"Create new key"**
5. Selecciona **"JSON"** → **"Create"**
6. **Descarga el archivo JSON** (guárdalo en lugar seguro)

Necesitarás este JSON en RevenueCat.

---

## 7. Conectar Service Account a Google Play

1. Ve a https://play.google.com/console
2. Click en el icono de engranaje (ajustes) → **"Users and permissions"**
3. Click en **"Invite user"**
4. En **"Email address"**, pega el `client_email` del JSON que descargaste
5. En **"Assign roles"**, selecciona:
   - **Financial data** — Financial analyst (acceso de lectura)
   - **Admin** — Admin (acceso completo, si necesitas)
6. Click **"Send invitation"**

---

## 8. Testear con Google Play Tester Account

Para probar IAP antes de publicar:

1. En Google Play Console, ve a **"Internal testing"** (tab en tu app)
2. Click en **"Internal test"** → crear un release de test
3. Click en **"Manage testers"**
4. Agrega tu Google Account email como tester interno
5. Usa un dispositivo Android con ese email
6. Descarga la app del enlace de test (no App Store — es un APK interno)
7. Intenta comprar — te mostrará transacciones de test pero no cobrará

---

## 9. Store Listing (Opcional pero recomendado)

Aunque el producto sea gratis, necesitas completar un "app listing" para poder publicar:

1. En Google Play Console, ve a **"Store presence"** → **"Main store listing"**
2. Rellena:
   - **App name:** EvidenceVault
   - **Short description:** Secure incident documentation with encryption and integrity verification
   - **Full description:** [Copia del README.md]
   - **Screenshots:** (añade 2-5 screenshots de la app)
   - **Feature graphic:** (imagen 1024x500)
   - **Icon:** (512x512)
   - **Content rating:** Complete the questionnaire
   - **Target audience:** Adults (por la naturaleza sensible de la app)
3. Click **"Save"**

---

## Checklist

- [ ] Google Play Developer Account creada y activa ($25 pagado)
- [ ] App registrada en Google Play Console
- [ ] Producto mensual creado: `evidencevault_premium_monthly`
- [ ] (Opcional) Producto anual creado: `evidencevault_premium_annual`
- [ ] Service Account creado en Google Cloud Console
- [ ] JSON key descargada y guardada en lugar seguro
- [ ] Service Account conectada a Google Play Console
- [ ] Tester interno configurado para testing

---

## Próximo Paso

Una vez que tengas:
- El JSON key de Google Cloud
- El Product ID confirmado (`evidencevault_premium_monthly`)

Ve a [SETUP_REVENUECAT.md](SETUP_REVENUECAT.md).
