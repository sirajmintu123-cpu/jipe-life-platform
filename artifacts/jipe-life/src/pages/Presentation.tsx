import { Link } from "wouter";
import "./presentation.css";

export default function Presentation() {
return (
  <div className="presentation-page">
      <header>
        <div className="container navbar">
          <div className="logo">
            Jipe<span>Life</span>
          </div>
          <div className="nav-buttons">
            <Link href="/login" className="nav-btn nav-btn-login">
              Login
            </Link>
            <Link href="/register" className="nav-btn nav-btn-register">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="container hero-grid">
          <div>
            <h1>
              Build Your <span>Future</span> With Jipe Life
            </h1>
            <p>
              A professional digital business ecosystem designed for passive
              income, leadership growth, and financial independence.
            </p>
            <div className="hero-buttons">
              <Link href="/register" className="btn btn-primary">
                Join Now
              </Link>
              <a
                href="https://drive.google.com/file/d/1-1ywq-WHHrAiEABCR0gqXPOEiZyxzDru/view?usp=drivesdk"
                className="btn btn-outline"
                target="_blank"
                rel="noreferrer"
              >
                📄 Download PDF Plan
              </a>
            </div>
          </div>
          <div className="hero-card">
            <div className="stats-grid">
              <div className="stat-box">
                <h2 style={{ color: "#f59e0b" }}>30%</h2>
                <p>Global CTO Pool</p>
              </div>
              <div className="stat-box">
                <h2 style={{ color: "#10b981" }}>100%</h2>
                <p>Secure E-Pin</p>
              </div>
              <div className="stat-box">
                <h2 style={{ color: "#60a5fa" }}>1:1</h2>
                <p>Binary Matching</p>
              </div>
              <div className="stat-box">
                <h2 style={{ color: "#f472b6" }}>24/7</h2>
                <p>Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="what-is" id="what-is">
        <div className="container">
          <div className="what-is-card">
            <h2>
              What is <span>Jipe Life?</span>
            </h2>
            <p>
              <strong>Jipe Life</strong> is an official project and business
              initiative launched under <strong>Jipe Global Service Limited</strong>
              , a government-registered corporation in India. It operates as a
              modern network marketing (MLM) and financial-growth platform
              designed around a sustainable, highly calculated direct selling
              architecture.
            </p>
            <p>
              Guided by the corporate slogan{" "}
              <span className="slogan">"A Way to Success,"</span> the project is
              structured to offer long-term financial stability to independent
              leaders through a secure binary distribution engine.
            </p>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="container about-grid">
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
              alt="Business Team"
            />
          </div>
          <div className="about-content">
            <h3>Professional Digital Business Platform</h3>
            <p>
              Jipe Life is a premium business ecosystem designed to empower
              individuals with transparent earning systems, secure technology,
              and leadership opportunities.
            </p>
            <div className="feature">
              <div className="feature-icon">✔</div>
              <div>
                <h4>Transparent System</h4>
                <p>Secure E-Pin based registration system.</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🚀</div>
              <div>
                <h4>Fast Growth</h4>
                <p>Powerful matching and leadership rewards.</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">💎</div>
              <div>
                <h4>Luxury Rewards</h4>
                <p>Cars, bonuses, and global incentive programs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-vision" id="mission-vision">
        <div className="container">
          <div className="section-title">
            <h2>Mission & Vision</h2>
            <p>
              Guiding principles that drive our commitment to your financial
              independence and professional success.
            </p>
          </div>
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                Our mission is to empower every individual to achieve financial
                independence and professional success. We strive to provide a
                transparent, sustainable, and rewarding business platform where
                members can leverage their network to build a prosperous future.
              </p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>
                Our vision is to be a leading global network marketing company
                known for integrity, innovation, and unwavering support for our
                members. We aim to create a community where everyone has the
                opportunity to realize their dreams through dedication and
                collaborative effort.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="packages" id="packages">
        <div className="container">
          <div className="section-title">
            <h2>Business Packages</h2>
            <p>
              Choose the package that fits your business goals and begin your
              journey toward success.
            </p>
          </div>
          <div className="package-card">
            <div className="popular">Basic</div>
            <h3>Starter</h3>
            <div className="price">₹1,100</div>
            <ul>
              <li>0.5 PV Allocation</li>
              <li>Luxury Rewards</li>
              <li>4% CTO Pool</li>
              <li>Priority Support</li>
            </ul>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ display: "block", width: "100%" }}
            >
              Start Now
            </Link>
          </div>
          <br />
          <div className="packages-grid">
            <div className="package-card">
              <h3>Smart</h3>
              <div className="price">₹2,100</div>
              <ul>
                <li>1 PV Allocation</li>
                <li>6% Smart CTO Benefits</li>
                <li>Binary Matching Income</li>
                <li>Secure Activation</li>
              </ul>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ display: "block", width: "100%" }}
              >
                Get Started
              </Link>
            </div>
            <div className="package-card">
              <div className="popular">POPULAR</div>
              <h3>Silver</h3>
              <div className="price">₹5,200</div>
              <ul>
                <li>2 PV Allocation</li>
                <li>Leadership Rewards</li>
                <li>8% Higher CTO Pool</li>
                <li>Priority Support</li>
              </ul>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ display: "block", width: "100%" }}
              >
                Join Silver
              </Link>
            </div>
            <div className="package-card">
              <h3>Gold</h3>
              <div className="price">₹10,100</div>
              <ul>
                <li>4 PV Allocation</li>
                <li>Premium Matching</li>
                <li>12% Global CTO Pool</li>
                <li>Luxury Reward Eligible</li>
                <li>High Volume Income</li>
              </ul>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ display: "block", width: "100%" }}
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="why-join" id="why-join">
        <div className="container">
          <div className="section-title">
            <h2>Why Join Jipe Life?</h2>
            <p>
              5 solid reasons why thousands of leaders are choosing to build
              their future with us.
            </p>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🛡️</div>
              <h3>
                100% Risk-Free <br />(100% Capital Cashback)
              </h3>
              <p>
                Backed by a government-registered corporation (Jipe Global
                Service Limited) it is completely legal. Even if you don't build
                a team, you get 100% Cashback through the company's 30% Global
                Monthly Turnover (CTO) Royalty Pool (5% for Smart, 10% for
                Silver, 15% for Gold).
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">💸</div>
              <h3>Low Entry, Huge Payout</h3>
              <p>
                Start with just ₹2,100 and earn a matching ₹1,000 on a clean 1:1
                binary match with daily payouts. A highly calculated and
                sustainable system designed to reward your efforts.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🎁</div>
              <h3>₹3,000 Daily Family Bonus</h3>
              <p>
                Hit just 10 pairs in a single day and break the capping to lock
                in a fixed single-day payout of ₹7,000. Build a secure future
                for you and your family.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🚀</div>
              <h3>Infinite Daily Income</h3>
              <p>
                From the 11th pair onwards, earn a flat ₹200 per pair to
                unlimited depth every single day. The earning potential is truly
                limitless as your team grows.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🏆</div>
              <h3>Lifetime Rewards & Future Security</h3>
              <p>
                Win guaranteed rewards (T-shirts, laptops, bikes, and luxury
                cars) with no deadlines. Plus, earn lifetime residual income
                from future digital services like mobile recharges, bill
                payments, and e-commerce.
              </p>
            </div>
          </div>
          <div className="in-short-banner">
            <h3>IN SHORT: ZERO RISK, MAXIMUM PROFIT, AND A LIFETIME SECURED CAREER!</h3>
          </div>
        </div>
      </section>

      <section className="rewards" id="rewards">
        <div className="container">
          <div className="section-title">
            <h2>Lifetime Gift Rewards</h2>
            <p>
              Achieve milestones and win guaranteed luxury rewards or cash
              options with no time limits.
            </p>
          </div>
          <div className="rewards-grid">
            <div className="reward-card">
              <img
                src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop"
                alt="Jawa Bike"
                className="reward-img"
              />
              <div className="reward-content">
                <div className="award-badge">Award No. 7</div>
                <h3>Jawa Bike</h3>
                <ul className="reward-details">
                  <li>
                    <span>Cash Option:</span>{" "}
                    <strong className="cash-option">₹2.5 Lakh Cash</strong>
                  </li>
                  <li>
                    <span>Qualification:</span>{" "}
                    <strong>10,000 - 10,000 Pair</strong>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="btn btn-outline"
                  style={{
                    color: "var(--primary)",
                    borderColor: "var(--primary)",
                    display: "block",
                    width: "100%",
                  }}
                >
                  Achieve Now
                </Link>
              </div>
            </div>
            <div className="reward-card">
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop"
                alt="Tata Punch Car"
                className="reward-img"
              />
              <div className="reward-content">
                <div className="award-badge">Award No. 8</div>
                <h3>Tata Punch Car</h3>
                <ul className="reward-details">
                  <li>
                    <span>Cash Option:</span>{" "}
                    <strong className="cash-option">₹5.5 Lakh Cash</strong>
                  </li>
                  <li>
                    <span>Qualification:</span>{" "}
                    <strong>30,000 - 30,000 Pair</strong>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="btn btn-outline"
                  style={{
                    color: "var(--primary)",
                    borderColor: "var(--primary)",
                    display: "block",
                    width: "100%",
                  }}
                >
                  Achieve Now
                </Link>
              </div>
            </div>
            <div className="reward-card">
              <img
                src="https://images.unsplash.com/photo-1503376760367-1583d8a9f4c3?q=80&w=2070&auto=format&fit=crop"
                alt="Tata Sierra Car"
                className="reward-img"
              />
              <div className="reward-content">
                <div className="award-badge">Award No. 9</div>
                <h3>Tata Sierra Car</h3>
                <ul className="reward-details">
                  <li>
                    <span>Cash Option:</span>{" "}
                    <strong className="cash-option">₹11.5 Lakh Cash</strong>
                  </li>
                  <li>
                    <span>Qualification:</span>{" "}
                    <strong>50,000 - 50,000 Pair</strong>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="btn btn-outline"
                  style={{
                    color: "var(--primary)",
                    borderColor: "var(--primary)",
                    display: "block",
                    width: "100%",
                  }}
                >
                  Achieve Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready To Start Your Journey?</h2>
          <p>
            Become part of a modern digital business platform and unlock
            powerful opportunities for success.
          </p>
          <div className="cta-buttons">
            <Link href="/register" className="btn btn-primary">
              Register Now
            </Link>
            <a
              href="https://drive.google.com/file/d/1-1ywq-WHHrAiEABCR0gqXPOEiZyxzDru/view?usp=drivesdk"
              className="btn btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              📄 Download PDF Plan
            </a>
          </div>
        </div>
      </section>

      <footer id="contact">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>Jipe Life</h3>
              <p>
                Professional presentation website designed for modern business
                growth and leadership development.
              </p>
            </div>
            <div>
              <h3>Quick Links</h3>
              <ul>
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#packages">Packages</a>
                </li>
                <li>
                  <a href="#why-join">Why Join Us</a>
                </li>
                <li>
                  <a href="#rewards">Rewards</a>
                </li>
              </ul>
            </div>
            <div>
              <h3>Contact</h3>
              <ul>
                <li>Email: help@jipelife.com</li>
                <li>Phone: +91 86389 16978</li>
                <li>Help: +91 63544 45277</li>
                <li>India Corporate Office</li>
              </ul>
            </div>
            <div>
              <h3>Company Details</h3>
              <ul>
                <li>JIPE GLOBAL SERVICE LIMITED</li>
                <li>CIN :U66190AS2024PLC026755</li>
              </ul>
              <h3>Address</h3>
              <ul>
                <li>Kurshamari, Rangamati, Chapar-783376 Assam india</li>
              </ul>
            </div>
          </div>
          <div className="copyright">
            © 2026 Jipe Life. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}