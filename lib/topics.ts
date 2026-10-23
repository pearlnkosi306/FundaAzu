export interface StudyChapter {
  id: string;
  title: string;
  examWeight: string;
  description: string;
  questions: string[];
}

export const AZ900_CHAPTERS: StudyChapter[] = [
  {
    id: "cloud-concepts",
    title: "1. Describe cloud concepts",
    examWeight: "25–30%",
    description: "Cloud computing, service types, and shared responsibility.",
    questions: [
      "What is cloud computing, and what are its benefits?",
      "Compare public, private, and hybrid cloud deployments.",
      "Explain IaaS, PaaS, and SaaS with Azure examples.",
      "How does the shared responsibility model change across cloud service types?",
      "What is the difference between scalability and elasticity?",
    ],
  },
  {
    id: "architecture-services",
    title: "2. Describe Azure architecture and services",
    examWeight: "35–40%",
    description: "Azure regions, resources, compute, networking, and storage.",
    questions: [
      "How do Azure regions, region pairs, and availability zones differ?",
      "Explain the hierarchy of management groups, subscriptions, and resource groups.",
      "When would you choose an Azure virtual machine, container, or App Service?",
      "Compare Azure Blob Storage, Files, Queues, and Tables.",
      "What do virtual networks, VPN Gateway, and ExpressRoute do?",
      "How do Azure identity, authentication, and authorization fit together?",
    ],
  },
  {
    id: "management-governance",
    title: "3. Describe Azure management and governance",
    examWeight: "30–35%",
    description: "Cost management, governance, deployment, and monitoring tools.",
    questions: [
      "How can you estimate and manage Azure costs?",
      "Compare Azure Policy, resource locks, and tags.",
      "What is the Microsoft Cloud Adoption Framework used for?",
      "Compare the Azure portal, Cloud Shell, CLI, and PowerShell.",
      "What do Azure Monitor, Service Health, and Advisor each help you do?",
      "Where can you check Azure service lifecycle and support information?",
    ],
  },
];
