import {BSON} from 'bson';

export class Messages {
	public static startDesignerSessionMessageId = '854887CF26944EB6B4997461B6FB96C7';
	public static clientRenderInfoMessageId = '7A3C25D33652438D8EF186E942CC96C0';
	public static clientSupportedPixelFormats = '63481025701643FEBADCF2FD0F88609E';
	public static updateXamlId = '9AEC9A2E63154066B4BAE9A9EFD0F8CC';

	public static parseIncomingMessage(message: Buffer) {
		const length = message.messageSize();
		const type = message.messageTypeId();
		const msg = message.document();

		return { type: type, message: msg, length: length };
	}

	public static clientRenderInfoMessage(): Buffer {
		const message = { dpiX: 192.0, dpiY: 192.0 };
		const messageBuffer = createMessage(message, Messages.clientRenderInfoMessageId);
		return messageBuffer;
	}

	public static clientSupportedPixelFormatsMessage(): Buffer {
		const message = { formats: [1] };
		return createMessage(message, Messages.clientSupportedPixelFormats);
	}

	public static updateXaml(assemblyPath: string, xamlText: string): Buffer {
		const message = {
			assemblyPath: assemblyPath,
			xaml: xamlText,
		};
		return createMessage(message, Messages.updateXamlId);
	}
}

function createMessage(message: any, messageType: string) {
	const bson = BSON.serialize(message);
	const dataLength = bson.length; // 20 is the length of the header
	const total = getLengthBytes(dataLength) + getByString(typeInfo(messageType)) + getByString(bson);
	const messageBytes = Buffer.from(total, 'hex');
	return messageBytes;
}

function getLengthBytes(length: number) {
	const hexDataLength = Buffer.alloc(4);
	hexDataLength.writeUInt32LE(length, 0);
	return hexDataLength.toString('hex').toUpperCase();
}

function getByString(byteArray: any) {
	return byteArray.toString('hex').toUpperCase();
}

export function readBuffer(buffer: Buffer) {
	const data = buffer.slice(20);
	try {
		const bson = BSON.deserialize(data);
		return bson;
	} catch (error: any) {
		console.error(error.message);
		return 'error';
	}
}

export function typeInfo(guid: string) {
	const guidBytes = Buffer.from(guid, 'hex');
	return adjustGuidBytes(guidBytes);
}

export function adjustGuidBytes(byteArray: Buffer) {
	byteArray.slice(0, 4).reverse();
	byteArray.slice(4, 6).reverse();
	byteArray.slice(6, 8).reverse();

	return byteArray;
}

declare global {
	interface Buffer {
		messageSize(): number;
		messageTypeId(): string;
		document(): BSON.Document;
	}
}

Buffer.prototype.messageSize = function (this: Buffer): number {
	return this.readInt32LE(0);
};

Buffer.prototype.messageTypeId = function (this: Buffer): string {
	const typeBytes = this.slice(4, 20);
	const typeInfo = adjustGuidBytes(typeBytes);
	return typeInfo.toString('hex').toUpperCase();
};

Buffer.prototype.document = function (this: Buffer): BSON.Document {
	try {
		const data = this.slice(20);
		const bson = BSON.deserialize(data);
		return bson;
	} catch (error: any) {
		console.error(error.message);
		throw error;
	}
};
