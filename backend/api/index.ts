import express, { Request, Response } from 'express';

const app = express();

let realApp: express.Application | null = null;
let bootError: Error | null = null;

// Dynamic import so module-level errors (e.g. Zod env validation) are catchable.
// Static imports run before the module body — a throw there bypasses any try/catch.
const bootPromise = (async () => {
  try {
    const { createApp } = await import('../src/app.js');
    realApp = createApp();
  } catch (err) {
    bootError = err instanceof Error ? err : new Error(String(err));
    console.error('🔥 CRITICAL COLD START CRASH:', bootError);
    console.error(bootError.stack);
    console.error('ENV CHECK:', {
      hasDb: !!process.env.DATABASE_URL,
      hasJwt: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    });
  }
})();

app.use(async (req: Request, res: Response) => {
  await bootPromise;
  if (bootError || !realApp) {
    res.status(500).json({
      success: false,
      error: 'Server failed to boot — check Vercel Runtime Logs',
    });
    return;
  }
  return realApp(req, res);
});

export default app;
