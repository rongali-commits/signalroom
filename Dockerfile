FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV SIGNALROOM_DATA_DIR=/data

EXPOSE 8080

CMD ["node", "scripts/start-railway.mjs"]
