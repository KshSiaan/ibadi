"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationResult {
  label: string;
  lat: number;
  lng: number;
}

interface LocationSearchProps {
  value: LocationResult | null;
  onChange: (location: LocationResult | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({
  value,
  onChange,
  disabled,
  required,
  placeholder = "Search for a location…",
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "6");
        url.searchParams.set("addressdetails", "0");

        const res = await fetch(url.toString(), {
          headers: { "Accept-Language": "en" },
        });
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  function handleSelect(result: NominatimResult) {
    const location: LocationResult = {
      label: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    onChange(location);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {value ? (
        <div className="flex items-start gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="flex-1 text-sm text-slate-700 leading-snug">
            {value.label}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 text-slate-400 hover:text-slate-600"
              aria-label="Clear location"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            disabled={disabled}
            required={required && !value}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                <span className="leading-snug">{result.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
