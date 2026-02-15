import { motion } from 'framer-motion'

function Home() {
  return (
    <motion.main
      className="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h1>Hello, I'm <span className="highlight">Bharat</span>.</h1>
      <p className="subtitle">
        Welcome to my corner of the internet. This site is a work in progress.
      </p>
      <div className="links">
        <a href="https://github.com/bharatnag" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </motion.main>
  )
}

export default Home
