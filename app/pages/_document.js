import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        {/* Viewport meta tag moved to _app.js to avoid Next.js warning */}
        <meta
          name="description"
          content="Agent Arena - Crypto Boxing Championship"
        />
        <link rel="icon" href="/favicon.ico" />

        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Add any additional meta tags or external resources here */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
