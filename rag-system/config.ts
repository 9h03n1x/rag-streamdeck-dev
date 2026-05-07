import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const RAG_ROOT = __dirname;
export const PROJECT_ROOT = path.resolve(RAG_ROOT, '..');
export const KNOWLEDGE_BASE_DIR = path.join(PROJECT_ROOT, 'knowledge-base');
export const DOC_SITE_DOCS_DIR = path.join(PROJECT_ROOT, 'doc-site', 'docs');
export const STORAGE_DIR = path.join(RAG_ROOT, 'storage');

export const NODE_PARSER_CONFIG = {
  chunkSize: 1200,
  chunkOverlap: 200,
};

export function deriveDocumentMetadata(absPath: string) {
  const normalized = path.normalize(absPath);
  const source = normalized.includes(path.normalize('doc-site')) ? 'doc-site' : 'knowledge-base';
  const baseDir = source === 'doc-site' ? DOC_SITE_DOCS_DIR : KNOWLEDGE_BASE_DIR;
  const relativePath = path.relative(baseDir, normalized).replace(/\\/g, '/');
  const segments = relativePath.split('/').filter(Boolean);

  return {
    source,
    relativePath,
    category: segments.length > 1 ? segments[0] : 'root',
    title: segments.at(-1)?.replace(/\.md$/i, '') ?? 'untitled',
  };
}
