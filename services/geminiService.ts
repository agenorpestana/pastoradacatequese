
import { GoogleGenAI } from "@google/genai";
import { Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanAIResponse = (text: string): string => {
  let cleaned = text.replace(/^(Aqui está|Com base|Gerei uma|Segue uma|Esta é uma).*?:/i, '');
  cleaned = cleaned.replace(/^"|"$|^\*\*|\*\*$/g, '');
  const userSpecificPattern = /Aqui está uma proposta acolhedora e personalizada.*?:\s*\*\*/i;
  cleaned = cleaned.replace(userSpecificPattern, '');
  return cleaned.trim();
};

export const generateSpiritualGoal = async (student: Student): Promise<string> => {
  try {
    const age = student.dataNascimento ? calculateAge(student.dataNascimento) : "Idade não informada";
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base nas informações do catequizando: Nome: ${student.nomeCompleto}, Idade: ${age}, Turma: ${student.turma || 'Não definida'}, Sacramentos: ${student.batizado ? 'Batizado' : 'Não batizado'}. 
      Gere um pequeno parágrafo motivacional e um objetivo espiritual personalizado para este ano de catequese em português brasileiro. 
      Seja acolhedor e pastoral. 
      
      IMPORTANTE: Retorne APENAS o texto da mensagem de boas-vindas e o objetivo. 
      NÃO inclua introduções. Comece diretamente na mensagem de acolhida.`,
    });

    const resultText = response.text || "Bem-vindo à jornada de fé! Que Deus ilumine seu caminho.";
    return cleanAIResponse(resultText);
  } catch (error) {
    console.error("Erro ao gerar objetivo espiritual:", error);
    return "Que este ano seja repleto de crescimento espiritual e amizade com Jesus.";
  }
};

function calculateAge(birthday: string) {
  if (!birthday) return "N/D";
  const birthDate = new Date(birthday);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
