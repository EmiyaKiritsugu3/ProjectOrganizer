
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Project Organizer - Receitas POO',
  description: 'Ferramenta para Monitores: Visualize e avalie Gists de receitas de POO dos alunos.',
  openGraph: {
    title: 'Project Organizer - Receitas POO',
    description: 'Ferramenta para Monitores: Visualize e avalie Gists de receitas de POO dos alunos.',
    url: 'https://project-organizer-sepia.vercel.app/',
    siteName: 'Project Organizer - Receitas POO',
    images: [
      {
        url: 'https://placehold.co/1200x630.png', // Substitua pela URL da sua imagem Open Graph na pasta /public (ex: /rocket-og.png)
        width: 1200,
        height: 630,
        alt: 'Project Organizer - Ícone de Foguete',
        'data-ai-hint': 'rocket launch'
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
