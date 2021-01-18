export interface ICommonMessage
{
    readonly type: ICommonMessage.Type;
};
export namespace ICommonMessage
{
    export enum Type {
        FOCUS,
        REFOCUS,
        TEXT_ENTERED,
        NOTIFY_PII,
        NOTIFY_PII_PARSING
    };
    export class Focus implements ICommonMessage
    {
        type: ICommonMessage.Type = ICommonMessage.Type.FOCUS;
        constructor(
            public readonly valid: boolean,
        ){}
    };
    export class Refocus implements ICommonMessage
    {
        type: ICommonMessage.Type = ICommonMessage.Type.REFOCUS;
    };
    export class TextEntered implements ICommonMessage
    {
        public type: ICommonMessage.Type = ICommonMessage.Type.TEXT_ENTERED;
        constructor(public text: string){}
    };
    export class NotifyPIIParsing implements ICommonMessage
    {
        public type: ICommonMessage.Type = ICommonMessage.Type.NOTIFY_PII_PARSING;
        constructor(){}
    };
    export class NotifyPII implements ICommonMessage
    {
        public type: ICommonMessage.Type = ICommonMessage.Type.NOTIFY_PII;
        constructor(
            public severity_mapping: number,
            public pii: Array<[Array<string>, number?, number?]>
        )
        {
        }
    };
};