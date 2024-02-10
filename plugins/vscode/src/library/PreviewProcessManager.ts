import type {PreviewerData} from '../types/previewer';

var kill = require('tree-kill');

/**
 * Manages preview processes for files.
 */
export class PreviewProcessManager {
  // Map to store the preview processes for each file
  private readonly _processes = new Map<string, PreviewerData>();

  /**
   * Adds a new preview process for a file.
   * @param file The file to add the preview process for.
   * @param previewerData The preview process data.
   */
  public addProcess(file: string, previewerData: PreviewerData) {
    this._processes.set(file, previewerData);
  }

  /**
   * Gets the preview process data for a file.
   * @param file The file to get the preview process data for.
   * @returns The preview process data for the file, or undefined if no preview process is found.
   */
  public getPreviewerData(file: string): PreviewerData | undefined {
    return this._processes.get(file);
  }

  /**
   * Ends the preview process for a file.
   * @param file The file to end the preview process for.
   */
  public endProcess(file: string) {
    // Get the process ID for the file
    const {pid} = this._processes.get(file) ?? {};
    if (pid) {
      // Remove the process from the map and kill the process
      kill(pid, 'SIGKILL', (err: any) => {
        if (err) {
          console.error(err);
        }
      });
      this._processes.delete(file);
    }
  }

  /**
   * Ends all preview processes.
   */
  public killPreviewProcess() {
    // End the process for each file in the map
    this._processes.forEach((value, key) => {
      this.endProcess(key);
    });
  }
}
