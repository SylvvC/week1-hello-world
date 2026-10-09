"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./generate.module.css";

type GeneratedCaption = {
  content: string;
};

type GenerateResponse = {
  generation?: GeneratedCaption;
  error?: string;
};

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  async function handleGenerate() {
    if (loading || !prompt.trim()) return;

    setLoading(true);
    setError("");
    setCaption("");
    setLoginRequired(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data: GenerateResponse = await response.json();

      if (!response.ok) {
        setLoginRequired(response.status === 401);
        setError(data.error || "Couldn't generate a caption. Please try again.");
        return;
      }

      const generatedText = data.generation?.content;
      if (!generatedText) {
        setError("The response did not contain a caption.");
        return;
      }

      setCaption(generatedText);
      setPrompt("");
    } catch {
      setError("Couldn't connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">♥</span>
          <span>Caption Battle</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/feed">Feed</Link>
          <Link href="/generate" className={styles.active} aria-current="page">Generate</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>✿ DEAR CAMPUS DIARY · CREATE</span>
          <h1>
            Make a little <span>magic.</span>
          </h1>
          <p>
            Give us a chaotic Columbia or NYC moment.
            We’ll turn it into a funny AI caption worth sharing.
          </p>
          <span className={styles.heroNote}>♡ small moments, big laughs</span>
        </div>
        <div className={styles.sticker} aria-hidden="true">
          <span className={styles.stickerSparkle}>✧</span>
          <span className={styles.stickerHeart}>♥</span>
          <span className={styles.stickerTitle}>CAMPUS CONFESSIONS</span>
          <span className={styles.stickerDoodle}>☺</span>
          <strong>spill the tea!</strong>
          <span className={styles.stickerBottom}>xoxo, caption battle</span>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.smallHeading}>YOUR TURN TO SHINE</p>
            <h2>What happened? <span aria-hidden="true">♡</span></h2>
          </div>
          <span className={styles.sectionAside}>write it. generate it. share it.</span>
        </div>

        <div className={styles.formCard}>
          <label className={styles.label} htmlFor="caption-prompt">Your campus moment ✿</label>
          <textarea
            id="caption-prompt"
            className={styles.textarea}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="e.g. Trying to find a seat in Butler during midterms..."
            rows={5}
            maxLength={500}
            disabled={loading}
          />
          <div className={styles.inputFooter}>
            <span>✧ Make it specific, funny, or wonderfully chaotic.</span>
            <span>{prompt.length}/500</span>
          </div>
          <button
            type="button"
            className={styles.generateButton}
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Making magic..." : "✦ Generate Caption →"}
          </button>
          <div aria-live="polite" role="status">
            {loading && <p className={styles.loading}>A little AI sparkle is on its way... ♡</p>}
            {error && (
              <p className={styles.error}>
                {error}{" "}
                {loginRequired && <Link href="/login">Sign in with Google →</Link>}
              </p>
            )}
          </div>
        </div>

        {caption && (
          <div className={styles.resultCard} aria-live="polite">
            <span className={styles.resultEyebrow}>♥ FRESHLY GENERATED</span>
            <h2>Your AI Caption</h2>
            <p className={styles.captionText}>{caption}</p>
            <div className={styles.resultFooter}>
              <span>✿ Saved to the community feed</span>
              <Link href="/feed" className={styles.feedButton}>See it in the Feed →</Link>
            </div>
          </div>
        )}
      </section>
      <p className={styles.footer}>Made for campus chaos ♥</p>
    </main>
  );
}
