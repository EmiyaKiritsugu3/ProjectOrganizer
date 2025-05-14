import ProjectOrganizerLayout from '@/components/project/ProjectOrganizerLayout';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <>
      <ProjectOrganizerLayout />
      <Toaster />
    </>
  );
}
