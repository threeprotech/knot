import { toDriveEmbed } from "@/lib/drive";

export function DriveEmbed({ url }: { url: string }) {
  const embed = toDriveEmbed(url);

  if (embed.kind === "unknown") {
    return (
      <a
        href={embed.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-coral hover:text-coral"
      >
        Open in Google Drive
      </a>
    );
  }

  const aspect = embed.kind === "folder" ? "aspect-[4/3]" : "aspect-video";

  return (
    <div className={`overflow-hidden rounded-xl border border-line/80 bg-white shadow-sm ${aspect}`}>
      <iframe
        src={embed.src}
        title="Google Drive"
        className="h-full w-full border-0"
        allow="autoplay"
        allowFullScreen
      />
    </div>
  );
}
