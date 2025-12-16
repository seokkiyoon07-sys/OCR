export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data: T | null = null;
  try {
    data = (await resp.json()) as T;
  } catch {
    // ignore parse error to throw below
  }

  if (!resp.ok) {
    const message =
      (data as unknown as { detail?: string; message?: string })?.detail ||
      (data as unknown as { detail?: string; message?: string })?.message ||
      `HTTP ${resp.status}`;
    throw new Error(message);
  }

  if (!data) {
    throw new Error('Empty response from server');
  }

  return data;
}

export const reorderByAnchor = (
  template: string,
  uploadedPdfPath: string,
  outDir: string | null = null,
) =>
  postJSON('/api/anchor/reorder', {
    template,
    uploaded_pdf_path: uploadedPdfPath,
    out_dir: outDir,
  });

export const applyOnLayoutLoad = (
  template: string,
  uploadedPdfPath: string,
  replace = true,
) =>
  postJSON('/api/anchor/apply-on-layout-load', {
    template,
    uploaded_pdf_path: uploadedPdfPath,
    replace,
  });
