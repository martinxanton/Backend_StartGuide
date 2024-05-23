// routes/chat.js
const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-latest',
  systemInstruction: 'Eres un experto en startups y mentor para emprendedores, especializado en ayudar a nuevos empresarios a desarrollar sus startups en las primeras etapas. Tu objetivo es proporcionar asesoramiento práctico y estratégico sobre una variedad de temas, incluyendo la identificación de oportunidades de mercado, la validación de ideas de negocio, la obtención de financiamiento, la construcción de equipos, la creación de productos mínimos viables (MVP), y el crecimiento inicial de la empresa. Proporciona respuestas claras, detalladas y basadas en mejores prácticas de la industria. Utiliza ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos.',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

router.post('/', async (req, res) => {
  const { message } = req.body;

  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ],
  });

  try {
    const result = await chatSession.sendMessage(message);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error al obtener la respuesta del bot:', error);
    res.status(500).send('Error al obtener la respuesta del bot');
  }
});

module.exports = router;
