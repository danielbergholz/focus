import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

// Import Tidewave only in development.
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  import("tidewave/tanstack");
}

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
}));
