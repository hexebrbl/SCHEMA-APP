"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * SYSTEM PROMPT LOGIC FOR AI (Gemini 3.0 Flash)
 * 
 * INPUT HANDLING:
 * The AI must determine whether the user input is:
 * - Case A (Title): A specific work/book/movie name
 * - Case B (Concept): An abstract concept, vibe, or aesthetic (e.g., "Cyberpunk", "孤独", "Noir")
 * 
 * OUTPUT LOGIC BY CASE:
 * 
 * Case A (作品名 - Specific Title):
 *   1. Identify the input work's series, media type, and main theme
 *   2. EXCLUDE all sequels, prequels, spin-offs, remakes of the same work
 *   3. EXCLUDE works from the same series
 *   4. EXCLUDE works in the same primary genre
 *   5. Propose 5 works from DIFFERENT genres/media that share thematic DNA
 *   Example: Input "AKIRA" → Exclude Cyberpunk anime/manga → Propose diverse works (literature, art, history)
 * 
 * Case B (概念 - Abstract Concept):
 *   1. Identify what the concept represents
 *   2. Find "MASTERPIECES" (傑作) that embody this concept
 *   3. Include reference materials (写真集, 資料) if relevant
 *   4. Propose 5 diverse works across media types (Movie, Book, Art/Photo, History, etc.)
 *   Example: Input "Cyberpunk" → Propose iconic works from literature, film, art history, real-world tech documentation
 * 
 * MANDATORY OUTPUT CONSTRAINTS:
 * - Output exactly 5 items (must be 5, not 3, not 4)
 * - Never output sequels, prequels, spin-offs, or remakes (NEGATIVE PROMPT)
 * - Include media_type (MOVIE, BOOK, ART/PHOTO, HISTORY, MUSIC, DESIGN, etc.)
 * - Include creator/author name
 * - Include brief structural_insight (客観的分析 - objective analysis)
 * - Include analysis/focus_point in Japanese (except for English labels like CATEGORY, media_type)
 */

async function getBookImage(title: string, creator: string) {
  try {
    // 検索ワードをより厳密にして「事典」などが混ざるのを防ぐ
    const query = encodeURIComponent(`intitle:"${title}" inauthor:"${creator}"`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
    const data = await res.json();
    return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") || null;
  } catch (e) {
    return null;
  }
}

export async function generateIdeas(
  mode: "narrative" | "visual",
  query: string,
  filters?: {
    mediaType: string;
    eraVibe: string;
    nicheLevel: string;
    time: string;
  }
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview", 
    generationConfig: { responseMimeType: "application/json" }
  });

  /**
   * DYNAMIC SYSTEM PROMPT CONSTRUCTION
   * 
   * Step 1: Determine if input is a title or concept
   * Step 2: Apply appropriate output logic (Case A or Case B)
   * Step 3: Apply filter constraints if provided
   * Step 4: Enforce output count = 5 items
   * Step 5: Apply negative prompts for sequels/spin-offs
   */
  
  const filterConstraints = filters
    ? `\nFilter constraints:\n` +
      (filters.mediaType !== "All" ? `- Media Type: ${filters.mediaType}\n` : "") +
      (filters.eraVibe !== "All" ? `- Era/Vibe: ${filters.eraVibe}\n` : "") +
      (filters.nicheLevel ? `- Niche Level: ${filters.nicheLevel}\n` : "") +
      (filters.time ? `- Time Type: ${filters.time}\n` : "")
    : "";

  const prompt = `You are SCHEMA, an intelligent curation engine.

User Input: "${query}"

TASK: Determine if this is a TITLE or CONCEPT. Then:
- If TITLE: Exclude its series, sequels, and same genre. Propose 5 diverse works from different angles.
- If CONCEPT: Find 5 masterpieces and reference materials embodying this concept across media types.

STRICT REQUIREMENTS:
- Output exactly 5 items (no more, no less)
- Never include sequels, prequels, spin-offs, or remakes
- Include media_type, creator, title, analysis, structural_insight
- Use Japanese for descriptions, English for labels (CATEGORY, media_type, etc.)
${filterConstraints}

Return valid JSON array with exactly 5 objects. Each object must have:
{
  "title": "work title",
  "creator": "author/director/artist",
  "media_type": "MOVIE|BOOK|ART/PHOTO|HISTORY|MUSIC|DESIGN|...",
  "analysis": "Japanese explanation of why this work relates to the input",
  "structural_insight": "Objective analysis in Japanese of how this work exemplifies the theme"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON response - ensure we get exactly 5 items
    let ideas = JSON.parse(text);
    
    // Force exactly 5 items
    if (Array.isArray(ideas)) {
      ideas = ideas.slice(0, 5);
    } else {
      // If response is wrapped in an object, try to extract array
      ideas = ideas.ideas || ideas.results || ideas.items || [ideas];
      ideas = Array.isArray(ideas) ? ideas.slice(0, 5) : [ideas];
    }

    return await Promise.all(ideas.map(async (item: any) => {
      const imageUrl = await getBookImage(item.title, item.creator);

      const amazonUrl = `https://www.amazon.co.jp/gp/search?ie=UTF8&tag=hexebrbl-22&keywords=${encodeURIComponent(item.title + " " + item.creator)}&index=blended&linkCode=ur2`;

      return { ...item, imageUrl, amazonUrl };
    }));
  } catch (error) {
    console.error("Error generating ideas:", error);
    return [];
  }
}