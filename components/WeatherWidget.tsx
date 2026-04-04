"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets } from "lucide-react";

interface WeatherData {
  temp: string;
  feelsLike: string;
  description: string;
  humidity: string;
  weatherCode: string;
}

function WeatherIcon({ code, className }: { code: string; className?: string }) {
  const c = parseInt(code, 10);
  if (c === 113) return <Sun className={className} />;
  if ([395, 392, 389, 386].includes(c)) return <CloudLightning className={className} />;
  if ([371, 368, 338, 335, 332, 329, 326, 323, 320, 317, 314, 311, 308, 305, 302, 299, 296, 293].includes(c))
    return <CloudRain className={className} />;
  if ([365, 362, 359, 356, 353, 350, 185, 182, 179].includes(c))
    return <CloudSnow className={className} />;
  return <Cloud className={className} />;
}

export default function WeatherWidget({ compact = false }: { compact?: boolean }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("https://wttr.in/Hyderabad?format=j1", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const current = data.current_condition?.[0];
        if (!current) throw new Error("No data");
        setWeather({
          temp: current.temp_C,
          feelsLike: current.FeelsLikeC,
          description: current.weatherDesc?.[0]?.value ?? "",
          humidity: current.humidity,
          weatherCode: current.weatherCode,
        });
      } catch {
        // silently fail — don't break the UI
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-brand-300 animate-pulse">
        <Cloud className="w-3.5 h-3.5" />
        <span>Loading…</span>
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-brand-300">
        <WeatherIcon code={weather.weatherCode} className="w-3.5 h-3.5" />
        <span className="font-semibold">{weather.temp}°C</span>
        <span className="hidden sm:inline text-brand-400">Hyderabad</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5 text-brand-200">
        <WeatherIcon code={weather.weatherCode} className="w-4 h-4 text-brand-300" />
        <span className="font-semibold text-white">{weather.temp}°C</span>
        <span className="text-brand-400 hidden sm:inline">{weather.description}</span>
      </div>
      <div className="flex items-center gap-2 text-brand-400 hidden sm:flex">
        <span className="flex items-center gap-0.5">
          <Droplets className="w-3 h-3" />
          {weather.humidity}%
        </span>
        <span className="flex items-center gap-0.5">
          <Wind className="w-3 h-3" />
          Feels {weather.feelsLike}°C
        </span>
      </div>
    </div>
  );
}
