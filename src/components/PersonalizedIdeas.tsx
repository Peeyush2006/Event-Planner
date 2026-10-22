import React, { useState } from 'react';
import { 
  Sparkles, 
  Palette, 
  Utensils, 
  PartyPopper, 
  Check, 
  Copy, 
  GlassWater, 
  Tag, 
  Lightbulb 
} from 'lucide-react';
import { PersonalizedIdea, ColorSwatch } from '../types/event';

interface PersonalizedIdeasProps {
  ideas: PersonalizedIdea[];
  eventTitle: string;
}

export const PersonalizedIdeas: React.FC<PersonalizedIdeasProps> = ({
  ideas,
  eventTitle,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const filteredIdeas = activeCategory === 'all'
    ? ideas
    : ideas.filter((i) => i.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Curated Themes, Menus & Creative Concepts
          </h2>
          <p className="text-xs text-slate-500">
            AI-designed aesthetic palettes, interactive guest experiences, and signature menus.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'theme', 'menu', 'activity', 'decor', 'music'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors uppercase tracking-wider text-[11px] shrink-0 ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {idea.category}
                </span>

                {idea.estimatedCostRange && (
                  <span className="text-xs text-slate-500 font-medium">
                    {idea.estimatedCostRange}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{idea.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {idea.description}
                </p>
              </div>

              {/* Color Swatches if theme */}
              {idea.colorPalette && idea.colorPalette.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Palette className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Curated Color Palette (Click hex to copy)</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {idea.colorPalette.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(color.hex)}
                        className="group flex flex-col items-center cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
                        title={`Copy ${color.hex}`}
                      >
                        <div
                          className="w-full h-9 rounded-md shadow-inner border border-black/10 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[10px] font-mono text-slate-600 mt-1 uppercase">
                          {copiedHex === color.hex ? '✓ Copied' : color.hex}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate max-w-full">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Specific Items */}
              {idea.suggestedItems && idea.suggestedItems.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Key Highlights & Recipes:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {idea.suggestedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tags Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              {idea.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
