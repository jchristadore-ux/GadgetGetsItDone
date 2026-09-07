import { prisma } from "./db";

export async function trackEvent(params: {
  name: string;
  userId?: string | null;
  sessionId?: string | null;
  path?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: params.name,
        userId: params.userId || undefined,
        sessionId: params.sessionId || undefined,
        path: params.path || undefined,
        metaJson: params.meta ? JSON.stringify(params.meta) : undefined,
      },
    });
  } catch (err) {
    console.error("[analytics]", err);
  }
}
