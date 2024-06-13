const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatHistorySchema = new Schema({
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    history: [
        {
        role: { type: String, required: true },
        parts: [{ text: { type: String, required: true } }],
        },
    ],
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;
