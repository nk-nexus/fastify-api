import buildServer from "./servers";

const server = buildServer();

const port = process.env.PORT || "3000";

server.listen({ port: parseInt(port) }, (err, address) => {
  if (err) {
    server.log.fatal(err);
    process.exit(1);
  }
  const reset = "\x1b[0m"; // resets the terminal color to default
  const cyan = "\x1b[36m"; //  sets the text color to cyan
  console.log(
    `${cyan}Server listening at ${address.replace(
      "[::1]",
      "localhost"
    )}${reset}`
  );
});
