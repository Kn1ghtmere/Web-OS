const PREFIX = 'webos-';

export interface ExportFile {
    app: 'webos';
    version: 1;
    exportedAt: string;
    data: Record<string, unknown>;
}

export function collectData(): ExportFile {
    const data: Record<string, unknown> = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(PREFIX)) continue;

        const raw = localStorage.getItem(key);
        if (raw === null) continue;

        try{
            data[key] = JSON.parse(raw);
        } catch {
            data[key] = raw;
        }
    }

    return {app : 'webos' , version: 1, exportedAt: new Date().toISOString(), data};

}

export function downloadExport(): number {
    const file = collectData();
    const blob = new Blob([JSON.stringify(file,null,2)], { type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `webos-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();

    URL.revokeObjectURL(url);
    return Object.keys(file.data).length;
}


export async function importData(file: File): Promise<number> {
    let parsed: unknown;
    try {
        parsed = JSON.parse(await file.text());
    } catch {
        throw new Error('That file is not valid JSON.');
    }

    const f = parsed as Partial<ExportFile> | null;
    const data = f?.data;

    if (!f || f.app !== 'webos' || !data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('That file is not a webOS backup.');
    }
    if (f.version !== 1) {
        throw new Error('This backup was made by a different version');
    }

  const entries = Object.entries(data).filter(([key]) => key.startsWith(PREFIX));

    const existing: string[] = [];
    for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PREFIX)) existing.push(key);
    }
    existing.forEach((key) => localStorage.removeItem(key));

    entries.forEach(([Key, value]) => {
        localStorage.setItem(Key, typeof value === 'string' ? value : JSON.stringify(value));
    });

    return entries.length;
}