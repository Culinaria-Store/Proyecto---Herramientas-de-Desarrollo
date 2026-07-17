FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

# Carpeta de uploads (imágenes de productos/perfiles) por si no viene en el build context
RUN mkdir -p uploads/perfiles

EXPOSE 5000

CMD [ "node", "src/app.js" ]
