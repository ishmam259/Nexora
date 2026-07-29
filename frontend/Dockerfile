# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG EXPO_PUBLIC_GATEWAY_URL=http://localhost:8080
ARG EXPO_PUBLIC_KEYCLOAK_URL=http://localhost:8081
ENV EXPO_PUBLIC_GATEWAY_URL=${EXPO_PUBLIC_GATEWAY_URL}
ENV EXPO_PUBLIC_KEYCLOAK_URL=${EXPO_PUBLIC_KEYCLOAK_URL}

RUN npx expo export -p web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
