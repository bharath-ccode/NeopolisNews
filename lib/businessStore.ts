// Shared business types and defaults

export interface DayTiming {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export const DEFAULT_TIMINGS: DayTiming[] = [
  { day: "Monday",    open: "09:00", close: "21:00", closed: false },
  { day: "Tuesday",   open: "09:00", close: "21:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "21:00", closed: false },
  { day: "Thursday",  open: "09:00", close: "21:00", closed: false },
  { day: "Friday",    open: "09:00", close: "22:00", closed: false },
  { day: "Saturday",  open: "10:00", close: "22:00", closed: false },
  { day: "Sunday",    open: "10:00", close: "20:00", closed: true  },
];
