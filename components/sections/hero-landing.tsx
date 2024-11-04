 // Start of Selection
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export default function HeroLanding() {
  return (
    <section className="space-y-6 py-12 sm:py-20 lg:py-20">
      <div className="container flex max-w-5xl flex-col items-center gap-5 text-center">
        <h1 className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
          Codephy Starter
        </h1>

        <h2 className="text-balance font-urban text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Maximizing AI for Unmatched Cost Savings
        </h2>

        <p
          className="max-w-2xl text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8"
          style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
        >
              Thanks to advancements in AI, our developers can work faster and more efficiently than ever before. We're passing these time savings directly to our clients, offering high-quality web solutions at exceptional value.
        </p>

        <div
          className="flex justify-center space-x-2 md:space-x-4"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <Link
            href="/pricing"
            prefetch={true}
            className={cn(
              buttonVariants({ size: "lg", rounded: "full" }),
              "gap-2",
            )}
          >
            <span>Pricing</span>
            <Icons.arrowRight className="size-4" />
          </Link>
          {/* <Link
            href="/pricing"
            prefetch={true}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                rounded: "full",
              }),
              "px-5",
            )}
          >
            <span>Learn More</span>
          </Link> */}
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold">Why Choose Codephy?</h3>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li>Affordable Entry Point: Begin your project with a $9 retainer</li>
            <li>Flexible Planning: Unlimited quotes to find the perfect solution</li>
            <li>Advanced Technology: We leverage AI to enhance efficiency and outcomes</li>
            <li>Significant Savings: Cut your costs by over 80%!</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
