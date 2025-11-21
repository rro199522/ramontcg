
import React, { useRef, useState } from 'react';
import { MonsterData, ELEMENT_TYPES, Passive, MonsterAttributeRow, MonsterMove } from '../types';
import { Edit3, Shield, Crosshair, Sparkles, Loader2, Palette, Download, Copy, RotateCcw, Upload, Import, Plus, Trash2, List, Footprints, ArrowUpDown, Star, Disc } from 'lucide-react';

interface MonsterFormProps {
  data: MonsterData;
  onChange: (newData: MonsterData) => void;
  onSave: () => void;
  onCopyCurrent: () => void;
  onReset: () => void;
  onImport: (text: string) => void;
  onGenerateArt: () => void;
  onGenerateTexture: () => void;
  isGenerating: boolean;
  isGeneratingTexture: boolean;
  hasTexture: boolean;
}

const ATTRIBUTE_ORDER = ['FOR', 'AGI', 'INT', 'PRE', 'VIG', 'ATR'];

export const MonsterForm: React.FC<MonsterFormProps> = ({ 
  data, onChange, onSave, onCopyCurrent, onReset, onImport, onGenerateArt, onGenerateTexture, 
  isGenerating, isGeneratingTexture, hasTexture 
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState('');

  const updateField = (field: keyof MonsterData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateNested = (category: 'hitAttributes' | 'dtAttributes', key: string, val: boolean) => {
    onChange({
      ...data,
      [category]: {
        ...data[category],
        [key]: val
      }
    });
  };

  const toggleTypeInList = (listName: 'vulnerabilities' | 'resistances' | 'immunities', typeId: string) => {
    const currentList = data[listName];
    if (currentList.includes(typeId)) {
        onChange({ ...data, [listName]: currentList.filter(id => id !== typeId) });
    } else {
        onChange({ ...data, [listName]: [...currentList, typeId] });
    }
  };

  const handleTypeToggle = (typeId: string) => {
    const primary = data.type;
    const secondary = data.secondaryType;

    if (primary === typeId) {
        if (secondary) {
            onChange({ ...data, type: secondary, secondaryType: undefined });
        } else {
            if (typeId !== 'normal') onChange({ ...data, type: 'normal' });
        }
        return;
    }

    if (secondary === typeId) {
        onChange({ ...data, secondaryType: undefined });
        return;
    }

    if (!secondary) {
        onChange({ ...data, secondaryType: typeId });
    } else {
        onChange({ ...data, secondaryType: typeId });
    }
  };

  // --- SPEED LOGIC ---
  const handleSpeedChange = (index: number, value: string) => {
    const newSpeeds = [...data.speeds];
    newSpeeds[index] = value;
    onChange({ ...data, speeds: newSpeeds });
  };

  const addSpeed = () => {
    onChange({ ...data, speeds: [...data.speeds, ''] });
  };

  const removeSpeed = (index: number) => {
    const newSpeeds = data.speeds.filter((_, i) => i !== index);
    onChange({ ...data, speeds: newSpeeds });
  };

  // --- PASSIVE LOGIC ---
  const handlePassiveChange = (index: number, field: keyof Passive, value: string) => {
    const newPassives = [...data.passives];
    newPassives[index] = { ...newPassives[index], [field]: value };
    onChange({ ...data, passives: newPassives });
  };

  const addPassive = () => {
    if (data.passives.length < 3) {
        onChange({ 
            ...data, 
            passives: [...data.passives, { title: 'Nova Passiva', description: '' }] 
        });
    }
  };

  const removePassive = (index: number) => {
    const newPassives = data.passives.filter((_, i) => i !== index);
    onChange({ ...data, passives: newPassives });
  };

   // --- MOVES LIST LOGIC ---
   const handleMoveChange = (index: number, field: keyof MonsterMove, value: string) => {
    const newMoves = [...data.moves];
    newMoves[index] = { ...newMoves[index], [field]: value };
    onChange({ ...data, moves: newMoves });
  };

  const addMove = () => {
    onChange({ 
        ...data, 
        moves: [...data.moves, { title: 'Level X', content: '' }] 
    });
  };

  const removeMove = (index: number) => {
    const newMoves = data.moves.filter((_, i) => i !== index);
    onChange({ ...data, moves: newMoves });
  };

  // --- ATTRIBUTE LOGIC ---
  const handleAttributeChange = (rowIndex: number, key: keyof MonsterAttributeRow, value: string) => {
    const newAttributes = [...data.attributes];
    newAttributes[rowIndex] = { ...newAttributes[rowIndex], [key]: value };
    onChange({ ...data, attributes: newAttributes });
  };

  // Auto-generate ID based on name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const id = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    onChange({ ...data, name, id });
  };

  const downloadArt = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!data.imageUrl) return;
    
    const link = document.createElement('a');
    link.href = data.imageUrl;
    link.download = `art-${data.id || 'monster'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange({ ...data, imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderTypeSelector = (title: string, listName: 'vulnerabilities' | 'resistances' | 'immunities', colorClass: string) => (
    <div className="mb-4 last:mb-0">
        <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${colorClass}`}>{title}</label>
        <div className="flex flex-wrap gap-1.5">
            {ELEMENT_TYPES.map(type => {
                const isChecked = data[listName].includes(type.id);
                return (
                    <button
                    type="button"
                    key={`${listName}-${type.id}`}
                    onClick={() => toggleTypeInList(listName, type.id)}
                    className={`flex-1 min-w-[60px] py-1 px-1 border text-[10px] font-bold transition-all uppercase ${
                        isChecked ? 'text-white scale-105' : 'bg-white text-slate-400 border-slate-200 opacity-70'
                    }`}
                    style={{ 
                        backgroundColor: isChecked ? type.color : undefined, 
                        borderColor: isChecked ? type.color : undefined
                    }}
                    >
                    {type.label}
                    </button>
                )
            })}
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Import Section */}
      <div className="bg-white border border-indigo-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold uppercase text-xs tracking-wide">
              <Import size={14} /> Importar Texto (Excel)
          </div>
          <div className="flex gap-2">
              <input 
                type="text" 
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Cole a linha do Excel aqui (ID, Nome, Tipo...)"
                className="flex-1 p-2 bg-indigo-50 border border-indigo-100 text-xs text-slate-700"
              />
              <button 
                onClick={() => { onImport(importText); setImportText(''); }}
                disabled={!importText}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-3 font-bold text-xs uppercase transition"
              >
                  Importar
              </button>
          </div>
      </div>

      {/* Identity Section */}
      <div className="bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 uppercase tracking-wide font-rpg">
          <Edit3 size={18} /> Editor de Monstro
        </h2>

        <div className="space-y-6">
          {/* Name & ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Monstro & Imagem</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={data.name} 
                  onChange={handleNameChange}
                  placeholder="Ex: Dragão Vermelho" 
                  className="w-full p-2 bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none transition text-slate-900 font-bold"
                />
                
                <button 
                  onClick={triggerFileUpload}
                  className="bg-slate-600 hover:bg-slate-700 text-white p-2 shadow-sm transition flex items-center justify-center min-w-[44px]"
                  title="Upload de Imagem"
                >
                  <Upload size={18} />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </button>

                {data.imageUrl && (
                  <button 
                    onClick={downloadArt}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 shadow-sm transition flex items-center justify-center min-w-[44px]"
                    title="Baixar Arte"
                  >
                    <Download size={18} />
                  </button>
                )}
              </div>
              
              {/* Image Vertical Offset Slider */}
              <div className="mt-2 flex items-center gap-2">
                  <ArrowUpDown size={12} className="text-slate-400 shrink-0" />
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={data.imageOffsetY ?? 50} 
                        onChange={(e) => updateField('imageOffsetY', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                        title="Ajustar posição vertical da imagem"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-6 text-right">{data.imageOffsetY ?? 50}%</span>
                  </div>
              </div>

            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ID (Automático)</label>
              <input 
                type="text" 
                value={data.id} 
                readOnly 
                className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-400 font-mono text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">
                    Tipo Elemental (Selecione até 2)
                </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {ELEMENT_TYPES.map((type) => {
                const isPrimary = data.type === type.id;
                const isSecondary = data.secondaryType === type.id;
                const isSelected = isPrimary || isSecondary;

                return (
                    <button 
                    type="button"
                    key={type.id} 
                    onClick={() => handleTypeToggle(type.id)}
                    className={`cursor-pointer relative flex-1 min-w-[80px] px-2 py-2 text-[10px] font-bold uppercase transition-transform flex items-center justify-center shadow-sm text-white hover:opacity-90 ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-105 z-10' : 'opacity-80'}`}
                    style={{ backgroundColor: type.color }}
                    >
                        {isPrimary && <span className="absolute top-0.5 left-1 text-[8px]">1</span>}
                        {isSecondary && <span className="absolute top-0.5 right-1 text-[8px]">2</span>}
                        {type.label}
                    </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="bg-white p-4 border border-slate-300">
          <label className="block text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-1 uppercase tracking-wide">
              Propriedades Básicas
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="flex gap-2 col-span-1 md:col-span-2">
                {/* Ordered: HP, PD, D */}
                <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HP</label>
                    <input
                        type="text"
                        value={data.vd}
                        onChange={(e) => updateField('vd', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 font-medium text-slate-800"
                        placeholder="Ex: 30"
                    />
                </div>
                <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PD</label>
                    <input
                        type="text"
                        value={data.pd}
                        onChange={(e) => updateField('pd', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 font-medium text-slate-800"
                        placeholder="Ex: 2"
                    />
                </div>
                <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">D</label>
                    <input
                        type="text"
                        value={data.hitDie}
                        onChange={(e) => updateField('hitDie', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 font-medium text-slate-800"
                        placeholder="Ex: 1d6"
                    />
                </div>
            </div>

            {/* Speed Editor */}
            <div className="col-span-1">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Velocidade (Speed)</label>
                    <button 
                        onClick={addSpeed}
                        className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 uppercase hover:bg-indigo-100 flex items-center gap-1"
                    >
                        <Plus size={10} /> Add
                    </button>
                </div>
                <div className="space-y-1.5">
                    {data.speeds.map((speed, idx) => (
                        <div key={idx} className="flex gap-1">
                             <input 
                                type="text"
                                value={speed}
                                onChange={(e) => handleSpeedChange(idx, e.target.value)}
                                placeholder="Ex: 30ft. walking"
                                className="w-full p-1.5 bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                             />
                             <button 
                                onClick={() => removeSpeed(idx)}
                                className="text-red-400 hover:text-red-600 p-1 shrink-0"
                             >
                                <Trash2 size={12} />
                             </button>
                        </div>
                    ))}
                    {data.speeds.length === 0 && (
                        <div className="text-[10px] text-slate-400 italic">Nenhuma velocidade definida.</div>
                    )}
                </div>
            </div>
            
          </div>
      </div>

      {/* Attributes Section - Full Rows (Fixed 5 Lines) */}
      <div className="bg-white p-4 border border-slate-300">
        <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Atributos Principais (5 Linhas Fixas)</label>
        </div>
        
        <div className="space-y-3">
            {data.attributes.map((row, rowIndex) => (
                <div key={rowIndex} className="bg-slate-50 border border-slate-200 p-2 rounded-sm relative group">
                    <div className="mb-1 pr-6">
                        <input 
                            type="text" 
                            value={row.title} 
                            onChange={(e) => handleAttributeChange(rowIndex, 'title', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-300 text-[10px] font-bold text-slate-500 focus:border-indigo-500 outline-none"
                            placeholder="Título (Ex: Base, Lvl 1)"
                        />
                    </div>
                    <div className="flex gap-2 mb-1">
                       <div className="flex-1 grid grid-cols-5 gap-2">
                          {['FOR', 'AGI', 'INT', 'PRE', 'VIG'].map((key) => (
                             <div key={key}>
                                <label className="block text-[9px] font-bold text-slate-400 text-center mb-0.5">{key}</label>
                                <input 
                                    type="text" 
                                    value={row[key as keyof MonsterAttributeRow]}
                                    onChange={(e) => handleAttributeChange(rowIndex, key as keyof MonsterAttributeRow, e.target.value)}
                                    className="w-full bg-white border border-slate-300 text-xs font-bold text-slate-800 p-1 text-center focus:border-indigo-500 outline-none"
                                />
                             </div>
                          ))}
                       </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Passives Section */}
      <div className="bg-white p-4 border border-slate-300">
        <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Passivas ({data.passives.length}/3)</label>
            <button 
                onClick={addPassive}
                disabled={data.passives.length >= 3}
                className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 uppercase hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
                <Plus size={12} /> Adicionar
            </button>
        </div>
        
        <div className="space-y-4">
            {data.passives.map((p, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 relative group">
                    <div className="flex justify-between items-center mb-2">
                        <input 
                            type="text" 
                            value={p.title}
                            onChange={(e) => handlePassiveChange(idx, 'title', e.target.value)}
                            className="bg-white border border-slate-300 text-xs font-bold text-slate-800 p-1.5 w-2/3 focus:border-indigo-500 outline-none"
                            placeholder="Título (Ex: Overgrow)"
                        />
                        <button 
                            onClick={() => removePassive(idx)}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Remover"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea 
                        rows={3}
                        value={p.description}
                        onChange={(e) => handlePassiveChange(idx, 'description', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-600 focus:border-indigo-500 outline-none resize-none"
                        placeholder="Descrição do efeito..."
                    />
                </div>
            ))}
            {data.passives.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">Nenhuma passiva adicionada.</p>
            )}
        </div>
      </div>

      {/* Affinities */}
      <div className="bg-white p-4 border border-slate-300">
         <label className="block text-sm font-bold mb-3 text-slate-700 uppercase tracking-wide">Afinidades Elementais</label>
         <div className="flex flex-col gap-2">
            {renderTypeSelector("Vulnerabilidades", "vulnerabilities", "text-red-600")}
            <div className="border-t border-slate-100 my-1"></div>
            {renderTypeSelector("Resistências", "resistances", "text-blue-600")}
            <div className="border-t border-slate-100 my-1"></div>
            {renderTypeSelector("Invulnerabilidades", "immunities", "text-slate-600")}
         </div>
      </div>

      {/* Moves List */}
      <div className="bg-white p-4 border border-slate-300">
        <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Lista de Movimentos / Evolução</label>
            <button 
                onClick={addMove}
                className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 uppercase hover:bg-indigo-100 flex items-center gap-1"
            >
                <Plus size={12} /> Adicionar
            </button>
        </div>
        
        <div className="space-y-3">
            {data.moves.map((move, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-2 relative group flex items-start gap-2">
                    <div className="w-1/3">
                         <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Título / Nível</label>
                        <input 
                            type="text" 
                            value={move.title}
                            onChange={(e) => handleMoveChange(idx, 'title', e.target.value)}
                            className="w-full bg-white border border-slate-300 text-xs font-bold text-slate-800 p-1.5 focus:border-indigo-500 outline-none"
                            placeholder="Ex: Level 5"
                        />
                    </div>
                    <div className="flex-1">
                         <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Movimentos / Conteúdo</label>
                        <input 
                            type="text"
                            value={move.content}
                            onChange={(e) => handleMoveChange(idx, 'content', e.target.value)}
                            className="w-full bg-white border border-slate-300 text-xs text-slate-600 p-1.5 focus:border-indigo-500 outline-none"
                            placeholder="Ex: Ember, Scratch"
                        />
                    </div>
                    <button 
                        onClick={() => removeMove(idx)}
                        className="text-red-400 hover:text-red-600 p-1 self-center mt-3"
                        title="Remover"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            {data.moves.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">Nenhum movimento adicionado.</p>
            )}
        </div>
      </div>

      {/* Defense Section */}
      <div className="bg-white p-4 border border-slate-300">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-bold text-cyan-700 flex items-center gap-2 uppercase tracking-wide">
            <Shield size={16} /> Defesa
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.hasDT} 
              onChange={(e) => updateField('hasDT', e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        </div>

        {data.hasDT && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  checked={data.dtProf} 
                  onChange={(e) => updateField('dtProf', e.target.checked)}
                  className="w-4 h-4 text-cyan-600" 
                />
                <span className="text-xs font-bold text-slate-600">+ Perícia</span>
              </label>
            </div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Atributos de Defesa</label>
            <div className="flex gap-1 flex-wrap">
              {ATTRIBUTE_ORDER.map(attr => (
                <div key={attr} className="flex-1 min-w-[40px]">
                   <input 
                    type="checkbox" 
                    id={`dt-mon-${attr}`} 
                    checked={data.dtAttributes[attr as keyof typeof data.dtAttributes]}
                    onChange={(e) => updateNested('dtAttributes', attr, e.target.checked)}
                    className="peer sr-only" 
                   />
                   <label htmlFor={`dt-mon-${attr}`} className="flex items-center justify-center w-full py-1.5 bg-white border border-slate-300 text-slate-400 text-xs font-bold cursor-pointer transition-all hover:bg-slate-50 peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-600">
                     {attr}
                   </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions Buttons */}
      <div className="grid grid-cols-2 gap-3">
         <button 
            onClick={onCopyCurrent}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 shadow-sm transition text-xs uppercase tracking-wide flex items-center justify-center gap-2"
         >
            <Copy size={16} /> Copiar Texto
         </button>
         <button 
            onClick={onReset}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 shadow-sm transition text-xs uppercase tracking-wide flex items-center justify-center gap-2"
         >
            <RotateCcw size={16} /> Limpar Campos
         </button>
      </div>

      {/* Save Button */}
      <button 
        onClick={onSave}
        className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-4 shadow-sm transition transform hover:scale-[1.01] flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
      >
        <Edit3 size={16} /> Salvar na Lista
      </button>
    </div>
  );
};
