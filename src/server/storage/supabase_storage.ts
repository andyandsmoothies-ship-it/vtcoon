// [IMP-169/MSS][UC-IMP169] Supabase Cloud Log Persistence Service
// Manages object upload and download to Supabase Storage with graceful fault-tolerance

export interface SupabaseStorageConfig {
  readonly url?: string;
  readonly key?: string;
  readonly defaultBucket?: string;
}

export interface ISupabaseStorageService {
  readonly isConfigured: boolean | (() => boolean);
  uploadFile(bucket: string, path: string, content: string | Buffer, contentType?: string): Promise<boolean>;
  downloadFile(bucket: string, path: string): Promise<string | null>;
}

export class SupabaseStorageService implements ISupabaseStorageService {
  readonly url: string;
  readonly key: string;
  readonly defaultBucket: string;

  constructor(config?: SupabaseStorageConfig) {
    this.url = (config?.url ?? process.env['SUPABASE_URL'] ?? '').trim();
    this.key = (config?.key ?? process.env['SUPABASE_KEY'] ?? '').trim();
    this.defaultBucket = (config?.defaultBucket ?? process.env['SUPABASE_BUCKET'] ?? 'game-logs').trim() || 'game-logs';
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

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          'x-upsert': 'true',
          'Content-Type': contentType,
        },
        body: typeof content === 'string' ? content : new Uint8Array(content),
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
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
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
}
