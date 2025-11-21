
import React from 'react';
import { MoveData, ELEMENT_TYPES } from '../types';
import { 
  Flame, Droplets, Zap, Leaf, Snowflake, Swords, Skull, Mountain, Wind, 
  Brain, Bug, Gem, Ghost, Crown, Shield, Moon, Star, Circle,
  Crosshair, EyeOff, HelpCircle, AlertTriangle, Ruler, Clock, Timer,
  Footprints
} from 'lucide-react';

interface CardPreviewProps {
  data: MoveData;
  calculatedHit: string;
  calculatedDT: string;
  typeTexture?: string;
  uiOpacity?: number;
  headerOpacity?: number;
}

// Configuration for specific elemental styles
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

const CONDITION_ICONS: Record<string, { icon: React.ElementType, color: string }> = {
  'Queimado': { icon: Flame, color: '#fb923c' },
  'Congelado': { icon: Snowflake, color: '#22d3ee' },
  'Paralisado': { icon: Zap, color: '#facc15' },
  'Envenenado': { icon: Skull, color: '#d8b4fe' },
  'Dormindo': { icon: Moon, color: '#cbd5e1' },
  'Confuso': { icon: HelpCircle, color: '#f472b6' },
  'Cego': { icon: EyeOff, color: '#94a3b8' },
  'Amedrontado': { icon: Ghost, color: '#c084fc' },
};

const STAT_STYLES: Record<string, { color: string }> = {
  FOR: { color: '#fca5a5' },
  AGI: { color: '#86efac' },
  INT: { color: '#93c5fd' },
  PRE: { color: '#d8b4fe' },
  VIG: { color: '#fde047' },
  ATR: { color: '#e2e8f0' },
};

const ACTION_ICONS: Record<string, React.ElementType> = {
    'Ação Padrão': Swords,
    'Ação de Movimento': Footprints,
    'Ação Livre': Zap,
    'Reação': AlertTriangle,
    'Ação Completa': Timer
};

const ATTRIBUTE_ORDER = ['FOR', 'AGI', 'INT', 'PRE', 'VIG', 'ATR'];

// Helper to convert hex to rgba for transparency
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const CardPreview: React.FC<CardPreviewProps> = ({ 
  data, calculatedHit, calculatedDT, typeTexture, 
  uiOpacity = 90, headerOpacity = 100 
}) => {
  const typeKey = data.type.toLowerCase();
  const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.normal;
  const typeObj = ELEMENT_TYPES.find(t => t.id === data.type) || ELEMENT_TYPES[0];
  const TypeIcon = config.icon;

  const suffix = data.hasScaling && data.addAtrToScaling ? " + ATR" : "";
  
  const ActionTypeIcon = ACTION_ICONS[data.actionType] || Circle;
  const actionLabel = data.actionType.replace('Ação ', '');

  // Header Background Logic
  const headerBackground = hexToRgba(config.color, headerOpacity / 100);
  const headerStyle: React.CSSProperties = {
    backgroundColor: headerBackground,
    borderBottom: `4px solid ${config.border}`
  };

  if (typeTexture) {
    headerStyle.backgroundImage = `url(${typeTexture})`;
    headerStyle.backgroundSize = 'cover';
    headerStyle.backgroundPosition = 'center';
  }

  // Styles for containers (Attribute Table Style)
  const dynamicBoxStyle = {
    backgroundColor: `rgba(15, 23, 42, ${Math.min((uiOpacity + 10) / 100, 0.9)})`, 
    borderColor: 'rgba(71, 85, 105, 0.4)',
    borderWidth: '1px',
    borderStyle: 'solid',
    backdropFilter: 'blur(4px)',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  const dynamicBgStyle = {
    backgroundColor: `rgba(15, 23, 42, ${uiOpacity / 100})`,
    backdropFilter: 'blur(2px)'
  };

  const imageScale = data.imageScale || 100;

  return (
    <div 
      id="preview-card"
      className="relative flex flex-col shadow-2xl overflow-hidden box-border"
      style={{ 
        aspectRatio: '63/88', 
        width: '100%', 
        maxWidth: '400px', 
        borderRadius: '0px',
        fontFamily: "'Nunito', sans-serif",
        backgroundColor: '#0f172a',
        border: `10px solid ${config.border}`,
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
                alt="Card Art" 
                className="w-full h-full object-cover opacity-100"
                style={{ 
                  objectPosition: `center ${data.imageOffsetY || 50}%`,
                  transform: `scale(${imageScale / 100})`,
                  transformOrigin: 'center'
                }}
            />
         ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50">
                <TypeIcon size={48} className="text-slate-600 mb-2" />
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sem Imagem</span>
            </div>
         )}
      </div>

      {/* 1. Header */}
      <div 
        className="relative z-10 h-[12%] min-h-[45px] flex items-center px-3 gap-2 overflow-hidden shrink-0"
        style={headerStyle}
      >
        {/* Type Icon */}
        <div className="relative z-10 w-8 h-8 rounded bg-slate-900 flex items-center justify-center shadow-lg border-2 border-white/20 text-white shrink-0">
          <TypeIcon size={18} strokeWidth={2.5} />
        </div>

        {/* Name */}
        <h2 className="relative z-10 flex-1 font-rpg font-bold text-white text-lg uppercase tracking-wide drop-shadow-md truncate leading-none pt-1">
            {data.name || "Nome"}
        </h2>

        {/* PD Badge */}
        <div className="relative z-10 w-7 h-8 flex flex-col items-center justify-center shadow-lg rounded shrink-0" style={dynamicBoxStyle}>
            <span className="text-[6px] font-bold uppercase leading-none mt-0.5 text-white">PD</span>
            <span className="text-sm font-bold leading-none text-blue-400 mb-0.5">{data.pd}</span>
        </div>
      </div>

      {/* 2. Image Spacer (Transparent to show art) */}
      <div className="relative w-full shrink-0 pointer-events-none z-0" style={{ height: '42%' }}>
        {/* Info Bar Overlay - Bottom of Image Area */}
        <div 
          className="absolute bottom-0 left-0 w-full flex items-center justify-center px-3 border-t border-slate-700/50 pointer-events-auto z-20"
          style={{ 
              height: '30px',
              backgroundColor: `rgba(15, 23, 42, ${uiOpacity/100})`,
              backdropFilter: 'blur(2px)'
          }}
        >
            {/* Type Name REMOVED as requested */}

            {/* Info Bar Content (Centered) */}
            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-300 overflow-hidden h-full">
                
                {/* Attributes */}
                <div className="flex items-center gap-3 text-[11px] shrink-0 h-full">
                    {ATTRIBUTE_ORDER.map((key) => {
                        // @ts-ignore
                        const val = data.stats[key];
                        return val ? (
                            <span 
                                key={key} 
                                className="uppercase font-extrabold leading-none drop-shadow-md"
                                style={{ 
                                    color: STAT_STYLES[key]?.color || '#fff',
                                }}
                            >
                            {key.substring(0,3)}
                            </span>
                        ) : null;
                    })}
                </div>
                
                {/* Vertical Divider */}
                <div className="w-px h-3 bg-slate-600 shrink-0"></div>

                {/* Range */}
                <div className="flex items-center gap-1 shrink-0 min-w-0 h-full" title="Alcance">
                    <Ruler size={10} className="text-slate-400 shrink-0" />
                    <span className="uppercase whitespace-nowrap leading-none text-white">
                        {data.range}{data.distance ? ` - ${data.distance}` : ''}
                    </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 shrink-0 min-w-0 h-full" title="Duração">
                    <Clock size={10} className="text-slate-400 shrink-0" />
                    <span className="uppercase whitespace-nowrap leading-none text-white">{data.duration}</span>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Body */}
      <div className="flex-1 relative z-10 p-2.5 flex gap-2.5 overflow-hidden" style={dynamicBgStyle}>
        
        {/* Left Column: Sidebar for Stats (Styled boxes) */}
        <div className="flex flex-col gap-2 w-[110px] shrink-0 h-full">
            
            {/* Action Type Box */}
            <div className="flex flex-col items-center justify-start flex-1 shadow-lg overflow-hidden" style={dynamicBoxStyle}>
                <div className="w-full py-0.5 border-b border-slate-600/30 flex items-center justify-center">
                    <span className="text-[7px] uppercase font-bold text-white flex items-center gap-1">
                        <ActionTypeIcon size={8} /> Tipo
                    </span>
                </div>
                <div className="flex-1 flex items-center justify-center w-full px-1">
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider text-center leading-tight">
                        {actionLabel}
                    </span>
                </div>
            </div>

            {/* Hit Box */}
            {data.hasHit && (
                <div className="flex flex-col items-center justify-start flex-1 shadow-lg overflow-hidden" style={dynamicBoxStyle}>
                    <div className="w-full py-0.5 border-b border-slate-600/30 flex items-center justify-center">
                        <span className="text-[7px] uppercase font-bold text-white flex items-center gap-1">
                            <Crosshair size={8} /> Acerto
                        </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full px-1">
                        <span className="font-mono text-[9px] font-bold text-white text-center leading-tight whitespace-nowrap">
                            {calculatedHit.replace(/\s/g, '')}
                        </span>
                    </div>
                </div>
            )}

            {/* DT Box */}
            {data.hasDT && (
                <div className="flex flex-col items-center justify-start flex-1 shadow-lg overflow-hidden" style={dynamicBoxStyle}>
                    <div className="w-full py-0.5 border-b border-slate-600/30 flex items-center justify-center">
                        <span className="text-[7px] uppercase font-bold text-white flex items-center gap-1">
                                <Shield size={8} /> DT
                        </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full px-1">
                        <span className="font-mono text-[9px] font-bold text-white text-center leading-tight whitespace-nowrap">
                            {calculatedDT.replace(/\s/g, '')}
                        </span>
                    </div>
                </div>
            )}
            
            {!data.hasHit && !data.hasDT && <div className="flex-1"></div>}

        </div>

        {/* Right Column: Description & Conditions */}
        <div className="flex-1 flex flex-col h-full overflow-hidden gap-2">
             {/* Text Area */}
             <div className="text-slate-300 text-[10px] leading-[1.35] font-sans text-justify overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1">
                <h3 className="text-[10px] font-bold text-white uppercase mb-1">DESCRIÇÃO</h3>
                {data.description || "Descrição do efeito..."}
             </div>

             {/* Conditions */}
            {data.conditions.length > 0 && (
                <div className="shrink-0 pt-2 border-t border-slate-800/50">
                    <div className="flex flex-wrap gap-1.5">
                        {data.conditions.map(cond => {
                            const iconData = CONDITION_ICONS[cond] || { icon: AlertTriangle, color: '#fff' };
                            const Icon = iconData.icon;
                            return (
                                <div key={cond} className="flex items-center gap-1 rounded px-1.5 py-0.5 shadow-sm" style={dynamicBoxStyle}>
                                    <Icon size={9} style={{ color: iconData.color }} className="shrink-0" />
                                    <span className="text-[7px] font-bold text-slate-300 uppercase tracking-wide leading-none pt-px">{cond}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

      </div>

      {/* 4. Footer Scaling (Individual Boxes) */}
      {data.hasScaling && (
        <div className="relative z-10 border-t border-slate-700/50 shrink-0 h-[13%] min-h-[50px] flex items-center justify-between gap-1.5 px-2 overflow-hidden" style={dynamicBgStyle}>
            {[ 
                { l: '1', v: data.lvl1 },
                { l: '5', v: data.lvl5 },
                { l: '10', v: data.lvl10 },
                { l: '15', v: data.lvl15 } 
            ].map((lvl, i) => {
                const isMax = i === 3;
                const isHigh = i === 2;
                const isMed = i === 1;
                const iconSize = isMax ? 14 : (isHigh ? 12 : 10);
                const iconColor = (isMax || isHigh) ? config.color : (isMed ? config.color : '#94a3b8'); 
                const opacity = isMax ? 1 : (isHigh ? 0.9 : (isMed ? 0.8 : 0.6));
                
                return (
                    <div key={i} className="flex-1 h-full max-h-[42px] flex flex-col items-center justify-center rounded shadow-sm" style={dynamicBoxStyle}>
                        <div className="w-full border-b border-slate-600/30 mb-0.5 pb-0.5 flex justify-center">
                            <span className="text-[7px] font-extrabold text-white uppercase tracking-wider">LVL {lvl.l}</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-1 w-full px-0.5">
                            <TypeIcon 
                                size={iconSize} 
                                className="shrink-0"
                                style={{ 
                                    color: iconColor, 
                                    opacity: opacity
                                }} 
                            />
                            <span className="text-[8px] font-bold text-white tracking-tight truncate">
                                {lvl.v !== "-" ? lvl.v + suffix : "-"}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
      )}
    </div>
  );
};
