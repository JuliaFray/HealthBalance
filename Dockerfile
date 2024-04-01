# Use the official Node.js image as the base image
FROM node:20.0-slim

# Set the working directory in the container
WORKDIR /

# Copy the application files into the working directory
COPY . /

# Install the application dependencies
RUN npm install

expose 8000

# Define the entry point for the container
CMD ["node", "src/bin/www.js"]
