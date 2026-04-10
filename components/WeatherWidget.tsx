"use client";

import { useState, useEffect, useRef } from "react";
import { Wind, Droplets, Thermometer, X, ChevronDown } from "lucide-react";

// Kokapet, Hyderabad — typical April weather (used until live data loads)
const HOURLY_TEMPS    = [27,26,26,25,25,26,28,30,33,35,37,38,38,38,37,36,35,34,33,32,31,30,29,28];
const HOURLY_FEELS    = [28,27,27,26,26,27,29,31,35,38,40,41,41,41,40,39,37,36,34,33,32,31,30,29];
const HOURLY_CODES    = [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1];
const HOURLY_PRECIP   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const HOURLY_WIND     = [8, 7, 6, 6, 7, 9,11,13,15,17,19,20,20,19,18,17,16,15,13,11,10, 9, 8, 8];

function buildWeatherData(temps: number[], feels: number[], codes: number[], precip: number[], wind: number[], humidity: number) {
  const today = new Date().toISOString().split("T")[0];
  const nowH  = new Date().getHours();
  return {
    current: {
      temperature_2m:       temps[nowH],
      apparent_temperature: feels[nowH],
      weather_code:         codes[nowH],
      wind_speed_10m:       wind[nowH],
      relative_humidity_2m: humidity,
    },
    hourly: {
      time: Array.from({ length: 24 }, (_, i) => `${today}T${String(i).padStart(2,"0")}:00`),
      temperature_2m:           temps,
      apparent_temperature:     feels,
      weather_code:             codes,
      precipitation_probability: precip,
      wind_speed_10m:           wind,
    },
  };
}

function weatherInfo(code: number) {
  if (code === 0)                  return { emoji: "☀️",  label: "Clear sky" };
  if (code === 1)                  return { emoji: "🌤️", label: "Mainly clear" };
  if (code === 2)                  return { emoji: "⛅",  label: "Partly cloudy" };
  if (code === 3)                  return { emoji: "☁️",  label: "Overcast" };
  if (code === 45 || code === 48)  return { emoji: "🌫️", label: "Foggy" };
  if (code >= 51 && code <= 55)    return { emoji: "🌦️", label: "Drizzle" };
  if (code >= 61 && code <= 65)    return { emoji: "🌧️", label: "Rain" };
  if (code >= 71 && code <= 77)    return { emoji: "❄️",  label: "Snow" };
  if (code >= 80 && code <= 82)    return { emoji: "🌦️", label: "Showers" };
  if (code === 95)                 return { emoji: "⛈️",  label: "Thunderstorm" };
  if (code === 96 || code === 99)  return { emoji: "⛈️",  label: "Heavy storm" };
  return { emoji: "🌡️", label: "—" };
}

function fmt12h(isoTime: string) {
  const h = parseInt(isoTime.split("T")[1], 10);
  if (h === 0)  return "12 AM";
  if (h < 12)   return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WeatherWidget({ variant = "topbar" }: { variant?: "topbar" | "nav" }) {
  // Start with mock data immediately — no blank/loading state
  const [weather, setWeather] = useState(() =>
    buildWeatherData(HOURLY_TEMPS, HOURLY_FEELS, HOURLY_CODES, HOURLY_PRECIP, HOURLY_WIND, 38)
  );
  const [open, setOpen]       = useState(false);
  const panelRef              = useRef<HTMLDivElement>(null);
  const btnRef                = useRef<HTMLButtonElement>(null);

  // Try to fetch live data in background; silently fall back on error
  useEffect(() => {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=17.4126&longitude=78.3338" +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m" +
      "&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m" +
      "&timezone=Asia%2FKolkata&forecast_days=1";

    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (j?.current && j?.hourly) {
          setWeather({ current: j.current, hourly: j.hourly });
        }
      })
      .catch(() => {/* keep mock data */});
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const { current, hourly } = weather;
  const { emoji, label }    = weatherInfo(current.weather_code);
  const temp                = Math.round(current.temperature_2m);
  const feelsLike           = Math.round(current.apparent_temperature);
  const nowHour             = new Date().getHours();

  return (
    <div className="relative">

      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Kokapet weather"
        className={
          variant === "nav"
            ? "flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            : "flex items-center gap-1.5 text-xs text-brand-200 hover:text-white transition-colors"
        }
      >
        <span>{emoji}</span>
        <span className="font-semibold">{temp}°C</span>
        <span className={variant === "nav" ? "text-gray-400" : "opacity-70"}>{label}</span>
        {variant === "topbar" && <span className="opacity-50">· Kokapet</span>}
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* ── Detail panel ───────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-96 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 py-4 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wider mb-1">
                  Today · Kokapet, Hyderabad
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black leading-none">{temp}°</span>
                  <span className="text-3xl mb-0.5">{emoji}</span>
                </div>
                <p className="text-sm opacity-90 mt-1">{label}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 mt-3 text-xs opacity-80">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" /> Feels {feelsLike}°
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> {current.relative_humidity_2m}% humidity
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" /> {Math.round(current.wind_speed_10m)} km/h
              </span>
            </div>
          </div>

          {/* Hourly */}
          <div className="p-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Hourly forecast
            </p>
            <div className="overflow-x-auto">
              <div className="flex gap-1" style={{ width: "max-content" }}>
                {hourly.time.map((t, i) => {
                  const h     = parseInt(t.split("T")[1], 10);
                  const isNow = h === nowHour;
                  const { emoji: e } = weatherInfo(hourly.weather_code[i]);
                  const pr    = hourly.precipitation_probability[i];

                  return (
                    <div
                      key={t}
                      className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl min-w-[50px] ${
                        isNow ? "bg-brand-600 text-white" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className={`text-[11px] font-semibold ${isNow ? "text-brand-100" : "text-gray-400"}`}>
                        {fmt12h(t)}
                      </span>
                      <span className="text-base">{e}</span>
                      <span className={`text-sm font-bold ${isNow ? "text-white" : "text-gray-800"}`}>
                        {Math.round(hourly.temperature_2m[i])}°
                      </span>
                      {pr > 0 && (
                        <span className={`text-[10px] ${isNow ? "text-brand-200" : "text-blue-400"}`}>
                          {pr}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-300 pb-3">
            Kokapet, Hyderabad · Open-Meteo
          </p>
        </div>
      )}
    </div>
  );
}
