FROM node:22-alpine3.19

WORKDIR /app

COPY package*.json .

COPY wait-for.sh .

RUN npm install

COPY dist /app

EXPOSE 8080

CMD ["node", "./bin/www"]

