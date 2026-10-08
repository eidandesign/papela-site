// Browser stand-in for next/navigation in the Claude Design bundle.
export function usePathname(): string {
  return typeof window !== "undefined" ? window.location.pathname || "/" : "/";
}
export function useRouter() {
  return {
    push: (href: string) => { if (typeof window !== "undefined") window.location.href = href; },
    replace: (href: string) => { if (typeof window !== "undefined") window.location.replace(href); },
    back: () => { if (typeof window !== "undefined") window.history.back(); },
    forward: () => { if (typeof window !== "undefined") window.history.forward(); },
    refresh: () => {},
    prefetch: () => {},
  };
}
export function useSearchParams() {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}
