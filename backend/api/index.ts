import { createApp } from '../src/app.js';
import express from 'express';

let app;

try {
  // If env.ts fails validation here, we will catch it!
  app = createApp();
} catch (error) {
  console.error("🔥 CRITICAL COLD START CRASH:", error);
  
  // Create a dummy Express app just to serve the exact error to the browser
  const fallbackApp = express();
  fallbackApp.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      error: "Server failed to boot",
      details: error instanceof Error ? error.message : "Unknown error",
      hint: "Check Vercel Runtime Logs for Zod Env Validation errors"
    });
  });
  app = fallbackApp;
}

export default app;
