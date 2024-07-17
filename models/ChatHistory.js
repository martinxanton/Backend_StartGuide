const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    conversations: [
        {
        uuid: { type: String, required: true },
        history: { type: Array, required: true },
        botId: { type: String, required: true },
        likes: { type: Array }
        }
    ]
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
