import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DAY_LABELS,
  MONTH_SHORT,
  PROGRESS_WEEKS,
  toISODate,
  todayStart,
  startOfWeek,
  startOfMonth,
  addDays,
  addMonths,
  fmtDayLong,
  fmtRange,
  buildProgressWeek,
  buildMonthDays,
} from './lib/progress'
import { fetchSchedule, fetchUpdates, isSupabaseConfigured } from './lib/supabase'
import type { ProgressDay, ProgressUpdate } from './lib/progress'

/* ===== MEMBERS DATA ===== */
interface Member {
  id: number
  name: string
  class: string
  designation: string
  tier: 'leadership' | 'core' | 'executive'
  photo?: string
}

const membersData: Member[] = [
  { id: 1, name: 'Nikkitha Rosini Amshavel', class: '23CS7B', designation: 'President', tier: 'leadership', photo: '/members/nikkitha.png' },
  { id: 2, name: 'Dharshini U', class: '23CS7A', designation: 'Vice President', tier: 'leadership', photo: '/members/dharshini.png' },
  { id: 3, name: 'Jancy O', class: '23CS7A', designation: 'Secretary', tier: 'leadership', photo: '/members/jancy.png' },
  { id: 4, name: 'Sharmila P', class: '23CS7B', designation: 'Tech Lead', tier: 'leadership', photo: '/members/sharmila.png' },
  { id: 5, name: 'Hariharasudhan R', class: '24CS5A', designation: 'Club Admin', tier: 'core', photo: '/members/hari.png' },
  { id: 6, name: 'Swathi S', class: '24CS5C', designation: 'Associate Admin', tier: 'core', photo: '/members/swathi.png' },
  { id: 7, name: 'Kaarthika M', class: '24CS5B', designation: 'Joint Tech Lead', tier: 'core', photo: '/members/kaarthika.png' },
  { id: 8, name: 'Gokula Prasath R', class: '24CS5A', designation: 'Organizer', tier: 'core', photo: '/members/gokul.png' },
  { id: 10, name: 'Sowmiya M', class: '24CS5C', designation: 'Designer', tier: 'core', photo: '/members/sowmiya.png' },
  { id: 12, name: 'Subasri S', class: '24CS5C', designation: 'Chief Innovator', tier: 'core', photo: '/members/subasri.png' },
  { id: 13, name: 'Vikash K', class: '24CS5C', designation: 'Joint Treasurer', tier: 'core', photo: '/members/vikash.png' },
  { id: 14, name: 'Sujith Ragav M', class: '24CS5C', designation: 'Tech Mentor', tier: 'core', photo: '/members/sujith.png' },
  { id: 15, name: 'Kousalya K', class: '24CS5B', designation: 'Tech Scout', tier: 'core', photo: '/members/kousalya.png' },
  { id: 16, name: 'Indhumathi S', class: '25CS3A', designation: 'Executive Member', tier: 'executive', photo: '/members/indhu.png' },
  { id: 17, name: 'Abisek S U', class: '25CS3A', designation: 'Executive Member', tier: 'executive', photo: '/members/abi.png' },
  { id: 18, name: 'Kaniga Sree K S', class: '25CS3B', designation: 'Executive Member', tier: 'executive', photo: '/members/kaniga.png' },
  { id: 19, name: 'Prartthana P', class: '25CS3B', designation: 'Executive Member', tier: 'executive', photo: '/members/prartthana.png' },
  { id: 20, name: 'Miruthulaa P', class: '25CS3B', designation: 'Executive Member', tier: 'executive', photo: '/members/miruthulaa.png' },
  { id: 21, name: 'Sandhiya C', class: '25CS3C', designation: 'Executive Member', tier: 'executive', photo: '/members/sandhiya.png' },
  { id: 22, name: 'Yohidha V S', class: '25CS3C', designation: 'Executive Member', tier: 'executive', photo: '/members/yohidha.png' },
  { id: 23, name: 'Sabari K', class: '25CS3C', designation: 'Executive Member', tier: 'executive', photo: '/members/sabari.png' },
  { id: 24, name: 'Rizvan R', class: '25CS3C', designation: 'Executive Member', tier: 'executive', photo: '/members/rizvan.png' },
]

const getMember = (id: number) => membersData.find(m => m.id === id)

const getInitials = (name: string) => {
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
}

/* ===== MENTORSHIP DATA ===== */
interface Mentorship {
  mentor: number
  mentee: number
}

const mentorships: Mentorship[] = [
  { mentor: 1, mentee: 24 },
  { mentor: 6, mentee: 19 },
  { mentor: 5, mentee: 16 },
  { mentor: 8, mentee: 20 },
  { mentor: 10, mentee: 17 },
  { mentor: 3, mentee: 18 },
  { mentor: 7, mentee: 22 },
  { mentor: 4, mentee: 21 },
  { mentor: 15, mentee: 23 },
]

/* ===== EVENTS DATA ===== */
const eventsData = [
  {
    title: 'Tech Innovation Summit 2025',
    desc: 'An exciting event filled with insightful sessions, workshops and networking opportunities.',
    date: '24 May 2025',
    time: '10:00 AM',
    venue: 'Seminar Hall',
  },
  {
    title: 'Web Development Bootcamp',
    desc: 'A hands-on bootcamp covering modern web technologies from React to Node.js.',
    date: '15 Jun 2025',
    time: '9:00 AM',
    venue: 'Lab 3',
  },
  {
    title: 'AI/ML Workshop Series',
    desc: 'Dive deep into machine learning fundamentals with practical projects and mentorship.',
    date: '10 Jul 2025',
    time: '2:00 PM',
    venue: 'Auditorium',
  },
]

const blogPosts = [
  { tag: 'AI / ML', title: 'The Future of AI: Trends to Watch', desc: 'Explore the emerging trends and innovations shaping the future of artificial intelligence.' },
  { tag: 'WEB DEV', title: 'Building Responsive Websites in 2025', desc: 'A complete guide to modern techniques for building fast and responsive websites.' },
  { tag: 'TECH INSIGHTS', title: 'Cloud Computing Explained', desc: 'Understand the basics, benefits and future of cloud computing in simple terms.' },
]

/* ===== SVG ICONS ===== */
const Icons = {
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z" />
      <path d="M18 16l1.2 2.8L22 20l-2.8 1.2L18 24l-1.2-2.8L14 20l2.8-1.2z" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Collaborate: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Innovate: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  Inspire: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Lead: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  Workshops: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Hackathons: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Seminars: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  TechMeets: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  Message: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
}

/* ===== PARTICLE CANVAS ===== */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.07 * (1 - dist / 130)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

/* ===== NAVBAR ===== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      const sections = ['hero', 'motto', 'upcoming-event', 'tech-blog', 'about', 'members', 'mentorship', 'events', 'feedback']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'motto', label: 'Motto' },
    { id: 'upcoming-event', label: 'Events' },
    { id: 'tech-blog', label: 'Blog' },
    { id: 'about', label: 'About' },
    { id: 'members', label: 'Team' },
    { id: 'mentorship', label: 'Mentorship' },
    { id: 'events', label: 'Activities' },
    { id: 'updates', label: 'Updates' },
    { id: 'feedback', label: 'Contact' },
  ]

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <img src="/logo.png" alt="Tech Crew Logo" />
          <span>TECH CREW</span>
        </a>
        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {navItems.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={activeSection === item.id ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#feedback" className="nav-cta">Join Us</a>
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}

/* ===== HERO WITH BANNER ===== */
function Hero() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100)
  }, [])

  return (
    <section className={`hero${loaded ? ' hero-loaded' : ''}`} id="hero">
      <div className="hero-image-bg">
        <img src="/hero.jpg" alt="Tech Crew Banner" />
        <div className="hero-overlay" />
      </div>
      <ParticleCanvas />
      <div className="container hero-content-wrap">
        <div className="hero-badge">
          <Icons.Sparkles />
          <span>Department of Computer Science</span>
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line">TECH</span>
          <span className="hero-title-line gradient-text">CREW</span>
        </h1>
        <p className="hero-tagline">Innovate &nbsp;·&nbsp; Learn &nbsp;·&nbsp; Build &nbsp;·&nbsp; Grow</p>
        <p className="hero-desc">
          A student-driven technical club empowering minds through technology, innovation, and real-world problem solving.
        </p>
        <div className="hero-buttons">
          <a href="#feedback" className="btn btn-glow">
            <span>Join the Crew</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
          </a>
          <a href="#events" className="btn btn-glass">
            <span>Explore Events</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
          </a>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">25+</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">10+</span>
            <span className="stat-label">Events</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">3+</span>
            <span className="stat-label">Years</span>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel" />
        </div>
        <span>Scroll Down</span>
      </div>
    </section>
  )
}

/* ===== MOTTO ===== */
function Motto() {
  return (
    <section className="motto reveal" id="motto">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">OUR MOTTO</span>
          <h2 className="section-title">What Drives Us Forward</h2>
        </div>
        <div className="motto-content">
          <div className="motto-card">
            <div className="motto-glow" />
            <div className="motto-icon-wrap">
              <Icons.Sparkles />
            </div>
            <h3>Learn. Build. Innovate. Lead the Future.</h3>
            <p>Empowering Ideas. Creating Impact.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== UPCOMING EVENT ===== */
function UpcomingEvent() {
  const [current, setCurrent] = useState(0)
  const next = () => setCurrent((current + 1) % eventsData.length)
  const prev = () => setCurrent((current - 1 + eventsData.length) % eventsData.length)
  const event = eventsData[current]

  return (
    <section className="upcoming-event reveal" id="upcoming-event">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">UPCOMING EVENT</span>
          <h2 className="section-title">Don't Miss Out</h2>
        </div>
        <div className="event-carousel">
          <div className="event-card-glass">
            <div className="event-card-glow" />
            <div className="event-badge">Featured Event</div>
            <h3>{event.title}</h3>
            <p className="event-desc">{event.desc}</p>
            <div className="event-meta-grid">
              <div className="meta-item">
                <Icons.Calendar />
                <span>{event.date}</span>
              </div>
              <div className="meta-item">
                <Icons.Clock />
                <span>{event.time}</span>
              </div>
              <div className="meta-item">
                <Icons.MapPin />
                <span>{event.venue}</span>
              </div>
            </div>
            <div className="event-actions">
              <a href="#" className="btn btn-glow btn-sm">Register Now</a>
            </div>
            <div className="event-nav">
              <button className="carousel-arrow" onClick={prev} aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="carousel-dots">
                {eventsData.map((_, i) => (
                  <span key={i} className={`dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
                ))}
              </div>
              <button className="carousel-arrow" onClick={next} aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== TECH BLOG ===== */
function TechBlog() {
  return (
    <section className="tech-blog reveal" id="tech-blog">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">TECH BLOG</span>
          <h2 className="section-title">Latest Insights</h2>
        </div>
        <div className="blog-grid">
          {blogPosts.map((post, i) => (
            <article className="blog-card-glass" key={i}>
              <div className="blog-card-top">
                <span className="blog-tag">{post.tag}</span>
                <span className="blog-num">0{i + 1}</span>
              </div>
              <h4>{post.title}</h4>
              <p>{post.desc}</p>
              <a href="#" className="read-more">
                Read More
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== ABOUT US ===== */
function About() {
  const pillars = [
    { icon: Icons.Collaborate, title: 'Collaborate', desc: 'Work together to achieve extraordinary results.' },
    { icon: Icons.Innovate, title: 'Innovate', desc: 'Turn bold ideas into impactful solutions.' },
    { icon: Icons.Inspire, title: 'Inspire', desc: 'Inspire and grow together as one community.' },
    { icon: Icons.Lead, title: 'Lead', desc: 'Lead the future with technology and vision.' },
  ]

  return (
    <section className="about reveal" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">ABOUT US</span>
          <h2 className="section-title">Who We Are</h2>
        </div>
        <div className="about-content">
          <div className="about-text-block">
            <p>
              Tech Crew is a student-driven technical club focused on learning, innovation and real-world skills.
              We create opportunities to explore technology, share knowledge and build solutions together.
              Our mission is to bridge the gap between classroom learning and industry expectations.
            </p>
          </div>
          <div className="about-pillars">
            {pillars.map((p, i) => {
              const IconComp = p.icon
              return (
                <div className="pillar-card" key={i}>
                  <div className="pillar-glow" />
                  <div className="pillar-icon-wrap">
                    <IconComp />
                  </div>
                  <h5>{p.title}</h5>
                  <p>{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== MEMBERS SECTION ===== */
function EvolvedMembersSection() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const tierConfig = {
    leadership: {
      color: '#00d4ff',
      glow: 'rgba(0, 212, 255, 0.4)',
      bg: 'rgba(0, 212, 255, 0.12)',
      label: 'Leadership',
    },
    core: {
      color: '#a78bfa',
      glow: 'rgba(167, 139, 250, 0.4)',
      bg: 'rgba(167, 139, 250, 0.12)',
      label: 'Core Team',
    },
    executive: {
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      bg: 'rgba(16, 185, 129, 0.12)',
      label: 'Executive',
    },
  }

  const tierOrder = ['leadership', 'core', 'executive'] as const

  const renderMemberPhoto = (member: Member) =>
    member.photo ? (
      <img src={member.photo} alt={member.name} />
    ) : (
      getInitials(member.name)
    )

  if (selectedMember) {
    const config = tierConfig[selectedMember.tier]
    return (
      <section className="members reveal" id="members">
        <div className="container">
          <button className="profile-back-btn" onClick={() => setSelectedMember(null)}>
            <span aria-hidden="true">←</span> All members
          </button>
          <div className="member-profile-view">
            <div
              className="profile-photo"
              style={{ '--tier-color': config.color, '--tier-bg': config.bg } as React.CSSProperties}
            >
              {renderMemberPhoto(selectedMember)}
            </div>
            <span
              className="profile-tier-badge"
              style={{ color: config.color, background: config.bg, borderColor: config.color }}
            >
              {config.label}
            </span>
            <h3 className="profile-name">{selectedMember.name}</h3>
            <p className="profile-role" style={{ color: config.color }}>
              {selectedMember.designation}
            </p>
            <div className="profile-info">
              <div className="info-chip">
                <span className="chip-label">Department / Class</span>
                <span className="chip-value">{selectedMember.class}</span>
              </div>
              <div className="info-chip">
                <span className="chip-label">Club Membership</span>
                <span className="chip-value">Member #{selectedMember.id}</span>
              </div>
              <div className="info-chip">
                <span className="chip-label">Status</span>
                <span className="chip-value status-active">Active</span>
              </div>
            </div>
            <div className="profile-quote">
              <p>“Driving technical innovation and collaborative learning in Tech Crew.”</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="members reveal" id="members">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">CORE CREW ROSTER</span>
          <h2 className="section-title">Meet Our Team</h2>
        </div>

        <div className="member-groups">
          {tierOrder.map(tier => {
            const config = tierConfig[tier]
            const list = membersData.filter(m => m.tier === tier)
            return (
              <div key={tier} className="member-group">
                <div className="member-group-header">
                  <span
                    className="member-group-badge"
                    style={{ color: config.color, background: config.bg, borderColor: config.color }}
                  >
                    {config.label} ({list.length})
                  </span>
                  <span className="member-swipe-hint">
                    swipe <span aria-hidden="true">→</span>
                  </span>
                </div>
                <div
                  className="member-row"
                  onScroll={e => {
                    const el = e.currentTarget
                    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
                    el.classList.toggle('row-end', atEnd)
                  }}
                >
                  {list.map(member => (
                    <button
                      key={member.id}
                      className="member-card"
                      onClick={() => setSelectedMember(member)}
                      style={{ '--tier-color': config.color, '--tier-bg': config.bg } as React.CSSProperties}
                    >
                      <span className="member-photo">{renderMemberPhoto(member)}</span>
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">{member.designation}</span>
                      <span className="member-class">{member.class}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
/* ===== MENTORSHIP SECTION ===== */
function MentorshipSection() {
  const renderAvatar = (member: Member, side: 'mentor' | 'junior') => (
    <div className={`mentorship-avatar ${side}`}>
      {member.photo ? <img src={member.photo} alt={member.name} /> : <span>{getInitials(member.name)}</span>}
    </div>
  )

  const renderPair = (p: Mentorship) => {
    const mentor = getMember(p.mentor)
    const mentee = getMember(p.mentee)
    if (!mentor || !mentee) return null
    return (
      <div className="mentorship-pair-row" key={p.mentee}>
        <span className="mentorship-person">
          {renderAvatar(mentor, 'mentor')}
          <span className="mentorship-name">{mentor.name}</span>
        </span>
        <span className="mentorship-pair-arrow" aria-hidden="true">→</span>
        <span className="mentorship-person">
          <span className="mentorship-name">{mentee.name}</span>
          {renderAvatar(mentee, 'junior')}
        </span>
      </div>
    )
  }

  return (
    <section className="mentorship reveal" id="mentorship">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">MENTORSHIP</span>
          <h2 className="section-title">Senior to Junior Guidance</h2>
          <p className="section-subtitle">Every junior is guided by a senior — to learn, help and grow together.</p>
        </div>

        <div className="mentorship-pairs">
          {mentorships.slice(0, 5).map(renderPair)}
          {mentorships.slice(5).map(renderPair)}
        </div>
      </div>
    </section>
  )
}

/* ===== PROGRESS DATA HOOK ===== */
function useProgressData() {
  const [data, setData] = useState<{
    schedule: Record<number, number[]>
    members: { id: number; name: string }[]
    updates: Map<string, { title: string; content: string }>
  }>({ schedule: {}, members: [], updates: new Map() })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchSchedule()
      const schedule: Record<number, number[]> = {}
      rows.forEach(m => {
        ;(schedule[m.scheduled_day] ??= []).push(m.id)
      })
      const now = todayStart()
      const from = addDays(startOfWeek(now), -(PROGRESS_WEEKS - 1) * 7)
      const to = addDays(startOfWeek(now), 6)
      const updateRows = await fetchUpdates(toISODate(from), toISODate(to))
      const updates = new Map<string, { title: string; content: string }>()
      updateRows.forEach(r => {
        updates.set(`${r.member_id}:${r.posted_on}`, { title: r.title, content: r.content })
      })
      setData({
        schedule,
        members: rows.map(m => ({ id: m.id, name: m.name })),
        updates,
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { ...data, loading, error, reload }
}

const progressContext = (schedule: Record<number, number[]>, updates: Map<string, { title: string; content: string }>) => ({
  schedule,
  updates,
})

/* ===== WEEKLY PROGRESS ===== */
function WeeklyProgress() {
  const { schedule, updates, loading, error, reload } = useProgressData()
  const ctx = progressContext(schedule, updates)
  const nowDay = (new Date().getDay() + 6) % 7
  const goUpdates = () => {
    window.location.hash = '#updates'
  }

  if (loading) {
    return (
      <section className="weekly-progress reveal visible" id="weekly-progress">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">WEEKLY PROGRESS</span>
            <h2 className="section-title">Loading updates…</h2>
          </div>
          <div className="progress-state">
            <div className="progress-spinner" />
            <p>Fetching this week's updates from the database.</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="weekly-progress reveal visible" id="weekly-progress">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">WEEKLY PROGRESS</span>
            <h2 className="section-title">Couldn't load updates</h2>
          </div>
          <div className="progress-state">
            <p>{isSupabaseConfigured ? error : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.'}</p>
            <button className="btn btn-glass" onClick={reload}>
              <span>Retry</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const current = buildProgressWeek(startOfWeek(todayStart()), ctx)
  const todayDay = current.days[nowDay]
  const postedCount = current.days.reduce((n, d) => n + d.updates.filter(u => u.posted).length, 0)
  const totalCount = current.days.reduce((n, d) => n + d.updates.length, 0)

  return (
    <section className="weekly-progress reveal visible" id="weekly-progress">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">WEEKLY PROGRESS</span>
          <h2 className="section-title">
            What We're <span className="gradient-text">Building</span> This Week
          </h2>
          <p className="section-subtitle">
            Every executive member shares a small win each week. {postedCount} of {totalCount} updates posted so far.
          </p>
        </div>

        <div
          className="progress-spotlight"
          role="button"
          tabIndex={0}
          onClick={goUpdates}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') goUpdates()
          }}
        >
          <div className="spotlight-head">
            <span className="spotlight-day">TODAY · {DAY_LABELS[nowDay]}</span>
            <span className="spotlight-date">{fmtDayLong(todayDay.date)}</span>
          </div>
          {todayDay.updates.length === 0 && (
            <p className="spotlight-post-text">No one is scheduled to post today.</p>
          )}
          {todayDay.updates.map(u => {
            const member = getMember(u.memberId)
            if (!member) return null
            return (
              <div className="spotlight-post" key={u.memberId}>
                <span className={`progress-avatar${u.posted ? '' : ' pending'}`}>
                  {member.photo ? <img src={member.photo} alt={member.name} /> : <span>{getInitials(member.name)}</span>}
                </span>
                <div className="spotlight-post-body">
                  <span className="spotlight-post-name">{member.name}</span>
                  {u.posted ? (
                    <p className="spotlight-post-text">“{u.content}”</p>
                  ) : (
                    <p className="spotlight-post-text pending">Update coming later today — {u.title}.</p>
                  )}
                </div>
                <span className={`status-badge${u.posted ? '' : ' pending'}`}>{u.posted ? 'Posted' : 'Pending'}</span>
              </div>
            )
          })}
          <span className="spotlight-cta">
            View full update
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
          </span>
        </div>

        <div className="progress-actions">
          <a href="#updates" className="btn btn-glow">
            <span>View Full Updates</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ===== UPDATES FULL PAGE ===== */
type UpdateView = 'week' | 'month' | 'year'

function UpdatesPage() {
  const [view, setView] = useState<UpdateView>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [yearOffset, setYearOffset] = useState(0)
  const [personId, setPersonId] = useState<number | 'all'>('all')
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [schedule, setSchedule] = useState<Record<number, number[]>>({})
  const [updates, setUpdates] = useState<Map<string, { title: string; content: string }>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const now = todayStart()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchSchedule()
      const sched: Record<number, number[]> = {}
      rows.forEach(m => {
        ;(sched[m.scheduled_day] ??= []).push(m.id)
      })
      const today = todayStart()
      const from = addDays(startOfWeek(today), -(PROGRESS_WEEKS - 1) * 7)
      const updateRows = await fetchUpdates(toISODate(from), toISODate(today))
      const map = new Map<string, { title: string; content: string }>()
      updateRows.forEach(r => {
        map.set(`${r.member_id}:${r.posted_on}`, { title: r.title, content: r.content })
      })
      setSchedule(sched)
      setUpdates(map)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const ctx = progressContext(schedule, updates)
  const execMembers = membersData.filter(m => m.tier === 'executive')

  const targetMonth = addMonths(startOfMonth(now), -monthOffset)
  const week = buildProgressWeek(addDays(startOfWeek(now), -weekOffset * 7), ctx)
  const monthDays = buildMonthDays(targetMonth, ctx)
  const isCurrent = view === 'week' ? weekOffset === 0 : view === 'month' ? monthOffset === 0 : yearOffset === 0
  const periodLabel = view === 'week' ? fmtRange(week) : view === 'month' ? `${MONTH_SHORT[targetMonth.getMonth()]} ${targetMonth.getFullYear()}` : `${now.getFullYear() - yearOffset}`
  const periodTag = view === 'week' ? 'THIS WEEK' : view === 'month' ? 'THIS MONTH' : 'THIS YEAR'

  const goHome = () => {
    window.location.hash = '#weekly-progress'
  }
  const goTop = () => {
    window.location.hash = ''
  }
  const togglePost = (key: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const shownUpdates = (updatesList: ProgressUpdate[]) =>
    personId === 'all' ? updatesList : updatesList.filter(u => u.memberId === personId)

  const navigate = (dir: number) => {
    if (view === 'week') setWeekOffset(o => Math.max(0, Math.min(PROGRESS_WEEKS - 1, o + dir)))
    else if (view === 'month') setMonthOffset(o => Math.max(0, Math.min(13, o + dir)))
    else setYearOffset(o => Math.max(0, Math.min(1, o + dir)))
  }
  const goCurrent = () => {
    if (view === 'week') setWeekOffset(0)
    else if (view === 'month') setMonthOffset(0)
    else setYearOffset(0)
  }

  const canPrev = view === 'week' ? weekOffset < PROGRESS_WEEKS - 1 : view === 'month' ? monthOffset < 13 : yearOffset < 1
  const canNext = view === 'week' ? weekOffset > 0 : view === 'month' ? monthOffset > 0 : yearOffset > 0

  const renderPost = (u: ProgressUpdate, d: ProgressDay) => {
    const member = getMember(u.memberId)
    if (!member) return null
    const postKey = `${d.date.getTime()}-${u.memberId}`
    const postOpen = expandedPosts.has(postKey)
    const isLong = u.posted && u.content.length > 170
    return (
      <div className={`update-post${u.posted ? '' : ' pending'}`} key={u.memberId}>
        <span className="progress-avatar">
          {member.photo ? <img src={member.photo} alt={member.name} /> : <span>{getInitials(member.name)}</span>}
        </span>
        <div className="update-post-body">
          <div className="update-post-top">
            <span className="update-post-name">{member.name}</span>
            <span className={`status-badge${u.posted ? '' : ' pending'}`}>{u.posted ? 'Posted' : 'Pending'}</span>
          </div>
          <p className="update-post-title">{u.title}</p>
          <p className={`update-post-text${postOpen ? ' open' : ''}`}>{u.content}</p>
          {isLong && (
            <button className={`update-post-toggle${postOpen ? ' open' : ''}`} onClick={() => togglePost(postKey)}>
              <span>{postOpen ? 'Show less' : 'Show more'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderDay = (d: ProgressDay) => {
    const shown = shownUpdates(d.updates)
    if (shown.length === 0) return null
    const isToday = d.date.getTime() === now.getTime()
    return (
      <div className={`update-day${isToday ? ' today' : ''}`} key={d.date.getTime()}>
        <div className="update-day-head">
          <span className="update-day-label">{DAY_LABELS[d.day]}</span>
          <span className="update-day-date">{fmtDayLong(d.date)}</span>
        </div>
        {shown.map(u => renderPost(u, d))}
      </div>
    )
  }

  const shownCount = (days: ProgressDay[]) => days.flatMap(d => shownUpdates(d.updates))

  const yearMonths = (() => {
    const y = now.getFullYear() - yearOffset
    const out: { month: number; updates: number; members: number }[] = []
    for (let m = 0; m < 12; m++) {
      const days = buildMonthDays(new Date(y, m, 1), ctx)
      if (days.length === 0) continue
      const shown = days.flatMap(d => shownUpdates(d.updates))
      out.push({
        month: m,
        updates: shown.length,
        members: personId === 'all' ? new Set(shown.map(u => u.memberId)).size : shown.length ? 1 : 0,
      })
    }
    return out
  })()

  const jumpToMonth = (m: number) => {
    const y = now.getFullYear() - yearOffset
    const target = y * 12 + m
    const current = now.getFullYear() * 12 + now.getMonth()
    setMonthOffset(Math.max(0, current - target))
    setView('month')
  }

  return (
    <div className="updates-page">
      <header className="updates-topbar">
        <div className="container">
          <a href="#" className="nav-logo" onClick={goTop}>
            <img src="/logo.png" alt="Tech Crew Logo" />
            <span>TECH CREW</span>
          </a>
          <button className="updates-back" onClick={goHome}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
            Back to Home
          </button>
        </div>
      </header>

      <main className="container updates-main">
        <div className="section-header">
          <span className="section-tag">WEEKLY PROGRESS</span>
          <h1 className="section-title">
            Updates &amp; <span className="gradient-text">History</span>
          </h1>
          <p className="section-subtitle">
            Every executive member posts a small win each week. Browse by week, month or year — or filter a single member.
          </p>
        </div>

        {loading && (
          <div className="progress-state">
            <div className="progress-spinner" />
            <p>Loading updates from the database…</p>
          </div>
        )}

        {error && (
          <div className="progress-state">
            <p>{isSupabaseConfigured ? error : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.'}</p>
            <button className="btn btn-glass" onClick={loadData}>
              <span>Retry</span>
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="updates-filter">
              <div className="filter-row">
                <div className="filter-tabs">
                  {(['week', 'month', 'year'] as const).map(v => (
                    <button key={v} className={`filter-tab${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
                      {v === 'week' ? 'Week' : v === 'month' ? 'Month' : 'Year'}
                    </button>
                  ))}
                </div>
                <label className="filter-person">
                  <span className="filter-person-label">Member</span>
                  <select
                    value={personId}
                    onChange={e => setPersonId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  >
                    <option value="all">All members</option>
                    {execMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="period-nav">
                <button className="period-btn" onClick={() => navigate(1)} disabled={!canPrev} aria-label="Previous period">‹</button>
                <div className="period-label">
                  {isCurrent && <span className="period-tag">{periodTag}</span>}
                  <span className="period-text">{periodLabel}</span>
                </div>
                <button className="period-btn" onClick={() => navigate(-1)} disabled={!canNext} aria-label="Next period">›</button>
                <button className="period-now" onClick={goCurrent}>Now</button>
              </div>
            </div>

            <div className="updates-list">
              {view === 'week' && (
                <div className="update-week open">
                  <div className="update-week-head">
                    <div className="update-week-title">
                      <span className={`update-week-tag${weekOffset === 0 ? ' current' : ''}`}>{weekOffset === 0 ? 'THIS WEEK' : 'PAST WEEK'}</span>
                      <span className="update-week-range">{fmtRange(week)}</span>
                    </div>
                    <span className="update-week-meta">{shownCount(week.days).filter(u => u.posted).length} of {shownCount(week.days).length} updates</span>
                  </div>
                  <div className="update-week-body">
                    {week.days.map(renderDay)}
                  </div>
                </div>
              )}

              {view === 'month' && (
                <div className="update-week open">
                  <div className="update-week-head">
                    <div className="update-week-title">
                      <span className={`update-week-tag${monthOffset === 0 ? ' current' : ''}`}>{monthOffset === 0 ? 'THIS MONTH' : 'PAST MONTH'}</span>
                      <span className="update-week-range">{periodLabel}</span>
                    </div>
                    <span className="update-week-meta">{shownCount(monthDays).filter(u => u.posted).length} of {shownCount(monthDays).length} updates</span>
                  </div>
                  <div className="update-week-body">
                    {monthDays.map(renderDay)}
                  </div>
                </div>
              )}

              {view === 'year' && (
                <div className="year-grid">
                  {yearMonths.map(({ month, updates: monthUpdates, members: monthMembers }) => (
                    <button className="month-card" key={month} onClick={() => jumpToMonth(month)}>
                      <span className="month-card-name">{MONTH_SHORT[month]} {now.getFullYear() - yearOffset}</span>
                      <span className="month-card-meta">
                        {monthUpdates} {monthUpdates === 1 ? 'update' : 'updates'} · {monthMembers} {monthMembers === 1 ? 'member' : 'members'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
/* ===== EVENTS SECTION ===== */
function Events() {
  const eventTypesList = [
    { title: 'Workshops', desc: 'Hands-on sessions to learn modern frameworks and tools.', icon: Icons.Workshops },
    { title: 'Hackathons', desc: 'Code. Innovate. Compete. Build solutions overnight.', icon: Icons.Hackathons },
    { title: 'Seminars', desc: 'Learn directly from industry leaders and experts.', icon: Icons.Seminars },
    { title: 'Tech Meets', desc: 'Connect, collaborate and expand your network.', icon: Icons.TechMeets },
  ]

  return (
    <section className="events reveal" id="events">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">ACTIVITIES</span>
          <h2 className="section-title">What We Do</h2>
        </div>
        <div className="events-grid">
          {eventTypesList.map((et, i) => {
            const IconComp = et.icon
            return (
              <div className="event-type-card-glass" key={i}>
                <div className="event-type-glow" />
                <div className="event-type-icon-wrap">
                  <IconComp />
                </div>
                <h4>{et.title}</h4>
                <p>{et.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ===== FEEDBACK ===== */
function Feedback() {
  return (
    <section className="feedback reveal" id="feedback">
      <div className="container">
        <div className="feedback-glass">
          <div className="feedback-glow" />
          <div className="feedback-content">
            <div className="feedback-icon-wrap">
              <Icons.Message />
            </div>
            <div>
              <h3>We Value Your Feedback</h3>
              <p>Your feedback helps us improve and organize better events for you.</p>
            </div>
          </div>
          <a href="#" className="btn btn-glow">Share Feedback</a>
        </div>
      </div>
    </section>
  )
}

/* ===== FOOTER ===== */
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="Tech Crew" />
            <span>TECH CREW</span>
          </div>
          <p>Empowering minds through technology and innovation.</p>
          <div className="social-links">
            <a href="https://www.instagram.com/tech_crew_vcet?igsh=b25qazRza3JlaGph" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
            </a>
            <a href="https://www.linkedin.com/company/techcrew-vcet/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" /></svg>
            </a>
            <a href="https://github.com/clubtechcrew/" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21.5c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z" /></svg>
            </a>
          </div>
        </div>
        <div className="footer-links">
          <h4>QUICK LINKS</h4>
          <ul>
            <li><a href="#motto">Motto</a></li>
            <li><a href="#upcoming-event">Events</a></li>
            <li><a href="#tech-blog">Blog</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>EXPLORE</h4>
          <ul>
            <li><a href="#members">Team</a></li>
            <li><a href="#mentorship">Mentorship</a></li>
            <li><a href="#updates">Updates</a></li>
            <li><a href="#events">Activities</a></li>
            <li><a href="#feedback">Feedback</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>CONTACT US</h4>
          <ul>
            <li>✉ techcrew@vcet.ac.in</li>
            <li>📞 +91 98765 43210</li>
            <li>📍 Velammal College of Engineering, Chennai, Tamil Nadu</li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h4>STAY CONNECTED</h4>
          <p>Subscribe for event updates and tech insights.</p>
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" aria-label="Subscribe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Tech Crew · VCET · All rights reserved.</p>
      </div>
    </footer>
  )
}

/* ===== MAIN APP ===== */
function App() {
  const [route, setRoute] = useState<'home' | 'updates'>(() => (window.location.hash === '#updates' ? 'updates' : 'home'))

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash === '#updates' ? 'updates' : 'home')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (route !== 'home') return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [route])

  if (route === 'updates') {
    return <UpdatesPage />
  }

  return (
    <>
      <Navbar />
      <Hero />
      <Motto />
      <UpcomingEvent />
      <TechBlog />
      <About />
      <EvolvedMembersSection />
      <MentorshipSection />
      <WeeklyProgress />
      <Events />
      <Feedback />
      <Footer />
    </>
  )
}

export default App
