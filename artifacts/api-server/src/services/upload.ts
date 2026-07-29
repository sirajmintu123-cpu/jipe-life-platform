import { getToken } from "@/lib/api";

const BASE = import.meta.env.BASE_URL;

export interface UploadResponse {
  success: boolean;
  filename: string;
  url: string;
}

export async function uploadFile(
  file: File,
  folder: string
): Promise<UploadResponse> {
  const token = getToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BASE}api/upload?folder=${folder}`,
    {
      method: "POST",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data;
}