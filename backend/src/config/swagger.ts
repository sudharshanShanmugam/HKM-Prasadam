import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HKM Prasadam API',
      version: '1.0.0',
      description: 'REST API for HKM Chennai Prasadam Booking System',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Meals: {
          type: 'object',
          properties: {
            Breakfast: { type: 'number', example: 2 },
            Lunch:     { type: 'number', example: 3 },
            Dinner:    { type: 'number', example: 1 },
          },
        },
        PrasadamBooking: {
          type: 'object',
          properties: {
            id:       { type: 'string', example: 'HKM-12345' },
            name:     { type: 'string', example: 'Radhakrishna Das' },
            mobile:   { type: 'string', example: '9876543210' },
            email:    { type: 'string', example: 'devotee@example.com' },
            location: { type: 'string', enum: ['Thiruvanmiyur', 'NLBR'] },
            date:     { type: 'string', example: '2025-08-15' },
            meals:    { $ref: '#/components/schemas/Meals' },
            total:    { type: 'number', example: 155 },
            status:   { type: 'string', enum: ['pending', 'approved', 'declined'] },
            submitted:{ type: 'string' },
          },
        },
        PartyEnquiry: {
          type: 'object',
          properties: {
            id:             { type: 'string', example: 'ENQ-12345' },
            name:           { type: 'string' },
            mobile:         { type: 'string' },
            email:          { type: 'string' },
            eventDate:      { type: 'string', example: '2025-09-01' },
            address:        { type: 'string' },
            meals:          { $ref: '#/components/schemas/Meals' },
            preferredMenu:  { type: 'string' },
            preferredPrice: { type: 'number' },
            confirmedMenu:  { type: 'string' },
            confirmedPrice: { type: 'number' },
            status:         { type: 'string', enum: ['pending', 'accepted', 'declined'] },
            paid:           { type: 'boolean' },
          },
        },
        InternalOrder: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            name:      { type: 'string' },
            mobile:    { type: 'string' },
            date:      { type: 'string' },
            dept:      { type: 'string' },
            meal:      { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner'] },
            count:     { type: 'number' },
            location:  { type: 'string' },
            accepted:  { type: 'boolean' },
            delivered: { type: 'boolean' },
          },
        },
        SlotDate: {
          type: 'object',
          properties: {
            date:         { type: 'string', example: '2025-08-15' },
            meals:        { type: 'array', items: { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner'] } },
            stopped:      { type: 'boolean' },
            isFestival:   { type: 'boolean' },
            festivalName: { type: 'string' },
            priceOverrides: {
              type: 'object',
              properties: {
                Breakfast: { type: 'number' },
                Lunch:     { type: 'number' },
                Dinner:    { type: 'number' },
              },
            },
            slotLimits: {
              type: 'object',
              properties: {
                Thiruvanmiyur: { $ref: '#/components/schemas/Meals' },
                NLBR:          { $ref: '#/components/schemas/Meals' },
              },
            },
          },
        },
        Settings: {
          type: 'object',
          properties: {
            defaultMealRates: { $ref: '#/components/schemas/Meals' },
            defaultSlotLimits: {
              type: 'object',
              properties: {
                Thiruvanmiyur: { $ref: '#/components/schemas/Meals' },
                NLBR:          { $ref: '#/components/schemas/Meals' },
              },
            },
            bookingWindowOpen:  { type: 'boolean' },
            bookingWindowClose: { type: 'boolean' },
            bookingOpenDays:    { type: 'number' },
            bookingCloseDays:   { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data:    { type: 'object' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export default swaggerJsdoc(options);
