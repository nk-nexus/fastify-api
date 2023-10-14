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
    const errLowcase = error.message.toLocaleLowerCase()
    if (errLowcase.includes("unauthorized")) {
      reply.code(401);
    } else if (
      errLowcase.includes("does not exist") ||
      errLowcase.includes("not found")
    ) {
      reply.code(404);
    } else if (errLowcase.includes("does not have enough")) {
      reply.code(422);
    } else {
      reply.code(500);
    }
    // Finish the request-response cycle
    done();
  });
}
