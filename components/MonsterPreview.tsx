
import React from 'react';
import { MonsterData, ELEMENT_TYPES } from '../types';
import { 
  Flame, Droplets, Zap, Leaf, Snowflake, Swords, Skull, Mountain, Wind, 
  Brain, Bug, Gem, Ghost, Crown, Shield, Moon, Star, Circle,
  Crosshair, EyeOff, HelpCircle, AlertTriangle, Ruler, Clock, Timer,
  Footprints, Activity
} from 'lucide-react';

interface MonsterPreviewProps {
  data: MonsterData;
  calculatedHit: string;
  calculatedDT: string;
  typeTexture?: string;
  uiOpacity: number;
  headerOpacity: number; // Renamed from frameOpacity
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType, color: string, border: string }> = {
  normal: { icon: Circle, color: '#a8a29e', border: '#78716c' },
  fire: { icon: Flame, color: '#ea580c', border: '#9a3412' },
  water: { icon: Droplets, color: '#2563eb', border: '#1e40af' },
  electric: { icon: Zap, color: '#ca8a04', border: '#854d0e' },
  grass: { icon: Leaf, color: '#16a34a', border: '#14532d' },
  ice: { icon: Snowflake, color: '#06b6d4', border: '#0891b2' },
  fighting: { icon: Swords, color: '#b91c1c', border: '#7f1d1d' },
  poison: { icon: Skull, color: '#7e22ce', border: '#581c87' },
  ground: { icon: Mountain, color: '#a16207', border: '#713f12' },
  flying: { icon: Wind, color: '#6366f1', border: '#4338ca' },
  psychic: { icon: Brain, color: '#db2777', border: '#9d174d' },
  bug: { icon: Bug, color: '#65a30d', border: '#3f6212' },
  rock: { icon: Gem, color: '#57534e', border: '#292524' },
  ghost: { icon: Ghost, color: '#7c3aed', border: '#5b21b6' },
  dragon: { icon: Crown, color: '#4f46e5', border: '#3730a3' },
  steel: { icon: Shield, color: '#64748b', border: '#334155' },
  dark: { icon: Moon, color: '#171717', border: '#000000' },
  fairy: { icon: Star, color: '#e11d48', border: '#9f1239' },
};

const AFFINITY_STYLES = {
  vulnerabilities: { label: 'VULNERÁVEL', color: '#ef4444' },
  resistances: { label: 'RESISTENTE', color: '#3b82f6' },
  immunities: { label: 'IMUNE', color: '#94a3b8' },
};

// Helper to convert hex to rgba for transparency
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const MonsterPreview: React.FC<MonsterPreviewProps> = ({ data, calculatedDT, typeTexture, uiOpacity, headerOpacity }) => {
  const typeKey1 = data.type.toLowerCase();
  const config1 = TYPE_CONFIG[typeKey1] || TYPE_CONFIG.normal;
  const typeObj1 = ELEMENT_TYPES.find(t => t.id === data.type);
  const TypeIcon1 = config1.icon;

  // Secondary Type Logic
  const hasSecondary = !!data.secondaryType;
  const typeKey2 = data.secondaryType?.toLowerCase() || 'normal';
  const config2 = TYPE_CONFIG[typeKey2];
  const typeObj2 = data.secondaryType ? ELEMENT_TYPES.find(t => t.id === data.secondaryType) : null;
  const TypeIcon2 = config2?.icon;

  // Background & Border Logic for Header
  let headerBackground = config1.color;
  let borderColor = config1.border;
  
  if (hasSecondary && config2) {
    // Softer gradient for header
    headerBackground = `linear-gradient(135deg, ${hexToRgba(config1.color, 0.9)} 0%, ${hexToRgba(config2.color, 0.9)} 100%)`;
    borderColor = config1.border; 
  } else {
     // Single type base color
     headerBackground = config1.color;
  }

  // Apply opacity to header background
  if (!hasSecondary) {
    headerBackground = hexToRgba(config1.color, headerOpacity / 100);
  } else {
    // For gradients, we applied it in the rgba string above, but let's ensure it respects the slider
    headerBackground = `linear-gradient(135deg, ${hexToRgba(config1.color, headerOpacity/100)} 0%, ${hexToRgba(config2.color, headerOpacity/100)} 100%)`;
  }

  // Texture Override for Header
  const headerStyle: React.CSSProperties = {
    background: headerBackground,
    borderBottom: `4px solid ${borderColor}`
  };

  if (typeTexture && !hasSecondary) {
    headerStyle.backgroundImage = `url(${typeTexture})`;
    headerStyle.backgroundSize = 'cover';
    headerStyle.backgroundPosition = 'center';
  }

  // Dynamic style for opacity based on slider
  const dynamicBgStyle = {
    backgroundColor: `rgba(15, 23, 42, ${uiOpacity / 100})`, // Slate 900 with dynamic alpha
  };

  // Dynamic style for inner boxes (Stats, Attributes, etc) - "Attribute Table Style"
  const dynamicBoxStyle = {
    backgroundColor: `rgba(15, 23, 42, ${Math.min((uiOpacity + 10) / 100, 0.9)})`, 
    borderColor: 'rgba(71, 85, 105, 0.4)',
    borderWidth: '1px',
    borderStyle: 'solid',
    backdropFilter: 'blur(4px)',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  const renderAffinityIcons = (list: string[], type: 'vulnerabilities' | 'resistances' | 'immunities') => {
      if (list.length === 0) return null;
      const style = AFFINITY_STYLES[type];
      
      return (
          <div className="mb-2 flex flex-col items-center w-full">
              <span className="text-[7px] font-bold text-white uppercase mb-1 tracking-wider">{style.label}</span>
              <div className="grid grid-cols-2 gap-1 w-full">
                  {list.map(typeId => {
                      const tConfig = TYPE_CONFIG[typeId] || TYPE_CONFIG.normal;
                      const TIcon = tConfig.icon;
                      const tLabel = ELEMENT_TYPES.find(t => t.id === typeId)?.label || typeId;
                      
                      return (
                          <div key={typeId} className="flex items-center gap-1 rounded px-1 py-0.5 justify-center" style={dynamicBoxStyle}>
                              <TIcon size={8} style={{ color: tConfig.color }} />
                              <span className="text-[7px] font-bold text-slate-300 uppercase tracking-wide">{tLabel.substring(0,3)}</span>
                          </div>
                      )
                  })}
              </div>
          </div>
      )
  };

  const renderHeaderBadge = (label: string, value: string, colorClass: string) => (
    <div className="relative z-10 min-w-[32px] h-8 flex flex-col items-center justify-center shadow-lg rounded" style={dynamicBoxStyle}>
        <span className="text-[6px] font-bold text-white uppercase leading-none mt-0.5">{label}</span>
        <span className={`text-sm font-bold leading-none mb-0.5 ${colorClass}`}>{value}</span>
    </div>
  );

  const offsetX = data.imageOffsetX ?? 50;
  const offsetY = data.imageOffsetY ?? 50;

  return (
    <div 
      id="preview-card-monster"
      className="relative flex flex-col shadow-2xl overflow-hidden box-border"
      style={{ 
        aspectRatio: '63/88', 
        width: '100%', 
        maxWidth: '400px',
        borderRadius: '0px',
        fontFamily: "'Nunito', sans-serif",
        backgroundColor: '#0f172a',
        border: `10px solid ${borderColor}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
      }}
    >
      {/* SHINY EFFECT OVERLAY (Sparkles) */}
       {data.isShiny && (
         <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay" style={{
            background: `radial-gradient(circle, rgba(255,255,255,0.6) 10%, transparent 20%) 0 0,
                        radial-gradient(circle, rgba(255,255,255,0.6) 10%, transparent 20%) 50px 50px`,
            backgroundSize: '100px 100px',
            opacity: 0.5
         }} />
       )}

       {/* FOIL EFFECT OVERLAY (Rainbow) */}
       {data.isFoil && (
         <div className="absolute inset-0 pointer-events-none z-50 mix-blend-color-dodge" style={{
            background: `
                linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.4) 30%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.4) 70%, transparent 80%),
                linear-gradient(125deg, rgba(255, 0, 0, 0.4) 0%, rgba(0, 255, 0, 0.4) 33%, rgba(0, 0, 255, 0.4) 66%, rgba(255, 0, 255, 0.4) 100%)
            `,
            backgroundSize: '200% 200%',
            opacity: 0.6
         }} />
       )}

      {/* FULL ART BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full z-0 bg-black">
         {data.imageUrl ? (
            <img 
                src={data.imageUrl} 
                alt="Monster Art" 
                className="w-full h-full object-cover opacity-100"
                style={{ 
                  objectPosition: `${offsetX}% ${offsetY}%`,
                  transform: `scale(${data.imageScale / 100})`,
                  transformOrigin: 'center'
                }}
            />
         ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50">
                <TypeIcon1 size={48} className="text-slate-600 mb-2" />
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sem Imagem</span>
            </div>
         )}
      </div>

      {/* 1. Header */}
      <div 
        className="relative z-10 h-[12%] min-h-[45px] flex items-center px-2 gap-2 overflow-hidden shrink-0"
        style={headerStyle}
      >
        {/* Dual Icons Container */}
        <div className="relative flex items-center gap-1 shrink-0">
             {/* Primary Icon */}
            <div className="relative z-20 w-8 h-8 rounded bg-slate-900 flex items-center justify-center shadow-lg border-2 border-white/20 text-white">
                <TypeIcon1 size={18} strokeWidth={2.5} />
            </div>
            
            {/* Secondary Icon */}
            {hasSecondary && TypeIcon2 && (
                <div className="relative z-10 w-8 h-8 rounded bg-slate-900 flex items-center justify-center shadow-lg border-2 border-white/20 text-white">
                    <TypeIcon2 size={18} strokeWidth={2.5} />
                </div>
            )}
        </div>

        {/* Name */}
        <h2 className="relative z-10 flex-1 font-rpg font-bold text-white text-lg uppercase tracking-wide drop-shadow-md truncate leading-none pt-1 text-shadow">
            {data.name || "Monstro"}
        </h2>

        {/* Header Badges: HP, PD, D - New Style */}
        <div className="flex gap-1 shrink-0">
            {renderHeaderBadge('HP', data.vd, 'text-green-400')}
            {renderHeaderBadge('PD', data.pd, 'text-blue-400')}
            {renderHeaderBadge('D', data.hitDie, 'text-red-400')}
        </div>
      </div>

      {/* 2. Image Spacer (Transparent) */}
      <div className="relative w-full shrink-0 z-0 pointer-events-none" style={{ height: '42%' }}>
         {/* Floating Stats Container (Defense & Speed) - Attribute Style */}
         <div className="absolute top-4 right-2 flex flex-col gap-2 z-20">
            
            {/* Defense Box */}
            <div className="w-[80px] flex flex-col items-center shadow-lg overflow-hidden" style={dynamicBoxStyle}>
                <div className="w-full py-0.5 border-b border-slate-600/30">
                    <span className="text-[7px] uppercase font-bold text-white flex items-center justify-center gap-1">
                        <Shield size={8} /> DEFESA
                    </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-white py-1 text-center leading-tight w-full px-1">
                    {calculatedDT.replace(/\s/g, '')}
                </span>
            </div>

            {/* Speed Box */}
            <div className="w-[80px] flex flex-col items-center shadow-lg overflow-hidden" style={dynamicBoxStyle}>
                 <div className="w-full py-0.5 border-b border-slate-600/30">
                    <span className="text-[7px] uppercase font-bold text-white flex items-center justify-center gap-1">
                        <Footprints size={8} /> VELOCIDADE
                    </span>
                 </div>
                 <div className="py-1 px-1 flex flex-col gap-0.5 w-full">
                    {data.speeds.length > 0 ? (
                        data.speeds.map((s, i) => (
                            <span key={i} className="font-mono text-[8px] font-bold text-white text-center leading-tight truncate">
                                {s}
                            </span>
                        ))
                    ) : (
                        <span className="text-[8px] text-slate-500 text-center">-</span>
                    )}
                 </div>
            </div>
         </div>
      </div>

      {/* 3. Body */}
      <div 
        className="relative z-10 flex-1 backdrop-blur-sm p-2.5 flex gap-2 overflow-hidden border-t border-slate-700/30 -mt-[30px]"
        style={dynamicBgStyle}
      >
        
        {/* Left Column: Attributes & Passives */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
             
             {/* Attributes Grid (6 Cols - 1 Title + 5 Stats) */}
             <div className="shrink-0 p-1.5 shadow-lg" style={{ ...dynamicBoxStyle, backgroundColor: `rgba(30, 41, 59, ${uiOpacity/150})` }}>
                 <h3 className="text-[8px] font-bold text-white uppercase text-center mb-1.5 tracking-widest border-b border-slate-700/50 pb-0.5">ATRIBUTOS</h3>
                 
                 {/* Header Row */}
                 <div className="grid grid-cols-6 gap-1 mb-1 text-center">
                     <span className="text-[8px] font-extrabold text-white uppercase">LVL</span>
                     {['FOR', 'AGI', 'INT', 'PRE', 'VIG'].map(attr => (
                         <span key={attr} className="text-[8px] font-extrabold text-white uppercase">{attr}</span>
                     ))}
                 </div>
                 
                 {/* Values Row (Aggregated Column) */}
                 <div className="grid grid-cols-6 gap-1">
                     
                     {/* Column 1: Titles */}
                     <div className="flex flex-col gap-0.5 items-center">
                        {data.attributes.map((row, i) => (
                            <div key={`title-${i}`} className="w-full h-4 flex items-center justify-center text-[7px] font-bold text-white truncate leading-none px-0.5">
                                {row.title || "-"}
                            </div>
                        ))}
                     </div>

                     {/* Columns 2-6: Stats */}
                     {['FOR', 'AGI', 'INT', 'PRE', 'VIG'].map(attr => (
                         <div key={attr} className="flex flex-col gap-0.5 items-center">
                            {data.attributes.map((row, i) => (
                                <div key={i} className="w-4 h-4 flex items-center justify-center rounded text-[9px] font-bold text-slate-200 shadow-sm" style={dynamicBoxStyle}>
                                    {row[attr as keyof typeof row] || 0}
                                </div>
                            ))}
                         </div>
                     ))}
                 </div>
             </div>

             {/* Passives List */}
             <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                 {data.passives.map((p, i) => (
                     <div key={i} className="mb-2 last:mb-0 text-[10px] leading-tight text-slate-300 text-justify">
                         <span className="font-bold text-white uppercase">{p.title}:</span> {p.description}
                     </div>
                 ))}
                 {data.passives.length === 0 && <span className="text-[10px] text-slate-500 italic">Sem passivas.</span>}
             </div>

        </div>

        {/* Right Column: Affinities (Vuln/Res/Imm) */}
        <div className="w-[25%] shrink-0 flex flex-col gap-1 overflow-y-auto pr-0.5">
            {renderAffinityIcons(data.vulnerabilities, 'vulnerabilities')}
            {renderAffinityIcons(data.resistances, 'resistances')}
            {renderAffinityIcons(data.immunities, 'immunities')}
        </div>

      </div>

      {/* 4. Footer Moves List */}
      <div 
        className="relative z-10 backdrop-blur-sm border-t border-slate-700/50 shrink-0 min-h-[40px] p-2 overflow-hidden flex-grow-0"
        style={{ 
            ...dynamicBgStyle,
        }}
      >
          <div className="w-full h-full columns-2 gap-4 space-y-1">
              {data.moves.map((m, i) => (
                  <div key={i} className="break-inside-avoid text-[8px] leading-tight font-medium border-b border-slate-800/50 pb-0.5 mb-0.5">
                      <span className="font-bold text-white uppercase mr-1">{m.title}:</span>
                      <span className="text-slate-200">{m.content}</span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
