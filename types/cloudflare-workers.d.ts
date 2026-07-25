interface Fetcher {
  fetch(input: Request | string): Promise<Response>;
}

type D1Database = any;
type R2Bucket = any;

declare module "cloudflare:workers" {
  export const env: {
    DB?: any;
    DOCUMENTS?: any;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_IDENTITY_WEBHOOK_SECRET?: string;
    ADMIN_EMAILS?: string;
    DEV_AUTH_BYPASS?: string;
    [key: string]: unknown;
  };
}
