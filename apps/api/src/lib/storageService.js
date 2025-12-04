import { writeFile, mkdir, unlink, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class StorageService {
  constructor() {
    // Use local cache directory (will be .gitignored)
    // For production: this would be replaced with S3, Redis, or database storage
    this.dataDir = join(__dirname, '../../.cache/music-data');
    console.log('📁 Data cache directory:', this.dataDir);
    this.ensureDataDirectory();

    // Auto-cleanup old files (optional - keeps last 24 hours)
    this.cleanupOldFiles();
  }

  async cleanupOldFiles() {
    try {
      if (!existsSync(this.dataDir)) return;

      const files = await readdir(this.dataDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filepath = join(this.dataDir, file);
        const stats = await import('fs').then(fs => fs.promises.stat(filepath));

        if (now - stats.mtime.getTime() > maxAge) {
          await unlink(filepath);
          console.log(`🗑️  Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async ensureDataDirectory() {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
  }

  generateFileName(prefix) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}-${timestamp}.json`;
  }

  async saveToJson(data, prefix, metadata = {}) {
    await this.ensureDataDirectory();

    const filename = this.generateFileName(prefix);
    const filepath = join(this.dataDir, filename);

    const fileData = {
      metadata: {
        timestamp: new Date().toISOString(),
        type: prefix,
        itemCount: this.getItemCount(data),
        ...metadata
      },
      data
    };

    await writeFile(filepath, JSON.stringify(fileData, null, 2));

    return {
      success: true,
      filename,
      filepath,
      itemCount: fileData.metadata.itemCount
    };
  }

  getItemCount(data) {
    if (Array.isArray(data)) {
      return data.length;
    }
    if (data?.items && Array.isArray(data.items)) {
      return data.items.length;
    }
    return 0;
  }

  async saveTopArtists(data, timeRange = 'short_term') {
    return this.saveToJson(data, 'top-artists', {
      timeRange,
      description: this.getTimeRangeDescription(timeRange)
    });
  }

  async saveTopTracks(data, timeRange = 'short_term') {
    return this.saveToJson(data, 'top-tracks', {
      timeRange,
      description: this.getTimeRangeDescription(timeRange)
    });
  }

  async saveRecentlyPlayed(data) {
    return this.saveToJson(data, 'recently-played', {
      description: 'Last 50 played tracks'
    });
  }

  getTimeRangeDescription(timeRange) {
    const descriptions = {
      short_term: 'Last 4 weeks',
      medium_term: 'Last 6 months',
      long_term: 'All time'
    };
    return descriptions[timeRange] || timeRange;
  }
}

export const storageService = new StorageService();
