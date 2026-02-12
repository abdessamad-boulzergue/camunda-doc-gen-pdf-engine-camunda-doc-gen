import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class EnvService {

    // The values that are defined here are the default values that can
    // be overridden by env.js

    // API url
    public apiUrl = '';

    // Whether or not to enable production mode
    public enableDebug = true;

    constructor() {
        const browserWindow = window as any;
        const browserWindowEnv = browserWindow['__env'] || {};

        // Assign environment variables from browser window to env
        // In the current implementation, properties from env.js overwrite defaults from the EnvService.
        // If needed, a deep merge could be performed here to merge properties instead of overwriting them.
        for (const key in browserWindowEnv) {
            if (browserWindowEnv.hasOwnProperty(key)) {
                (this as any)[key] = browserWindowEnv[key];
            }
        }
    }
}
