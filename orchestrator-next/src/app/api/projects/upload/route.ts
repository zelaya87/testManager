import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Verifica o tipo do arquivo
    const allowedTypes = [
      "application/zip",
      "application/x-tar",
      "application/gzip",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado" },
        { status: 400 }
      );
    }

    // Gera um nome único para o arquivo
    const fileName = `${randomUUID()}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define o diretório de upload
    const uploadDir = join(process.cwd(), "uploads");
    const filePath = join(uploadDir, fileName);

    // Salva o arquivo
    await writeFile(filePath, buffer);

    // Se estiver usando Electron, extrai o arquivo
    if (global.window?.electronAPI) {
      const result = await global.window.electronAPI.uploadFile({
        path: filePath,
        content: buffer,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: "Erro ao processar arquivo" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}
