FROM node:19.9.0 AS build-app
LABEL org.opencontainers.image.authors="iamyezhenqing@gmail.com"

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
  && mkdir -p /app/node_modules && chown node:node -R /app/node_modules /app

USER node


ARG NODE_ENV="development"
ENV NODE_ENV="${NODE_ENV}" \
    PATH="/app/node_modules/.bin:${PATH}" \
    USER="node"

COPY --chown=node:node package.json ./


RUN npm install
COPY --chown=node:node . .

CMD ["/usr/local/bin/npm", "run", "dev"]

EXPOSE 8225