import buildServer from "./server";

const server = buildServer();

const port = process.env.PORT || "3000";

server.listen({ port: parseInt(port) }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address.replace("[::1]", "localhost")}`);
});
