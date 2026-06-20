const vscode = require('vscode');

/**
 * Genera una imagen PNG a partir de código fuente usando un Webview de VS Code.
 * El webview carga highlight.js y html2canvas desde CDN, renderiza el código
 * resaltado, lo captura como imagen y devuelve el buffer PNG.
 * @param {string} code - código fuente
 * @param {string} lang - lenguaje (ej: 'javascript', 'typescript')
 * @returns {Promise<Buffer>} buffer PNG
 */
async function generateCodeImage(code, lang) {
  return new Promise((resolve, reject) => {
    const panel = vscode.window.createWebviewPanel(
      'xWriterCodeImage',
      'Generating Code Image...',
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: true,
        retainContextWhenHidden: false
      }
    );

    const html = getWebviewContent(code, lang);
    panel.webview.html = html;

    let timeoutId;

    const disposable = panel.webview.onDidReceiveMessage(
      async (message) => {
        clearTimeout(timeoutId);
        if (message.type === 'image') {
          disposable.dispose();
          panel.dispose();
          const base64Data = message.dataUrl.replace(/^data:image\/png;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          resolve(buffer);
        } else if (message.type === 'error') {
          disposable.dispose();
          panel.dispose();
          reject(new Error(message.error));
        }
      },
      undefined,
      []
    );

    // Safety timeout
    timeoutId = setTimeout(() => {
      disposable.dispose();
      panel.dispose();
      reject(new Error('Timeout generating code image'));
    }, 30000);
  });
}

function getWebviewContent(code, lang) {
  const escapedCode = escapeHtml(code);
  const languageClass = lang ? `language-${lang}` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data:; script-src https://unpkg.com 'unsafe-inline'; style-src 'unsafe-inline' https://unpkg.com;">
  <title>Code Image</title>
  <link rel="stylesheet" href="https://unpkg.com/@highlightjs/cdn-assets@11.9.0/styles/github-dark.min.css">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0d1117;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    #code-container {
      background: #161b22;
      border-radius: 12px;
      padding: 32px 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      max-width: 90vw;
    }
    pre {
      margin: 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 15px;
      line-height: 1.6;
    }
    code {
      background: transparent !important;
    }
    .hljs {
      background: transparent !important;
    }
  </style>
</head>
<body>
  <div id="code-container">
    <pre><code class="${languageClass}">${escapedCode}</code></pre>
  </div>

  <script src="https://unpkg.com/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
  <script src="https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <script>
    (function() {
      const vscode = acquireVsCodeApi();

      document.addEventListener('DOMContentLoaded', function() {
        // Highlight code
        document.querySelectorAll('pre code').forEach((el) => {
          if (window.hljs) {
            window.hljs.highlightElement(el);
          }
        });

        // Wait a bit for fonts/rendering
        setTimeout(function() {
          const container = document.getElementById('code-container');
          if (window.html2canvas) {
            window.html2canvas(container, {
              backgroundColor: '#0d1117',
              scale: 2,
              useCORS: true
            }).then(function(canvas) {
              const dataUrl = canvas.toDataURL('image/png');
              vscode.postMessage({ type: 'image', dataUrl: dataUrl });
            }).catch(function(err) {
              vscode.postMessage({ type: 'error', error: err.message || 'html2canvas failed' });
            });
          } else {
            vscode.postMessage({ type: 'error', error: 'html2canvas not loaded' });
          }
        }, 800);
      });
    })();
  </script>
</body>
</html>`;
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
  generateCodeImage
};
