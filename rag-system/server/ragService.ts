import {
  VectorStoreIndex,
  storageContextFromDefaults,
  Settings,
  SimpleNodeParser,
  MetadataMode,
  NodeWithScore,
} from 'llamaindex';
import { gemini, GEMINI_MODEL, GeminiEmbedding, GEMINI_EMBEDDING_MODEL } from '@llamaindex/google';
import 'dotenv/config';
import {
  STORAGE_DIR,
  NODE_PARSER_CONFIG,
} from '../config.js';

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

// Ensure node parsing matches ingestion chunking settings
Settings.nodeParser = new SimpleNodeParser(NODE_PARSER_CONFIG);

const PERSIST_DIR = STORAGE_DIR;

export interface QuerySource {
  title: string;
  relativePath: string;
  source: string;
  score: number;
  snippet: string;
}

export interface QueryResponse {
  answer: string;
  sources: QuerySource[];
}

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
export async function query(question: string): Promise<QueryResponse> {
  const engine = await getQueryEngine();

  console.log(`Querying: ${question}`);
  const response = await engine.query({
    query: question,
  });

  const sources: QuerySource[] = (response.sourceNodes ?? []).map((node: NodeWithScore) => {
    const metadata = node.node.metadata ?? {};
    return {
      title: metadata.title ?? metadata.relativePath ?? 'Unknown source',
      relativePath: metadata.relativePath ?? metadata.filePath ?? 'unknown',
      source: metadata.source ?? 'unknown',
      score: node.score ?? 0,
      snippet: node.node.getContent?.(MetadataMode.NONE)?.slice(0, 400) ?? '',
    };
  });

  return {
    answer: response.response,
    sources,
  };
}
