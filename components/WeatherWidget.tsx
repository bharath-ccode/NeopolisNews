"use client";

import { useEffect, useRef, useState } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  ChevronDown,
  MapPin,
  PersonStanding,
  Leaf,
} from "lucide-react";

interface WeatherDay {
  date: string;
  maxC: string;
  minC: string;
  code: string;
}

interface WeatherData {
  temp: string;
  feelsLike: string;
  description: string;
  humidity: string;
  windKmph: string;
  visibility: string;
  uvIndex: string;
  weatherCode: string;
  forecast: WeatherDay[];
  aqi: number | null;
}

interface AqiInfo {
  label: string;
  color: string;        // Tailwind bg
  textColor: string;    // Tailwind text
  badgeBg: string;      // inline style fallback
  advice: string;
  emoji: string;
}

function getAqiInfo(aqi: number): AqiInfo {
  if (aqi <= 50)
    return {
      label: "Good",
      color: "bg-green-100",
      textColor: "text-green-700",
      badgeBg: "#dcfce7",
      advice: "Great day for a walk!",
      emoji: "🟢",
    };
  if (aqi <= 100)
    return {
      label: "Moderate",
      color: "bg-yellow-100",
      textColor: "text-yellow-700",
      badgeBg: "#fef9c3",
      advice: "Fine for most people outdoors.",
      emoji: "🟡",
    };
  if (aqi <= 150)
    return {
      label: "Unhealthy for Sensitive Groups",
      color: "bg-orange-100",
      textColor: "text-orange-700",
      badgeBg: "#ffedd5",
      advice: "Sensitive groups should limit outdoor walks.",
      emoji: "🟠",
    };
  if (aqi <= 200)
    return {
      label: "Unhealthy",
      color: "bg-red-100",
      textColor: "text-red-700",
      badgeBg: "#fee2e2",
      advice: "Limit prolonged outdoor activity.",
      emoji: "🔴",
    };
  if (aqi <= 300)
    return {
      label: "Very Unhealthy",
      color: "bg-purple-100",
      textColor: "text-purple-700",
      badgeBg: "#f3e8ff",
      advice: "Avoid outdoor walks today.",
      emoji: "🟣",
    };
  return {
    label: "Hazardous",
    color: "bg-rose-100",
    textColor: "text-rose-800",
    badgeBg: "#ffe4e6",
    advice: "Stay indoors — air is hazardous.",
    emoji: "⚫",
  };
}

function WeatherIcon({ code, className }: { code: string; className?: string }) {
  const c = parseInt(code, 10);
  if (c === 113) return <Sun className={className} />;
  if ([395, 392, 389, 386].includes(c)) return <CloudLightning className={className} />;
  if ([371, 368, 338, 335, 332, 329, 326, 323, 320, 317, 314, 311, 308, 305,
       302, 299, 296, 293].includes(c)) return <CloudRain className={className} />;
  if ([365, 362, 359, 356, 353, 350, 185, 182, 179].includes(c))
    return <CloudSnow className={className} />;
  return <Cloud className={className} />;
}

function shortDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch weather + AQI in parallel
        const [weatherRes, aqiRes] = await Promise.allSettled([
          fetch("https://wttr.in/Kokapet,Telangana?format=j1", { cache: "no-store" }),
          fetch(
            "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=17.4065&longitude=78.3772&current=us_aqi",
            { cache: "no-store" }
          ),
        ]);

        if (weatherRes.status !== "fulfilled" || !weatherRes.value.ok)
          throw new Error("Weather fetch failed");

        const data = await weatherRes.value.json();
        const current = data.current_condition?.[0];
        if (!current) throw new Error("No weather data");

        const forecast: WeatherDay[] = (data.weather ?? [])
          .slice(0, 3)
          .map((w: Record<string, unknown>) => ({
            date: w.date as string,
            maxC: w.maxtempC as string,
            minC: w.mintempC as string,
            code:
              ((w.hourly as Record<string, unknown>[])?.[4]
                ?.weatherCode as string) ?? "116",
          }));

        let aqi: number | null = null;
        if (aqiRes.status === "fulfilled" && aqiRes.value.ok) {
          const aqiData = await aqiRes.value.json();
          aqi = aqiData?.current?.us_aqi ?? null;
        }

        setWeather({
          temp: current.temp_C,
          feelsLike: current.FeelsLikeC,
          description: current.weatherDesc?.[0]?.value ?? "",
          humidity: current.humidity,
          windKmph: current.windspeedKmph,
          visibility: current.visibility,
          uvIndex: current.uvIndex,
          weatherCode: current.weatherCode,
          forecast,
          aqi,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-brand-300 animate-pulse select-none">
        <Cloud className="w-3.5 h-3.5" />
        <span>Loading…</span>
      </div>
    );
  }

  if (!weather) return null;

  const aqiInfo = weather.aqi !== null ? getAqiInfo(weather.aqi) : null;

  return (
    <div className="relative" ref={ref}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 text-xs text-brand-200 hover:text-white cursor-pointer select-none transition-colors py-0.5 px-1 rounded hover:bg-brand-800"
      >
        <WeatherIcon code={weather.weatherCode} className="w-3.5 h-3.5 text-brand-300" />
        <span className="font-semibold">{weather.temp}°C</span>
        <span className="hidden sm:inline text-brand-400">{weather.description}</span>
        {aqiInfo && (
          <span className="hidden sm:inline text-brand-400">
            · AQI {weather.aqi}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-brand-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Expanded dropdown panel ── */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-brand-300 text-xs">
                <MapPin className="w-3 h-3" />
                <span>Kokapet, Telangana</span>
              </div>
              <span className="text-brand-400 text-xs">{weather.description}</span>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <WeatherIcon
                  code={weather.weatherCode}
                  className="w-10 h-10 text-brand-200"
                />
                <span className="text-4xl font-bold">{weather.temp}°C</span>
              </div>
              <span className="text-brand-300 text-sm mb-1">
                Feels like {weather.feelsLike}°C
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px bg-gray-100">
            {[
              { icon: Droplets, label: "Humidity",   value: `${weather.humidity}%` },
              { icon: Wind,     label: "Wind",       value: `${weather.windKmph} km/h` },
              { icon: Eye,      label: "Visibility", value: `${weather.visibility} km` },
              { icon: Thermometer, label: "UV Index", value: weather.uvIndex },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white px-4 py-2.5 flex items-center gap-2">
                <Icon className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AQI + Walking advice */}
          {aqiInfo && (
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Air Quality
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-brand-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">AQI (US)</p>
                    <p className="text-sm font-bold text-gray-800">
                      {weather.aqi}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${aqiInfo.color} ${aqiInfo.textColor}`}
                >
                  {aqiInfo.label}
                </span>
              </div>

              {/* Walking advice */}
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <PersonStanding className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    Walking Advice
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{aqiInfo.advice}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3-day forecast */}
          {weather.forecast.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                3-Day Forecast
              </p>
              <div className="flex justify-between">
                {weather.forecast.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">
                      {shortDay(day.date)}
                    </span>
                    <WeatherIcon code={day.code} className="w-5 h-5 text-brand-500" />
                    <span className="text-xs font-bold text-gray-800">{day.maxC}°</span>
                    <span className="text-xs text-gray-400">{day.minC}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Weather: wttr.in · AQI: Open-Meteo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
