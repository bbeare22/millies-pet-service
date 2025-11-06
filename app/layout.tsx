import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';


export const metadata = {
  title: "Millie's Pet Service",
  description: "Loving, reliable care for your best friend.",
  metadataBase: new URL('https://mpetserv.com'),
  openGraph: {
    title: "Millie's Pet Service",
    description: "Loving, reliable care for your best friend.",
    url: 'https://mpetserv.com',
    siteName: "Millie's Pet Service",
    images: [{ url: '/og.png', width: 1200, height: 630, alt: "Millie's Pet Service" }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Millie's Pet Service",
    description: "Loving, reliable care for your best friend.",
    images: ['/og.png'],
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-bg text-text">
        <Nav />
        <main className="container pb-20 md:pb-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
