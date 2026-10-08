// Browser stand-in for next/link in the Claude Design bundle: a plain <a>.
import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string };
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  children?: ReactNode;
};

export default function Link({ href, prefetch, replace, scroll, children, ...rest }: LinkProps) {
  void prefetch; void replace; void scroll;
  const h = typeof href === "string" ? href : href?.pathname ?? "#";
  return <a href={h} {...rest}>{children}</a>;
}
