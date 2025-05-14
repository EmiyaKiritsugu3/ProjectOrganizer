export type GitSyncStatus = 'unsynced' | 'syncing' | 'synced' | 'error';

export interface AppFolder {
  id: string; // "01", "02", ...
  name: string; // "App 01", "App 02", ...
  description: string;
  longDescription: string;
  gitRepoUrl: string;
  gitLastSync?: Date;
  gitSyncStatus: GitSyncStatus;
}
