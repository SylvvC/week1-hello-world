import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { voteOnGeneration } from "./actions";
import styles from "./feed.module.css";

function FeedNavigation() {
  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <Link href="/" className={styles.brand}>
        <span className={styles.brandIcon} aria-hidden="true">♥</span>
        <span>Caption Battle</span>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/">Home</Link>
        <Link href="/feed" className={styles.active} aria-current="page">
          Feed
        </Link>
        <Link href="/generate">Generate</Link>
        <Link href="/profile">Profile</Link>
      </div>
    </nav>
  );
}

export default async function FeedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className={styles.page}>
        <FeedNavigation />
        <section className={styles.guestCard}>
          <span className={styles.kicker}>♡ DEAR CAMPUS DIARY · COMMUNITY</span>
          <span className={styles.guestHeart} aria-hidden="true">♥</span>
          <h1>Good jokes are better <em>together.</em></h1>
          <p>Sign in with Google to see the latest AI captions and vote for your favorites.</p>
          <Link className={styles.primaryButton} href="/login">
            Sign in with Google →
          </Link>
        </section>
        <p className={styles.footer}>Made for campus chaos ♥</p>
      </main>
    );
  }

  const { data: generations, error: generationsError } = await supabase
    .from("generations")
    .select("id, prompt, content, created_at")
    .order("created_at", { ascending: false });

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("generation_id, user_id, value");

  return (
    <main className={styles.page}>
      <FeedNavigation />

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>✿ DEAR CAMPUS DIARY · COMMUNITY</span>
          <h1>
            Campus chaos,
            <br />
            but make it <em>iconic.</em>
          </h1>
          <p>
            The best Columbia and NYC moments, turned into AI-generated jokes.
            Give your favorites a little love ♡
          </p>
          <Link className={styles.primaryButton} href="/generate">
            ✦ Generate a Caption →
          </Link>
        </div>

        <div className={styles.heroArt} aria-hidden="true">
          <span className={styles.sparkleOne}>✧</span>
          <span className={styles.sparkleTwo}>✦</span>
          <div className={styles.noteCard}>
            <span className={styles.notePin}>♥</span>
            <span className={styles.noteLabel}>CAMPUS LOVE NOTES</span>
            <span className={styles.noteSmile}>☺</span>
            <strong>laugh a little,<br />vote a lot!</strong>
            <small>xoxo, the community</small>
          </div>
        </div>
      </header>

      <section className={styles.feedSection} aria-labelledby="feed-heading">
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionKicker}>FUNNY LITTLE MOMENTS</span>
            <h2 id="feed-heading">The giggle gallery <span aria-hidden="true">♡</span></h2>
          </div>
          {!generationsError && (
            <span className={styles.captionCount}>
              {generations?.length ?? 0} {generations?.length === 1 ? "caption" : "captions"} ✿
            </span>
          )}
        </div>

        {generationsError && (
          <p className={styles.errorMessage} role="alert">
            Failed to load captions: {generationsError.message}
          </p>
        )}

        {votesError && (
          <p className={styles.errorMessage} role="alert">
            Failed to load votes: {votesError.message}
          </p>
        )}

        {!generationsError && !votesError && generations?.length === 0 && (
          <div className={styles.emptyCard}>
            <span aria-hidden="true">♡</span>
            <h3>It's a little quiet in here...</h3>
            <p>Be the first to bring some campus chaos to the feed.</p>
            <Link className={styles.primaryButton} href="/generate">
              Create the first caption →
            </Link>
          </div>
        )}

        {!generationsError && !votesError && generations?.map((item) => {
          const itemVotes = (votes ?? []).filter(
            (vote) => vote.generation_id === item.id
          );

          const upvotes = itemVotes.filter((vote) => vote.value === 1).length;
          const downvotes = itemVotes.filter((vote) => vote.value === -1).length;
          const myVote = itemVotes.find((vote) => vote.user_id === user.id)?.value;
          const score = upvotes - downvotes;

          return (
            <article className={styles.captionCard} key={item.id}>
              <div className={styles.cardTop}>
                <span className={styles.aiLabel}>✦ AI-GENERATED LOVE NOTE</span>
                <span className={styles.cardHeart} aria-hidden="true">♡</span>
              </div>

              <p className={styles.promptLabel}>THE CAMPUS MOMENT ✿</p>
              <p className={styles.promptText}>{item.prompt}</p>

              <p className={styles.captionText}>{item.content}</p>

              <div className={styles.voteBar}>
                <div className={styles.voteActions} aria-label="Rate this caption">
                  <form action={voteOnGeneration}>
                    <input type="hidden" name="generation_id" value={item.id} />
                    <input type="hidden" name="value" value="1" />
                    <button
                      type="submit"
                      aria-label={`Upvote: ${item.prompt}`}
                      aria-pressed={myVote === 1}
                      className={`${styles.voteButton} ${myVote === 1 ? styles.selectedUpvote : ""}`}
                    >
                      <span aria-hidden="true">👍</span>
                      <span>Upvote</span>
                      <strong>{upvotes}</strong>
                    </button>
                  </form>

                  <form action={voteOnGeneration}>
                    <input type="hidden" name="generation_id" value={item.id} />
                    <input type="hidden" name="value" value="-1" />
                    <button
                      type="submit"
                      aria-label={`Downvote: ${item.prompt}`}
                      aria-pressed={myVote === -1}
                      className={`${styles.voteButton} ${myVote === -1 ? styles.selectedDownvote : ""}`}
                    >
                      <span aria-hidden="true">👎</span>
                      <span>Downvote</span>
                      <strong>{downvotes}</strong>
                    </button>
                  </form>
                </div>
                <span className={styles.score} aria-label={`Score: ${score}`}>
                  ♥ Score: <strong>{score}</strong>
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <p className={styles.footer}>Made for campus chaos ♥</p>
    </main>
  );
}
