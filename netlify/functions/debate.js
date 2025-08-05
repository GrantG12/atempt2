const axios = require('axios');

exports.handler = async (event, context) => {
    // Enhanced CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // Parse body
    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (err) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    // Validate required fields
    if (!payload.prompt || !payload.botType) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Process request
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: `You are a ${payload.botType}. ${payload.prompt}`
                }],
                temperature: Math.min(1.0, Math.max(0, payload.intensity * 0.8)),
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                reply: response.data.choices[0].message.content 
            })
        };
    } catch (error) {
        console.error('OpenAI Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'AI service unavailable',
                details: error.message 
            })
        };
    }
};