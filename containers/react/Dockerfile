FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install socket.io-client

COPY . .

EXPOSE 2424

CMD ["npm", "run", "dev"]
