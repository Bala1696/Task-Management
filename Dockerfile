FROM node:21-alpine

WORKDIR /Users/hemnaathsurya/Documents/TaskManagement

COPY package.json /Users/hemnaathsurya/Documents/TaskManagement

RUN npm i

COPY . /Users/hemnaathsurya/Documents/TaskManagement

CMD [ "npm", "start" ]