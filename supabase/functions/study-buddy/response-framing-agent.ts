const responseFrames: Record<string, string> = {
  Textbook: "Use an organized, accurate lesson: define the concept, explain how it works, and give one precise example. Include one concise, plain explanatory comparison without forcing a fictional story.",
  Friend: "Explain as a supportive friend using an everyday situation the learner can picture. Keep the friendly conversational framing through the explanation, then state the exact Azure fact plainly.",
  Anime: "Build an original adventure around a team facing a challenge. Carry that mission through the explanation, then map the team's roles and actions to Azure. Never use existing franchise characters, scenes, or dialogue.",
  Film: "Tell a short, vivid original movie scene with a setup, conflict, turning point, and outcome. The analogy and separate example must both use cinematic events and characters; do not use an abstract city/building metaphor or switch to generic prose.",
  Gossip: "Start with a playful fictional hook such as 'Imagine you find out your neighbor...' and tell a harmless, respectful neighborhood story that reveals the concept. Keep the story central throughout; do not switch to generic textbook bullets.",
  "House & rent": "Use one concrete household, landlord, tenant, or neighborhood situation as the through-line. Explain the concept through what each person needs or does, then distinguish the real Azure behavior.",
  Cars: "Use one concrete car, road, journey, or workshop situation as the through-line. Explain the concept using relevant vehicle parts and events, then map them clearly to Azure without claiming the analogy is literal.",
  Football: "Use one concrete team, training, tactics, or match situation as the through-line. Explain the concept through the players, roles, and match events, then state the exact Azure mapping.",
  Music: "Use one concrete rehearsal, rhythm, instrument, or production setup as the through-line. Explain the concept through musical roles and events, then state the exact Azure mapping.",
  Kitchen: "Use one concrete kitchen scene as the through-line: for example, a busy kitchen preparing a surprise dinner rush. Explain the concept through ingredients, equipment, prep stations, orders, and kitchen staff only where each maps usefully; connect every key claim to this scene and then state the exact Azure fact. Do not give generic business examples unrelated to the kitchen.",
  Gaming: "Use an original quest, level, co-op challenge, or game mechanic as the through-line. Explain the concept through the game scenario, then state the exact Azure mapping.",
  "Classic teacher": "Teach patiently in a clear sequence using a simple worked example, checking understanding where useful. Include one concise, plain explanatory comparison, while keeping the explanation direct and orderly.",
};

const variantFrames: Record<string, Record<string, string>> = {
  Anime: {
    "Ninja adventure": "Use original ninja-team teamwork and perseverance imagery.",
    "Martial arts adventure": "Use original training, practice, and challenge imagery.",
    "Pirate adventure": "Use an original crew, voyage, and exploration scenario.",
  },
  Film: {
    Action: "Use a specific original action-adventure rescue or urgent mission: a named team has a clear objective, a time pressure, an obstacle, and a resolution. Make the analogy and separate example both refer to this mission, its team, equipment, and communications. Do not use a generic city, buildings, elevators, or unrelated business examples.",
    Comedy: "Use gentle original humor without losing the explanation.",
    "Sci-fi": "Use original speculative technology, clearly separate from real Azure facts.",
  },
  Cars: {
    Racing: "Use a racing event and pit-stop details.",
    "Road trip": "Use route planning and a journey.",
    Workshop: "Use a garage, mechanic, and engine details.",
  },
  Football: {
    "Club football": "Use a club and league context.",
    "National teams": "Use an international tournament context.",
    "Street football": "Use an informal neighborhood match.",
  },
  Music: {
    Afrobeats: "Use rhythm and ensemble imagery without imitating any artist or song.",
    Choir: "Use vocal sections and a choir working together.",
    DJ: "Use mixing, channels, and a sound system.",
  },
  Gaming: {
    Adventure: "Use exploration and quest progression.",
    "Sports games": "Use teams, stats, and a tournament.",
    "Puzzle games": "Use clues, levels, and puzzle-solving.",
  },
};

export interface FramedTutorResponse {
  direct_answer: string;
  analogy: string;
  example: string;
  visual: string;
  differences: string;
  summary: string;
}

const englishThemeTerms: Record<string, string[]> = {
  Anime: ["anime", "adventure", "ninja", "crew", "quest", "team"],
  Film: ["film", "movie", "scene", "director", "actor", "mission", "rescue"],
  Gossip: ["neighbor", "neighbour", "gossip", "rumor", "rumour", "imagine", "neighborhood"],
  "House & rent": ["house", "home", "rent", "tenant", "landlord", "kitchen", "neighbor"],
  Cars: ["car", "vehicle", "road", "drive", "journey", "garage", "mechanic"],
  Football: ["football", "match", "team", "player", "goal", "pitch", "coach"],
  Music: ["music", "rhythm", "song", "instrument", "choir", "rehearsal", "mix"],
  Kitchen: ["kitchen", "recipe", "chef", "ingredient", "meal", "stove", "order"],
  Gaming: ["game", "player", "level", "quest", "mission", "co-op", "puzzle"],
};

const englishVariantTerms: Record<string, Record<string, string[]>> = {
  Film: {
    Action: ["action", "mission", "rescue", "chase", "urgent", "operative", "hero", "pursuit", "obstacle"],
  },
};

export function findFramingViolations(
  response: FramedTutorResponse,
  mode: string,
  variant: string,
  language: string,
): string[] {
  if (language !== "English") return [];
  const violations: string[] = [];
  const modeTerms = englishThemeTerms[mode];
  const variantTerms = englishVariantTerms[mode]?.[variant];
  const fields = [
    ["analogy", response.analogy],
    ["example", response.example],
  ] as const;

  for (const [name, content] of fields) {
    const normalized = content.toLowerCase();
    if (modeTerms && !modeTerms.some((term) => normalized.includes(term))) {
      violations.push(`${name} is missing a clear ${mode} theme marker`);
    }
    if (variantTerms && !variantTerms.some((term) => normalized.includes(term))) {
      violations.push(`${name} is missing a clear ${variant} variant marker`);
    }
  }
  return violations;
}

export function questionNeedsDifferences(question: string): boolean {
  const asksForComparison = /\b(compare|comparison|difference(?:s)?|differ(?:ence|ent)?|distinguish|contrast|versus|vs\.?|change across|varies across)\b/i
    .test(question);
  const serviceModels = new Set(question.match(/\b(?:IaaS|PaaS|SaaS)\b/gi)?.map((model) => model.toLowerCase()) ?? []);
  return asksForComparison || serviceModels.size > 1;
}

export function getFramingMarkerRepairGuidance(
  mode: string,
  variant: string,
  violations: string[],
): string {
  const modeMarker = englishThemeTerms[mode]?.[0];
  const variantMarker = englishVariantTerms[mode]?.[variant]?.[0];
  if (!modeMarker && !variantMarker) return "";

  const fields = [...new Set(violations.map((violation) => violation.split(" ")[0]))]
    .filter((field) => field === "analogy" || field === "example" || field === "visual");
  const markers = [modeMarker, variantMarker].filter((marker): marker is string => Boolean(marker));
  return fields.map((field) =>
    `The ${field} must contain the exact word${markers.length === 1 ? "" : "s"} ${markers.map((marker) => `"${marker}"`).join(" and ")} while clearly continuing the selected theme.`
  ).join(" ");
}

export function getFramedResponseSchema() {
  return {
    type: "json_schema",
    json_schema: {
      name: "themed_tutor_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          direct_answer: { type: "string" },
          analogy: { type: "string" },
          example: { type: "string" },
          visual: { type: "string" },
          differences: { type: "string" },
          summary: { type: "string" },
        },
        required: ["direct_answer", "analogy", "example", "visual", "differences", "summary"],
        additionalProperties: false,
      },
    },
  };
}

export function parseFramedTutorResponse(
  content: string,
  visuals: boolean,
): FramedTutorResponse {
  const parsed: unknown = JSON.parse(content);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("The AI response did not contain the required answer sections.");
  }
  const response = parsed as Partial<FramedTutorResponse>;
  if (
    typeof response.direct_answer !== "string" || !response.direct_answer.trim()
    || typeof response.analogy !== "string" || !response.analogy.trim()
    || typeof response.example !== "string" || !response.example.trim()
    || typeof response.visual !== "string"
    || typeof response.differences !== "string"
    || typeof response.summary !== "string" || !response.summary.trim()
  ) {
    throw new Error("The AI response was missing a required answer section.");
  }
  const visual = response.visual.trim()
    .replace(/^```(?:mermaid)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  if (visuals && !/^(?:flowchart|graph)\s+(?:TD|TB|BT|RL|LR)\b/i.test(visual)) {
    throw new Error("The AI response did not include a valid themed flowchart. Please try again.");
  }
  if (!visuals && visual) {
    throw new Error("The AI response included a visual even though visuals are disabled. Please try again.");
  }
  return {
    direct_answer: response.direct_answer,
    analogy: response.analogy,
    example: response.example,
    visual,
    differences: response.differences,
    summary: response.summary,
  };
}

export function formatFramedTutorResponse(
  response: FramedTutorResponse,
  mode: string,
  variant: string,
  visuals: boolean,
): string {
  const frameLabel = [mode, variant].filter(Boolean).join(" · ");
  const sections = [
    `### Direct Answer\n${response.direct_answer.trim()}`,
    `### ${frameLabel} Analogy\n${response.analogy.trim()}`,
    `### ${frameLabel} Example\n${response.example.trim()}`,
  ];
  if (visuals) sections.push(`### ${frameLabel} Visual\n\`\`\`mermaid\n${response.visual.trim()}\n\`\`\``);
  if (response.differences.trim()) sections.push(`### Differences\n${response.differences.trim()}`);
  sections.push(`### Summary\n${response.summary.trim()}`);
  return sections.join("\n\n");
}

export function buildResponseFramingInstructions(
  mode: string,
  variant: string,
  visuals: boolean,
): string[] {
  const selectedFrame = responseFrames[mode] ?? responseFrames.Textbook;
  const selectedVariant = variantFrames[mode]?.[variant];
  return [
    "RESPONSE-FRAMING AGENT — MANDATORY CONTRACT",
    `Selected frame: ${selectedFrame}${selectedVariant ? ` ${selectedVariant}` : ""}`,
    "Before drafting, identify and obey every setting provided for this reply: selected language, teaching mode, mode variant, visual on/off, and optional learner example setting. If the learner did not explicitly choose a per-reply customization, use the active preference values supplied by the app (the same values shown in the current header); never fall back to a generic style or a prior message's style. These current request settings are the active settings shown in the learner's header and preferences. Apply them identically to questions selected from AZ-900 common questions, chapter browsing, suggested prompts, and manually typed questions. The question source itself is lesson content, not a style override, and never overrides the active settings or prior chat history. Do not replace, ignore, or infer a different preference from chat history. Write the whole response, including section labels and diagram text, in the selected language except for official Azure names and exam terms that should remain in English.",
    "The selected frame controls the actual explanation, not just the greeting, heading, or first analogy sentence. Start with a concrete scene in this frame (except Textbook and Classic teacher), and keep the same scene active across the whole answer. Every major point, list item, or benefit must be explained through that scene; do not pivot into generic textbook exposition or unrelated generic examples. When a mapping would be misleading, say so briefly and state the real Azure fact instead of forcing the analogy.",
    "Return content for these exact JSON fields only; the server creates all section headings, so do not create headings yourself: direct_answer, analogy, example, visual, differences, summary. direct_answer gives only a concise 1–3 sentence factual answer to the exact question; do not put the full lesson, lists, or extra headings in this field. analogy is a clear, mode-matched explanation, distinct from the direct answer. example is a separate concrete example in the same theme, with accurate Azure facts. visual is Mermaid flowchart source only, with no Markdown fences, when visuals are enabled; use an empty string when disabled. differences briefly compares the concepts whenever the question asks for a comparison or covers multiple related service models; otherwise return an empty string. summary is always a concise recap in plain language that reinforces the correct Azure facts. Do not omit required content; only differences may be empty when irrelevant. Keep all fields in the selected language, except official Azure names and exam terms.",
    "For a multi-part question, address each requested part using the selected frame. End with the separate summary field so the learner can distinguish the analogy from the real Azure concept. Preserve technical accuracy; if part of an analogy is not exact, say so clearly instead of forcing a false mapping.",
    visuals
      ? "VISUAL CONTRACT: Include exactly one concise, syntactically valid Mermaid flowchart in every answer, including short answers. Make its nodes and labels use the SAME selected scenario and explicitly map at least one scenario element to its Azure counterpart. For a simple question, use a tiny two- or three-node diagram rather than omitting it. Do not output a generic cloud diagram. Keep Azure product names accurate. The app renders this Mermaid diagram as an SVG visual."
      : "VISUAL CONTRACT: The learner has visuals disabled. Do not include Mermaid, ASCII art, or other diagrams.",
    "MANDATORY PRE-SEND REVIEW: Before returning the response, silently check it against the current reply settings and revise it until all checks pass: concise Direct Answer, selected-theme Analogy, separate selected-theme Example, Differences when relevant (especially explicit comparisons or multiple related service models), Visual only when enabled, and Summary are included in this order; selected language is consistent; selected mode and variant are clearly followed throughout; analogy and example both use the selected theme and map accurately to Azure; the visual heading and theme-matched Mermaid diagram are present if enabled and completely absent if disabled; differences are accurate and omitted only when irrelevant; summary is concise and accurate. Do not mention this checklist. Never sacrifice factual accuracy to satisfy a style preference.",
  ];
}
