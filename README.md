# Nexus

Nexus is a modular desktop utility hub designed to bring developer tools, application launching, network diagnostics, proxy management, and project continuity into one unified, modern Windows desktop experience.

## Architecture

- **Desktop Framework**: Tauri 2 (Rust)
- **Frontend**: React 19 + TypeScript (Strict Mode)
- **Build Tool**: Vite
- **Styling**: Centralized CSS Design Tokens
- **Visual Effects**: CSS + WebGL hybrid Liquid Glass system
- **Target Platform**: Windows 10 and Windows 11

### Folder Structure

```
nexus/
├── public/
│   ├── assets/
│   │   ├── background.png      # Atmospheric background asset
│   │   └── reference.png       # Figma reference render
│   └── screenshot-1440x900.png # Baseline capture
├── src/
│   ├── app/
│   │   └── App.tsx             # Root React component
│   ├── assets/
│   │   └── background.png
│   ├── components/
│   │   ├── buttons/
│   │   │   ├── GlassButton.tsx
│   │   │   └── GlassButton.css
│   │   ├── cards/
│   │   │   ├── GlassCard.tsx
│   │   │   └── GlassCard.css
│   │   ├── glass/
│   │   │   ├── LiquidGlassPanel.tsx  # CSS Liquid Glass component
│   │   │   ├── LiquidGlassCanvas.tsx # WebGL optical refraction layer
│   │   │   └── LiquidGlass.css
│   │   ├── icons/
│   │   │   └── index.tsx       # Exact Figma SVG vector icons
│   │   ├── layout/
│   │   │   ├── TopBar.tsx      # Top app bar (Search, Nexus, Reminder, Profile)
│   │   │   └── TopBar.css
│   │   └── navigation/
│   │       ├── BottomNav.tsx   # Reusable 6-item bottom navigation bar
│   │       └── BottomNav.css
│   ├── hooks/
│   │   └── useTauri.ts         # React hooks for system & app info
│   ├── modules/
│   │   ├── types.ts            # Modular hub definitions
│   │   └── index.ts
│   ├── pages/
│   │   └── Home/
│   │       ├── HomePage.tsx    # Home dashboard implementation
│   │       └── HomePage.css
│   ├── services/
│   │   ├── tauri.ts            # Typed Tauri IPC commands & web fallbacks
│   │   └── index.ts
│   ├── styles/
│   │   ├── tokens.css          # CSS Custom Properties for design system
│   │   ├── design-tokens.ts    # TypeScript token bindings
│   │   └── global.css          # Reset and global theme styles
│   ├── main.tsx                # Frontend entrypoint
│   └── vite-env.d.ts
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── app.rs          # Typed Tauri IPC command handlers
│   │   │   └── mod.rs
│   │   ├── storage/
│   │   │   └── mod.rs          # App state & storage architecture
│   │   ├── lib.rs              # Tauri builder & command registrations
│   │   └── main.rs             # Windows entrypoint
│   ├── build.rs
│   ├── Cargo.toml              # Rust crate manifest
│   └── tauri.conf.json         # Tauri 2 configuration
├── scripts/
│   └── capture-screenshot.mjs  # Headless 1440x900 pixel-fidelity capture
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm / pnpm / yarn
- Rust toolchain (`rustup`, `cargo`) for desktop builds
- WebView2 (preinstalled on Windows 10/11)

### Development

To start the Vite frontend development server:

```bash
npm run dev
```

To run the complete Tauri desktop application:

```bash
npm run tauri dev
```

### Production Build

To verify and build the frontend:

```bash
npm run build
```

To build the Windows desktop binary:

```bash
npm run tauri build
```
