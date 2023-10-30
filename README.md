# fastify-api
fastify with http2 + typescript + prisma + mysql

#### First of All
run `yarn install`. If don't have just go to [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

#### Generate Key
generate `localhost-privatekey.pen` and `localhost-cert.pen` is required in http2 configulation which also means https config.

download and install [openssl](https://github.com/openssl/openssl/releases)

`openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem`

#### Environment File
create `.env` file following the example below
```bash
PORT=4433
JWT_SECRET=[YOUR_JWT_SECRET_KEY]

# mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=[YOUR_DATABASE_URL]
```

#### Docker Database (Optional)
If you are using [docker](https://www.docker.com/products/docker-desktop/) and want to connect the app to local database, follow this guide.

to create docker network run `docker network create -d bridge [NETWORK_NAME]` and `docker volume create [VOLUME_NAME]` to create volume

to run mysql image on your local run.
```bash
docker run --name [CONTAINER_NAME] -e MYSQL_ROOT_PASSWORD=[YOUR_SECRET_PASSWORD] --network [NETWORK_NAME] -p 127.0.0.1:[PUBLISH_PORT]:3306/tcp -v [VOLUME_NAME]:/data/mysql -d mysql:8.0
```

I suggest to run mysql image tag version >= 8.0 to prevent error json type on some field.

Go to your container then create database `docker exec -it [CONTAINER_NAME] mysql -uroot -p` then type your password.

type `show databases;` to show all databases. to create your new one by `create database [YOUR_DATABASE_NAME];` then try to run the previous command it should add another one database.

#### Generate Prisma Client
to generate prisma client type run command `prisma generate`. If database table not exist, make sure your connection is valid then genetate table by run `npx prisma migrate dev`

#### Start App
build ts file `yarn build` then develop by `yarn start`. or just run `yarn dev`.

Server listening on: https://localhost:4433
