import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://ccc42e8e54abad6bfb827bd710b46e92@o4512344292327424.ingest.de.sentry.io/4512345177325648",

    dataCollection: {
        // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
        // userInfo: false,
        // httpBodies: [],
    },

    // 100% in dev, 10% in production
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    // Session Replay: 10% of all sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [Sentry.replayIntegration()],
});

// Traces App Router navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
