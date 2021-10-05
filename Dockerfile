FROM node
WORKDIR /app
COPY . .
RUN yarn install

CMD ["node", "src/index.js"]