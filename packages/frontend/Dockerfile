FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/frontend/package.json ./packages/frontend/

RUN yarn install --frozen-lockfile

COPY packages/frontend/ ./packages/frontend/

WORKDIR /app/packages/frontend
EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0"]
