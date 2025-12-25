'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function generateIdeas(
  keyword: string,
  filters: any,
  mode: 'narrative' | 'visual' // モードを受け取るように明記
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // モードに応じた厳格なルール定義
    let modeInstruction = "";
    if (mode === 'narrative') {
      modeInstruction = `
        【重要：Narrativeモードの絶対ルール】
        ユーザーは「物語（ストーリー）」を求めています。
        1. **小説、映画、ドラマ、アニメ、漫画、ゲーム（ストーリー重視）** の中から選んでください。
        2. **「画集」「写真集」「音楽」「サントラ」は絶対に選ばないでください（禁止）。**
        3. 解説は「あらすじ」「プロットの面白さ」「テーマ性」に焦点を当ててください。
      `;
    } else {
      modeInstruction = `
        【重要：Visualモードの絶対ルール】
        ユーザーは「視覚的な刺激・インスピレーション」を求めています。
        1. **画集、写真集、映画（映像美）、アニメ（作画）、MV、ゲーム（グラフィック）** を優先してください。
        2. 解説は「色彩」「構図」「光の演出」「アートスタイル」に焦点を当ててください。
      `;
    }

    const prompt = `
      あなたはプロの「メディア・キュレーター」です。
      以下のリクエストに合わせて、最適な作品を3つ提案してください。

      【検索条件】
      - キーワード: "${keyword}"
      - モード: ${mode.toUpperCase()} (重要！)
      - 媒体フィルター: ${filters.media}
      - 年代: ${filters.era}
      - 深度: ${filters.depth}

      ${modeInstruction}

      【出力データのルール（厳守）】
      1. **title**: 作品名のみを書いてください。「(映画)」「(Artist)」などの補足は**絶対に**書かないでください。Amazon検索が失敗します。
         - OK例: "AKIRA", "Yunomi"
         - NG例: "AKIRA (映画)", "Yunomi (Artist)"
      2. **author**: 作者・監督・アーティスト名を書いてください。
      3. **category**: 具体的な媒体名（例: SF小説、画集、テクノ音楽）。
      4. **reason**: モード（Narrative/Visual）に合わせた魅力の解説（日本語で100文字程度）。

      【出力フォーマット】
      以下のJSON形式のみを出力してください（Markdown記法は不要）：
      {
        "ideas": [
          {
            "title": "作品名（補足なし）",
            "author": "作者名",
            "category": "媒体名",
            "reason": "解説文",
            "tags": ["#タグ1", "#タグ2", "#タグ3"]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSON抽出処理
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI output format error");
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Generative AI Error:', error);
    return { error: 'Failed to generate ideas' };
  }
}