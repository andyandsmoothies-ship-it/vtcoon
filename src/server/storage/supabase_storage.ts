// [IMP-169/MSS][IMP-175/MSS] Supabase Cloud Log Persistence Service
// Manages object upload and download to Supabase Storage with graceful fault-tolerance and key resolution

export interface SupabaseStorageConfig {
  readonly url?: string;
  readonly key?: string;
  readonly defaultBucket?: string;
}

export interface ISupabaseStorageService {
  readonly isConfigured: boolean | (() => boolean);
  readonly defaultBucket?: string;
  readonly keyType?: 'JWT' | 'OPAQUE' | 'NONE';
  uploadFile(bucket: string, path: string, content: string | Buffer, contentType?: string): Promise<boolean>;
  downloadFile(bucket: string, path: string): Promise<string | null>;
}

export interface KeyResolutionResult {
  readonly key: string;
  readonly keyType: 'JWT' | 'OPAQUE' | 'NONE';
}

const KEY_CANDIDATE_NAMES = [
  'customKey',
  'SUPABASE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_API_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
] as const;

export function stripQuotes(val?: string): string {
  if (!val) return '';
  let s = val.trim();
  while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s.replace(/^["']+|["']+$/g, '').trim();
}

export function resolveSupabaseKey(
  candidates?: string | Record<string, string | undefined>,
): KeyResolutionResult {
  let source: Record<string, string | undefined>;
  if (typeof candidates === 'string') {
    source = { customKey: candidates, ...process.env };
  } else if (typeof candidates === 'object' && candidates !== null) {
    source = candidates;
  } else {
    source = process.env;
  }

  const cleanedList: string[] = [];
  for (const name of KEY_CANDIDATE_NAMES) {
    const raw = source[name];
    if (raw) {
      const cleaned = stripQuotes(raw);
      if (cleaned.length > 0) {
        cleanedList.push(cleaned);
      }
    }
  }

  // 1. Prioritize RFC 7515 Compact JWS token (starts with 'eyJ')
  for (const k of cleanedList) {
    if (k.startsWith('eyJ')) {
      return { key: k, keyType: 'JWT' };
    }
  }

  // 2. Opaque keys starting with 'sb_' or 'sb-'
  for (const k of cleanedList) {
    if (k.startsWith('sb_') || k.startsWith('sb-')) {
      return { key: k, keyType: 'OPAQUE' };
    }
  }

  // 3. Fallback to any other non-empty key as OPAQUE
  if (cleanedList.length > 0) {
    return { key: cleanedList[0]!, keyType: 'OPAQUE' };
  }

  return { key: '', keyType: 'NONE' };
}

export class SupabaseStorageService implements ISupabaseStorageService {
  readonly url: string;
  readonly key: string;
  readonly keyType: 'JWT' | 'OPAQUE' | 'NONE';
  readonly defaultBucket: string;

  constructor(config?: SupabaseStorageConfig) {
    let rawUrl = stripQuotes(
      config?.url ??
      process.env['SUPABASE_URL'] ??
      process.env['NEXT_PUBLIC_SUPABASE_URL'] ??
      ''
    );
    if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }
    // Auto-fix frequent typo 'subpabase.co' -> 'supabase.co'
    rawUrl = rawUrl.replace(/\.subpabase\.co/gi, '.supabase.co');
    this.url = rawUrl;

    const keyParam = config?.key !== undefined ? { customKey: config.key } : undefined;
    const resolved = resolveSupabaseKey(keyParam);
    this.key = resolved.key;
    this.keyType = resolved.keyType;

    this.defaultBucket = stripQuotes(
      config?.defaultBucket ??
      process.env['SUPABASE_BUCKET'] ??
      process.env['NEXT_PUBLIC_SUPABASE_BUCKET'] ??
      'game-logs'
    ) || 'game-logs';

    if (process.env['NODE_ENV'] !== 'test') {
      let hostDisplay = 'NONE';
      try {
        hostDisplay = this.url ? new URL(this.url).host : 'EMPTY';
      } catch {
        hostDisplay = 'INVALID_URL';
      }
      console.info(
        `[SupabaseStorage] Initialized (host: ${hostDisplay}, keyType: ${this.keyType}, bucket: ${this.defaultBucket})`
      );
    }
  }

  get isConfigured(): boolean {
    return this.url.length > 0 && this.key.length > 0;
  }

  async uploadFile(
    bucket: string,
    filePath: string,
    content: string | Buffer,
    contentType = 'application/json',
  ): Promise<boolean> {
    if (!this.isConfigured) return false;
    const cleanUrl = this.url.replace(/\/$/, '');
    const cleanBucket = bucket.replace(/^\/+|\/+$/g, '');
    const cleanPath = filePath.replace(/^\/+/, '');
    const endpoint = `${cleanUrl}/storage/v1/object/${cleanBucket}/${cleanPath}`;

    const executeUpload = async (): Promise<boolean> => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          'x-upsert': 'true',
          'Content-Type': contentType,
        },
        body: typeof content === 'string' ? content : new Uint8Array(content),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[SupabaseStorage] Upload failed (${response.status} ${response.statusText}) for ${cleanBucket}/${cleanPath}: ${errorText}`);
        return false;
      }
      return true;
    };

    try {
      return await executeUpload();
    } catch (err: unknown) {
      const retryDelay = process.env['NODE_ENV'] === 'test' ? 5 : 1000;
      try {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return await executeUpload();
      } catch (retryErr: unknown) {
        const finalErr = retryErr || err;
        const msg = finalErr instanceof Error ? finalErr.message : String(finalErr);
        const cause = finalErr instanceof Error && 'cause' in finalErr ? (finalErr as { cause?: unknown }).cause : undefined;
        const causeDetail = cause instanceof Error ? cause.message : (cause ? String(cause) : '');
        const detail = causeDetail ? `${msg} (cause: ${causeDetail})` : msg;
        console.warn(`[SupabaseStorage] Network/Fetch error uploading ${cleanBucket}/${cleanPath} to ${cleanUrl}: ${detail}`);
        return false;
      }
    }
  }

  async downloadFile(bucket: string, filePath: string): Promise<string | null> {
    if (!this.isConfigured) return null;
    const cleanUrl = this.url.replace(/\/$/, '');
    const cleanBucket = bucket.replace(/^\/+|\/+$/g, '');
    const cleanPath = filePath.replace(/^\/+/, '');
    const endpoint = `${cleanUrl}/storage/v1/object/${cleanBucket}/${cleanPath}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) return null;
      return await response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const cause = err instanceof Error && 'cause' in err ? (err as { cause?: unknown }).cause : undefined;
      const causeDetail = cause instanceof Error ? cause.message : (cause ? String(cause) : '');
      const detail = causeDetail ? `${msg} (cause: ${causeDetail})` : msg;
      console.warn(`[SupabaseStorage] Network/Fetch error downloading ${cleanBucket}/${cleanPath} from ${cleanUrl}: ${detail}`);
      return null;
    }
  }
}
