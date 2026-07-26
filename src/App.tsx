import { useState, useEffect } from 'react'

/* ===== ICON COMPONENTS ===== */
const PlaceholderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 16l5-5 4 4 4-6 5 7"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
  </svg>
)

/* ===== NAVBAR ===== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('motto')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const sections = ['motto', 'upcoming-event', 'tech-blog', 'about', 'members', 'events', 'feedback']
      for (const id of sections.reverse()) {
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
    { id: 'upcoming-event', label: 'Upcoming Event' },
    { id: 'tech-blog', label: 'Tech Blog' },
    { id: 'about', label: 'About Us' },
    { id: 'members', label: 'Members' },
    { id: 'events', label: 'Events' },
    { id: 'feedback', label: 'Feedback' },
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

/* ===== HERO ===== */
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-pattern" />
      <div className="container hero-grid">
        <div className="hero-content">
          <p className="hero-sub">WELCOME TO</p>
          <h1 className="hero-title">TECH CREW</h1>
          <p className="hero-tagline">Innovate &nbsp;·&nbsp; Learn &nbsp;·&nbsp; Build &nbsp;·&nbsp; Grow</p>
          <div className="hero-buttons">
            <a href="#feedback" className="btn btn-primary">Join Us <span className="arrow">→</span></a>
            <a href="#events" className="btn btn-outline">Explore Events <span className="arrow">→</span></a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="placeholder-box hero-placeholder">
            <PlaceholderIcon />
            <span>Hero Illustration</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== MOTTO ===== */
function Motto() {
  return (
    <section className="motto reveal" id="motto">
      <div className="container">
        <h2 className="section-label">OUR MOTTO</h2>
        <div className="motto-content">
          <div className="motto-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21h6m-3-3v3m-4-9a4 4 0 118 0c0 1.5-.8 2.5-2 3.5-.4.3-.7.7-.9 1.1a.5.5 0 01-.45.4h-1.3a.5.5 0 01-.45-.4c-.2-.4-.5-.8-.9-1.1C10.8 14.5 10 13.5 10 12z"/>
            </svg>
          </div>
          <div className="motto-text">
            <h3>Learn. Build. Innovate. Lead the Future.</h3>
            <p>Empowering Ideas. Creating Impact.</p>
          </div>
          <div className="motto-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== UPCOMING EVENT ===== */
const eventsData = [
  {
    title: 'Tech Innovation Summit 2025',
    desc: 'An exciting event filled with insightful sessions, workshops and networking opportunities.',
    date: '📅 24 May 2025',
    time: '🕙 10:00 AM',
    venue: '📍 Seminar Hall',
  },
  {
    title: 'Web Development Bootcamp',
    desc: 'A hands-on bootcamp covering modern web technologies from React to Node.js.',
    date: '📅 15 Jun 2025',
    time: '🕙 9:00 AM',
    venue: '📍 Lab 3',
  },
  {
    title: 'AI/ML Workshop Series',
    desc: 'Dive deep into machine learning fundamentals with practical projects and mentorship.',
    date: '📅 10 Jul 2025',
    time: '🕙 2:00 PM',
    venue: '📍 Auditorium',
  },
]

function UpcomingEvent() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((current + 1) % eventsData.length)
  const prev = () => setCurrent((current - 1 + eventsData.length) % eventsData.length)

  const event = eventsData[current]

  return (
    <section className="upcoming-event reveal" id="upcoming-event">
      <div className="container">
        <h2 className="section-label">UPCOMING EVENT</h2>
        <div className="event-carousel">
          <div className="event-card-main">
            <div className="placeholder-box event-img-placeholder">
              <PlaceholderIcon />
            </div>
            <div className="event-card-info">
              <h3>{event.title}</h3>
              <p>{event.desc}</p>
              <div className="event-meta">
                <span>{event.date}</span>
                <span>{event.time}</span>
                <span>{event.venue}</span>
              </div>
              <a href="#" className="btn btn-primary btn-sm">Know More</a>
            </div>
            <div className="event-nav">
              <button className="carousel-arrow" onClick={prev} aria-label="Previous">‹</button>
              <button className="carousel-arrow" onClick={next} aria-label="Next">›</button>
            </div>
          </div>
          <div className="carousel-dots">
            {eventsData.map((_, i) => (
              <span
                key={i}
                className={`dot${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== TECH BLOG ===== */
const blogPosts = [
  { tag: 'AI / ML', title: 'The Future of AI: Trends to Watch', desc: 'Explore the emerging trends and innovations shaping the future of artificial intelligence.' },
  { tag: 'WEB DEV', title: 'Building Responsive Websites in 2025', desc: 'A complete guide to modern techniques for building fast and responsive websites.' },
  { tag: 'TECH INSIGHTS', title: 'Cloud Computing Explained', desc: 'Understand the basics, benefits and future of cloud computing in simple terms.' },
]

function TechBlog() {
  return (
    <section className="tech-blog reveal" id="tech-blog">
      <div className="container">
        <h2 className="section-label">TECH BLOG</h2>
        <div className="blog-grid">
          {blogPosts.map((post, i) => (
            <article className="blog-card" key={i}>
              <div className="placeholder-box blog-img-placeholder">
                <PlaceholderIcon />
              </div>
              <div className="blog-body">
                <span className="blog-tag">{post.tag}</span>
                <h4>{post.title}</h4>
                <p>{post.desc}</p>
                <a href="#" className="read-more">Read More →</a>
              </div>
            </article>
          ))}
        </div>
        <div className="center">
          <a href="#" className="btn btn-outline">View All Blogs →</a>
        </div>
      </div>
    </section>
  )
}

/* ===== ABOUT US ===== */
function About() {
  return (
    <section className="about reveal" id="about">
      <div className="container about-grid">
        <div className="about-text">
          <h2 className="section-label left">ABOUT US</h2>
          <p>
            Tech Crew is a student-driven technical club focused on learning, innovation and real-world skills.
            We create opportunities to explore technology, share knowledge and build solutions together.
          </p>
          <div className="about-pillars">
            <div className="pillar">
              <div className="pillar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/>
                  <path d="M3 21v-2a4 4 0 014-4h2m6 0h2a4 4 0 014 4v2"/>
                </svg>
              </div>
              <h5>Collaborate</h5>
              <p>We work together to achieve more.</p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21h6m-3-3v3m-4-9a4 4 0 118 0c0 1.5-.8 2.5-2 3.5-.4.3-.7.7-.9 1.1a.5.5 0 01-.45.4h-1.3a.5.5 0 01-.45-.4c-.2-.4-.5-.8-.9-1.1C10.8 14.5 10 13.5 10 12z"/>
                </svg>
              </div>
              <h5>Innovate</h5>
              <p>We turn ideas into impactful solutions.</p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l2.09 6.26L20 9.27l-5 3.87L16.18 20 12 16.77 7.82 20 9 13.14 4 9.27l5.91-1.01z"/>
                </svg>
              </div>
              <h5>Inspire</h5>
              <p>We inspire and grow together as one.</p>
            </div>
          </div>
        </div>
        <div className="about-visual">
          <div className="placeholder-box about-placeholder">
            <PlaceholderIcon />
            <span>About Image</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== MEMBERS ===== */
function Members() {
  return (
    <section className="members reveal" id="members">
      <div className="container">
        <h2 className="section-label">MEMBERS</h2>
        <div className="members-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="members-icon">
            <circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/>
            <path d="M3 21v-2a4 4 0 014-4h2m6 0h2a4 4 0 014 4v2"/>
          </svg>
          <p>Members section coming soon!</p>
        </div>
      </div>
    </section>
  )
}

/* ===== EVENTS ===== */
const eventTypes = [
  {
    title: 'Workshops',
    desc: 'Hands-on sessions to learn and build.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
      </svg>
    ),
  },
  {
    title: 'Hackathons',
    desc: 'Code. Innovate. Compete. Win.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>
      </svg>
    ),
  },
  {
    title: 'Seminars',
    desc: 'Learn from experts and industry leaders.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
  {
    title: 'Tech Meets',
    desc: 'Connect, collaborate and create together.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/>
        <path d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2"/>
      </svg>
    ),
  },
]

function Events() {
  return (
    <section className="events reveal" id="events">
      <div className="container">
        <h2 className="section-label">EVENTS</h2>
        <div className="events-grid">
          {eventTypes.map((et, i) => (
            <div className="event-type-card" key={i}>
              <div className="event-type-icon">{et.icon}</div>
              <h4>{et.title}</h4>
              <p>{et.desc}</p>
              <a href="#" className="read-more">Explore →</a>
            </div>
          ))}
        </div>
        <div className="center">
          <a href="#" className="btn btn-outline">View All Events →</a>
        </div>
      </div>
    </section>
  )
}

/* ===== FEEDBACK ===== */
function Feedback() {
  return (
    <section className="feedback reveal" id="feedback">
      <div className="container feedback-bar">
        <div className="feedback-left">
          <div className="feedback-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div>
            <h3>We Value Your Feedback</h3>
            <p>Your feedback helps us improve and organize better events for you.</p>
          </div>
        </div>
        <a href="#" className="btn btn-primary">Share Your Feedback</a>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/techcrew-vcet/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </a>
            <a href="https://github.com/clubtechcrew/" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21.5c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-links">
          <h4>QUICK LINKS</h4>
          <ul>
            <li><a href="#motto">Motto</a></li>
            <li><a href="#upcoming-event">Upcoming Event</a></li>
            <li><a href="#tech-blog">Tech Blog</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>QUICK LINKS</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#members">Members</a></li>
            <li><a href="#events">Events</a></li>
            <li><a href="#feedback">Feedback</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>CONTACT US</h4>
          <ul>
            <li>✉ techcrew@abccollege.edu.in</li>
            <li>📞 +91 98765 43210</li>
            <li>📍 ABC College of Engineering, Main Road, City - 641001, Tamil Nadu, India.</li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h4>STAY CONNECTED</h4>
          <p>Subscribe to get updates about our events and blog.</p>
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" aria-label="Subscribe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Tech Crew. All rights reserved.</p>
      </div>
    </footer>
  )
}

/* ===== MAIN APP ===== */
function App() {
  useEffect(() => {
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

    const elements = document.querySelectorAll('.reveal')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <Hero />
      <Motto />
      <UpcomingEvent />
      <TechBlog />
      <About />
      <Members />
      <Events />
      <Feedback />
      <Footer />
    </>
  )
}

export default App
