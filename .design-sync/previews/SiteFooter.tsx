import { SiteFooter } from "papela-ds";

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ margin: "-24px", background: "var(--color-bg)" }}>{children}</div>
);

// Site-wide footer: Club Creativo banner, sitemap columns, socials, contact,
// big "papela atelier" display text and the bottom bar with BackToTop.
export const Default = () => (
  <Page>
    <SiteFooter />
  </Page>
);

// Inside /club-creativo the banner is turned off (no point inviting you
// where you already are).
export const SinBannerClub = () => (
  <Page>
    <SiteFooter showClubBanner={false} />
  </Page>
);
