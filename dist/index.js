"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                this.resolveComponentPath(req, resolver.fs).then((resolvedComponentPath) => {
                    console.log(resolvedComponentPath);
                    if (resolvedComponentPath) {
                        const obj = {
                            directory: request.directory,
                            path: request.path,
                            query: request.query,
                            request: resolvedComponentPath,
                        };
                        resolver.doResolve("resolve", obj, null, callback);
                    }
                    else {
                        callback();
                    }
                }, () => {
                    callback();
                });
            }
            else {
                callback();
            }
        });
    }
    resolveComponentPath(reqPath, fs) {
        return new Promise((resolve, reject) => {
            let resolved = false;
            if (this.options.directories) {
                for (const k in this.options.directories) {
                    if (this.options.directories.hasOwnProperty(k)) {
                        const dir = path.resolve(this.options.directories[k]);
                        const file = path.resolve(dir, reqPath);
                        fs.exists(file, (exists) => {
                            console.log(file, exists, resolved);
                            if (!resolved && exists) {
                                resolved = true;
                                resolve(file);
                            }
                        });
                    }
                }
            }
            else {
                resolve(false);
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
