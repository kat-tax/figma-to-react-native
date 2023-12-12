# ROADMAP

## V46 - Polish
- `Compiler` Fix default color (regressed)
- `Compiler` Add remaining EXO primitives
- `Compiler` On component/icon/asset delete keep record, merge last build with new
- `Compiler` Stylegen improvements
- `Previewer` Fix extraneous builds
- `Previewer` Pass bundler error text to interface
- `Previewer` Render selected variant (don't recompile, update tag)
- `Monaco` Type theme file (update on theme update)
- `Monaco` Improve intellisense startup time
- `Monaco` Auto-collapse classes, colors, and stylesheet
- `Monaco` Add color provider for theme tokens
- `Monaco` Hover over icon name for preview

## V47 — User Edits
- `Compiler` MVP app ui package (runnable w/ storybook)
- `Compiler` Compare user changes to last build
- `Interface` Show modified state in list + component views
- `Monaco` Show modified lines in gutter (like git)
- `Monaco` Show selected node in gutter

## V48 — Collaboration
- `YJS` Setup websocket provider (y-sweet)
- `Monaco` Show awareness in editors (selections + cursors)
- `Interface` Show color dots in component list
- `Storybook` Update syncing api to match plugin

## V49 — Asset Gallery
- `Compiler` Fix assets + links clearing on new build
- `Interface` Add filtering to asset + icon gallery
- `Interface` Add bounding box + title + hover
- `Interface` Add lightbox (yet-another-react-lightbox)
- `Interface` Add drag and drop to figma / others

## V50 — Services

### GPT-4 Vision
- `Service` Verify output and fine-tune prompt
- `Interface` Send component code + preview image to api
- `Interface` Update component code Y.JS value if accepted

### GitHub Release
- `Service` Process files and create pull request

### Redux Sync
- `Service` Sync Redux store -> Figma Variables via Figma REST API
- `Compiler` Generate usage similar to useState implementation
- `Compiler` Use saved variables plugin data to get redux store code for previews + builds

### Icon Service
- `Service` Provide hosted Iconify source
- `Service` Import SVGs from Figma to Iconify set via Figma REST API
