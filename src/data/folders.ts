import type { AppFolder } from '@/types';

export const initialFolders: AppFolder[] = Array.from({ length: 20 }, (_, i) => {
  const id = (i + 1).toString().padStart(2, '0');
  return {
    id,
    name: `App ${id}`,
    description: `Exercise ${id}: A short description of this app's purpose.`,
    longDescription: `This is App ${id}. It is designed to fulfill the requirements of exercise ${id} for the course. This app will focus on [specific technology or concept, e.g., Dart fundamentals, UI development, state management]. The goal is to demonstrate understanding and practical application of the learned materials. It might involve creating a simple command-line tool, a basic mobile UI, or exploring a particular programming paradigm.`,
    gitRepoUrl: '',
    gitSyncStatus: 'unsynced',
  };
});
