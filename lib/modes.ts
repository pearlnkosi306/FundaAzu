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
  { id: "friend", label: "Friend", emoji: "🤝", blurb: "Friendly and relaxed", style: "Explain like a supportive friend: warm, clear, and conversational." },
  { id: "anime", label: "Anime", emoji: "⚡", blurb: "Big ideas, big energy", style: "Teach with exciting character arcs, challenges, and memorable anime-style moments.", variants: variants([["naruto", "Naruto", "Use teamwork, perseverance, and Naruto-world analogies."], ["dragon-ball", "Dragon Ball Z", "Use training, power levels, and Dragon Ball-style analogies."], ["one-piece", "One Piece", "Use crews, voyages, and One Piece-style analogies."]]) },
  { id: "film", label: "Film", emoji: "🎬", blurb: "Make it a movie", style: "Explain with scenes, casts, and story structure.", variants: variants([["action", "Action", "Use an action-adventure movie feel."], ["comedy", "Comedy", "Use light, family-friendly comedy."], ["scifi", "Sci-fi", "Use imaginative science-fiction scenarios."]]) },
  { id: "gossip", label: "Gossip", emoji: "🗣️", blurb: "The interesting story", style: "Use playful, respectful storytelling and a little harmless gossip-style suspense." },
  { id: "house", label: "House & rent", emoji: "🏠", blurb: "Everyday home examples", style: "Use renting, household, and neighborhood examples." },
  { id: "cars", label: "Cars", emoji: "🚗", blurb: "Under the bonnet", style: "Use vehicles, roads, mechanics, and journeys as analogies.", variants: variants([["racing", "Racing", "Use racing and pit-stop analogies."], ["road-trip", "Road trip", "Use road-trip and navigation analogies."], ["workshop", "Workshop", "Use garage and engine analogies."]]) },
  { id: "football", label: "Football", emoji: "⚽", blurb: "A team game", style: "Use football teams, tactics, training, and match-day examples.", variants: variants([["club", "Club football", "Use club and league football analogies."], ["national", "National teams", "Use international tournament analogies."], ["street", "Street football", "Use informal neighborhood football analogies."]]) },
  { id: "music", label: "Music", emoji: "🎵", blurb: "Find the rhythm", style: "Use rhythm, instruments, rehearsal, and music production analogies.", variants: variants([["afrobeats", "Afrobeats", "Use Afrobeats-inspired musical analogies."], ["choir", "Choir", "Use choir and ensemble analogies."], ["dj", "DJ", "Use mixing and sound-system analogies."]]) },
  { id: "kitchen", label: "Kitchen", emoji: "🍲", blurb: "Recipes and ingredients", style: "Use cooking, recipes, ingredients, and kitchen teamwork." },
  { id: "gaming", label: "Gaming", emoji: "🎮", blurb: "Level up your knowledge", style: "Use quests, game mechanics, and cooperative play.", variants: variants([["adventure", "Adventure", "Use exploration and quest analogies."], ["sports", "Sports games", "Use teams, stats, and tournament analogies."], ["puzzle", "Puzzle games", "Use clues, levels, and puzzle-solving analogies."]]) },
  { id: "classic", label: "Classic teacher", emoji: "📚", blurb: "Step-by-step lessons", style: "Teach clearly and patiently, define terms, and use a structured lesson." },
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
];

export function getMode(id: string): TeachingMode {
  return MODES.find((mode) => mode.id === id) ?? MODES[0];
}

export function getTheme(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
