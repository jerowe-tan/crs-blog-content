import { createClient } from "@libsql/client";

export function DB(){
  const turso = createClient({
    url: import.meta.env.SECRET_TURSO_CRS_CONTENT_URL,
    authToken: import.meta.env.SECRET_TURSO_CRS_CONTENT_TOKEN,
  });
  return turso;
}