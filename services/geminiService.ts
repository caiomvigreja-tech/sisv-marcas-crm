
import { GoogleGenAI } from "@google/genai";
import { Lead, LeadStatus } from "../types";

export const generatePitch = async (lead: Lead): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const context = lead.status === LeadStatus.VIABILIDADE_APROVADA 
      ? "A marca dele foi aprovada e tem grandes chances de registro." 
      : "A marca dele tem conflitos ou é de difícil registro, precisamos oferecer uma consultoria estratégica.";

    const prompt = `
      Especialista SISV Marcas.
      Nome: ${lead.name}
      Marca: ${lead.brandName}
      Status: ${lead.status}
      Contexto: ${context}
      Crie abordagem WhatsApp curta e persuasiva. Sem hashtags.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    });
    
    return response.text || "Abordagem gerada: Olá ${lead.name}, temos novidades sobre a marca ${lead.brandName}. Podemos falar?";
  } catch (error: any) {
    // Tratamento silencioso para aborto de sinal
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      return "O assistente de IA está ocupado. Tente novamente em instantes.";
    }
    console.warn("IA indisponível no momento.");
    return `Olá ${lead.name}, sou da SISV Marcas. Vi seu interesse no registro da marca ${lead.brandName}. Vamos agendar uma breve reunião de viabilidade?`;
  }
};
