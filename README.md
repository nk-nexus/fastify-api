# fastify-api
fastify with http2 + typescript + prisma + mysql

#### Generate Key
`openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem`

#### Start App
build ts file `yarn build` then develop by `yarn dev`.

Server listening on: https://localhost:4433
