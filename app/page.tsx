"use client";

import { useState } from "react";
import { Search, BookOpen, Eye, Aperture, ShoppingCart, GitGraph, ImageOff, SlidersHorizontal, X } from "lucide-react";
import { generateIdeas } from "./actions";

interface FilterState {
  mediaType: string;
  eraVibe: string;
  nicheLevel: string;
  time: string;
}

const SkeletonLoader = () => (
  <div className="space-y-8 w-full">
    {/* Hero Skeleton */}
    <div className="flex flex-col md:flex-row gap-8 p-1 bg-transparent animate-pulse">
      <div className="w-full md:w-1/2 shrink-0">
        <div className="aspect-[3/4] bg-gray-800 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)]"></div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
        <div className="h-8 bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
        <div className="space-y-2 mt-6">
          <div className="h-3 bg-gray-800 rounded w-full"></div>
          <div className="h-3 bg-gray-800 rounded w-5/6"></div>
        </div>
      </div>
    </div>
    {/* Grid Skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 animate-pulse">
          <div className="mb-4 aspect-[3/4] bg-gray-800 rounded-sm"></div>
          <div className="h-4 bg-gray-800 rounded w-1/4 mb-3"></div>
          <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
          <div className="space-y-2 flex-1 mb-4">
            <div className="h-3 bg-gray-800 rounded w-full"></div>
            <div className="h-3 bg-gray-800 rounded w-5/6"></div>
          </div>
          <div className="h-8 bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function Home() {
  const [mode, setMode] = useState<"narrative" | "visual">("narrative");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    mediaType: "All",
    eraVibe: "All",
    nicheLevel: "Major",
    time: "Standard(Movie/Book)",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setResults(null);
    try {
      const data = await generateIdeas(mode, query, filters);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const inputAnalysisTags = results?.input_analysis_tags || [];
  const resultItems = results?.results || [];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 relative overflow-y-auto bg-[#050505] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-4xl space-y-8 mt-20 mb-20">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 border border-gray-800 rounded-full bg-[#121212]">
            <Aperture className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 font-mono italic">SCHEMA</h1>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#121212] border border-gray-800 rounded-lg">
            <button onClick={() => setMode("narrative")} className={`flex items-center justify-center space-x-2 py-3 text-sm font-medium rounded-md transition-all ${mode === "narrative" ? "bg-gray-800 text-white shadow-xl" : "text-gray-500"}`}><BookOpen className="w-4 h-4" /><span>NARRATIVE</span></button>
            <button onClick={() => setMode("visual")} className={`flex items-center justify-center space-x-2 py-3 text-sm font-medium rounded-md transition-all ${mode === "visual" ? "bg-gray-800 text-white shadow-xl" : "text-gray-500"}`}><Eye className="w-4 h-4" /><span>VISUAL</span></button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch}>
            <div className="relative flex items-center bg-[#0a0a0a] border border-gray-800 rounded-xl p-2 shadow-2xl group hover:border-blue-500/50 transition-all">
              <Search className="w-6 h-6 text-gray-500 ml-3" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="作品名、概念、ヴァイブを入力... (例: AKIRA, Cyberpunk, 孤独)" style={{ color: 'white', backgroundColor: 'transparent' }} className="w-full border-none text-base px-4 py-3 focus:outline-none placeholder-gray-600" />
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="mr-3 p-2 text-gray-500 hover:text-blue-400 transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Modal */}
            {showFilters && (
              <div className="absolute top-16 right-0 w-80 bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 shadow-2xl z-50 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-100 uppercase tracking-widest">FILTERS</h3>
                  <button type="button" onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase text-gray-500 tracking-wider">Media Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["All", "Movie", "Book", "Art/Photo", "History"].map((opt) => (
                      <button key={opt} type="button" onClick={() => setFilters({...filters, mediaType: opt})} className={`py-2 px-3 rounded text-xs font-semibold transition-all ${filters.mediaType === opt ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 border border-gray-800"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase text-gray-500 tracking-wider">Era/Vibe</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["All", "Classic(<1980)", "Modern(1980-2010)", "Current(2010+)"].map((opt) => (
                      <button key={opt} type="button" onClick={() => setFilters({...filters, eraVibe: opt})} className={`py-2 px-3 rounded text-xs font-semibold transition-all ${filters.eraVibe === opt ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 border border-gray-800"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase text-gray-500 tracking-wider">Niche Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Major", "Deep(Maniac)"].map((opt) => (
                      <button key={opt} type="button" onClick={() => setFilters({...filters, nicheLevel: opt})} className={`py-2 px-3 rounded text-xs font-semibold transition-all ${filters.nicheLevel === opt ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 border border-gray-800"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase text-gray-500 tracking-wider">Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Quick(Music/Short)", "Standard(Movie/Book)", "Epic(Series)"].map((opt) => (
                      <button key={opt} type="button" onClick={() => setFilters({...filters, time: opt})} className={`py-2 px-3 rounded text-xs font-semibold transition-all ${filters.time === opt ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 border border-gray-800"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {/* Loading State */}
          {isSearching && (
            <div className="space-y-4">
              <div className="text-center py-6 text-blue-500 font-mono tracking-widest uppercase text-xs">
                <div className="inline-flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  Architecting Results...
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
              <SkeletonLoader />
            </div>
          )}

          {/* Analysis Tags Section */}
          {!isSearching && inputAnalysisTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-start p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg animate-in fade-in duration-500">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest pt-1">INPUT ANALYSIS:</span>
              <div className="flex flex-wrap gap-2">
                {inputAnalysisTags.map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/40">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {!isSearching && resultItems.length > 0 && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-8">
              {/* Hero Card (1st Result) - 50% Image Layout */}
              {resultItems[0] && (
                <div className="flex flex-col md:flex-row gap-8 p-6 bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 rounded-xl group">
                  {/* Image - 50% width on desktop */}
                  <div className="w-full md:w-1/2 shrink-0">
                    <div className="aspect-[3/4] bg-gray-900 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-gray-800 relative">
                      {resultItems[0].imageUrl ? (
                        <img src={resultItems[0].imageUrl} alt={resultItems[0].title_ja} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-black"><ImageOff className="w-5 h-5 mb-1" /><span className="text-[8px] font-mono">NO VISUAL</span></div>
                      )}
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
                    </div>
                  </div>

                  {/* Info - 50% width on desktop */}
                  <div className="flex-1 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30 uppercase tracking-widest inline-block">{resultItems[0].media_type}</span>

                      {/* Japanese Title (Large) */}
                      <h2 className="text-3xl font-bold text-white leading-tight">{resultItems[0].title_ja}</h2>

                      {/* English Title (Small) */}
                      {resultItems[0].title_en && (
                        <p className="text-sm text-gray-500 font-light italic">{resultItems[0].title_en}</p>
                      )}

                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">{resultItems[0].creator}</p>

                      {/* Analysis */}
                      <p className="text-base text-gray-300 leading-relaxed font-light">{resultItems[0].analysis}</p>

                      {/* Match Tags */}
                      {resultItems[0].match_tags && resultItems[0].match_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {resultItems[0].match_tags.map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs font-semibold border border-gray-700">
                              &lt;{tag}&gt;
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex gap-4">
                        <GitGraph className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] font-mono text-blue-600 uppercase tracking-[0.3em] block font-bold">Focus Point</span>
                          <p className="text-sm text-gray-300 italic leading-relaxed">{resultItems[0].structural_insight}</p>
                        </div>
                      </div>
                      <a href={resultItems[0].amazonUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30 px-4 py-2 rounded-full text-xs font-bold hover:bg-[#FF9900] hover:text-black transition-all w-full">
                        <ShoppingCart className="w-4 h-4" /> 詳細をみる
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Cards (2-5 Results) - Flexible Height */}
              {resultItems.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resultItems.slice(1, 5).map((item: any, i: number) => (
                    <div key={i + 1} className="flex flex-col bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-xl transition-all group min-h-min">
                      {/* Image */}
                      <div className="mb-4">
                        <div className="aspect-[3/4] bg-gray-900 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden border border-gray-800 relative">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title_ja} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-black"><ImageOff className="w-4 h-4 mb-1" /><span className="text-[7px] font-mono">NO VISUAL</span></div>
                          )}
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <span className="text-[9px] font-bold text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest w-fit mb-3">{item.media_type}</span>

                      {/* Japanese Title (Large) */}
                      <h3 className="text-xl font-bold text-white mb-1 leading-snug">{item.title_ja}</h3>

                      {/* English Title (Small) */}
                      {item.title_en && (
                        <p className="text-xs text-gray-500 font-light italic mb-2">{item.title_en}</p>
                      )}

                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-3">{item.creator}</p>

                      {/* Description - Full Text (No line-clamp) */}
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">{item.analysis}</p>

                      {/* Match Tags */}
                      {item.match_tags && item.match_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.match_tags.map((tag: string, j: number) => (
                            <span key={j} className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-[10px] font-semibold border border-gray-700">
                              &lt;{tag}&gt;
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
                      <a href={item.amazonUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 bg-blue-600/10 text-blue-400 border border-blue-600/30 px-3 py-2 rounded text-xs font-bold hover:bg-blue-600 hover:text-white transition-all mt-auto">
                        <ShoppingCart className="w-3 h-3" /> 詳細をみる
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
