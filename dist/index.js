"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class FallbackDirectoryResolverPlugin {
    constructor(options = {}) {
        this.options = Object.assign(FallbackDirectoryResolverPlugin.defaultOptions, options);
    }
    apply(resolver) {
        const pathRegex = new RegExp(`^#${this.options.prefix}#/`);
        resolver.plugin("module", (request, callback) => {
            if (request.request.match(pathRegex)) {
                const req = request.request.replace(pathRegex, "");
                this.resolveComponentPath(req).then((resolvedComponentPath) => {
                    const obj = {
                        directory: request.directory,
                        path: request.path,
                        query: request.query,
                        request: resolvedComponentPath,
                    };
                    resolver.doResolve("resolve", obj, null, callback);
                }, () => {
                    callback();
                });
            }
            else {
                callback();
            }
        });
    }
    resolveComponentPath(reqPath) {
        return new Promise((resolve, reject) => {
            if (this.options.directories) {
                let resolved = false;
                let numChecked = 0;
                const numTotal = this.options.directories.length;
                for (const k in this.options.directories) {
                    if (this.options.directories.hasOwnProperty(k)) {
                        const dir = path.resolve(this.options.directories[k]);
                        const file = path.resolve(dir, reqPath);
                        fs.exists(file, (exists) => {
                            numChecked++;
                            if (!resolved) {
                                if (exists) {
                                    resolved = true;
                                    resolve(file);
                                }
                                else if (numChecked >= numTotal) {
                                    reject();
                                }
                            }
                        });
                    }
                }
            }
            else {
                reject();
            }
        });
    }
}
FallbackDirectoryResolverPlugin.defaultOptions = {
    directories: [],
    prefix: "fallback",
};
exports.FallbackDirectoryResolverPlugin = FallbackDirectoryResolverPlugin;
module.exports = FallbackDirectoryResolverPlugin;
