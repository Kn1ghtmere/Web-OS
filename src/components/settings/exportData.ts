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