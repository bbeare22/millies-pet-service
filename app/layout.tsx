import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import StickyBookBar from '@/components/StickyBookBar';

export const metadata = {
  title: "Millie's Pet Service",
  description: "Loving, reliable care for your best friend.",
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
        {/* Add bottom padding so the sticky bar doesn't overlap content on small screens */}
        <main className="container pb-20 md:pb-0">{children}</main>
        <Footer />
        {/* Mobile-only sticky booking bar */}
        <StickyBookBar />
      </body>
    </html>
  );
}
