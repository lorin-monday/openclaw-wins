export const dynamic = 'force-static';

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'OpenClaw Wins API',
    version: '1.0.0',
    description:
      'Simple public API for creating and listing OpenClaw wins. Published for quick integrations and testing.'
  },
  servers: [{ url: 'https://web-livid-kappa-38.vercel.app' }],
  tags: [
    { name: 'wins', description: 'Create and list win submissions' },
    { name: 'health', description: 'Basic health checks' }
  ],
  paths: {
    '/api/wins': {
      get: {
        tags: ['wins'],
        summary: 'List wins',
        responses: {
          '200': {
            description: 'Array of wins',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Win' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['wins'],
        summary: 'Create a win',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateWinRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created win',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Win' }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service health',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    service: { type: 'string', example: 'openclaw-wins-web' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Win: {
        type: 'object',
        required: ['id', 'title', 'summary', 'category', 'createdAt'],
        properties: {
          id: { type: 'string', example: 'win_123' },
          title: { type: 'string', example: 'Shared swagger publicly' },
          summary: { type: 'string', example: 'Published API docs and sent the link to the WhatsApp group.' },
          category: { type: 'string', example: 'integration' },
          source: { type: 'string', example: 'whatsapp' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['api', 'docs', 'share']
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateWinRequest: {
        type: 'object',
        required: ['title', 'summary'],
        properties: {
          title: { type: 'string', minLength: 3 },
          summary: { type: 'string', minLength: 10 },
          category: { type: 'string', example: 'automation' },
          source: { type: 'string', example: 'web' },
          tags: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid payload' }
        }
      }
    }
  }
};

export async function GET() {
  return Response.json(spec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'
    }
  });
}
