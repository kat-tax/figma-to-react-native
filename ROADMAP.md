# ROADMAP

## Generators
- [x] RN Style Sheets (+ Unistyles)
- [ ] Tamagui (planned...)
- [ ] GlueStack (maybe...)
- [ ] NativeWind (maybe...)

## Optimizations
- Compile components in background
  - cache code to node storage
  - recompile component when update triggered for it
  - batch compilation, put selected components at top of queue
- Replace css-to-rn w/ lightning.css parser based on:
  - https://github.com/marklawlor/nativewind/tree/main/packages/react-native-css-interop
- Replace ESBuild with SWC?
  - https://swc.rs/docs/usage/wasm

## Features
- Screens (navigation based on prototype settings)
- Merge previous styles with comment // @f2rn-override
- Inspect components link to code and highlight
- Diff text instead of fully replacing (highlight changes?)
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing

## Known Issues
- Storybook variant import name wrong
- Flaky variant style diffing
- Error "failed to export" caused by hidden assets
- Preview using wrong default value for Child in Frame example (should be SUBMIT not Default)
