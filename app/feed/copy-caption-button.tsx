
"use client";

import { useState } from "react";
import styles from "./feed.module.css";

type CopyStatus = "idle" | "copied" | "error";

export default function CopyCaptionButton({
  text,
}: {
  text: string;
}) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function copyCaption() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard not supported");
      }

      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <span className={styles.copyControl}>
      <button
        type="button"
        className={styles.copyButton}
        onClick={copyCaption}
        aria-label="Copy caption to clipboard"
      >
        {status === "copied"
          ? "✓ Copied!"
          : "⧉ Copy caption"}
      </button>

      <span
        role="status"
        className={
          status === "error"
            ? styles.copyError
            : styles.srOnly
        }
      >
        {status === "copied"
          ? "Caption copied to clipboard."
          : status === "error"
            ? "Copy failed. Please select the caption to copy it."
            : ""}
      </span>
    </span>
  );
}
