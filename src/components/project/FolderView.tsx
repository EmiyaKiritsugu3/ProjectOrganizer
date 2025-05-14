"use client";

import type { AppFolder } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import GitIntegrationCard from "./GitIntegrationCard";
import { FolderOpen } from "lucide-react";

interface FolderViewProps {
  folder: AppFolder;
  onUpdateFolder: (updatedFolder: AppFolder) => void;
}

export default function FolderView({ folder, onUpdateFolder }: FolderViewProps) {
  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FolderOpen size={64} className="mb-4" />
        <p className="text-xl">Select an app folder from the sidebar</p>
        <p>to view its details and manage Git integration.</p>
      </div>
    );
  }

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
            <h3 className="text-xl font-semibold mb-2 text-foreground/90">Detailed Purpose</h3>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {folder.longDescription}
            </p>
          </CardContent>
        </Card>

        <GitIntegrationCard folder={folder} onUpdateFolder={onUpdateFolder} />
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          This interface helps organize and conceptualize your Dart projects. Actual coding and project setup will occur in your local development environment.
        </div>
      </div>
    </ScrollArea>
  );
}
