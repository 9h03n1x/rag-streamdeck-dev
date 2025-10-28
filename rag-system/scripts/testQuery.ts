import { query } from '../server/ragService.js';

async function test() {
  console.log('--- Starting RAG Query Test ---\n');
  
  // Use a question relevant to your Stream Deck documentation
  const question = "How do I create a basic Stream Deck plugin?";
  
  console.log(`Question: ${question}\n`);
  
  const answer = await query(question);
  
  console.log('\n--- Final Answer ---');
  console.log(answer);
  console.log('\n--- Test Complete ---');
}

test().catch(console.error);
