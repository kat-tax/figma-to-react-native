import { Component } from 'react';
import { GameProps } from './Game.interface';
/** A component that runs an emulator for a rom */
export declare class Game extends Component<GameProps> {
    #private;
    play(): void;
    pause(): void;
    cmd(type: string, data?: unknown): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
