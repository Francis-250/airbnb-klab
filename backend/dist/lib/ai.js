"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deterministicModel = exports.model = void 0;
const groq_1 = require("@langchain/groq");
exports.model = new groq_1.ChatGroq({
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    apiKey: process.env.GROQ_API_KEY,
});
exports.deterministicModel = new groq_1.ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
});
