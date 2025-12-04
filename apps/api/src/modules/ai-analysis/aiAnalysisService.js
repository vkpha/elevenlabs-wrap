import Anthropic from '@anthropic-ai/sdk';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for AI-powered music analysis using Claude
 * Analyzes user's listening data to generate insights about their "music age"
 */
class AIAnalysisService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.dataDir = join(__dirname, '../../../data');
  }

  /**
   * Get the three most recent JSON files from the data directory
   */
  async getRecentDataFiles() {
    try {
      const files = await readdir(this.dataDir);
      const jsonFiles = files
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => {
          // Sort by timestamp in filename (newest first)
          return b.localeCompare(a);
        });

      // Get the 3 most recent files
      const recentFiles = jsonFiles.slice(0, 3);

      if (recentFiles.length === 0) {
        throw new Error('No JSON data files found. Please save some music data first.');
      }

      // Read the content of these files
      const filesData = await Promise.all(
        recentFiles.map(async (filename) => {
          const filepath = join(this.dataDir, filename);
          const content = await readFile(filepath, 'utf-8');
          return {
            filename,
            content: JSON.parse(content)
          };
        })
      );

      return filesData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Data directory not found. Please save some music data first.');
      }
      throw error;
    }
  }

  /**
   * Analyze music data and guess user's "music age"
   */
  async guessMusicAge() {
    // Get recent data files
    const dataFiles = await this.getRecentDataFiles();

    console.log('\n=== AI ANALYSIS DEBUG ===');
    console.log('Files found:', dataFiles.map(f => f.filename));
    console.log('Number of files:', dataFiles.length);

    // Extract and summarize the key data instead of sending everything
    const summarizedData = dataFiles.map(file => {
      const data = file.content.data || file.content;
      const items = data.items || [];

      if (file.filename.includes('top-artists')) {
        return {
          type: 'Top Artists',
          count: items.length,
          artists: items.slice(0, 20).map(artist => ({
            name: artist.name,
            genres: artist.genres,
            popularity: artist.popularity
          }))
        };
      } else if (file.filename.includes('top-tracks')) {
        return {
          type: 'Top Tracks',
          count: items.length,
          tracks: items.slice(0, 20).map(track => ({
            name: track.name,
            artists: track.artists.map(a => a.name),
            album: track.album?.name,
            release_date: track.album?.release_date,
            popularity: track.popularity
          }))
        };
      } else if (file.filename.includes('recently-played')) {
        return {
          type: 'Recently Played',
          count: items.length,
          tracks: items.slice(0, 20).map(item => ({
            name: item.track?.name,
            artists: item.track?.artists.map(a => a.name),
            played_at: item.played_at,
            album: item.track?.album?.name,
            release_date: item.track?.album?.release_date
          }))
        };
      }
    }).filter(Boolean);

    const musicDataContext = JSON.stringify(summarizedData, null, 2);
    console.log('Context length:', musicDataContext.length, 'characters');

    // Create the prompt for Claude
    const prompt = `You are a fun, friendly music analyst who's great at figuring out people's ages from their playlists. I'm going to show you someone's Spotify data, and your job is to guess how old they are!

Here's what they've been listening to:

${musicDataContext}

Now, analyze this like you're talking to a friend:
1. When were these artists at their peak? When would someone be a teen listening to them?
2. Are they vibing with current hits or living in the past?
3. Check those release dates - nostalgia is real!
4. Think about generations: Gen Z = 2018-2024 bangers, Millennials = 2000s-2015 classics, Gen X = 90s-2000s hits
5. Are they discovering old gems or keeping up with TikTok trends?

Now give me your best guess! Write your response as a JSON object:

{
  "estimatedAge": number (JUST the number, like 25 - NOT "25 years old"),
  "ageRange": "string (like '18-24', '25-34')",
  "confidence": number (0-100),
  "reasoning": [
    "Write ONLY 1-2 total bullet points in 2nd person. Keep it SUPER short.",
    "Example: 'You're vibing to 2010s hits - definitely your teen years.'",
    "Example: 'Your current artist picks scream Gen Z energy.'",
    "MAXIMUM 1-2 bullets total, each one sentence!"
  ],
  "musicGeneration": "string (fun label like 'Gen Z TikTok Enthusiast', 'Emo Millennial', '90s Kid Forever')",
  "insights": "string (1-2 fun sentences directly addressing them about their taste, using 'you' and 'your')",
  "topGenres": ["list the top 5 genres from their music as strings"],
  "musicPrompts": [
    "Create 10 objects with 'title' and 'prompt' for instrumental tracks based on their taste",
    "CRITICAL: DO NOT mention any specific artist names, band names, or celebrity names!",
    "CRITICAL: All tracks must be INSTRUMENTAL ONLY - no vocals, no singing, no lyrics",
    "",
    "Each object should be:",
    "{",
    "  \"title\": \"Creative 2-4 word track name\",",
    "  \"prompt\": \"[Mood] [genre] track at [BPM or slow/medium/fast], featuring [main instruments], in the style of [era/influence]. The music should feel [2-3 adjectives] and be suitable for [use case]. Include [build/drop/solo/looping/etc.].\"",
    "}",
    "",
    "Examples:",
    "{ \"title\": \"Neon Pulse\", \"prompt\": \"Uplifting electronic track at 128 BPM, featuring synthesizers and deep bass, in the style of modern EDM. The music should feel energetic, euphoric, and uplifting and be suitable for workout sessions. Include a build-up and powerful drop.\" }",
    "{ \"title\": \"Autumn Reflection\", \"prompt\": \"Melancholic indie track at medium tempo, featuring acoustic guitar and soft piano, in the style of 2010s indie folk. The music should feel introspective, calm, and nostalgic and be suitable for study sessions. Include gentle looping melodies.\" }",
    "{ \"title\": \"Shadow Realm\", \"prompt\": \"Dark hip-hop beat at 85 BPM, featuring heavy 808 bass and crisp hi-hats, in the style of trap music. The music should feel menacing, intense, and hypnotic and be suitable for gaming. Include hard-hitting drops.\" }",
    "",
    "Make titles creative and related to the mood/genre!",
    "Use appropriate BPM ranges: slow (60-90), medium (90-120), fast (120-180)",
    "Common use cases: gaming, study, workout, vlog background, trailer music, meditation, cooking, driving"
  ]
}

Keep it casual, fun, and talk directly TO them like you're roasting their playlist in a friendly way!`;

    console.log('Prompt length:', prompt.length, 'characters');

    // Available models - using the correct model name from API
    const model = 'claude-sonnet-4-5-20250929';
    console.log('Using model:', model);
    console.log('API Key configured:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key preview:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');

    console.log('\n=== CALLING ANTHROPIC API ===');

    // Call Claude API
    try {
      const response = await this.anthropic.messages.create({
        model: model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      console.log('API Response Status: SUCCESS');
      console.log('Response ID:', response.id);
      console.log('Model used:', response.model);
      console.log('Response length:', response.content[0].text.length, 'characters');
      console.log('=== END DEBUG ===\n');

      // Extract the response text
      const responseText = response.content[0].text;

      // Try to parse JSON from the response
      let analysis;
      try {
        // Try to extract JSON if it's wrapped in markdown code blocks
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                         responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          analysis = JSON.parse(responseText);
        }
      } catch (parseError) {
        // If parsing fails, return the raw text
        console.error('Failed to parse JSON response:', parseError);
        return {
          success: true,
          rawResponse: responseText,
          error: 'Failed to parse structured response'
        };
      }

      return {
        success: true,
        analysis,
        filesAnalyzed: dataFiles.map(f => f.filename),
        timestamp: new Date().toISOString()
      };
    } catch (apiError) {
      console.error('=== ANTHROPIC API ERROR ===');
      console.error('Error type:', apiError.constructor.name);
      console.error('Error message:', apiError.message);
      console.error('Error details:', JSON.stringify(apiError, null, 2));
      console.error('=== END ERROR ===\n');
      throw apiError;
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();
