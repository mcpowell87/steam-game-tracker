FROM node:14

ENV MONGO_DB=localhost
ENV MONGO_USER=root
ENV MONGO_PASS=root
ENV STEAM_API_KEY=
ENV API_URL=localhost:30000
ENV TZ=America/New_York
ENV STEAM_ID=
ENV DRY_RUN=false

EXPOSE 30000

RUN mkdir /app && chown node:node /app

WORKDIR /app

USER node

COPY --chown=node:node package.json ./

RUN npm install

COPY --chown=node:node ./src .

CMD ["node", "server.js"]