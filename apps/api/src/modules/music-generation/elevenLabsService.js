import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for generating music using ElevenLabs API
 */
class ElevenLabsService {
  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    this.baseCacheDir = join(__dirname, '../../../.cache');
    this.usersDir = join(this.baseCacheDir, 'users');
    this.outputDir = join(this.baseCacheDir, 'generated-music'); // Legacy shared directory
    this.ensureOutputDirectory();
  }

  async ensureOutputDirectory(userId = null) {
    const targetDir = userId ? this.getUserMusicDir(userId) : this.outputDir;
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
      console.log('📁 Created music output directory:', targetDir);
    }
  }

  getUserMusicDir(userId) {
    return join(this.usersDir, userId, 'music');
  }

  /**
   * Generate a single music track from a prompt
   * Uses ElevenLabs Music API which supports up to 300 seconds (5 minutes)
   * @param {string|object} promptOrObject - The music generation prompt (string or {title, prompt})
   * @param {number} index - Track index
   * @param {number} durationSeconds - Duration in seconds (default: 20 for preview)
   * @param {string} userId - Optional user ID for user-specific storage
   */
  async generateTrack(promptOrObject, index = 0, durationSeconds = 20, userId = null) {
    // Handle both string prompts and {title, prompt} objects
    const title = typeof promptOrObject === 'object' ? promptOrObject.title : null;
    const prompt = typeof promptOrObject === 'object' ? promptOrObject.prompt : promptOrObject;

    console.log(`\n🎵 Generating track ${index + 1}${title ? ` - "${title}"` : ''}...`);
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);

    try {
      // Ensure directory exists before writing
      await this.ensureOutputDirectory(userId);
      const outputDir = userId ? this.getUserMusicDir(userId) : this.outputDir;

      const durationMs = durationSeconds * 1000;
      const isPreview = durationSeconds <= 30;
      console.log(`⏱️  Requesting ${durationSeconds} seconds ${isPreview ? '(preview)' : ''} using Music API...`);

      // Use composeDetailed (not compose) which supports musicLengthMs parameter
      const response = await this.client.music.composeDetailed({
        prompt: prompt,
        musicLengthMs: durationMs,
      });

      // composeDetailed returns a multipart response with metadata and audio
      // The SDK should handle parsing and return the audio data
      let audioBuffer;

      // Check if response has audio property (from multipart response)
      if (response && response.audio) {
        if (Buffer.isBuffer(response.audio)) {
          audioBuffer = response.audio;
        } else {
          // If audio is a stream, collect chunks
          const chunks = [];
          for await (const chunk of response.audio) {
            chunks.push(chunk);
          }
          audioBuffer = Buffer.concat(chunks);
        }
      } else if (Buffer.isBuffer(response)) {
        audioBuffer = response;
      } else if (response && (response instanceof ReadableStream || response.pipe)) {
        // Handle stream response
        const chunks = [];
        for await (const chunk of response) {
          chunks.push(chunk);
        }
        audioBuffer = Buffer.concat(chunks);
      } else {
        console.error('Response type:', typeof response);
        console.error('Response keys:', Object.keys(response || {}));
        throw new Error('Unexpected response format from Music API');
      }

      console.log(`📊 Generated audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

      // Save to file with preview indicator in filename
      const previewSuffix = isPreview ? '-preview' : '';
      const filename = `track-${index + 1}${previewSuffix}-${Date.now()}.mp3`;
      const filepath = join(outputDir, filename);
      await writeFile(filepath, audioBuffer);

      console.log(`✅ Track ${index + 1} generated: ${filename} (${durationSeconds}s)`);

      return {
        success: true,
        filename,
        filepath,
        title,
        prompt,
        duration: durationSeconds,
        size: audioBuffer.length,
        isPreview,
        trackIndex: index,
      };
    } catch (error) {
      console.error(`❌ Failed to generate track ${index + 1}:`, error.message);
      return {
        success: false,
        error: error.message,
        prompt,
      };
    }
  }

  /**
   * Generate multiple tracks from an array of prompts
   * @param {Array} prompts - Array of music generation prompts (first 5 for previews)
   * @param {Function} onProgress - Progress callback function
   * @param {number} durationSeconds - Duration in seconds (default: 20 for preview)
   * @param {string} userId - Optional user ID for user-specific storage
   */
  async generateMultipleTracks(prompts, onProgress = null, durationSeconds = 20, userId = null) {
    const isPreview = durationSeconds <= 30;
    // Only generate first 8 prompts for previews
    const promptsToGenerate = isPreview ? prompts.slice(0, 8) : prompts;
    console.log(`\n🎼 Starting generation of ${promptsToGenerate.length} ${isPreview ? 'preview' : 'full'} tracks...`);

    const results = [];

    for (let i = 0; i < promptsToGenerate.length; i++) {
      const result = await this.generateTrack(promptsToGenerate[i], i, durationSeconds, userId);
      results.push(result);

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: promptsToGenerate.length,
          result,
        });
      }

      // Small delay between requests to avoid rate limiting
      if (i < promptsToGenerate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(`\n✨ Generation complete: ${successful}/${promptsToGenerate.length} tracks successful`);

    return {
      success: true,
      tracks: results,
      totalTracks: promptsToGenerate.length,
      successfulTracks: successful,
      failedTracks: promptsToGenerate.length - successful,
    };
  }

  /**
   * Check if ElevenLabs API key is configured
   */
  isConfigured() {
    return !!process.env.ELEVENLABS_API_KEY &&
           process.env.ELEVENLABS_API_KEY !== 'your-elevenlabs-api-key-here';
  }
}

export const elevenLabsService = new ElevenLabsService();
