FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js bot.js db.js xlsx.js pdfreport.js ./
COPY public ./public
COPY assets ./assets
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
