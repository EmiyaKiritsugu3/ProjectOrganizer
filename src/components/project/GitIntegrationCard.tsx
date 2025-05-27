
"use client";

import type { AppFolder } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { extractGistId } from "@/lib/utils";
import { FileCode, ExternalLink, AlertTriangle, PlayCircle, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface GitIntegrationCardProps {
  folder: AppFolder;
  onUpdateFolder: (updatedFolder: Pick<AppFolder, 'id' | 'gitRepoUrl'>) => void;
  showEmbeddedDartPad: boolean;
  onToggleEmbeddedDartPad: () => void;
  gistIdForEmbed: string | null;
}

export default function GitIntegrationCard({ 
  folder, 
  onUpdateFolder,
  showEmbeddedDartPad,
  onToggleEmbeddedDartPad,
  gistIdForEmbed
}: GitIntegrationCardProps) {
  const { toast } = useToast();
  const [repoUrl, setRepoUrl] = useState(folder.gitRepoUrl);

  useEffect(() => {
    setRepoUrl(folder.gitRepoUrl);
  }, [folder.gitRepoUrl]);

  const handleUrlChange = (newUrl: string) => {
    setRepoUrl(newUrl);
    onUpdateFolder({ id: folder.id, gitRepoUrl: newUrl });
  };

  const handleOpenInDartPad = (gistInput: string) => {
    const gistId = extractGistId(gistInput);

    if (!gistId) {
      toast({
        title: "ID do Gist Inválido",
        description: "Não foi possível extrair um ID de Gist válido da entrada. Certifique-se de que é uma URL do Gist (gist.github.com), uma URL do DartPad ou um ID de Gist.",
        variant: "destructive",
      });
      return;
    }

    const dartPadUrl = `https://dartpad.dev/${gistId}`;
    window.open(dartPadUrl, '_blank', 'noopener,noreferrer');
  };
  
  const isValidGistInputForActions = !!extractGistId(repoUrl);

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCode className="h-6 w-6 text-primary" />
          <CardTitle>Integração com Gist</CardTitle>
        </div>
        <CardDescription>
          Vincule uma URL de Gist (p.ex., gist.github.com/username/id), uma URL do DartPad (p.ex., dartpad.dev/id) ou apenas o ID do Gist.
          Você pode abrir Gists diretamente no DartPad ou visualizá-los embutidos nesta página.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`gist-url-${folder.id}`} className="text-sm font-medium">
            URL ou ID do Gist
          </Label>
          <Input
            id={`gist-url-${folder.id}`}
            type="text"
            placeholder="URL do Gist, URL do DartPad ou ID do Gist"
            value={repoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="mt-1"
          />
           {!isValidGistInputForActions && repoUrl.trim() !== "" && (
             <p className="mt-2 text-xs text-destructive flex items-center gap-1">
               <AlertTriangle size={14} />
               A URL ou ID do Gist parece inválida para as ações.
             </p>
           )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => handleOpenInDartPad(repoUrl)} 
            disabled={!isValidGistInputForActions} 
            variant="outline" 
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir Gist no DartPad (Nova Aba)
          </Button>
          <Button 
            onClick={onToggleEmbeddedDartPad} 
            disabled={!gistIdForEmbed} 
            variant="outline" 
            className="w-full"
          >
            {showEmbeddedDartPad ? <X className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
            {showEmbeddedDartPad ? "Fechar DartPad Embutido" : "Visualizar e Executar no DartPad Embutido"}
          </Button>
        </div>
         <p className="text-xs text-muted-foreground pt-2">
            O DartPad sempre carrega a versão mais recente do Gist. A visualização embutida aparecerá abaixo dos detalhes do projeto quando ativada.
        </p>
      </CardContent>
    </Card>
  );
}
