interface IErrorRegistration {
  addHook: (
    label: string,
    fn: (
      req: { jwt: unknown },
      res: { code: (n: number) => { send: (obj: unknown) => void } },
      err: { message: string },
      next: () => void
    ) => void
  ) => void;
}

export default function errorRegistrations<T extends IErrorRegistration>(
  server: T
) {
  // Register the onError hook
  server.addHook("onError", (request, reply, error, done) => {
    if (error.message.includes("Unauthorized")) {
      reply.code(401).send({
        error: "Unauthorized",
        message: error.message,
      });
    } else if (
      error.message.includes("does not exist") ||
      error.message.includes("not found")
    ) {
      reply.code(404).send({
        error: "Not Found",
        message: error.message,
      });
    } else {
      // Send a custom error response to the client
      reply.code(500).send({
        error: "Internal Server Error",
        message: error.message,
      });
    }
    // Finish the request-response cycle
    done();
  });
}
