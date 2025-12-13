const vscode = require('vscode');
const { t } = require('./i18n');

const SECRET_KEYS = {
  apiKey: 'twitter.apiKey',
  apiSecret: 'twitter.apiSecret',
  accessToken: 'twitter.accessToken',
  accessSecret: 'twitter.accessSecret',
};

/**
 * Pide las credenciales de Twitter (Manual o Importar)
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<void>}
 */
async function setupCredentials(context) {
  const choice = await vscode.window.showQuickPick(
    [
      {
        label: t('importOptionLabel'),
        description: t('importOptionDesc'),
        detail: t('importOptionDetail')
      },
      {
        label: t('manualOptionLabel'),
        description: t('manualOptionDesc'),
        detail: t('manualOptionDetail')
      }
    ],
    {
      placeHolder: t('setupCredentialsPrompt')
    }
  );

  if (!choice) {
    return;
  }

  if (choice.label.includes('$(file-text)')) { // Check icon or something unique, or just rely on index/label content logic if robust. But translation changes label.
    // Safer to check index or some ID. QuickPickItem doesn't have ID by default but we can check description.
    // Or simply: if it's not manual.
    // Actually, t() returns the string, so we can check against t('importOptionLabel').
  }

  // Better logic: store ID in quickpick item if possible, or just strict compare.
  // VS Code QuickPick items are arbitrary objects.

  if (choice.label === t('importOptionLabel')) {
    // Mostrar instrucciones claras del formato antes de abrir el selector
    const proceed = await vscode.window.showInformationMessage(
      t('importFormatInfo'),
      { modal: true, detail: t('importOptionDetail') },
      t('selectFile')
    );

    if (proceed === t('selectFile')) {
      await importCredentials(context);
    }
  } else {
    await setupCredentialsManual(context);
  }
}

/**
 * Lógica manual para pedir credenciales
 */
async function setupCredentialsManual(context) {
  const { secrets } = context;

  const apiKey = await vscode.window.showInputBox({
    prompt: t('apiKeyPrompt'),
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'API Key',
  });
  if (apiKey === undefined) return;

  const apiSecret = await vscode.window.showInputBox({
    prompt: t('apiSecretPrompt'),
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'API Secret',
  });
  if (apiSecret === undefined) return;

  const accessToken = await vscode.window.showInputBox({
    prompt: t('accessTokenPrompt'),
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'Access Token',
  });
  if (accessToken === undefined) return;

  const accessSecret = await vscode.window.showInputBox({
    prompt: t('accessSecretPrompt'),
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'Access Secret',
  });
  if (accessSecret === undefined) return;

  await saveAndVerifyCredentials(context, apiKey, apiSecret, accessToken, accessSecret);
}

/**
 * Importa credenciales desde un archivo local (.env o .txt)
 * @param {vscode.ExtensionContext} context
 */
async function importCredentials(context) {
  const fileUri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: {
      'Archivos de Credenciales': ['env', 'txt', 'text'],
      'Todos los archivos': ['*']
    },
    openLabel: t('selectFile')
  });

  if (!fileUri || fileUri.length === 0) {
    return;
  }

  try {
    const fs = require('fs');
    const content = fs.readFileSync(fileUri[0].fsPath, 'utf8');

    const lines = content.split(/\r?\n/);
    const config = {};

    // Mapeo de posibles nombres a nuestras claves internas
    const keyMap = {
      'API_KEY': 'apiKey', 'CONSUMER_KEY': 'apiKey', 'TWITTER_API_KEY': 'apiKey', 'X_API_KEY': 'apiKey',
      'API_SECRET': 'apiSecret', 'CONSUMER_SECRET': 'apiSecret', 'TWITTER_API_SECRET': 'apiSecret', 'X_API_SECRET': 'apiSecret',
      'ACCESS_TOKEN': 'accessToken', 'TWITTER_ACCESS_TOKEN': 'accessToken', 'X_ACCESS_TOKEN': 'accessToken',
      'ACCESS_SECRET': 'accessSecret', 'ACCESS_TOKEN_SECRET': 'accessSecret', 'TWITTER_ACCESS_SECRET': 'accessSecret', 'X_ACCESS_SECRET': 'accessSecret'
    };

    lines.forEach(line => {
      // Ignorar comentarios y líneas vacías
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      // Buscar CLAVE=VALOR (soporta comillas)
      const match = trimmed.match(/^([^=:]+)[=:]\s*["']?([^"']+)["']?$/);
      if (match) {
        const key = match[1].trim().toUpperCase();
        let value = match[2].trim();

        // Limpiar comillas extras al final si las hubiera
        value = value.replace(/["']$/, '');

        // Normalizar nombres como export API_KEY
        const cleanKey = key.replace(/^EXPORT\s+/, '');

        if (keyMap[cleanKey]) {
          config[keyMap[cleanKey]] = value;
        }
      }
    });

    const missing = [];
    if (!config.apiKey) missing.push('API_KEY');
    if (!config.apiSecret) missing.push('API_SECRET');
    if (!config.accessToken) missing.push('ACCESS_TOKEN');
    if (!config.accessSecret) missing.push('ACCESS_SECRET');

    if (missing.length > 0) {
      throw new Error(t('missingKeys', missing.join(', ')));
    }

    await saveAndVerifyCredentials(context, config.apiKey, config.apiSecret, config.accessToken, config.accessSecret);

  } catch (error) {
    vscode.window.showErrorMessage(t('importError', error.message));
    console.error(error);
  }
}

/**
 * Guarda y verifica credenciales (Lógica compartida)
 */
async function saveAndVerifyCredentials(context, apiKey, apiSecret, accessToken, accessSecret) {
  const { secrets } = context;

  await secrets.store(SECRET_KEYS.apiKey, apiKey);
  await secrets.store(SECRET_KEYS.apiSecret, apiSecret);
  await secrets.store(SECRET_KEYS.accessToken, accessToken);
  await secrets.store(SECRET_KEYS.accessSecret, accessSecret);
  console.log('Credentials stored successfully in SecretStorage');

  // Verificar
  try {
    const { TwitterApi } = require('twitter-api-v2');
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    const user = await client.v2.me();
    const username = user.data.username;
    console.log(`Verification successful! Username: ${username}`);

    await context.globalState.update('cachedUsername', username);

    // Prompt user to verify the account is correct
    vscode.window.showInformationMessage(t('verificationSuccess', username));
  } catch (error) {
    console.error('Credential verification failed:', error);
    vscode.window.showWarningMessage(t('verificationFailed', error.message));
  }
}

/**
 * Obtiene las credenciales de Twitter desde SecretStorage.
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<{ apiKey: string | undefined, apiSecret: string | undefined, accessToken: string | undefined, accessSecret: string | undefined }>}
 */
async function getCredentials(context) {
  const { secrets } = context;

  const [apiKey, apiSecret, accessToken, accessSecret] = await Promise.all([
    secrets.get(SECRET_KEYS.apiKey),
    secrets.get(SECRET_KEYS.apiSecret),
    secrets.get(SECRET_KEYS.accessToken),
    secrets.get(SECRET_KEYS.accessSecret),
  ]);

  return { apiKey, apiSecret, accessToken, accessSecret };
}

/**
 * Elimina todas las credenciales de Twitter del SecretStorage con confirmación.
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<void>}
 */
async function resetCredentials(context) {
  const answer = await vscode.window.showWarningMessage(
    t('deleteConfirm'),
    { modal: true },
    t('deleteButton'),
    t('cancelButton')
  );

  if (answer !== t('deleteButton')) {
    return;
  }

  const { secrets } = context;

  await Promise.all([
    secrets.delete(SECRET_KEYS.apiKey),
    secrets.delete(SECRET_KEYS.apiSecret),
    secrets.delete(SECRET_KEYS.accessToken),
    secrets.delete(SECRET_KEYS.accessSecret),
  ]);

  await context.globalState.update('cachedUsername', undefined);
  vscode.window.showInformationMessage(t('credentialsDeleted'));
}

module.exports = {
  setupCredentials,
  importCredentials,
  getCredentials,
  resetCredentials,
};
