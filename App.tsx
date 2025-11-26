import React, { useState } from 'react';
import { Search, MapPin, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from './components/Button';
import { ReportView } from './components/ReportView';
import { generateAuditReport } from './services/geminiService';
import { AuditResult } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateAuditReport(query);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-500/20">
              <MapPin className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AuditMaps</h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Como funciona</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Exemplos</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Search Section */}
        {!result && (
          <div className="w-full max-w-3xl text-center space-y-8 animate-fade-in mt-10">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-2xl mb-4 shadow-inner">
                <BarChart3 className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Descubra onde seu negócio<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">está perdendo clientes</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Nossa IA analisa seu perfil no Google Maps e revela problemas ocultos de reputação, visual e engajamento.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome do local ou link do Maps..."
                className="block w-full pl-12 pr-4 py-5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-xl shadow-slate-200/40 transition-all text-lg"
              />
              <div className="mt-8">
                <Button 
                  type="submit" 
                  disabled={!query.trim()} 
                  isLoading={isLoading}
                  className="w-full md:w-auto min-w-[220px] text-lg py-4"
                >
                  Gerar Relatório Grátis
                </Button>
              </div>
            </form>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
              <div className="p-6 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                    <AlertCircle className="text-red-500 w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Diagnóstico de Perdas</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Entenda exatamente qual porcentagem de clientes você perde por fotos ruins ou falta de respostas.</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="text-emerald-500 w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Score de Saúde</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Uma nota simples de 0 a 100 que resume sua presença digital comparada aos concorrentes.</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Ação Imediata</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Receba um checklist prático do que mudar hoje para começar a atrair mais clientes amanhã.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 text-red-700 mb-8 shadow-sm">
            <AlertCircle size={24} className="flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="w-full animate-fade-in-up">
            <div className="flex justify-center mb-10">
               <button 
                onClick={() => setResult(null)}
                className="group px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-500 hover:text-blue-600 hover:border-blue-200 flex items-center gap-2 transition-all shadow-sm"
               >
                 <span className="group-hover:-translate-x-1 transition-transform">←</span> Fazer nova pesquisa
               </button>
            </div>
            <ReportView result={result} />
          </div>
        )}

      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} AuditMaps. Inteligência Artificial aplicada a Negócios Locais.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
