"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class FallbackDirectoryResolverPlugin /* extends ResolvePlugin */ {
    constructor(options = {}) {
        // super();
        this.options = Object.assign(FallbackDirectoryResolverPlugin.defaultOptions, options);
    }
    apply(resolver) {
        const pathRegex = new RegExp(`^#${this.options.prefix}#/`);
        resolver.plugin("module", (request, callback) => {
            if (request.request.match(pathRegex)) {
                const req = request.request.replace(pathRegex, "");
                const resolvedComponentPath = this.resolveComponentPath(req);
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
            }
            else {
                callback();
            }
        });
    }
    resolveComponentPath(reqPath) {
        if (this.options.directories) {
            for (const k in this.options.directories) {
                if (this.options.directories.hasOwnProperty(k)) {
                    const dir = path.resolve(this.options.directories[k]);
                    if (fs.existsSync(dir)) {
                        const file = path.resolve(dir, reqPath);
                        if (fs.existsSync(file)) {
                            return file;
                        }
                    }
                }
            }
        }
        return false;
    }
}
FallbackDirectoryResolverPlugin.defaultOptions = {
    directories: [],
    prefix: "fallback",
};
exports.FallbackDirectoryResolverPlugin = FallbackDirectoryResolverPlugin;
module.exports = FallbackDirectoryResolverPlugin;
