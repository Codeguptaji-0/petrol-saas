# Debian slim (not Alpine): Prisma engines need glibc + libssl.
# Use bullseye (OpenSSL 1.1) for best Prisma compatibility on server images.
FROM node:20-bullseye-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl libssl1.1 libstdc++6 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-bullseye-slim AS build
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl libssl1.1 libstdc++6 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl libssl1.1 libstdc++6 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# Must come from build stage: `prisma generate` writes node_modules/.prisma (enums, client).
# Copying only deps' node_modules leaves @prisma/client without generated exports → RoleCode undefined at runtime.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
