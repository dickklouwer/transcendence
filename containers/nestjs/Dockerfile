FROM node

# Set the working directory for the backend service
WORKDIR /nestjs

# Copy package.json and package-lock.json to the container
COPY package*.json /nestjs/

# Install project dependencies using npm ci for cleaner
RUN npm ci

# Copy the backend code into the contianer
COPY . /nestjs/

CMD cp -ru /nestjs/node_modules/ /nestjs/code/node_modules/ && npm run start:dev --prefix=/nestjs/code/