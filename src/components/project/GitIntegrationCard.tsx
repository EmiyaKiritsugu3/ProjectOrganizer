
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
        description: "Não foi possível extrair um ID de Gist válido da entrada.",
        variant: "destructive",
      });
      return;
    }
    // Append ?channel=beta to use the beta channel
    const dartPadUrl = `https://dartpad.dev/${gistId}?channel=beta`;
    window.open(dartPadUrl, '_blank', 'noopener,noreferrer');
  };

  const isValidGistInputForActions = !!extractGistId(repoUrl);

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow bg-card">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <CardTitle className="text-md sm:text-lg font-semibold text-card-foreground">{folder.name}</CardTitle>
         {folder.description && (
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {folder.description}
            </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-2">
        <div className="space-y-2">
          <div>
            <Label htmlFor={`gist-url-${folder.id}`} className="text-xs font-medium text-card-foreground mb-1 block sr-only">
              URL / ID do Gist
            </Label>
            <div className="flex items-stretch gap-2">
              <Input
                id={`gist-url-${folder.id}`}
                type="text"
                placeholder="URL ou ID do Gist"
                value={repoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-grow h-9 sm:h-10 text-sm sm:text-base bg-background text-foreground border-border placeholder:text-muted-foreground"
              />
              <Button
                onClick={() => handleOpenInDartPad(repoUrl)}
                disabled={!isValidGistInputForActions}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-9 sm:h-10 px-3 sm:px-4"
                aria-label="Abrir Gist no DartPad"
                size="default"
              >
                <ExternalLink className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline text-xs sm:text-sm">Abrir</span>
              </Button>
            </div>
            {!isValidGistInputForActions && repoUrl.trim() !== "" && (
              <p className="pt-1 text-xs text-destructive flex items-center gap-1">
                <AlertTriangle size={14} />
                URL ou ID inválido.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
