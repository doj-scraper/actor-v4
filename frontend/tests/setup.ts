import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

const originalEmitWarning = process.emitWarning.bind(process);
process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
  const message = typeof warning === "string" ? warning : warning.message;
  if (message.includes("--localstorage-file")) {
    return;
  }
  return (originalEmitWarning as (...innerArgs: unknown[]) => void)(warning, ...args);
}) as typeof process.emitWarning;

afterEach(() => {
  cleanup();
  const globalAny = globalThis as typeof globalThis & {
    __CELLTECH_CART_STORAGE__?: Record<string, string>;
  };
  if (globalAny.__CELLTECH_CART_STORAGE__) {
    globalAny.__CELLTECH_CART_STORAGE__ = {};
  }
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => createElement("a", { href, ...props }, children),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => createElement("img", props),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));
