export interface ModeVariant {
  id: string;
  label: string;
  style: string;
}

export interface TeachingMode {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  style: string;
  variants?: ModeVariant[];
}

const variants = (items: [string, string, string][]): ModeVariant[] =>
  items.map(([id, label, style]) => ({ id, label, style }));

export const MODES: TeachingMode[] = [
  { id: "textbook", label: "Textbook", emoji: "📖", blurb: "Clear, structured explanations", style: "Define the Azure concept, explain how it works in an organized sequence, and give a precise practical example." },
  { id: "friend", label: "Friend", emoji: "🤝", blurb: "Friendly and relaxed", style: "Explain through a relatable everyday situation as a supportive friend, using relaxed, natural language." },
  { id: "anime", label: "Anime", emoji: "⚡", blurb: "Big ideas, big energy", style: "Teach through an energetic, original adventure scenario with a challenge, a team, and a clear payoff.", variants: variants([["naruto", "Ninja adventure", "Use original teamwork and perseverance analogies."], ["dragon-ball", "Martial arts adventure", "Use original training and challenge analogies."], ["one-piece", "Pirate adventure", "Use original crew, voyage, and exploration analogies."]]) },
  { id: "film", label: "Film", emoji: "🎬", blurb: "Make it a movie", style: "Frame the explanation as an original movie scene with a setup, turning point, and outcome.", variants: variants([["action", "Action", "Use an action-adventure movie feel."], ["comedy", "Comedy", "Use light, family-friendly comedy."], ["scifi", "Sci-fi", "Use imaginative science-fiction scenarios."]]) },
  { id: "gossip", label: "Gossip", emoji: "🗣️", blurb: "The interesting story", style: "Open with a playful fictional neighborhood-gossip scenario, build harmless suspense, then reveal the concept respectfully." },
  { id: "house", label: "House & rent", emoji: "🏠", blurb: "Everyday home examples", style: "Explain through a concrete household, landlord, tenant, or neighborhood situation." },
  { id: "cars", label: "Cars", emoji: "🚗", blurb: "Under the bonnet", style: "Explain through a concrete car, road, journey, or workshop analogy and map its parts to Azure.", variants: variants([["racing", "Racing", "Use racing and pit-stop analogies."], ["road-trip", "Road trip", "Use road-trip and navigation analogies."], ["workshop", "Workshop", "Use garage and engine analogies."]]) },
  { id: "football", label: "Football", emoji: "⚽", blurb: "A team game", style: "Explain through a match, team, training, or tactics scenario, mapping roles and events to Azure.", variants: variants([["club", "Club football", "Use club and league football analogies."], ["national", "National teams", "Use international tournament analogies."], ["street", "Street football", "Use informal neighborhood football analogies."]]) },
  { id: "music", label: "Music", emoji: "🎵", blurb: "Find the rhythm", style: "Explain through a rehearsal, rhythm, instrument, or music-production scenario.", variants: variants([["afrobeats", "Afrobeats", "Use Afrobeats-inspired musical analogies."], ["choir", "Choir", "Use choir and ensemble analogies."], ["dj", "DJ", "Use mixing and sound-system analogies."]]) },
  { id: "kitchen", label: "Kitchen", emoji: "🍲", blurb: "Recipes and ingredients", style: "Explain through a recipe, ingredients, kitchen roles, or meal-preparation scenario." },
  { id: "gaming", label: "Gaming", emoji: "🎮", blurb: "Level up your knowledge", style: "Explain through an original quest, level, co-op challenge, or game mechanic.", variants: variants([["adventure", "Adventure", "Use exploration and quest analogies."], ["sports", "Sports games", "Use teams, stats, and tournament analogies."], ["puzzle", "Puzzle games", "Use clues, levels, and puzzle-solving analogies."]]) },
  { id: "classic", label: "Classic teacher", emoji: "📚", blurb: "Step-by-step lessons", style: "Teach patiently in a clear sequence with a simple worked example and a check for understanding." },
];

export interface Theme {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  accent: string;
}

export const THEMES: Theme[] = [
  { id: "savanna", label: "Savanna", emoji: "🌿", bg: "linear-gradient(145deg, #fff8e7, #e4f1d2)", accent: "#0B6B3A" },
  { id: "garden", label: "Flower garden", emoji: "🌸", bg: "linear-gradient(145deg, #fff1f5, #f2e5ff)", accent: "#a83f76" },
  { id: "ocean", label: "Indian Ocean", emoji: "🌊", bg: "linear-gradient(145deg, #e7f9ff, #c5e7f0)", accent: "#147a91" },
  { id: "night", label: "Starry night", emoji: "🌙", bg: "linear-gradient(145deg, #e5e2f5, #c5c4e4)", accent: "#36305f" },
  { id: "rainforest", label: "Rainforest", emoji: "🌳", bg: "linear-gradient(145deg, #e8f6e8, #b9dfc0)", accent: "#24613b" },
  { id: "sunset", label: "Sunset", emoji: "🌅", bg: "linear-gradient(145deg, #fff0dc, #ffc3a0)", accent: "#b9472e" },
  { id: "lavender", label: "Lavender", emoji: "💜", bg: "linear-gradient(145deg, #f5edff, #d8c5f2)", accent: "#68439a" },
];

export function getMode(id: string): TeachingMode {
  return MODES.find((mode) => mode.id === id) ?? MODES[0];
}

export function getTheme(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
