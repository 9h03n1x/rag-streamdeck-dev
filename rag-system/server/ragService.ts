import {
  VectorStoreIndex,
  storageContextFromDefaults,
  Settings,
} from 'llamaindex';
import { gemini, GEMINI_MODEL, GeminiEmbedding, GEMINI_EMBEDDING_MODEL } from '@llamaindex/google';
import 'dotenv/config';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Configure Gemini ---
Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  apiKey: process.env.GOOGLE_API_KEY,
});
Settings.embedModel = new GeminiEmbedding({
  apiKey: process.env.GOOGLE_API_KEY,
  model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
});
// ------------------------

function getPersistDir(): string {
  // Prefer explicit configuration.
  const fromEnv = process.env.STREAMDECK_RAG_PERSIST_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }

  // When running via the VS Code extension we set cwd to docs/streamdeck-kb.
  // The persisted index lives under rag-system/storage (NOT dist/.../storage).
  const fromCwd = path.join(process.cwd(), 'rag-system', 'storage');
  return fromCwd;
}

const PERSIST_DIR = getPersistDir();

// Store the query engine in memory to avoid reloading on every query
let queryEngine: any;

async function getQueryEngine() {
  if (queryEngine) {
    return queryEngine;
  }

  console.log('Loading index from disk...');

  // 1. Load the storage context from disk
  const storageContext = await storageContextFromDefaults({
    persistDir: PERSIST_DIR,
  });

  // 2. Load the index from the storage context
  const index = await VectorStoreIndex.init({
    storageContext,
  });

  // 3. Create a query engine
  queryEngine = index.asQueryEngine({
    similarityTopK: 5, // Get top 5 most relevant chunks
  });

  console.log('Query engine is ready.');
  return queryEngine;
}

/**
 * Query the RAG system with a question.
 * 
 * @param question - The question to ask the RAG system
 * @returns The AI-generated answer based on the documentation
 */
export async function query(question: string): Promise<string> {
  const engine = await getQueryEngine();

  console.log(`Querying: ${question}`);
  const response = await engine.query({
    query: question,
  });

  return response.response;
}
