const vscode = require('vscode');

/**
 * Obtiene la configuración de firma actual
 */
function getSignatureConfig() {
  const config = vscode.workspace.getConfiguration('xWriter.signature');
  return {
    enabled: config.get('enabled', true),
    text: config.get('text', '🚀 via X Writer')
  };
}

/**
 * Aplica la firma al texto si está habilitada y cabe en el límite.
 * Si no cabe, devuelve el texto sin firma.
 * @param {string} text
 * @param {number} limit - límite de caracteres (default 280)
 * @returns {string}
 */
function applySignature(text, limit = 280) {
  const { enabled, text: sig } = getSignatureConfig();
  if (!enabled || !sig) {
    return text;
  }
  const fullText = `${text}\n\n${sig}`;
  if (fullText.length > limit) {
    // Si no cabe la firma, publicar sin ella
    return text;
  }
  return fullText;
}

/**
 * Calcula el texto efectivo de un tweet considerando firma.
 * Usado para validación de input.
 * @param {string} text
 * @returns {{signedText: string, signatureApplied: boolean}}
 */
function previewSignature(text) {
  const { enabled, text: sig } = getSignatureConfig();
  if (!enabled || !sig) {
    return { signedText: text, signatureApplied: false };
  }
  const fullText = `${text}\n\n${sig}`;
  if (fullText.length > 280) {
    return { signedText: text, signatureApplied: false };
  }
  return { signedText: fullText, signatureApplied: true };
}

module.exports = {
  getSignatureConfig,
  applySignature,
  previewSignature
};
