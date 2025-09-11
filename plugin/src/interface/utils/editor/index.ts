import {emit} from '@create-figma-plugin/utilities';
import {fs, ZipFileEntry} from '@zip.js/zip.js';
import {componentPathNormalize} from 'common/string';
import {F2RN_EDITOR_NS, F2RN_EXO_TYPE_ZIP} from 'config/consts';
import schema from 'interface/schemas/schema.json';

import * as $ from 'store';

import diff from './lib/diff';
import imports from './lib/imports';
import copilot from './lib/copilot';
import prompts from './lib/prompts';
import language from './lib/language';

import type {UserSettings} from 'types/settings';
import type {EventFocusNode} from 'types/events';
import type {ComponentLinks} from 'types/component';
import type {TypeScriptComponents} from './lib/language';
import type {Monaco, MonacoEditor, MonacoTextModel} from './monaco';

// Define a type for the toolbar state
export interface NodeToolbarState {
  nodeId: string;
  nodeName: string;
  position: { top: number; left: number };
  isVisible: boolean;
}

// Create a global event emitter for toolbar state changes
export const toolbarEvents = {
  listeners: new Set<(state: NodeToolbarState | null) => void>(),

  subscribe(listener: (state: NodeToolbarState | null) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  emit(state: NodeToolbarState | null) {
    this.listeners.forEach(listener => listener(state));
  }
};

export async function initPackageTypes(monaco: Monaco) {
  const ts = monaco.languages.typescript.typescriptDefaults;
  const zip = new fs.FS();
  const entries = await zip.importHttpContent(F2RN_EXO_TYPE_ZIP);
  const contents = entries
    .filter(entry => !entry.data.directory)
    .map(async (entry) => {
      return {
        content: await (entry as ZipFileEntry<string, string>).getText('utf-8'),
        filePath: `${F2RN_EDITOR_NS}node_modules${entry.data.filename.replace(/^packages/, '')}`
      };
    });
  ts.setExtraLibs(await Promise.all(contents));
}

export function initTypescript(monaco: Monaco, settings: UserSettings) {
  const ts = monaco.languages.typescript.typescriptDefaults;
  ts?.setInlayHintsOptions(settings.monaco.inlayHints);
  ts?.setDiagnosticsOptions(settings.monaco.diagnostics);
  ts?.setCompilerOptions({
    ...settings.monaco.compiler,
    jsx: monaco.languages.typescript.JsxEmit.ReactNative,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    paths: {
      'theme': [`${F2RN_EDITOR_NS}theme.ts`],
      'components/*': [`${F2RN_EDITOR_NS}*`],
      'react-exo/*': [`${F2RN_EDITOR_NS}node_modules/react-exo`],
      '@lingui/react/macro': [`${F2RN_EDITOR_NS}node_modules/@lingui/react/macro`],
    }
  });

  // Add theme file
  const theme = $.projectTheme.get().toString();
  if (theme) {
    const uri = monaco.Uri.parse(`${F2RN_EDITOR_NS}theme.ts`);
    const model = monaco.editor.getModel(uri);
    if (!model) {
      monaco.editor.createModel(theme, 'typescript', uri);
    } else {
      model.setValue(theme);
    }
  }

  // Add library files
  for (const [k,v] of Object.entries(imports)) {
    const uri = monaco.Uri.parse(k);
    const model = monaco.editor.getModel(uri);
    if (!model) {
      monaco.editor.createModel(v, 'typescript', uri);
    } else {
      model.setValue(v);
    }
  }
}

export function initFileOpener(monaco: Monaco, links?: ComponentLinks) {
  // Example 1: testID={props.testID ?? "1034:553"}
  // Example 2: testID="1034:553"
  const regexTestId = /testID=(?:"(\d+:\d+)"|{props\.testID \?\? "(\d+:\d+)"})/;
  return monaco.editor.registerEditorOpener({
    openCodeEditor(source, resource) {
      let nodeId: string | undefined;
      const base = `${resource.scheme}://${resource.authority}/`;
      if (base === F2RN_EDITOR_NS) {
        // Foreign model, search for path in component links
        const isOriginFile = resource.path !== source.getModel().uri.path;
        if (isOriginFile) {
          nodeId = links?.[componentPathNormalize(resource.path)];
        }

        // Search for test ids if no component name found
        if (!nodeId) {
          const sel = source.getSelection();
          const model = source.getModel();
          for (let i = sel.startLineNumber; i <= sel.endLineNumber; i++) {
            const line = model?.getLineContent(i);
            const match = line?.match(regexTestId);
            if (match?.length) {
              const [_, literal, prop] = match;
              nodeId = prop ? links?.[componentPathNormalize(model.uri.path)] : literal;
            }
          }
        }
      }
      // Focus node in editor
      // TODO: support multiple nodes
      if (nodeId) {
        emit<EventFocusNode>('NODE_FOCUS', nodeId);
      }
      console.debug('[open file]', {resource, base, nodeId, links, source});
      return false;
    }
  }).dispose;
}

export function initSettingsSchema(monaco: Monaco) {
  const json = monaco.languages.json.jsonDefaults;
  json?.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      schema,
      uri: 'http://fig.run/schema-settings.json',
      fileMatch: [
        monaco?.Uri.parse(`${F2RN_EDITOR_NS}settings.json`).toString(),
      ],
    }],
  });
}

export async function initComponentEditor(
  editor: MonacoEditor,
  monaco: Monaco,
  onDiff: () => void,
  onPrompt: () => void,
  onComponents: (components: TypeScriptComponents) => void,
) {
  // console.log('[init editor]', editor, monaco);
  diff.init(monaco, editor, onDiff);
  prompts.init(monaco, editor, onPrompt);
  copilot.init(monaco, editor);

  const cleanup = initNodeToolbar(monaco, editor);
  const model = editor.getModel();

  // Initialize components
  await language.onTypeScriptWorkerReady(monaco, model);
  const components = await language.getTypeScriptComponents(monaco, model);
  onComponents(components);

  // Update components on model change
  editor.onDidChangeModel(async (e) => {
    const newModel = monaco.editor.getModel(e.newModelUrl);
    const components = await language.getTypeScriptComponents(monaco, newModel);
    onComponents(components);
  });

  // Return cleanup function
  return () => {
    cleanup?.();
  };
}

export function initNodeToolbar(monaco: Monaco, editor: MonacoEditor) {
  // Track decorations per model
  const modelDecorations = new Map<string, string[]>();
  let currentModel = editor.getModel();
  let currentModelId = currentModel?.uri.toString() || '';
  let activeNodeId: string | null = null;

  // Function to update decorations for the current model
  const updateDecorations = (model: MonacoTextModel | null) => {
    if (!model) return;

    const modelId = model.uri.toString();
    const currentDecorations = modelDecorations.get(modelId) || [];
    const decorations = [];

    // Process the model line by line
    for (let i = 0; i < model.getLineCount(); i++) {
      const lineContent = model.getLineContent(i + 1);

      // Find testID props in the line
      const testIdRegex = /testID=((?:{[^}]+})|(?:"([^"]+)"|'([^']+)'))/g;
      let match: RegExpExecArray | null = null;

      while ((match = testIdRegex.exec(lineContent)) !== null) {
        if (match.index !== undefined) {
          const startPos = match.index;
          const endPos = startPos + match[0].length;

          // Extract the actual testID value
          let testIdValue = match[2] || match[3]; // Direct string value
          if (!testIdValue && match[1].startsWith('{')) {
            // Try to extract from expressions like {props.testID ?? "1034:553"}
            const exprMatch = match[1].match(/{\s*props\.testID\s*\?\?\s*["']([^"']+)["']\s*}/);
            if (exprMatch) {
              testIdValue = exprMatch[1];
            } else {
              // For other complex expressions, just use a generic placeholder
              testIdValue = "...";
            }
          }

          // Determine if this is the active testID
          const isActive = activeNodeId === testIdValue;

          // Add a decoration to make the folding more visible
          decorations.push({
            range: new monaco.Range(
              i + 1,
              startPos + 1,
              i + 1,
              endPos + 1
            ),
            options: {
              isWholeLine: false,
              inlineClassName: 'testid-prop',
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              after: {
                content: `#${testIdValue}`,
                inlineClassName: isActive ? 'testid-placeholder testid-placeholder-active' : 'testid-placeholder',
                hoverMessage: { value: `Click to focus node ${testIdValue}` }
              },
              beforeContentClassName: 'testid-before-content'
            }
          });
        }
      }
    }

    // Apply all decorations at once, replacing any existing ones
    const newDecorations = model.deltaDecorations(currentDecorations, decorations);
    modelDecorations.set(modelId, newDecorations);
  };

  // Clear decorations for a specific model
  const clearDecorations = (modelId: string) => {
    const model = monaco.editor.getModel(monaco.Uri.parse(modelId));
    if (model) {
      const currentDecorations = modelDecorations.get(modelId) || [];
      model.deltaDecorations(currentDecorations, []);
    }
    modelDecorations.delete(modelId);
  };

  // Function to show the NodeToolbar via the event emitter
  const showNodeToolbar = (nodeId: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();

    // Get the current model and position
    const model = editor.getModel();
    const position = editor.getPosition();

    // Default node name
    let nodeName = "Component";

    if (model && position) {
      // Get the current line and a few lines before it
      const startLine = Math.max(1, position.lineNumber - 5);
      const endLine = position.lineNumber;

      // Search for the closest opening tag
      for (let i = endLine; i >= startLine; i--) {
        const lineContent = model.getLineContent(i);
        const tagMatch = lineContent.match(/<([A-Z][a-zA-Z0-9]*)/);

        if (tagMatch && tagMatch[1]) {
          nodeName = tagMatch[1];
          break;
        }
      }
    }

    // Set the active node ID and update decorations
    activeNodeId = nodeId;
    if (currentModel) {
      updateDecorations(currentModel);
    }

    // Emit the toolbar state change event
    toolbarEvents.emit({
      nodeId,
      nodeName,
      isVisible: true,
      position: {
        top: rect.top - (40 * 2),
        left: rect.left
      },
    });
  };

  // Function to hide the NodeToolbar
  const hideNodeToolbar = () => {
    // Clear the active node ID and update decorations
    activeNodeId = null;
    if (currentModel) {
      updateDecorations(currentModel);
    }

    toolbarEvents.emit(null);
  };

  // Add CSS for the decoration
  const styleId = 'testid-folding-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      .testid-prop {
        display: none;
      }
      .testid-placeholder {
        opacity: 0.7;
        font-style: italic;
        color: #888;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 3px;
        cursor: pointer;
      }
      .testid-placeholder:hover {
        opacity: 1;
        text-decoration: underline;
      }
      .testid-placeholder-active {
        color: var(--figma-color-text-component) !important;
        text-decoration: none !important;
        font-style: normal !important;
        font-weight: 500 !important;
        opacity: 1 !important;
      }
      .testid-before-content {
        display: none;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Register folding provider for JSX/TSX files
  const foldingProvider = monaco.languages.registerFoldingRangeProvider(
    ['typescriptreact'],
    {
      provideFoldingRanges(model) {
        if (!model) return [];
        const ranges = [];
        // Process the model line by line
        for (let i = 0; i < model.getLineCount(); i++) {
          const lineContent = model.getLineContent(i + 1);
          // Find testID props in the line
          const testIdRegex = /testID=((?:{[^}]+})|(?:"([^"]+)"|'([^']+)'))/g;
          let match: RegExpExecArray | null = null;
          while ((match = testIdRegex.exec(lineContent)) !== null) {
            if (match.index !== undefined) {
              // Create a folding range for this testID prop
              ranges.push({
                start: i + 1,
                end: i + 1,
                kind: monaco.languages.FoldingRangeKind.Comment
              });
            }
          }
        }
        return ranges;
      }
    }
  );

  // Handle mouse clicks on testID placeholders
  const clickHandler = editor.onMouseDown((e) => {
    if (e.target.element?.classList.contains('testid-placeholder')) {
      // Extract the nodeId from the placeholder text
      const placeholderText = e.target.element.textContent || '';
      const nodeId = placeholderText.startsWith('#') ? placeholderText.substring(1) : placeholderText;
      if (nodeId && nodeId !== '...') {
        // Highlight the node in Figma (if alt-key is pressed)
        if (e.event.altKey) {
          emit<EventFocusNode>('NODE_FOCUS', nodeId);
        // Otherwise, show the NodeToolbar via the event emitter
        } else {
          showNodeToolbar(nodeId, e.target.element);
        }
      }
    } else if (!e.target.element?.closest('.editor-node-toolbar')) {
      // Hide the toolbar when clicking elsewhere in the editor
      hideNodeToolbar();
    }
  });

  // Handle model changes in the editor
  const modelChangeListener = editor.onDidChangeModel(() => {
    // Hide any active toolbar when changing models
    hideNodeToolbar();

    // Clear decorations for the previous model
    if (currentModelId) {
      clearDecorations(currentModelId);
    }

    // Update current model reference
    currentModel = editor.getModel();
    currentModelId = currentModel?.uri.toString() || '';

    // Apply decorations to the new model
    if (currentModel) {
      updateDecorations(currentModel);
    }
  });

  // Handle content changes in the current model
  const contentChangeListener = editor.onDidChangeModelContent(() => {
    if (currentModel) {
      updateDecorations(currentModel);
    }
  });

  // Initial decoration update
  if (currentModel) {
    updateDecorations(currentModel);
  }

  // Return cleanup function
  return () => {
    clickHandler.dispose();
    foldingProvider.dispose();
    modelChangeListener.dispose();
    contentChangeListener.dispose();
    hideNodeToolbar();
    for (const modelId of modelDecorations.keys()) {
      clearDecorations(modelId);
    }
  };
}
