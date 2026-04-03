import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Browse Catalog", href: "/catalog" },
      { label: "Request Quote", href: "/quote" },
      { label: "Checkout", href: "/checkout" },
      { label: "Inventory", href: "/inventory" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/support" },
      { label: "FAQ", href: "/support" },
      { label: "Account", href: "/dashboard" },
      { label: "Status", href: "/health" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Shipping", href: "/checkout" },
      { label: "Press", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/support" },
      { label: "Terms", href: "/support" },
      { label: "Cookies", href: "/support" },
      { label: "Security", href: "/support" },
    ],
  },
];

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ct-bg-secondary border-t border-white/5" style={{ zIndex: 130 }}>
      <div className="w-full px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ct-accent flex items-center justify-center">
                <span className="text-ct-bg font-bold text-sm">CT</span>
              </div>
              <span className="font-display font-bold text-ct-text tracking-wide">CellTech</span>
            </div>
            <p className="text-micro text-ct-text-secondary">
              Wholesale parts for repair shops.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ct-text-secondary hover:text-ct-text transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">CONTACT</h3>
              <div className="space-y-3">
                <a
                  href="mailto:sales@celltech.com"
                  className="flex items-center gap-3 text-sm text-ct-text-secondary hover:text-ct-text transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  sales@celltech.com
                </a>
                <a
                  href="tel:+18005550123"
                  className="flex items-center gap-3 text-sm text-ct-text-secondary hover:text-ct-text transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +1 (800) 555-0123
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">HOURS</h3>
              <div className="space-y-1 text-sm text-ct-text-secondary">
                <p>Mon–Fri: 8am–6pm ET</p>
                <p>Sat: 9am–2pm ET</p>
                <p>Sun: Closed</p>
              </div>
            </div>

            <div>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">FOLLOW</h3>
              <div className="flex gap-4">
                <Link href="/support" className="text-sm text-ct-text-secondary hover:text-ct-accent transition-colors">
                  Twitter
                </Link>
                <Link href="/support" className="text-sm text-ct-text-secondary hover:text-ct-accent transition-colors">
                  LinkedIn
                </Link>
                <Link href="/support" className="text-sm text-ct-text-secondary hover:text-ct-accent transition-colors">
                  Instagram
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-micro text-ct-text-secondary">
              © {currentYear} CellTech Distributor. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
