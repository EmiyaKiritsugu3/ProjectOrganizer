
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
    const dartPadUrl = `https://dartpad.dev/${gistId}`; // Removed ?run=true
    window.open(dartPadUrl, '_blank', 'noopener,noreferrer');
  };

  const isValidGistInputForActions = !!extractGistId(repoUrl);

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold text-primary">{folder.name}</CardTitle>
         {folder.description && (
            <CardDescription className="text-xs text-muted-foreground mt-1">
                {folder.description}
            </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3"> {/* Adjusted from space-y-2 for consistency with previous state if any */}
          <div>
            <Label htmlFor={`gist-url-${folder.id}`} className="text-sm font-medium text-foreground mb-1 block sr-only">
              URL / ID do Gist
            </Label>
            <div className="flex items-stretch gap-2">
              <Input
                id={`gist-url-${folder.id}`}
                type="text"
                placeholder="URL ou ID do Gist"
                value={repoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-grow"
              />
              <Button
                onClick={() => handleOpenInDartPad(repoUrl)}
                disabled={!isValidGistInputForActions}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                aria-label="Abrir Gist no DartPad"
              >
                <ExternalLink className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Abrir</span>
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
