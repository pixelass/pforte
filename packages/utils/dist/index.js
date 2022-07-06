function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "getExpirationDate", () => $9572fcb98d4f445d$export$413bda311cfd5c29);
function $9572fcb98d4f445d$export$413bda311cfd5c29(age) {
    const now = new Date();
    return new Date(+now + age * 1000);
}


//# sourceMappingURL=index.js.map
