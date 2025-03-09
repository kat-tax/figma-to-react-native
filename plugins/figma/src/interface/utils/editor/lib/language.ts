import {NodeAttrType} from 'types/node';

import type * as monaco from 'monaco-editor';
import type {Monaco} from '../index';

const IGNORE_PROPS = ['key', 'style', 'testid'];

export type TypeScriptComponents = Map<string, TypeScriptComponent>;

export type TypeScriptComponent = {
  file: string;
  name: string;
  props: Array<TypeScriptComponentProps>;
};

export type TypeScriptComponentProps = {
  name: string;
  docs: string;
  type: NodeAttrType;
  opts: Array<string> | null;
  mods: Array<string>;
  tags?: Array<{
    name: string;
    text: Array<{
      text: string;
      kind: string;
    }>;
  }>;
};

async function isTypeScriptWorkerReady(
  monaco: Monaco,
  model: monaco.editor.ITextModel
): Promise<boolean> {
  try {
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await worker();
    const uri = model.uri.toString();
    await client.getSemanticDiagnostics(uri);
    return true;
  } catch (error) {
    return false;
  }
}

async function onTypeScriptWorkerReady(
  monaco: Monaco,
  model: monaco.editor.ITextModel,
) {
  const poll = setInterval(async () => {
    const ready = await isTypeScriptWorkerReady(monaco, model);
    if (ready) {
      clearInterval(poll);
      return true;
    }
  }, 100);
}

async function getTypeScriptComponents(
  monaco: Monaco,
  model: monaco.editor.ITextModel,
): Promise<TypeScriptComponents | null> {
  try {
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await worker();
    const uri = model?.uri?.toString();
    if (!uri) return null;

    // Find all component tags
    const content = model.getValue();
    const matches = content.matchAll(/<(\w+)[\s>]/g);
    
    // Get completion info for each unique component
    const components = new Set<string>();
    const componentsMap: TypeScriptComponents = new Map();
    
    for (const match of matches) {
      const componentName = match[1];
      if (components.has(componentName)) continue;
      components.add(componentName);

      // Get component position from match index
      const position = model.getPositionAt(match.index!);
      const componentOffset = model.getOffsetAt({
        lineNumber: position.lineNumber,
        column: position.column + 1,
      });
      
      // Get component props offset relative to opening tag
      const lineContent = model.getLineContent(position.lineNumber);
      const isMultiLine = lineContent.trim() === `<${componentName}`;
      const propsOffset = model.getOffsetAt({
        lineNumber: position.lineNumber + (isMultiLine ? 1 : 0),
        column: isMultiLine ? 0 : position.column + match[0].length,
      });

      // Get intellisense info
      const [definitions, completions] = await Promise.all([
        client.getDefinitionAtPosition(uri, componentOffset) as any,
        client.getCompletionsAtPosition(uri, propsOffset) as any,
      ]);

      // Get completion and type info
      const componentProps: Array<TypeScriptComponentProps> = await Promise.all(
        completions?.entries
          ?.filter((entry: any) =>
            entry.kind !== monaco.languages.CompletionItemKind.Property)
          ?.filter((entry: any) => !IGNORE_PROPS.includes(entry.name.toLowerCase()))
          ?.map(async (entry: any) => {
            const details = await client.getCompletionEntryDetails(uri, propsOffset, entry.name);
            const [type, opts] = getTypeFromDisplayParts(client, details.displayParts);
            const props: TypeScriptComponentProps = {
              type,
              opts,
              name: details.name,
              tags: details.tags,
              mods: details.kindModifiers?.split(','),
              docs: details?.documentation?.[0]?.text,
            };
            return props;
          })
      );

      // Record props for component
      componentsMap.set(componentName, {
        name: componentName,
        file: definitions?.[0]?.fileName,
        props: componentProps,
      });
    }

    // Remove components with no props
    componentsMap.forEach((component, name) => {
      if (component.props.length === 0) {
        componentsMap.delete(name);
      }
    });

    return componentsMap;
  } catch (error) {
    console.error('Error getting component props:', error);
    return null;
  }
}

function getTypeFromDisplayParts(
  client: monaco.languages.typescript.TypeScriptWorker,
  displayParts?: Array<{text: string; kind: string}>
): [NodeAttrType, Array<string> | null] {
  if (!displayParts) return null;
  
  // Check for string literals first (enum case)
  const literals = displayParts
    .filter(part => part.kind === 'stringLiteral')
    .map(part => part.text.replace(/['"]/g, ''));
  if (literals.length > 0) {
    return [NodeAttrType.Enum, literals];
  }

  // Check for alias, lookup it's types
  const alias = displayParts.find(part => part.kind === 'aliasName')?.text;
  if (alias) {
    // TODO: Lookup alias type in language server
    console.log('>> [alias]', alias, displayParts);
    return [NodeAttrType.Enum, []];
  }

  // Check for primitive types (default to string)
  const keyword = displayParts
    .find(part => part.kind === 'keyword')?.text;

  switch (keyword?.toLowerCase()) {
    case 'string':
      return [NodeAttrType.String, null];
    case 'number':
      return [NodeAttrType.Number, null];
    case 'boolean':
      return [NodeAttrType.Boolean, null];
    default:
      return [NodeAttrType.String, null];
  }
}

export default {
  onTypeScriptWorkerReady,
  getTypeScriptComponents,
};
