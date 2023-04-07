# INTERFACING

- Add commands (export all, export, copy current component)
- Switch to hosted UI to solve mouse issues
- Highlight selected sub node within code
  - sourcemap from node ids -> line + column numbers needed when parsing
- Improve Export UI
  https://github.com/JB1905/react-figma-ui
  https://github.com/alexandrtovmach/react-figma-plugin-ds
  https://github.com/jhardy/figma-styled-components/


# PREVIEWING

- support LinguiJS import


# GENERATING

- Gradients
- Properties
- Theme values
- Absolute positioning
- Screens (navigation based on prototype settings)
- Variants (conditional styling)
- Interactions (via Pressable & Link)
- Hidden based on props (conditional rendering)
- Images (including export & previewing)
  - Lossless optimize
  - Generate Thumbhash placeholder https://github.com/evanw/thumbhash

# MAINTENANCE

- Refactor types
- Use `--jsx=automatic` option (https://github.com/evanw/esbuild/issues/334)


# AFTER MVP

- Payment system

# STORYBOOK

```ts
import type { StorybookConfig } from "@storybook/react-webpack5";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
    "@storybook/addon-react-native-web",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
```

```tsx
import {Button as Component} from './Button.tsx';
import type {StoryObj, Meta} from '@storybook/react';

type Story = StoryObj<typeof Component>;

export default <Meta<typeof Component>>{
  title: 'Auth/Button',
  component: Component,
};

// Normal

export const Button: Story = {
  args: {
    label: 'Button',
    backgroundColor: '#ff0',
  },
};

// Variants

export const Primary: Story = {
  args: {
    label: 'Button',
    backgroundColor: '#ff0',
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    label: '😄👍😍💯',
  },
};

export const Tertiary: Story = {
  args: {
    ...Primary.args,
    label: '📚📕📈🤓',
  },
};
```

