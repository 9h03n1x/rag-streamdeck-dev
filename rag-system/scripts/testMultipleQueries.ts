import { query } from '../server/ragService.js';

const questions = [
  "How do I handle dial rotation events on Stream Deck+?",
  "What's the difference between action settings and global settings?",
  "How do I implement OAuth in my Stream Deck plugin?",
  "What are the best practices for debugging Stream Deck plugins?",
  "How do I create a property inspector with custom forms?"
];

async function testMultipleQueries() {
  console.log('='.repeat(80));
  console.log('🤖 RAG SYSTEM - MULTIPLE QUERY TEST');
  console.log('='.repeat(80));
  console.log();

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📝 QUESTION ${i + 1}/${questions.length}:`);
    console.log(`${question}`);
    console.log('─'.repeat(80));
    
    try {
      const { answer, sources } = await query(question);
      
      console.log('\n✅ ANSWER:');
      console.log(answer);

      if (sources.length) {
        console.log('\n📚 SOURCES:');
        sources.slice(0, 3).forEach((source, idx) => {
          console.log(`   ${idx + 1}. [${source.source}] ${source.title} (${source.relativePath})`);
          console.log(`      score: ${source.score.toFixed(3)}`);
        });
      }
      
    } catch (error) {
      console.error(`\n❌ ERROR: ${error}`);
    }
    
    // Add a small delay between queries
    if (i < questions.length - 1) {
  await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ ALL TESTS COMPLETE');
  console.log('='.repeat(80));
}

testMultipleQueries().catch(console.error);

