import * as net from 'net';

import {EventDispatcher, IEvent} from 'strongly-typed-events';
import {Messages} from '../services/Messages';
import {logger} from '../util/Utilities';

import type * as sm from '../types/project';

/**
 * Represents a preview server that can send data and update TSX files.
 */
export interface IPreviewServer {
  sendData(data: Buffer): void;
  updateTSX(fileData: sm.File, tsxText: string): void;
}

/**
 * Represents a preview server that can send data and update TSX files.
 */
export class PreviewServer implements IPreviewServer {
  /**
   * Starts the preview server.
   */
  public async start() {
    logger.appendLine(`PreviewServer.start ${this._filePath}`);

    this._server.listen(this._port, this._host, () =>
      logger.appendLine(`Preview server listening on port ${this._port}`)
    );
    this._server.on('connection', this.handleSocketEvents.bind(this));
  }

  handleSocketEvents(socket: net.Socket) {
    logger.appendLine(`Preview server connected on port ${socket.localPort}`);
    this._socket = socket;

    socket.on("data", (data) => {
      this._onMessage.dispatch(this, data);
      const msg = Messages.parseIncomingMessage(data);
      logger.appendLine(JSON.stringify(msg.message));
    });

    socket.on("close", () => {
      logger.appendLine(`Preview server closed for ${this._filePath}`);
      this._server.close();
      this._socket?.destroy();
    });

    socket.on("error", (error) => {
      logger.appendLine(`Preview server error: ${error}`);
    });
  }

  /**
   * Stops the preview server.
   */
  public stop() {
    logger.appendLine(`PreviewServer.stop ${this._filePath}`);
    this._server.close();
  }

  /**
   * Gets whether the preview server is running.
   */
  public get isRunning() {
    return this._server?.listening;
  }

  /**
   * Gets an instance of the preview server for the specified file path and port.
   * @param filePath The path of the file to preview
   * @param port The port to use for the preview server
   */
  public static getInstance(filePath: string, port: number): PreviewServer {
    var instance = PreviewServer.getInstanceByFilePath(filePath);
    if (instance) {
      return instance;
    }

    PreviewServer._instance ??= new PreviewServer(filePath, port);
    PreviewServer._servers.set(filePath, PreviewServer._instance);
    return PreviewServer._instance;
  }

  /**
   * Gets an instance of the preview server for the specified file path
   * @param filePath The path of the file
   */
  public static getInstanceByFilePath(filePath: string): PreviewServer | undefined {
    var instance = PreviewServer._servers.get(filePath);
    return instance;
  }

  private constructor(private _filePath: string, private _port: number) {
    this._server = net.createServer();
  }

  updateTSX(fileData: sm.File, tsxText: string): void {
    const msg = Messages.updateTSX(fileData.targetPath, tsxText);
    this._socket?.write(msg);
  }

  sendData(_data: Buffer): void {
    logger.appendLine('In PreviewServer.sendData');
  }

  public get onMessage(): IEvent<IPreviewServer, Buffer> {
    return this._onMessage.asEvent();
  }

  _onMessage = new EventDispatcher<IPreviewServer, Buffer>();
  _server: net.Server;
  _socket: net.Socket | undefined;
  _host = '127.0.0.1';

  private static _instance: PreviewServer;
  private static _servers = new Map<string, PreviewServer>();
}
