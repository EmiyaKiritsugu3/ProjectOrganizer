
"use client";

import type { AppFolder } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import GitIntegrationCard from "./GitIntegrationCard";
import { Button } from "@/components/ui/button";
import { extractGistId } from "@/lib/utils";
import { FolderOpen, Code, PlayCircle, X } from "lucide-react";
import { useState, useMemo } from "react";

interface FolderViewProps {
  folder: AppFolder;
  onUpdateFolder: (updatedFolder: AppFolder) => void;
}

export default function FolderView({ folder, onUpdateFolder }: FolderViewProps) {
  const [showEmbeddedDartPad, setShowEmbeddedDartPad] = useState(false);

  const gistId = useMemo(() => extractGistId(folder.gitRepoUrl), [folder.gitRepoUrl]);

  const toggleEmbeddedDartPad = () => {
    if (gistId) {
      setShowEmbeddedDartPad(!showEmbeddedDartPad);
    }
  };

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FolderOpen size={64} className="mb-4" />
        <p className="text-xl">Selecione uma pasta de aplicativo na barra lateral</p>
        <p>para ver seus detalhes e gerenciar a integração com Gist.</p>
      </div>
    );
  }
  
  const dartPadEmbedUrl = gistId ? `https://dartpad.dev/embed-dart.html?id=${gistId}&run=true&theme=dark&split=40` : "";

  return (
    <ScrollArea className="h-full p-2 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/10">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold text-primary">{folder.name}</CardTitle>
                <CardDescription className="text-md text-foreground/80">{folder.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2 text-foreground/90">Propósito Detalhado</h3>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-6">
              {folder.longDescription}
            </p>

            {gistId && (
              <div className="mb-6">
                <Button onClick={toggleEmbeddedDartPad} variant="outline" className="w-full sm:w-auto">
                  {showEmbeddedDartPad ? <X className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                  {showEmbeddedDartPad ? "Fechar DartPad Embutido" : "Visualizar e Executar no DartPad Embutido"}
                </Button>
              </div>
            )}

            {showEmbeddedDartPad && gistId && (
              <Card className="mb-6 shadow-md overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="h-5 w-5" /> DartPad Embutido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src={dartPadEmbedUrl}
                    style={{ width: '100%', height: '600px', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    title={`DartPad Embutido para ${folder.name}`}
                    allow="clipboard-write"
                  ></iframe>
                  <p className="text-xs text-muted-foreground mt-2">Código executando automaticamente. Pode levar alguns segundos para carregar.</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <GitIntegrationCard folder={folder} onUpdateFolder={onUpdateFolder} />
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          Esta interface ajuda a organizar e conceituar seus projetos. A codificação real e a configuração do projeto ocorrerão em seu ambiente de desenvolvimento local.
        </div>
      </div>
    </ScrollArea>
  );
}
