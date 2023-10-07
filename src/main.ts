import fs from "fs";
import fastify from "fastify";
import pino from 'pino';

const server = fastify({
  // http2 config
  http2: true,
  https: {
    key: fs.readFileSync("localhost-privkey.pem"),
    cert: fs.readFileSync("localhost-cert.pem"),
  },
  // logger with pino
  logger: pino({ 
    level: 'info',
    prettyPrint: false,
  })
});

server.get("/", async (request, reply) => {
  reply.code(200).send({ greeting: "Hello, world!" });
});

async function start() {
  try {
    const address = await server.listen({ port: 4433 });
    console.log(`Server listening on ${address.replace("[::1]", "localhost")}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

start();
