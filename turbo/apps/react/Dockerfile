FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install turbo --global

COPY . .
RUN turbo prune react --docker

COPY turbo.json turbo.json


EXPOSE 2424

CMD ["npm", "run", "dev"]
