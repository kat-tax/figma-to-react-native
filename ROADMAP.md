# ROADMAP

## Style Libraries
- [x] Unistyles (default)
- [ ] Tamagui (planned...)
- [ ] GlueStack (maybe...)
- [ ] NativeWind (maybe...)

## Upcoming Features
- Screens: (navigation based on prototype settings)
- Interactions: (accessibility, pressablility, etc.)
- Devtools:
  - components link to code and highlight
  - diff text instead of fully replacing (highlight changes?)
  - highlight selected sub node within code
    - sourcemap from node ids -> line + column numbers needed when parsing
  - show console log in preview
    - https://github.com/storybookjs/react-inspector

## Optimization Goals
- Compile components in background
  - cache code to node storage
  - recompile component when update triggered for it
  - batch compilation, put selected components at top of queue
- Replace ESBuild with SWC?
  - https://swc.rs/docs/usage/wasm

## Known Issues
- SVGs don't adapt correct colors
- Storybook variant import name wrong
- Error "failed to export" caused by hidden assets
- Preview using wrong default value for Child in Frame example (should be SUBMIT not Default)
