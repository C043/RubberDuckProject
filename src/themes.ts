export interface Theme {
  id: string;
  label: string;
  swatch: string;
  rim: string;
  shadow: string;
  shadowOpacity: number;
}

// Background gradients live in App.css under [data-theme="<id>"].
export const THEMES: Theme[] = [
  { id: "bath", label: "Bath", swatch: "#5ec8e8", rim: "#9be7ff", shadow: "#0b4a63", shadowOpacity: 0.55 },
  { id: "night", label: "Night", swatch: "#2a2350", rim: "#8f7bff", shadow: "#000000", shadowOpacity: 0.75 },
  { id: "studio", label: "Studio", swatch: "#f1ece4", rim: "#ffffff", shadow: "#3d3426", shadowOpacity: 0.4 },
];
