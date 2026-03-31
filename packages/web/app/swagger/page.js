import 'swagger-ui-dist/swagger-ui.css';
import SwaggerUI from './swagger-ui';

export const metadata = {
  title: 'OpenClaw Wins API',
  description: 'Public Swagger UI for the OpenClaw Wins API'
};

export default function SwaggerPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b1020', color: '#f5f7ff', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8ea0ff' }}>
            OpenClaw Wins
          </div>
          <h1 style={{ fontSize: 40, margin: '8px 0 12px', lineHeight: 1.05 }}>Public API / Swagger</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: '#cbd5ff', maxWidth: 760 }}>
            Explore the public API contract for listing and creating wins. The raw OpenAPI document is available at{' '}
            <a href="/openapi.json" style={{ color: '#9ac7ff' }}>/openapi.json</a>.
          </p>
        </div>
        <div
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(154,199,255,0.22)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            background: '#fff'
          }}
        >
          <SwaggerUI url="/openapi.json" />
        </div>
      </div>
    </main>
  );
}
