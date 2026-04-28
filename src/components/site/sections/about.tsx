import { PlaceholderImage } from "../placeholder-image";
import { siteContent } from "@/lib/site-content";

export function AboutSection() {
  const { about } = siteContent;
  return (
    <section
      id="about"
      className="mx-auto max-w-5xl scroll-mt-16 px-4 py-20 sm:px-6"
      aria-labelledby="about-heading"
    >
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <PlaceholderImage aspect="square" label={about.imageAlt} />
        <div>
          <h2
            id="about-heading"
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            {about.heading}
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
