# CQRS App (Template Project)

![Build Status](https://github.com/mathulbrich/cqrs-app/actions/workflows/pipeline.yml/badge.svg) ![codecov.io](https://codecov.io/github/mathulbrich/cqrs-app/coverage.svg?branch=master)

## :scroll: Description

This is a template project to CQRS application using [NestJS](https://nestjs.com/) framework.

[See the docs](http://localhost:3000/docs)

## :link: Dependencies

* [Yarn](https://yarnpkg.com/)
* [NodeJS (v16.14.2)](https://nodejs.org/en/)
* [Docker + Compose](https://www.docker.com/)

## :gear: Setup

```bash
# to install required dependencies
$ yarn

#to build dist directory with JS files
$ yarn build
```

## :rocket: Running app

```bash
# start app and its dependencies
$ docker-compose up -d
```

## :triangular_flag_on_post: Running tests

The tests need to be executed inside `cqrs-app` container started by compose.

```bash
# unit tests
$ yarn test

# watch tests
$ yarn test:watch

# test coverage
$ yarn test:cov
```
