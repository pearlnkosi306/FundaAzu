export interface TopicGroup {
  group: string;
  emoji: string;
  prompts: string[];
}

export const TOPICS: TopicGroup[] = [
  { group: "Cloud concepts", emoji: "☁️", prompts: ["What is cloud computing?", "Explain public, private, and hybrid cloud", "What is the shared responsibility model?"] },
  { group: "Azure architecture", emoji: "🗺️", prompts: ["Explain Azure regions and availability zones", "What are resource groups?", "What is the Azure hierarchy?"] },
  { group: "Azure services", emoji: "🧰", prompts: ["Compare virtual machines and containers", "What is Azure Storage?", "Explain Azure networking basics"] },
  { group: "Security & governance", emoji: "🛡️", prompts: ["What is Microsoft Entra ID?", "Explain multi-factor authentication", "What are Azure policies and tags?"] },
  { group: "Pricing & support", emoji: "💳", prompts: ["How does Azure pricing work?", "What is the Azure pricing calculator?", "Explain the service lifecycle"] },
];
