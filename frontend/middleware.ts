import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  if (!clerkConfigured) {
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');

  const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/admin(.*)',
  ]);

  const handler = clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect();
    }
  });

  return handler(req, evt);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
