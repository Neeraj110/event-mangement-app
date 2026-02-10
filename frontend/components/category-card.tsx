'use client';

import Link from 'next/link';

interface CategoryCardProps {
  icon: string;
  label: string;
  href: string;
  color?: string;
}

export function CategoryCard({
  icon,
  label,
  href,
  color = 'bg-blue-100',
}: CategoryCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="flex flex-col items-center justify-center p-6 bg-card border border-border/50 rounded-[2rem] transition-all duration-300 hover:bg-card/80 hover:scale -105 hover:shadow-glow cursor-pointer h-full">
        <div className={`w-20 h-20 ${color} rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg text-center group-hover:text-primary transition-colors">
          {label}
        </h3>
      </div>
    </Link>
  );
}
