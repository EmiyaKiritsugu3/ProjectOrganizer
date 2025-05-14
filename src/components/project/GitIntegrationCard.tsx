"use client";

import type { AppFolder } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, GitBranch, Loader2, RefreshCw, XCircle, AlertTriangle } from "lucide-react";
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
    if (!repoUrl.trim()) {
      toast({
        title: "Git Repository URL Missing",
        description: "Please enter a Git repository URL to sync.",
        variant: "destructive",
      });
      onUpdateFolder({ ...folder, gitSyncStatus: 'error' });
      return;
    }

    // Simulate Git pull operation
    onUpdateFolder({ ...folder, gitRepoUrl: repoUrl, gitSyncStatus: 'syncing' });
    toast({
      title: "Syncing Repository...",
      description: `Attempting to sync with ${repoUrl}. This is a simulation.`,
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Simulate success or failure
    const success = Math.random() > 0.3; // 70% chance of success
    if (success) {
      onUpdateFolder({ ...folder, gitRepoUrl: repoUrl, gitSyncStatus: 'synced', gitLastSync: new Date() });
      toast({
        title: "Repository Synced",
        description: `${folder.name} has been successfully synced with the Git repository.`,
        className: "bg-accent text-accent-foreground",
      });
    } else {
      onUpdateFolder({ ...folder, gitRepoUrl: repoUrl, gitSyncStatus: 'error' });
      toast({
        title: "Sync Failed",
        description: `Could not sync ${folder.name}. Please check the URL and try again.`,
        variant: "destructive",
      });
    }
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
        return <GitBranch className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (folder.gitSyncStatus) {
      case 'syncing':
        return "Syncing...";
      case 'synced':
        return `Synced successfully${folder.gitLastSync ? ` on ${folder.gitLastSync.toLocaleDateString()} at ${folder.gitLastSync.toLocaleTimeString()}` : ''}.`;
      case 'error':
        return "Sync failed. Please check URL or connection.";
      case 'unsynced':
      default:
        return "Not synced yet.";
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

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          <CardTitle>Git Integration</CardTitle>
        </div>
        <CardDescription>
          Optionally link a Git repository to pull code for this app. This tool will never commit to your repository.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`git-repo-url-${folder.id}`} className="text-sm font-medium">
            Git Repository URL
          </Label>
          <Input
            id={`git-repo-url-${folder.id}`}
            type="url"
            placeholder="https://github.com/user/repo.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="mt-1"
          />
           {!repoUrl.trim() && folder.gitSyncStatus !== 'unsynced' && folder.gitSyncStatus !== 'syncing' && (
             <p className="mt-2 text-xs text-destructive flex items-center gap-1">
               <AlertTriangle size={14} />
               Repository URL is required for syncing.
             </p>
           )}
        </div>
        <Button onClick={handleSync} disabled={folder.gitSyncStatus === 'syncing'} className="w-full sm:w-auto">
          {folder.gitSyncStatus === 'syncing' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {folder.gitSyncStatus === 'syncing' ? 'Syncing...' : 'Sync with Repository'}
        </Button>
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
