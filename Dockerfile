FROM oven/bun
LABEL authors="Emmey Leo & Belle [lastname]"
LABEL maintainers="github.com/Mistyttm & github.com/toasterCats"

ENV BUN_ENV=production
ENV PORT=8080
ENV BUCKET_NAME=cab432-team1-bucket

WORKDIR /server

COPY package.json package.json
COPY LICENSE LICENSE
COPY src src
COPY ouput output
