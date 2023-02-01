# Introduction

Backend API for Audiophile e-commerce frontend.

## Description

Audiophile is a online store that sells luxury and branded audio gadgets ranging from earphones, speakers, to headsets. The main aim of this web application is to present the products in the most user-friendly format and keeping accessibility in mind

## Technologies Used
MVC Architecture
TypeScript
ExpressJs
NodeJs
MongoDb
Mongoose
JWT for Authentication
Sharp (for Image Processing)
AWS SDK

# Contributing

To Contribute to this Project, Follow the Steps Below:

##### Create a `.env` file with these variables

```
NODE_ENV=(example: development or production)
HOST=127.0.0.1
PORT=9898
DATABASE_PASSWORD=
DATABASE_LOCAL=
SALT_ROUNDS=
JWT_EXPIRES_IN=
JWT_COOKIR_EXPIRES_IN=
JWT_SECRET=
DATABASE_HOSTED=
EMAIL_USERNAME=
EMAIL_PASSWORD=
AWS_S3_SECRET=
AWS_S3_ACCESS_KEY=
AWS_S3_REGION=
AWS_S3_BUCKET_NAME=
SENDINBLUE_SMTP_Server=
SENDINBLUE_Port=
SENDINBLUE_PASSWORD=
SENDINBLUE_Login=
FLW_SECRET_KEY=FLWSECK_TEST=
FLW_PUBLIC_KEY=FLWPUBK_TEST=
FLW_ENCRYPTION_KEY=
FLW_SECRET_HASH=

```

##### Installation

```bash
npm install

```

## Running the app

```bash
# development
npm run dev

# Preetier
npm run preetier

# prepare the app for AWS deployment
npm run aws:build

# production mode
npm run start
```

## Test

```bash

# unit tests
 npm run test

```

## Stay in touch

- Website - [https://godswill.vercel.app](https://godswill.vercel.app)
- Author - [Godswill Edet](https://github.com/underscoreDev)
- Email - [gimmex1@gmail.com](gimmex1@gmail.com)
