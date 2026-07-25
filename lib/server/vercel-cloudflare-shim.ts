// Next.js/Vercel compatibility shim. Production data bindings are supplied by
// Sites/Cloudflare; on Vercel, API routes return explicit configuration errors
// until a compatible database and object-storage adapter is connected.
export const env = process.env as Record<string, string | undefined> & {
  DB?: undefined;
  DOCUMENTS?: undefined;
};
