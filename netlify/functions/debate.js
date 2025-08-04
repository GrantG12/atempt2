const axios = require('axios');

exports.handler = async (event, context) => {
  // 1. Parse frontend data
  const { prompt, botType, intensity } = JSON.parse(event.body);

  // 2. Securely use OpenAI key (set in Netlify's environment variables)
  const OPENAI_KEY = process.env.OPENAI_KEY;

  // 3. Define bot personalities (same as your frontend)
  const systemMessages = {
    devil: `You are a professional devil's advocate. Intensity level: ${intensity}/1.5. 
            Always take the opposite position, challenge assumptions, and point out flaws. 
            Use sarcasm and skepticism when appropriate. Keep responses under 100 words.`,
    optimist: `You are an enthusiastic optimist. Intensity level: ${intensity}/1.5. 
               Always find the positive angle, propose solutions, and maintain hope. 
               Use encouraging language and focus on opportunities. Keep responses under 100 words.`
  };

  try {
    // 4. Call OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessages[botType] },
          { role: "user", content: prompt }
        ],
        temperature: intensity * 0.8,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 5. Return the AI's reply
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: response.data.choices[0].message.content })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to call OpenAI" })
    };
  }
};