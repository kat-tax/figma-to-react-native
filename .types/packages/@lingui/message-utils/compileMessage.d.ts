type CompiledIcuChoices = Record<string, CompiledMessage> & {
    offset: number | undefined;
};
type CompiledMessageToken = string | [
    name: string,
    type?: string,
    format?: null | string | unknown | CompiledIcuChoices
];
type CompiledMessage = CompiledMessageToken[];
type MapTextFn = (value: string) => string;
declare function compileMessageOrThrow(message: string, mapText?: MapTextFn): CompiledMessage;
declare function compileMessage(message: string, mapText?: MapTextFn): CompiledMessage;

export { type CompiledIcuChoices, type CompiledMessage, type CompiledMessageToken, compileMessage, compileMessageOrThrow };
