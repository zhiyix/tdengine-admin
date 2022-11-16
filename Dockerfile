# Build
ARG NODE_VERSION=16.17.0
ARG NGINX_VERSION=1.22.0

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY package.json .
COPY ./docker/npmrc /root/.npmrc
RUN npm config set registry https://registry.npm.taobao.org --global \
 && npm install 
COPY . .
RUN npm run build
RUN ls -al

# Runtime
FROM nginx:${NGINX_VERSION}

ENV TZ=Asia/Shanghai

COPY --from=builder /app/dist /var/www/html
COPY --from=builder /app/nginx/custom.conf /etc/nginx/conf.d/
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT [ "nginx" ]

CMD [ "-g","daemon off;"]