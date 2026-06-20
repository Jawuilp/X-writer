const vscode = require('vscode');
const { setupCredentials, getCredentials, resetCredentials, importCredentials } = require('./credentialsManager');
const { XWriterViewProvider } = require('./viewProvider');
const { canPostTweet, incrementTweetCount, formatTimeUntilReset } = require('./rateLimiter');
const { t } = require('./i18n');
const { applySignature, previewSignature } = require('./signature');
const { needsThread, splitIntoThread } = require('./threader');
const { generateCodeImage } = require('./codeToImage');
const { showPreviewPanel } = require('./previewPanel');

/**
 * Activa la extensión
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('X Writer está activa');

  // Registrar el view provider
  const viewProvider = new XWriterViewProvider();
  vscode.window.registerTreeDataProvider('xWriterView', viewProvider);

  // Comando para configurar credenciales
  const setupCmd = vscode.commands.registerCommand('xWriter.setupCredentials', async () => {
    await setupCredentials(context);
  });

  // Comando para resetear credenciales
  const resetCmd = vscode.commands.registerCommand('xWriter.resetCredentials', async () => {
    await resetCredentials(context);
  });

  // Comando para publicar tweet
  const postTweetCmd = vscode.commands.registerCommand('xWriter.postTweet', async () => {
    try {
      // Obtener credenciales
      const creds = await getCredentials(context);

      if (!creds.apiKey || !creds.apiSecret || !creds.accessToken || !creds.accessSecret) {
        console.error('Missing credentials in postTweet.');
        const setup = await vscode.window.showErrorMessage(
          t('missingCredentialsPost'),
          t('yes'),
          t('no')
        );

        if (setup === t('yes')) {
          await vscode.commands.executeCommand('xWriter.setupCredentials');
        }
        return;
      }

      // Verificar límite de tweets (17/día)
      const rateLimit = await canPostTweet(context);
      if (!rateLimit.canPost) {
        const timeLeft = formatTimeUntilReset(rateLimit.resetTime);
        vscode.window.showWarningMessage(
          t('rateLimitReached', timeLeft)
        );
        return;
      }

      // Contexto inteligente: Pre-llenar con texto seleccionado
      const editor = vscode.window.activeTextEditor;
      let initialValue = '';
      if (editor && !editor.selection.isEmpty) {
        const selectedText = editor.document.getText(editor.selection);
        initialValue = selectedText;
      }

      const autoThreadEnabled = vscode.workspace.getConfiguration('xWriter.autoThread').get('enabled', true);

      // Pedir el texto del tweet
      const tweetText = await vscode.window.showInputBox({
        prompt: `Tweet (${rateLimit.remaining} remaining)`,
        placeHolder: t('tweetPlaceholder'),
        value: initialValue,
        validateInput: (text) => {
          if (!text || text.trim().length === 0) {
            return t('tweetEmpty');
          }
          if (!autoThreadEnabled) {
            const { signedText } = previewSignature(text);
            if (signedText.length > 280) {
              return t('tweetTooLong', signedText.length);
            }
          }
          return undefined;
        }
      });

      if (!tweetText) {
        return; // Usuario canceló
      }

      // Aplicar firma
      const finalText = applySignature(tweetText);

      // Importar TwitterApi solo cuando se necesite (Lazy Load)
      const { TwitterApi } = require('twitter-api-v2');

      // Crear cliente de Twitter
      const client = new TwitterApi({
        appKey: creds.apiKey,
        appSecret: creds.apiSecret,
        accessToken: creds.accessToken,
        accessSecret: creds.accessSecret,
      });

      let tweetUrl;

      if (needsThread(finalText)) {
        // Publicar hilo
        const tweets = splitIntoThread(finalText);

        // Verificar que hay suficientes tweets disponibles en el rate limit
        const needed = tweets.length;
        const available = rateLimit.remaining;
        if (needed > available) {
          vscode.window.showWarningMessage(
            `This thread needs ${needed} tweets but you only have ${available} remaining today.`
          );
          return;
        }

        let lastTweetId = null;
        let firstTweetId = null;

        for (let i = 0; i < tweets.length; i++) {
          await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: t('threadPostingTitle', i + 1, tweets.length),
            cancellable: false
          }, async () => {
            const options = {};
            if (lastTweetId) {
              options.reply = { in_reply_to_tweet_id: lastTweetId };
            }
            const result = await client.v2.tweet(tweets[i], options);
            lastTweetId = result.data.id;
            if (!firstTweetId) {
              firstTweetId = lastTweetId;
            }
          });

          // Incrementar contador por cada tweet del hilo
          await incrementTweetCount(context);
        }

        const cachedUsername = context.globalState.get('cachedUsername');
        tweetUrl = cachedUsername
          ? `https://twitter.com/${cachedUsername}/status/${firstTweetId}`
          : `https://twitter.com/i/web/status/${firstTweetId}`;

        const action = await vscode.window.showInformationMessage(
          t('threadSuccess', tweets.length),
          t('threadViewOnX')
        );

        if (action === t('threadViewOnX')) {
          vscode.env.openExternal(vscode.Uri.parse(tweetUrl));
        }
      } else {
        // Publicar tweet único
        let tweetData;
        await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: t('postingTitle'),
          cancellable: false
        }, async () => {
          tweetData = await client.v2.tweet(finalText);
        });

        const tweetId = tweetData.data.id;
        tweetUrl = `https://twitter.com/user/status/${tweetId}`;

        // Incrementar contador diario
        await incrementTweetCount(context);

        const action = await vscode.window.showInformationMessage(
          t('tweetSuccess'),
          t('viewOnX')
        );

        if (action === t('viewOnX')) {
          vscode.env.openExternal(vscode.Uri.parse(tweetUrl));
        }
      }

      // Verificar si toca pedir donación (cada 7 tweets)
      await checkDonationPrompt(context);

    } catch (error) {
      console.error(error);
      if (error.code === 429) {
        vscode.window.showErrorMessage(t('error429'));
      } else if (error.code === 401 || error.code === 403) {
        vscode.window.showErrorMessage(t('errorAuth'));
      } else {
        vscode.window.showErrorMessage(t('errorGeneric', error.message));
      }
    }
  });

  // Comando para publicar código como imagen
  const postCodeImageCmd = vscode.commands.registerCommand('xWriter.postCodeImage', async () => {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage(t('codeImageNoSelection'));
        return;
      }

      const creds = await getCredentials(context);
      if (!creds.apiKey || !creds.apiSecret || !creds.accessToken || !creds.accessSecret) {
        const setup = await vscode.window.showErrorMessage(
          t('missingCredentialsPost'),
          t('yes'),
          t('no')
        );
        if (setup === t('yes')) {
          await vscode.commands.executeCommand('xWriter.setupCredentials');
        }
        return;
      }

      const rateLimit = await canPostTweet(context);
      if (!rateLimit.canPost) {
        const timeLeft = formatTimeUntilReset(rateLimit.resetTime);
        vscode.window.showWarningMessage(t('rateLimitReached', timeLeft));
        return;
      }

      const code = editor.document.getText(editor.selection);
      const lang = editor.document.languageId;

      // 1. Generar imagen
      let pngBuffer;
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: t('codeImageGenerating'),
        cancellable: false
      }, async () => {
        pngBuffer = await generateCodeImage(code, lang);
      });

      // 2. Mostrar preview panel
      const previewResult = await showPreviewPanel(pngBuffer, lang);

      if (previewResult.action === 'cancel') {
        return; // Usuario canceló — no publicar
      }

      // 3. Publicar (usuario confirmó)
      const finalText = previewResult.text
        ? applySignature(previewResult.text)
        : applySignature('');

      const { TwitterApi } = require('twitter-api-v2');
      const client = new TwitterApi({
        appKey: creds.apiKey,
        appSecret: creds.apiSecret,
        accessToken: creds.accessToken,
        accessSecret: creds.accessSecret,
      });

      let tweetUrl;
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: t('codeImagePosting'),
        cancellable: false
      }, async () => {
        const mediaId = await client.v1.uploadMedia(pngBuffer, { type: 'png' });
        const result = await client.v2.tweet(finalText || '', {
          media: { media_ids: [mediaId] }
        });
        tweetUrl = `https://twitter.com/user/status/${result.data.id}`;
      });

      await incrementTweetCount(context);

      const action = await vscode.window.showInformationMessage(
        t('codeImageSuccess'),
        t('viewOnX')
      );

      if (action === t('viewOnX')) {
        vscode.env.openExternal(vscode.Uri.parse(tweetUrl));
      }

      await checkDonationPrompt(context);

    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage(t('errorGeneric', error.message));
    }
  });

  // Comando para donar/apoyar
  const donateCmd = vscode.commands.registerCommand('xWriter.donate', async () => {
    const action = await vscode.window.showInformationMessage(
      t('donatePrompt'),
      t('donateButton'),
      t('laterButton')
    );

    if (action === t('donateButton')) {
      vscode.env.openExternal(vscode.Uri.parse('https://ko-fi.com/jawuilp'));
    }
  });

  // Comando de Ayuda / Acerca de
  const helpCmd = vscode.commands.registerCommand('xWriter.help', async () => {
    const action = await vscode.window.showInformationMessage(
      t('helpMessage'),
      { modal: true },
      t('changeLanguage'),
      t('visitWebsite'),
      t('viewReadme')
    );

    if (action === t('visitWebsite')) {
      vscode.env.openExternal(vscode.Uri.parse('https://jawuil.dev'));
    } else if (action === t('viewReadme')) {
      vscode.env.openExternal(vscode.Uri.parse('https://github.com/jawuilp/x-writer#readme'));
    } else if (action === t('changeLanguage')) {
      const langChoice = await vscode.window.showQuickPick(['English', 'Español'], {
        placeHolder: t('selectLanguage')
      });

      if (langChoice) {
        const config = vscode.workspace.getConfiguration('xWriter');
        const newVal = langChoice === 'Español' ? 'es' : 'en';
        await config.update('language', newVal, vscode.ConfigurationTarget.Global);

        viewProvider.refresh();
        vscode.window.showInformationMessage(t('languageChanged', langChoice));
      }
    }
  });

  // Comando para importar credenciales
  const importCmd = vscode.commands.registerCommand('xWriter.importCredentials', async () => {
    await importCredentials(context);
  });

  context.subscriptions.push(
    setupCmd, resetCmd, importCmd,
    postTweetCmd, postCodeImageCmd,
    donateCmd, helpCmd
  );
}

/**
 * Verifica si es momento de sugerir una donación
 */
async function checkDonationPrompt(context) {
  const currentTotal = context.globalState.get('lifetimeTweetCount', 0) + 1;
  await context.globalState.update('lifetimeTweetCount', currentTotal);

  console.log(`Lifetime tweets: ${currentTotal}`);

  // Cada 7 tweets
  if (currentTotal > 0 && currentTotal % 7 === 0) {
    setTimeout(async () => {
      await vscode.commands.executeCommand('xWriter.donate');
    }, 1500);
  }
}

/**
 * Desactiva la extensión
 */
function deactivate() { }

module.exports = {
  activate,
  deactivate
};
