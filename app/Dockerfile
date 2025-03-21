# Use a lighter version of Node as a parent image
FROM node:12.12.0-alpine AS dev

# Set the working directory to /app
WORKDIR /app

ENV PATH /api/node_modules/.bin:$PATH

# copy package.json into the container at /app
COPY package*.json ./


# Copy the current directory contents into the container at /app
COPY ./ /app

# install dependencies
RUN apk --no-cache --virtual build-dependencies add \
        python \
        make \
        g++

RUN npm rebuild bcrypt --build-from-source

RUN npm install
RUN npm install pm2 -g

# Make port 3030 available to the world outside this container

# Copy the script for waiting database container
# COPY ./scripts/wait-for-it.sh /wait-for-it.sh

# Make the script executable
# RUN chmod +x /wait-for-it.sh

EXPOSE 3030