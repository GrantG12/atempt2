document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const topicInput = document.getElementById('topic-input');
    const startDebateBtn = document.getElementById('start-debate');
    const devilIntensity = document.getElementById('devil-intensity');
    const optimistIntensity = document.getElementById('optimist-intensity');
    const devilChatBox = document.querySelector('#devils-advocate .chat-box');
    const optimistChatBox = document.querySelector('#optimist .chat-box');

    // Track debate state
    let debateActive = false;
    let debateRounds = 0;
    const maxRounds = 3; // Set maximum debate rounds

    // Event listeners
    startDebateBtn.addEventListener('click', startDebate);
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startDebate();
    });

    async function startDebate() {
        if (debateActive) return; // Prevent multiple debates
        
        const topic = topicInput.value.trim();
        if (!topic) return;

        // Reset debate state
        debateActive = true;
        debateRounds = 0;
        startDebateBtn.disabled = true;
        
        // Clear previous debate
        devilChatBox.innerHTML = '';
        optimistChatBox.innerHTML = '';

        try {
            // Add loading indicators
            addMessage(devilChatBox, "Thinking...", true);
            addMessage(optimistChatBox, "Thinking...", true);

            // Get initial responses
            const [devilResponse, optimistResponse] = await Promise.all([
                getAIResponse(topic, 'devil', devilIntensity.value),
                getAIResponse(topic, 'optimist', optimistIntensity.value)
            ]);

            // Display responses
            devilChatBox.innerHTML = '';
            optimistChatBox.innerHTML = '';
            addMessage(devilChatBox, devilResponse);
            addMessage(optimistChatBox, optimistResponse);

            // Continue the debate
            debateRounds++;
            if (debateRounds < maxRounds) {
                setTimeout(() => continueDebate(topic, devilResponse, optimistResponse), 1500);
            } else {
                endDebate();
            }
        } catch (error) {
            console.error("Error in debate:", error);
            addMessage(devilChatBox, "Error generating response. Debate ended.");
            addMessage(optimistChatBox, "Error generating response. Debate ended.");
            endDebate();
        }
    }

    async function continueDebate(topic, devilLast, optimistLast) {
        if (!debateActive) return;
        
        try {
            // Devil's Advocate responds to Optimist
            addMessage(devilChatBox, "Thinking...", true);
            const devilResponse = await getAIResponse(
                `Topic: ${topic}\n\nOptimist said: "${optimistLast}"\n\nRespond as Devil's Advocate:`,
                'devil',
                devilIntensity.value
            );
            devilChatBox.lastChild.remove();
            addMessage(devilChatBox, devilResponse);

            // Optimist responds to Devil's Advocate
            addMessage(optimistChatBox, "Thinking...", true);
            const optimistResponse = await getAIResponse(
                `Topic: ${topic}\n\nDevil's Advocate said: "${devilResponse}"\n\nRespond as Optimist:`,
                'optimist',
                optimistIntensity.value
            );
            optimistChatBox.lastChild.remove();
            addMessage(optimistChatBox, optimistResponse);

            // Continue for limited rounds
            debateRounds++;
            if (debateRounds < maxRounds) {
                setTimeout(() => continueDebate(topic, devilResponse, optimistResponse), 1500);
            } else {
                endDebate();
            }
        } catch (error) {
            console.error("Error continuing debate:", error);
            addMessage(devilChatBox, "Error generating response. Debate ended.");
            addMessage(optimistChatBox, "Error generating response. Debate ended.");
            endDebate();
        }
    }

    function endDebate() {
        debateActive = false;
        startDebateBtn.disabled = false;
        addMessage(devilChatBox, "Debate concluded.");
        addMessage(optimistChatBox, "Debate concluded.");
    }

    async function getAIResponse(prompt, botType, intensity) {
  try {
    // Call your Netlify Function
    const response = await fetch('/.netlify/functions/debate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, botType, intensity })
    });

    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    
    const data = await response.json();
    return data.reply; // The AI's response from your backend

  } catch (error) {
    console.error(`Error getting ${botType} response:`, error);
    throw error;
  }
}

    function addMessage(chatBox, message, isThinking = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (isThinking) messageElement.classList.add('thinking');
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});