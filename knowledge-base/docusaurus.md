# Project Plan: Docusaurus Docs & Unified Graph RAG

This document outlines the complete plan to build a "state-of-the-art" documentation site and a an advanced Graph RAG (Retrieval-Augmented Generation) system for this project.

The plan is divided into three parts:
1.  **Documentation Site:** Using **Docusaurus** to create a modern, searchable site that automatically generates API documentation from your TypeScript code.
2.  **Graph RAG System:** Using **LlamaIndex.ts** and **Gemini** to build a RAG pipeline that understands the *relationships* in your code (as a graph) and your "how-to" guides simultaneously.
3.  **Running the Project:** Commands to build, run, and test both systems.

---

## Part 1: Documentation Site (Docusaurus)

This part creates a `doc-site` folder inside your project. This site will host all your guides and auto-generated API docs.

### 1.1: Create the Docusaurus Site

In your project's root directory, run this command to create the site in a new `doc-site` folder:

```bash
npx create-docusaurus@latest doc-site classic --typescript
```

### 1.2: Add Your `README.md` as the Intro Page

1.  Copy the contents of your main `README.md` file from the project root.
2.  Open `doc-site/docs/intro.md`.
3.  Delete the placeholder content and paste your `README.md` content.
4.  Add this "front matter" to the very top of the `doc-site/docs/intro.md` file:
    ```yaml
    ---
    sidebar_label: 'Introduction'
    ---
    ```

### 1.3: Add Auto-Generated API Docs (from `src/`)

This step will configure the documentation site to automatically read your TypeScript code and comments (TSDoc) from the `src/` folder and generate an API reference.

1.  **Navigate into the `doc-site` directory:**
    ```bash
    cd doc-site
    ```
2.  **Install the TypeDoc plugin:**
    ```bash
    npm install --save docusaurus-plugin-typedoc
    ```
3.  **Configure the plugin:**
    Open `doc-site/docusaurus.config.ts` and add the `docusaurus-plugin-typedoc` to the `plugins` array. We must point it *up* to the root `src` and `tsconfig.json` files.

    **MODIFY FILE: `doc-site/docusaurus.config.ts`**
    ```ts
    import {Config} from '@docusaurus/types';
    import {themes as prismThemes} from 'prism-react-renderer';
    import path from 'path'; // Make sure 'path' is imported

    const config: Config = {
      // ... (other config settings) ...
      
      plugins: [
        [
          'docusaurus-plugin-typedoc',
          {
            // TypeDoc options
            entryPoints: ['../src'], // Point to your project's 'src'
            tsconfig: '../tsconfig.json', // Point to your project's 'tsconfig.json'
            
            // Docusaurus plugin options
            out: 'api', // Output directory for generated docs (inside 'doc-site/docs')
            sidebar: {
              categoryLabel: 'API Reference',
              position: 5,
            },
          },
        ],
      ], // <--- Add this comma if 'plugins' was the last item

      // ... (themeConfig, etc.)
    };

    export default config;
    ```
4.  **Go back to the project root:**
    ```bash
    cd ..
    ```

---

## Part 2: Unified Graph RAG (LlamaIndex.ts & Gemini)

This part implements the RAG system in your main project (`src/`). It uses LlamaIndex.ts to create a *single* vector index that contains both your documentation text and the graph relationships extracted from it.

### 2.1: Environment Setup

1.  **Install Dependencies:**
    Run this from your **project root** (NOT the `doc-site` folder):
    ```bash
    npm install llamaindex @llamaindex/gemini dotenv ts-node @types/node
    ```

2.  **Configure Environment Variables:**
    Ensure the file `.env` exists at the project root. It must contain your Gemini API key.

    **CREATE/VERIFY FILE: `.env`**
    ```.env
    # Google AI Studio Gemini API Key
    GEMINI_API_KEY="your-gemini-api-key-here"
    ```

### 2.2: Unified Ingestion Script

This script will:
* Read all documents from `doc-site/docs` and `src/`.
* Use Gemini to extract graph relationships (e.g., `[Node1]-[:USES]->[Node2]`).
* Use Gemini to create embeddings for *both* text chunks and graph chunks.
* Save everything into a single, local vector store in a `./storage` folder.

**CREATE FILE: `src/scripts/ingest.ts`**
```typescript
import {
  SimpleDirectoryReader,
  KnowledgeGraphIndex,
  VectorStoreIndex,
  SimpleVectorStore,
  StorageContext,
  Settings,
} from 'llamaindex';
import { Gemini } from '@llamaindex/gemini';
import 'dotenv/config';

// --- Configure Gemini ---
// Set the LLM (for text generation/extraction)
Settings.llm = new Gemini({
  apiKey: process.env.GEMINI_API_KEY,
});
// Set the Embedding Model
Settings.embedModel = new Gemini({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'models/embedding-001', // Explicitly use the embedding model
});
// ------------------------

// Define the local path for your persistent index
const PERSIST_DIR = './storage';

async function main() {
  console.log('Starting unified ingestion...');

  // 1. Load your documents (from Docusaurus and src)
  const docReader = new SimpleDirectoryReader();
  const docs = await docReader.loadData('./doc-site/docs');
  const codeDocs = await docReader.loadData('./src');
  const allDocs = [...docs, ...codeDocs];
  console.log(`Loaded ${allDocs.length} documents.`);

  // 2. Create a local vector store
  const vectorStore = new SimpleVectorStore();

  // 3. Create a storage context that uses the vector store
  const storageContext = await StorageContext.fromDefaults({
    vectorStore,
  });

  // 4. Create the KnowledgeGraphIndex
  console.log('Building Knowledge Graph Index (this will take a while)...');
  
  const graphIndex = await KnowledgeGraphIndex.fromDocuments(
    allDocs,
    {
      storageContext: storageContext,
      includeVectorStore: true, 
    }
  );

  // 5. Create the main VectorStoreIndex
  console.log('Building Vector Store Index...');
  const vectorIndex = await VectorStoreIndex.fromDocuments(
    allDocs,
    {
      storageContext: storageContext,
    }
  );

  // 6. Persist everything to disk
  await vectorStore.persist(PERSIST_DIR);

  console.log(
    `Ingestion complete. Unified index saved to ${PERSIST_DIR}`
  );
}

main().catch(console.error);
```

### 2.3: `package.json` Ingestion Script

Modify your **root** `package.json` file to add a script for running the ingestion.

**MODIFY FILE: `package.json`**
```json
"scripts": {
  // ... your other scripts
  "ingest": "npx ts-node src/scripts/ingest.ts"
},
```

### 2.4: RAG Query Service

This service loads the index from disk and provides a simple `query` function.

**CREATE FILE: `src/server/ragService.ts`**
```typescript
import {
  VectorStoreIndex,
  SimpleVectorStore,
  ContextChatEngine,
  Settings,
} from 'llamaindex';
import { Gemini } from '@llamaindex/gemini';
import 'dotenv/config';

// --- Configure Gemini ---
Settings.llm = new Gemini({
  apiKey: process.env.GEMINI_API_KEY,
});
Settings.embedModel = new Gemini({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'models/embedding-001',
});
// ------------------------

const PERSIST_DIR = './storage';

// Store the engine in memory to avoid reloading on every query
let chatEngine: ContextChatEngine;

async function getChatEngine() {
  if (chatEngine) {
    return chatEngine;
  }

  console.log('Loading unified index from disk...');

  // 1. Load the local vector store
  const vectorStore = new SimpleVectorStore();
  await vectorStore.load(PERSIST_DIR);

  // 2. Load the index from the vector store
  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  // 3. Create a retriever
  const retriever = index.asRetriever();
  retriever.similarityTopK = 5; // Get top 5 most relevant chunks

  // 4. Create a chat engine
  chatEngine = new ContextChatEngine({
    retriever,
    systemPrompt: `You are an expert AI assistant for the 'rag-streamdeck-dev' project.
      Answer the user's question based *only* on the provided context.
      The context may include both plain text and graph data (triplets like [node1, relationship, node2]).
      Use both types of context to form a complete and accurate answer.`,
  });

  console.log('Chat engine is ready.');
  return chatEngine;
}

// 5. Expose a simple query function
export async function query(question: string) {
  const engine = await getChatEngine();

  console.log(`Querying: ${question}`);
  const response = await engine.chat(question);

  return response.response;
}
```

---

## Part 3: Running the Project

### 3.1: Run the Documentation Site

This command will start your Docusaurus site. The TypeDoc plugin will run first, generating the API docs.

```bash
cd doc-site
npm run start
```
> Your site will be available at `http://localhost:3000`.
> The API docs will be at `http://localhost:3000/docs/api`.

### 3.2: Run the RAG Ingestion

Run this command from the **project root** (not the `doc-site` folder). You only need to do this once, or after you make significant changes to your code or docs.

```bash
npm run ingest
```
> This will create a `./storage` directory containing your unified index.

### 3.3: Test the RAG Query Service

To verify the RAG system is working, create a test script.

**CREATE FILE: `src/scripts/testQuery.ts`**
```typescript
import { query } from '../server/ragService';

async function test() {
  console.log('--- Starting RAG Query Test ---');
  
  // Use a question relevant to your repo
  const question = "How does the StreamDeck plugin connect to the OpenAI API?";
  
  const answer = await query(question);
  
  console.log('\n--- Final Answer ---');
  console.log(answer);
}

test().catch(console.error);
```

**Add a `package.json` script to run this test:**

**MODIFY FILE: `package.json`**
```json
"scripts": {
  "ingest": "npx ts-node src/scripts/ingest.ts",
  "test:query": "npx ts-node src/scripts/testQuery.ts" // Add this line
},
```

**Now, run the test:**

```bash
npm run test:query
```
> This will load your index and print an AI-generated answer to your console.