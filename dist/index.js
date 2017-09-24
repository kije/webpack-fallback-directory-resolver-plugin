"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");
const existsAsync = (path) => new Promise((resolve) => {
    fs.exists(path, resolve);
});
class FallbackDirectoryResolverPlugin {
    constructor(options = {}) {
        this.options = Object.assign(FallbackDirectoryResolverPlugin.defaultOptions, options);
        this.pathRegex = new RegExp(`^#${this.options.prefix}#/`);
    }
    apply(resolver) {
        resolver.plugin("module", (request, callback) => {
            if (request.request.match(this.pathRegex)) {
                const req = request.request.replace(this.pathRegex, "");
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
        if (this.options.directories) {
            return Promise.filter(this.options.directories.map((dir) => path.resolve(path.resolve(dir), reqPath)), (item) => existsAsync(item).then((exists) => exists).catch(() => false)).any();
        }
        return Promise.reject("No Fallback directories!");
    }
}
FallbackDirectoryResolverPlugin.defaultOptions = {
    directories: [],
    prefix: "fallback",
};
exports.FallbackDirectoryResolverPlugin = FallbackDirectoryResolverPlugin;
module.exports = FallbackDirectoryResolverPlugin;
