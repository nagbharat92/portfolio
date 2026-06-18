import { useRef, useCallback, useState } from "react"
import { House } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { FolderTree, useFolderTree } from "@/components/folder-tree"

const EMAIL = "nagbharat92@gmail.com"
const linkClasses = "font-bold text-sidebar-foreground underline-offset-4 hover:underline inline-flex items-baseline gap-1"

export function AppSidebar({ setDark }: { setDark: (fn: (d: boolean) => boolean) => void }) {
  const { select } = useFolderTree()
  const labelRef = useRef<HTMLSpanElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [busy, setBusy] = useState(false)

  const handleCopy = useCallback(async () => {
    const label = labelRef.current
    const btn = btnRef.current
    if (!label || !btn || busy) return
    setBusy(true)

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = EMAIL
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      ta.remove()
    }

    // Remove underline hover during animation
    btn.dataset.animating = "true"

    // Phase 1: erase "email me"
    label.className = "typewriter-text typing-out"

    label.addEventListener("animationend", function onErased() {
      label.removeEventListener("animationend", onErased)

      // Phase 2: type "email copied!"
      label.textContent = "email copied!"
      btn.classList.add("pointer-events-none", "cursor-default")
      label.className = "typewriter-text typing-in"

      label.addEventListener("animationend", function onTyped() {
        label.removeEventListener("animationend", onTyped)
        label.className = "typewriter-text idle"

        // Phase 3: hold, then erase and restore
        setTimeout(() => {
          label.className = "typewriter-text typing-out"

          label.addEventListener("animationend", function onErased2() {
            label.removeEventListener("animationend", onErased2)

            label.textContent = "email me"
            label.className = "typewriter-text typing-in"

            label.addEventListener("animationend", function onRestored() {
              label.removeEventListener("animationend", onRestored)
              label.className = "typewriter-text idle"
              btn.classList.remove("pointer-events-none", "cursor-default")
              delete btn.dataset.animating
              setBusy(false)
            })
          })
        }, 1500)
      })
    })
  }, [busy])
  return (
    <Sidebar collapsible="none" variant="floating" className="animate-sidebar-in">
      <SidebarHeader className="p-(--sidebar-content-padding) pb-0">
        <button
          onClick={() => select('home')}
          className="flex w-full items-center gap-(--tree-item-gap) rounded-md px-(--tree-item-px) py-(--tree-item-py) text-sm font-medium text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring cursor-pointer"
        >
          <House className="size-4 shrink-0 text-sidebar-foreground/70" />
          <span>Home</span>
        </button>
      </SidebarHeader>

      <SidebarContent className="p-(--sidebar-content-padding) hide-scrollbar">
        <FolderTree />
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-(--sidebar-footer-padding)">
        <p className="text-sm text-sidebar-foreground/70">
          Find me on{" "}
          <a href="https://x.com/bharatnag92" target="_blank" rel="noopener noreferrer" className={linkClasses}>
            @bharatnag92
          </a>
          , browse my personal projects on{" "}
          <a href="https://github.com/nagbharat92" target="_blank" rel="noopener noreferrer" className={linkClasses}>
            GitHub
          </a>
          , connect on{" "}
          <a href="https://www.linkedin.com/in/bharatnag/" target="_blank" rel="noopener noreferrer" className={linkClasses}>
            LinkedIn
          </a>
          , or{" "}
          <button
            ref={btnRef}
            onClick={handleCopy}
            aria-label="Copy email to clipboard"
            className={`${linkClasses} cursor-pointer`}
          >
            <span className="inline">
              <span ref={labelRef} className="typewriter-text idle">email me</span>
            </span>
          </button>
          .
        </p>
        <p className="text-sm text-sidebar-foreground/70">
          Shift the{" "}
          <button
            onClick={() => setDark((d) => !d)}
            className={`${linkClasses} cursor-pointer`}
          >
            light
          </button>
          {" "}to match your mood.
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
