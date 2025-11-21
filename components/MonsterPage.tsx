
import React, { useState, useEffect } from 'react';
import { MonsterData, INITIAL_MONSTER_DATA, ELEMENT_TYPES, SavedMonsterCard } from '../types';
import { MonsterForm } from './MonsterForm';
import { MonsterPreview } from './MonsterPreview';
import { generateCardArt, generateElementalTexture } from '../services/ai';
import { Trash2, Copy, Camera, Sliders, ZoomIn, Maximize, Save, PlayCircle, FileSpreadsheet, ArrowRight, ArrowDown } from 'lucide-react';
import html2canvas from 'html2canvas';

// Reuse string calculation logic for now, but this can change for monsters
const calculateStrings = (data: MonsterData) => {
  let dtString = "-";
  if (data.hasDT) {
    dtString = "10"; // Base Defense is 10 + AGI + P
    const attrs = Object.keys(data.dtAttributes).filter(k => data.dtAttributes[k as keyof typeof data.dtAttributes]);
    if (attrs.length > 0) dtString += "+" + attrs.join("/");
    if (data.dtProf) dtString += "+P";
  }

  return { dtString };
};

const generateTSVRow = (data: MonsterData, dtStr: string) => {
  const typeObj1 = ELEMENT_TYPES.find(t => t.id === data.type);
  const typeObj2 = data.secondaryType ? ELEMENT_TYPES.find(t => t.id === data.secondaryType) : null;
  
  // Format: Type1 OR Type1/Type2
  const typeLabel = typeObj2 
    ? `${typeObj1?.label || data.type}/${typeObj2.label}`
    : (typeObj1?.label || data.type);

  const mapTypesToLabels = (ids: string[]) => {
     return ids.map(id => ELEMENT_TYPES.find(t => t.id === id)?.label || id).join(", ");
  };

  // Serialize Passives
  const passivesStr = data.passives.map(p => `[${p.title}]: ${p.description}`).join(" || ");
  
  // Serialize Attributes
  const attributesStr = data.attributes.map(row => {
      return `Title:${row.title},FOR:${row.FOR},AGI:${row.AGI},INT:${row.INT},PRE:${row.PRE},VIG:${row.VIG}`;
  }).join(" | ");

  // Serialize Moves
  const movesStr = data.moves.map(m => `[${m.title}]: ${m.content}`).join(" | ");

  // Serialize Speeds
  const speedsStr = data.speeds.join(" | ");

  const fields = [
    data.id,
    data.name,
    typeLabel,
    data.vd,     // HP (Swapped)
    data.pd,     // PD
    data.hitDie, // D (Swapped)
    speedsStr,   // Speed (Replaces Duration)
    dtStr,
    attributesStr, 
    mapTypesToLabels(data.vulnerabilities), // Vuln
    mapTypesToLabels(data.resistances), // Res
    mapTypesToLabels(data.immunities), // Imm
    (passivesStr || "").replace(/[\n\r]+/g, " "), 
    movesStr,
    data.isShiny ? "X" : "",
    data.isFoil ? "X" : "",
    (data.imageOffsetX || 50).toString()
  ];
  
  return fields.join('\t');
};

const HEADERS = "ID\tNome\tTipo\tHP\tPD\tD\tSpeed\tDefesa\tAtributos\tVulnerabilidades\tResistências\tInvulnerabilidades\tPassivas\tMovimentos\tShiny\tFoil\tImgX";

export const MonsterPage: React.FC = () => {
  const [monsterData, setMonsterData] = useState<MonsterData>(INITIAL_MONSTER_DATA);
  const [savedCards, setSavedCards] = useState<SavedMonsterCard[]>([]);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [isGeneratingTexture, setIsGeneratingTexture] = useState(false);
  const [typeTextures, setTypeTextures] = useState<Record<string, string>>({});
  const [uiOpacity, setUiOpacity] = useState(85); 
  const [headerOpacity, setHeaderOpacity] = useState(100); 
  
  const { dtString } = calculateStrings(monsterData);

  useEffect(() => {
    const storedCards = localStorage.getItem('ramon_saved_monsters');
    if (storedCards) {
      try {
        setSavedCards(JSON.parse(storedCards));
      } catch (e) {
        console.error("Failed to load cards", e);
      }
    }

    const savedTextures = localStorage.getItem('rpg_type_textures');
    if (savedTextures) {
      try {
        setTypeTextures(JSON.parse(savedTextures));
      } catch (e) {
        console.error("Failed to load textures", e);
      }
    }
  }, []);

  const handleSave = () => {
    const newCard: SavedMonsterCard = {
        id: monsterData.id || Date.now().toString(),
        data: monsterData,
        timestamp: Date.now()
    };

    const existingIndex = savedCards.findIndex(c => c.id === newCard.id);
    let updatedCards;
    if (existingIndex >= 0) {
        updatedCards = [...savedCards];
        updatedCards[existingIndex] = newCard;
    } else {
        updatedCards = [...savedCards, newCard];
    }

    setSavedCards(updatedCards);
    localStorage.setItem('ramon_saved_monsters', JSON.stringify(updatedCards));
    alert("Monstro salvo na lista local!");
  };

  const handleDeleteCard = (id: string) => {
    if (confirm("Excluir este monstro permanentemente?")) {
        const updatedCards = savedCards.filter(c => c.id !== id);
        setSavedCards(updatedCards);
        localStorage.setItem('ramon_saved_monsters', JSON.stringify(updatedCards));
    }
  };

  const handleLoadCard = (card: SavedMonsterCard) => {
    setMonsterData(card.data);
  };

  const handleCopyAllExcel = () => {
    const rows = savedCards.map(card => {
        const { dtString } = calculateStrings(card.data);
        return generateTSVRow(card.data, dtString);
    });
    const content = [HEADERS, ...rows].join('\n');
    navigator.clipboard.writeText(content).then(() => {
      alert("Todas os monstros salvos foram copiados para a área de transferência!");
    });
  };

  const handleCopyCurrent = () => {
    const row = generateTSVRow(monsterData, dtString);
    navigator.clipboard.writeText(row).then(() => {
        alert("Texto do monstro atual copiado!");
    });
  };

  const handleReset = () => {
    if(confirm("Limpar dados do monstro?")) {
        setMonsterData({
            ...INITIAL_MONSTER_DATA,
            id: '',
            name: ''
        });
    }
  };

  const handleImport = (tsvString: string) => {
     // Import Logic
     try {
      const cols = tsvString.split('\t');
      if (cols.length < 5) throw new Error("Formato inválido");
      const id = cols[0].trim();
      const name = cols[1].trim();
      const rawTypeLabel = cols[2].trim();
      let type = 'normal';
      let secondaryType: string | undefined = undefined;
      if (rawTypeLabel.includes('/')) {
          const [t1, t2] = rawTypeLabel.split('/');
          const typeObj1 = ELEMENT_TYPES.find(t => t.label.toLowerCase() === t1.toLowerCase());
          const typeObj2 = ELEMENT_TYPES.find(t => t.label.toLowerCase() === t2.toLowerCase());
          type = typeObj1 ? typeObj1.id : 'normal';
          secondaryType = typeObj2 ? typeObj2.id : undefined;
      } else {
          const typeObj = ELEMENT_TYPES.find(t => t.label.toLowerCase() === rawTypeLabel.toLowerCase());
          type = typeObj ? typeObj.id : 'normal';
      }
      const vd = cols[3].trim();
      const pd = cols[4].trim();
      const hitDie = cols[5].trim();
      const rawSpeed = cols[6].trim();
      const speeds = rawSpeed ? rawSpeed.split(' | ').map(s => s.trim()) : [];
      const rawDT = cols[7].trim();
      const hasDT = rawDT !== '-' && rawDT !== '';
      const dtProf = rawDT.includes('PERÍCIA') || rawDT.includes('PROF') || rawDT.includes('+P');
      const dtAttributes = {
        FOR: rawDT.includes('FOR'), AGI: rawDT.includes('AGI'), INT: rawDT.includes('INT'), PRE: rawDT.includes('PRE'), VIG: rawDT.includes('VIG'), ATR: rawDT.includes('ATR') || rawDT.includes('ATT')
      };
      // Attributes
      const rawAttributes = cols[8].trim();
      const attributes = [];
      if (rawAttributes) {
          const rows = rawAttributes.split(' | ');
          for (const rowStr of rows) {
             const attrObj = { title: '', FOR: "0", AGI: "0", INT: "0", PRE: "0", VIG: "0" };
             const parts = rowStr.split(',');
             for (const p of parts) {
                 const [key, val] = p.split(':');
                 if (key && val) {
                    if (key === 'Title') attrObj.title = val;
                    // @ts-ignore
                    else if (key in attrObj) attrObj[key] = val;
                 }
             }
             attributes.push(attrObj);
          }
      }
      const parseTypeString = (str: string) => {
         if(!str) return [];
         return str.split(',').map(s => s.trim()).map(label => ELEMENT_TYPES.find(t => t.label.toLowerCase() === label.toLowerCase())?.id || '').filter(Boolean);
      };
      const vulnerabilities = parseTypeString(cols[9] || '');
      const resistances = parseTypeString(cols[10] || '');
      const immunities = parseTypeString(cols[11] || '');
      const rawPassives = cols[12] || '';
      const passives = [];
      if (rawPassives.includes('[')) {
          const parts = rawPassives.split(' || ');
          for (const p of parts) {
              const match = p.match(/\[(.*?)]: (.*)/);
              if (match) passives.push({ title: match[1], description: match[2] });
              else if(p.trim()) passives.push({ title: 'Passiva', description: p });
          }
      } else if (rawPassives.trim()) {
          passives.push({ title: 'Descrição', description: rawPassives });
      }
      const rawMoves = cols[13] || '';
      const moves = [];
      if (rawMoves.includes('[')) {
          const parts = rawMoves.split(' | ');
          for (const p of parts) {
             const match = p.match(/\[(.*?)]: (.*)/);
             if (match) moves.push({ title: match[1], content: match[2] });
          }
      }
      
      const isShiny = (cols[14] || '').trim().toUpperCase() === 'X';
      const isFoil = (cols[15] || '').trim().toUpperCase() === 'X';
      const imgX = cols[16] ? parseInt(cols[16]) : 50;

      const newData: MonsterData = {
        id, name, type, secondaryType, imageUrl: monsterData.imageUrl,
        imageOffsetY: monsterData.imageOffsetY || 50,
        imageOffsetX: imgX,
        imageScale: monsterData.imageScale || 100,
        hitDie, pd, vd, pp: "0", speeds,
        // @ts-ignore
        duration: undefined, hasHit: false, hitProf: false, hitAttributes: { FOR: false, AGI: false, INT: false, PRE: false, VIG: false, ATR: false }, hasDT, dtProf, dtAttributes, attributes, passives, vulnerabilities, resistances, immunities, moves,
        isShiny, isFoil
      };
      setMonsterData(newData);
      alert("Dados do Monstro importados!");
    } catch (err) {
      console.error(err);
      alert("Erro ao importar. Formato incompatível.");
    }
  };

  const handleGenerateArt = async () => {
    if (!monsterData.name) return;
    setIsGeneratingArt(true);
    try {
      const typeLabel = ELEMENT_TYPES.find(t => t.id === monsterData.type)?.label || monsterData.type;
      const imageUrl = await generateCardArt(monsterData.name, typeLabel);
      if (imageUrl) {
        setMonsterData(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      alert("Erro ao gerar imagem.");
    } finally {
      setIsGeneratingArt(false);
    }
  };

  const handleGenerateTexture = async () => {
    const typeId = monsterData.type;
    const typeLabel = ELEMENT_TYPES.find(t => t.id === typeId)?.label || typeId;
    setIsGeneratingTexture(true);
    try {
      const textureUrl = await generateElementalTexture(typeLabel);
      if (textureUrl) {
        const newTextures = { ...typeTextures, [typeId]: textureUrl };
        setTypeTextures(newTextures);
        localStorage.setItem('rpg_type_textures', JSON.stringify(newTextures));
      }
    } catch (error) {
      alert("Erro ao gerar textura.");
    } finally {
      setIsGeneratingTexture(false);
    }
  };

  const handleDownload = async () => {
     const element = document.getElementById('preview-card-monster');
     if(element) {
         try {
             const canvas = await html2canvas(element, { scale: 4, backgroundColor: null });
             const link = document.createElement('a');
             link.download = `monster-${monsterData.id}.png`;
             link.href = canvas.toDataURL("image/png");
             link.click();
         } catch (err) {
             console.error("Download failed:", err);
             alert("Erro ao gerar imagem.");
         }
     }
  };

  const updateImageScale = (val: number) => {
     setMonsterData(prev => ({ ...prev, imageScale: val }));
  };

  const updateImageX = (val: number) => {
    setMonsterData(prev => ({ ...prev, imageOffsetX: val }));
  };
 
  const updateImageY = (val: number) => {
    setMonsterData(prev => ({ ...prev, imageOffsetY: val }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="order-2 lg:order-1">
            <MonsterForm 
              data={monsterData} 
              onChange={setMonsterData} 
              onSave={handleSave} 
              onCopyCurrent={handleCopyCurrent}
              onReset={handleReset}
              onImport={handleImport}
              onGenerateArt={handleGenerateArt}
              onGenerateTexture={handleGenerateTexture}
              isGenerating={isGeneratingArt}
              isGeneratingTexture={isGeneratingTexture}
              hasTexture={!!typeTextures[monsterData.type]}
            />
         </div>

         <div className="order-1 lg:order-2 space-y-6">
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wide font-rpg">Visualização (Monstro)</h2>
                <button 
                  onClick={handleDownload}
                  className="bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold py-2 px-4 shadow-sm transition flex items-center gap-2 uppercase tracking-wide"
                >
                   <Camera size={14} /> PNG Único
                </button>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* UI Opacity Control */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide">
                        <Sliders size={14} /> Opacidade UI
                    </div>
                    <div className="flex items-center gap-2">
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={uiOpacity} 
                            onChange={(e) => setUiOpacity(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700 w-8 text-right">{uiOpacity}%</span>
                    </div>
                </div>

                {/* Header Opacity Control */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide">
                        <Sliders size={14} /> Opacidade Header
                    </div>
                    <div className="flex items-center gap-2">
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={headerOpacity} 
                            onChange={(e) => setHeaderOpacity(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700 w-8 text-right">{headerOpacity}%</span>
                    </div>
                </div>

                 {/* Image Adjustment Group */}
                 <div className="md:col-span-2 border-t border-slate-100 pt-2">
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ajustes de Imagem</label>
                     <div className="grid grid-cols-3 gap-4">
                        {/* Zoom Slider */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
                                <ZoomIn size={12} /> Zoom
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="range" 
                                    min="50" 
                                    max="250" 
                                    value={monsterData.imageScale || 100} 
                                    onChange={(e) => updateImageScale(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>
                        </div>
                        
                        {/* X Position Slider */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
                                <ArrowRight size={12} /> Posição X
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={monsterData.imageOffsetX ?? 50} 
                                    onChange={(e) => updateImageX(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                                />
                            </div>
                        </div>

                        {/* Y Position Slider */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
                                <ArrowDown size={12} /> Posição Y
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={monsterData.imageOffsetY ?? 50} 
                                    onChange={(e) => updateImageY(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                                />
                            </div>
                        </div>
                     </div>
                </div>

            </div>

            {/* Preview Area */}
            <div className="flex justify-center bg-slate-200/50 p-8 border border-slate-300 rounded-lg backdrop-blur-sm overflow-hidden relative">
               <div style={{ width: '380px', flexShrink: 0 }}>
                  <MonsterPreview 
                    data={monsterData} 
                    calculatedHit={""} 
                    calculatedDT={dtString} 
                    typeTexture={typeTextures[monsterData.type]}
                    uiOpacity={uiOpacity}
                    headerOpacity={headerOpacity}
                  />
               </div>
            </div>

             {/* Local Host Saved Monsters List */}
             <div className="bg-white border border-slate-300 overflow-hidden flex flex-col shadow-sm">
                <div className="flex justify-between items-center p-3 bg-slate-100 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <Save size={14} /> Monstros Salvos (Local Host)
                    </span>
                    <button onClick={handleCopyAllExcel} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-bold transition uppercase flex items-center gap-1 rounded-sm">
                        <FileSpreadsheet size={14} /> Copiar Lista (Excel)
                    </button>
                </div>
                <div className="bg-slate-50 p-0 max-h-[400px] overflow-y-auto">
                    {savedCards.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm italic">
                            Nenhum monstro salvo. Clique em "Salvar na Lista" para adicionar.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {savedCards.map((card) => {
                                const type1 = ELEMENT_TYPES.find(t => t.id === card.data.type);
                                const type2 = card.data.secondaryType ? ELEMENT_TYPES.find(t => t.id === card.data.secondaryType) : null;
                                const bgColor = type1?.color || '#999';
                                
                                return (
                                    <div key={card.id} className="p-3 flex items-center justify-between hover:bg-indigo-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded shadow-sm flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0 overflow-hidden relative"
                                                style={{ backgroundColor: bgColor }}
                                            >
                                                {type2 && (
                                                    <div className="absolute inset-0 w-full h-full" 
                                                        style={{ background: `linear-gradient(135deg, ${type1?.color} 50%, ${type2.color} 50%)` }} 
                                                    />
                                                )}
                                                <span className="relative z-10">{card.data.type.substring(0,3)}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-sm">{card.data.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{card.id}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-80 group-hover:opacity-100">
                                            <button 
                                                onClick={() => handleLoadCard(card)}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition"
                                                title="Recarregar / Editar"
                                            >
                                                <PlayCircle size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCard(card.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded transition"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>
  );
};
