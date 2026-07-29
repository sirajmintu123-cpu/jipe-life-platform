@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #0F2D59;
  --primary-light: #1a3f70;
  --primary-dark: #0a1f3e;
  --secondary: #1e293b;
  --gold: #f59e0b;
  --gold-light: #fbbf24;
  --green: #10b981;
  --green-light: #34d399;
  --white: #ffffff;
  --light: #f8fafc;
  --gray: #64748b;
  --gray-light: #e2e8f0;
  --shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 8px 40px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 30px 80px rgba(0, 0, 0, 0.2);
  --gradient-primary: linear-gradient(135deg, #0F2D59 0%, #1a3f70 50%, #2563EB 100%);
  --gradient-gold: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --gradient-green: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--light);
  color: var(--primary);
  overflow-x: hidden;
}

.presentation-page {
  position: relative;
}

/* =========================================
   PREMIUM HEADER
   ========================================= */
.presentation-page header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.presentation-page header.scrolled {
  background: rgba(15, 23, 42, 0.98);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.presentation-page .navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.presentation-page .logo {
  font-size: 28px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.5px;
  position: relative;
}

.presentation-page .logo span {
  color: var(--gold);
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.presentation-page .logo::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--gradient-gold);
  border-radius: 2px;
}

.presentation-page .nav-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-btn {
  padding: 10px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  color: white;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.nav-btn-login {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.nav-btn-login:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
}

.nav-btn-register {
  background: var(--gradient-gold);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
}

.nav-btn-register:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.6);
}

/* =========================================
   PREMIUM BUTTONS
   ========================================= */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 36px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: var(--gradient-gold);
  color: white;
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.6);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-outline {
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
  border-color: var(--gold);
}

.btn-secondary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 8px 30px rgba(15, 45, 89, 0.4);
}

.btn-secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(15, 45, 89, 0.6);
}

/* =========================================
   PREMIUM HERO
   ========================================= */
.presentation-page .hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background: var(--gradient-primary);
  color: white;
  padding-top: 80px;
  overflow: hidden;
}

.presentation-page .hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 70%;
  height: 150%;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.3) 0%, transparent 70%);
  animation: heroGlow 10s ease-in-out infinite alternate;
}

@keyframes heroGlow {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-5%, -5%) scale(1.1); }
}

.presentation-page .hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 50%;
  height: 100%;
  background: radial-gradient(ellipse, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
  animation: heroGlow2 8s ease-in-out infinite alternate;
}

@keyframes heroGlow2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(5%, 5%) scale(1.1); }
}

.presentation-page .hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-content {
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gold-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.hero h1 {
  font-size: 72px;
  line-height: 1.05;
  margin-bottom: 20px;
  font-weight: 900;
  letter-spacing: -2px;
}

.hero h1 span {
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  margin-bottom: 40px;
  line-height: 1.8;
  max-width: 500px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  gap: 30px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-stats-item {
  text-align: left;
}

.hero-stats-item .number {
  font-size: 28px;
  font-weight: 900;
  color: var(--gold);
}

.hero-stats-item .label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* Premium Hero Card */
.hero-card-premium {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 40px;
  animation: fadeInUp 1.2s ease;
  transition: all 0.3s ease;
}

.hero-card-premium:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.stats-grid-premium {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-box-premium {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-box-premium:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.03);
}

.stat-box-premium .icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.stat-box-premium h2 {
  font-size: 38px;
  font-weight: 900;
  margin-bottom: 4px;
}

.stat-box-premium p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* =========================================
   WHAT IS JIPE LIFE
   ========================================= */
.what-is {
  background: var(--light);
  padding: 80px 0;
}

.what-is-card-premium {
  background: var(--gradient-primary);
  color: white;
  padding: 80px 60px;
  border-radius: 40px;
  text-align: center;
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
  max-width: 1100px;
  margin: 0 auto;
}

.what-is-card-premium::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
  animation: heroGlow 12s ease-in-out infinite alternate;
}

.what-is-card-premium::after {
  content: '✦';
  position: absolute;
  font-size: 300px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.02);
  top: -80px;
  right: -40px;
  transform: rotate(15deg);
}

.what-is-card-premium .content {
  position: relative;
  z-index: 2;
}

.what-is-card-premium h2 {
  font-size: 48px;
  margin-bottom: 24px;
  font-weight: 900;
}

.what-is-card-premium h2 span {
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.what-is-card-premium p {
  font-size: 18px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.85);
  max-width: 800px;
  margin: 0 auto 16px;
}

.what-is-card-premium .slogan {
  display: inline-block;
  background: rgba(245, 158, 11, 0.2);
  padding: 8px 24px;
  border-radius: 50px;
  color: var(--gold-light);
  font-weight: 700;
  font-size: 20px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  margin-top: 8px;
}

/* =========================================
   ABOUT
   ========================================= */
#about {
  padding: 100px 0;
  background: white;
}

.about-grid-premium {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.about-image-premium {
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.about-image-premium img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.about-image-premium:hover img {
  transform: scale(1.03);
}

.about-image-premium .floating-badge {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 12px;
}

.about-image-premium .floating-badge .number {
  font-size: 28px;
  font-weight: 900;
  color: var(--gold);
}

.about-image-premium .floating-badge .label {
  font-size: 12px;
  color: var(--gray);
}

.about-content-premium h3 {
  font-size: 44px;
  font-weight: 900;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.about-content-premium h3 span {
  color: var(--gold);
}

.about-content-premium > p {
  color: var(--gray);
  line-height: 1.9;
  margin-bottom: 30px;
  font-size: 16px;
}

.feature-premium {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: var(--light);
  margin-bottom: 16px;
}

.feature-premium:hover {
  transform: translateX(8px);
  box-shadow: var(--shadow-sm);
}

.feature-premium .icon-wrapper {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2));
}

.feature-premium h4 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.feature-premium p {
  color: var(--gray);
  font-size: 14px;
  margin: 0;
}

/* =========================================
   MISSION & VISION
   ========================================= */
.mission-vision-premium {
  background: var(--light);
  padding: 100px 0;
}

.section-title-premium {
  text-align: center;
  margin-bottom: 60px;
}

.section-title-premium .badge {
  display: inline-block;
  background: rgba(245, 158, 11, 0.1);
  color: var(--gold);
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.section-title-premium h2 {
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.section-title-premium p {
  color: var(--gray);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
}

.mv-grid-premium {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.mv-card-premium {
  background: white;
  padding: 50px 40px;
  border-radius: 32px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mv-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--gradient-gold);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.mv-card-premium:hover::before {
  transform: scaleX(1);
}

.mv-card-premium:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.mv-card-premium .icon {
  font-size: 64px;
  margin-bottom: 20px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.mv-card-premium h3 {
  font-size: 28px;
  margin-bottom: 16px;
  font-weight: 800;
}

.mv-card-premium p {
  color: var(--gray);
  line-height: 1.9;
  font-size: 15px;
}

/* =========================================
   PACKAGES
   ========================================= */
.packages-premium {
  background: var(--primary);
  color: white;
  padding: 100px 0;
}

.packages-premium .section-title-premium p {
  color: rgba(255, 255, 255, 0.6);
}

.packages-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.package-card-premium {
  background: white;
  color: var(--primary);
  padding: 40px 30px;
  border-radius: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.package-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--gradient-gold);
}

.package-card-premium.featured {
  transform: scale(1.05);
  border: 2px solid var(--gold);
  box-shadow: 0 20px 60px rgba(245, 158, 11, 0.2);
}

.package-card-premium:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.package-card-premium.featured:hover {
  transform: translateY(-8px) scale(1.05);
}

.package-card-premium .popular-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--gradient-gold);
  color: white;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.package-card-premium h3 {
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 8px;
}

.package-card-premium .subtitle {
  font-size: 14px;
  color: var(--gray);
  margin-bottom: 16px;
}

.package-card-premium .price {
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 24px;
  color: var(--primary);
}

.package-card-premium .price span {
  font-size: 20px;
  font-weight: 400;
  color: var(--gray);
}

.package-card-premium ul {
  list-style: none;
  margin-bottom: 30px;
}

.package-card-premium ul li {
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-light);
  color: var(--gray);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.package-card-premium ul li::before {
  content: '✓';
  color: var(--gold);
  font-weight: 700;
}

.package-card-premium .btn {
  width: 100%;
}

/* =========================================
   WHY JOIN
   ========================================= */
.why-join-premium {
  background: var(--light);
  padding: 100px 0;
}

.why-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.why-card-premium {
  background: white;
  padding: 40px 30px;
  border-radius: 28px;
  box-shadow: var(--shadow-sm);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.why-card-premium::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--gradient-gold);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.why-card-premium:hover::after {
  transform: scaleX(1);
}

.why-card-premium:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}

.why-card-premium .icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin-bottom: 20px;
}

.why-card-premium h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.3;
}

.why-card-premium p {
  color: var(--gray);
  line-height: 1.8;
  font-size: 14px;
}

.in-short-banner-premium {
  margin-top: 60px;
  background: var(--gradient-gold);
  padding: 32px 40px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 16px 40px rgba(245, 158, 11, 0.3);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.in-short-banner-premium h3 {
  color: white;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

/* =========================================
   REWARDS
   ========================================= */
.rewards-premium {
  background: var(--primary);
  color: white;
  padding: 100px 0;
}

.rewards-premium .section-title-premium p {
  color: rgba(255, 255, 255, 0.6);
}

.rewards-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.reward-card-premium {
  background: white;
  color: var(--primary);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.reward-card-premium:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 60px rgba(245, 158, 11, 0.2);
}

.reward-card-premium .image-wrapper {
  position: relative;
  overflow: hidden;
  height: 240px;
}

.reward-card-premium .image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.reward-card-premium:hover .image-wrapper img {
  transform: scale(1.05);
}

.reward-card-premium .image-wrapper .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, transparent 60%);
}

.reward-card-premium .content {
  padding: 30px;
}

.reward-card-premium .award-badge {
  display: inline-block;
  background: var(--gradient-gold);
  color: white;
  padding: 4px 16px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.reward-card-premium h3 {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 16px;
}

.reward-card-premium .details {
  list-style: none;
}

.reward-card-premium .details li {
  padding: 12px 0;
  border-top: 1px solid var(--gray-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--gray);
}

.reward-card-premium .details li:last-child {
  border-bottom: 1px solid var(--gray-light);
  margin-bottom: 16px;
}

.reward-card-premium .details li strong {
  color: var(--primary);
  font-weight: 700;
}

.reward-card-premium .details .cash {
  color: var(--green);
  font-weight: 700;
}

/* =========================================
   CTA
   ========================================= */
.cta-premium {
  background: var(--gradient-primary);
  color: white;
  text-align: center;
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

.cta-premium::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.3) 0%, transparent 70%);
  animation: heroGlow 10s ease-in-out infinite alternate;
}

.cta-premium .content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.cta-premium h2 {
  font-size: 56px;
  font-weight: 900;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.cta-premium p {
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.8;
  font-size: 18px;
}

.cta-premium .cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-premium .btn-outline {
  border-color: rgba(255, 255, 255, 0.3);
}

.cta-premium .btn-outline:hover {
  border-color: var(--gold);
  background: rgba(245, 158, 11, 0.1);
}

/* =========================================
   FOOTER
   ========================================= */
.footer-premium {
  background: #0a0f1a;
  color: #94a3b8;
  padding: 60px 0 30px;
}

.footer-grid-premium {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 40px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  margin-bottom: 40px;
}

.footer-premium h3 {
  color: white;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
}

.footer-premium .logo {
  font-size: 24px;
  font-weight: 900;
  color: white;
  display: inline-block;
  margin-bottom: 12px;
}

.footer-premium .logo span {
  color: var(--gold);
}

.footer-premium p {
  font-size: 14px;
  line-height: 1.8;
  max-width: 300px;
}

.footer-premium ul {
  list-style: none;
}

.footer-premium ul li {
  margin-bottom: 12px;
}

.footer-premium ul a {
  color: #94a3b8;
  transition: color 0.3s ease;
  font-size: 14px;
}

.footer-premium ul a:hover {
  color: var(--gold);
}

.footer-premium .social-links {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.footer-premium .social-links a {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.footer-premium .social-links a:hover {
  background: var(--gold);
  color: white;
  transform: translateY(-3px);
}

.footer-premium .copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 24px;
  text-align: center;
  font-size: 13px;
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

/* =========================================
   RESPONSIVE
   ========================================= */
@media (max-width: 1200px) {
  .hero h1 {
    font-size: 60px;
  }
}

@media (max-width: 992px) {
  .presentation-page .hero-grid,
  .about-grid-premium,
  .footer-grid-premium,
  .mv-grid-premium {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero h1 {
    font-size: 48px;
  }

  .hero-stats {
    justify-content: center;
  }

  .section-title-premium h2 {
    font-size: 38px;
  }

  .package-card-premium.featured {
    transform: none;
  }

  .package-card-premium.featured:hover {
    transform: translateY(-8px);
  }

  .what-is-card-premium {
    padding: 50px 30px;
  }

  .what-is-card-premium h2 {
    font-size: 38px;
  }

  .about-content-premium h3 {
    font-size: 36px;
  }

  .cta-premium h2 {
    font-size: 42px;
  }

  .footer-grid-premium {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .presentation-page .navbar {
    padding: 12px 16px;
  }

  .presentation-page .logo {
    font-size: 20px;
  }

  .nav-btn {
    padding: 8px 16px;
    font-size: 12px;
  }

  .hero h1 {
    font-size: 36px;
    letter-spacing: -0.5px;
  }

  .hero p {
    font-size: 16px;
  }

  .hero-card-premium {
    padding: 24px;
  }

  .stats-grid-premium {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-box-premium {
    padding: 20px 16px;
  }

  .stat-box-premium h2 {
    font-size: 30px;
  }

  .section-title-premium h2 {
    font-size: 32px;
  }

  .what-is-card-premium {
    padding: 40px 20px;
    border-radius: 24px;
  }

  .what-is-card-premium h2 {
    font-size: 32px;
  }

  .what-is-card-premium p {
    font-size: 16px;
  }

  .about-image-premium img {
    height: 300px;
  }

  .about-content-premium h3 {
    font-size: 30px;
  }

  .mv-card-premium {
    padding: 40px 24px;
  }

  .mv-card-premium h3 {
    font-size: 24px;
  }

  .package-card-premium {
    padding: 30px 24px;
  }

  .package-card-premium .price {
    font-size: 38px;
  }

  .package-card-premium.featured {
    transform: none;
  }

  .package-card-premium.featured:hover {
    transform: translateY(-8px);
  }

  .rewards-grid-premium {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }

  .reward-card-premium .image-wrapper {
    height: 200px;
  }

  .cta-premium h2 {
    font-size: 34px;
  }

  .cta-premium p {
    font-size: 16px;
  }

  .in-short-banner-premium h3 {
    font-size: 18px;
  }

  .footer-grid-premium {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .hero-stats-item {
    text-align: center;
  }

  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }

  .hero-buttons .btn {
    width: 100%;
    justify-content: center;
  }

  .cta-premium .cta-buttons {
    flex-direction: column;
    width: 100%;
  }

  .cta-premium .cta-buttons .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .presentation-page .logo {
    font-size: 18px;
  }

  .nav-btn {
    padding: 6px 12px;
    font-size: 10px;
  }

  .hero h1 {
    font-size: 30px;
  }

  .stats-grid-premium {
    grid-template-columns: 1fr 1fr;
  }

  .stat-box-premium h2 {
    font-size: 26px;
  }

  .section-title-premium h2 {
    font-size: 28px;
  }

  .what-is-card-premium h2 {
    font-size: 28px;
  }

  .reward-card-premium .content {
    padding: 24px 20px;
  }

  .reward-card-premium .details li {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .package-card-premium .price {
    font-size: 32px;
  }
}