import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#EEF1F6" />
        <meta name="description" content="Aap-SC: Swim Coach — Analyze Apple Fitness swim workouts" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Aap-SC" />
        <link rel="apple-touch-icon" href="/icon-sc-192.png" />

        {/* Favicon — initial; AppContent swaps it per language at runtime */}
        <link rel="icon" type="image/png" href="/icon-sc-192.png" />

        {/* Fonts: Bricolage Grotesque (variable, opsz+wght) + Geist Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600&family=Oxanium:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
