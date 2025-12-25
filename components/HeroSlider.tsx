"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SliderItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string | null;
  buttonText?: string | null;
};

interface HeroSliderProps {
  items: SliderItem[];
}

export function HeroSlider({ items }: HeroSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-play functionality
  React.useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full mb-8">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-0">
              <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-2xl text-white space-y-4">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        {item.title}
                      </h2>
                      <p className="text-lg md:text-xl text-white/90">
                        {item.description}
                      </p>
                      {item.link && item.buttonText && (
                        <div className="pt-4">
                          <Button
                            asChild
                            size="lg"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Link href={item.link}>{item.buttonText}</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 md:left-6 bg-background/80 hover:bg-background text-foreground border-border" />
        <CarouselNext className="right-4 md:right-6 bg-background/80 hover:bg-background text-foreground border-border" />
      </Carousel>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                current === index + 1
                  ? "bg-primary w-8"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

