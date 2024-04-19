// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Hi"}],
      },
      {
        role: "model",
        parts: [{ text: "Hello there! How can I assist you today?"}],
      },
      {
        role: "user",
        parts: [{ text: "2+3"}],
      },
      {
        role: "model",
        parts: [{ text: "2 + 3 = 5"}],
      },
      {
        role:"user",
        parts: [{text: "story"}],
      },
      {
        role: "model",
        parts: [{text: "Once upon a time..."}],
      },
      {
        role:"user",
        parts: [{text: "code in python"}],
      },
      {
        role: "model",
        parts: [{text: "print('Hello, world!')\n"}],
      },
      {
        role:"user",
        parts: [{text: "who are you"}],
      },
      {
        role: "model",
        parts: [{text: "I am TechXpert! Ready to help you anytime buddy."}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  let response = result.response.text();

  // Check if the user input contains a request to print code
  if (userInput.toLowerCase().includes('code') && response) {
    // Format the code with proper indentation and coloring
    response = `<pre style="color: #ffffff; background-color: #242424; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${response}</pre>`;
  }

  return response;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
