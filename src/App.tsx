import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Share2, 
  Download, 
  Instagram, 
  Twitter, 
  MessageCircle,
  Loader2,
  Plus,
  TrendingUp,
  Hash,
  ChevronRight
} from 'lucide-react';
import { cn } from './lib/utils';
import { generateMeme } from './services/gemini';

interface Meme {
  id: string;
  url: string;
  prompt: string;
  category: string;
  timestamp: number;
}

const CATEGORIES = [
  { id: 'programming', name: 'Programming', icon: '💻', color: 'bg-blue-500' },
  { id: 'office', name: 'Office Life', icon: '🏢', color: 'bg-orange-500' },
  { id: 'relationships', name: 'Relationships', icon: '❤️', color: 'bg-pink-500' },
  { id: 'cats', name: 'Cat Memes', icon: '🐱', color: 'bg-purple-500' },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMeme, setCurrentMeme] = useState<string | null>(null);
  const [gallery, setGallery] = useState<Meme[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load gallery from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('memegen_gallery');
    if (saved) {
      try {
        setGallery(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load gallery", e);
      }
    }
  }, []);

  // Save gallery to localStorage
  useEffect(() => {
    localStorage.setItem('memegen_gallery', JSON.stringify(gallery));
  }, [gallery]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateMeme(prompt, selectedCategory);
      setCurrentMeme(imageUrl);
      
      const newMeme: Meme = {
        id: Math.random().toString(36).substring(7),
        url: imageUrl,
        prompt: prompt,
        category: selectedCategory,
        timestamp: Date.now(),
      };
      
      setGallery(prev => [newMeme, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate meme. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `meme-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (platform: string) => {
    // In a real app, this would use social APIs or the Web Share API
    if (navigator.share && currentMeme) {
      fetch(currentMeme)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "meme.png", { type: "image/png" });
          navigator.share({
            files: [file],
            title: 'My AI Meme',
            text: `Check out this meme I made with MemeGen AI! #${platform}`,
          }).catch(console.error);
        });
    } else {
      alert(`Sharing to ${platform} is coming in Week 3! For now, you can download the image.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-yellow-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Sparkles size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">MemeGen AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black/60">
            <a href="#" className="hover:text-black transition-colors">Generator</a>
            <a href="#gallery" className="hover:text-black transition-colors">Gallery</a>
            <a href="#" className="hover:text-black transition-colors">Trending</a>
          </div>
          <button className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
            Get Pro
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6"
          >
            THE MEME <span className="text-blue-600 italic">REVOLUTION</span> IS HERE.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-black/50 max-w-2xl mx-auto"
          >
            Stop searching for templates. Just describe your vibe and let AI do the heavy lifting.
          </motion.p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Controls */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Hash size={20} className="text-blue-600" />
                1. SELECT CATEGORY
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                      selectedCategory === cat.id 
                        ? "border-black bg-black text-white scale-105" 
                        : "border-black/5 bg-gray-50 hover:border-black/20"
                    )}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-600" />
                2. DESCRIBE THE VIBE
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. When the code finally works after 5 hours of debugging..."
                className="w-full h-32 p-4 rounded-2xl bg-gray-50 border border-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={cn(
                  "w-full mt-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                  isGenerating || !prompt.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/20"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    GENERATING...
                  </>
                ) : (
                  <>
                    <Sparkles />
                    GENERATE MEME
                  </>
                )}
              </button>
              {error && <p className="mt-4 text-red-500 text-sm text-center font-medium">{error}</p>}
            </div>
          </motion.div>

          {/* Right Column: Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-32"
          >
            <div className="bg-white p-4 rounded-[2rem] border border-black/5 shadow-xl aspect-square relative overflow-hidden group">
              <AnimatePresence mode="wait">
                {currentMeme ? (
                  <motion.div
                    key={currentMeme}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="w-full h-full relative"
                  >
                    <img 
                      src={currentMeme} 
                      alt="Generated Meme" 
                      className="w-full h-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => handleDownload(currentMeme)}
                        className="p-4 bg-white rounded-full hover:scale-110 transition-transform"
                      >
                        <Download size={24} />
                      </button>
                      <button 
                        onClick={() => handleShare('general')}
                        className="p-4 bg-white rounded-full hover:scale-110 transition-transform"
                      >
                        <Share2 size={24} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-black/20 gap-4">
                    <ImageIcon size={64} strokeWidth={1} />
                    <p className="font-medium">Your meme will appear here</p>
                  </div>
                )}
              </AnimatePresence>
              
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-blue-600 animate-pulse">COOKING SOMETHING FUNNY...</p>
                  </div>
                </div>
              )}
            </div>

            {currentMeme && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-wrap gap-3 justify-center"
              >
                <button 
                  onClick={() => handleShare('instagram')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  <Instagram size={18} />
                  INSTAGRAM
                </button>
                <button 
                  onClick={() => handleShare('tiktok')}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  <TrendingUp size={18} />
                  TIKTOK
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1DA1F2] text-white rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  <Twitter size={18} />
                  TWITTER
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Gallery Section */}
        <section id="gallery" className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black tracking-tighter">RECENT CREATIONS</h2>
              <p className="text-black/40 font-medium">Memes generated by you and the community</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all">
              VIEW ALL <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {gallery.map((meme) => (
                <motion.div
                  key={meme.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 bg-white"
                >
                  <img 
                    src={meme.url} 
                    alt={meme.prompt} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-white text-xs font-bold line-clamp-2 mb-2 uppercase tracking-tight">
                      {meme.prompt}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDownload(meme.url)}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-black transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => handleShare('general')}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-black transition-colors"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-full py-20 border-2 border-dashed border-black/5 rounded-[2rem] flex flex-col items-center justify-center text-black/20">
                  <Plus size={48} strokeWidth={1} />
                  <p className="font-bold mt-4 uppercase tracking-widest">No memes yet. Start creating!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-12 px-6 mt-32 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold">MemeGen AI</span>
          </div>
          <p className="text-sm text-black/40 font-medium">
            © 2026 MemeGen AI. Built with Gemini 2.5 Flash.
          </p>
          <div className="flex gap-6 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
