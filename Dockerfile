# Use an official Node.js runtime as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the project's dependencies
RUN npm install

# Copy the rest of the application's files to the container
COPY . .

# Compile TypeScript files
RUN npm run build

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
