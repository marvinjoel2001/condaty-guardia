# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the web application
RUN npm run build:web

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start:server"]
