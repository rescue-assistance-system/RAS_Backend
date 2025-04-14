// import swaggerJsdoc from 'swagger-jsdoc'
// import swaggerUi from 'swagger-ui-express'
// const swaggerOptions = {
//     definition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'RAS Backend API Documentation',
//             version: '1.0.0',
//             description: 'API documentation for the Rescue Assistance System (RAS) backend'
//         },
//         servers: [
//             {
//                 url: 'http://localhost:8081/api',
//                 description: 'Development Server'
//             },
//             {
//                 url: 'https://ras-backend.onrender.com/api', // URL deploy (production)
//                 description: 'Production Server'
//             }
//         ],
//         components: {
//             securitySchemes: {
//                 BearerAuth: {
//                     type: 'http',
//                     scheme: 'bearer',
//                     bearerFormat: 'JWT'
//                 }
//             }
//         },
//         security: [
//             {
//                 BearerAuth: []
//             }
//         ]
//     },
//     apis: ['./src/routes/*.ts']
// }

// const swaggerSpec = swaggerJsdoc(swaggerOptions)

// export default swaggerSpec

// swagger.js
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API Docs',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'], // đường dẫn chứa các comment @swagger
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

