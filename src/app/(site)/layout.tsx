import { getSettings, getTheme } from '@/lib/content';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Chrome from '@/components/site/Chrome';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const { ui } = getTheme();
  return (
    <>
      <Header settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <Chrome smooth={ui.smoothScroll} cursor={ui.customCursor} grain={ui.grain} transitions={ui.pageTransitions} siteName={settings.logoText} />
    </>
  );
}
