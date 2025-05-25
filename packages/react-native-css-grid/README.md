# React Native CSS Grid

A React Native component that brings CSS Grid layout to React Native using a purpose-built implementation. Built from scratch with native React Native layout calculations and CSS Grid property parsing.

## Features

- 🎯 **CSS Grid API** - Use familiar CSS Grid properties
- 📱 **React Native Native** - Built specifically for React Native
- 🔄 **Responsive** - Automatically recalculates on container resize
- ⚡ **Performance** - Efficient layout calculations and optional virtualization
- 🎨 **Flexible** - Supports most CSS Grid features
- 🧩 **Children-based** - Simple `<CSSGrid><GridItem/></CSSGrid>` pattern
- 🚀 **From Scratch** - No external grid dependencies, purpose-built for CSS Grid

## Installation

```bash
npm install @figma-to-react-native/react-native-css-grid
```

## Quick Start

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { CSSGrid, GridItem } from '@figma-to-react-native/react-native-css-grid';

export default function App() {
  return (
    <CSSGrid style={{ gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
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
    </CSSGrid>
  );
}
```

## API Reference

### CSSGrid Component

The main container component that accepts CSS Grid properties and renders them with native React Native layout calculations.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `style` | `CSSGridStyle` | CSS Grid container styles |
| `children` | `ReactNode` | Child components to layout |
| `containerWidth` | `number` | Override container width for calculations |
| `containerHeight` | `number` | Override container height for calculations |
| `onLayout` | `(event: LayoutChangeEvent) => void` | Layout change callback |
| `debug` | `boolean` | Enable debug logging |
| `virtualization` | `boolean` | Enable virtualization for performance (default: false) |
| `virtualizedBufferFactor` | `number` | Virtualization buffer factor |
| `scrollEventInterval` | `number` | Scroll event throttle interval |
| `showScrollIndicator` | `boolean` | Show scroll indicators |
| `horizontalScrollEnabled` | `boolean` | Enable horizontal scrolling |
| `verticalScrollEnabled` | `boolean` | Enable vertical scrolling |

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
<CSSGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
  <GridItem><Text>1</Text></GridItem>
  <GridItem><Text>2</Text></GridItem>
  <GridItem><Text>3</Text></GridItem>
</CSSGrid>
```

### Responsive Grid

```tsx
<CSSGrid style={{
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 20
}}>
  {items.map((item, index) => (
    <GridItem key={index}>
      <Card data={item} />
    </GridItem>
  ))}
</CSSGrid>
```

### Complex Layout with Spans

```tsx
<CSSGrid style={{
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
</CSSGrid>
```

### Named Grid Areas

```tsx
<CSSGrid style={{
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
</CSSGrid>
```

### Performance with Virtualization

```tsx
<CSSGrid
  style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
  virtualization={true}
  virtualizedBufferFactor={2}
  containerHeight={400}
>
  {largeDataSet.map((item, index) => (
    <GridItem key={index}>
      <ExpensiveComponent data={item} />
    </GridItem>
  ))}
</CSSGrid>
```

## How It Works

The component implements CSS Grid layout using native React Native positioning:

1. **Parse CSS Grid Properties** - Analyzes `gridTemplateColumns`, `gridTemplateRows`, and other properties
2. **Calculate Layout** - Determines exact positions and sizes for each grid item
3. **Extract Items** - Processes children and their grid properties
4. **Position Absolutely** - Uses React Native's absolute positioning to place items
5. **Responsive Updates** - Recalculates on container resize
6. **Optional Virtualization** - Renders only visible items for performance

### Layout Calculation Examples

```css
/* CSS Grid */
grid-template-columns: 100px 200px 100px;
gap: 10px;
```
↓
```typescript
// Calculated Layout
{
  columnSizes: [100, 200, 100],
  totalWidth: 420, // 100 + 200 + 100 + 2*10 (gaps)
  items: [
    { left: 0, width: 100 },      // Column 1
    { left: 110, width: 200 },    // Column 2 (100 + 10 gap)
    { left: 320, width: 100 }     // Column 3 (100 + 200 + 2*10 gaps)
  ]
}
```

```css
/* CSS Grid with Fractional Units */
grid-template-columns: 1fr 2fr 1fr;
container-width: 400px;
gap: 10px;
```
↓
```typescript
// Calculated Layout
{
  columnSizes: [95, 190, 95], // (400 - 2*10) / 4fr = 95 per fr
  totalWidth: 400,
  items: [
    { left: 0, width: 95 },       // 1fr
    { left: 105, width: 190 },    // 2fr
    { left: 305, width: 95 }      // 1fr
  ]
}
```

## Architecture

### Purpose-Built Design

Unlike adapters that try to convert CSS Grid to other grid systems, this component is built from scratch specifically for CSS Grid:

- **Native CSS Grid Logic** - Implements actual CSS Grid positioning algorithms
- **React Native Optimized** - Uses absolute positioning for precise control
- **No External Dependencies** - Self-contained grid implementation
- **TypeScript First** - Full type safety and IntelliSense support

### Performance Considerations

- **Efficient Calculations** - Optimized layout algorithms
- **Optional Virtualization** - Render only visible items for large grids
- **Responsive Recalculation** - Only on container resize
- **Memory Efficient** - Minimal overhead over native React Native

### Comparison with Alternatives

| Feature | CSS Grid Component | FlexGrid Adapter | CSS-in-JS |
|---------|-------------------|------------------|-----------|
| CSS Grid API | ✅ Native | ⚠️ Converted | ❌ Limited |
| Performance | ✅ Optimized | ⚠️ Overhead | ✅ Fast |
| Responsive | ✅ Automatic | ❌ Manual | ⚠️ Complex |
| TypeScript | ✅ Full | ⚠️ Partial | ❌ Minimal |
| Bundle Size | ✅ Small | ❌ Large | ✅ Small |

## Limitations

- **No Subgrid** - CSS Grid Level 2 feature not implemented
- **Limited Auto-placement** - Basic auto-flow only
- **No Grid Lines** - Named lines not supported
- **Row Sizing** - Auto-calculated, explicit row templates partially supported

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
<CSSGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
  <GridItem style={{ gridColumn: 'span 2' }}>
    <YourComponent />
  </GridItem>
</CSSGrid>
```

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details.
