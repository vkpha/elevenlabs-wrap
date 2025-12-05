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
    this.baseCacheDir = join(__dirname, '../../.cache');
    this.dataDir = join(this.baseCacheDir, 'music-data');
    this.usersDir = join(this.baseCacheDir, 'users');
    console.log('📁 Data cache directory:', this.dataDir);
    console.log('📁 Users cache directory:', this.usersDir);
    this.ensureDataDirectory();
    this.ensureUsersDirectory();

    // Auto-cleanup old files (optional - keeps last 24 hours)
    this.cleanupOldFiles();
  }

  async ensureUsersDirectory() {
    if (!existsSync(this.usersDir)) {
      await mkdir(this.usersDir, { recursive: true });
    }
  }

  getUserCacheDir(userId) {
    return join(this.usersDir, userId);
  }

  async ensureUserDirectory(userId) {
    const userDir = this.getUserCacheDir(userId);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }
    return userDir;
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

  async saveToJson(data, prefix, metadata = {}, userId = null) {
    // If userId is provided, save to user-specific directory
    let targetDir, filepath;

    if (userId) {
      targetDir = await this.ensureUserDirectory(userId);
      const filename = this.generateFileName(prefix);
      filepath = join(targetDir, filename);
    } else {
      // Fallback to shared directory for backward compatibility
      await this.ensureDataDirectory();
      const filename = this.generateFileName(prefix);
      filepath = join(this.dataDir, filename);
    }

    const fileData = {
      metadata: {
        timestamp: new Date().toISOString(),
        type: prefix,
        itemCount: this.getItemCount(data),
        userId: userId || 'shared',
        ...metadata
      },
      data
    };

    await writeFile(filepath, JSON.stringify(fileData, null, 2));

    return {
      success: true,
      filename: filepath.split('/').pop(),
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

  async saveTopArtists(data, timeRange = 'short_term', userId = null) {
    return this.saveToJson(data, 'top-artists', {
      timeRange,
      description: this.getTimeRangeDescription(timeRange)
    }, userId);
  }

  async saveTopTracks(data, timeRange = 'short_term', userId = null) {
    return this.saveToJson(data, 'top-tracks', {
      timeRange,
      description: this.getTimeRangeDescription(timeRange)
    }, userId);
  }

  async saveRecentlyPlayed(data, userId = null) {
    return this.saveToJson(data, 'recently-played', {
      description: 'Last 50 played tracks'
    }, userId);
  }

  getTimeRangeDescription(timeRange) {
    const descriptions = {
      short_term: 'Last 4 weeks',
      medium_term: 'Last 6 months',
      long_term: 'All time'
    };
    return descriptions[timeRange] || timeRange;
  }

  /**
   * Save user's complete wrapped data (AI analysis + track info)
   */
  async saveUserWrappedData(userId, wrappedData) {
    const userDir = await this.ensureUserDirectory(userId);
    const filepath = join(userDir, 'wrapped-data.json');

    const data = {
      userId,
      timestamp: new Date().toISOString(),
      ...wrappedData
    };

    await writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved wrapped data for user: ${userId}`);
    return filepath;
  }

  /**
   * Get user's wrapped data if it exists
   */
  async getUserWrappedData(userId) {
    const userDir = this.getUserCacheDir(userId);
    const filepath = join(userDir, 'wrapped-data.json');

    if (!existsSync(filepath)) {
      return null;
    }

    try {
      const content = await import('fs').then(fs => fs.promises.readFile(filepath, 'utf-8'));
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading wrapped data for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Check if user has cached wrapped data
   */
  hasUserWrappedData(userId) {
    const userDir = this.getUserCacheDir(userId);
    const filepath = join(userDir, 'wrapped-data.json');
    return existsSync(filepath);
  }

  /**
   * Clear user's cached data (for regeneration)
   */
  async clearUserCache(userId) {
    const userDir = this.getUserCacheDir(userId);

    if (!existsSync(userDir)) {
      return;
    }

    try {
      const files = await readdir(userDir);
      await Promise.all(files.map(file => unlink(join(userDir, file))));
      console.log(`🗑️  Cleared cache for user: ${userId}`);
    } catch (error) {
      console.error(`Error clearing cache for ${userId}:`, error);
    }
  }
}

export const storageService = new StorageService();
