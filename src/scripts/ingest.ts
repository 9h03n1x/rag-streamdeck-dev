import fs from 'fs/promises';
import path from 'path';
import {
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
  Settings,
} from 'llamaindex';
import { gemini, GEMINI_MODEL, GeminiEmbedding, GEMINI_EMBEDDING_MODEL } from '@llamaindex/google';
import 'dotenv/config';

// --- Configure Gemini ---
// Set the LLM (for text generation/extraction)
Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Set the Embedding Model
Settings.embedModel = new GeminiEmbedding({
  apiKey: process.env.GOOGLE_API_KEY,
  model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
});
// ------------------------

// Define the local path for your persistent index
const PERSIST_DIR = './storage';

/**
 * Recursively read all markdown files from a directory
 */
async function readMarkdownFiles(dir: string): Promise<Document[]> {
  const documents: Document[] = [];
  
  async function readDir(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, and other system directories
        if (!['node_modules', '.git', 'dist', 'build', '.vscode'].includes(entry.name)) {
          await readDir(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        documents.push(
          new Document({
            text: content,
            id_: fullPath,
            metadata: { filePath: fullPath },
          })
        );
      }
    }
  }
  
  await readDir(dir);
  return documents;
}

async function main() {
  console.log('Starting unified ingestion...');

  // 1. Load your documents (from Docusaurus docs and markdown files)
  console.log('Loading documentation files from doc-site/docs...');
  const docsDocs = await readMarkdownFiles('./doc-site/docs');
  
  console.log('Loading markdown documentation from root...');
  const rootMarkdownFiles = await readMarkdownFiles('./');
  
  // Filter out docs from doc-site to avoid duplication
  const uniqueRootDocs = rootMarkdownFiles.filter(
    doc => !doc.id_.includes('doc-site' + path.sep)
  );
  
  const allDocs = [...docsDocs, ...uniqueRootDocs];
  console.log(`Loaded ${allDocs.length} documents total.`);

  // 2. Create a storage context with persistence
  console.log('Creating storage context...');
  const storageContext = await storageContextFromDefaults({
    persistDir: PERSIST_DIR,
  });

  // 3. Create the VectorStoreIndex
  console.log('Building Vector Store Index (this may take a while)...');
  const vectorIndex = await VectorStoreIndex.fromDocuments(
    allDocs,
    {
      storageContext: storageContext,
    }
  );

  console.log(
    `✅ Ingestion complete. Index saved to ${PERSIST_DIR}`
  );
}

main().catch(console.error);
