import { Rect } from '../common/rect';
export interface IContentMessage
{
    readonly type: IContentMessage.MessageType;
};
export namespace IContentMessage
{
    export enum MessageType {
        FOCUS_NEW,
        REQUEST
    };
};

export namespace Messages
{
    export class FocusNew implements IContentMessage
    {
        type: IContentMessage.MessageType = IContentMessage.MessageType.FOCUS_NEW;
        constructor(
            public readonly valid: boolean,
            public readonly rect?: Rect
        ){}
    };

    export class Request implements IContentMessage
    {
        type: IContentMessage.MessageType = IContentMessage.MessageType.REQUEST;
    };
};