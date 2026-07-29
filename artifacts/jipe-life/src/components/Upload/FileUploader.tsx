import { useRef, useState } from "react";
import { uploadFile } from "@/services/upload";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  label: string;
  folder: string;
  value: string;
  accept?: string;
  disabled?: boolean;
  onUploaded: (url: string) => void;
}

export default function FileUploader({
  label,
  folder,
  value,
  disabled = false,
  accept = "image/*,.pdf",
  onUploaded,
}: Props) {
  const { toast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const result = await uploadFile(file, folder);

      onUploaded(result.url);

      toast({
        title: "Upload Successful",
        description: "File uploaded successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">

      <label className="text-sm font-medium">
        {label}
      </label>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        disabled={disabled}
        onChange={handleFile}
      />

      {value ? (
        <div className="rounded-lg border p-3 bg-muted flex items-center justify-between">

          <div className="flex items-center gap-3">

            <ImageIcon className="w-5 h-5 text-green-600" />

            <span className="text-sm truncate">
              Uploaded Successfully
            </span>

          </div>

          {!disabled && (
            <Button
              size="icon"
              variant="destructive"
              onClick={() => onUploaded("")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={uploading || disabled}
          onClick={() => inputRef.current?.click()}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </>
          )}
        </Button>
      )}

    </div>
  );
}