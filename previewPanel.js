const vscode = require('vscode');
const { t } = require('./i18n');

/**
 * Abre un panel de preview Webview que muestra la imagen generada
 * junto con un campo de texto editable y botones Publish/Cancel.
 *
 * @param {Buffer} pngBuffer - Imagen PNG generada
 * @param {string} lang - Lenguaje del código (ej: 'javascript')
 * @returns {Promise<{action: 'publish', text: string} | {action: 'cancel'}>}
 */
function showPreviewPanel(pngBuffer, lang) {
  return new Promise((resolve) => {
    const panel = vscode.window.createWebviewPanel(
      'xWriterPreview',
      t('previewTitle'),
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: false },
      {
        enableScripts: true,
        retainContextWhenHidden: false
      }
    );

    const base64 = pngBuffer.toString('base64');
    const html = getPreviewHtml(base64, lang, panel.webview.cspSource);
    panel.webview.html = html;

    const disposable = panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.type === 'publish') {
          disposable.dispose();
          panel.dispose();
          resolve({ action: 'publish', text: message.text || '' });
        } else if (message.type === 'cancel') {
          disposable.dispose();
          panel.dispose();
          resolve({ action: 'cancel' });
        } else if (message.type === 'ready') {
          // Webview está listo para recibir datos
        }
      },
      undefined,
      []
    );

    // Si cierran el panel manualmente, se cancela
    panel.onDidDispose(() => {
      disposable.dispose();
      resolve({ action: 'cancel' });
    }, null, []);
  });
}

function getPreviewHtml(base64Image, lang, cspSource) {
  const placeHolderText = t('previewTextPlaceholder');
  const publishLabel = t('previewPublish');
  const cancelLabel = t('previewCancel');
  const titleLabel = t('previewHeader');
  const signatureInfo = getSignaturePreviewInfo();

  const escapedBase64 = base64Image;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src https://fonts.googleapis.com https://fonts.gstatic.com;">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    /* Header bar */
    .header {
      background: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .header h2 {
      font-size: 15px;
      font-weight: 600;
      color: #e6edf3;
      letter-spacing: -0.2px;
    }
    .header .lang-badge {
      background: #1f6feb22;
      border: 1px solid #1f6feb44;
      color: #58a6ff;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
    }

    /* Image area */
    .image-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    .image-container {
      position: relative;
      display: inline-block;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
      max-width: 100%;
    }
    .image-container img {
      display: block;
      max-width: 100%;
      height: auto;
    }
    .image-container::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 12px;
      pointer-events: none;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
    }

    /* Text input area */
    .input-area {
      background: #161b22;
      border-top: 1px solid #30363d;
      padding: 16px 24px;
      flex-shrink: 0;
    }
    .input-label {
      font-size: 12px;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    textarea {
      width: 100%;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      color: #c9d1d9;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      line-height: 1.5;
      padding: 12px 14px;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s;
      min-height: 60px;
      max-height: 120px;
    }
    textarea:focus {
      border-color: #1f6feb;
      box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.15);
    }
    textarea::placeholder {
      color: #484f58;
    }
    .char-count {
      font-size: 11px;
      color: #8b949e;
      text-align: right;
      margin-top: 6px;
    }
    .char-count.warning {
      color: #d29922;
    }
    .char-count.danger {
      color: #f85149;
    }

    /* Signature preview */
    .signature-preview {
      font-size: 11px;
      color: #58a6ff;
      margin-top: 6px;
      padding: 6px 10px;
      background: #1f6feb0a;
      border-left: 2px solid #1f6feb55;
      border-radius: 0 6px 6px 0;
    }

    /* Buttons bar */
    .buttons-bar {
      background: #161b22;
      border-top: 1px solid #30363d;
      padding: 12px 24px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      flex-shrink: 0;
    }
    button {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      padding: 9px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      letter-spacing: -0.1px;
    }
    button:active {
      transform: scale(0.97);
    }
    .btn-cancel {
      background: #21262d;
      color: #c9d1d9;
      border: 1px solid #30363d;
    }
    .btn-cancel:hover {
      background: #30363d;
      border-color: #8b949e;
    }
    .btn-publish {
      background: #1f6feb;
      color: #ffffff;
      box-shadow: 0 0 0 0 rgba(31, 111, 235, 0.4);
      transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
    }
    .btn-publish:hover {
      background: #388bfd;
      box-shadow: 0 4px 14px rgba(31, 111, 235, 0.35);
    }
    .btn-publish:disabled {
      background: #21262d;
      color: #484f58;
      cursor: not-allowed;
      box-shadow: none;
      border: 1px solid #30363d;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>${titleLabel}</h2>
    <span class="lang-badge">${escapeHtml(lang)}</span>
  </div>

  <div class="image-scroll">
    <div class="image-container">
      <img src="data:image/png;base64,${escapedBase64}" alt="Code Preview" />
    </div>
  </div>

  <div class="input-area">
    <div class="input-label">${t('previewMessageLabel')}</div>
    <textarea
      id="messageInput"
      placeholder="${placeHolderText}"
      maxlength="280"
      rows="2"
    ></textarea>
    <div class="char-count" id="charCount">0 / 280</div>
    <div class="signature-preview" id="signaturePreview">${signatureInfo}</div>
  </div>

  <div class="buttons-bar">
    <button class="btn-cancel" id="btnCancel">${cancelLabel}</button>
    <button class="btn-publish" id="btnPublish">${publishLabel}</button>
  </div>

  <script>
    (function() {
      const vscode = acquireVsCodeApi();

      const textarea = document.getElementById('messageInput');
      const charCount = document.getElementById('charCount');
      const btnPublish = document.getElementById('btnPublish');
      const btnCancel = document.getElementById('btnCancel');
      const signaturePreview = document.getElementById('signaturePreview');

      const MAX_LENGTH = 280;

      // Update character count
      function updateCharCount() {
        const len = textarea.value.length;
        charCount.textContent = len + ' / ' + MAX_LENGTH;

        charCount.classList.remove('warning', 'danger');
        if (len > 260 && len <= MAX_LENGTH) {
          charCount.classList.add('warning');
        } else if (len > MAX_LENGTH) {
          charCount.classList.add('danger');
        }
      }

      textarea.addEventListener('input', updateCharCount);

      // Publish button
      btnPublish.addEventListener('click', function() {
        btnPublish.disabled = true;
        btnPublish.textContent = '${t('previewPublishing')}';
        vscode.postMessage({ type: 'publish', text: textarea.value });
      });

      // Cancel button
      btnCancel.addEventListener('click', function() {
        vscode.postMessage({ type: 'cancel' });
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        // Ctrl+Enter or Cmd+Enter to publish
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          btnPublish.click();
        }
        // Escape to cancel
        if (e.key === 'Escape') {
          e.preventDefault();
          btnCancel.click();
        }
      });

      // Auto-focus textarea
      textarea.focus();

      // Notify extension we're ready
      vscode.postMessage({ type: 'ready' });
    })();
  </script>
</body>
</html>`;
}

/**
 * Returns a short preview of what the signature will look like.
 */
function getSignaturePreviewInfo() {
  try {
    const config = vscode.workspace.getConfiguration('xWriter.signature');
    const enabled = config.get('enabled', true);
    const sigText = config.get('text', '🚀 via X Writer');
    if (enabled && sigText) {
      return '🔖 ' + t('previewSignatureOn') + ': ' + sigText;
    }
    return '🔖 ' + t('previewSignatureOff');
  } catch {
    return '🔖 Signature: 🚀 via X Writer';
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  showPreviewPanel
};
