import {NodeAttrType} from 'types/node';
import type {Monaco, MonacoTextModel, MonacoWorkerTS} from '../monaco';

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
  model: MonacoTextModel
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
  model: MonacoTextModel,
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
  model: MonacoTextModel,
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
            const [type, opts] = await getTypeFromDisplayParts(client, details.displayParts, definitions?.[0]?.fileName);
            const props: TypeScriptComponentProps = {
              type,
              opts,
              name: details.name,
              tags: details.tags,
              mods: details.kindModifiers?.split(','),
              docs: details?.documentation?.[0]?.text,
            };
            // console.log('>> [lang:details]', entry.name, definitions, completions, details, type, opts, props);
            return props;
          }) ?? []
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

async function getTypeFromDisplayParts(
  client: MonacoWorkerTS,
  displayParts?: Array<{text: string; kind: string}>,
  sourceFile?: string,
): Promise<[NodeAttrType, Array<string> | null]> {
  if (!displayParts) return [NodeAttrType.String, null];

  // Check if an alias is used
  let alias = displayParts.find(part => part.kind === 'aliasName')?.text;
  const propertyName = displayParts.find(part => part.kind === 'propertyName')?.text;

  // Check for function types
  const isFunction = displayParts.some(part =>
    (part.kind === 'punctuation' && part.text === '=>'));

  if (isFunction) {
    return [NodeAttrType.Function, null];
  }

  // Check for truncated text, use property name as alias to lookup from source
  const trunc = displayParts.find(part => part.kind === 'text'
    && part.text.includes('more ...'));

  // Check for string literals first (enum case)
  const literals = displayParts
    .filter(part => part.kind === 'stringLiteral')
    .map(part => part.text.replace(/['"]/g, ''));

  // If we have literals and no truncation, use them directly
  if (!trunc && literals.length > 0) {
    return [NodeAttrType.Enum, literals];
  }

  // Check for alias or truncated type, lookup its types from source
  const source = sourceFile && await client.getScriptText(sourceFile);
  if (source && (alias || trunc)) {
    try {
      // For truncated types, we need to find the full type definition in the source
      if (trunc && propertyName) {
        // Try to find the property definition in the source
        const propRegex = new RegExp(`${propertyName}\\??:\\s*([^;]+)`, 'g');
        const propMatch = propRegex.exec(source);

        if (propMatch?.[1]) {
          const propDefinition = propMatch[1];
          // Extract all string literals from the property definition
          const literalRegex = /'([^']+)'|"([^"]+)"/g;
          const propLiterals = new Set<string>();
          let literalMatch: RegExpExecArray | null;

          while ((literalMatch = literalRegex.exec(propDefinition)) !== null) {
            propLiterals.add(literalMatch[1] || literalMatch[2]);
          }

          if (propLiterals.size > 0) {
            return [NodeAttrType.Enum, Array.from(propLiterals)];
          }

          // If the property references a type alias, extract that alias name
          const typeRefMatch = propDefinition.match(/\b([A-Z][a-zA-Z0-9]*)\b/);
          if (typeRefMatch?.[1]) {
            alias = typeRefMatch[1]; // Use this alias for further processing
          }
        }
      }

      // Process type alias if we have one
      if (alias) {
        // Collect all string literals from the source file
        const aliasLiterals = new Set<string>();

        // Function to extract literals from a type alias
        const extractLiterals = async (aliasName: string): Promise<void> => {
          // Look for the alias definition in the source file
          const aliasRegex = new RegExp(`type\\s+${aliasName}\\s*=\\s*([^;]+)`, 'g');
          const aliasMatch = aliasRegex.exec(source);
          if (!aliasMatch?.[1]) return;
          const aliasDefinition = aliasMatch[1];

          // Extract string literals directly from the definition
          const literalRegex = /'([^']+)'|"([^"]+)"/g;
          let literalMatch: RegExpExecArray | null;
          while ((literalMatch = literalRegex.exec(aliasDefinition)) !== null) {
            aliasLiterals.add(literalMatch[1] || literalMatch[2]);
          }

          // Look for references to other type aliases
          const referencedTypes = aliasDefinition.match(/\b([A-Z][a-zA-Z0-9]*)\b/g);
          if (referencedTypes) {
            for (const refType of referencedTypes) {
              if (refType !== aliasName) { // Avoid infinite recursion
                await extractLiterals(refType);
              }
            }
          }
        };

        await extractLiterals(alias);

        // If we found literals, return them
        if (aliasLiterals.size > 0) {
          return [NodeAttrType.Enum, Array.from(aliasLiterals)];
        }

        // If we couldn't extract literals directly, try to get definition
        const aliasInfo = await client.getQuickInfoAtPosition(sourceFile, source.indexOf(alias));
        if (aliasInfo?.displayParts) {
          const nestedLiterals = aliasInfo.displayParts
            .filter((part: {text: string; kind: string}) => part.kind === 'stringLiteral')
            .map((part: {text: string; kind: string}) => part.text.replace(/['"]/g, ''));
          if (nestedLiterals.length > 0) {
            return [NodeAttrType.Enum, nestedLiterals];
          }
        }
      }
    } catch (error) {
      console.error('Error resolving type:', error);
    }
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
    case 'function':
      return [NodeAttrType.Function, null];
    default:
      return [NodeAttrType.String, null];
  }
}

export default {
  onTypeScriptWorkerReady,
  getTypeScriptComponents,
};
