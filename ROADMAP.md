# ROADMAP

### Next
- Fix handling multiple variants
- Fix various parse errors
- Fix styling differences
- Fix sanitizing names
- Fix rectangle + ellipses
- Support assets (png + svg)
- Support variant child nodes

### Interface
- Diff text instead of fully replacing (highlight changes?)
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing

### Generation
- Images (including export & previewing)
  - Expo Image support: https://docs.expo.dev/versions/unversioned/sdk/image/
  - Generate placeholder: https://github.com/evanw/thumbhash
  - Optimize: https://github.com/GoogleChromeLabs/squoosh
- Theme values (fonts & effects left)
- Shadows, rotations, etc.
- Gradient backgrounds
- Absolute positioning
- Interactions (via Pressable & Link)
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

### Exporting
- Git repository (https://isomorphic-git.org)
- Each document / page export is a branch
- Display diff

### Maintaining
- Refactor types
- Use `--jsx=automatic` option (https://github.com/evanw/esbuild/issues/334)

### Servicing
- Payment system
- Storybook syncing

### Testing
- Ensure https://www.untitledui.com/ converts
- Test other UI packs (IntelliJ, find more...)
- Make sure snapshots of converted projects don't change
