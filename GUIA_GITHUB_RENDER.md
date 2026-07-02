# 🚀 Guía Paso a Paso: Despliegue Gratis con GitHub + Render.com
**Sistema Comercial Red Líder • Modelo Ingresos Predecibles**
*Orientado para Dani, Óscar, Carlos y el equipo de desarrollo/operaciones.*

---

## ¿Por qué elegir GitHub + Render.com?
Esta opción es **la más recomendada para producción gratis o de bajo costo**, ya que te ofrece:
1. **Dominio HTTPS gratuito** (ej. `https://crm-red-lider.onrender.com`).
2. **Despliegue Continuo (CI/CD)**: Cada vez que hagas un cambio y lo subas a GitHub, tu página web se actualizará automáticamente en 2 minutos sin tocar un servidor.
3. **Servidor Full-Stack (Node.js + Express + React 19)**: Compatible al 100% con nuestra arquitectura de webhooks para recibir mensajes en vivo de WhatsApp Cloud API.
4. **Cero costo inicial**: El plan gratuito de Render es ideal para equipos comerciales que están iniciando o validando flujos.

---

## 🛠️ PASO 1: Subir el código de AI Studio a GitHub

Tienes **dos formas sencillas** de pasar este proyecto a tu cuenta de GitHub:

### Forma A: Botón directo "Export to GitHub" en AI Studio (¡La más rápida!)
1. En la barra superior derecha de tu ventana de **Google AI Studio / Build**, busca el menú de configuración o tres puntos (`⋮` o **Share / Export**).
2. Selecciona la opción **"Export to GitHub"** o **"Download ZIP"**.
3. Si eliges *Export to GitHub*, conecta tu cuenta de GitHub autorizando el acceso y dale un nombre a tu repositorio (ej. `crm-red-lider-2026`).
4. ¡Listo! Tu código ya está en tu repositorio privado o público de GitHub.

### Forma B: Descargar ZIP y subirlo manualmente a GitHub
1. En AI Studio, haz clic en **Download ZIP** para descargar todo el proyecto en tu computadora.
2. Descomprime la carpeta en tu computadora.
3. Entra a [github.com](https://github.com/) e inicia sesión (o crea una cuenta gratuita).
4. Haz clic en el botón verde **"New"** (o en el icono `+` arriba a la derecha -> *New repository*).
5. Ponle un nombre (ej. `crm-red-lider`), selecciona si será **Private** (Recomendado para CRM) o **Public**, y haz clic en **Create repository**.
6. En tu computadora, abre una terminal en la carpeta descomprimida y ejecuta los siguientes comandos (o sube los archivos arrastrándolos a la página de GitHub si lo prefieres):
   ```bash
   git init
   git add .
   git commit -m "Inicializando CRM Red Líder"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/crm-red-lider.git
   git push -u origin main
   ```

---

## ☁️ PASO 2: Crear tu Web Service Gratuito en Render.com

Con tu código en GitHub, publicarlo en internet toma solo 3 minutos:

1. Entra a [render.com](https://render.com/) y haz clic en **"Get Started for Free"** (o Iniciar Sesión).
2. Regístrate haciendo clic en el botón **"GitHub"** para vincular tu cuenta directamente.
3. Una vez en el panel principal (Dashboard) de Render, haz clic en el botón azul **"+ New"** arriba a la derecha y selecciona **"Web Service"**.
4. En la pantalla de *Connect a repository*, verás tu lista de repositorios de GitHub. Busca `crm-red-lider` y haz clic en **"Connect"**.
   *(Nota: Si no aparece, haz clic en "Configure account" para darle permiso a Render de ver tu nuevo repositorio).*

---

## ⚙️ PASO 3: Configurar el Servidor en Render

Render intentará llenar varios campos automáticamente gracias al archivo `render.yaml` y `package.json` que hemos preparado en el código. Verifica que los datos sean:

* **Name:** `crm-red-lider` (o el nombre que gustes para tu URL, ej. `redlider-app`).
* **Region:** *Oregon (US West)* o la más cercana a Perú/Latam.
* **Branch:** `main`
* **Runtime:** `Node`
* **Build Command:** `npm install && npm run build`
* **Start Command:** `npm start`
* **Instance Type:** Selecciona **Free** ($0/month - 512 MB RAM).

### 🔑 Variables de Entorno (Environment Variables)
Desplázate hacia abajo hasta la sección **Environment Variables** y asegúrate de agregar o verificar esta variable clave:
* Key: `PORT` | Value: `3000`  *(Obligatorio para que Render enlace con Express)*
* Key: `NODE_ENV` | Value: `production`
* Key: `META_VERIFY_TOKEN` | Value: `red_lider_webhook_secret_2026`

5. Haz clic en el botón inferior **"Create Web Service"**.

---

## 🎉 PASO 4: ¡Disfrutar de tu CRM en Vivo y Conectar WhatsApp!

1. Render empezará a construir tu aplicación en la pestaña *Logs*. Verás cómo descarga paquetes, compila TypeScript y genera el empaquetado de producción.
2. Tras unos **2 a 3 minutos**, verás el mensaje verde: `Your service is live 🎉`.
3. Arriba a la izquierda, verás la URL oficial de tu CRM:
   👉 **`https://crm-red-lider.onrender.com`** (o similar).
4. **¡Haz clic en ese enlace!** Ya puedes compartir esa dirección con Óscar, Carlos, Dani y los vendedores para que entren desde sus celulares o computadoras.

---

## 📲 PASO 5: Conectar el Webhook Oficial de Meta WhatsApp

Ahora que tu aplicación está en internet con certificado SSL (`https://...`), puedes conectar WhatsApp en vivo:

1. Entra a tu portal de [Meta for Developers](https://developers.facebook.com/) > Tu Aplicación de WhatsApp > **WhatsApp > Configuration**.
2. En la sección **Webhook**, haz clic en *Edit* o *Configure*.
3. En **Callback URL**, pega la dirección de tu app en Render agregando `/api/webhook`:
   👉 `https://crm-red-lider.onrender.com/api/webhook`
4. En **Verify Token**, escribe el token secreto:
   👉 `red_lider_webhook_secret_2026`
5. Haz clic en **Verify and Save** (Verificar y guardar). ¡Meta enviará una petición en microsegundos y se conectará en verde!
6. Suscribe el campo **`messages`**. ¡A partir de ese momento, cualquier cliente que escriba a tu WhatsApp aparecerá automáticamente como tarjeta en el embudo Kanban!

---

## 💡 Consejos Pro para Trabajar y Editar Posteriormente

1. **¿Cómo hago cambios o mejoras después?**
   * Siempre que quieras modificar el código (agregar nuevos campos, cambiar colores, etc.), haces el cambio en tu computadora o en GitHub y ejecutas `git push origin main`.
   * **¡Render lo detectará al instante y actualizará la página en 2 minutos automáticamente sin que tú hagas nada!**

2. **Acerca del almacenamiento en el Plan Gratuito (SQLite):**
   * En el plan gratuito de Render, el disco duro se reinicia si el servidor entra en reposo por inactividad.
   * **Solución práctica recomendada:** Utiliza el botón **"📥 Exportar CSV"** en la pestaña *Lista de Leads* del CRM una vez a la semana o al final del día para tener un respaldo Excel en tu computadora.
   * Si en el futuro desean persistencia eterna 24/7 sin descargas, pueden conectar con 1 clic una base de datos gratuita como **PostgreSQL (Supabase / Render DB)** o **Google Firebase Firestore**.

---
*Documentación elaborada por el asistente de inteligencia artificial para Red Líder.*
