FROM node:18-slim as dev
RUN apt update && apt install git procps -y
USER node
RUN yarn global add @nestjs/cli
WORKDIR /usr/app
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=5s --retries=5 CMD curl -f "http://localhost:3000/health"
CMD [ "/usr/app/docker/entrypoint.sh" ]


FROM node:18-slim as prod
USER node
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn --production
COPY dist ./
EXPOSE 3000
CMD ["node", "dist/main"]