## Demp App

This is repo is a demo app about simple backend endpoints built by express.js and MySQL

#### Getting Started

###### Production Environment

Prerequisites:

1. NodeJS 22
1. Docker & Docker Compose

After cloning the repo, to start all compoents, please run:

```sh
cd project-path/demoapp

./start.sh
```

The `start.sh` will do:

1. Install required node modules
1. Download `mysql` image and start server with port `3306`
1. Build `demoapp` image and start server with port `8080`
1. Set up database `demoapp` schema (`model.js`)

Endpoints:

1. Place Order: `POST http://localhost:8080/orders` with body
1. Take Order: `PATCH http://localhost:8080/orders` with body
1. Get Order: `GET http://localhost:8080/orders?page=1&limit=3`

By default, the Google Map API Key is `demogoogleapikey`. When this fake key is applied, application will generate a random number between 1000 to 10000 to pretend the Google API response `distanceMeters` value.

To applied a real API Key, find and replace `demogoogleapikey` in `docker-compose.yml`

###### Development Environment

Prerequisites:

1. NodeJS 22
1. Docker & Docker Compose
1. MySQL Server

```sh
# Set up application, database & Google API config
.env
```

```sh
# Install node modules
npm install
```

```sh
# Run developmen server
npm run dev

# Or with nodemon
npm run watch
```

```sh
# Run unit tests (require MySQL connection)
npm run test:unit
```

```sh
# Run integration tests (require MySQL connection)
npm run test:intg
```
