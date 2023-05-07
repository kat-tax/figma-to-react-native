# ROADMAP

### Next
- Support rectangle
- Support assets (png + svg)
- Support variants
- Fix preview of variants

### Polishing
- Add fill prop to SVGs and provide them
- Fix wrong variants being used (imports seem right)
- Fix various parse errors
- Fix styling differences

### Interfacing
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing

### Generating
- Variants
  - Loop through variants
  - Build and diff stylesheet from the root for each
  - Add suffix (named from the variant) for each diff stylesheet
  - Build the dynamic class with the props and the stylesheet classes
  - If state is "Hover" or "Focused" or "Pressed" then auto generate a <Pressable> and apply the class?
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
- Ensure https://www.untitledui.com/ translates