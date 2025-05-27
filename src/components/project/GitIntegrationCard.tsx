
"use client";

import type { AppFolder } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { extractGistId } from "@/lib/utils";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface GitIntegrationCardProps {
  folder: AppFolder;
  onUpdateFolder: (updatedFolder: Pick<AppFolder, 'id' | 'gitRepoUrl'>) => void;
}

export default function GitIntegrationCard({ 
  folder, 
  onUpdateFolder,
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
    
    const dartPadUrl = `https://dartpad.dev/${gistId}?run=true&channel=beta`;
    window.open(dartPadUrl, '_blank', 'noopener,noreferrer');
  };
  
  const isValidGistInputForActions = !!extractGistId(repoUrl);

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold">{folder.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          <div>
            <Label htmlFor={`gist-url-${folder.id}`} className="text-xs text-muted-foreground">
              URL / ID do Gist
            </Label>
            <Input
              id={`gist-url-${folder.id}`}
              type="text"
              placeholder="Cole a URL do Gist, URL do DartPad ou apenas o ID"
              value={repoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="h-9 text-sm"
            />
            {!isValidGistInputForActions && repoUrl.trim() !== "" && (
               <p className="pt-1 text-xs text-destructive flex items-center gap-1">
                 <AlertTriangle size={14} />
                 A URL ou ID do Gist parece inválida.
               </p>
             )}
          </div>
          <Button 
              onClick={() => handleOpenInDartPad(repoUrl)} 
              disabled={!isValidGistInputForActions} 
              variant="outline"
              size="sm"
              className="w-full h-9"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Gist no DartPad (Nova Aba)
          </Button>
        </div>
        {folder.description && (
            <CardDescription className="text-xs text-muted-foreground mt-2">
                {folder.description}
            </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
