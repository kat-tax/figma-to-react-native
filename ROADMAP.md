# ROADMAP

## Style Libraries
- [x] Unistyles (default)
- [ ] Tamagui (planned...)
- [ ] GlueStack (planned...)
- [ ] NativeWind ([maybe?](/)...)

## Planned Features
- [ ] Interactions: (accessibility, pressablility, etc.)
- [ ] Screens: (navigation based on prototype settings)
- [ ] Improved Devtools:
  - components link to code and highlight
  - diff text instead of fully replacing (highlight changes?)
  - highlight selected sub node within code:
    - sourcemap from node ids -> line + column numbers needed when parsing
  - show console log in preview:
    - https://github.com/storybookjs/react-inspector

## Planned Tools
- [ ] Doctor (fix structure, autolayout, etc.)
- [ ] Shimmer (auto create shimmer variant)
- [ ] Import Redux Store
- [ ] Import Theme

## Optimization Goals
- Compile components in background
  - cache code to node storage
  - recompile component when update triggered for it
  - batch compilation, put selected components at top of queue
- Replace ESBuild with SWC?
  - https://swc.rs/docs/usage/wasm

## Known Issues
- Refactor primitive generation code (template string -> codewriter)
- Fix border colors (without variables) not converting
- SVGs don't adapt correct colors
- Storybook variant import name wrong
- Error "failed to export" caused by hidden assets
- Triage preview using wrong default value for Child in Frame example
- Address or document TODOs throughout the app :')
