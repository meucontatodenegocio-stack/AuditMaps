import React from 'react';
import { jsPDF } from 'jspdf';
import { Download, ExternalLink, TrendingDown, AlertTriangle, CheckCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { AuditResult } from '../types';
import { Button } from './Button';

interface ReportViewProps {
  result: AuditResult;
}

export const ReportView: React.FC<ReportViewProps> = ({ result }) => {
  const { data, sources } = result;

  // Cor do gráfico baseada no score
  const getScoreBarColor = (score: number) => {
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // --- Header Background ---
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Inteligência", margin, 25);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Análise para: ${data.businessName}`, margin, 35);

    let y = 65;

    // --- Health Score Section ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnóstico de Saúde Digital", margin, y);
    y += 10;

    // Draw Score Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, 60, 30, 3, 3, 'FD');
    
    doc.setFontSize(28);
    doc.setTextColor(getScoreBarColor(data.healthScore));
    doc.text(`${data.healthScore}/100`, margin + 30, y + 18, { align: 'center' });
    
    // Summary Text next to score
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(data.summary, 100);
    doc.text(summaryLines, margin + 70, y + 8);
    
    y += 45;

    // --- Audience Loss Charts (The Visual Part) ---
    if (data.audienceLossAnalysis && data.audienceLossAnalysis.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Onde você está perdendo clientes (Estimativa)", margin, y);
      y += 15;

      data.audienceLossAnalysis.forEach((item) => {
        if (y > pageHeight - 40) { doc.addPage(); y = 20; }

        // Label
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(item.category || "Fator desconhecido", margin, y);
        
        // Percentage Text
        doc.setFont("helvetica", "normal");
        doc.setTextColor(220, 38, 38); // Red color for loss
        doc.text(`-${item.percentage}% Perda`, pageWidth - margin, y, { align: 'right' });
        
        y += 3;

        // Draw Background Bar
        doc.setFillColor(229, 231, 235); // gray-200
        doc.rect(margin, y, pageWidth - (margin * 2), 4, 'F');

        // Draw Value Bar
        doc.setFillColor(220, 38, 38); // red-600
        const barWidth = (pageWidth - (margin * 2)) * ((item.percentage || 0) / 100);
        doc.rect(margin, y, barWidth, 4, 'F');
        
        y += 8;

        // Reason text
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(item.reason || "", margin, y);
        
        y += 12;
      });

      y += 10;
    }

    // --- Action Plan ---
    if (y > pageHeight - 60) { doc.addPage(); y = 20; }
    
    if (data.immediateActionPlan && data.immediateActionPlan.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Plano de Ação Imediato", margin, y);
      y += 10;

      data.immediateActionPlan.forEach((plan, i) => {
        if (y > pageHeight - 20) { doc.addPage(); y = 20; }
        
        doc.setFillColor(37, 99, 235); // Blue bullet
        doc.circle(margin + 2, y - 1, 1, 'F');
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        
        const planLines = doc.splitTextToSize(plan, pageWidth - margin - 30);
        doc.text(planLines, margin + 10, y);
        y += (planLines.length * 5) + 5;
      });
    }

    // --- Weaknesses & Improvements ---
    if (y > pageHeight - 60) { doc.addPage(); y = 20; }

    // Improvements
    if (data.improvements && data.improvements.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105); // Green
      doc.text("Oportunidades de Melhoria:", margin, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      data.improvements.forEach(imp => {
        const lines = doc.splitTextToSize(`• ${imp}`, pageWidth - margin - margin);
        doc.text(lines, margin, y);
        y += (lines.length * 5) + 2;
      });
      
      y += 10;
    }
    
    // Weaknesses
    if (data.negativePoints && data.negativePoints.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38); // Red
      doc.text("Pontos Críticos:", margin, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      data.negativePoints.forEach(neg => {
        const lines = doc.splitTextToSize(`• ${neg}`, pageWidth - margin - margin);
        doc.text(lines, margin, y);
        y += (lines.length * 5) + 2;
      });
    }

    // Footer
    const today = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Gerado por AuditMaps IA em ${today}`, margin, pageHeight - 10);

    doc.save(`auditoria-${data.businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* --- Top Bar Actions --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-2 rounded-full">
            <CheckCircle className="text-emerald-600 h-5 w-5" />
          </div>
          <span className="font-semibold text-slate-700">Relatório Gerado com Sucesso</span>
        </div>
        <Button onClick={handleDownloadPDF} variant="primary" className="w-full sm:w-auto shadow-blue-200">
          <Download size={18} />
          Baixar PDF Profissional
        </Button>
      </div>

      {/* --- Main Dashboard Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Score & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Health Score Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className={`absolute top-0 w-full h-2 ${data.healthScore > 70 ? 'bg-emerald-500' : data.healthScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
            <h3 className="text-slate-500 font-medium uppercase tracking-wider text-xs mb-4">Digital Health Score</h3>
            
            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className={`${data.healthScore > 70 ? 'text-emerald-500' : data.healthScore > 40 ? 'text-amber-500' : 'text-red-500'}`}
                  strokeDasharray={`${data.healthScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <span className="absolute text-4xl font-bold text-slate-800">{data.healthScore}</span>
            </div>
            
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              {data.summary}
            </p>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Fontes Analisadas</h4>
              <div className="space-y-2">
                {sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-xs truncate">
                    <ExternalLink size={12} />
                    {s.title || "Google Maps Data"}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Loss Analysis & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Loss Analysis Charts */}
          {data.audienceLossAnalysis.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Perda Estimada de Público</h3>
                  <p className="text-slate-500 text-sm">Onde você está deixando dinheiro na mesa.</p>
                </div>
              </div>

              <div className="space-y-6">
                {data.audienceLossAnalysis.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-medium text-slate-700">{item.category}</span>
                      <span className="text-red-600 font-bold text-sm">-{item.percentage}% Impacto</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <AlertTriangle size={10} className="text-amber-500" />
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {data.immediateActionPlan.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Plano de Ação Imediato</h3>
                  <p className="text-slate-500 text-sm">Passos para estancar a perda de clientes hoje.</p>
                </div>
              </div>

              <div className="space-y-3">
                {data.immediateActionPlan.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid for Improvements vs Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.improvements.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-slate-200">
                <h4 className="text-emerald-600 font-bold mb-4 flex items-center gap-2">
                  <CheckCircle size={18} /> Oportunidades
                </h4>
                <ul className="space-y-2">
                  {data.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <ChevronRight size={14} className="mt-1 text-emerald-400 flex-shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.negativePoints.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-slate-200">
                <h4 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} /> Pontos Críticos
                </h4>
                <ul className="space-y-2">
                  {data.negativePoints.map((neg, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <ChevronRight size={14} className="mt-1 text-red-400 flex-shrink-0" />
                      {neg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};