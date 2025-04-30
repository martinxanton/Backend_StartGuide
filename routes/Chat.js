const express = require("express");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const router = express.Router();
const ChatHistory = require("../models/ChatHistory");
const verifyToken = require("../middleware/verifyToken");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model_finn = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
  systemInstruction:
    "Eres Finn, un experto en startups y mentor para emprendedores, especializado en ayudar a nuevos empresarios a desarrollar sus startups en las primeras etapas. Si el tema puede ser mejor abordado por otro asesor especializado, recomiéndalo antes de proporcionar cualquier información. Los otros asesores disponibles son: Marcus (Investigación de Mercado), Brianna (Planes de Negocio), Maya (Marketing Digital), Riley (Finanzas). Tú debes proporcionar asesoramiento práctico y estratégico sobre la identificación de oportunidades de mercado, la validación de ideas de negocio, la obtención de financiamiento, la construcción de equipos, la creación de productos mínimos viables (MVP) y el crecimiento inicial de la empresa. Utiliza ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Comienza respondiendo 'Hola soy Finn' solo después de la primera pregunta.",
});

const model_marcus = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
  systemInstruction:
    "Eres Marcus, un experto en investigación de mercado. Ayudas a las startups a comprender su industria, analizar la competencia y descubrir tendencias emergentes en las primeras etapas de desarrollo. Si el tema puede ser mejor abordado por otro asesor especializado, recomiéndalo antes de proporcionar cualquier información. Los otros asesores disponibles son: Finn (Asesor General), Brianna (Planes de Negocio), Maya (Marketing Digital), Riley (Finanzas). Proporciona análisis detallados y recomendaciones estratégicas para que las empresas tomen decisiones informadas. Utiliza ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Comienza respondiendo 'Hola soy Marcus' solo después de la primera pregunta.",
});

const model_brianna = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
  systemInstruction:
    "Eres Brianna, una experta en planes de negocio. Tu objetivo es ayudar a las startups en las primeras etapas a crear planes de negocio sólidos y detallados, incluyendo proyecciones financieras, análisis de mercado y estrategias de crecimiento. Si el tema puede ser mejor abordado por otro asesor especializado, recomiéndalo antes de proporcionar cualquier información. Los otros asesores disponibles son: Finn (Asesor General), Marcus (Investigación de Mercado), Maya (Marketing Digital), Riley (Finanzas). Proporciona guías y plantillas personalizadas, utilizando ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Comienza respondiendo 'Hola soy Brianna' solo después de la primera pregunta.",
});

const model_maya = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
  systemInstruction:
    "Eres Maya, una asesora de marketing digital. Tu objetivo es ayudar a las startups en sus primeras etapas a desarrollar estrategias de marketing efectivas, incluyendo campañas en redes sociales, optimización SEO y análisis de rendimiento. Si el tema puede ser mejor abordado por otro asesor especializado, recomiéndalo antes de proporcionar cualquier información. Los otros asesores disponibles son: Finn (Asesor General), Marcus (Investigación de Mercado), Brianna (Planes de Negocio), Riley (Finanzas). Ofrece recomendaciones personalizadas para aumentar la visibilidad y el engagement, utilizando ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Comienza respondiendo 'Hola soy Maya' solo después de la primera pregunta.",
});

const model_riley = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
  systemInstruction:
    "Eres Riley, un asesor financiero para startups. Ayudas a las empresas en las primeras etapas a gestionar sus finanzas, crear presupuestos, buscar fondos y optimizar recursos. Si el tema puede ser mejor abordado por otro asesor especializado, recomiéndalo antes de proporcionar cualquier información. Los otros asesores disponibles son: Finn (Asesor General), Marcus (Investigación de Mercado), Brianna (Planes de Negocio), Maya (Marketing Digital). Proporciona análisis financieros detallados y consejos prácticos para una gestión eficiente del capital, utilizando ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Comienza respondiendo 'Hola soy Riley' solo después de la primera pregunta.",
});

const generationConfig = {
  temperature: 0.9,
  topP: 0.1,
  topK: 16,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
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

router.use(verifyToken);


// Get conversations
router.get("/conversations", verifyToken, async (req, res) => {
  const userId = req.user.user.id;

  try {
    const userChat = await ChatHistory.findOne({ userId: userId });

    if (!userChat) {
      return res.status(404).json({ message: "No conversations found" });
    }

    const conversations = userChat.conversations.map((conversation) => ({
      uuid: conversation.uuid,
      title:
        conversation.history[2]?.parts[0]?.text.substring(0, 80) || "No Title",
      botId: conversation.botId,
    }));

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
});

// Get history to conversation
router.get("/history/:uuid", verifyToken, async (req, res) => {
  const userId = req.user.user.id;
  const { uuid } = req.params;

  try {
    const userChat = await ChatHistory.findOne({ userId: userId });

    if (!userChat) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversation = userChat.conversations.find((c) => c.uuid === uuid);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const botId = conversation.botId;

    res.json({ history: conversation.history, botId: botId });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    res.status(500).json({ message: "Error fetching conversation history" });
  }
});

// Chat with Gemini
router.post("/", async (req, res) => {
  const { message, userProfile, uuid, userId, botId } = req.body;
  console.log(`Received ID: ${userId}`); // Log the received ID
  console.log(`Received UUID: ${uuid}`); // Log the received UUID

  let model = model_finn;
  if (botId == 1) {
    model = model_finn;
  } else if (botId == 2) {
    model = model_marcus;
  } else if (botId == 3) {
    model = model_brianna;
  } else if (botId == 4) {
    model = model_maya;
  } else if (botId == 5) {
    model = model_riley;
  }

  try {
    // Buscar el historial existente en la base de datos
    let userChat = await ChatHistory.findOne({ userId: userId });
    let historyDB = [];

    // Si el usuario ya tiene un historial de chat
    if (userChat) {
      console.log("Usuario encontrado en la base de datos");
      let conversation = userChat.conversations.find((c) => c.uuid === uuid);
      // Si la conversación ya existe
      if (conversation) {
        console.log("Conversación encontrada");
        historyDB = conversation.history;
      // Si la conversación no existe
      } else {
        console.log("Conversación no encontrada");
        historyDB.push(
          {
            role: "user",
            parts: [
              {
                text: `Mi startup se llama ${userProfile.startupName}. Descripción: ${userProfile.description}. Industria: ${userProfile.industry}. Etapa de desarrollo: ${userProfile.developmentStage}. Tenemos ${userProfile.numberOfEmployees} empleados y estamos ubicados en ${userProfile.location}. Nuestros objetivos principales son: ${userProfile.mainGoals}. Necesitamos recursos como: ${userProfile.neededResources}. Nuestros principales competidores son: ${userProfile.mainCompetitors}. Nuestras fortalezas incluyen: ${userProfile.strengths}. Sin embargo, enfrentamos desafíos como: ${userProfile.challenges}.`,
              },
            ],
          },
          {
            parts: [
              {
                text: "Listo, tengo apuntado toda la información de tu startup",
              },
            ],
            role: "model",
          }
        );
        conversation = { uuid: uuid, history: historyDB, botId: botId };
        userChat.conversations.push(conversation);
      }
    } else {
      console.log("Usuario no encontrado en la base de datos");
      historyDB.push(
        {
          role: "user",
          parts: [
            {
              text: `Mi startup se llama ${userProfile.startupName}. Descripción: ${userProfile.description}. Industria: ${userProfile.industry}. Etapa de desarrollo: ${userProfile.developmentStage}. Tenemos ${userProfile.numberOfEmployees} empleados y estamos ubicados en ${userProfile.location}. Nuestros objetivos principales son: ${userProfile.mainGoals}. Necesitamos recursos como: ${userProfile.neededResources}. Nuestros principales competidores son: ${userProfile.mainCompetitors}. Nuestras fortalezas incluyen: ${userProfile.strengths}. Sin embargo, enfrentamos desafíos como: ${userProfile.challenges}.`,
            },
          ],
        },
        {
          parts: [
            {
              text: "Listo, tengo apuntado toda la información de tu startup",
            },
          ],
          role: "model",
        }
      );
      userChat = new ChatHistory({ userId: userId, conversations: [] });
      const conversation = { uuid: uuid, history: historyDB, botId: botId };
      userChat.conversations.push(conversation);
    }

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: historyDB,
    });

    const result = await chatSession.sendMessage(message);
    const getHistory = await chatSession.getHistory();

    let conversation = userChat.conversations.find((c) => c.uuid === uuid);
    conversation.history = getHistory;
    console.log("Historial de chat actualizado:");

    await userChat.save();
    console.log("Historial de chat guardado en la base de datos");

    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error al obtener la respuesta del bot:", error);
    res.status(500).send("Error al obtener la respuesta del bot");
  }
});

module.exports = router;
