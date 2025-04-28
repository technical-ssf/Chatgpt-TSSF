const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const searchInput = document.getElementById('searchInput');

const apiKey = 'AIzaSyDoF35aIrp8tddASxhvNyfJvP9OJuQIoPg'; // তোমার API KEY

const customQAs = [
  {
    question: "What is your name?",
    answer: "I am ChatGPT, your assistant."
  },
  {
    question: "What can you do?",
    answer: "I can help with a wide range of tasks, from answering questions to providing recommendations."
  }
];

// পেজ লোড হলে আগের মেসেজ লোড হবে
window.onload = () => {
  const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  savedMessages.forEach(msg => {
    addMessage(msg.text, msg.type, false);
  });
};

// মেসেজ সেন্ড করার ফাংশন
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user', true);
  userInput.value = '';

  const botTyping = document.createElement('div');
  botTyping.className = 'message bot';
  botTyping.innerText = 'Typing...';
  chatBox.appendChild(botTyping);
  chatBox.scrollTop = chatBox.scrollHeight;

  // প্রথমে চেক করবো customQAs এর মধ্যে মেসেজ আছে কিনা
  const matchedQA = customQAs.find(qa => qa.question.toLowerCase() === message.toLowerCase());

  if (matchedQA) {
    botTyping.remove();
    typeText(matchedQA.answer, 'bot');
    return;
  }

  // API কল
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }]
      })
    });

    const data = await response.json();

    if (data && data.candidates && data.candidates.length > 0) {
      const botReply = data.candidates[0].content.parts[0].text;
      botTyping.remove();
      typeText(botReply, 'bot');
    } else {
      botTyping.innerText = 'Sorry, no reply received!';
    }
  } catch (error) {
    botTyping.innerText = 'Error connecting to server.';
    console.error(error);
  }
}

// টাইপিং ইফেক্ট সহ মেসেজ দেখানো
function typeText(text, type) {
  const element = document.createElement('div');
  element.className = `message ${type}`;
  chatBox.appendChild(element);
  let index = 0;

  function typing() {
    if (index < text.length) {
      element.innerText = text.slice(0, index + 1);
      index++;
      setTimeout(typing, 20);
      chatBox.scrollTop = chatBox.scrollHeight;
    } else {
      saveMessage(text, type);
    }
  }
  typing();
}

// নতুন মেসেজ DOM এ যোগ করা
function addMessage(text, type, save = false) {
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (save) saveMessage(text, type);
}

// মেসেজ localStorage এ সংরক্ষণ করা
function saveMessage(text, type) {
  const saved = JSON.parse(localStorage.getItem('chatMessages')) || [];
  saved.push({ text, type });
  localStorage.setItem('chatMessages', JSON.stringify(saved));
}

// Google সার্চ ফাংশন
function searchGoogle() {
  const query = searchInput.value.trim();
  if (query) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }
}

// ইভেন্ট লিসেনার
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
});
