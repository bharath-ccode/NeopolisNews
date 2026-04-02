"use client";

import { useState, useEffect, useRef } from "react";
import { Wind, Droplets, Thermometer, X, ChevronDown } from "lucide-react";

// Kokapet, Hyderabad — 17.4126°N, 78.3338°E
// In production replace getMockWeather() with a real fetch to:
// https://api.open-meteo.com/v1/forecast?latitude=17.4126&longitude=78.3338
//   &current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m
//   &hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m
//   &timezone=Asia/Kolkata&forecast_days=1

interface WeatherCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
}

interface WeatherHourly {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  weather_code: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
}

interface WeatherData {
  current: WeatherCurrent;
  hourly: WeatherHourly;
}

function weatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "☀️", label: "Clear sky" };
  if (code === 1) return { emoji: "🌤️", label: "Mainly clear" };
  if (code === 2) return { emoji: "⛅", label: "Partly cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code === 45 || code === 48) return { emoji: "🌫️", label: "Foggy" };
  if (code >= 51 && code <= 55) return { emoji: "🌦️", label: "Drizzle" };
  if (code >= 61 && code <= 65) return { emoji: "🌧️", label: "Rain" };
  if (code >= 71 && code <= 77) return { emoji: "❄️", label: "Snow" };
  if (code >= 80 && code <= 82) return { emoji: "🌦️", label: "Showers" };
  if (code === 95) return { emoji: "⛈️", label: "Thunderstorm" };
  if (code === 96 || code === 99) return { emoji: "⛈️", label: "Heavy storm" };
  return { emoji: "🌡️", label: "—" };
}

function fmt12h(isoTime: string): string {
  const hour = parseInt(isoTime.split("T")[1].split(":")[0], 10);
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

// Typical Kokapet, Hyderabad April weather (used as fallback when API is unreachable)
function getMockWeather(): WeatherData {
  const today = new Date().toISOString().split("T")[0];
  const hourlyTemps    = [27,26,26,25,25,26,28,30,33,35,37,38,38,38,37,36,35,34,33,32,31,30,29,28];
  const hourlyFeels    = [28,27,27,26,26,27,29,31,35,38,40,41,41,41,40,39,37,36,34,33,32,31,30,29];
  const hourlyCodes    = [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1];
  const hourlyPrecip   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const hourlyWind     = [8, 7, 6, 6, 7, 9,11,13,15,17,19,20,20,19,18,17,16,15,13,11,10, 9, 8, 8];
  const nowHour = new Date().getHours();

  return {
    current: {
      temperature_2m: hourlyTemps[nowHour],
      apparent_temperature: hourlyFeels[nowHour],
      weather_code: hourlyCodes[nowHour],
      wind_speed_10m: hourlyWind[nowHour],
      relative_humidity_2m: 38,
    },
    hourly: {
      time: Array.from({ length: 24 }, (_, i) => `${today}T${String(i).padStart(2, "0")}:00`),
      temperature_2m: hourlyTemps,
      apparent_temperature: hourlyFeels,
      weather_code: hourlyCodes,
      precipitation_probability: hourlyPrecip,
      wind_speed_10m: hourlyWind,
    },
  };
}

export default function WeatherWidget({ variant = "topbar" }: { variant?: "topbar" | "nav" }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const API_URL =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=17.4126&longitude=78.3338` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
      `&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m` +
      `&timezone=Asia%2FKolkata&forecast_days=1`;

    fetch(API_URL)
      .then((r) => r.json())
      .then((json) => {
        if (json?.current && json?.hourly) {
          setData({ current: json.current, hourly: json.hourly });
        } else {
          setData(getMockWeather());
        }
      })
      .catch(() => setData(getMockWeather()));
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!data) {
    return (
      <span className="flex items-center gap-1 opacity-40 animate-pulse text-xs select-none">
        ··· °C
      </span>
    );
  }

  const { current, hourly } = data;
  const { emoji, label } = weatherInfo(current.weather_code);
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const nowHour = new Date().getHours();

  return (
    <div className="relative">
      {/* Summary chip */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
          variant === "nav"
            ? "text-gray-600 hover:text-gray-900 text-sm"
            : "text-brand-200 hover:text-white text-xs"
        }`}
        aria-expanded={open}
        aria-label="Weather in Kokapet"
      >
        <span role="img" aria-hidden>{emoji}</span>
        <span className="font-semibold">{temp}°C</span>
        <span className="opacity-70">{label}</span>
        {variant === "topbar" && <span className="hidden sm:inline opacity-50">· Kokapet</span>}
        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Detail panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[420px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 py-4 text-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold opacity-75 uppercase tracking-wider">
                  Today · Kokapet, Hyderabad
                </p>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-5xl font-black">{temp}°</span>
                  <span className="text-3xl leading-none mb-1">{emoji}</span>
                </div>
                <p className="text-sm font-medium opacity-90 mt-0.5">{label}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1 opacity-80">
                <Thermometer className="w-3.5 h-3.5" />
                Feels {feelsLike}°
              </span>
              <span className="flex items-center gap-1 opacity-80">
                <Droplets className="w-3.5 h-3.5" />
                {current.relative_humidity_2m}% humidity
              </span>
              <span className="flex items-center gap-1 opacity-80">
                <Wind className="w-3.5 h-3.5" />
                {Math.round(current.wind_speed_10m)} km/h
              </span>
            </div>
          </div>

          {/* Hourly forecast */}
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Hourly forecast
            </p>
            <div className="overflow-x-auto -mx-1 pb-1">
              <div className="flex gap-1.5 px-1" style={{ minWidth: "max-content" }}>
                {hourly.time.map((t, i) => {
                  const hour = parseInt(t.split("T")[1].split(":")[0], 10);
                  const isNow = hour === nowHour;
                  const { emoji: hEmoji } = weatherInfo(hourly.weather_code[i]);
                  const hTemp = Math.round(hourly.temperature_2m[i]);
                  const precip = hourly.precipitation_probability[i];

                  return (
                    <div
                      key={t}
                      className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl min-w-[52px] transition-colors ${
                        isNow
                          ? "bg-brand-600 text-white shadow-sm"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${isNow ? "text-brand-100" : "text-gray-400"}`}>
                        {fmt12h(t)}
                      </span>
                      <span className="text-base leading-none">{hEmoji}</span>
                      <span className={`text-sm font-bold ${isNow ? "text-white" : "text-gray-800"}`}>
                        {hTemp}°
                      </span>
                      {precip > 0 && (
                        <span className={`text-xs ${isNow ? "text-brand-200" : "text-blue-400"}`}>
                          {precip}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-4 pb-3 text-center">
            <p className="text-[10px] text-gray-300">Kokapet, Hyderabad · Open-Meteo</p>
          </div>
        </div>
      )}
    </div>
  );
}
