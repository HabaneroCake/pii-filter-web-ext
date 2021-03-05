import { Runtime } from "webextension-polyfill-ts";

export class PortManager {
    //                      tab         frame       port
    protected endpoints: Map<number, Map<number, Map<string, Runtime.Port>>> = new Map();

    // adds a port
    public add(tab: number, frame: number, port: string, value: Runtime.Port): [boolean, boolean, boolean]
    {
        let res: [boolean, boolean, boolean] = [false, false, false];

        // create tab
        if (!this.endpoints.has(tab)) {
            this.endpoints.set(tab, new Map<number, Map<string, Runtime.Port>>());
            res[0] = true;
        }
        
        const frames = this.endpoints.get(tab);
        if (!frames.has(frame)) {
            frames.set(frame, new Map<string, Runtime.Port>());
            res[1] = true;
        }
        
        const ports = frames.get(frame);
        if (ports.has(port))
            throw new Error(`Port ${tab}:${frame}:${port} already exists.`);

        ports.set(port, value);
        res[2] = true;

        return res;
    }
    // removes a port and/ or its parent container if it is now empty
    public remove(tab: number, frame: number, port: string): [boolean, boolean, boolean]
    {
        let res: [boolean, boolean, boolean] = [false, false, false];

        if (this.endpoints.has(tab))
        {
            const frames = this.endpoints.get(tab);
            if (frames.has(frame))
            {
                const ports = frames.get(frame);
                if (ports.has(port)) {
                    ports.delete(port);
                    res[2] = true;
                }
                if (ports.size == 0) {
                    frames.delete(frame);
                    res[1] = true;
                }
            }
            if (frames.size == 0) {
                this.endpoints.delete(tab);
                res[0] = true;
            }
        }

        return res;
    }
    // gets a port if it exist otherwise returns null
    public get(tab: number, frame: number, port: string): Runtime.Port
    {
        if (this.endpoints.has(tab))
        {
            const frames = this.endpoints.get(tab);
            if (frames.has(frame))
            {
                const ports = frames.get(frame);
                if (ports.has(port))
                    return ports.get(port);
            }
        }
        return null;
    }
};