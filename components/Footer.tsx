export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200">
      <div className="container py-10 text-sm text-gray-600 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-3 text-center md:text-left">
        <p>© {new Date().getFullYear()} Millie&apos;s Pet Service. All rights reserved.</p>
      </div>
    </footer>
  );
}
