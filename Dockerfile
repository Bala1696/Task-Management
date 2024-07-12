FROM node:21-alpine

WORKDIR /E:/Office/Mongodb project/projects/CRM/Task-Management

COPY package.json /E:/Office/Mongodb project/projects/CRM/Task-Management

RUN npm i

COPY . /E:/Office/Mongodb project/projects/CRM/Task-Management

CMD [ "npm", "start" ]