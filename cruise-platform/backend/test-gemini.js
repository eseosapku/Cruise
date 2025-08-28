// Simple test script to verify Gemini API configuration
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('🔍 Testing Gemini Configuration...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Check environment variables
        console.log('📋 Environment Variables:');
        console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log(`  GEMINI_MODEL: ${process.env.GEMINI_MODEL || 'Not set'}`);
        console.log(`  GEMINI_PROJECT_ID: ${process.env.GEMINI_PROJECT_ID || 'Not set'}`);
        console.log('');

        if (!process.env.GEMINI_API_KEY) {
            console.log('❌ GEMINI_API_KEY is not set in .env file');
            return;
        }

        // Test API connection
        console.log('🚀 Testing API Connection...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });

        // Simple test prompt
        const prompt = "Say 'Hello from Cruise Platform!' in a friendly way.";
        console.log(`📝 Test Prompt: "${prompt}"`);
        console.log('');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ SUCCESS! Gemini API is working correctly');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 Gemini Response:');
        console.log(text);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.log('❌ ERROR: Gemini API test failed');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (error.message.includes('API_KEY_INVALID')) {
            console.log('🔑 Issue: Invalid API Key');
            console.log('📍 Solution: Check your GEMINI_API_KEY in .env file');
            console.log('🌐 Get a new key: https://aistudio.google.com/app/apikey');
        } else if (error.message.includes('PERMISSION_DENIED')) {
            console.log('🚫 Issue: Permission denied');
            console.log('📍 Solution: Ensure API key has proper permissions');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            console.log('📊 Issue: API quota exceeded');
            console.log('📍 Solution: Check your Google AI Studio quota limits');
        } else {
            console.log('🔧 Error Details:', error.message);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// Run the test
testGemini();
