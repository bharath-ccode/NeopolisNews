"use client";

import { useState, useEffect, useRef } from "react";
import { Wind, Droplets, Thermometer, X, ChevronDown, PersonStanding, Leaf } from "lucide-react";

function getAqiInfo(aqi: number) {
  if (aqi <= 50)  return { label: "Good",                          color: "bg-green-100",  textColor: "text-green-700",  advice: "Great day for a walk!" };
  if (aqi <= 100) return { label: "Moderate",                      color: "bg-yellow-100", textColor: "text-yellow-700", advice: "Fine for most people outdoors." };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-100", textColor: "text-orange-700", advice: "Sensitive groups should limit outdoor walks." };
  if (aqi <= 200) return { label: "Unhealthy",                     color: "bg-red-100",    textColor: "text-red-700",    advice: "Limit prolonged outdoor activity." };
  if (aqi <= 300) return { label: "Very Unhealthy",                color: "bg-purple-100", textColor: "text-purple-700", advice: "Avoid outdoor walks today." };
  return           { label: "Hazardous",                           color: "bg-rose-100",   textColor: "text-rose-800",   advice: "Stay indoors — air is hazardous." };
}

// Kokapet, Hyderabad — typical April weather (used until live data loads)
const HOURLY_TEMPS    = [27,26,26,25,25,26,28,30,33,35,37,38,38,38,37,36,35,34,33,32,31,30,29,28];
const HOURLY_FEELS    = [28,27,27,26,26,27,29,31,35,38,40,41,41,41,40,39,37,36,34,33,32,31,30,29];
const HOURLY_CODES    = [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1];
const HOURLY_PRECIP   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const HOURLY_WIND     = [8, 7, 6, 6, 7, 9,11,13,15,17,19,20,20,19,18,17,16,15,13,11,10, 9, 8, 8];

// Mock 3-day forecast offsets (tomorrow, +2, +3)
const DAILY_MOCK = [
  { maxTemp: 39, minTemp: 27, code: 1 },
  { maxTemp: 38, minTemp: 27, code: 2 },
  { maxTemp: 37, minTemp: 26, code: 2 },
];

function buildWeatherData(temps: number[], feels: number[], codes: number[], precip: number[], wind: number[], humidity: number) {
  const today = new Date().toISOString().split("T")[0];
  const nowH  = new Date().getHours();
  const daily = DAILY_MOCK.map((d, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return { date: date.toISOString().split("T")[0], maxTemp: d.maxTemp, minTemp: d.minTemp, code: d.code };
  });
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
    daily,
  };
}

function shortDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });
}

function weatherInfo(code: number, hour?: number) {
  const isNight = hour !== undefined && (hour < 6 || hour >= 19);
  if (code === 0)                  return { emoji: isNight ? "🌙"  : "☀️",  label: "Clear sky" };
  if (code === 1)                  return { emoji: isNight ? "🌙"  : "🌤️", label: "Mainly clear" };
  if (code === 2)                  return { emoji: isNight ? "☁️"  : "⛅",  label: "Partly cloudy" };
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
  const [weather, setWeather] = useState<ReturnType<typeof buildWeatherData>>(() =>
    buildWeatherData(HOURLY_TEMPS, HOURLY_FEELS, HOURLY_CODES, HOURLY_PRECIP, HOURLY_WIND, 38)
  );
  const [aqi, setAqi]         = useState<number | null>(null);
  const [open, setOpen]       = useState(false);
  const panelRef              = useRef<HTMLDivElement>(null);
  const btnRef                = useRef<HTMLButtonElement>(null);

  // Try to fetch live data in background; silently fall back on error
  useEffect(() => {
    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=17.4126&longitude=78.3338" +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m" +
      "&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&timezone=Asia%2FKolkata&forecast_days=4";

    const aqiUrl =
      "https://air-quality-api.open-meteo.com/v1/air-quality" +
      "?latitude=17.4065&longitude=78.3772&current=us_aqi";

    fetch(weatherUrl)
      .then((r) => r.json())
      .then((j) => {
        if (j?.current && j?.hourly) {
          // Build daily forecast (next 3 days, skip today at index 0)
          const daily = j.daily?.time
            ? (j.daily.time as string[]).slice(1, 4).map((date: string, i: number) => ({
                date,
                maxTemp: Math.round(j.daily.temperature_2m_max[i + 1]),
                minTemp: Math.round(j.daily.temperature_2m_min[i + 1]),
                code:    j.daily.weather_code[i + 1] as number,
              }))
            : weather.daily;
          setWeather({ current: j.current, hourly: j.hourly, daily });
        }
      })
      .catch(() => {/* keep mock data */});

    fetch(aqiUrl)
      .then((r) => r.json())
      .then((j) => { if (j?.current?.us_aqi != null) setAqi(j.current.us_aqi); })
      .catch(() => {/* silently fail */});
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

  const { current, hourly, daily } = weather;
  const nowHour             = new Date().getHours();
  const { emoji, label }    = weatherInfo(current.weather_code, nowHour);
  const temp                = Math.round(current.temperature_2m);
  const feelsLike           = Math.round(current.apparent_temperature);
  const aqiInfo             = aqi !== null ? getAqiInfo(aqi) : null;

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
            : "flex items-center gap-2 text-sm text-white hover:text-white transition-colors"
        }
      >
        <span className="text-base leading-none">{emoji}</span>
        <span className="text-base font-black tracking-tight">{temp}°C</span>
        <span className={variant === "nav" ? "text-gray-400" : "text-brand-300 font-medium"}>{label}</span>
        {variant === "topbar" && <span className="text-brand-400 text-xs">· Kokapet</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-brand-300 transition-transform ${open ? "rotate-180" : ""}`} />
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
                  const { emoji: e } = weatherInfo(hourly.weather_code[i], h);
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

          {/* 3-day forecast */}
          {daily.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Next 3 days
              </p>
              <div className="flex justify-between gap-1">
                {daily.map((day) => {
                  const { emoji: e, label: l } = weatherInfo(day.code);
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-1 flex-1 bg-gray-50 rounded-xl py-2">
                      <span className="text-[11px] font-semibold text-gray-500">{shortDay(day.date)}</span>
                      <span className="text-xl">{e}</span>
                      <span className="text-xs text-gray-400 text-center leading-tight">{l}</span>
                      <span className="text-sm font-bold text-gray-800">{day.maxTemp}°</span>
                      <span className="text-xs text-gray-400">{day.minTemp}°</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AQI + Walking advice */}
          {aqiInfo && aqi !== null && (
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Air Quality
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-brand-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">AQI · Kokapet</p>
                    <p className="text-sm font-bold text-gray-800">{aqi}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${aqiInfo.color} ${aqiInfo.textColor}`}>
                  {aqiInfo.label}
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <PersonStanding className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-600">Walking Advice</p>
                  <p className="text-xs text-gray-500 mt-0.5">{aqiInfo.advice}</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-gray-300 pb-3">
            Kokapet, Hyderabad · Open-Meteo
          </p>
        </div>
      )}
    </div>
  );
}
