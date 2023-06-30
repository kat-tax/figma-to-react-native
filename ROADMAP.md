# ROADMAP

### Next
- Add useMemo to classes
- Fix shorthands: borderBottom: '1px solid var(--neutral-12, #EFF0F0)'
- Improve perf (cache data, track revisions)
- Improve styling differences

### Interface
- Diff text instead of fully replacing (highlight changes?)
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing

### Generation
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

### SaaS
- Storybook preview
- Storybook syncing
- Export to GitHub PR
- Auto translations
- AI documentation
- UI package generation
- Thumbhash, RNSVG, Image & SVGO compression

### Extensions
- Port UI to VSCode
- Same messaging to Figma & VSCode extension

### Testing
- Ensure https://www.untitledui.com/ converts
- Test other UI packs (IntelliJ, find more...)
- Make sure snapshots of converted projects don't change
