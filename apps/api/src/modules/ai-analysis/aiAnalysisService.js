import Anthropic from '@anthropic-ai/sdk';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { storageService } from '../../lib/storageService.js';

/**
 * Service for AI-powered music analysis using Claude
 * Analyzes user's listening data to generate insights about their "music age"
 */
class AIAnalysisService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    // Use the same data directory as storageService for cross-platform compatibility
    this.dataDir = storageService.dataDir;
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
    const prompt = `You are an AI music curator creating a personalized "ElevenLabs Wrapped" experience. Based on this user's Spotify listening data, you'll:

1. Analyze their music taste and age
2. Create a PERSONALIZED ALBUM of 8 instrumental tracks just for them
3. Suggest 5 other albums we could generate in the future

Here's their Spotify data:

${musicDataContext}

Your task: Create a custom instrumental album that captures the ESSENCE of their music taste. Think of it like Spotify Wrapped meets AI music generation.

Write your response as a JSON object with EXACTLY these fields:

{
  "estimatedAge": number (JUST the number, like 25),
  "ageRange": "string (like '18-24', '25-34')",
  "confidence": number (0-100),
  "reasoning": [
    "Write ONLY 1-2 bullet points in 2nd person.",
    "Example: 'You're vibing to 2010s indie - definitely your formative years.'",
    "Keep it SUPER short - one sentence each!"
  ],
  "musicGeneration": "string (fun label like 'Indie Millennial', 'Gen Z Pop Enthusiast', 'Alt-Rock Nostalgic')",
  "insights": "string (1-2 sentences about their taste, using 'you/your'. Keep it personal and fun!)",

  "genreCount": number (count all unique genres from their data),
  "topGenres": ["genre1", "genre2", "genre3", "genre4", "genre5"],

  "personalAlbumTitle": "string (CREATIVE album name for THEIR personalized 8-track album. Examples: 'Midnight Nostalgia', 'Digital Dreams', 'Sunset Frequencies', 'Urban Echoes')",
  "personalAlbumArtist": "Your AI",
  "personalAlbumDescription": "string (One compelling sentence describing what makes THIS album special for THEM specifically)",

  "recommendedAlbums": [
    "Create 5 OTHER album concepts we could generate for them based on their taste.",
    "Each album should explore a different mood/vibe they'd enjoy.",
    "Format: { \"title\": \"Album Name\", \"description\": \"One sentence about the vibe\" }",
    "",
    "Examples:",
    "{ \"title\": \"Rainy Day Reflections\", \"description\": \"Melancholic lo-fi beats perfect for introspective afternoons.\" }",
    "{ \"title\": \"Neon Highways\", \"description\": \"Synthwave instrumentals capturing late-night city drives.\" }",
    "{ \"title\": \"Forest Ambience\", \"description\": \"Nature-inspired soundscapes for deep meditation and focus.\" }",
    "",
    "Make them VARIED - different genres/moods they'd explore!"
  ],

  "musicPrompts": [
    "Create 8 track objects that form a COHESIVE ALBUM based on their taste.",
    "These tracks will be ACTUALLY GENERATED using ElevenLabs AI music.",
    "",
    "CRITICAL RULES:",
    "- STRONGLY PREFER VOCAL TRACKS - aim for AT LEAST 6 out of 8 tracks with vocals/lyrics",
    "- Choose INSTRUMENTAL or VOCAL based on genre appropriateness:",
    "  * USE VOCALS for: pop, hip-hop, rap, R&B, soul, rock, indie rock, punk, country, folk, singer-songwriter, alternative, metal, blues, funk, disco, house, trap, drill, emo, grunge",
    "  * USE INSTRUMENTAL ONLY for: pure ambient, classical orchestral, meditation music, nature sounds, study background music",
    "  * Electronic/EDM genres CAN and SHOULD have vocals when possible",
    "  * When in doubt, DEFAULT TO VOCALS",
    "- NO artist/band/celebrity names or references to real people",
    "- Each track should fit the overall album vibe",
    "- Vary the energy levels across the 8 tracks for good album flow",
    "",
    "Format: { \"title\": \"Track Name\", \"prompt\": \"detailed generation prompt\" }",
    "",
    "Prompt Templates:",
    "VOCAL (PREFERRED): \"[Mood] [genre] track at [BPM] with [male/female/androgynous] vocals, featuring [instruments]. The vocals should be [singing style] with lyrics about [theme] and the music should feel [adjectives]. Suitable for [use case]. Include [musical elements].\"",
    "INSTRUMENTAL (ONLY when genre requires it): \"[Mood] [genre] instrumental track at [BPM], featuring [instruments], in the style of [era/influence]. The music should feel [adjectives] and be suitable for [use case]. Include [musical elements].\"",
    "",
    "Example Vocal Tracks (USE THESE MORE!):",
    "{ \"title\": \"Midnight Drive\", \"prompt\": \"Melancholic indie pop track at 95 BPM with smooth male vocals, featuring acoustic guitar and subtle synths. The vocals should be intimate and emotional with lyrics about longing and the music should feel nostalgic and introspective. Suitable for late-night reflection. Include gentle dynamics and a memorable chorus.\" }",
    "{ \"title\": \"City Lights\", \"prompt\": \"Upbeat pop track at 110 BPM with bright female vocals, featuring synth-pop elements and electronic beats. The vocals should be catchy and energetic with lyrics about freedom and adventure. Suitable for dancing and feeling empowered. Include a strong hook and sing-along chorus.\" }",
    "{ \"title\": \"Fading Echoes\", \"prompt\": \"Atmospheric alternative rock track at 88 BPM with powerful male vocals, featuring electric guitar and ambient pads. The vocals should be emotive and raw with lyrics about memories and change. Suitable for introspection. Include dynamic build-ups and emotional climax.\" }",
    "",
    "Example Instrumental Track (use sparingly):",
    "{ \"title\": \"Neon Pulse\", \"prompt\": \"Uplifting electronic instrumental track at 128 BPM, featuring synthesizers and deep bass, in the style of modern EDM. The music should feel energetic, euphoric, and driving and be suitable for workout sessions. Include a powerful build-up and drop.\" }",
    "",
    "BPM Guidelines: slow (60-90), medium (90-120), fast (120-180)",
    "Vocal Styles: smooth, raspy, powerful, soft, emotive, rhythmic, melodic, intimate, anthemic",
    "Lyric Themes: love, heartbreak, freedom, nostalgia, self-discovery, adventure, resilience, memories, dreams, overcoming challenges, celebration, rebellion, connection",
    "Use Cases: workout, study, gaming, relaxation, driving, focus, meditation, cooking, singing along, dancing, road trips"
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
