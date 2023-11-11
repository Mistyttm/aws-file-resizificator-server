FROM node:21
LABEL authors="Emmey Leo & Belle [lastname]"
LABEL maintainers="github.com/Mistyttm & github.com/toasterCats"

ENV NODE_ENV=production
ENV PORT=8080
ENV BUCKET_NAME=cab432-team1-bucket

WORKDIR /server

COPY package.json package.json
COPY LICENSE LICENSE
COPY dist/* server.js
COPY output/encoded /server/output/encoded
COPY output/uploads /server/output/uploads

RUN apt-get -y update && apt-get -y upgrade && apt-get install -y ffmpeg
RUN npm i

EXPOSE 8080

CMD npm run start
