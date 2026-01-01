import { useEffect } from 'react'
import Hyperspeed from './components/Hyperspeed'
import Lightning from './components/Lightning'
import ShinyText from './components/ShinyText'
import './App.css'

function App() {
  useEffect(() => {
    // Simple fade-in animations without GSAP dependency
    const animateElements = () => {
      const overlay = document.querySelector('.overlay')
      const greetingText = document.querySelector('.greeting-text')
      const heroName = document.querySelector('.hero-name-left')
      const heroRole = document.querySelector('.hero-role-left')
      const heroStatement = document.querySelector('.hero-statement-left')

      // Use requestAnimationFrame for smoother animations
      requestAnimationFrame(() => {
        setTimeout(() => overlay?.classList.add('fade-in'), 50)
        setTimeout(() => greetingText?.classList.add('slide-in'), 200)
        setTimeout(() => heroName?.classList.add('slide-in'), 350)
        setTimeout(() => heroRole?.classList.add('slide-in'), 500)
        setTimeout(() => heroStatement?.classList.add('slide-in'), 650)
      })
    }

    animateElements()

    // Scroll-based reveal for lightning mega section
    const megaSection = document.querySelector('.ballpit-mega-section')
    
    // IntersectionObserver for sections
    const reveals = document.querySelectorAll('.reveal')
    const obsOptions = { 
      root: null, 
      rootMargin: '0px 0px -80px 0px', 
      threshold: 0.1 
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Use requestAnimationFrame for smoother transitions
          requestAnimationFrame(() => {
            entry.target.classList.add('active')
          })
        }
      })
    }, obsOptions)

    // Observe mega section separately with different threshold
    const megaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('reveal-active')
          })
        }
      })
    }, { 
      root: null, 
      rootMargin: '0px 0px -150px 0px', 
      threshold: 0.05 
    })

    if (megaSection) {
      megaObserver.observe(megaSection)
    }

    reveals.forEach(r => observer.observe(r))

    return () => {
      if (megaSection) megaObserver.disconnect()
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <header className="hero">
        <Hyperspeed />
        <div className="overlay" aria-hidden="true"></div>

        <div className="hero-content-left">
          <div className="greeting-section">
            <div className="greeting-text">
              <span className="hi-text"><ShinyText text="Hi" speed={3} color="#ffffff" shineColor="#a78bfa" /></span>
              <span className="wave-emoji">👋</span>
            </div>
            <h1 className="hero-name-left">
              <ShinyText text="I'm Ruthvik Reddy" speed={4} color="#ffffff" shineColor="#c084fc" spread={90} />
            </h1>
            <p className="hero-role-left">
              <ShinyText text="A Professional Full Stack Developer" speed={3.5} color="#c084fc" shineColor="#ffffff" delay={0.5} />
            </p>
            <p className="hero-statement-left">
              <ShinyText text="Building modern, scalable web applications with clean code and innovative solutions." speed={5} color="#bfc1c4" shineColor="#ffffff" delay={1} />
            </p>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
        </div>
      </header>

      <main>
        <section className="ballpit-mega-section">
          <div className="ballpit-container">
            <Lightning hue={270} xOffset={0} speed={0.5} intensity={1.2} size={1} />
          </div>
          
          <div className="ballpit-content">
            <div id="about" className="section reveal">
              <div className="container">
                <h2><ShinyText text="About Me" speed={3} color="#ffffff" shineColor="#a78bfa" /></h2>
                <p><ShinyText text="I'm a Full-Stack Web Developer with hands-on experience building responsive frontends and scalable backend systems using modern technologies. I enjoy turning ideas into production-ready web applications." speed={6} color="#bfc1c4" shineColor="#ffffff" /></p>
              </div>
            </div>

            <div id="skills" className="section reveal">
              <div className="container">
                <h2><ShinyText text="Skills" speed={3} color="#ffffff" shineColor="#a78bfa" /></h2>
                <div className="skills-grid">
                  <div className="skill-group">
                    <h3><ShinyText text="Frontend" speed={2.5} color="#ffffff" shineColor="#c084fc" /></h3>
                    <p><ShinyText text="HTML, CSS, JavaScript, React, Next.js, Tailwind CSS, UI/UX Design" speed={4} color="#bfc1c4" shineColor="#ffffff" /></p>
                  </div>
                  <div className="skill-group">
                    <h3><ShinyText text="Backend" speed={2.5} color="#ffffff" shineColor="#c084fc" /></h3>
                    <p><ShinyText text="Node.js, Express.js, REST APIs, Supabase (SQL), MySQL, OAuth" speed={4} color="#bfc1c4" shineColor="#ffffff" /></p>
                  </div>
                  <div className="skill-group">
                    <h3><ShinyText text="Tools" speed={2.5} color="#ffffff" shineColor="#c084fc" /></h3>
                    <p><ShinyText text="Git, GitHub, VS Code, Netlify, Vercel, Figma" speed={4} color="#bfc1c4" shineColor="#ffffff" /></p>
                  </div>
                  <div className="skill-group">
                    <h3><ShinyText text="Advanced" speed={2.5} color="#ffffff" shineColor="#c084fc" /></h3>
                    <p><ShinyText text="Prompt Engineering, NLP, Generative AI, AIML" speed={4} color="#bfc1c4" shineColor="#ffffff" /></p>
                  </div>
                </div>
              </div>
            </div>

            <div id="projects" className="section reveal">
              <div className="container">
                <h2><ShinyText text="Featured Project" speed={3} color="#ffffff" shineColor="#a78bfa" /></h2>

                <article className="project-card">
                  <div className="project-media" aria-hidden="true"></div>
                  <div className="project-body">
                    <h3><ShinyText text="PrimeFlex" speed={2.5} color="#ffffff" shineColor="#c084fc" /></h3>
                    <p className="project-desc"><ShinyText text="A full-stack fitness web application built end-to-end with real-world architecture, secure authentication, and scalable backend APIs." speed={5} color="#bfc1c4" shineColor="#ffffff" /></p>
                    <p className="project-tech"><strong>Tech:</strong> <ShinyText text="React, Next.js, Node.js, Express.js, Supabase, MySQL, OAuth, Tailwind CSS" speed={4} color="#bfc1c4" shineColor="#ffffff" /></p>
                    <p className="project-status"><ShinyText text="🚀 Currently working on bringing this to market as a real-time startup" speed={4} color="#c084fc" shineColor="#ffffff" /></p>
                  </div>
                </article>

              </div>
            </div>

            <div id="experience" className="section reveal">
              <div className="container">
                <h2><ShinyText text="Experience" speed={3} color="#ffffff" shineColor="#a78bfa" /></h2>
                <div className="experience-item">
                  <h3><ShinyText text="Web Developer — Self-Employed (Virtual)" speed={3} color="#ffffff" shineColor="#c084fc" /></h3>
                  <span className="muted"><ShinyText text="July 2025 – Present" speed={2.5} color="#bfc1c4" shineColor="#ffffff" /></span>
                  <ul>
                    <li><ShinyText text="Built responsive, user-friendly websites" speed={3} color="#bfc1c4" shineColor="#ffffff" /></li>
                    <li><ShinyText text="Optimized performance and accessibility" speed={3} color="#bfc1c4" shineColor="#ffffff" /></li>
                    <li><ShinyText text="Conducted testing and debugging" speed={3} color="#bfc1c4" shineColor="#ffffff" /></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section reveal">
          <div className="container">
            <h2><ShinyText text="Get In Touch" speed={3} color="#ffffff" shineColor="#a78bfa" /></h2>
            <p><ShinyText text="Interested in working together or discussing opportunities? Feel free to reach out." speed={4} color="#bfc1c4" shineColor="#ffffff" /></p>
            <p><ShinyText text="I specialize in building fully functional, production-ready websites with complete full-stack solutions tailored to your business needs." speed={4.5} color="#c084fc" shineColor="#ffffff" /></p>
            <p className="contact-details">
              <strong>Email:</strong> <a href="mailto:k.sairuthvikreddy880@gmail.com"><ShinyText text="k.sairuthvikreddy880@gmail.com" speed={3} color="#ffffff" shineColor="#c084fc" /></a>
            </p>
            <p className="contact-details">
              <strong>Phone:</strong> <a href="tel:+919100605066"><ShinyText text="+91 9100605066" speed={2.5} color="#ffffff" shineColor="#c084fc" /></a> &nbsp; • &nbsp; 
              <strong>Location:</strong> <ShinyText text="Hyderabad, India" speed={2.5} color="#bfc1c4" shineColor="#ffffff" />
            </p>
            <a 
              href="mailto:k.sairuthvikreddy880@gmail.com?subject=Let's%20Work%20Together&body=Hi%20Ruthvik,%0D%0A%0D%0AI%20came%20across%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20potential%20opportunity.%0D%0A%0D%0A" 
              className="btn btn-primary"
            >
              <ShinyText text="Contact Me" speed={2} color="#ffffff" shineColor="#ffd700" />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container"><ShinyText text="© Sai Ruthvik — Full-Stack Web Developer" speed={4} color="#bfc1c4" shineColor="#ffffff" /></div>
      </footer>
    </>
  )
}

export default App
