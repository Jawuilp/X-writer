const vscode = require('vscode');

const TWEET_LIMIT = 280;

/**
 * Obtiene configuración de auto-thread
 */
function getThreadConfig() {
  const config = vscode.workspace.getConfiguration('xWriter.autoThread');
  return {
    enabled: config.get('enabled', true)
  };
}

/**
 * Divide un texto largo en múltiples tweets numerados (1/X, 2/X...).
 * Cada tweet respeta el límite de 280 caracteres.
 * @param {string} text - texto completo
 * @returns {string[]} array de tweets individuales
 */
function splitIntoThread(text) {
    const maxLen = TWEET_LIMIT;
    const tweets = [];

    // Early return for short text
    if (text.length <= maxLen) {
        return [text];
    }

    // Calcular cuántos tweets necesitamos aproximadamente para reservar espacio para " X/Y"
    // Empezamos con estimación y re-ajustamos si es necesario
    let estimatedCount = Math.ceil(text.length / (maxLen - 5));
    let suffixLength = 0;

    // Iterar para ajustar el conteo (ej. de 9 tweets pasa a 10, el sufijo cambia de tamaño)
    for (let i = 0; i < 5; i++) {
        suffixLength = ` ${estimatedCount}/${estimatedCount}`.length;
        const newCount = Math.ceil(text.length / (maxLen - suffixLength));
        if (newCount === estimatedCount) break;
        estimatedCount = newCount;
    }

    if (estimatedCount <= 1) {
        return text.length > maxLen ? [text.substring(0, maxLen)] : [text];
    }

  let remaining = text;
  let index = 1;

  while (remaining.length > 0) {
    const suffix = ` ${index}/${estimatedCount}`;
    const chunkLimit = maxLen - suffix.length;

    let chunk = remaining.substring(0, chunkLimit);
    // Evitar cortar palabras si es posible
    if (remaining.length > chunkLimit) {
      const lastSpace = chunk.lastIndexOf(' ');
      if (lastSpace > chunkLimit * 0.5) {
        chunk = chunk.substring(0, lastSpace);
      }
    }

    tweets.push(chunk.trim() + suffix);
    remaining = remaining.substring(chunk.length).trimStart();
    index++;
  }

  // Si sobra un tweet vacío o el conteo cambió, re-hacer sin división forzada
  if (tweets.length !== estimatedCount && remaining.length === 0) {
    // Recalcular exacto
    return splitIntoThreadExact(text);
  }

  return tweets;
}

/**
 * Versión exacta sin estimación.
 */
function splitIntoThreadExact(text) {
  const tweets = [];
  let remaining = text;

  // Primera pasada: dividir en chunks brutos
  const rawChunks = [];
  while (remaining.length > 0) {
    let chunk = remaining.substring(0, TWEET_LIMIT - 8); // reservar espacio para sufijo
    if (remaining.length > TWEET_LIMIT - 8) {
      const lastSpace = chunk.lastIndexOf(' ');
      if (lastSpace > chunk.length * 0.5) {
        chunk = chunk.substring(0, lastSpace);
      }
    }
    rawChunks.push(chunk.trim());
    remaining = remaining.substring(chunk.length).trimStart();
  }

  const total = rawChunks.length;
  rawChunks.forEach((chunk, i) => {
    tweets.push(`${chunk} ${i + 1}/${total}`);
  });

  return tweets;
}

/**
 * Determina si el texto necesita thread.
 * @param {string} text
 * @returns {boolean}
 */
function needsThread(text) {
  const { enabled } = getThreadConfig();
  if (!enabled) return false;
  return text.length > TWEET_LIMIT;
}

module.exports = {
  getThreadConfig,
  splitIntoThread,
  needsThread,
  TWEET_LIMIT
};
