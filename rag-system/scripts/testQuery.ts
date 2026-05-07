import { query } from '../server/ragService.js';

async function test() {
  console.log('--- Starting RAG Query Test ---\n');
  
  // Use a question relevant to your Stream Deck documentation
  const question = "How do I create a basic Stream Deck plugin?";
  
  console.log(`Question: ${question}\n`);
  
  const { answer, sources } = await query(question);
  
  console.log('\n--- Final Answer ---');
  console.log(answer);

  if (sources.length) {
    console.log('\n--- Sources ---');
    sources.forEach((source, index) => {
      console.log(`${index + 1}. [${source.source}] ${source.title} (${source.relativePath})`);
      console.log(`   score: ${source.score.toFixed(3)} | snippet: ${source.snippet.slice(0, 140)}...`);
    });
  }

  console.log('\n--- Test Complete ---');
}

test().catch(console.error);
