FROM node:21-alpine
LABEL authors="Emmey Leo & Belle Simmonds"
LABEL maintainers="github.com/Mistyttm & github.com/toasterCats"

ENV NODE_ENV=production
ENV PORT=8080
ENV BUCKET_NAME=cab432-team1-bucket

WORKDIR /server

RUN apk add ffmpeg

COPY package.json LICENSE ./
COPY dist/build_*.js server.js
COPY dist/front-end/ front-end/
COPY output/encoded output/encoded
COPY output/uploads output/uploads

EXPOSE ${PORT}

CMD npm start
