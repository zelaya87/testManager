import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reportAnalysisService } from "@/services/report-analysis-service";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const teamId = searchParams.get("teamId");

    let analytics;
    if (projectId) {
      analytics = await reportAnalysisService.getProjectAnalytics(projectId);
    } else if (teamId) {
      analytics = await reportAnalysisService.getTeamAnalytics(teamId);
    } else {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Erro ao buscar análises:", error);
    return NextResponse.json(
      { error: "Erro ao buscar análises" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const analysis = await reportAnalysisService.createAnalysis(data);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Erro ao criar análise:", error);
    return NextResponse.json(
      { error: "Erro ao criar análise" },
      { status: 500 }
    );
  }
}
