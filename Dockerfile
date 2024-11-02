# ---- Base Node ----
FROM node:22 AS base

RUN apt-get update

RUN apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget

RUN groupadd --gid 11111 ubuntu \
  && useradd --uid 11111 --gid ubuntu --shell /bin/bash --create-home ubuntu

USER ubuntu

# Prepare / copy files
COPY --chown=ubuntu:ubuntu ./build/ /home/ubuntu/app/build
#COPY ./src/ /home/ubuntu/app/src
COPY --chown=ubuntu:ubuntu ./node_modules/ /home/ubuntu/app/node_modules
COPY --chown=ubuntu:ubuntu ./package.json /home/ubuntu/app
COPY --chown=ubuntu:ubuntu ./nodemon.json /home/ubuntu/app
COPY --chown=ubuntu:ubuntu ./migrate.json /home/ubuntu/app
COPY --chown=ubuntu:ubuntu ./tsconfig.json /home/ubuntu/app
COPY --chown=ubuntu:ubuntu ./.env /home/ubuntu/app
COPY --chown=ubuntu:ubuntu ./.env.* /home/ubuntu/app

WORKDIR /home/ubuntu/app

ARG VERSION=${VERSION}
ENV VERSION=${VERSION}

ARG NODE_ENV=${NODE_ENV}
ENV NODE_ENV=${NODE_ENV}

ARG MONGODB_URI=${MONGODB_URI}
ENV MONGODB_URI=${MONGODB_URI}

ARG JWT_SECRET=${JWT_SECRET}
ENV JWT_SECRET=${JWT_SECRET}

ARG ENC_KEY=${ENC_KEY}
ENV ENC_KEY=${ENC_KEY}

ARG AWS_REGION=${AWS_REGION}
ENV AWS_REGION=${AWS_REGION}

ARG AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
ENV AWS_BUCKET_NAME=${AWS_BUCKET_NAME}

ARG AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}

ARG AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

# start the server
ENTRYPOINT ["npm", "run", "start:native"]
