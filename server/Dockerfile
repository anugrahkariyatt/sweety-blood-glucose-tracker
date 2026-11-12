FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and generate Prisma client
COPY . .
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push && npm start"]
