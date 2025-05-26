import {isValidElement, cloneElement, Children} from 'react';
import {parseTemplateColumns} from 'parser/columnTemplates';
import {parseGridSpan} from 'parser/gridSpanParser';

import type {ReactElement} from 'react';
import type {GridViewItem} from 'components/GridViewItem';
import type {GridViewProps, GridItemData, GridLayoutOptions, GridLayoutResult, GridViewItemProps} from 'types';

/**
 * Calculate CSS Grid layout positions and sizes
 */
export function calculateLayout(
	children: GridViewProps["children"],
	options: GridLayoutOptions,
): GridLayoutResult {
	const {
		gridTemplateColumns = '1fr',
		gridTemplateRows,
		gap = 0,
		rowGap,
		columnGap,
		containerWidth,
		containerHeight,
	}: GridLayoutOptions = options;

	// Parse gap values
	const gapValue = typeof gap === "number" ? gap : parseFloat(String(gap)) || 0;
	const rowGapValue =
		rowGap !== undefined
			? typeof rowGap === "number"
				? rowGap
				: parseFloat(String(rowGap)) || 0
			: gapValue;
	const columnGapValue =
		columnGap !== undefined
			? typeof columnGap === "number"
				? columnGap
				: parseFloat(String(columnGap)) || 0
			: gapValue;

	// Parse column template
	const columnInfo = parseTemplateColumns(gridTemplateColumns);
	const columnSizes = calculateColumnSizes(
		gridTemplateColumns,
		containerWidth,
		columnGapValue,
	);

	// Parse row template (if provided)
	const rowSizes = gridTemplateRows
		? calculateRowSizes(gridTemplateRows, containerHeight || 0, rowGapValue)
		: [];

	// Extract grid items from children
	const gridItems: GridItemData[] = [];
	let itemIndex = 0;

	Children.forEach(children, (child, index) => {
		if (!isValidElement(child)) {
			// Handle text nodes and other non-element children
			gridItems.push(
				createGridItem(child, {
					columnStart: 1,
					columnEnd: 2,
					rowStart: 1,
					rowEnd: 2,
					key: `text-${index}`,
					rowSizes,
					rowGapValue,
					columnSizes,
					columnGapValue,
				}),
			);
			return;
		}

		const element = child as ReactElement<any>;
		const gridProps = extractGridItemProps(element.props.style);

		// Parse grid positioning
		const positioning = parseGridItemPositioning(
			gridProps,
			columnInfo.maxColumnRatioUnits,
		);

		// Create clean element without grid properties
		const cleanStyle = cleanGridPropsFromStyle(element.props.style);

		const cleanElement = cloneElement(element, {
			...element.props,
			style: cleanStyle,
		});

		gridItems.push(
			createGridItem({
				component: cleanElement,
				columnStart: positioning.columnStart,
				columnEnd: positioning.columnEnd,
				rowStart: positioning.rowStart,
				rowEnd: positioning.rowEnd,
				key: element.key || `item-${itemIndex}`,
				columnSizes,
				rowSizes,
				columnGapValue,
				rowGapValue,
				originalStyle: element.props.style,
			}),
		);

		itemIndex++;
	});

	// Auto-place items that don't have explicit positioning
	autoPlaceGridItems(gridItems, columnInfo.maxColumnRatioUnits);

	// Calculate total dimensions
	const totalWidth =
		columnSizes.reduce((sum, size) => sum + size, 0) +
		(columnSizes.length - 1) * columnGapValue;

	const maxRow = Math.max(...gridItems.map((item) => item.rowEnd));
	const totalHeight = calculateTotalHeight(
		maxRow,
		rowSizes,
		rowGapValue,
		gridItems,
	);

	if (debug) {
		console.log("Grid Layout Calculation:", {
			columnSizes,
			rowSizes,
			totalWidth,
			totalHeight,
			gaps: { row: rowGapValue, column: columnGapValue },
			itemCount: gridItems.length,
		});
	}

	return {
		items: gridItems,
		totalWidth,
		totalHeight,
		columnSizes,
		rowSizes,
		columnCount: columnSizes.length,
		rowCount: maxRow,
	};
}

/**
 * Calculate column sizes from grid-template-columns
 */
function calculateColumnSizes(
	gridTemplateColumns: string,
	containerWidth: number,
	columnGap: number,
): number[] {
	const columnInfo = parseTemplateColumns(
		gridTemplateColumns,
		containerWidth,
	);

	if (columnInfo.columnSizes.length > 0) {
		// Has explicit pixel sizes
		return columnInfo.columnSizes;
	}

	if (columnInfo.hasFractionalUnits) {
		// Calculate from fractional units
		const availableWidth =
			containerWidth - (columnInfo.maxColumnRatioUnits - 1) * columnGap;
		const unitSize = availableWidth / columnInfo.totalFr;

		// For now, assume equal distribution - could be enhanced to parse actual fr values
		return new Array(columnInfo.maxColumnRatioUnits).fill(unitSize);
	}

	// Fallback: equal distribution
	const availableWidth =
		containerWidth - (columnInfo.maxColumnRatioUnits - 1) * columnGap;
	const columnSize = availableWidth / columnInfo.maxColumnRatioUnits;
	return new Array(columnInfo.maxColumnRatioUnits).fill(columnSize);
}

/**
 * Calculate row sizes from grid-template-rows
 */
function calculateRowSizes(
	gridTemplateRows: string,
	containerHeight: number,
	rowGap: number,
): number[] {
	// For now, return empty array - row sizing will be auto-calculated
	// This could be enhanced to parse grid-template-rows similar to columns
	return [];
}

/**
 * Parse grid item positioning from CSS Grid properties
 */
function parseGridItemPositioning(
	gridProps: any,
	maxColumns: number,
): {
	columnStart: number;
	columnEnd: number;
	rowStart: number;
	rowEnd: number;
} {
	let columnStart = 1;
	let columnEnd = 2;
	let rowStart = 1;
	let rowEnd = 2;

	// Parse grid-column
	if (gridProps.gridColumn) {
		const columnSpan = parseGridSpan(gridProps.gridColumn);
		columnEnd = columnStart + columnSpan;
	} else if (gridProps.gridColumnStart && gridProps.gridColumnEnd) {
		columnStart = parseInt(String(gridProps.gridColumnStart), 10) || 1;
		columnEnd =
			parseInt(String(gridProps.gridColumnEnd), 10) || columnStart + 1;
	}

	// Parse grid-row
	if (gridProps.gridRow) {
		const rowSpan = parseGridSpan(gridProps.gridRow);
		rowEnd = rowStart + rowSpan;
	} else if (gridProps.gridRowStart && gridProps.gridRowEnd) {
		rowStart = parseInt(String(gridProps.gridRowStart), 10) || 1;
		rowEnd = parseInt(String(gridProps.gridRowEnd), 10) || rowStart + 1;
	}

	// Parse grid-area (row-start / column-start / row-end / column-end)
	if (gridProps.gridArea) {
		const areaPositioning = parseGridAreaPositioning(gridProps.gridArea);
		if (areaPositioning.columnStart > 0)
			columnStart = areaPositioning.columnStart;
		if (areaPositioning.columnEnd > 0) columnEnd = areaPositioning.columnEnd;
		if (areaPositioning.rowStart > 0) rowStart = areaPositioning.rowStart;
		if (areaPositioning.rowEnd > 0) rowEnd = areaPositioning.rowEnd;
	}

	return { columnStart, columnEnd, rowStart, rowEnd };
}

/**
 * Parse grid-area value for positioning (different from parser module version)
 */
function parseGridAreaPositioning(value: string): {
	columnStart: number;
	columnEnd: number;
	rowStart: number;
	rowEnd: number;
} {
	if (!value || typeof value !== "string") {
		return { columnStart: 0, columnEnd: 0, rowStart: 0, rowEnd: 0 };
	}

	const parts = value.split("/").map((s) => s.trim());

	if (parts.length === 4) {
		const [rowStart, colStart, rowEnd, colEnd] = parts;
		return {
			rowStart: parseInt(rowStart, 10) || 0,
			columnStart: parseInt(colStart, 10) || 0,
			rowEnd: parseInt(rowEnd, 10) || 0,
			columnEnd: parseInt(colEnd, 10) || 0,
		};
	}

	return { columnStart: 0, columnEnd: 0, rowStart: 0, rowEnd: 0 };
}

/**
 * Create a grid item with calculated position and size
 */
function createGridItem(
	item: typeof GridViewItem | undefined,
	options: {
		columnStart: number;
		columnEnd: number;
		rowStart: number;
		rowEnd: number;
		key: string;
		columnSizes: number[];
		rowSizes: number[];
		columnGapValue: number;
		rowGapValue: number;
		originalStyle?: any;
	},
): GridItemData {
	const {
		columnStart,
		columnEnd,
		rowStart,
		rowEnd,
		key,
		columnSizes,
		rowSizes,
		columnGapValue,
		rowGapValue,
		originalStyle,
	} = options;

	// Calculate position
	const left =
		columnSizes.slice(0, columnStart - 1).reduce((sum, size) => sum + size, 0) +
		(columnStart - 1) * columnGapValue;

	const top =
		rowSizes.length > 0
			? rowSizes.slice(0, rowStart - 1).reduce((sum, size) => sum + size, 0) +
				(rowStart - 1) * rowGapValue
			: (rowStart - 1) * 100; // Default row height of 100

	// Calculate size
	const width =
		columnSizes
			.slice(columnStart - 1, columnEnd - 1)
			.reduce((sum, size) => sum + size, 0) +
		(columnEnd - columnStart - 1) * columnGapValue;

	const height =
		rowSizes.length > 0
			? rowSizes
					.slice(rowStart - 1, rowEnd - 1)
					.reduce((sum, size) => sum + size, 0) +
				(rowEnd - rowStart - 1) * rowGapValue
			: (rowEnd - rowStart) * 100; // Default row height of 100

	// TODO: remove this in favor of callback (onItemVisible)
	if (__DEV__) {
		console.log(`[rngv] grid Item ${key}:`, {
			position: { columnStart, columnEnd, rowStart, rowEnd },
			calculated: { left, top, width, height },
		});
	}

	return {
		top,
		left,
		width,
		height,
		columnStart,
		columnEnd,
		rowStart,
		rowEnd,
		item,
		originalStyle,
		key: String(key),
	};
}

/**
 * Auto-place grid items that don't have explicit positioning
 */
function autoPlaceGridItems(
	gridItems: GridItemData[],
	maxColumns: number,
): void {
	// For now, this is a simple implementation
	// Could be enhanced to implement proper CSS Grid auto-placement algorithm

	const explicitItems = gridItems.filter(
		(item) =>
			item.columnStart !== 1 ||
			item.columnEnd !== 2 ||
			item.rowStart !== 1 ||
			item.rowEnd !== 2,
	);

	const autoItems = gridItems.filter(
		(item) =>
			item.columnStart === 1 &&
			item.columnEnd === 2 &&
			item.rowStart === 1 &&
			item.rowEnd === 2,
	);

	// Simple auto-placement: place items in order
	let currentRow = 1;
	let currentColumn = 1;

	for (const item of autoItems) {
		// Find next available position
		while (isPositionOccupied(currentColumn, currentRow, explicitItems)) {
			currentColumn++;
			if (currentColumn > maxColumns) {
				currentColumn = 1;
				currentRow++;
			}
		}

		item.columnStart = currentColumn;
		item.columnEnd = currentColumn + 1;
		item.rowStart = currentRow;
		item.rowEnd = currentRow + 1;

		// Recalculate position and size
		// This would need to be updated with proper column/row sizes

		currentColumn++;
		if (currentColumn > maxColumns) {
			currentColumn = 1;
			currentRow++;
		}
	}
}

/**
 * Check if a grid position is occupied
 */
function isPositionOccupied(
	column: number,
	row: number,
	items: GridItemData[],
): boolean {
	return items.some(
		(item) =>
			column >= item.columnStart &&
			column < item.columnEnd &&
			row >= item.rowStart &&
			row < item.rowEnd,
	);
}

/**
 * Calculate total height based on grid items
 */
function calculateTotalHeight(
	maxRow: number,
	rowSizes: number[],
	rowGap: number,
	gridItems: GridItemData[],
): number {
	if (rowSizes.length > 0) {
		return (
			rowSizes.reduce((sum, size) => sum + size, 0) +
			(rowSizes.length - 1) * rowGap
		);
	}

	// Auto-calculate based on items
	return maxRow * 100 + (maxRow - 1) * rowGap; // Default row height of 100
}
