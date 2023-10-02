# ROADMAP

### Todo
- Fix shorthands: borderBottom: '1px solid var(--neutral-12, #EFF0F0)'
- Fix preview using wrong default value for Child in Frame example (should be SUBMIT not Default)
- Fix storybook variants
- Improve perf (cache data, track revisions)
- Make inspect components link to code and highlight
- Fix inspect definition link to component
- Fix "failed to export" error caused by hidden assets
- Add useMemo to classes
- Diff text instead of fully replacing (highlight changes?)
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing
- Support SWC as well as ESBuild (https://swc.rs/docs/usage/wasm)


### Generation
- Interactions (via Pressable & Link)
- Theme values (fonts & effects left)
- Screens (navigation based on prototype settings)
- When releasing, merge previous styles with comment // @f2rn-override


### The KATTAX Stack
- ULT (stack)
- VIA (router)
- EXO (ui kit)
- FOV (app service)
  # Stage 1
  1. Sync & share EXO + custom components in Storybook
  2. Automated building of EXO + custom components to UI package
  # Stage 2
  3. Automate asset compression
  4. Automate missing translations
  5. Automate external documentation
  # Stage 3
  6. Build & deploy mobile apps to stores, web to CF
  7. CodePush updates to mobile apps
  8. Logging, analytics, error reporting, and Redux session replay
  9. Rollback updates & builds
