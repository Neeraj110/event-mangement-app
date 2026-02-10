'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { filterEvents, clearFilters } from '@/lib/slices/eventsSlice';

export function EventFilters() {
  const dispatch = useAppDispatch();
  const [expandedSections, setExpandedSections] = useState<string[]>(['date', 'priceRange', 'categories']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const categories = [
    { name: 'Music', count: 124 },
    { name: 'Technology', count: 45 },
    { name: 'Arts & Culture', count: 32 },
    { name: 'Food & Drink', count: 18 },
    { name: 'Sports', count: 8 },
  ];

  const handleCategoryFilter = (category: string) => {
    dispatch(filterEvents({ category }));
  };

  const handlePriceFilter = (range: [number, number]) => {
    dispatch(filterEvents({ priceRange: range }));
  };

  return (
    <aside className="w-full md:w-56 space-y-6">
      {/* Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <button
          onClick={() => dispatch(clearFilters())}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {/* Date Filter */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => toggleSection('date')}
          className="flex items-center justify-between w-full font-semibold mb-3"
        >
          Date
          <ChevronDown className="w-4 h-4" />
        </button>
        {expandedSections.includes('date') && (
          <div className="space-y-3">
            {['Today', 'Tomorrow', 'Weekend', 'Custom'].map((date) => (
              <label key={date} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm">{date}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => toggleSection('priceRange')}
          className="flex items-center justify-between w-full font-semibold mb-3"
        >
          Price Range
          <ChevronDown className="w-4 h-4" />
        </button>
        {expandedSections.includes('priceRange') && (
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="150"
              className="w-full"
              onChange={(e) => handlePriceFilter([0, Number(e.target.value)])}
            />
            <div className="flex justify-between text-xs text-foreground/60">
              <span>Free</span>
              <span>$150+</span>
            </div>
            <div className="text-sm font-medium">Free</div>
          </div>
        )}
      </div>

      {/* Categories Filter */}
      <div>
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full font-semibold mb-3"
        >
          Categories
          <ChevronDown className="w-4 h-4" />
        </button>
        {expandedSections.includes('categories') && (
          <div className="space-y-3">
            {categories.map((cat) => (
              <label
                key={cat.name}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => handleCategoryFilter(cat.name)}
              >
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm flex-1">{cat.name}</span>
                <span className="text-xs text-foreground/60">{cat.count}</span>
              </label>
            ))}
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
              Show more
            </button>
          </div>
        )}
      </div>

      {/* Distance Filter */}
      <div>
        <button
          onClick={() => toggleSection('distance')}
          className="flex items-center justify-between w-full font-semibold mb-3"
        >
          Distance
          <ChevronDown className="w-4 h-4" />
        </button>
        {expandedSections.includes('distance') && (
          <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
            <option>Any distance</option>
            <option>Within 5 miles</option>
            <option>Within 10 miles</option>
            <option>Within 25 miles</option>
            <option>Within 50 miles</option>
          </select>
        )}
      </div>
    </aside>
  );
}
