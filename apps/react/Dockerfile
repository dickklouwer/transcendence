FROM node

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 2424

CMD ["npm", "run", "dev", "--", "--filter=front-end"]
