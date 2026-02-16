'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  _id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  price: number;
  category: string;
  status?: 'free' | 'paid' | 'coming-soon';
}

export function EventCard({
  _id,
  title,
  date,
  location,
  image,
  price,
  category,
  status,
}: EventCardProps) {
  return (
    <Link href={`/events/${_id}`} className="group block h-full">
      <div className="relative h-full bg-card border border-border/50 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1 group-hover:border-primary/20">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-black shadow-sm">
            {date.split(',')[0]}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              // Add simple heart animation or logic here
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-red-500 flex items-center justify-center transition-all duration-300"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col h-[calc(100%-aspect-[4/3])]">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-2">
              {category}
            </span>
            <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Price from</span>
              <span className="text-lg font-bold text-foreground">
                {price > 0 ? `$${price}` : <span className="text-green-500">Free</span>}
              </span>
            </div>

            <Button
              className="rounded-full px-6 bg-primary hover:bg-primary-hover text-white font-medium shadow-lg hover:shadow-primary/25 transition-all"
            >
              Get Tickets
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
