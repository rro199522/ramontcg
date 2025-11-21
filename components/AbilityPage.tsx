
import React, { useState, useEffect } from 'react';
import { MoveData, INITIAL_MOVE_DATA, ELEMENT_TYPES, SavedMoveCard } from '../types';
import { CardForm } from './CardForm';
import { CardPreview } from './CardPreview';
import { generateCardArt, generateElementalTexture } from '../services/ai';
import { Trash2, Copy, Camera, Sliders, Maximize, ZoomOut, ZoomIn, Save, PlayCircle, FileSpreadsheet } from 'lucide-react';

const calculateStrings = (data: MoveData) => {
  let hitString = "-";
  if (data.hasHit) {
    const attrs = Object.keys(data.hitAttributes).filter(k => data.hitAttributes[k as keyof typeof data.hitAttributes]);
    if (attrs.length > 0) {
        hitString = `${attrs.join("/")}·d20↑`;
    } else {
        hitString = "1d20";
    }
    if (data.hitProf) hitString += " + P";
  }

  let dtString = "-";
  if (data.hasDT) {
    dtString = "12";
    const attrs = Object.keys(data.dtAttributes).filter(k => data.dtAttributes[k as keyof typeof data.dtAttributes]);
    if (attrs.length > 0) dtString += "+" + attrs.join("/");
    if (data.dtProf) dtString += "+P";
  }

  return { hitString, dtString };
};

const generateTSVRow = (data: MoveData, hitStr: string, dtStr: string) => {
  const typeLabel = ELEMENT_TYPES.find(t => t.id === data.type)?.label || data.type;
  const suffix = data.hasScaling && data.addAtrToScaling ? " + ATR" : "";
  const l1 = data.hasScaling ? data.lvl1 + suffix : "-";
  const l5 = data.hasScaling ? data.lvl5 + suffix : "-";
  const l10 = data.hasScaling ? data.lvl10 + suffix : "-";
  const l15 = data.hasScaling ? data.lvl15 + suffix : "-";

  const fields = [
    data.id,
    data.name,
    typeLabel,
    data.pp,
    data.pd, 
    data.actionType,
    data.duration,
    data.range + (data.distance ? ` - ${data.distance}` : ''),
    hitStr,
    dtStr,
    data.stats.FOR ? "X" : "",
    data.stats.AGI ? "X" : "",
    data.stats.INT ? "X" : "",
    data.stats.PRE ? "X" : "",
    data.stats.VIG ? "X" : "",
    data.stats.ATR ? "X" : "",
    data.conditions.join(", "),
    (data.description || "").replace(/[\n\r]+/g, " "),
    l1, l5, l10, l15,
    data.isShiny ? "X" : "",
    data.isFoil ? "X" : ""
  ];
  
  return fields.join('\t');
};

const HEADERS = "ID\tNome\tTipo\tPP\tPD\tAção\tDuração\tAlcance\tAcerto\tDT\tFOR\tAGI\tINT\tPRE\tVIG\tATR\tCondições\tDescrição\tLvl 1\tLvl 5\tLvl 10\tLvl 15\tShiny\tFoil";

export const AbilityPage: React.FC = () => {
  const [moveData, setMoveData] = useState<MoveData>(INITIAL_MOVE_DATA);
  const [savedCards, setSavedCards] = useState<SavedMoveCard[]>([]);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [isGeneratingTexture, setIsGeneratingTexture] = useState(false);
  const [typeTextures, setTypeTextures] = useState<Record<string, string>>({});
  
  const [uiOpacity, setUiOpacity] = useState(90); 
  const [headerOpacity, setHeaderOpacity] = useState(100); 
  
  const { hitString, dtString } = calculateStrings(moveData);

  // Load saved data from LocalStorage on mount
  useEffect(() => {
    const storedCards = localStorage.getItem('ramon_saved_abilities');
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
    const newCard: SavedMoveCard = {
        id: moveData.id || Date.now().toString(),
        data: moveData,
        timestamp: Date.now()
    };

    // Check if already exists and update, or add new
    const existingIndex = savedCards.findIndex(c => c.id === newCard.id);
    let updatedCards;
    if (existingIndex >= 0) {
        updatedCards = [...savedCards];
        updatedCards[existingIndex] = newCard;
    } else {
        updatedCards = [...savedCards, newCard];
    }

    setSavedCards(updatedCards);
    localStorage.setItem('ramon_saved_abilities', JSON.stringify(updatedCards));
    alert("Carta salva na lista local!");
  };

  const handleDeleteCard = (id: string) => {
    if (confirm("Excluir esta carta permanentemente?")) {
        const updatedCards = savedCards.filter(c => c.id !== id);
        setSavedCards(updatedCards);
        localStorage.setItem('ramon_saved_abilities', JSON.stringify(updatedCards));
    }
  };

  const handleLoadCard = (card: SavedMoveCard) => {
    setMoveData(card.data);
  };

  const handleCopyAllExcel = () => {
    const rows = savedCards.map(card => {
        const { hitString, dtString } = calculateStrings(card.data);
        return generateTSVRow(card.data, hitString, dtString);
    });
    const content = [HEADERS, ...rows].join('\n');
    navigator.clipboard.writeText(content).then(() => {
      alert("Todas as cartas salvas foram copiadas para a área de transferência!");
    });
  };

  const handleCopyCurrent = () => {
    const row = generateTSVRow(moveData, hitString, dtString);
    navigator.clipboard.writeText(row).then(() => {
        alert("Texto da carta atual copiado para Excel!");
    });
  };

  const handleReset = () => {
    if(confirm("Tem certeza que deseja limpar todos os campos do formulário?")) {
        setMoveData({
            ...INITIAL_MOVE_DATA,
            id: '',
            name: ''
        });
    }
  };

  const handleImport = (tsvString: string) => {
    // Existing import logic
    try {
      const cols = tsvString.split('\t');
      if (cols.length < 5) throw new Error("Formato inválido");
      const id = cols[0].trim();
      const name = cols[1].trim();
      const typeLabel = cols[2].trim();
      const typeObj = ELEMENT_TYPES.find(t => t.label.toLowerCase() === typeLabel.toLowerCase());
      const type = typeObj ? typeObj.id : 'normal';
      const pp = cols[3].trim();
      const pd = cols[4].trim(); 
      const actionType = cols[5].trim();
      const duration = cols[6].trim();
      const rawRange = cols[7].trim();
      let range = "Pessoal";
      let distance = "";
      if (rawRange.includes(' - ')) {
        const parts = rawRange.split(' - ');
        range = parts[0];
        distance = parts[1];
      } else {
        range = rawRange;
      }
      const rawHit = cols[8].trim();
      const hasHit = rawHit !== '-' && rawHit !== '';
      const hitProf = rawHit.includes('PERÍCIA') || rawHit.includes('PROF') || rawHit.includes(' + P'); 
      const hitAttributes = {
        FOR: rawHit.includes('FOR'), AGI: rawHit.includes('AGI'), INT: rawHit.includes('INT'), PRE: rawHit.includes('PRE'), VIG: rawHit.includes('VIG'), ATR: rawHit.includes('ATR') || rawHit.includes('ATT')
      };
      const rawDT = cols[9].trim();
      const hasDT = rawDT !== '-' && rawDT !== '';
      const dtProf = rawDT.includes('PERÍCIA') || rawDT.includes('PROF') || rawDT.includes('+P');
      const dtAttributes = {
        FOR: rawDT.includes('FOR'), AGI: rawDT.includes('AGI'), INT: rawDT.includes('INT'), PRE: rawDT.includes('PRE'), VIG: rawDT.includes('VIG'), ATR: rawDT.includes('ATR') || rawDT.includes('ATT')
      };
      const stats = {
        FOR: (cols[10] || '').trim().toUpperCase() === 'X',
        AGI: (cols[11] || '').trim().toUpperCase() === 'X',
        INT: (cols[12] || '').trim().toUpperCase() === 'X',
        PRE: (cols[13] || '').trim().toUpperCase() === 'X',
        VIG: (cols[14] || '').trim().toUpperCase() === 'X',
        ATR: (cols[15] || '').trim().toUpperCase() === 'X'
      };
      const conditionsStr = cols[16] || '';
      const conditions = conditionsStr ? conditionsStr.split(',').map(c => c.trim()) : [];
      const description = cols[17] || '';
      const rawL1 = cols[18] || '-';
      const hasScaling = rawL1 !== '-' && rawL1 !== '';
      const addAtrToScaling = rawL1.includes('+ ATR') || rawL1.includes('+ ATT');
      const cleanScaling = (val: string) => val.replace(' + ATT', '').replace(' + ATR', '').trim();
      const lvl1 = cleanScaling(rawL1);
      const lvl5 = cleanScaling(cols[19] || '-');
      const lvl10 = cleanScaling(cols[20] || '-');
      const lvl15 = cleanScaling(cols[21] || '-');
      
      const isShiny = (cols[22] || '').trim().toUpperCase() === 'X';
      const isFoil = (cols[23] || '').trim().toUpperCase() === 'X';

      const newData: MoveData = {
        id, name, type, imageUrl: moveData.imageUrl,
        pp, pd, actionType, duration, range, distance,
        hasHit, hitProf, hitAttributes,
        hasDT, dtProf, dtAttributes,
        stats, conditions, description,
        hasScaling, addAtrToScaling,
        lvl1, lvl5, lvl10, lvl15,
        imageOffsetY: moveData.imageOffsetY || 50,
        imageScale: moveData.imageScale || 100,
        isShiny,
        isFoil
      };
      setMoveData(newData);
      alert("Dados importados com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao importar.");
    }
  };

  const handleGenerateArt = async () => {
    if (!moveData.name) return;
    setIsGeneratingArt(true);
    try {
      const typeLabel = ELEMENT_TYPES.find(t => t.id === moveData.type)?.label || moveData.type;
      const imageUrl = await generateCardArt(moveData.name, typeLabel);
      if (imageUrl) {
        setMoveData(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      alert("Erro ao gerar imagem.");
    } finally {
      setIsGeneratingArt(false);
    }
  };

  const handleGenerateTexture = async () => {
    const typeId = moveData.type;
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
     // @ts-ignore
     if (typeof window.html2canvas !== 'undefined') {
         const element = document.getElementById('preview-card');
         if(element) {
             // @ts-ignore
             const canvas = await window.html2canvas(element, { scale: 4, backgroundColor: null });
             const link = document.createElement('a');
             link.download = `card-${moveData.id}.png`;
             link.href = canvas.toDataURL("image/png");
             link.click();
         }
     } else {
         alert("Biblioteca de imagem carregando...");
     }
  };

  const updateImageScale = (delta: number) => {
     setMoveData(prev => ({ 
         ...prev, 
         imageScale: Math.max(50, Math.min(250, (prev.imageScale || 100) + delta)) 
     }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="order-2 lg:order-1">
            <CardForm 
              data={moveData} 
              onChange={setMoveData} 
              onSave={handleSave} 
              onCopyCurrent={handleCopyCurrent}
              onReset={handleReset}
              onImport={handleImport}
              onGenerateArt={handleGenerateArt}
              onGenerateTexture={handleGenerateTexture}
              isGenerating={isGeneratingArt}
              isGeneratingTexture={isGeneratingTexture}
              hasTexture={!!typeTextures[moveData.type]}
            />
         </div>

         <div className="order-1 lg:order-2 space-y-6">
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wide font-rpg">Visualização</h2>
                <button 
                  onClick={handleDownload}
                  className="bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold py-2 px-4 shadow-sm transition flex items-center gap-2 uppercase tracking-wide"
                >
                   <Camera size={14} /> PNG Único
                </button>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex flex-col gap-1 md:col-span-2 border-t border-slate-100 pt-2">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide">
                            <Maximize size={14} /> Zoom Imagem
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateImageScale(-10)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded"><ZoomOut size={14}/></button>
                            <span className="text-xs font-mono font-bold text-slate-700 w-12 text-center">{Math.round(moveData.imageScale || 100)}%</span>
                            <button onClick={() => updateImageScale(10)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded"><ZoomIn size={14}/></button>
                        </div>
                     </div>
                </div>
            </div>

            <div className="flex justify-center bg-slate-200/50 p-8 border border-slate-300 rounded-lg backdrop-blur-sm overflow-x-auto">
               <div style={{ width: '380px', flexShrink: 0 }}>
                  <CardPreview 
                    data={moveData} 
                    calculatedHit={hitString} 
                    calculatedDT={dtString} 
                    typeTexture={typeTextures[moveData.type]}
                    uiOpacity={uiOpacity}
                    headerOpacity={headerOpacity}
                  />
               </div>
            </div>

            {/* Local Host Saved Cards List */}
            <div className="bg-white border border-slate-300 overflow-hidden flex flex-col shadow-sm">
                <div className="flex justify-between items-center p-3 bg-slate-100 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <Save size={14} /> Cartas Salvas (Local Host)
                    </span>
                    <button onClick={handleCopyAllExcel} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-bold transition uppercase flex items-center gap-1 rounded-sm">
                        <FileSpreadsheet size={14} /> Copiar Lista (Excel)
                    </button>
                </div>
                <div className="bg-slate-50 p-0 max-h-[400px] overflow-y-auto">
                    {savedCards.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm italic">
                            Nenhuma carta salva. Clique em "Salvar na Lista" para adicionar.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {savedCards.map((card) => {
                                const type = ELEMENT_TYPES.find(t => t.id === card.data.type);
                                return (
                                    <div key={card.id} className="p-3 flex items-center justify-between hover:bg-indigo-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded shadow-sm flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0"
                                                style={{ backgroundColor: type?.color || '#999' }}
                                            >
                                                {card.data.type.substring(0,3)}
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
