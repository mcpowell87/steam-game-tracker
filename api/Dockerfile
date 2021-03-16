FROM node:14



ARG MONGO_DB=localhost:27017
ARG MONGO_USER=root
ARG MONGO_PASS=root
ARG STEAM_API_KEY=null

ENV MONGO_DB $MONGO_DB
ENV MONGO_USER $MONGO_USER
ENV MONGO_PASS $MONGO_PASS
ENV STEAM_API_KEY $STEAM_API_KEY

EXPOSE 30000

RUN mkdir /app && chown node:node /app

WORKDIR /app

USER node

COPY --chown=node:node package.json ./

RUN npm install

COPY --chown=node:node ./src .

CMD ["node", "server.js"]