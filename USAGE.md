# Using This RAG Repository

## For Vector Databases

### Recommended Chunking Strategy

```python
def chunk_by_section(markdown_file):
    """
    Chunk markdown files by headers for optimal retrieval.
    """
    with open(markdown_file) as f:
        content = f.read()
    
    # Split by ## headers
    sections = re.split(r'\n##\s+', content)
    
    chunks = []
    for section in sections:
        if section.strip():
            # Include header in chunk
            chunks.append('## ' + section)
    
    return chunks
```

### Embedding Considerations

- **Chunk Size**: 500-1000 tokens per chunk
- **Overlap**: 50-100 tokens between chunks
- **Metadata**: Include file path, section header, and category

### Example Metadata

```json
{
  "file_path": "core-concepts/action-development.md",
  "section": "Event Handlers",
  "category": "core-concepts",
  "keywords": ["event", "handler", "action", "lifecycle"],
  "sdk_version": "2.0",
  "language": "typescript"
}
```

## For LLM Context

### Context Assembly

When assembling context for LLM queries:

1. **Relevant Sections**: Retrieve 3-5 most relevant sections
2. **Code Examples**: Include related code templates
3. **API Reference**: Add specific API documentation
4. **Best Practices**: Include security and best practices

### Example Query Flow

```
User Query: "How do I create an action that increments a counter?"

1. Retrieve from RAG:
   - core-concepts/action-development.md (action basics)
   - code-templates/action-templates.md (counter example)
   - examples/basic-counter-plugin.md (full example)
   - core-concepts/settings-persistence.md (storing count)

2. Assemble Context:
   [Retrieved sections...]

3. Generate Response:
   LLM generates code based on retrieved documentation
```

## For Code Generation

### Template Selection

Use these templates for different scenarios:

- **Simple Action**: `code-templates/action-templates.md` → Basic Counter
- **API Integration**: `code-templates/action-templates.md` → API Action
- **Toggle/State**: `code-templates/action-templates.md` → Toggle Action
- **Dial Control**: `code-templates/action-templates.md` → Dial Action

### Code Synthesis Pattern

```
1. Retrieve relevant template
2. Extract user requirements
3. Customize template with requirements
4. Add error handling
5. Include type definitions
6. Generate manifest entry
7. Create property inspector (if needed)
```

## Search Queries

### Common Query Patterns

**Architecture Questions**:
- "How do Stream Deck plugins communicate?"
- "What is the plugin lifecycle?"
- "How does WebSocket work in plugins?"

**Development Questions**:
- "How to create an action?"
- "How to persist settings?"
- "How to update action display?"

**UI Questions**:
- "How to create property inspector?"
- "What form components are available?"
- "How to validate user input?"

**Security Questions**:
- "How to store credentials securely?"
- "Best practices for API keys?"
- "How to implement OAuth?"

## Integration Examples

### Python RAG System

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import DirectoryLoader

# Load documentation
loader = DirectoryLoader(
    'rag-streamdeck-dev',
    glob="**/*.md",
    loader_cls=TextLoader
)
documents = loader.load()

# Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents,
    embeddings,
    collection_name="streamdeck-docs"
)

# Query
query = "How to create a counter action?"
docs = vectorstore.similarity_search(query, k=3)
```

### TypeScript RAG System

```typescript
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

// Load documentation
const loader = new DirectoryLoader(
  "rag-streamdeck-dev",
  {
    ".md": (path) => new TextLoader(path),
  }
);

const docs = await loader.load();

// Create vector store
const vectorStore = await HNSWLib.fromDocuments(
  docs,
  new OpenAIEmbeddings()
);

// Query
const results = await vectorStore.similaritySearch(
  "How to implement settings persistence?",
  3
);
```

## Best Practices

1. **Semantic Chunking**: Split by logical sections, not arbitrary lengths
2. **Rich Metadata**: Include comprehensive metadata for better retrieval
3. **Context Window**: Balance between detail and context window limits
4. **Code Examples**: Always include code examples in context
5. **Version Tracking**: Track SDK version in metadata
6. **Update Frequency**: Refresh embeddings when docs update
7. **Query Expansion**: Expand user queries with synonyms
8. **Hybrid Search**: Combine semantic and keyword search

## Performance Optimization

- **Caching**: Cache frequently retrieved sections
- **Lazy Loading**: Load only required documentation
- **Index Optimization**: Optimize vector database indices
- **Batch Processing**: Process multiple queries in batches
- **Compression**: Compress stored vectors if needed

## Quality Assurance

- **Relevance Testing**: Test retrieval quality regularly
- **Response Validation**: Validate generated code
- **User Feedback**: Collect feedback on response quality
- **Continuous Improvement**: Update docs based on feedback
