# Use official Node.js runtime
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package.json and lock file for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
