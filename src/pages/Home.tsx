import { Button } from '@/components/ui/button'

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Hello, I'm Bharat.
      </h1>
      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        Welcome to my corner of the internet. This site is a work in progress.
      </p>
      <Button variant="outline" asChild>
        <a href="https://github.com/nagbharat92" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </Button>
    </main>
  )
}

export default Home
