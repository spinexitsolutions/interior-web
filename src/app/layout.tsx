import type { Metadata, Viewport } from 'next';
import { getSettings, getTheme } from '@/lib/content';
import { googleFontsUrls, themeCss } from '@/lib/theme';
import './globals.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  return {
    title: { default: s.seo.title || s.siteName, template: `%s — ${s.siteName}` },
    description: s.seo.description,
    openGraph: { title: s.seo.title, description: s.seo.description, images: s.seo.ogImage ? [s.seo.ogImage] : [] },
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#16140f' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme();
  return (
    <html lang="en" data-btn={theme.ui.buttonStyle} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {googleFontsUrls(theme).map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
