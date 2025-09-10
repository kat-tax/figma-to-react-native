import type { Nullable } from '../types';
import type { UnistylesBreakpoints } from '../global';
type MQValue = keyof UnistylesBreakpoints | number;
type MQHandler = {
    only: {
        width(wMin?: Nullable<MQValue>, wMax?: MQValue): symbol;
        height(hMin?: Nullable<MQValue>, hMax?: MQValue): symbol;
    };
    width(wMin?: Nullable<MQValue>, wMax?: MQValue): {
        and: {
            height(hMin?: Nullable<MQValue>, hMax?: MQValue): symbol;
        };
    };
    height(hMin?: Nullable<MQValue>, hMax?: MQValue): {
        and: {
            width(wMin?: Nullable<MQValue>, wMax?: MQValue): symbol;
        };
    };
};
/**
 * Utility to create cross-platform media queries
 * @returns - JavaScript symbol to be used in your stylesheet
 */
export declare const mq: MQHandler;
export {};
//# sourceMappingURL=mq.d.ts.map