/**
 * Thin wrapper to separate private and public interfaces of Observable
 */
export class Observable<T>
{
    /**
     * start observing
     * @param callback the callback which will be called with the new value
     */
    public readonly observe: Function;
    /**
     * stop observing
     * @param callback the callback which was added earlier
     */
    public readonly disregard: Function;
    /**
     * public getter for internal value
     */
    public readonly get: Function;

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
        private _observers: Array<Function> = new Array<Function>();
        private _value: T = null;

        public get value(): T
        {
            return this._value;
        }
        /**
         * setter for value (notifies observers)
         */
        public set value(new_value: T)
        {
            if (this.value !== new_value)
            {
                this._value = new_value;
                this._observers.forEach((callback: Function) => {
                    callback(this.value);
                });
            }
        }
        public get(): T
        {
            return this.value;
        }
        /**
         * start observing
         * @param callback the callback which will be called with the new value
         */
        public observe(callback: Function)
        {
            if (this._observers.includes(callback))
                throw new Error(`Observer already exists on Variable.`);
            this._observers.push(callback);
        }
        /**
         * stop observing
         * @param callback the callback which was added earlier
         */
        public disregard(callback: Function)
        {
            let index_of_callback = this._observers.indexOf(callback, 0);
            if (index_of_callback > -1)
                this._observers.splice(index_of_callback, 1);
            else
                throw new Error(`Observer does not exist on Variable.`);
        }
    }
}