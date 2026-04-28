import { MapPin, Phone, Clock } from "lucide-react";
import { siteContent } from "@/lib/site-content";

export function ContactSection() {
  const { contact } = siteContent;
  return (
    <section
      id="contact"
      className="mx-auto max-w-5xl scroll-mt-16 px-4 py-20 sm:px-6"
      aria-labelledby="contact-heading"
    >
      <h2
        id="contact-heading"
        className="text-3xl font-bold tracking-tight md:text-4xl"
      >
        {contact.heading}
      </h2>
      <div className="mt-10 grid gap-8 md:grid-cols-2 md:items-start">
        <dl className="space-y-6 text-sm">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="font-medium">地址</dt>
              <dd className="mt-1 text-muted-foreground">{contact.address}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="font-medium">電話</dt>
              <dd className="mt-1">
                <a
                  href={contact.phoneHref}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {contact.phone}
                </a>
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <dt className="font-medium">營業時間</dt>
              <dd className="mt-1 space-y-1 text-muted-foreground">
                {contact.hours.map((h, i) => (
                  <p key={i}>
                    <span className="inline-block w-24">{h.day}</span>
                    {h.time}
                  </p>
                ))}
                {contact.closedNote && (
                  <p className="mt-2 text-xs italic">{contact.closedNote}</p>
                )}
              </dd>
            </div>
          </div>
        </dl>
        <div className="overflow-hidden rounded-lg border">
          <iframe
            title={`${siteContent.brand.name}地圖`}
            src={contact.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-video w-full"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
