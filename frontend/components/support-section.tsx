"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Headphones,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";

const faqItems = [
  {
    question: "How fast do quote requests get reviewed?",
    answer: "Clean quote lists are usually reviewed within 2–4 business hours.",
  },
  {
    question: "Can I place a bulk order without signing in?",
    answer: "Yes. Use the checkout flow as a guest, or keep the quote flow if you need review.",
  },
  {
    question: "How do I confirm fitment for a part?",
    answer: "Open a product page and use the fitment checker against the target model.",
  },
  {
    question: "Where do I report a shipping issue?",
    answer: "Use the support ticket path below or contact the team by email and phone.",
  },
];

const supportCards = [
  {
    icon: Mail,
    label: "Email",
    value: "sales@celltech.com",
    href: "mailto:sales@celltech.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) 555-0123",
    href: "tel:+18005550123",
  },
  {
    icon: Truck,
    label: "Shipping desk",
    value: "Mon–Fri, 8am–6pm ET",
    href: "/checkout",
  },
];

export function SupportSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <PageHero
          eyebrow="Support center"
          title={
            <>
              FAST <span className="text-ct-accent">HELP</span> FOR ACTIVE JOBS
            </>
          }
          description="Use this hub for fitment questions, shipping updates, and order support. It is intentionally lightweight so the team can get to the right path fast."
          actions={
            <>
              <Link href="/quote" className="btn-secondary">
                Request quote
              </Link>
              <Link href="/dashboard" className="btn-primary">
                Open account
              </Link>
            </>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <LifeBuoy className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Contact options</h2>
              </div>

              <div className="space-y-3">
                {supportCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <a
                      key={card.label}
                      href={card.href}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4 hover:border-ct-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-ct-accent/10 border border-ct-accent/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-ct-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-ct-text-secondary uppercase tracking-widest">
                            {card.label}
                          </p>
                          <p className="text-sm text-ct-text mt-1">{card.value}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-ct-accent" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">What we handle</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Fitment confirmation",
                  "Shipping status",
                  "Backorder updates",
                  "Account access",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-ct-bg-secondary/40 p-4 text-sm text-ct-text"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4 text-sm text-ct-text-secondary">
                Response windows are shortest on weekday mornings. For tight turnarounds,
                use the quote path and include SKU numbers.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Frequently asked questions</h2>
              </div>

              <div className="space-y-3">
                {faqItems.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <button
                      key={faq.question}
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left rounded-2xl border border-white/10 bg-ct-bg-secondary/40 p-4 hover:border-ct-accent/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-ct-text">{faq.question}</span>
                        <span className="text-ct-accent text-lg leading-none">{isOpen ? "−" : "+"}</span>
                      </div>
                      {isOpen && (
                        <p className="mt-3 text-sm text-ct-text-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-ct-accent" />
                <h2 className="font-semibold text-ct-text">Escalation paths</h2>
              </div>

              <div className="space-y-3 text-sm text-ct-text-secondary">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-ct-accent" />
                  <span>Use quote review for pricing and part availability.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-ct-accent" />
                  <span>Use checkout for confirmed orders and shipping capture.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Headphones className="w-4 h-4 text-ct-accent" />
                  <span>Use email or phone for urgent operational issues.</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/catalog" className="link-arrow">
                  Browse catalog <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/checkout" className="link-arrow">
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
