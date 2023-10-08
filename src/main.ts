import buildServer from "./server";

const server = buildServer();

server.listen({ port: 4433 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address.replace("[::1]", "localhost")}`)
})