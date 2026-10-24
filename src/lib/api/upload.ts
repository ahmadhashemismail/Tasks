export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file); // don't set Content-Type, the browser does it
  const res = await fetch("/server/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}