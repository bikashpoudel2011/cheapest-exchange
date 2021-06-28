ARG DOCKER_FROM_TAG=latest
FROM node:14 as builder

ARG NPM_TOKEN

# Add auth for our private modules on npm
RUN echo -n ${NPM_TOKEN} > /root/.npmrc

# Configure NPM for maximum speed!
RUN npm set progress=false && npm config set depth 0

# Set environment variables for build/test.
ENV NODE_ENV dev
ENV BUILD_ENV alpine
ENV NODE_LOG_LEVEL debug

# NPM install
WORKDIR /cheapest-exchange-api
COPY package.json .
COPY package-lock.json .

RUN npm ci

# Copy entire project from host
COPY config /cheapest-exchange-api/config
COPY src /cheapest-exchange-api/src
COPY jest.config.js /cheapest-exchange-api/jest.config.js
COPY tsconfig.json /cheapest-exchange-api/tsconfig.json
COPY tslint.json /cheapest-exchange-api/tslint.json

RUN npm run build

#needed by Code Climate Reporter
# COPY .git /cheapest-exchange-api/.git

ENTRYPOINT ["/bin/sh"]

FROM node:14

# Set NODE_ENV in deploy/[staging,production]/deployment.yaml

# Only bring over files needed for execution
COPY --from=builder cheapest-exchange-api/build /release
COPY --from=builder cheapest-exchange-api/node_modules /release/node_modules
COPY --from=builder cheapest-exchange-api/config /release/config
COPY --from=builder cheapest-exchange-api/package.json /release/package.json
COPY --from=builder cheapest-exchange-api/package-lock.json /release/package-lock.json

# remove devDependencies
RUN npm prune --production

EXPOSE 8080
WORKDIR "/release"
CMD ["npm", "start"]