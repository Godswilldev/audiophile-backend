import swaggerJsDoc, { OAS3Options } from "swagger-jsdoc";

const options: OAS3Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Audiophile E-Commerce API",
      version: "1.0",
      description: "API Documentation for Audiophile E-commerce Website from Frontend Mentors",
      contact: {
        email: "gimmex1@gmail.com",
        name: "Godswill Edet",
        url: "https://godswill.vercel.app",
      },
    },
    servers: [{ url: "http://localhost:9898", description: "Local Server" }],
  },
  apis: [
    "./routes/auth.route.ts",
    "./routes/orders.route.ts",
    "./routes/product.route.ts",
    "./routes/review.route.ts",
    "./routes/user.route.ts",
  ],
};

export default swaggerJsDoc(options);
