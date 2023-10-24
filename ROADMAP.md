# ROADMAP

# v44
- Compile components in background:
  - [ ] use browser bundler, conform preview and code output
  - [ ] precompile components, cache code to component node storage
  - [ ] batch compilation, put selected components at top of queue
  - [ ] recompile component when update triggered for it
  - [ ] combine constrained user edits with compiled code

## Style Libraries
- [x] Unistyles (default)
- [ ] Tamagui (planned...)
- [ ] GlueStack (planned...)
- [ ] NativeWind (maybe...)

## Planned Features
- [ ] Interactions: (accessibility, pressablility, etc.)
- [ ] Screens: (navigation based on prototype settings)
- [ ] Improved Devtools:
  - diff text instead of fully replacing (highlight changes?)
  - show console log in preview:
    - https://github.com/storybookjs/react-inspector

## Planned Tools
- [ ] Doctor (fix structure, autolayout, etc.)
- [ ] Auto Shimmer (auto create shimmer variant)
- [ ] Import Redux Store
- [ ] Import Primitives
- [ ] Import Icons
- [ ] Import Theme

## Optimization Goals
- Replace ESBuild with SWC? (https://swc.rs/docs/usage/wasm)

## Known Issues
- Missing type imports
- Extraneous Pressable import
- SVGs don't adapt correct colors
- Storybook variant import name wrong
- Border colors (without variables) not converting
- Error "failed to export" caused by hidden assets
- Refactor primitive generation code (template string -> codewriter)
- Triage preview using wrong default value for Child in Frame example
- Code tab is cleared when going to Theme tab
- Monaco sometimes appears in light mode
- Address or document TODOs throughout the app...
