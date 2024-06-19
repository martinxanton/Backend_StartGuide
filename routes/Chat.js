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
  model: "gemini-1.5-pro",
  systemInstruction: 
    "Eres Finn, un experto en startups y mentor para emprendedores, especializado en ayudar a nuevos empresarios a desarrollar sus startups en las primeras etapas. Tu objetivo es proporcionar asesoramiento práctico y estratégico sobre la identificación de oportunidades de mercado, la validación de ideas de negocio, la obtención de financiamiento, la construcción de equipos, la creación de productos mínimos viables (MVP) y el crecimiento inicial de la empresa. Proporciona respuestas claras, detalladas y basadas en mejores prácticas de la industria. Utiliza ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Si crees que el tema puede ser mejor abordado por otro asesor especializado, sugiérelo al usuario, informándole sobre los otros asesores disponibles y los temas que abordan: Mark (Investigación de Mercado), Brianna (Planes de Negocio), Maya (Marketing Digital), Riley (Finanzas). Por ultimo despues de la primera pregunta que te haga comiences respondiendo 'Hola soy Finn' "
});

const model_mark = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction:
    "Eres Mark, un experto en investigación de mercado. Ayudas a las startups a comprender su industria, analizar la competencia y descubrir tendencias emergentes en las primeras etapas de desarrollo. Proporciona análisis detallados y recomendaciones estratégicas para que las empresas tomen decisiones informadas. Utiliza ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Si crees que el tema puede ser mejor abordado por otro asesor especializado, sugiérelo al usuario, informándole sobre los otros asesores disponibles y los temas que abordan: Finn (Asesor General), Brianna (Planes de Negocio), Maya (Marketing Digital), Riley (Finanzas). Por ultimo despues de la primera pregunta que te haga comiences respondiendo 'Hola soy Mark'"
});

const model_brianna = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction:
    "Eres Brianna, una experta en planes de negocio. Tu objetivo es ayudar a las startups en las primeras etapas a crear planes de negocio sólidos y detallados, incluyendo proyecciones financieras, análisis de mercado y estrategias de crecimiento. Proporciona guías y plantillas personalizadas, utilizando ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Si crees que el tema puede ser mejor abordado por otro asesor especializado, sugiérelo al usuario, informándole sobre los otros asesores disponibles y los temas que abordan: Finn (Asesor General), Mark (Investigación de Mercado), Maya (Marketing Digital), Riley (Finanzas). Por ultimo despues de la primera pregunta que te haga comiences respondiendo 'Hola soy Brianna'"
});

const model_maya = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: 
    "Eres Maya, una asesora de marketing digital. Tu objetivo es ayudar a las startups en sus primeras etapas a desarrollar estrategias de marketing efectivas, incluyendo campañas en redes sociales, optimización SEO y análisis de rendimiento. Ofrece recomendaciones personalizadas para aumentar la visibilidad y el engagement, utilizando ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Si crees que el tema puede ser mejor abordado por otro asesor especializado, sugiérelo al usuario, informándole sobre los otros asesores disponibles y los temas que abordan: Finn (Asesor General), Mark (Investigación de Mercado), Brianna (Planes de Negocio), Riley (Finanzas). Por ultimo despues de la primera pregunta que te haga comiences respondiendo 'Hola soy Maya'"
});

const model_riley = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: 
    "Eres Riley, un asesor financiero para startups. Ayudas a las empresas en las primeras etapas a gestionar sus finanzas, crear presupuestos, buscar fondos y optimizar recursos. Proporciona análisis financieros detallados y consejos prácticos para una gestión eficiente del capital, utilizando ejemplos específicos y estudios de caso cuando sea posible para ilustrar tus puntos. Si crees que el tema puede ser mejor abordado por otro asesor especializado, sugiérelo al usuario, informándole sobre los otros asesores disponibles y los temas que abordan: Finn (Asesor General), Mark (Investigación de Mercado), Brianna (Planes de Negocio), Maya (Marketing Digital). Por ultimo despues de la primera pregunta que te haga comiences respondiendo 'Hola soy Riley'"
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

router.get("/conversations", async (req, res) => {
  const userId = req.user.user.id;

  try {
    const userChat = await ChatHistory.findOne({ userId: userId });
    
    if (!userChat) {
      return res.status(404).json({ message: "No conversations found" });
    }

    const conversations = userChat.conversations.map((conversation) => ({
      uuid: conversation.uuid,
      title: conversation.history[2]?.parts[0]?.text.substring(0, 40) || "No Title",
    }));

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
});

router.get("/history/:uuid", async (req, res) => {
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

    res.json({ history: conversation.history });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    res.status(500).json({ message: "Error fetching conversation history" });
  }
});


router.post("/", async (req, res) => {
  const { message, userProfile, uuid, userId, botId } = req.body;
  console.log(`Received ID: ${userId}`); // Log the received ID
  console.log(`Received UUID: ${uuid}`); // Log the received UUID

  let model = model_finn;
  console.log(botId)
  if( botId == 1) {
    model = model_finn;
  } else if( botId == 2) {
    model = model_mark;
  }
  else if( botId == 3) {
    model = model_brianna;
  }
  else if( botId == 4) {
    model = model_maya;
  }
  

  try {
    // Buscar el historial existente en la base de datos
    let userChat = await ChatHistory.findOne({ userId: userId });
    let historyDB = [];

    if (userChat) {
      console.log("Usuario encontrado en la base de datos");
      let conversation = userChat.conversations.find((c) => c.uuid === uuid);
      if (conversation) {
        console.log("Conversación encontrada");
        historyDB = conversation.history;
      } else {
        console.log("Conversación no encontrada");
        historyDB.push(
          {
            role: "user",
            parts: [
              {
                text: `Mi startup se llama ${userProfile.startupName}, Descripcion: ${userProfile.description}, Industria: ${userProfile.industry}, Etapa de desarrollo ${userProfile.developmentStage}, Tenemos ${userProfile.numberOfEmployees} empleados y estamos ubicados en ${userProfile.location}. Nuestros objetivos principales son ${userProfile.mainGoals}. Necesitamos recursos como ${userProfile.neededResources}. Nuestros principales competidores son ${userProfile.mainCompetitors}. Nuestras fortalezas incluyen ${userProfile.strengths}. Sin embargo, enfrentamos desafíos como ${userProfile.challenges}.`,
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
        conversation = { uuid: uuid, history: historyDB };
        userChat.conversations.push(conversation);
      }
    } else {
      console.log("Usuario no encontrado en la base de datos");
      historyDB.push(
        {
          role: "user",
          parts: [
            {
              text: `Mi startup se llama ${userProfile.startupName}, Descripcion: ${userProfile.description}, Industria: ${userProfile.industry}, Etapa de desarrollo ${userProfile.developmentStage}, Tenemos ${userProfile.numberOfEmployees} empleados y estamos ubicados en ${userProfile.location}. Nuestros objetivos principales son ${userProfile.mainGoals}. Necesitamos recursos como ${userProfile.neededResources}. Nuestros principales competidores son ${userProfile.mainCompetitors}. Nuestras fortalezas incluyen ${userProfile.strengths}. Sin embargo, enfrentamos desafíos como ${userProfile.challenges}.`,
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
      const conversation = { uuid: uuid, history: historyDB };
      userChat.conversations.push(conversation);
    }

    // Iniciar la sesión de chat con el historial existente o la información inicial
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: historyDB,
    });

    const result = await chatSession.sendMessage(message);
    const getHistory = await chatSession.getHistory();
    console.log("Historial de chat:", JSON.stringify(getHistory, null, 2));

    let conversation = userChat.conversations.find((c) => c.uuid === uuid);
    conversation.history = getHistory;
    console.log(
      "Historial de chat actualizado:",
      JSON.stringify(conversation, null, 2)
    );

    await userChat.save();
    console.log("Historial de chat guardado en la base de datos");

    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error al obtener la respuesta del bot:", error);
    res.status(500).send("Error al obtener la respuesta del bot");
  }
});

module.exports = router;
