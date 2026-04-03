"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

interface SupportFaqProps {
  title?: string;
  description?: string;
  items: FaqItem[];
}

export function SupportFaq({
  title = "Frequently asked questions",
  description = "Answers to the most common ordering, quality, and shipping questions.",
  items,
}: SupportFaqProps) {
  return (
    <Card className="bg-ct-bg-secondary/80 border-white/10 shadow-card">
      <CardHeader>
        <CardTitle className="text-ct-text">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm text-ct-text hover:text-ct-accent">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-ct-text-secondary">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
