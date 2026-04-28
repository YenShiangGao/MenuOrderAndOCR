import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceholderImage } from "../placeholder-image";
import { siteContent } from "@/lib/site-content";

export function SpecialtiesSection() {
  const { specialties } = siteContent;
  return (
    <section
      id="specialties"
      className="bg-muted/30 scroll-mt-16"
      aria-labelledby="specialties-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2
            id="specialties-heading"
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            {specialties.heading}
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <PlaceholderImage
                aspect="video"
                label={item.imageAlt}
                className="rounded-none border-0 border-b"
              />
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
