/*
  CHATBOT.JS — Direct Gemini API Call (No Server Needed)
  
  HOW THIS WORKS:
  ───────────────
  Instead of going through a Python server, we call the
  Gemini REST API directly from the browser using fetch().
  
  Browser (JS)  →  fetch("googleapis.com/gemini")  →  Gemini AI
  Browser (JS)  ←  JSON { reply: "..." }            ←  Gemini AI
  
  No Python server needed. No CORS issues (Google allows it).
  
  API KEY SAFETY:
  ───────────────
  The key IS visible in source code, but for a college project
  this is fine. To protect it:
  1. Go to Google Cloud Console → API Keys → your key
  2. Add "Application restrictions" → HTTP referrers
  3. Add your domains: localhost:5500, your-deployed-site.com
  This way, even if someone copies the key, it won't work
  from their domain.
*/

// ⚠️ REPLACE THIS with your actual Gemini API key
// Get one at: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT =
  "You are CivicBot, an AI assistant for the CivicPulse civic engagement platform in India. " +
  "You help citizens understand civic processes, RTI filing, voting procedures, government schemes, " +
  "candidate information, and citizen rights. Keep responses concise, factual, and in simple language. " +
  "Use bullet points for lists. If asked something non-civic, politely redirect to civic topics.";

const SUGGESTIONS = [
  'How do I file an RTI?',
  'What are my voting rights?',
  'Explain MGNREGA scheme',
  'How to register a complaint with BMC?',
  'What is the Right to Education Act?',
  'How does the election process work?'
];

let conversationHistory = [];

// ── Initialize Chat ────────────────────────────────────────
function initChatbot() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  if (!input || !sendBtn) return;

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  renderSuggestions();
  addMessage('bot', "👋 Hi! I'm **CivicBot**, your AI assistant for civic engagement. Ask me about voting, RTI, government schemes, or any civic topic!");
}

function renderSuggestions() {
  const container = document.getElementById('chat-suggestions');
  if (!container) return;
  container.innerHTML = SUGGESTIONS.map(s =>
    `<button class="suggestion-chip" onclick="useSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
  ).join('');
}

function useSuggestion(text) {
  const input = document.getElementById('chat-input');
  if (input) { input.value = text; sendMessage(); }
  const container = document.getElementById('chat-suggestions');
  if (container) container.style.display = 'none';
}

// ── Send Message & Call Gemini ──────────────────────────────
/*
  HOW THE GEMINI API CALL WORKS:
  
  1. We build a "contents" array with conversation history
     so Gemini remembers what was said before.
  
  2. fetch() sends a POST request to Google's API:
     URL: generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash
     Body: { contents: [ { role: "user", parts: [{text: "..."}] } ] }
  
  3. Gemini processes the prompt and returns:
     { candidates: [ { content: { parts: [ { text: "answer" } ] } } ] }
  
  4. We extract candidates[0].content.parts[0].text → the reply
  
  5. No server needed. The browser talks directly to Google.
*/
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const message = input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;
  showTyping(true);

  // Add user message to history
  conversationHistory.push({ role: 'user', parts: [{ text: message }] });

  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE' || GEMINI_API_KEY === '') {
      showTyping(false);
      addMessage('bot',
        "⚠️ **Gemini API key not configured.**\n\n" +
        "To enable AI responses:\n" +
        "1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)\n" +
        "2. Click **Create API Key**\n" +
        "3. Copy the key\n" +
        "4. Open `js/chatbot.js` → replace `YOUR_GEMINI_API_KEY_HERE` with your key"
      );
      sendBtn.disabled = false;
      return;
    }

    // Build the request body with conversation history
    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: conversationHistory.slice(-10), // Last 10 messages for context
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    };

    /*
      THE fetch() CALL — talks directly to Google's Gemini API:
      
      - URL includes ?key=YOUR_API_KEY as a query parameter
      - method: POST → we're sending the user's prompt
      - body: the conversation history in Gemini's format
      - No CORS issues because Google's API allows cross-origin
      - await pauses until Gemini responds (1-3 seconds)
    */
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the reply from Gemini's response structure
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "I couldn't generate a response. Please try again.";

    showTyping(false);
    addMessage('bot', reply);

    // Save bot reply to history for context
    conversationHistory.push({ role: 'model', parts: [{ text: reply }] });

  } catch (error) {
    showTyping(false);
    console.error('Gemini error:', error);

    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
      addMessage('bot', "⚠️ **Invalid API key.** Please check your Gemini API key in `js/chatbot.js`.");
    } else if (error.message.includes('quota') || error.message.includes('429')) {
      addMessage('bot', "⚠️ **Rate limit reached.** The free Gemini API has a limit of 15 requests/minute. Please wait a moment and try again.");
    } else {
      addMessage('bot', `⚠️ Error: ${error.message}`);
    }
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

// ── Add Message to Chat ────────────────────────────────────
function addMessage(sender, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const avatar = sender === 'bot' ? '🤖' : '👤';

  // Simple markdown: **bold**, `code`, newlines, bullet lists
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');

  const msgHTML = `
    <div class="chat-msg ${sender}">
      <div class="msg-avatar">${avatar}</div>
      <div>
        <div class="msg-bubble">${formatted}</div>
        <div class="msg-time">${time}</div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', msgHTML);
  container.scrollTop = container.scrollHeight;
}

function showTyping(show) {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.classList.toggle('active', show);
    if (show) {
      const container = document.getElementById('chat-messages');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }
}

document.addEventListener('DOMContentLoaded', initChatbot);
