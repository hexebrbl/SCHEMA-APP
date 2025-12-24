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
- Include media_type, creator, title_ja, title_en, analysis, structural_insight, match_tags
- Use Japanese for descriptions, English for labels
${filterConstraints}

RESPONSE FORMAT (STRICT JSON):
{
  "input_analysis_tags": ["Tag1", "Tag2", "Tag3"],
  "results": [
    {
      "title_ja": "日本語タイトル",
      "title_en": "English Title",
      "creator": "author/director/artist",
      "media_type": "MOVIE|BOOK|ART/PHOTO|HISTORY|MUSIC|DESIGN",
      "analysis": "Japanese explanation of why this work relates to the input",
      "structural_insight": "Objective analysis in Japanese",
      "match_tags": ["SharedElement1", "SharedElement2"],
      "imageUrl": null
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON response
    const response = JSON.parse(text);
    
    // Extract data from new format
    const inputAnalysisTags = response.input_analysis_tags || [];
    let ideas = response.results || [];
    
    // Force exactly 5 items
    ideas = ideas.slice(0, 5);

    const enrichedResults = await Promise.all(ideas.map(async (item: any) => {
      // Use title_ja first, fallback to title
      const displayTitle = item.title_ja || item.title || "";
      const originalTitle = item.title_en || item.title_en || "";
      
      const imageUrl = await getBookImage(
        displayTitle || originalTitle,
        item.creator
      );

      const amazonUrl = `https://www.amazon.co.jp/gp/search?ie=UTF8&tag=hexebrbl-22&keywords=${encodeURIComponent(displayTitle + " " + item.creator)}&index=blended&linkCode=ur2`;

      return {
        title_ja: item.title_ja || item.title || "",
        title_en: item.title_en || "",
        creator: item.creator || "",
        media_type: item.media_type || "",
        analysis: item.analysis || "",
        structural_insight: item.structural_insight || "",
        match_tags: item.match_tags || [],
        imageUrl,
        amazonUrl,
      };
    }));

    return {
      input_analysis_tags: inputAnalysisTags,
      results: enrichedResults,
    };
  } catch (error) {
    console.error("Error generating ideas:", error);
    return {
      input_analysis_tags: [],
      results: [],
    };
  }
}