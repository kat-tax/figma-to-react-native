// Test CSS Grid parsing
import { cssToReactNative } from './packages/css-to-rn/index.ts';

const testCSS = `
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 100px auto;
  grid-gap: 10px;
  column-gap: 15px;
  row-gap: 20px;
  grid-template-areas: "header header header" "sidebar main aside" "footer footer footer";
}

.grid-item {
  grid-column: span 2;
  grid-row: 1 / 3;
  grid-area: main;
}
`;

async function testGridParsing() {
  try {
    console.log('Testing CSS Grid parsing...\n');

    const result = await cssToReactNative(testCSS);

    console.log('Parsed CSS Grid properties:');
    console.log(JSON.stringify(result, null, 2));

    // Check specific properties
    const gridContainer = result['grid-container'];
    const gridItem = result['grid-item'];

    console.log('\nGrid Container Properties:');
    console.log('display:', gridContainer?.display);
    console.log('gridTemplateColumns:', gridContainer?.gridTemplateColumns);
    console.log('gridTemplateRows:', gridContainer?.gridTemplateRows);
    console.log('gridTemplateAreas:', gridContainer?.gridTemplateAreas);
    console.log('columnGap:', gridContainer?.columnGap);
    console.log('rowGap:', gridContainer?.rowGap);

    console.log('\nGrid Item Properties:');
    console.log('gridColumn:', gridItem?.gridColumn);
    console.log('gridRow:', gridItem?.gridRow);
    console.log('gridArea:', gridItem?.gridArea);

    // Verify no [object Object] values
    const hasObjectString = JSON.stringify(result).includes('[object Object]');
    console.log('\nContains [object Object]:', hasObjectString);

    if (!hasObjectString) {
      console.log('✅ Grid parsing test PASSED - No [object Object] values found!');
    } else {
      console.log('❌ Grid parsing test FAILED - Found [object Object] values');
    }

  } catch (error) {
    console.error('Error testing grid parsing:', error);
  }
}

testGridParsing();
