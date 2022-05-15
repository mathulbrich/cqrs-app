#!/bin/bash

docker build -f Dockerfile -t cqrs-app-prod --target prod .