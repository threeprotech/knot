const DRIVE_ID = "[a-zA-Z0-9_-]+";

export type DriveEmbed =
  | { kind: "folder" | "file"; src: string }
  | { kind: "unknown"; href: string };

/**
 * Convert typical Google Drive share links into embeddable preview URLs.
 * Returns null when the URL is empty; unknown Drive-like links should use
 * {@link toDriveEmbed} so the UI can fall back to an external link.
 */
export function parseDriveId(url: string): { type: "folder" | "file"; id: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  if (!host.endsWith("google.com") && !host.endsWith("googleusercontent.com")) {
    return null;
  }

  const path = parsed.pathname;
  const folderMatch = path.match(new RegExp(`/folders/(${DRIVE_ID})`));
  if (folderMatch) return { type: "folder", id: folderMatch[1] };

  const fileMatch = path.match(new RegExp(`/file/d/(${DRIVE_ID})`));
  if (fileMatch) return { type: "file", id: fileMatch[1] };

  const id = parsed.searchParams.get("id");
  if (id && new RegExp(`^${DRIVE_ID}$`).test(id)) {
    if (path.includes("embeddedfolderview") || parsed.hash.includes("grid")) {
      return { type: "folder", id };
    }
    if (path.includes("file") || path.includes("/open") || path.includes("uc")) {
      return { type: "file", id };
    }
    // Bare ?id= on a drive host is most often a folder share from older links.
    if (path.includes("folderview") || path.includes("drive")) {
      return { type: "folder", id };
    }
    return { type: "file", id };
  }

  return null;
}

export function toDriveEmbedSrc(url: string): string | null {
  const parsed = parseDriveId(url);
  if (!parsed) return null;
  if (parsed.type === "folder") {
    return `https://drive.google.com/embeddedfolderview?id=${parsed.id}#grid`;
  }
  return `https://drive.google.com/file/d/${parsed.id}/preview`;
}

export function toDriveEmbed(url: string): DriveEmbed {
  const src = toDriveEmbedSrc(url);
  if (src) {
    const parsed = parseDriveId(url);
    return { kind: parsed?.type ?? "file", src };
  }
  return { kind: "unknown", href: url.trim() };
}
