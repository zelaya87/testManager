import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { testHistoryService } from "@/services/test-history-service";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const environment = searchParams.get("environment");

    let history;
    if (projectId) {
      history = await testHistoryService.getTestExecutionsByProject(projectId);
    } else if (category) {
      history = await testHistoryService.getTestExecutionsByCategory(category);
    } else if (type) {
      history = await testHistoryService.getTestExecutionsByType(type);
    } else if (environment) {
      history = await testHistoryService.getTestExecutionsByEnvironment(
        environment
      );
    } else {
      history = await testHistoryService.getTestHistory(session.user.id);
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
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
    const execution = await testHistoryService.createTestExecution({
      ...data,
      userId: session.user.id,
    });

    return NextResponse.json(execution);
  } catch (error) {
    console.error("Erro ao criar execução:", error);
    return NextResponse.json(
      { error: "Erro ao criar execução" },
      { status: 500 }
    );
  }
}
