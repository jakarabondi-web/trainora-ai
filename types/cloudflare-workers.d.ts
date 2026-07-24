interface Fetcher {
  fetch(input: Request | string): Promise<Response>;
}

type D1Database = any;

declare module "cloudflare:workers" {
  export const env: {
    DB?: any;
    [key: string]: unknown;
  };
}
