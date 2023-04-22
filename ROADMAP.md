# INTERFACING

- Preview click to component (https://github.com/ericclemmons/click-to-component)
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing


# GENERATING

- Fix errors
- Fix styling differences
- Provide component for instance swap prop
- Theme values (fonts & effects left)
- Images (including export & previewing)
  - Generate placeholder: https://github.com/evanw/thumbhash
  - Optimize: https://github.com/GoogleChromeLabs/squoosh
- Absolute positioning
- Shadows, rotations, etc.
- Gradient backgrounds
- Interactions (via Pressable & Link)
- Screens (navigation based on prototype settings)
- Variants
  - Loop through variants
  - Build and diff stylesheet from the root for each
  - Add suffix (named from the variant) for each diff stylesheet
  - Build the dynamic class with the props and the stylesheet classes

# EXPORTING

- Git repository (https://isomorphic-git.org)
- Each document / page export is a branch
- Display diff

# MAINTENANCE

- Refactor types
- Use `--jsx=automatic` option (https://github.com/evanw/esbuild/issues/334)

# SAAS

- Payment system
- Storybook syncing
