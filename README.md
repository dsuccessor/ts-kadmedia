# ts-kadmedia
**Project Name**
kadmedia

**Description**
A RESTful API for basic social media platform. The API facilitate user
interactions like (post, feeds, follow, like, comment, notifcation etc) and data management within the platform.

**Table of Contents**
Project Name
Description
Table of Contents
Installation
Usage
Contributing
License


**Installation**
Clone the below address:
http Address:
https://gitlab.com/ts-kadmedia/ts-kadmedia.git

SSH Address:
git@gitlab.com:ts-kadmedia/ts-kadmedia.git

**Navigate to the project directory:**
cd your_project folder name

**Install dependencies:**

npm install   # or yarn install

The following dependencies will be installed
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/mongoose": "^5.11.97",
    "@types/socket.io": "^3.0.2",
    "bcrypt": "^5.1.1",
    "cookie": "^0.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "fcm-node": "^1.6.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.0",
    "nodemon": "^3.1.0",
    "redis": "^4.6.13",
    "socket.io": "^4.7.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.4"

**Configure environment variables:**
The .env file is already included on the clone repo

**For Mongodb connection string**
Yoy might not need to do much except changing the MONGO_DB connection string to your own Mongodb connection string.

**For Firebase Cloud Messaging/Cloud Messaging API connection string**
You might also need to create a firebase account, add project, navigate to project settings, select cloud messaging tab, enable cloud messaging API(Legacy).
Copy the server key below it and then open .env file on your project directory and replace the string attached to the FCM_KEY with the server key you just copied from your firebase project console.

**For Authentication Key**
It is a random string that has been hashed using openssl 64bit encrypted method. Optionally, you can create your own hashed/encrypted key and replace the string attached to the AUTH_KEY on the .env file on your project root folder.

**Database Setup:**
Setup your own mongodb
Navigate to the .env file inside the root folder of the project
Change the connection string assigned to variable MONGO_DB to the connection string to your own database.


**Usage**

**Start the application:**
npm run dev   # or yarn run dev

**Access the application:**
Connect to the API using any of the app software available on the internet for consuming or testing APIs (e.g Postman, Swagger UI etc)

**API Endpoint**
The API endpoints are contained on the API documentation. Below is the link to the documentation:
https://documenter.getpostman.com/view/24519943/2sA3BhdZQU


Thanks.