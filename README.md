<p align="center">
  <img src="./artwork/logo.png" width="90px"/>
</p>
<h1 align="center">
  Figma → React Native
</h1>
<h3 align="center">
  <a href="https://www.figma.com/community/plugin/821138713091291738">
    Install Plugin
  </a>
</h3>

> Transforms Figma components to React Native components in real time. It also exports themes, icons, assets, and much more. The mission goal is to eliminate the designer to developer handoff while embracing existing workflows and tooling. Join the [Discord Channel](https://discord.com/invite/TzhDRyj) or follow [@TheUltDev](https://x.com/theultdev) to track project development.

## Features

|   |   |
| - | - | 
| ✨ | Realtime code and preview rendering
| 📦 | Batch exporting of components and assets
| 🎨 | Theme generation from local styles and variables
| 🏞 | Images, vectors, and icons support
| 🎲 | Variants and properties support
| 🧱 | Nested components support
| 🧩 | Figma variables support
| 🎮 | Pressables generation
| 🎭 | Conditional rendering
| 📚 | Storybook syncing
| 📖 | JSDoc generation
| 💡 | Dark/light mode

### Roadmap

#### V46 - Polishing & Bug Fixes
- `Interface` Keep Figma component order in list
- `Compiler` Stylegen improvements
- `Compiler` Add remaining EXO primitives
- `Compiler` Fix default color missing for dynamic colors (variants)
- `Compiler` On component/icon/asset delete keep record
- `Compiler` MVP app ui package (runnable w/ storybook)
- `Previewer` Profile extraneous builds
- `Previewer` Goto code and highlight JSX tag when inspect clicked
- `Previewer` Pass bundler error text to interface
- `Editor` Improve intellisense startup time
- `Editor` Type unistyles file (update on theme update)
- `Editor` Highlight JSX tag when node focused
- `Editor` Auto-collapse classes, colors, and stylesheet
- `Editor` Add color provider for theme tokens
- `Editor` Hover over icon name for preview
- `Icons` When importing, add browsing icon sets and prefixes
- `Theme` If no colors found, offer shadcn themes
  - Try to generate dark/light if variables available
  - Fallback to local styles with just light theme

#### V47 — Asset Gallery
- `Assets` Enable new assets page
- `Assets` Add bounding box + title + hover
- `Assets` Add lightbox (yet-another-react-lightbox)
- `Assets` Add drag and drop to figma / others

#### V48 — Saved User Edits
- `Compiler` Compare user changes to last build
- `Interface` Show modified state in list + component views
- `Editor` Show modified lines in gutter (like git)
- `Editor` Show selected node in gutter

#### V49 — Collaboration
- `YJS` Setup websocket provider (y-sweet)
- `Editor` Awareness cursors selections
- `Preview` Show cursors and inspects
- `Interface` Show color dots in component list
- `Storybook` Update syncing api to match plugin

#### V50 — Services

##### GPT-4 Vision
- `Service` Verify output and fine-tune prompt
- `Interface` Send component code + preview image to api
- `Interface` Update component code Y.JS value if accepted

##### GitHub Release
- `Service` Process files and create pull request

##### Redux Sync
- `Service` Sync Redux store -> Figma Variables via Figma REST API
- `Compiler` Generate usage similar to useState implementation
- `Compiler` Use saved variables plugin data to get redux store code for previews + builds

##### Icon Service
- `Service` Provide hosted Iconify source
- `Service` Import SVGs from Figma to Iconify set via Figma REST API

