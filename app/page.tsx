import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./dashboard/sign-out-button";
import "./pink-home.css";

export default async function Home() {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  let profile: {
    first_name: string | null;
    last_name: string | null;
  } | null = null;

  if (userId) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .maybeSingle();

    profile = data;
  }

  const hasCompleteProfile =
    Boolean(profile?.first_name?.trim()) &&
    Boolean(profile?.last_name?.trim());

  const displayName = hasCompleteProfile
    ? `${profile!.first_name} ${profile!.last_name}`
    : "Complete your profile";

  const accountInitials = hasCompleteProfile
    ? `${profile!.first_name![0]}${profile!.last_name![0]}`.toUpperCase()
    : "U";

  return (
    <main className="app-shell cute-home">
      <div className="page-card">
        <nav className="top-nav home-nav" aria-label="Primary navigation">
          <Link href="/" className="home-brand">
            <span className="cute-brand-icon" aria-hidden="true">♥</span>
            <span>Caption Battle</span>
          </Link>

          <div className="home-nav-links">
            <Link href="/feed">Feed</Link>
            <Link href="/generate">Generate</Link>
            <Link href="/profile">Profile</Link>
          </div>
        </nav>

        <header className="hero cute-hero">
          <div className="cute-hero-copy">
            <span className="cute-kicker">
              <span aria-hidden="true">✿</span>
              THE HUMOR PROJECT · COLUMBIA & NYC
            </span>

            <h1>
              Columbia life,
              <br />
              but make it <em>funny.</em>
            </h1>

            <p>
              Turn everyday campus chaos into AI-generated comedy.
              Create captions, find your favorites, and vote for the
              funniest moments.
            </p>

            <div className="action-row cute-hero-actions">
              <Link className="button-link" href="/generate">
                Generate a Caption <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button-link button-secondary" href="/feed">
                Explore the Feed
              </Link>
            </div>

            <div className="cute-hero-tags" aria-label="What you can do here">
              <span>✦ AI-powered jokes</span>
              <span>♡ Community favorites</span>
            </div>
          </div>

          <div className="cute-hero-art" aria-hidden="true">
            <span className="cute-sparkle cute-sparkle-one">✧</span>
            <span className="cute-sparkle cute-sparkle-two">✦</span>
            <span className="cute-float-heart">♥</span>
            <div className="cute-note-card">
              <div className="cute-note-pin">♥</div>
              <span className="cute-note-label">DEAR CAMPUS DIARY ♡</span>
              <div className="cute-note-face">☺</div>
              <strong>stay silly,<br />study hard<span>!</span></strong>
              <span className="cute-note-footer">xoxo, caption battle</span>
            </div>
            <div className="cute-note-sticker">100% campus chaos ✿</div>
          </div>
        </header>

        <section className="section cute-section">
          <div className="section-heading">
            <div>
              <span className="cute-section-eyebrow">A LITTLE FUN GOES A LONG WAY</span>
              <h2>Get Started <span aria-hidden="true">♡</span></h2>
            </div>
            <span className="section-note">Create. Share. Vote.</span>
          </div>

          <div className="feature-grid">
            <article className="feature-card cute-feature-create">
              <div className="cute-feature-symbol" aria-hidden="true">✦</div>
              <span className="eyebrow">01 · CREATE</span>
              <h3>Make something funny.</h3>
              <p>
                Had a ridiculous Columbia or NYC moment? Let AI turn it
                into a caption worth sharing.
              </p>
              <Link className="button-link" href="/generate">
                Generate Caption →
              </Link>
            </article>

            <article className="feature-card cute-feature-discover">
              <div className="cute-feature-symbol" aria-hidden="true">♡</div>
              <span className="eyebrow">02 · DISCOVER</span>
              <h3>Let the crowd decide.</h3>
              <p>
                Browse community-generated humor, discover your
                favorites, and vote on what makes you laugh.
              </p>
              <Link className="button-link button-secondary" href="/feed">
                Explore Feed →
              </Link>
            </article>
          </div>
        </section>

        <section className="section cute-section cute-account-section">
          <div className="section-heading">
            <div>
              <span className="cute-section-eyebrow">YOUR SPACE</span>
              <h2>Account <span aria-hidden="true">✿</span></h2>
            </div>
          </div>

          {!userId ? (
            <div className="account-card">
              <div className="account-summary">
                <div className="avatar-initials">?</div>
                <div>
                  <span className="eyebrow">Guest</span>
                  <h3>Sign in to join the fun</h3>
                  <p>Generate captions, vote, and manage your profile.</p>
                </div>
              </div>
              <div className="action-row">
                <Link className="button-link" href="/login">
                  Sign in with Google
                </Link>
              </div>
            </div>
          ) : (
            <div className="account-card">
              <div className="account-summary">
                <div className="avatar-initials">{accountInitials}</div>
                <div>
                  <span className="eyebrow">Signed in ♡</span>
                  <h3>{displayName}</h3>
                  <p>
                    {hasCompleteProfile
                      ? "Your profile is ready. Let's make something fun!"
                      : "Add your name to complete your profile."}
                  </p>
                </div>
              </div>
              <div className="action-row">
                <Link className="button-link" href="/profile">
                  Edit profile
                </Link>
                <Link className="button-link button-secondary" href="/dashboard">
                  Private dashboard
                </Link>
                <SignOutButton />
              </div>
            </div>
          )}
        </section>

        <footer className="cute-home-footer">
          Made for campus chaos <span aria-hidden="true">♥</span>
        </footer>
      </div>
    </main>
  );
}
