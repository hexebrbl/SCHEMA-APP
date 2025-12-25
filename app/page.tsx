'use client';

import { useState } from 'react';
import { generateIdeas } from './actions';
import { FaFilm, FaTv, FaBookOpen, FaBook, FaGamepad, FaAmazon, FaSearch } from 'react-icons/fa';

// 型定義
type Idea = {
  title: string;
  author: string;
  category: string;
  reason: string;
  tags: string[];
};

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'narrative' | 'visual'>('narrative');

  // フィルター状態
  const [filters, setFilters] = useState({
    media: 'すべて',
    era: 'すべて',
    depth: '定番'
  });

  const handleGenerate = async () => {
    if (!keyword) return;
    setLoading(true);
    setIdeas([]); // 前の結果をクリア

    try {
      const data = await generateIdeas(keyword, filters, mode);
      if (data.ideas) {
        setIdeas(data.ideas);
      }
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] text-gray-200 p-4 pb-20 font-sans selection:bg-blue-500/30">

      {/* 背景エフェクト */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8 pt-8">

        {/* ヘッダー */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <h1 className="text-3xl font-bold tracking-[0.2em] text-white">SCHEMA</h1>
          </div>
          <p className="text-xs text-gray-500 tracking-wider uppercase">AI Curation System</p>
        </div>

        {/* モード切替タブ */}
        <div className="flex bg-[#1a1d24] p-1 rounded-xl border border-white/5 relative">
           <button 
             onClick={() => setMode('narrative')}
             className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 z-10 ${mode === 'narrative' ? 'text-white bg-blue-600 shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <span className="mr-2">📖</span> NARRATIVE
           </button>
           <button 
             onClick={() => setMode('visual')}
             className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 z-10 ${mode === 'visual' ? 'text-white bg-purple-600 shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <span className="mr-2">👁</span> VISUAL
           </button>
        </div>

        {/* 検索バー */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
            placeholder={mode === 'narrative' ? "どんな物語に没入したい？ (例: 泣けるSF, どんでん返し)" : "どんな世界観を見たい？ (例: サイバーパンク, 退廃的, 夏の青空)"}
            className="w-full bg-[#1a1d24] border border-white/10 text-white text-lg rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-gray-600"
          />
        </div>

        {/* フィルター設定 (ボタン配置の修正) */}
        <div className="bg-[#15171c]/80 backdrop-blur-md rounded-xl p-6 border border-white/5 space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filters</h3>
            </div>

            {/* 媒体 (Media) */}
            <div className="space-y-3">
              <label className="text-xs text-gray-500 font-medium ml-1">媒体</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'すべて', value: 'すべて', icon: null },
                  { label: '映画・映像', value: '映画・映像', icon: <FaFilm className="mr-1.5" /> },
                  { label: 'アニメ', value: 'アニメ', icon: <FaTv className="mr-1.5" /> },
                  { label: 'マンガ', value: 'マンガ', icon: <FaBookOpen className="mr-1.5" /> },
                  { label: '書籍', value: '書籍', icon: <FaBook className="mr-1.5" /> },
                  { label: 'ゲーム', value: 'ゲーム', icon: <FaGamepad className="mr-1.5" /> },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setFilters({ ...filters, media: item.value })}
                    className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all border ${
                      filters.media === item.value
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                        : 'bg-[#1e2128] border-white/5 text-gray-400 hover:bg-[#252932]'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 年代 */}
                <div className="space-y-3">
                    <label className="text-xs text-gray-500 font-medium ml-1">年代・雰囲気</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['すべて', '古典 (~1980)', '現代 (1980~)'].map((era) => (
                        <button
                            key={era}
                            onClick={() => setFilters({ ...filters, era })}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all border ${
                            filters.era === era
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-[#1e2128] border-white/5 text-gray-400 hover:bg-[#252932]'
                            }`}
                        >
                            {era}
                        </button>
                        ))}
                    </div>
                </div>

                {/* 深度 */}
                <div className="space-y-3">
                    <label className="text-xs text-gray-500 font-medium ml-1">深度</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['定番', 'コア/カルト'].map((depth) => (
                        <button
                            key={depth}
                            onClick={() => setFilters({ ...filters, depth })}
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                            filters.depth === depth
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-[#1e2128] border-white/5 text-gray-400 hover:bg-[#252932]'
                            }`}
                        >
                            {depth}
                        </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !keyword}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               GENERATING...
             </>
          ) : (
             <>GENERATE IDEAS</>
          )}
        </button>

        {/* 結果表示エリア */}
        <div className="grid grid-cols-1 gap-4">
          {ideas.map((idea, index) => {
            // Amazon検索URLの生成（タイトルのみを使用）
            const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(idea.title)}`;

            return (
              <div key={index} className="group bg-[#15171c]/60 backdrop-blur-md rounded-xl p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit">
                        {idea.category}
                      </span>
                  </div>
                  <a 
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-[#FF9900] transition-colors p-1"
                    title="Amazonで検索"
                  >
                    <FaAmazon size={20} />
                  </a>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {idea.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{idea.author}</p>

                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {idea.reason}
                </p>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {idea.tags && idea.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-10"></div>
      </div>
    </main>
  );
}