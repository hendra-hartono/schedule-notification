FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json .

RUN npm cache clean --force
RUN npm install

COPY . .
RUN npm run build