import { registerPlugin, Capacitor } from '@capacitor/core';
import type { GitHubRelease } from '../types';

export const CURRENT_APP_VERSION = '1.0.0';

export interface DownloadProgressInfo {
  progress: number; // 0 to 100
  receivedBytes: number;
  totalBytes: number;
}

export interface AppUpdatePlugin {
  downloadAndInstall(options: { url: string; fileName?: string }): Promise<{ success: boolean; message?: string }>;
  getAppVersion(): Promise<{ versionName: string; versionCode: number }>;
  canRequestPackageInstalls(): Promise<{ granted: boolean }>;
  openInstallPermissionSettings(): Promise<void>;
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (info: DownloadProgressInfo) => void
  ): Promise<any>;
}

export const NativeAppUpdate = registerPlugin<AppUpdatePlugin>('AppUpdate');

/**
 * Compare two semver-like strings (e.g. "v1.1.0" > "1.0.0")
 */
export function isNewerVersion(remote: string, current: string): boolean {
  const clean = (v: string) => v.replace(/^v/i, '').trim().split('-')[0];
  const rParts = clean(remote).split('.').map(n => parseInt(n, 10) || 0);
  const cParts = clean(current).split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < len; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

/**
 * Check GitHub releases API for latest published release
 */
export async function fetchLatestRelease(repo: string): Promise<GitHubRelease | null> {
  const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
  const url = `https://api.github.com/repos/${cleanRepo}/releases/latest`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      // No releases yet in the repository
      return null;
    }
    throw new Error(`Error ${response.status} al consultar GitHub`);
  }

  const data = await response.json();
  const tagName = data.tag_name || '';

  // Look for .apk asset in the release
  let apkDownloadUrl: string | undefined;
  let apkSize: number | undefined;

  if (Array.isArray(data.assets)) {
    const apkAsset = data.assets.find((asset: any) =>
      typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk')
    );
    if (apkAsset) {
      apkDownloadUrl = apkAsset.browser_download_url;
      apkSize = apkAsset.size;
    }
  }

  return {
    tagName,
    name: data.name || tagName,
    body: data.body || '',
    publishedAt: data.published_at || '',
    apkDownloadUrl,
    apkSize,
    htmlUrl: data.html_url || `https://github.com/${cleanRepo}/releases`,
  };
}

/**
 * Download APK and launch package installer
 */
export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    let removeListener: any = null;
    try {
      if (onProgress) {
        removeListener = await NativeAppUpdate.addListener('downloadProgress', (info) => {
          onProgress(info.progress);
        });
      }

      await NativeAppUpdate.downloadAndInstall({
        url: apkUrl,
        fileName: 'update.apk',
      });
    } finally {
      if (removeListener && typeof removeListener.remove === 'function') {
        removeListener.remove();
      }
    }
  } else {
    // Web fallback: open direct download link
    const link = document.createElement('a');
    link.href = apkUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
