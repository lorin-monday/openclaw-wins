'use client';

import { useEffect, useRef } from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle';

export default function SwaggerUI({ url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ui = SwaggerUIBundle({
      url,
      domNode: containerRef.current,
      deepLinking: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      tryItOutEnabled: true
    });

    return () => {
      ui?.destroy?.();
    };
  }, [url]);

  return <div ref={containerRef} />;
}
