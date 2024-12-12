# Stage 1: Build the React app
FROM node:16 as build
WORKDIR /app

# Copy package.json and yarn.lock (or package-lock.json if using npm)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:1.21-alpine

# Remove the default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the React build files to Nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
