FROM node:20
WORKDIR /usr/src/app

# installing dependencies
COPY package*.json ./
RUN npm install

# Copying code
COPY . .

# Using npx/nodemon so live changes get updated in realtime
CMD ["npx", "nodemon", "src/sarge.js"]