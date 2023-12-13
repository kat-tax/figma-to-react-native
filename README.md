<p align="center">
  <img src="./art/logo.png" width="90px"/>
</p>
<h1 align="center">
  Figma → React Native
</h1>
<h3 align="center">
  <a href="https://www.figma.com/community/plugin/821138713091291738">
    Install Plugin
  </a>
</h3>

> Transforms Figma to React Native in real time. The mission goal is to eliminate the designer to developer handoff while embracing existing workflows and tooling. Join the [Discord](https://discord.com/invite/TzhDRyj) or follow [@TheUltDev](https://x.com/theultdev) to track the project.

## Features

|   |   |
| - | - | 
| ✨ | Realtime code and preview rendering
| 📦 | Batch exporting of components and assets
| 🎨 | Theme generation from local styles and variables
| ⭐️ | AutoLayout to Flexbox translation
| 🎲 | Variants and properties support
| 🧱 | Nested components support
| 🏞 | Images and vectors support
| 🧩 | Figma variables support
| 🎮 | Pressables generation
| 🎭 | Conditional rendering
| 📚 | Storybook syncing
| 📖 | JSDoc generation
| 💡 | Dark/light mode

### Roadmap

#### V46 - Polishing & Bug Fixes
- `Interface` Keep Figma component order in list
- `Compiler` Fix default color (regressed)
- `Compiler` Add remaining EXO primitives
- `Compiler` On component/icon/asset delete keep record, merge last build with new
- `Compiler` MVP app ui package (runnable w/ storybook)
- `Compiler` Stylegen improvements
- `Previewer` Profile extraneous builds
- `Previewer` Pass bundler error text to interface
- `Previewer` Render selected variant (don't recompile, update tag)
- `Previewer` Goto code and highlight JSX tag when inspect clicked
- `Monaco` Highlight JSX tag when node focused
- `Monaco` Type unistyles file (update on theme update)
- `Monaco` Improve intellisense startup time
- `Monaco` Auto-collapse classes, colors, and stylesheet
- `Monaco` Add color provider for theme tokens
- `Monaco` Hover over icon name for preview
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
- `Monaco` Show modified lines in gutter (like git)
- `Monaco` Show selected node in gutter

#### V49 — Collaboration
- `YJS` Setup websocket provider (y-sweet)
- `Monaco` Awareness cursors selections
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

