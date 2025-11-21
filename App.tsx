import React, { useState } from 'react';
import { Scroll, Zap, Skull } from 'lucide-react';
import { AbilityPage } from './components/AbilityPage';
import { MonsterPage } from './components/MonsterPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ability' | 'monster'>('ability');

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <header className="mb-8 text-center">
         <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight uppercase font-rpg flex items-center justify-center gap-3">
             <Scroll className="text-indigo-600" size={32} /> Ramon
         </h1>
         <p className="text-slate-500 font-medium">Gerador de Cartas para RPG</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('ability')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm uppercase tracking-wide transition-all ${
              activeTab === 'ability' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Zap size={16} /> Habilidade Template
          </button>
          <button
            onClick={() => setActiveTab('monster')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm uppercase tracking-wide transition-all ${
              activeTab === 'monster' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Skull size={16} /> Monstro Template
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="transition-all duration-300">
        {activeTab === 'ability' ? <AbilityPage /> : <MonsterPage />}
      </div>
    </div>
  );
}