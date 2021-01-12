import { ICommonMessage } from './common-messages';
export interface IMessage
{
    readonly type: IMessage.Types;
};

export namespace IMessage
{
    export enum Types {
        REGISTER = 0,
        DIRECTED_EVENT,
        BUBBLE_EVENT,
        TOP_EVENT,
        TEXT_ENTERED,
        NOTIFY_PII
    };
    export class Register implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.REGISTER;
    };
    export class DirectedEvent implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.DIRECTED_EVENT;
        constructor(public event: ICommonMessage, public url?: string){}
    };
    export class BubbleEvent implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.BUBBLE_EVENT;
        constructor(
            public event: ICommonMessage,
            public original_sender?: number,
            public url?: string
        ){}
    };
    export class TopEvent implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.TOP_EVENT;
        constructor(public event: ICommonMessage){}
    };
    export class TextEntered implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.TEXT_ENTERED;
        constructor(public text: string){}
    };
    export class NotifyPII implements IMessage
    {
        public type: IMessage.Types = IMessage.Types.NOTIFY_PII;
        constructor(
            public severity_mapping: number,
            public pii: Array<string>
        ){}
    };
};