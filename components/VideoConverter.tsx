"use client";

import { useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import {
  Check,
  Download,
  FileVideo,
  Loader2,
  Music,
  Upload,
  X,
} from "lucide-react";

const MAX_FILE_SIZE = 500 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}

export default function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("320");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  // IMPORTANT:
  // Do not create FFmpeg here.
  // It must only be created inside the browser.
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    setError("");

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Maximum supported file size is 500 MB.");
      return;
    }

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(selectedFile);
    setDownloadUrl("");
    setProgress(0);
    setStatus("");
  };

  const removeFile = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(null);
    setDownloadUrl("");
    setProgress(0);
    setStatus("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const loadFFmpeg = async (): Promise<FFmpeg> => {
    // If already created + loaded, reuse it.
    if (ffmpegRef.current && loadedRef.current) {
      return ffmpegRef.current;
    }

    // Safety check.
    if (typeof window === "undefined") {
      throw new Error(
        "FFmpeg can only run inside the browser."
      );
    }

    setStatus("Loading converter...");

    // Create FFmpeg ONLY here.
    const ffmpeg = new FFmpeg();

    const baseURL =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        "text/javascript"
      ),

      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    ffmpegRef.current = ffmpeg;
    loadedRef.current = true;

    return ffmpeg;
  };

  const convertVideo = async () => {
    if (!file || converting) return;

    setError("");
    setDownloadUrl("");
    setProgress(0);
    setConverting(true);

    try {
      setStatus("Starting converter...");

      // This returns the actual initialized FFmpeg instance.
      const ffmpeg = await loadFFmpeg();

      setStatus("Preparing video...");

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "mp4";

      const inputName = `input.${extension}`;
      const outputName = "output.mp3";

      // Progress listener
      ffmpeg.on("progress", ({ progress }) => {
        const value = Math.min(
          100,
          Math.max(0, Math.round(progress * 100))
        );

        setProgress(value);

        if (value < 100) {
          setStatus("Converting to MP3...");
        }
      });

      // Write selected video into FFmpeg virtual filesystem.
      await ffmpeg.writeFile(
        inputName,
        await fetchFile(file)
      );

      setStatus("Extracting audio...");

      // Extract audio and encode to MP3.
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vn",
        "-codec:a",
        "libmp3lame",
        "-b:a",
        `${quality}k`,
        outputName,
      ]);

      setStatus("Creating MP3 file...");

      const outputData =
        await ffmpeg.readFile(outputName);

      const blob = new Blob(
        [outputData as BlobPart],
        {
          type: "audio/mpeg",
        }
      );

      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setProgress(100);
      setStatus("Conversion complete!");

      // Clean temporary FFmpeg files.
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch (cleanupError) {
        console.warn(
          "Temporary FFmpeg cleanup skipped:",
          cleanupError
        );
      }
    } catch (conversionError) {
      console.error(
        "FFmpeg conversion error:",
        conversionError
      );

      setError(
        conversionError instanceof Error
          ? `Conversion failed: ${conversionError.message}`
          : "Conversion failed. Please try another video."
      );

      setProgress(0);
      setStatus("");
    } finally {
      setConverting(false);
    }
  };

  const downloadMP3 = () => {
    if (!downloadUrl || !file) return;

    const filename =
      file.name.replace(/\.[^/.]+$/, "") ||
      "converted-audio";

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `${filename}.mp3`;

    document.body.appendChild(link);

    link.click();

    link.remove();
  };

  return (
    <div className="converter">
      {!file ? (
        <div
          className="drop-zone"
          onClick={() =>
            inputRef.current?.click()
          }
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();

            selectFile(
              event.dataTransfer.files?.[0]
            );
          }}
        >
          <input
            ref={inputRef}
            hidden
            type="file"
            accept="video/*,.mkv,.avi,.mov,.flv,.wmv,.webm,.m4v,.mpeg,.mpg,.3gp"
            onChange={(event) =>
              selectFile(
                event.target.files?.[0]
              )
            }
          />

          <div className="upload-icon">
            <Upload size={30} />
          </div>

          <h2>Drop your video here</h2>

          <p>
            or select a video from your device
          </p>

          <button
            className="choose-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              inputRef.current?.click();
            }}
          >
            <FileVideo size={18} />

            Choose Video
          </button>

          <small>
            MP4 • MOV • MKV • AVI • WEBM • MPEG •
            M4V • 3GP
          </small>

          <small>
            Maximum recommended size: 500 MB
          </small>
        </div>
      ) : (
        <>
          <div className="file-card">
            <div className="file-icon">
              <FileVideo size={25} />
            </div>

            <div className="file-info">
              <strong>{file.name}</strong>

              <span>
                {formatBytes(file.size)}
              </span>
            </div>

            {!converting && (
              <button
                type="button"
                className="remove-button"
                onClick={removeFile}
                aria-label="Remove video"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {!downloadUrl && (
            <>
              <div className="quality-section">
                <div className="quality-header">
                  <div>
                    <Music size={18} />

                    <strong>
                      MP3 Quality
                    </strong>
                  </div>

                  <span>
                    {quality} kbps
                  </span>
                </div>

                <div className="quality-buttons">
                  {[
                    "128",
                    "192",
                    "256",
                    "320",
                  ].map((bitrate) => (
                    <button
                      type="button"
                      key={bitrate}
                      disabled={converting}
                      className={
                        quality === bitrate
                          ? "quality-active"
                          : ""
                      }
                      onClick={() =>
                        setQuality(bitrate)
                      }
                    >
                      {bitrate}

                      <small>
                        {" "}
                        kbps
                      </small>
                    </button>
                  ))}
                </div>

                <div className="quality-label">
                  <span>
                    Smaller file
                  </span>

                  <span>
                    Best quality
                  </span>
                </div>
              </div>

              {converting && (
                <div className="progress-area">
                  <div className="progress-text">
                    <span>
                      {status}
                    </span>

                    <span>
                      {progress}%
                    </span>
                  </div>

                  <div className="progress-background">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                className="convert-button"
                onClick={convertVideo}
                disabled={converting}
              >
                {converting ? (
                  <>
                    <Loader2
                      size={20}
                      className="spinner"
                    />

                    {status ||
                      "Converting..."}
                  </>
                ) : (
                  <>
                    <Music size={20} />

                    Convert to MP3
                  </>
                )}
              </button>
            </>
          )}

          {downloadUrl && (
            <div className="success">
              <div className="success-icon">
                <Check size={30} />
              </div>

              <h2>MP3 Ready!</h2>

              <p>
                {file.name.replace(
                  /\.[^/.]+$/,
                  ""
                )}
                .mp3
              </p>

              <span>
                {quality} kbps MP3
              </span>

              <button
                type="button"
                className="download-button"
                onClick={downloadMP3}
              >
                <Download size={20} />

                Download MP3
              </button>

              <button
                type="button"
                className="another-button"
                onClick={removeFile}
              >
                Convert another video
              </button>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}