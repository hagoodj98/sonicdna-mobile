import { z } from "zod";
import type { AudioUploadFileType } from "../types";

export const MAX_AUDIO_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

const allowedAudioTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
];
const allowedImportedAudioMimeTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
] as const;

export const MAX_IMPORTED_AUDIO_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_IMPORTED_AUDIO_DURATION_SECONDS = 90; // 90 seconds
export const validateImportedAudioFileSchema = z.object({
  originalname: z
    .string()
    .min(1, { message: "Imported audio file name is required." }),
  mimetype: z.enum(allowedImportedAudioMimeTypes, {
    message: "Unsupported file type. Please upload MP3, WAV, or M4A audio.",
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_IMPORTED_AUDIO_FILE_SIZE_BYTES, {
      message: `Imported file exceeds ${Math.floor(MAX_IMPORTED_AUDIO_FILE_SIZE_BYTES / (1024 * 1024))}MB limit.`,
    }),
});
const isAudioUploadFile = (value: unknown): value is AudioUploadFileType => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AudioUploadFileType>;
  return (
    typeof candidate.uri === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.type === "string"
  );
};

export const validateAudioName = z.object({
  name: z
    .string()
    .trim() // Remove leading/trailing whitespace early
    .min(3, { message: "Name is required" })
    .max(20, { message: "Name must be 20 characters or fewer" })
    .regex(/^[A-Za-z\s'-]+$/, {
      message:
        "Name may only contain letters, spaces, apostrophes, and hyphens.",
    }),
});

export const validateAudioFile = z.object({
  file: z
    .instanceof(FormData, {
      message: "A valid audio file is required.",
    })
    .refine((file) => {
      const audioFile = file.get("audio");
      if (!isAudioUploadFile(audioFile)) {
        return false;
      }

      return allowedAudioTypes.includes(audioFile.type);
    }, "Unsupported file type. Please upload an MP3, WAV, or M4A file.")
    .refine((file) => {
      const audioFile = file.get("audio");
      if (!isAudioUploadFile(audioFile)) {
        return false;
      }

      const fileSize = (audioFile as Partial<Blob>).size;
      if (typeof fileSize !== "number") {
        return true;
      }

      return fileSize <= MAX_AUDIO_FILE_SIZE_BYTES;
    }, "File size exceeds the maximum limit of 1MB."),
});
