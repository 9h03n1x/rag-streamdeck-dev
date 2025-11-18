#!/usr/bin/env node

/**
 * MCP Server for Stream Deck Plugin Development RAG System
 * 
 * This server exposes the RAG system as an MCP tool that can be used by
 * any MCP-compatible LLM client (Claude Desktop, Cline, etc.)
 * 
 * Usage:
 *   node rag-system/server/mcpServer.js
 * 
 * Or add to your MCP client configuration:
 *   {
 *     "mcpServers": {
 *       "streamdeck-docs": {
 *         "command": "node",
 *         "args": ["path/to/rag-streamdeck-dev/rag-system/server/mcpServer.js"]
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { query } from './ragService.js';

// Define the RAG query tool
const QUERY_TOOL: Tool = {
  name: 'query_streamdeck_docs',
  description: 
    'Query the comprehensive Stream Deck plugin development documentation. ' +
    'This tool uses a RAG (Retrieval-Augmented Generation) system powered by Google Gemini ' +
    'to search through 98 documentation files covering the Stream Deck SDK v2, including: ' +
    '- Getting started guides and environment setup ' +
    '- Core concepts (actions, settings, communication protocol) ' +
    '- Development workflow (build, deploy, debug, test) ' +
    '- UI components and property inspectors ' +
    '- Code templates and common patterns ' +
    '- Security and compliance ' +
    '- Advanced topics (OAuth, Stream Deck+, performance) ' +
    '- API reference and CLI commands ' +
    '- Real-world examples and troubleshooting. ' +
    'Use this tool whenever you need information about Stream Deck plugin development.',
  inputSchema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 
          'The question to ask about Stream Deck plugin development. ' +
          'Examples: "How do I create a basic plugin?", "What\'s the difference between action and global settings?", ' +
          '"How do I handle dial rotation on Stream Deck+?", "How do I implement OAuth?"',
      },
    },
    required: ['question'],
  },
};

// Create the MCP server
const server = new Server(
  {
    name: 'streamdeck-docs-rag',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [QUERY_TOOL],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'query_streamdeck_docs') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const question = request.params.arguments?.question;
  
  if (!question || typeof question !== 'string') {
    throw new Error('Missing or invalid "question" argument');
  }

  try {
    // Query the RAG system
    const answer = await query(question);

    return {
      content: [
        {
          type: 'text',
          text: answer,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`RAG query failed: ${errorMessage}`);
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr (stdout is used for MCP protocol)
    console.error('Stream Deck Documentation RAG MCP Server running');
    console.error('Ready to answer questions about Stream Deck plugin development');
  } catch (error) {
    console.error('Error starting MCP server:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error('Fatal error in main:', error);
  process.exit(1);
});

