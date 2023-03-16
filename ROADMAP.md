# INTERFACING

- Add config comments for schema
- Add export button & command
- Add copy all button & command
- Add export all components button & command
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing


# PREVIEWING

- compiling subcomponents
- support LinguiJS import
- panning and zooming (via CSS scale?)


# GENERATING

- SVGs
- Images
- Variants
- Properties
- Theme values
- AutoLayout (including INHERIT)
- Interactions (via Pressable & Link)
- Support Tamagui (backlogged)
- Switch to hosted UI to solve mouse issues
- Add ability to export multiple components at once
  1. popup or new tab, select pages or all in project
  2. compile all components and used assets within selection
  3. use File System API to save all components and used assets to folder
    - Note: fallback to zip download if not supported


# MAINTENANCE

- Refactor types
- Refactor style transforming code
- Reorganize folder structure
- Use `--jsx=automatic` option (https://github.com/evanw/esbuild/issues/334)
