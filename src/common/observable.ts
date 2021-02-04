/**
 * Thin wrapper to separate private and public interfaces of Observable
 */
export class Observable<T>
{
    /**
     * start observing
     * @param callback the callback which will be called with the new value
     */
    public readonly observe: (callback: (val: T)=>void)=>void;
    /**
     * stop observing
     * @param callback the callback which was added earlier
     */
    public readonly disregard: (callback: (val: T)=>void)=>void;
    /**
     * public getter for internal value
     */
    public readonly get: (callback: ()=>T)=>T;

    constructor(variable: Observable.Variable<T>)
    {
        this.observe =      variable.observe.bind(variable);
        this.disregard =    variable.disregard.bind(variable);
        this.get =          variable.get.bind(variable);
    }
}

export namespace Observable
{
    export class Variable<T>
    {
        private _observers: Array<(val: T)=>void> = new Array<(val: T)=>void>();
        private _value: T = null;

        constructor(protected notify_on_diff_only: boolean = true) {}

        public get value(): T
        {
            return this._value;
        }
        /**
         * setter for value (notifies observers)
         */
        public set value(new_value: T)
        {
            if (!this.notify_on_diff_only || this.value !== new_value)
            {
                this._value = new_value;
                this.notify();
            }
        }
        public notify()
        {
            this._observers.forEach((callback: (val: T)=>void) => {
                callback(this.value);
            });
        }
        public get(): T
        {
            return this.value;
        }
        /**
         * start observing
         * @param callback the callback which will be called with the new value
         */
        public observe(callback: (val: T)=>void)
        {
            if (this._observers.indexOf(callback) > -1)
                throw new Error(`Observer already exists on Variable.`);
            this._observers.push(callback);
        }
        /**
         * stop observing
         * @param callback the callback which was added earlier (When omitted removes all listeners)
         */
        public disregard(callback?: (val: T)=>void)
        {
            if (callback == null)
                this._observers = new Array<(val: T)=>void>();
                
            let index_of_callback = this._observers.indexOf(callback, 0);
            if (index_of_callback > -1)
                this._observers.splice(index_of_callback, 1);
            else
                throw new Error(`Observer does not exist on Variable.`);
        }
    }
}