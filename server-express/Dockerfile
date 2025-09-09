FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source files but exclude node_modules
COPY src/ ./src/
COPY *.js ./

CMD ["npm", "start"]