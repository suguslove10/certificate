FROM nginx:1.23-alpine

COPY conf/default.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"] 