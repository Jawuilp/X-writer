# X Writer

Extensión de VS Code para publicar tweets en Twitter/X directamente desde tu editor.

## Características

- 🔐 **BYOK (Bring Your Own Keys)**: Tus credenciales, tu control total
- ✍️ **Publicación Rápida**: Publica tweets sin salir de VS Code
- 🎯 **Contexto Inteligente**: Selecciona código → Click derecho → Tweet automático
- 🛡️ **Protección de Límites**: Contador automático (17 tweets/día)
- 📊 **Contador en Tiempo Real**: Visualiza caracteres mientras escribes
- 🔗 **Links Directos**: Abre tus tweets publicados con un click
- 💙 **Activity Bar**: Ícono personalizado en la barra lateral
- 🚀 **Interfaz Moderna**: Vista personalizada con acciones rápidas

## Instalación

1. Clona este repositorio
2. Ejecuta `npm install` para instalar dependencias
3. Presiona F5 para abrir una ventana de desarrollo de VS Code

## Configuración

### Obtener credenciales de Twitter

1. Ve a [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Crea una app (o usa una existente)
3. Genera tus API Keys y Access Tokens
4. Necesitarás:
   - API Key
   - API Secret
   - Access Token
   - Access Secret

### Configurar en VS Code

1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`)
2. Busca: `X Writer: Configurar Credenciales`
3. Elige una opción:
   - **Importar desde archivo** (Recomendado): Selecciona un archivo `.env` o `.txt` con tus claves (`API_KEY=...`).
   - **Ingresar manualmente**: Copia y pega tus 4 claves una por una.

> **Nota:** Asegúrate de regenerar tus *Access Tokens* después de cambiar los permisos de la App a "Read and Write" en el portal de desarrolladores.

### Donaciones
Si te gusta la extensión, puedes apoyarme invitándome un café ☕:
`X Writer: Apoyar el desarrollo` o visita [mi Ko-fi](https://ko-fi.com/jawuilp).

## Uso

### Publicar un tweet

**Método 1: Desde la Activity Bar**
1. Haz clic en el ícono de X Writer en la barra lateral izquierda 🐦
2. Click en "✍️ Publicar Tweet"
3. Escribe tu mensaje (contador en tiempo real: X/280)
4. ¡Listo! Verás un botón "Ver Tweet" para abrir en el navegador

**Método 2: Con Contexto Inteligente**
1. Selecciona código o texto en el editor
2. `Ctrl+Shift+P` → `X Writer: Publicar Tweet`
3. El texto seleccionado se pre-llenará automáticamente
4. Edita y publica

**Método 3: Desde comandos**
1. Abre la paleta de comandos (`Ctrl+Shift+P`)
2. Busca: `X Writer: Publicar Tweet`
3. Escribe tu mensaje
4. ¡Listo!

### Límite de Tweets

⚠️ Respetando los límites de la API gratuita de X:
- **17 tweets por día** (contador automático)
- El límite se reinicia cada 24 horas
- Verás tweets restantes en cada publicación

### Eliminar credenciales

1. Abre la paleta de comandos
2. Busca: `X Writer: Eliminar Credenciales`

## Seguridad

Las credenciales se almacenan de forma segura usando la API `SecretStorage` de VS Code, que utiliza el sistema de credenciales del sistema operativo (Keychain en macOS, Credential Manager en Windows, Secret Service en Linux).

## Licencia

MIT
