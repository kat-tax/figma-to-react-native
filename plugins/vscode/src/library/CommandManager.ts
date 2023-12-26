import * as vscode from 'vscode';

/**
 * A command that can be executed.
 */
export interface Command {
  readonly id: string; // The ID of the command.

  /**
   * Executes the command with the given arguments.
   * @param args The arguments to pass to the command.
   */
  execute(...args: any[]): void;
}

/**
 * A manager for registering and disposing of commands.
 */
export class CommandManager {
  private readonly _commands = new Map<string, vscode.Disposable>(); // A map of command IDs to disposables.

  /**
   * Disposes of all registered commands.
   */
  public dispose() {
    for (const registration of this._commands.values()) {
      registration.dispose();
    }
    this._commands.clear();
  }

  /**
   * Registers a command with the manager.
   * @param command The command to register.
   * @returns A disposable that can be used to unregister the command.
   */
  public register<T extends Command>(command: T): vscode.Disposable {
    this._registerCommand(command.id, command.execute, command);
    return new vscode.Disposable(() => {
      this._commands.delete(command.id);
    });
  }

  /**
   * Registers a command with VS Code.
   * @param id The ID of the command.
   * @param impl The implementation of the command.
   * @param thisArg The `this` value to use when calling the implementation.
   */
  private _registerCommand(id: string, impl: (...args: any[]) => void, thisArg?: any) {
    if (this._commands.has(id)) {
      return;
    }

    this._commands.set(id, vscode.commands.registerCommand(id, impl, thisArg));
  }
}
