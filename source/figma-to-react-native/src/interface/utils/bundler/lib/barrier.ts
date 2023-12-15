export class Barrier {
  private readonly resolvers: Array<() => void> = [];
  private paused: boolean = true;

  constructor(paused: boolean = true) {
    this.paused = paused;
  }

  /** Pauses this barrier causing operations to wait. */
  public pause(): void {
    this.paused = true;
  }

  /** Resumes this barrier causing all operations to run. */
  public resume(): void {
    this.paused = false;
    this.dispatch();
  }

  /** Waits until this barrier enters a resumed state. */
  public wait(): Promise<void> {
    return this.paused
      ? new Promise((resolve) => this.resolvers.push(resolve))
      : Promise.resolve(void 0);
  }

  private async dispatch(): Promise<void> {
    while (!this.paused && this.resolvers.length > 0) {
      const resolve = this.resolvers.shift()!;
      resolve();
    }
  }
}
