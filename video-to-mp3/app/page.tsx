import VideoConverter from "@/components/VideoConverter";
import {
  AudioLines,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <main>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/" className="brand">
            <div className="brand-icon">
              <AudioLines size={21} />
            </div>

            <span>
              easy<span className="brand-highlight">mp3</span>
            </span>
          </a>

          <div className="nav-right">
            <span className="free-badge">100% FREE</span>

            <a
              href="#developer"
              className="developer-link"
            >
              Developer
            </a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-glow" />

        <div className="badge">
          <Sparkles size={14} />
          Simple video to audio conversion
        </div>

        <h1>
          Your video.
          <br />
          <span>Your MP3.</span>
        </h1>

        <p className="hero-description">
          Convert videos into high-quality MP3 audio
          without uploading your files anywhere.
        </p>

        <VideoConverter />

        <div className="trust-row">
          <span>
            <ShieldCheck size={15} />
            Local processing
          </span>

          <span>
            <LockKeyhole size={15} />
            No uploads
          </span>

          <span>
            <Zap size={15} />
            No registration
          </span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span>WHY EASYMP3</span>

          <h2>
            Video to audio.
            <br />
            Nothing complicated.
          </h2>
        </div>

        <div className="features">
          <article className="feature">
            <span className="feature-number">01</span>

            <Zap />

            <h3>Fast conversion</h3>

            <p>
              FFmpeg runs directly inside your browser
              to extract and encode your audio.
            </p>
          </article>

          <article className="feature">
            <span className="feature-number">02</span>

            <ShieldCheck />

            <h3>Private by design</h3>

            <p>
              Your videos stay on your device instead
              of being uploaded to our servers.
            </p>
          </article>

          <article className="feature">
            <span className="feature-number">03</span>

            <AudioLines />

            <h3>High-quality MP3</h3>

            <p>
              Choose between 128, 192, 256 and
              320 kbps MP3 output.
            </p>
          </article>
        </div>
      </section>

      <section id="developer" className="developer-section">
        <div className="developer-card">
          <div>
            <span className="developer-label">
              DEVELOPED BY
            </span>

            <h2>Keshan Panditharathna</h2>

            <p>
              Software Engineer • Web Developer •
              UI/UX Designer
            </p>
          </div>

          <div className="developer-brand">
            <div className="developer-logo">K</div>

            <div>
              <strong>Keshan</strong>
              <span>Developer</span>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <AudioLines size={18} />

            <strong>
              easy<span>mp3</span>
            </strong>
          </div>

          <p>
            © 2026 EasyMP3. Built by Keshan
            Panditharathna.
          </p>
        </div>
      </footer>
    </main>
  );
}