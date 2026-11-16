import { useState, useEffect } from "react";
import { getAppInfo, getSystemInfo, AppInfo, SystemInfo } from "@/services/tauri";

export function useAppInfo() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAppInfo().then((info) => {
      if (mounted) {
        setAppInfo(info);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { appInfo, loading };
}

export function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSystemInfo().then((info) => {
      if (mounted) {
        setSystemInfo(info);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { systemInfo, loading };
}
