FROM node:lts
LABEL authors="Emmey Leo & Belle [lastname]"
LABEL maintainers="github.com/Mistyttm & github.com/toasterCats"

ENV NODE_ENV=production
ENV PORT=8080
ENV BUCKET_NAME=cab432-team1-bucket

WORKDIR /server

RUN apt-get -y update && apt-get install -y ffmpeg

COPY package.json package.json
COPY LICENSE LICENSE
COPY dist/* server.js
COPY output/encoded output/encoded
COPY output/uploads output/uploads

RUN npm i --omit=dev

EXPOSE ${PORT}

CMD npm start
