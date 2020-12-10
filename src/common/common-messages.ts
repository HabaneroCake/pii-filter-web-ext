import { Rect } from "./rect";

export interface ICommonMessage
{
    readonly type: ICommonMessage.Type;
};
export namespace ICommonMessage
{
    export enum Type {
        FOCUS
    };
    export class Focus implements ICommonMessage
    {
        type: ICommonMessage.Type = ICommonMessage.Type.FOCUS;
        constructor(
            public readonly valid: boolean,
            public readonly rect?: Rect
        ){}
    };
};