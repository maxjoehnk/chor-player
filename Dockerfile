FROM node:latest as builder

WORKDIR /src

COPY . /src

RUN yarn

RUN yarn build

FROM nginx:1-alpine

COPY --from=builder /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

