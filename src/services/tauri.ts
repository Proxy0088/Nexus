import { invoke } from "@tauri-apps/api/core";

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  environment: string;
}

export interface SystemInfo {
  os: string;
  arch: string;
}

/**
 * Checks whether the application is running inside a Tauri window runtime.
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Fetches application information from Rust backend.
 */
export async function getAppInfo(): Promise<AppInfo> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<AppInfo>("get_app_info");
    } catch (err) {
      console.warn("Tauri invoke failed, using mock data:", err);
    }
  }

  return {
    name: "Nexus",
    version: "0.1.0",
    platform: "windows",
    environment: "browser-dev",
  };
}

/**
 * Fetches system information from Rust backend.
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<SystemInfo>("get_system_info");
    } catch (err) {
      console.warn("Tauri invoke failed, using mock data:", err);
    }
  }

  return {
    os: "windows",
    arch: "x86_64",
  };
}

/**
 * Pings the Rust backend.
 */
export async function pingBackend(message: string): Promise<string> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<string>("ping", { message });
    } catch (err) {
      console.warn("Tauri ping failed, using fallback:", err);
    }
  }

  return `web-pong: ${message}`;
}
