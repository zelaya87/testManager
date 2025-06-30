import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ReportAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  riskAreas: string[];
  performanceMetrics: {
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
  };
}

interface ReportContent {
  testResults: Array<{
    feature: string;
    scenario: string;
    status: string;
    duration: number;
    error?: string;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

export const reportAnalysisService = {
  async analyzeReport(
    reportPath: string,
    projectId: string
  ): Promise<ReportAnalysis> {
    // Extrair conteúdo do relatório HTML
    const reportContent = await this.extractReportContent(reportPath);

    // Preparar prompt para a IA
    const prompt = this.prepareAnalysisPrompt(reportContent);

    // Obter análise da IA
    const analysis = await this.getAIAnalysis(prompt);

    // Salvar análise no banco
    await this.saveAnalysis(analysis, projectId);

    return analysis;
  },

  async extractReportContent(reportPath: string): Promise<ReportContent> {
    // Implementar extração do conteúdo do relatório HTML
    // Pode usar bibliotecas como cheerio para parse do HTML
    // Retornar estrutura padronizada dos resultados
  },

  prepareAnalysisPrompt(content: ReportContent): string {
    return `
      Analise os seguintes resultados de testes:
      Total de testes: ${content.summary.total}
      Testes passados: ${content.summary.passed}
      Testes falhos: ${content.summary.failed}
      Duração total: ${content.summary.duration}ms

      Detalhes dos testes:
      ${content.testResults
        .map(
          (test) => `
        Feature: ${test.feature}
        Cenário: ${test.scenario}
        Status: ${test.status}
        Duração: ${test.duration}ms
        ${test.error ? `Erro: ${test.error}` : ""}
      `
        )
        .join("\n")}

      Por favor, forneça:
      1. Um resumo conciso dos resultados
      2. Insights importantes sobre os padrões de falha
      3. Recomendações para melhorar a qualidade dos testes
      4. Áreas de risco identificadas
      5. Análise de performance dos testes
    `;
  },

  async getAIAnalysis(prompt: string): Promise<ReportAnalysis> {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em análise de testes automatizados. Forneça insights técnicos e recomendações práticas.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    // Processar e estruturar a resposta da IA
    const analysis = this.parseAIResponse(response.choices[0].message.content);
    return analysis;
  },

  parseAIResponse(content: string): ReportAnalysis {
    // Implementar parse da resposta da IA para estrutura padronizada
    // Usar regex ou parsing estruturado para extrair cada seção
  },

  async saveAnalysis(analysis: ReportAnalysis, projectId: string) {
    await prisma.testAnalysis.create({
      data: {
        projectId,
        summary: analysis.summary,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        riskAreas: analysis.riskAreas,
        performanceMetrics: analysis.performanceMetrics,
        createdAt: new Date(),
      },
    });
  },

  async getProjectAnalytics(projectId: string) {
    return prisma.testAnalysis.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  },

  async getTeamAnalytics(teamId: string) {
    const projects = await prisma.testProject.findMany({
      where: { teamId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    return prisma.testAnalysis.findMany({
      where: {
        projectId: { in: projectIds },
      },
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });
  },
};
