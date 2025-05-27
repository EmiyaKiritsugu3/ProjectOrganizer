
"use client";

import type { AppFolder } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn, extractGistId } from "@/lib/utils";
import { CheckCircle2, Loader2, RefreshCw, XCircle, AlertTriangle, FileCode, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface GitIntegrationCardProps {
  folder: AppFolder;
  onUpdateFolder: (updatedFolder: AppFolder) => void;
}

export default function GitIntegrationCard({ folder, onUpdateFolder }: GitIntegrationCardProps) {
  const { toast } = useToast();
  const [repoUrl, setRepoUrl] = useState(folder.gitRepoUrl);

  useEffect(() => {
    setRepoUrl(folder.gitRepoUrl);
  }, [folder.gitRepoUrl]);

  const handleSync = async () => {
    const currentGistId = extractGistId(repoUrl);
    if (!currentGistId) {
      toast({
        title: "URL ou ID do Gist Inválido",
        description: "Por favor, insira uma URL ou ID de Gist válido para sincronizar.",
        variant: "destructive",
      });
      onUpdateFolder({ ...folder, gitRepoUrl: repoUrl, gitSyncStatus: 'error' });
      return;
    }

    onUpdateFolder({ ...folder, gitRepoUrl: repoUrl, gitSyncStatus: 'syncing' });
    toast({
      title: "Sincronizando Gist...",
      description: `Tentando sincronizar com o Gist ID: ${currentGistId}. Isto é uma simulação.`,
    });

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    const success = Math.random() > 0.3; 
    if (success) {
      onUpdateFolder({ ...folder, gitRepoUrl: repoUrl, gitSyncStatus: 'synced', gitLastSync: new Date() });
      toast({
        title: "Gist Sincronizado",
        description: `${folder.name} foi sincronizado com sucesso com o Gist.`,
        className: "bg-accent text-accent-foreground",
      });
    } else {
      onUpdateFolder({ ...folder, gitRepoUrl: repoUrl, gitSyncStatus: 'error' });
      toast({
        title: "Falha na Sincronização",
        description: `Não foi possível sincronizar ${folder.name}. Por favor, verifique o Gist e tente novamente.`,
        variant: "destructive",
      });
    }
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

  const getStatusIcon = () => {
    switch (folder.gitSyncStatus) {
      case 'syncing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'synced':
        return <CheckCircle2 className="h-5 w-5 text-accent" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'unsynced':
      default:
        return <FileCode className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (folder.gitSyncStatus) {
      case 'syncing':
        return "Sincronizando...";
      case 'synced':
        return `Sincronizado com sucesso${folder.gitLastSync ? ` em ${folder.gitLastSync.toLocaleDateString()} às ${folder.gitLastSync.toLocaleTimeString()}` : ''}.`;
      case 'error':
        return "Falha na sincronização. Por favor, verifique o Gist ou conexão.";
      case 'unsynced':
      default:
        return "Ainda não sincronizado.";
    }
  };
  
  const getStatusColor = () => {
    switch (folder.gitSyncStatus) {
      case 'syncing': return "text-blue-500";
      case 'synced': return "text-accent";
      case 'error': return "text-destructive";
      default: return "text-muted-foreground";
    }
  }

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
          Você pode sincronizar (simulado) ou abrir Gists diretamente no DartPad.
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
            onChange={(e) => setRepoUrl(e.target.value)}
            className="mt-1"
          />
           {!isValidGistInputForActions && folder.gitSyncStatus !== 'unsynced' && folder.gitSyncStatus !== 'syncing' && (
             <p className="mt-2 text-xs text-destructive flex items-center gap-1">
               <AlertTriangle size={14} />
               A URL ou ID do Gist parece inválida para as ações.
             </p>
           )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSync} 
            disabled={folder.gitSyncStatus === 'syncing' || !isValidGistInputForActions} 
            className="w-full sm:flex-1"
          >
            {folder.gitSyncStatus === 'syncing' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {folder.gitSyncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar com Gist'}
          </Button>
          <Button 
            onClick={() => handleOpenInDartPad(repoUrl)} 
            disabled={!isValidGistInputForActions} 
            variant="outline" 
            className="w-full sm:flex-1"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir Gist no DartPad
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          {getStatusIcon()}
          <p className={cn("text-sm", getStatusColor())}>
            {getStatusText()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
