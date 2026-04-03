import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Storefront
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-medium">Admin</span>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  );
}
