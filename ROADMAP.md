# ROADMAP

### Next
- Add frame selections
- Fix "failed to export" error caused by hidden assets
- Fix storybook variants
- Improve perf (cache data, track revisions)
- Add useMemo to classes
- Fix shorthands: borderBottom: '1px solid var(--neutral-12, #EFF0F0)'
- Improve styling differences
- Sort props

### Interface
- Diff text instead of fully replacing (highlight changes?)
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing

### Generation
- When releasing, merge previous styles with comment // @f2rn-override
- Theme values (fonts & effects left)
- Interactions (via Pressable & Link)
- Gradient backgrounds
- Screens (navigation based on prototype settings)
- Use Pressable and TextInput using user mappings
```json
{
  "mappings": {
    // Hovers get a pressable generated over them
    "PressableContainer": "/$button|^button/i",
    // Hovers get a pressable generated over them
    "PressableHover": "/$button|^button/i",
    // Inputs get Text replaced with TextInput and contents are the placeholder attr
    "TextInput": "/$input|^input/i",
  }
}
```
- Auto generate a <Pressable> and apply "Hover" or "Focused" or "Pressed" state?
```tsx
<Pressable onClick={console.log}>
  {({hovered}) => (
    <Button state={hovered ? 'Hover' : 'Default'}/>
  )}
</Pressable>
```

### Extensions
- VSCode extension similar to Storybook sync to directly sync to project

### The KATTAX Stack
- VIA (cross-platform router)
- ULT (cross-platform starter)
- EXO (cross-platform UI kit)
- FOV (application services)
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
