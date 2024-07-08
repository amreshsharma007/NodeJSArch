# ---- Base Node ----
FROM node:20-alpine AS base
RUN apk add --update --no-cache curl bash

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# set working directory
WORKDIR /home/node/app
# Set tini as entrypoint
#ENTRYPOINT ["/sbin/tini", "--"]

# copy project file
COPY --chown=node:node package*.json ./
# Change the user
USER node


# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
# now install the packages
RUN npm install --omit=dev

COPY --chown=node:node . .

#EXPOSE 8080
RUN npm run build

ENV CLUSTER_ENABLED=true

CMD [ "node", "build/src/app.js" ]
