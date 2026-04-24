export type VideoProvider = "zoom" | "meet" | "teams" | "webex" | "youtube" | "other";

export interface ProviderInfo {
  provider: VideoProvider;
  label: string;
  note: string;
  color: string;
}

const DETECTORS: { pattern: RegExp; info: ProviderInfo }[] = [
  {
    pattern: /zoom\.us\//,
    info: {
      provider: "zoom",
      label: "Zoom",
      note: "You'll need a free Zoom account to join.",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
  },
  {
    pattern: /meet\.google\.com\//,
    info: {
      provider: "meet",
      label: "Google Meet",
      note: "You'll need a Google account to join.",
      color: "bg-green-50 text-green-700 border-green-200",
    },
  },
  {
    pattern: /teams\.microsoft\.com\/|teams\.live\.com\//,
    info: {
      provider: "teams",
      label: "Microsoft Teams",
      note: "You'll need a Microsoft account to join.",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
  },
  {
    pattern: /webex\.com\//,
    info: {
      provider: "webex",
      label: "Cisco Webex",
      note: "You can join Webex as a guest — no account needed.",
      color: "bg-red-50 text-red-700 border-red-200",
    },
  },
  {
    pattern: /youtube\.com\/live|youtu\.be\//,
    info: {
      provider: "youtube",
      label: "YouTube Live",
      note: "Watch live on YouTube — no account needed.",
      color: "bg-red-50 text-red-600 border-red-200",
    },
  },
];

export function detectProvider(url: string): ProviderInfo {
  for (const { pattern, info } of DETECTORS) {
    if (pattern.test(url)) return info;
  }
  return {
    provider: "other",
    label: "Video Call",
    note: "You'll receive joining instructions after enrollment.",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  };
}
