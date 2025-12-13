const vscode = require('vscode');

const messages = {
    en: {
        setupCredentialsTitle: "Setup Credentials",
        setupCredentialsPrompt: "How do you want to configure your X/Twitter credentials?",
        importOptionLabel: "$(file-text) Import from file",
        importOptionDesc: "Load .env or .txt with your keys",
        importOptionDetail: "Recommended. Format: API_KEY=..., API_SECRET=...",
        manualOptionLabel: "$(key) Enter manually",
        manualOptionDesc: "Type the 4 keys one by one",
        manualOptionDetail: "If you prefer to copy/paste each key manually",
        importFormatInfo: "The file must have this format (one key per line):\n\nAPI_KEY=your_key\nAPI_SECRET=your_secret\nACCESS_TOKEN=your_token\nACCESS_SECRET=your_access_secret",
        selectFile: "Select File",
        importError: "Error importing credentials: {0}",
        missingKeys: "Missing the following variables: {0}",
        credentialsStored: "Credentials stored successfully in SecretStorage",
        verificationSuccess: "✅ Credentials verified. Connected as @{0}",
        verificationFailed: "Credentials saved, but verification failed: {0}. Please ensure they are valid.",
        deleteConfirm: "Are you sure you want to delete your X/Twitter credentials from VS Code?",
        deleteButton: "Yes, delete",
        cancelButton: "Cancel",
        credentialsDeleted: "Credentials deleted successfully.",
        missingCredentialsPost: "Missing credentials. Please configure them first.",
        setupNow: "Do you want to configure them now?",
        yes: "Yes",
        no: "No",
        rateLimitReached: "⚠️ You have reached your daily limit of 17 tweets. Resets in {0}.",
        tweetPlaceholder: "What's happening?",
        tweetEmpty: "Tweet cannot be empty",
        tweetTooLong: "⚠️ {0}/280 characters - Too long",
        postingTitle: "Posting to X...",
        tweetSuccess: "✅ Tweet posted successfully!",
        viewOnX: "View on X",
        error429: "⛔ Error 429: You have exceeded the Twitter API limit for today.",
        errorAuth: "⛔ Auth/Permission Error. Check your credentials.",
        errorGeneric: "Error posting tweet: {0}",
        donatePrompt: "💙 Enjoying X Writer? Consider supporting development",
        donateButton: "Buy me a Coffee ☕",
        laterButton: "Later",
        apiKeyPrompt: "Enter your Twitter API Key",
        apiSecretPrompt: "Enter your Twitter API Secret",
        accessTokenPrompt: "Enter your Twitter Access Token",
        accessSecretPrompt: "Enter your Twitter Access Secret",

        // Tree View
        "tree.postTweet": "✍️ Post Tweet",
        "tree.postTweetTooltip": "Write and post a tweet",
        "tree.setup": "⚙️ Setup Credentials",
        "tree.setupTooltip": "Configure your Twitter credentials",
        "tree.reset": "🗑️ Delete Credentials",
        "tree.resetTooltip": "Delete your saved credentials",
        "tree.donate": "💙 Donate / Support",
        "tree.donateTooltip": "Support X Writer development",
        "tree.help": "❓ Help & About",
        "tree.helpTooltip": "Commands info and About developer",

        // Help Command
        "helpMessage": "X Writer v0.0.1\n\nCommands:\n- Post Tweet: Publish to X\n- Setup/Import: Configure keys\n- Reset: Delete keys\n\nChange Language: Settings > X Writer > Language\n\nCreated by Jawuil Pineda",
        "changeLanguage": "Change Language",
        "selectLanguage": "Select Language",
        "languageChanged": "Language changed to {0}",
        "visitWebsite": "🌐 Visit jawuil.dev",
        "viewReadme": "📖 View Documentation"
    },
    es: {
        setupCredentialsTitle: "Configurar Credenciales",
        setupCredentialsPrompt: "¿Cómo quieres configurar tus credenciales de X/Twitter?",
        importOptionLabel: "$(file-text) Importar desde archivo",
        importOptionDesc: "Cargar .env o .txt con tus claves",
        importOptionDetail: "Recomendado. Formato: API_KEY=..., API_SECRET=...",
        manualOptionLabel: "$(key) Ingresar manualmente",
        manualOptionDesc: "Escribir las 4 claves una por una",
        manualOptionDetail: "Si prefieres copiar y pegar cada clave manualmente",
        importFormatInfo: "El archivo debe tener este formato (una clave por línea):\n\nAPI_KEY=tu_clave\nAPI_SECRET=tu_secreto\nACCESS_TOKEN=tu_token\nACCESS_SECRET=tu_secreto_acceso",
        selectFile: "Seleccionar Archivo",
        importError: "Error al importar credenciales: {0}",
        missingKeys: "Faltan las siguientes variables: {0}",
        credentialsStored: "Credenciales guardadas correctamente",
        verificationSuccess: "✅ Credenciales verificadas. Conectado como @{0}",
        verificationFailed: "Credenciales guardadas, pero la verificación falló: {0}. Asegúrate de que sean válidas.",
        deleteConfirm: "¿Estás seguro de que quieres eliminar tus credenciales de X/Twitter de VS Code?",
        deleteButton: "Sí, eliminar",
        cancelButton: "Cancelar",
        credentialsDeleted: "Credenciales eliminadas correctamente.",
        missingCredentialsPost: "Faltan credenciales. Por favor configúralas primero.",
        setupNow: "¿Quieres configurarlas ahora?",
        yes: "Sí",
        no: "No",
        rateLimitReached: "⚠️ Has alcanzado tu límite diario de 17 tweets. Se reinicia en {0}.",
        tweetPlaceholder: "¿Qué está pasando?",
        tweetEmpty: "El tweet no puede estar vacío",
        tweetTooLong: "⚠️ {0}/280 caracteres - Demasiado largo",
        postingTitle: "Publicando en X...",
        tweetSuccess: "✅ Tweet publicado con éxito!",
        viewOnX: "Ver en X",
        error429: "⛔ Error 429: Has excedido el límite de la API de Twitter por hoy.",
        errorAuth: "⛔ Error de permisos/autenticación. Verifica tus credenciales.",
        errorGeneric: "Error al publicar: {0}",
        donatePrompt: "💙 ¿Te gusta X Writer? Considera apoyar el desarrollo",
        donateButton: "Donar un Café ☕",
        laterButton: "Más tarde",
        apiKeyPrompt: "Introduce tu Twitter API Key",
        apiSecretPrompt: "Introduce tu Twitter API Secret",
        accessTokenPrompt: "Introduce tu Twitter Access Token",
        accessSecretPrompt: "Introduce tu Twitter Access Secret",

        // Tree View
        "tree.postTweet": "✍️ Publicar Tweet",
        "tree.postTweetTooltip": "Escribe y publica un tweet",
        "tree.setup": "⚙️ Configurar Credenciales",
        "tree.setupTooltip": "Configura tus credenciales de Twitter",
        "tree.reset": "🗑️ Eliminar Credenciales",
        "tree.resetTooltip": "Elimina tus credenciales guardadas",
        "tree.donate": "💙 Donar / Apoyar",
        "tree.donateTooltip": "Apoya el desarrollo de X Writer",
        "tree.help": "❓ Ayuda / Acerca de",
        "tree.helpTooltip": "Información de comandos y desarrollador",

        // Help Command
        "helpMessage": "X Writer v0.0.1\n\nComandos:\n- Publicar: Postea en X\n- Configurar/Importar: Gestiona claves\n- Eliminar: Borra credenciales\n\nCambiar Idioma: Configuración > X Writer > Language\n\nCreado por Jawuil Pineda",
        "changeLanguage": "Cambiar Idioma",
        "selectLanguage": "Seleccionar Idioma",
        "languageChanged": "Idioma cambiado a {0}",
        "visitWebsite": "🌐 Visitar jawuil.dev",
        "viewReadme": "📖 Ver Documentación"
    }
};

function getLanguage() {
    const config = vscode.workspace.getConfiguration('xWriter');
    const lang = config.get('language');
    if (lang === 'es' || lang === 'en') {
        return lang;
    }
    // Default to English if not set or invalid
    return 'en';
}

function t(key, ...args) {
    const lang = getLanguage();
    let str = messages[lang][key] || messages['en'][key] || key;

    args.forEach((arg, i) => {
        str = str.replace(`{${i}}`, arg);
    });

    return str;
}

module.exports = {
    t
};
