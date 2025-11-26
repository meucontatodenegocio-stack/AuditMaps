import { GoogleGenAI } from "@google/genai";
import { AuditResult, GroundingSource, StructuredAuditData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAuditReport = async (query: string): Promise<AuditResult> => {
  try {
    // Como não podemos usar responseSchema com Tools, definimos a estrutura no prompt.
    const prompt = `
      Atue como um Consultor Especialista em Growth Hacking e Reputação Online.
      O usuário forneceu o local para auditoria: "${query}".

      PASSO 1: PESQUISA
      Use o Google Search para encontrar reviews, site oficial, redes sociais, fotos e reputação deste local.
      
      PASSO 2: ANÁLISE
      Baseado nos dados reais encontrados, gere uma análise crítica.
      - Estime um "Health Score" (0-100).
      - Crie uma "Análise de Perda de Público" (Audience Loss Analysis). Invente métricas estimadas baseadas nos erros reais encontrados (ex: "30% de perda por reviews negativas").

      PASSO 3: FORMATO DE RESPOSTA
      Você DEVE retornar APENAS um JSON válido. Não inclua Markdown, não inclua explicações extras fora do JSON.
      
      Siga ESTRITAMENTE esta estrutura JSON:
      {
        "businessName": "Nome Oficial do Local",
        "healthScore": 0,
        "summary": "Resumo executivo curto e direto.",
        "audienceLossAnalysis": [
          { "category": "Ex: Atendimento", "percentage": 15, "reason": "Muitas queixas sobre demora." },
          { "category": "Ex: Visual", "percentage": 10, "reason": "Fotos antigas ou de baixa qualidade." }
        ],
        "positivePoints": ["Ponto positivo 1", "Ponto positivo 2"],
        "negativePoints": ["Ponto negativo 1", "Ponto negativo 2"],
        "improvements": ["Sugestão técnica 1", "Sugestão técnica 2"],
        "immediateActionPlan": ["Ação imediata 1", "Ação imediata 2", "Ação imediata 3", "Ação imediata 4", "Ação imediata 5"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} }
        ],
        // REMOVIDO: responseMimeType e responseSchema causam conflito com Tools
        // A IA agora é instruída via prompt a retornar JSON.
      },
    });

    let jsonText = response.text || "{}";
    
    // Limpeza robusta de Markdown (remove ```json, ``` e espaços extras)
    jsonText = jsonText
      .replace(/^```json\s*/g, "")
      .replace(/^```\s*/g, "")
      .replace(/\s*```$/g, "")
      .trim();

    // Tenta encontrar o JSON se houver texto antes ou depois
    const jsonStartIndex = jsonText.indexOf('{');
    const jsonEndIndex = jsonText.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    let parsedData: StructuredAuditData;
    
    try {
      parsedData = JSON.parse(jsonText) as StructuredAuditData;
    } catch (e) {
      console.error("Erro ao fazer parse do JSON cru:", jsonText);
      throw new Error("A IA retornou um formato inválido. Tente novamente.");
    }

    // Validação e Defaults para evitar crash na UI
    if (!parsedData.businessName) parsedData.businessName = query;
    if (typeof parsedData.healthScore !== 'number') parsedData.healthScore = 50;
    if (!parsedData.summary) parsedData.summary = "Análise concluída. Veja os detalhes abaixo.";
    if (!Array.isArray(parsedData.audienceLossAnalysis)) parsedData.audienceLossAnalysis = [];
    if (!Array.isArray(parsedData.positivePoints)) parsedData.positivePoints = [];
    if (!Array.isArray(parsedData.negativePoints)) parsedData.negativePoints = [];
    if (!Array.isArray(parsedData.improvements)) parsedData.improvements = [];
    if (!Array.isArray(parsedData.immediateActionPlan)) parsedData.immediateActionPlan = [];

    // Extract grounding sources com segurança
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = rawChunks
      .flatMap((chunk: any) => {
        if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
        return [];
      })
      .filter((v, i, a) => a.findIndex((t) => t.uri === v.uri) === i);

    return {
      data: parsedData,
      sources,
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("SAFETY")) {
      throw new Error("A análise foi bloqueada pelos filtros de segurança.");
    }
    throw new Error(error.message || "Falha ao realizar a auditoria. Tente novamente.");
  }
};