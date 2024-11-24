#Use an official Node.js 20 image
FROM node:20

# configure the working directory
WORKDIR /app

#  copy the package.json to install the dependencies
COPY package.json ./

# Run npm install to install the dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# build the application
RUN npm run build

# Expose port 8080 to the outside world
EXPOSE 3001

# Define the command to run the application and specify the port
ENV PORT=3001
CMD ["npm", "start"]