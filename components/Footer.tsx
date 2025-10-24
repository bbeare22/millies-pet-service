
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200">
      <div className="container py-10 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Millie&apos;s Pet Service. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="https://instagram.com/mpetservice" target="_blank" className="hover:text-brand-dark">Instagram</a>
          <a href="https://facebook.com/mpetservice" target="_blank" className="hover:text-brand-dark">Facebook</a>
          <a href="https://tiktok.com/@mpetservice" target="_blank" className="hover:text-brand-dark">TikTok</a>
        </div>
      </div>
    </footer>
  );
}
