'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEventsStore } from '@/lib/stores/eventsStore';

const CATEGORIES = ['Music', 'Technology', 'Sports', 'Art', 'Food', 'Networking', 'Business', 'Health'];
const PRICE_RANGES = [
  { label: 'Free', min: 0, max: 0 },
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100+', min: 100, max: 10000 },
];

const SECTIONS = ['Category', 'Price Range', 'Date'] as const;

export function EventFilters() {
  const { filterEvents, clearFilters, filters } = useEventsStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Category: true,
    'Price Range': true,
    Date: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <button
          onClick={() => clearFilters()}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Category Section */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection('Category')}
          className="flex items-center justify-between w-full py-2"
        >
          <span className="text-sm font-semibold">Category</span>
          {expandedSections.Category ? (
            <ChevronUp className="w-4 h-4 text-foreground/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-foreground/40" />
          )}
        </button>
        {expandedSections.Category && (
          <div className="space-y-2 mt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => filterEvents({ category: cat })}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${filters.category === cat
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-foreground/70 hover:bg-muted'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection('Price Range')}
          className="flex items-center justify-between w-full py-2"
        >
          <span className="text-sm font-semibold">Price Range</span>
          {expandedSections['Price Range'] ? (
            <ChevronUp className="w-4 h-4 text-foreground/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-foreground/40" />
          )}
        </button>
        {expandedSections['Price Range'] && (
          <div className="space-y-2 mt-2">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() =>
                  filterEvents({ priceRange: [range.min, range.max] })
                }
                className="block w-full text-left px-3 py-1.5 rounded-lg text-sm text-foreground/70 hover:bg-muted transition"
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Section */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection('Date')}
          className="flex items-center justify-between w-full py-2"
        >
          <span className="text-sm font-semibold">Date</span>
          {expandedSections.Date ? (
            <ChevronUp className="w-4 h-4 text-foreground/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-foreground/40" />
          )}
        </button>
        {expandedSections.Date && (
          <div className="space-y-2 mt-2">
            {['Today', 'This Week', 'This Month', 'Next Month'].map((dateOption) => (
              <button
                key={dateOption}
                className="block w-full text-left px-3 py-1.5 rounded-lg text-sm text-foreground/70 hover:bg-muted transition"
              >
                {dateOption}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
