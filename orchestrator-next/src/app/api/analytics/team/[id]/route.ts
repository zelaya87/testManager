import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reportAnalysisService } from "@/services/report-analysis-service";
import { teamService } from "@/services/team-service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verifica se o usuário é membro da equipe
    const team = await teamService.getTeam(params.id);
    if (!team) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      );
    }

    const isMember = team.members.some(
      (member) => member.userId === session.user.id
    );
    if (!isMember) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const analytics = await reportAnalysisService.getTeamAnalytics(params.id);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Erro ao buscar análises:", error);
    return NextResponse.json(
      { error: "Erro ao buscar análises" },
      { status: 500 }
    );
  }
}
