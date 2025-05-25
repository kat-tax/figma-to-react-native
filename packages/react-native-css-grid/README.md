# React Native CSS Grid

A React Native component that brings CSS Grid layout to React Native using a familiar CSS-like API. Built on top of `react-native-flexible-grid` with automatic conversion and responsive behavior.

## Features

- 🎯 **CSS Grid API** - Use familiar CSS Grid properties
- 📱 **React Native Compatible** - Works with React Native's layout system
- 🔄 **Responsive** - Automatically recalculates on container resize
- ⚡ **Performance** - Efficient conversion and rendering
- 🎨 **Flexible** - Supports most CSS Grid features
- 🧩 **Children-based** - Simple `<Grid><GridItem/></Grid>` pattern

## Installation

```bash
npm install @figma-to-react-native/react-native-css-grid react-native-flexible-grid
```

## Quick Start

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { Grid, GridItem } from '@figma-to-react-native/react-native-css-grid';

export default function App() {
  return (
    <Grid style={{ gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
      <GridItem style={{ gridColumn: 'span 2' }}>
        <View style={{ backgroundColor: 'red', padding: 20 }}>
          <Text>Item 1 (spans 2 columns)</Text>
        </View>
      </GridItem>
      <GridItem>
        <View style={{ backgroundColor: 'blue', padding: 20 }}>
          <Text>Item 2</Text>
        </View>
      </GridItem>
      <GridItem style={{ gridRow: 'span 2' }}>
        <View style={{ backgroundColor: 'green', padding: 20 }}>
          <Text>Item 3 (spans 2 rows)</Text>
        </View>
      </GridItem>
    </Grid>
  );
}
```

## API Reference

### Grid Component

The main container component that accepts CSS Grid properties.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `style` | `CSSGridStyle` | CSS Grid container styles |
| `children` | `ReactNode` | Child components to layout |
| `containerWidth` | `number` | Override container width for calculations |
| `flexGridProps` | `Partial<FlexGridProps>` | Override FlexGrid properties |
| `onLayout` | `(event: LayoutChangeEvent) => void` | Layout change callback |
| `debug` | `boolean` | Enable debug logging |

#### Supported CSS Grid Properties

**Container Properties:**
- `gridTemplateColumns` - Define column tracks
- `gridTemplateRows` - Define row tracks
- `gridTemplateAreas` - Define named grid areas
- `gridTemplate` - Shorthand for template properties
- `gridAutoFlow` - Control auto-placement
- `gridAutoColumns` - Size auto-generated columns
- `gridAutoRows` - Size auto-generated rows
- `grid` - Shorthand for all grid properties
- `gap` / `rowGap` / `columnGap` - Grid gaps

**Alignment Properties:**
- `justifyItems` - Align items horizontally
- `alignItems` - Align items vertically
- `placeItems` - Shorthand for item alignment
- `justifyContent` - Align grid horizontally
- `alignContent` - Align grid vertically
- `placeContent` - Shorthand for content alignment

### GridItem Component

Wrapper component for grid items with CSS Grid item properties.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `style` | `GridItemStyle` | CSS Grid item styles |
| `children` | `ReactNode` | Child content |

#### Supported CSS Grid Item Properties

**Positioning Properties:**
- `gridColumn` - Column position/span
- `gridRow` - Row position/span
- `gridArea` - Area position (shorthand)
- `gridColumnStart` / `gridColumnEnd` - Column boundaries
- `gridRowStart` / `gridRowEnd` - Row boundaries

**Alignment Properties:**
- `justifySelf` - Self horizontal alignment
- `alignSelf` - Self vertical alignment
- `placeSelf` - Shorthand for self alignment

## Examples

### Basic Grid Layout

```tsx
<Grid style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
  <GridItem><Text>1</Text></GridItem>
  <GridItem><Text>2</Text></GridItem>
  <GridItem><Text>3</Text></GridItem>
</Grid>
```

### Responsive Grid

```tsx
<Grid style={{
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 20
}}>
  {items.map((item, index) => (
    <GridItem key={index}>
      <Card data={item} />
    </GridItem>
  ))}
</Grid>
```

### Complex Layout with Spans

```tsx
<Grid style={{
  gridTemplateColumns: 'repeat(4, 1fr)',
  gridTemplateRows: 'repeat(3, 100px)',
  gap: 10
}}>
  <GridItem style={{ gridColumn: '1 / 3', gridRow: '1 / 3' }}>
    <Text>Header (2x2)</Text>
  </GridItem>
  <GridItem style={{ gridColumn: 'span 2' }}>
    <Text>Nav (spans 2 columns)</Text>
  </GridItem>
  <GridItem style={{ gridRow: 'span 2' }}>
    <Text>Sidebar (spans 2 rows)</Text>
  </GridItem>
  <GridItem>
    <Text>Content</Text>
  </GridItem>
</Grid>
```

### Named Grid Areas

```tsx
<Grid style={{
  gridTemplateAreas: `
    "header header header"
    "sidebar main main"
    "footer footer footer"
  `,
  gridTemplateColumns: '200px 1fr 1fr',
  gridTemplateRows: '60px 1fr 40px'
}}>
  <GridItem style={{ gridArea: 'header' }}>
    <Text>Header</Text>
  </GridItem>
  <GridItem style={{ gridArea: 'sidebar' }}>
    <Text>Sidebar</Text>
  </GridItem>
  <GridItem style={{ gridArea: 'main' }}>
    <Text>Main Content</Text>
  </GridItem>
  <GridItem style={{ gridArea: 'footer' }}>
    <Text>Footer</Text>
  </GridItem>
</Grid>
```

## How It Works

The component automatically converts CSS Grid properties to `react-native-flexible-grid` configuration:

1. **Parse CSS Grid** - Analyzes `gridTemplateColumns` and other properties
2. **Calculate Layout** - Determines optimal `itemSizeUnit` and column ratios
3. **Extract Items** - Processes children and their grid properties
4. **Convert to FlexGrid** - Maps to FlexGrid's ratio-based system
5. **Responsive Updates** - Recalculates on container resize

### Conversion Examples

```css
/* CSS Grid */
grid-template-columns: 100px 200px 100px;
```
↓
```typescript
// FlexGrid Config
{
  maxColumnRatioUnits: 4,  // Total ratio units (1+2+1)
  itemSizeUnit: 100,       // Base unit (GCD of sizes)
  // Column ratios: 1, 2, 1
}
```

```css
/* CSS Grid */
grid-template-columns: 1fr 2fr 1fr;
```
↓
```typescript
// FlexGrid Config
{
  maxColumnRatioUnits: 4,  // Total fr units
  itemSizeUnit: 100,       // Container width / 4fr
  // Column ratios: 1, 2, 1
}
```

## Performance Considerations

- **Virtualization Disabled** - For CSS Grid compatibility
- **Responsive Recalculation** - Only on container resize
- **Efficient Parsing** - Cached calculations where possible
- **Memory Usage** - Minimal overhead over FlexGrid

## Limitations

- **No Subgrid** - Not supported by FlexGrid
- **Limited Auto-placement** - Basic auto-flow only
- **No Grid Lines** - Named lines not supported
- **Fractional Precision** - Limited by integer ratios

## Migration from CSS

Most CSS Grid layouts can be migrated directly:

```css
/* CSS */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.item {
  grid-column: span 2;
}
```

```tsx
{/* React Native */}
<Grid style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
  <GridItem style={{ gridColumn: 'span 2' }}>
    <YourComponent />
  </GridItem>
</Grid>
```

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details.
