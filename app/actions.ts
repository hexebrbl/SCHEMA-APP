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

    // ★プロンプトエンジニアリング: 文脈に応じた書き分け指示
    const prompt = `
      あなたはプロの「メディア・キュレーター」です。
      ユーザーの検索キーワード: "${query}"
      
      【フィルター条件】
      - 媒体カテゴリー: ${filters?.mediaType} (※「書籍」には小説・画集・写真集が含まれます。「映画・映像」には映画・ドラマ・MVが含まれます)
      - 年代・雰囲気: ${filters?.eraVibe}
      - 深度: ${filters?.nicheLevel}

      【選定の鉄則（重要）】
      キーワードの性質と、媒体の性質が矛盾しないように作品を選んでください。

      1. **キーワードが「物語・ストーリー」を求めている場合**
         (例: "どんでん返し", "泣ける", "ミステリー", "伏線", "結末")
         → **絶対に「画集」「写真集」「MV」「サントラ」を選ばないでください。**
         → 必ず「小説」「漫画」「映画」「ドラマ」など、明確なストーリーがあるものを選んでください。

      2. **キーワードが「雰囲気・ビジュアル」を求めている場合**
         (例: "退廃的", "サイバーパンク", "美しい", "色彩", "癒やし")
         → 「画集」「写真集」「MV」「映像美のある映画」を優先的に提案してください。

      【解説（analysis）の書き方】
      選んだ作品の「媒体」に合わせて、解説の視点を変えてください。

      - **小説・映画・漫画の場合**:
        物語の構成や、テーマの深さを解説してください。
      
      - **画集・写真集・MVの場合**:
        「あらすじ」は絶対に捏造しないでください。
        代わりに「視覚的なトーン」「色彩」「構図」「空気感」「イマジネーションの源泉としての魅力」を解説してください。

      === CRITICAL: TONE-MATCHING LOGIC (最優先事項) ===
      DETECT THE TONE OF THE INPUT WORK:
      1. Analyze if input is: Serious/Dark/Philosophical vs Pop/Light/Comedic/Cute/Kawaii
      2. Identify the "lightness level" (明るさ) and "playfulness" (ポップさ) of the input
      3. MATCH: All 5 recommended works MUST share SIMILAR TONE with the input

      STRICT REQUIREMENTS:
      - Output exactly 5 items (no more, no less)
      - Never include sequels, prequels, spin-offs, or remakes
      - Include media_type, creator, title_ja, title_en, analysis, structural_insight, match_tags
      - Use Japanese for descriptions and ALL TAGS
      - Tags (input_analysis_tags and match_tags) MUST be generated in JAPANESE only

      RESPONSE FORMAT (STRICT JSON):
      {
        "input_analysis_tags": ["日本語タグ1", "日本語タグ2", "日本語タグ3"],
        "results": [
          {
            "title_ja": "作品名",
            "title_en": "English Title",
            "creator": "author/director/artist",
            "media_type": "正確な媒体名（例: 画集、SF小説、MV）",
            "analysis": "媒体に合わせた魅力の解説（100文字程度）",
            "structural_insight": "客観的分析（日本語）",
            "match_tags": ["タグ1", "タグ2"],
            "imageUrl": null
          }
        ]
      }
    `;

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

      const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(displayTitle + " " + item.creator)}`;

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