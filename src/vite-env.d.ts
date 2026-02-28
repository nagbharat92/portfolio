/// <reference types="vite/client" />

declare module 'virtual:content-pages' {
  import type { SidebarNode } from '@/data/pages'
  export const contentTree: SidebarNode[]
}
