FROM node

RUN npm install -g @nestjs/cli

# Set the working directory for the backend service
WORKDIR /nestjs

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies using npm ci for cleaner
RUN npm install
RUN npm install --save @nestjs/websockets @nestjs/platform-socket.io socket.io

COPY . .

EXPOSE 4242

CMD ["npm", "run", "start:dev"]
# CMD cp -ru /nestjs/node_modules/ /nestjs/code/node_modules/ && npm run start:dev --prefix=/nestjs/code/