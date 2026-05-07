import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: 'FinPredict API',
    version: '1.0.0',
    description:
      'RESTful API for FinPredict — AI-powered personal finance forecasting and early warning system.',
    contact: {
      name: 'FinPredict Team',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API base path',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase Access Token. Obtain via supabase.auth.signInWith*() on the frontend.',
      },
    },
    schemas: {
      Profile: {
        type: 'object',
        properties: {
          id:         { type: 'string', format: 'uuid', description: 'UUID from Supabase Auth' },
          full_name:  { type: 'string', nullable: true },
          avatar_url: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status:  { type: 'string', example: 'error' },
          message: { type: 'string' },
        },
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  // Scan all route files for JSDoc @openapi annotations
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
