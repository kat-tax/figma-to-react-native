import * as net from 'net';

import {EventDispatcher, IEvent} from 'strongly-typed-events';
import {Messages} from '../services/Messages';
import {logger} from '../util/Utilities';

import type * as sm from '../types/project';

/**
 * Represents a preview server that can send data and update XAML files.
 */
export interface IPreviewServer {
	sendData(data: Buffer): void;
	updateXaml(fileData: sm.File, xamlText: string): void;
}

/**
 * Represents a preview server that can send data and update XAML files.
 */
export class PreviewServer implements IPreviewServer {
	/**
	 * Starts the preview server.
	 */
	public async start() {
		logger.appendLine(`PreviewServer.start ${this._assemblyName}`);

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
			logger.appendLine(`Preview server closed for ${this._assemblyName}`);
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
		logger.appendLine(`PreviewServer.stop ${this._assemblyName}`);
		this._server.close();
	}

	/**
	 * Gets whether the preview server is running.
	 */
	public get isRunnig() {
		return this._server?.listening;
	}

	/**
	 * Gets an instance of the preview server for the specified assembly name and port.
	 * @param assemblyName The name of the assembly.
	 * @param port The port to use for the preview server.
	 */
	public static getInstance(assemblyName: string, port: number): PreviewServer {
		var instance = PreviewServer.getInstanceByAssemblyName(assemblyName);
		if (instance) {
			return instance;
		}

		PreviewServer._instance ??= new PreviewServer(assemblyName, port);
		PreviewServer._servers.set(assemblyName, PreviewServer._instance);
		return PreviewServer._instance;
	}

	/**
	 * Gets an instance of the preview server for the specified assembly name
	 * @param assemblyName The name of the assembly.
	 */
	public static getInstanceByAssemblyName(assemblyName: string): PreviewServer | undefined {
		var instance = PreviewServer._servers.get(assemblyName);
		return instance;
	}

	private constructor(private _assemblyName: string, private _port: number) {
		this._server = net.createServer();
	}

	updateXaml(fileData: sm.File, xamlText: string): void {
		const updateXamlMessage = Messages.updateXaml(fileData.targetPath, xamlText);
		this._socket?.write(updateXamlMessage);
	}

	sendData(data: Buffer): void {
		logger.appendLine("In PreviewServer.sendData");
	}

	public get onMessage(): IEvent<IPreviewServer, Buffer> {
		return this._onMessage.asEvent();
	}

	_onMessage = new EventDispatcher<IPreviewServer, Buffer>();

	_server: net.Server;
	_socket: net.Socket | undefined;
	_host = "127.0.0.1";

	private static _instance: PreviewServer;

	private static _servers = new Map<string, PreviewServer>();
}
