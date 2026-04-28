import { siteContent } from "@/lib/site-content";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-semibold">{siteContent.brand.name}</p>
          <p className="mt-1 text-muted-foreground">
            {siteContent.brand.tagline}
          </p>
        </div>
        <div className="space-y-1 text-muted-foreground">
          <p>{siteContent.contact.address}</p>
          <p>
            <a
              href={siteContent.contact.phoneHref}
              className="hover:text-foreground"
            >
              {siteContent.contact.phone}
            </a>
          </p>
        </div>
        <div className="space-y-1 text-muted-foreground">
          {siteContent.contact.hours.map((h, i) => (
            <p key={i}>
              <span className="inline-block w-24">{h.day}</span>
              {h.time}
            </p>
          ))}
          {siteContent.social.length > 0 && (
            <div className="mt-3 flex gap-3">
              {siteContent.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {year} {siteContent.brand.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
