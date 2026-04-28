import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PlaceholderImage } from "../placeholder-image";
import { siteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { hero } = siteContent;
  return (
    <section
      id="hero"
      className="relative scroll-mt-16 overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 -z-10">
        <PlaceholderImage
          aspect="wide"
          label="主視覺"
          className="h-full w-full rounded-none border-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
      </div>
      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <h1
          id="hero-title"
          className="text-4xl font-bold tracking-tight md:text-6xl"
        >
          {hero.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {hero.subtitle}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={hero.primaryCta.href}
            className={cn(buttonVariants({ size: "lg" }), "px-6")}
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "px-6",
            )}
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
