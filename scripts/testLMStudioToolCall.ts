/**
 * Test LM Studio Tool Calling
 *
 * Simple test to verify tool calling format with Qwen3-32b
 */

async function testToolCall() {
  const requestBody = {
    model: 'qwen/qwen3-32b',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. When asked to set weights, use the set_weights function.'
      },
      {
        role: 'user',
        content: 'Set these action weights: research=30, safety=25, cooperation=20, economic=15, advocacy=10'
      }
    ],
    temperature: 0.3,
    max_tokens: 500,
    tools: [
      {
        type: 'function',
        function: {
          name: 'set_weights',
          description: 'Set action weights (must sum to 100)',
          parameters: {
            type: 'object',
            properties: {
              research: { type: 'number', minimum: 0, maximum: 100 },
              safety: { type: 'number', minimum: 0, maximum: 100 },
              cooperation: { type: 'number', minimum: 0, maximum: 100 },
              economic: { type: 'number', minimum: 0, maximum: 100 },
              advocacy: { type: 'number', minimum: 0, maximum: 100 }
            },
            required: ['research', 'safety', 'cooperation', 'economic', 'advocacy']
          }
        }
      }
    ],
    tool_choice: 'required'
  };

  console.log('\n🔧 Testing LM Studio Tool Calling');
  console.log('='.repeat(80));
  console.log('\n📤 REQUEST:');
  console.log(JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ API ERROR (${response.status}):`);
      console.error(errorText);
      return;
    }

    const data = await response.json();

    console.log('\n📥 RESPONSE:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n🔍 ANALYSIS:');
    const choice = data.choices?.[0];
    console.log(`  Choices: ${data.choices?.length || 0}`);
    console.log(`  Finish Reason: ${choice?.finish_reason}`);
    console.log(`  Has tool_calls: ${!!choice?.message?.tool_calls}`);
    console.log(`  Has content: ${!!choice?.message?.content}`);

    if (choice?.message?.tool_calls) {
      console.log(`\n✅ TOOL CALLS FOUND:`);
      choice.message.tool_calls.forEach((tc: any, i: number) => {
        console.log(`  [${i}] ${tc.function?.name}`);
        console.log(`      Args: ${tc.function?.arguments}`);
      });
    } else if (choice?.message?.content) {
      console.log(`\n❌ NO TOOL CALLS - Got text response instead:`);
      console.log(`  "${choice.message.content.substring(0, 200)}..."`);
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ EXCEPTION:', error);
  }
}

testToolCall().catch(console.error);
