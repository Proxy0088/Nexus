export interface NexusModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  status: "active" | "planned" | "disabled";
}

export const MODULE_REGISTRY: NexusModule[] = [
  {
    id: "home",
    name: "Home",
    description: "Nexus central hub and active dashboard overview",
    icon: "home",
    route: "/",
    status: "active",
  },
  {
    id: "apps",
    name: "Application Launcher",
    description: "Unified application and service launcher",
    icon: "inbox",
    route: "/apps",
    status: "planned",
  },
  {
    id: "proxy",
    name: "Proxy Manager",
    description: "System and process proxy management",
    icon: "globe",
    route: "/proxy",
    status: "planned",
  },
  {
    id: "network",
    name: "Network Diagnostics",
    description: "Latency, route tracing, and network analysis",
    icon: "network",
    route: "/network",
    status: "planned",
  },
  {
    id: "project",
    name: "Project Continuity",
    description: "Workspace sessions and development project tracking",
    icon: "task",
    route: "/project",
    status: "planned",
  },
  {
    id: "tools",
    name: "Developer Tools",
    description: "Integrated developer utilities, formatters, and helpers",
    icon: "tool",
    route: "/tools",
    status: "planned",
  },
];
