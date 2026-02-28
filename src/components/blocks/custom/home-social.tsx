import { FadeInUp } from "@/components/ui/fade-in-up"

interface HomeSocialProps {
  index: number
  props?: Record<string, unknown>
}

const SOCIAL_LINKS = [
  { label: "@bharatnag92", href: "https://x.com/bharatnag92" },
  { label: "GitHub",       href: "https://github.com/nagbharat92" },
  { label: "LinkedIn",     href: "https://www.linkedin.com/in/bharatnag/" },
  { label: "Email",        href: "mailto:nagbharat92@gmail.com" },
]

export function HomeSocial({ index }: HomeSocialProps) {
  return (
    <FadeInUp i={index} className="flex flex-wrap gap-x-(--social-gap-x) gap-y-(--social-gap-y)">
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          {link.label}
        </a>
      ))}
    </FadeInUp>
  )
}
