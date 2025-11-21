
import React, { useRef, useState, useEffect } from 'react';
import { MoveData, ELEMENT_TYPES, CONDITIONS_LIST } from '../types';
import { Edit3, Shield, Crosshair, Sparkles, Loader2, Palette, Download, Copy, RotateCcw, Upload, Import, ArrowUpDown, Star, Disc } from 'lucide-react';

interface CardFormProps {
  data: MoveData;
  onChange: (newData: MoveData) => void;
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

const PP_PD_MAP: Record<string, string> = {
  '1': '30',
  '2': '25',
  '3': '20',
  '5': '15',
  '10': '10',
  '15': '5',
  '20': '2'
};

export const CardForm: React.FC<CardFormProps> = ({ 
  data, onChange, onSave, onCopyCurrent, onReset, onImport, onGenerateArt, onGenerateTexture, 
  isGenerating, isGeneratingTexture, hasTexture 
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState('');

  const updateField = (field: keyof MoveData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handlePPChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPP = e.target.value;
    const newPD = PP_PD_MAP[newPP] || '0';
    onChange({ ...data, pp: newPP, pd: newPD });
  };

  const updateNested = (category: 'hitAttributes' | 'dtAttributes' | 'stats', key: string, val: boolean) => {
    onChange({
      ...data,
      [category]: {
        ...data[category],
        [key]: val
      }
    });
  };

  const toggleCondition = (label: string) => {
    const current = [...data.conditions];
    if (current.includes(label)) {
      onChange({ ...data, conditions: current.filter(c => c !== label) });
    } else {
      onChange({ ...data, conditions: [...current, label] });
    }
  };

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
    link.download = `art-${data.id || 'move'}.png`;
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
          <Edit3 size={18} /> Editor de Dados
        </h2>

        <div className="space-y-6">
          {/* Name & ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Ataque & Imagem</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={data.name} 
                  onChange={handleNameChange}
                  placeholder="Ex: Fire Blast" 
                  className="w-full p-2 bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none transition text-slate-900 font-bold"
                />
                
                <button 
                  onClick={triggerFileUpload}
                  className="bg-slate-600 hover:bg-slate-700 text-white p-2 shadow-sm transition flex items-center justify-center min-w-[44px]"
                  title="Upload de Imagem do Computador"
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
                    title="Baixar Arte (Apenas Imagem)"
                  >
                    <Download size={18} />
                  </button>
                )}
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
                <label className="block text-xs font-bold text-slate-500 uppercase">Tipo Elemental</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {ELEMENT_TYPES.map((type) => (
                <label 
                  key={type.id} 
                  className={`cursor-pointer relative flex-1 min-w-[80px] px-2 py-2 text-[10px] font-bold uppercase transition-transform flex items-center justify-center shadow-sm text-white hover:opacity-90 ${data.type === type.id ? 'ring-2 ring-offset-1 ring-slate-400 scale-105 z-10' : 'opacity-80'}`}
                  style={{ backgroundColor: type.color }}
                >
                  <input 
                    type="radio" 
                    name="type" 
                    value={type.id}
                    checked={data.type === type.id}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="sr-only"
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>
          
           {/* Shiny & Foil Toggles */}
           <div className="flex gap-3">
              <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 border rounded text-xs font-bold uppercase transition-all flex-1 justify-center ${data.isShiny ? 'bg-yellow-100 border-yellow-300 text-yellow-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                   <input 
                      type="checkbox" 
                      checked={data.isShiny} 
                      onChange={(e) => updateField('isShiny', e.target.checked)}
                      className="sr-only"
                   />
                   <Sparkles size={14} className={data.isShiny ? 'text-yellow-500' : 'text-slate-400'} />
                   Shiny
              </label>
              
              <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 border rounded text-xs font-bold uppercase transition-all flex-1 justify-center ${data.isFoil ? 'bg-purple-100 border-purple-300 text-purple-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                   <input 
                      type="checkbox" 
                      checked={data.isFoil} 
                      onChange={(e) => updateField('isFoil', e.target.checked)}
                      className="sr-only"
                   />
                   <Disc size={14} className={data.isFoil ? 'text-purple-500' : 'text-slate-400'} />
                   Foil
              </label>
          </div>

        </div>
      </div>

      {/* Properties Section */}
      <div className="bg-white p-4 border border-slate-300">
          <label className="block text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-1 uppercase tracking-wide">
              Propriedades Básicas
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-2">
                <div className="w-2/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PP</label>
                    <select 
                        value={data.pp} 
                        onChange={handlePPChange}
                        className="w-full p-2 bg-slate-50 border border-slate-300 font-medium"
                    >
                        {Object.keys(PP_PD_MAP).sort((a,b) => Number(a) - Number(b)).map(val => (
                            <option key={val} value={val}>{val} PP</option>
                        ))}
                    </select>
                </div>
                <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PD</label>
                    <input 
                        type="text" 
                        value={data.pd} 
                        readOnly
                        className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-center"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Ação</label>
                <select 
                value={data.actionType} 
                onChange={(e) => updateField('actionType', e.target.value)}
                className="w-full p-2 bg-yellow-50 border border-yellow-300 text-yellow-900 font-medium"
                >
                <option>Ação Padrão</option>
                <option>Ação Livre</option>
                <option>Ação de Movimento</option>
                <option>Reação</option>
                <option>Ação Completa</option>
                </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duração</label>
              <select 
                value={data.duration} 
                onChange={(e) => updateField('duration', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 font-medium"
              >
                <option>Instantânea</option>
                <option>1 Rodada</option>
                <option>Cena</option>
                <option>Sustentada</option>
                <option>Permanente</option>
              </select>
            </div>

             <div className="col-span-1 md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alcance / Distância</label>
                <div className="flex gap-2">
                    <select 
                    value={data.range} 
                    onChange={(e) => updateField('range', e.target.value)}
                    className="w-1/2 p-2 bg-slate-50 border border-slate-300 font-medium text-sm"
                    >
                    <option>Pessoal</option>
                    <option>Adjacente</option>
                    <option>Curto</option>
                    <option>Curto (Ext)</option>
                    <option>Médio</option>
                    <option>Longo</option>
                    <option>Ilimitado</option>
                    </select>
                    <input 
                    type="text" 
                    value={data.distance}
                    onChange={(e) => updateField('distance', e.target.value)}
                    placeholder="Ex: 1.5m"
                    className="w-1/2 p-2 bg-slate-50 border border-slate-300 font-medium text-sm"
                    />
                </div>
            </div>
          </div>
      </div>

      {/* Stats */}
      <div className="bg-white p-4 border border-slate-300">
        <label className="block text-sm font-bold mb-3 text-slate-700 uppercase tracking-wide">Atributos na Descrição</label>
        <div className="flex gap-1 flex-wrap">
          {ATTRIBUTE_ORDER.map(attr => {
            const colors = {
               FOR: 'peer-checked:bg-red-500 peer-checked:border-red-500',
               AGI: 'peer-checked:bg-green-500 peer-checked:border-green-500',
               INT: 'peer-checked:bg-blue-500 peer-checked:border-blue-500',
               PRE: 'peer-checked:bg-purple-500 peer-checked:border-purple-500',
               VIG: 'peer-checked:bg-yellow-500 peer-checked:border-yellow-500',
               ATR: 'peer-checked:bg-slate-500 peer-checked:border-slate-500',
            };
            const colorClass = colors[attr as keyof typeof colors];
            return (
              <div key={attr} className="flex-1 min-w-[50px]">
                  <input 
                    type="checkbox" 
                    id={`stat-${attr}`} 
                    checked={data.stats[attr as keyof typeof data.stats]}
                    onChange={(e) => updateNested('stats', attr, e.target.checked)}
                    className="peer sr-only" 
                  />
                  <label htmlFor={`stat-${attr}`} className={`flex items-center justify-center w-full py-1 border border-slate-300 text-slate-400 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-all peer-checked:text-white ${colorClass}`}>
                    {attr}
                  </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-4 border border-slate-300">
        <label className="block text-sm font-bold text-slate-700 uppercase mb-2 tracking-wide">Descrição / Efeito</label>
        <textarea 
          rows={4} 
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full p-3 bg-white border border-slate-300 text-slate-700 leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Descreva o efeito mecânico e narrativo..."
        />
      </div>

      {/* Conditions */}
      <div className="bg-white p-4 border border-slate-300">
         <label className="block text-sm font-bold mb-3 text-slate-700 uppercase tracking-wide">Condições Causadas</label>
         <div className="flex flex-wrap gap-2">
            {CONDITIONS_LIST.map(cond => {
               const isChecked = data.conditions.includes(cond.label);
               return (
                 <button
                   key={cond.id}
                   onClick={() => toggleCondition(cond.label)}
                   className={`flex-1 min-w-[80px] py-1 px-2 border text-xs font-bold transition-all ${isChecked ? 'text-white' : 'bg-white text-slate-500 border-slate-300'}`}
                   style={{ 
                     backgroundColor: isChecked ? cond.color : undefined, 
                     borderColor: isChecked ? cond.color : undefined,
                     color: !isChecked ? cond.color : undefined
                   }}
                 >
                   {cond.label}
                 </button>
               )
            })}
         </div>
      </div>

      {/* Scaling */}
      <div className="bg-white p-4 border border-slate-300">
          <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Escalonamento de Dano</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.hasScaling} 
                    onChange={(e) => updateField('hasScaling', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
          </div>
          
          {data.hasScaling && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-end mb-2">
                    <label className="flex items-center gap-2 bg-blue-50 px-2 py-1 border border-blue-200 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={data.addAtrToScaling} 
                          onChange={(e) => updateField('addAtrToScaling', e.target.checked)}
                          className="w-3 h-3 text-blue-600" 
                        />
                        <span className="text-[10px] font-bold text-blue-700 uppercase">Add + ATR</span>
                    </label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['lvl1', 'lvl5', 'lvl10', 'lvl15'].map((lvl) => (
                    <div key={lvl}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block text-center">{lvl.toUpperCase()}</label>
                      <input 
                        type="text" 
                        value={data[lvl as keyof MoveData] as string} 
                        onChange={(e) => updateField(lvl as keyof MoveData, e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-300 text-sm text-center font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  ))}
                </div>
            </div>
          )}
      </div>

      {/* HIT Section */}
      <div className="bg-white p-4 border border-slate-300">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
            <Crosshair size={16} /> Teste de Acerto
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.hasHit} 
              onChange={(e) => updateField('hasHit', e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-700"></div>
          </label>
        </div>

        {data.hasHit && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  checked={data.hitProf} 
                  onChange={(e) => updateField('hitProf', e.target.checked)}
                  className="w-4 h-4 text-slate-600" 
                />
                <span className="text-xs font-bold text-slate-600">+ Perícia</span>
              </label>
            </div>
            
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Atributo (Múltiplos)</label>
            <div className="flex gap-1 flex-wrap">
              {ATTRIBUTE_ORDER.map(attr => (
                <div key={attr} className="flex-1 min-w-[40px]">
                   <input 
                    type="checkbox" 
                    id={`hit-${attr}`} 
                    checked={data.hitAttributes[attr as keyof typeof data.hitAttributes]}
                    onChange={(e) => updateNested('hitAttributes', attr, e.target.checked)}
                    className="peer sr-only" 
                   />
                   <label htmlFor={`hit-${attr}`} className="flex items-center justify-center w-full py-1.5 bg-white border border-slate-300 text-slate-400 text-xs font-bold cursor-pointer transition-all hover:bg-slate-50 peer-checked:bg-slate-700 peer-checked:text-white peer-checked:border-slate-700">
                     {attr}
                   </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DT Section */}
      <div className="bg-white p-4 border border-slate-300">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-bold text-cyan-700 flex items-center gap-2 uppercase tracking-wide">
            <Shield size={16} /> Dificuldade (DT)
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
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Atributos Chave</label>
            <div className="flex gap-1 flex-wrap">
              {ATTRIBUTE_ORDER.map(attr => (
                <div key={attr} className="flex-1 min-w-[40px]">
                   <input 
                    type="checkbox" 
                    id={`dt-${attr}`} 
                    checked={data.dtAttributes[attr as keyof typeof data.dtAttributes]}
                    onChange={(e) => updateNested('dtAttributes', attr, e.target.checked)}
                    className="peer sr-only" 
                   />
                   <label htmlFor={`dt-${attr}`} className="flex items-center justify-center w-full py-1.5 bg-white border border-slate-300 text-slate-400 text-xs font-bold cursor-pointer transition-all hover:bg-slate-50 peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-600">
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
            <Copy size={16} /> Copiar Texto (Excel)
         </button>
         <button 
            onClick={onReset}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 shadow-sm transition text-xs uppercase tracking-wide flex items-center justify-center gap-2"
         >
            <RotateCcw size={16} /> Limpar Campos
         </button>
      </div>

      <button 
        onClick={onSave}
        className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-4 shadow-sm transition transform hover:scale-[1.01] flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
      >
        <Edit3 size={16} /> Salvar na Lista (Excel)
      </button>
    </div>
  );
};
