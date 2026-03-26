FROM node:22-alpine

WORKDIR /app

# Copy root package.json and workspace config
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy backend source
COPY packages/backend/ ./packages/backend/

# Run migrations, seeds, then start
WORKDIR /app/packages/backend
EXPOSE 3001

CMD ["sh", "-c", "npx sequelize-cli db:migrate && (npx sequelize-cli db:seed:all || echo 'Seeds already applied') && npx ts-node src/index.ts"]
