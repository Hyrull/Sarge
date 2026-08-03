FROM node:22
WORKDIR /usr/src/app

# installing dependencies
COPY package*.json ./
RUN npm install

# Copying code
COPY . .

# Using npx/nodemon so live changes get updated in realtime
CMD ["npx", "nodemon", "--exec", "node --env-file=.env", "src/sarge.js"]