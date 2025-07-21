// backend/utils/embeddingUtils.js

const { pipeline } = require('@xenova/transformers');

let embedder = null;

// Load once globally
async function loadEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

// Text → [Vector]
async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const model = await loadEmbedder();
  const result = await model(text, {
    pooling: 'mean',      // average pooling across tokens
    normalize: true       // normalize vector length
  });

  return Array.from(result.data); // Convert to JS array
}

module.exports = { generateEmbedding };
