import { ICommonMessage } from './common-messages';
export interface IMessage
{
    readonly type: IMessage.Types;
};

export namespace IMessage
{
    export enum Types {
        REGISTER,
        BUBBLE_EVENT,
        TOP_EVENT
    };

    export class Register implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.REGISTER;
    };
    export class BubbleEvent implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.BUBBLE_EVENT;
        constructor(public event: ICommonMessage, public url?: string){}
    };
    export class TopEvent implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.TOP_EVENT;
        constructor(public event: ICommonMessage){}
    };
};