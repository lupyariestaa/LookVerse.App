import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Award,
  Compass,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronRight,
  User,
  Activity,
  CheckCircle2,
  Heart,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import Container from "../components/common/Container";

interface MatchItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  image: string;
  salePrice: number;
  marketplace: string;
  affiliateUrl: string;
  confidenceScore: number;
  matchReason: string;
  stylingAdvice: string;
  matchBadges: string[];
}

export const SpecimenMatcher: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const sampleQueries = [
    "Lightweight technical running shoe with carbon stability fiber",
    "Casual retro vintage sneaker wrapped in premium suede",
    "Futuristic streetwear shoes with bright neon cushioning",
    "Heavy-duty waterproof backpack for tropical hiking commutes",
  ];

  const runMatcher = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setSearched(true);
    setLoadingStep(0);

    // Stagger loading messages for an amazing aesthetic feel
    const intervals = [
      setTimeout(() => setLoadingStep(1), 1000),
      setTimeout(() => setLoadingStep(2), 2200),
      setTimeout(() => setLoadingStep(3), 3500),
    ];

    try {
      const response = await fetch("/api/specimen-matcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error("API Specimen Matcher request failed");
      }

      const data = await response.json();
      setMatches(data.matches || []);
      setAnalysisSummary(data.analysisSummary || "");
    } catch (err) {
      console.error(err);
    } finally {
      intervals.forEach(clearTimeout);
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runMatcher(query);
  };

  const registerAffiliateClick = async (item: MatchItem) => {
    try {
      await fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id,
          productName: item.name,
          platform: item.marketplace,
        }),
      });
    } catch (e) {
      console.error("Failed to register affiliate click tracking telemetry", e);
    }
  };

  const getStepText = () => {
    switch (loadingStep) {
      case 0:
        return "INITIATING CURATION SCAN...";
      case 1:
        return "LOADING PRODUCT INDEX PARAMETERS...";
      case 2:
        return "RUNNING GEMINI COGNITIVE ALIGNMENT...";
      case 3:
        return "COMPUTING STYLE CONFIDENCE & EXPERT STYLING TIPS...";
      default:
        return "MAPPING FIT COORDINATES...";
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-[#0C0C0E] min-h-screen py-12 transition-colors duration-300">
      <Container>
        {/* Banner Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 text-brand-orange text-[9px] font-mono font-black uppercase tracking-widest rounded-full border border-brand-orange/20 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Gemini AI Cognitive Matching</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter uppercase italic text-brand-black dark:text-white">
            SPECIMEN MATCHER<span className="text-brand-orange">_</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-sans font-medium max-w-2xl mx-auto leading-relaxed">
            Enter physical specs, styling keywords, or brand vibes. Our custom Gemini AI intelligence will align your taste coordinates with our catalog, crafting bespoke styling profiles instantly.
          </p>
        </div>

        {/* Input Terminal Card */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/5 rounded-[24px] p-6 shadow-md transition-all">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your perfect shoe vibe (e.g., 'light running sneaker with vibrant orange detail and advanced traction')..."
                className="w-full bg-zinc-50 dark:bg-[#0A0A0C] border border-zinc-200 dark:border-white/5 px-4 py-4 pr-12 rounded-[16px] text-xs md:text-sm font-medium placeholder-zinc-400 focus:outline-none focus:border-brand-orange transition-all text-zinc-800 dark:text-white"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-orange text-white rounded-[12px] hover:bg-opacity-90 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Quick suggestions */}
            <div className="space-y-2 pt-2">
              <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Or choose an expert sample template:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(q);
                      runMatcher(q);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 hover:border-brand-orange dark:hover:border-brand-orange text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-brand-orange dark:hover:text-white rounded-[10px] transition-all cursor-pointer font-sans font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Results / Loading Area */}
        <div className="mt-12 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-16 text-center space-y-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/5 rounded-[24px]"
              >
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 border-4 border-brand-orange/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-brand-orange rounded-full animate-spin" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-orange">
                    {getStepText()}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                    LookVerse intelligence gateway executing
                  </p>
                </div>
              </motion.div>
            ) : searched && matches.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 animate-fade-in"
              >
                {/* Expert summary bar */}
                {analysisSummary && (
                  <div className="bg-brand-orange/5 dark:bg-brand-orange/10 border border-brand-orange/20 p-5 rounded-[20px] text-xs md:text-sm text-brand-black dark:text-zinc-200 leading-relaxed font-sans font-medium">
                    <span className="font-bold text-brand-orange uppercase font-mono tracking-wide block mb-1">
                      SPECIMEN RE-INDEX SUMMARY:
                    </span>
                    {analysisSummary}
                  </div>
                )}

                {/* Match cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {matches.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.15 }}
                      className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/5 rounded-[24px] overflow-hidden shadow-md flex flex-col justify-between"
                    >
                      {/* Image header with confidence overlay */}
                      <div className="relative h-56 bg-zinc-100 dark:bg-[#16161A] p-6 flex items-center justify-center border-b border-zinc-200 dark:border-white/5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full object-contain transition-transform duration-300 hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        {/* Confidence score badge */}
                        <div className="absolute top-4 left-4 bg-brand-black/95 text-white border border-brand-orange/25 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                          <span>{item.confidenceScore}% MATCH</span>
                        </div>

                        {/* Marketplace tag */}
                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/95 dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/10 rounded-full text-[9px] font-mono font-bold uppercase text-zinc-500">
                          {item.marketplace}
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-brand-orange">
                              {item.brand} // matched specimen
                            </span>
                            <h3 className="text-sm font-sans font-black text-brand-black dark:text-white line-clamp-1 uppercase">
                              {item.name}
                            </h3>
                          </div>

                          {/* Custom match badges */}
                          <div className="flex gap-1.5 flex-wrap">
                            {item.matchBadges?.map((b, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-[8px] font-mono font-black uppercase text-zinc-500 dark:text-zinc-400 rounded-md"
                              >
                                {b}
                              </span>
                            ))}
                          </div>

                          {/* AI detailed reason */}
                          <div className="space-y-1.5 bg-zinc-50 dark:bg-[#0A0A0C] border border-zinc-150 dark:border-white/5 p-3.5 rounded-[16px]">
                            <span className="text-[8.5px] font-mono font-black uppercase tracking-wide text-brand-orange block">
                              AI Alignment Context:
                            </span>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans font-medium">
                              {item.matchReason}
                            </p>
                          </div>

                          {/* Expert styling tip */}
                          <div className="space-y-1">
                            <span className="text-[8.5px] font-mono font-black uppercase tracking-wide text-zinc-400 dark:text-zinc-500 block">
                              Curation Styling Advice:
                            </span>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-400 leading-normal font-sans">
                              {item.stylingAdvice}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex gap-3">
                          <Link
                            to={`/product/${item.slug}`}
                            className="flex-1 py-2 rounded-[12px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[10px] font-mono font-black uppercase tracking-widest text-center text-zinc-700 dark:text-white transition-all flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>

                          <a
                            href={item.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => registerAffiliateClick(item)}
                            className="flex-1 py-2 rounded-[12px] bg-brand-orange hover:bg-opacity-95 text-white text-[10px] font-mono font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-orange/15"
                          >
                            <span>Redirect Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : searched && !loading ? (
              <div className="py-16 text-center text-zinc-500 font-mono text-xs">
                No matching product specimens could be parsed. Try broader keywords or adjust filters.
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
};

export default SpecimenMatcher;
