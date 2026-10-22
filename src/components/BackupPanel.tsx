"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { applyBackup, downloadBackup, readBackupFile } from "@/lib/backup";

interface BackupPanelProps {
  onImported: () => void;
}

export function BackupPanel({ onImported }: BackupPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    try {
      downloadBackup();
      setStatus("Backup téléchargé.");
    } catch {
      setStatus("Échec de l'export.");
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      const backup = await readBackupFile(file);
      const n = backup.sessions.length;
      const ok = confirm(
        `Importer ce backup ?\n\n${n} séance(s) — date export : ${new Date(
          backup.exportedAt
        ).toLocaleString("fr-FR")}\n\nCela remplacera tes données actuelles sur cet appareil.`
      );
      if (!ok) {
        setBusy(false);
        return;
      }
      applyBackup(backup);
      onImported();
      setStatus(`Import OK — ${n} séance(s).`);
    } catch {
      setStatus("Fichier invalide ou illisible.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Sauvegarde
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Exporte un fichier JSON sur ton iPhone (Fichiers), puis réimporte-le
        pour restaurer l&apos;historique.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-zinc-950 active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Exporter
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          Importer
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void handleImport(e.target.files?.[0])}
        />
      </div>

      {status && <p className="mt-3 text-xs text-zinc-400">{status}</p>}
    </section>
  );
}
