'use strict';

var util = require('util');
var bson = require('bson');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var bson__namespace = /*#__PURE__*/_interopNamespace(bson);

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
let environment$1 = null;
/**
 * Set the environment of execution.
 * Note: This should be called as the first thing before executing any code which calls getEnvironment()
 * @param e An object containing environment specific implementations.
 */
function setEnvironment(e) {
    environment$1 = e;
}
/**
 * Get the environment of execution.
 * @returns An object containing environment specific implementations.
 */
function getEnvironment() {
    if (environment$1) {
        return environment$1;
    }
    else {
        throw new Error("Cannot get environment before it's set");
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * A `Storage` which will prefix a key part to every operation.
 */
class PrefixedStorage {
    /**
     * Construct a `Storage` which will prefix a key part to every operation.
     * @param storage The underlying storage to use for operations.
     * @param keyPart The part of the key to prefix when performing operations.
     */
    constructor(storage, keyPart) {
        this.storage = storage;
        this.keyPart = keyPart;
    }
    /** @inheritdoc */
    get(key) {
        return this.storage.get(this.keyPart + PrefixedStorage.PART_SEPARATOR + key);
    }
    /** @inheritdoc */
    set(key, value) {
        return this.storage.set(this.keyPart + PrefixedStorage.PART_SEPARATOR + key, value);
    }
    /** @inheritdoc */
    remove(key) {
        return this.storage.remove(this.keyPart + PrefixedStorage.PART_SEPARATOR + key);
    }
    /** @inheritdoc */
    prefix(keyPart) {
        return new PrefixedStorage(this, keyPart);
    }
    /** @inheritdoc */
    clear(prefix = "") {
        return this.storage.clear(this.keyPart + PrefixedStorage.PART_SEPARATOR + prefix);
    }
    /** @inheritdoc */
    addListener(listener) {
        return this.storage.addListener(listener);
    }
    /** @inheritdoc */
    removeListener(listener) {
        return this.storage.addListener(listener);
    }
}
/**
 * The string separating two parts.
 */
PrefixedStorage.PART_SEPARATOR = ":";

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * In-memory storage that will not be persisted.
 */
class MemoryStorage {
    constructor() {
        /**
         * Internal state of the storage.
         */
        this.storage = {};
        /**
         * A set of listners.
         */
        this.listeners = new Set();
    }
    /** @inheritdoc */
    get(key) {
        if (key in this.storage) {
            return this.storage[key];
        }
        else {
            return null;
        }
    }
    /** @inheritdoc */
    set(key, value) {
        this.storage[key] = value;
        // Fire the listeners
        this.fireListeners();
    }
    /** @inheritdoc */
    remove(key) {
        delete this.storage[key];
        // Fire the listeners
        this.fireListeners();
    }
    /** @inheritdoc */
    prefix(keyPart) {
        return new PrefixedStorage(this, keyPart);
    }
    /** @inheritdoc */
    clear(prefix) {
        // Iterate all keys and delete their values if they have a matching prefix
        for (const key of Object.keys(this.storage)) {
            if (!prefix || key.startsWith(prefix)) {
                delete this.storage[key];
            }
        }
        // Fire the listeners
        this.fireListeners();
    }
    /** @inheritdoc */
    addListener(listener) {
        this.listeners.add(listener);
    }
    /** @inheritdoc */
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    /**
     * Tell the listeners that a change occurred.
     */
    fireListeners() {
        this.listeners.forEach((listener) => listener());
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2024 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
// The sole purpose of this line is to verify types
// Binding the function to avoid "Failed to execute 'fetch' on 'Window': Illegal invocation".
// This happens when the "node" export of "realm" is imported from an Electron renderer process.
// It could be revisited if / when "realm" gets a "browser" export condition.
const fetch = globalThis.fetch.bind(globalThis);

/**
 *  base64.ts
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 *
 * @author Dan Kogai (https://github.com/dankogai)
 */
const version = '3.7.6';
/**
 * @deprecated use lowercase `version`.
 */
const VERSION = version;
const _hasatob = typeof atob === 'function';
const _hasbtoa = typeof btoa === 'function';
const _hasBuffer = typeof Buffer === 'function';
const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
const b64tab = ((a) => {
    let tab = {};
    a.forEach((c, i) => tab[c] = i);
    return tab;
})(b64chs);
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
const _fromCC = String.fromCharCode.bind(String);
const _U8Afrom = typeof Uint8Array.from === 'function'
    ? Uint8Array.from.bind(Uint8Array)
    : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
const _mkUriSafe = (src) => src
    .replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');
const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
/**
 * polyfill version of `btoa`
 */
const btoaPolyfill = (bin) => {
    // console.log('polyfilled');
    let u32, c0, c1, c2, asc = '';
    const pad = bin.length % 3;
    for (let i = 0; i < bin.length;) {
        if ((c0 = bin.charCodeAt(i++)) > 255 ||
            (c1 = bin.charCodeAt(i++)) > 255 ||
            (c2 = bin.charCodeAt(i++)) > 255)
            throw new TypeError('invalid character found');
        u32 = (c0 << 16) | (c1 << 8) | c2;
        asc += b64chs[u32 >> 18 & 63]
            + b64chs[u32 >> 12 & 63]
            + b64chs[u32 >> 6 & 63]
            + b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
/**
 * does what `window.btoa` of web browsers do.
 * @param {String} bin binary string
 * @returns {string} Base64-encoded string
 */
const _btoa = _hasbtoa ? (bin) => btoa(bin)
    : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
        : btoaPolyfill;
const _fromUint8Array = _hasBuffer
    ? (u8a) => Buffer.from(u8a).toString('base64')
    : (u8a) => {
        // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
        const maxargs = 0x1000;
        let strs = [];
        for (let i = 0, l = u8a.length; i < l; i += maxargs) {
            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
        }
        return _btoa(strs.join(''));
    };
/**
 * converts a Uint8Array to a Base64 string.
 * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
 * @returns {string} Base64 string
 */
const fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const utob = (src: string) => unescape(encodeURIComponent(src));
// reverting good old fationed regexp
const cb_utob = (c) => {
    if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 0x80 ? c
            : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
                + _fromCC(0x80 | (cc & 0x3f)))
                : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
                    + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
                    + _fromCC(0x80 | (cc & 0x3f)));
    }
    else {
        var cc = 0x10000
            + (c.charCodeAt(0) - 0xD800) * 0x400
            + (c.charCodeAt(1) - 0xDC00);
        return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
            + _fromCC(0x80 | ((cc >>> 12) & 0x3f))
            + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
            + _fromCC(0x80 | (cc & 0x3f)));
    }
};
const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-8 string
 * @returns {string} UTF-16 string
 */
const utob = (u) => u.replace(re_utob, cb_utob);
//
const _encode = _hasBuffer
    ? (s) => Buffer.from(s, 'utf8').toString('base64')
    : _TE
        ? (s) => _fromUint8Array(_TE.encode(s))
        : (s) => _btoa(utob(s));
/**
 * converts a UTF-8-encoded string to a Base64 string.
 * @param {boolean} [urlsafe] if `true` make the result URL-safe
 * @returns {string} Base64 string
 */
const encode = (src, urlsafe = false) => urlsafe
    ? _mkUriSafe(_encode(src))
    : _encode(src);
/**
 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
 * @returns {string} Base64 string
 */
const encodeURI = (src) => encode(src, true);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const btou = (src: string) => decodeURIComponent(escape(src));
// reverting good old fationed regexp
const re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
const cb_btou = (cccc) => {
    switch (cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                | ((0x3f & cccc.charCodeAt(1)) << 12)
                | ((0x3f & cccc.charCodeAt(2)) << 6)
                | (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;
            return (_fromCC((offset >>> 10) + 0xD800)
                + _fromCC((offset & 0x3FF) + 0xDC00));
        case 3:
            return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)
                | ((0x3f & cccc.charCodeAt(1)) << 6)
                | (0x3f & cccc.charCodeAt(2)));
        default:
            return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)
                | (0x3f & cccc.charCodeAt(1)));
    }
};
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-16 string
 * @returns {string} UTF-8 string
 */
const btou = (b) => b.replace(re_btou, cb_btou);
/**
 * polyfill version of `atob`
 */
const atobPolyfill = (asc) => {
    // console.log('polyfilled');
    asc = asc.replace(/\s+/g, '');
    if (!b64re.test(asc))
        throw new TypeError('malformed base64.');
    asc += '=='.slice(2 - (asc.length & 3));
    let u24, bin = '', r1, r2;
    for (let i = 0; i < asc.length;) {
        u24 = b64tab[asc.charAt(i++)] << 18
            | b64tab[asc.charAt(i++)] << 12
            | (r1 = b64tab[asc.charAt(i++)]) << 6
            | (r2 = b64tab[asc.charAt(i++)]);
        bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
            : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
                : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
    }
    return bin;
};
/**
 * does what `window.atob` of web browsers do.
 * @param {String} asc Base64-encoded string
 * @returns {string} binary string
 */
const _atob = _hasatob ? (asc) => atob(_tidyB64(asc))
    : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')
        : atobPolyfill;
//
const _toUint8Array = _hasBuffer
    ? (a) => _U8Afrom(Buffer.from(a, 'base64'))
    : (a) => _U8Afrom(_atob(a).split('').map(c => c.charCodeAt(0)));
/**
 * converts a Base64 string to a Uint8Array.
 */
const toUint8Array = (a) => _toUint8Array(_unURI(a));
//
const _decode = _hasBuffer
    ? (a) => Buffer.from(a, 'base64').toString('utf8')
    : _TD
        ? (a) => _TD.decode(_toUint8Array(a))
        : (a) => btou(_atob(a));
const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
/**
 * converts a Base64 string to a UTF-8 string.
 * @param {String} src Base64 string.  Both normal and URL-safe are supported
 * @returns {string} UTF-8 string
 */
const decode = (src) => _decode(_unURI(src));
/**
 * check if a value is a valid Base64 string
 * @param {String} src a value to check
  */
const isValid = (src) => {
    if (typeof src !== 'string')
        return false;
    const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
    return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
};
//
const _noEnum = (v) => {
    return {
        value: v, enumerable: false, writable: true, configurable: true
    };
};
/**
 * extend String.prototype with relevant methods
 */
const extendString = function () {
    const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
    _add('fromBase64', function () { return decode(this); });
    _add('toBase64', function (urlsafe) { return encode(this, urlsafe); });
    _add('toBase64URI', function () { return encode(this, true); });
    _add('toBase64URL', function () { return encode(this, true); });
    _add('toUint8Array', function () { return toUint8Array(this); });
};
/**
 * extend Uint8Array.prototype with relevant methods
 */
const extendUint8Array = function () {
    const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
    _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
    _add('toBase64URI', function () { return fromUint8Array(this, true); });
    _add('toBase64URL', function () { return fromUint8Array(this, true); });
};
/**
 * extend Builtin prototypes with relevant methods
 */
const extendBuiltins = () => {
    extendString();
    extendUint8Array();
};
const gBase64 = {
    version: version,
    VERSION: VERSION,
    atob: _atob,
    atobPolyfill: atobPolyfill,
    btoa: _btoa,
    btoaPolyfill: btoaPolyfill,
    fromBase64: decode,
    toBase64: encode,
    encode: encode,
    encodeURI: encodeURI,
    encodeURL: encodeURI,
    utob: utob,
    btou: btou,
    decode: decode,
    isValid: isValid,
    fromUint8Array: fromUint8Array,
    toUint8Array: toUint8Array,
    extendString: extendString,
    extendUint8Array: extendUint8Array,
    extendBuiltins: extendBuiltins
};

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
const SERIALIZATION_OPTIONS = {
    relaxed: false, // Ensure Canonical mode
};
/**
 * Serialize an object containing BSON types into extended-JSON.
 * @param obj The object containing BSON types.
 * @returns The document in extended-JSON format.
 */
function serialize(obj) {
    return bson.EJSON.serialize(obj, SERIALIZATION_OPTIONS);
}
/**
 * De-serialize an object or an array of object from extended-JSON into an object or an array of object with BSON types.
 * @param obj The object or array of objects in extended-JSON format.
 * @returns The object or array of objects with inflated BSON types.
 */
function deserialize(obj) {
    if (Array.isArray(obj)) {
        return obj.map((doc) => bson.EJSON.deserialize(doc));
    }
    else {
        return bson.EJSON.deserialize(obj);
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * The type of a user.
 */
var UserType;
(function (UserType) {
    /**
     * A normal end-user created this user.
     */
    UserType["Normal"] = "normal";
    /**
     * The user was created by the server.
     */
    UserType["Server"] = "server";
})(UserType || (UserType = {}));
/** @ignore */
var DataKey;
(function (DataKey) {
    /** @ignore */
    DataKey["NAME"] = "name";
    /** @ignore */
    DataKey["EMAIL"] = "email";
    /** @ignore */
    DataKey["PICTURE"] = "picture";
    /** @ignore */
    DataKey["FIRST_NAME"] = "first_name";
    /** @ignore */
    DataKey["LAST_NAME"] = "last_name";
    /** @ignore */
    DataKey["GENDER"] = "gender";
    /** @ignore */
    DataKey["BIRTHDAY"] = "birthday";
    /** @ignore */
    DataKey["MIN_AGE"] = "min_age";
    /** @ignore */
    DataKey["MAX_AGE"] = "max_age";
})(DataKey || (DataKey = {}));
const DATA_MAPPING = {
    [DataKey.NAME]: "name",
    [DataKey.EMAIL]: "email",
    [DataKey.PICTURE]: "pictureUrl",
    [DataKey.FIRST_NAME]: "firstName",
    [DataKey.LAST_NAME]: "lastName",
    [DataKey.GENDER]: "gender",
    [DataKey.BIRTHDAY]: "birthday",
    [DataKey.MIN_AGE]: "minAge",
    [DataKey.MAX_AGE]: "maxAge",
};
/** @inheritdoc */
class UserProfile {
    /**
     * @param response The response of a call fetching the users profile.
     */
    constructor(response) {
        /** @ignore */
        this.type = UserType.Normal;
        /** @ignore */
        this.identities = [];
        if (typeof response === "object" && response !== null) {
            const { type, identities, data } = response;
            if (typeof type === "string") {
                this.type = type;
            }
            else {
                throw new Error("Expected 'type' in the response body");
            }
            if (Array.isArray(identities)) {
                this.identities = identities.map((identity) => {
                    const { id, provider_type: providerType } = identity;
                    return { id, providerType };
                });
            }
            else {
                throw new Error("Expected 'identities' in the response body");
            }
            if (typeof data === "object" && data !== null) {
                const mappedData = Object.fromEntries(Object.entries(data).map(([key, value]) => {
                    if (key in DATA_MAPPING) {
                        // Translate any known data field to its JS idiomatic alias
                        return [DATA_MAPPING[key], value];
                    }
                    else {
                        // Pass through any other values
                        return [key, value];
                    }
                }));
                // We can use `any` since we trust the user supplies the correct type
                this.data = deserialize(mappedData);
            }
            else {
                throw new Error("Expected 'data' in the response body");
            }
        }
        else {
            this.data = {};
        }
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";
const PROFILE_STORAGE_KEY = "profile";
const PROVIDER_TYPE_STORAGE_KEY = "providerType";
/**
 * Storage specific to the app.
 */
class UserStorage extends PrefixedStorage {
    /**
     * Construct a storage for a `User`.
     * @param storage The underlying storage to wrap.
     * @param userId The id of the user.
     */
    constructor(storage, userId) {
        super(storage, `user(${userId})`);
    }
    /**
     * Get the access token from storage.
     * @returns Access token (null if unknown).
     */
    get accessToken() {
        return this.get(ACCESS_TOKEN_STORAGE_KEY);
    }
    /**
     * Set the access token in storage.
     * @param value Access token (null if unknown).
     */
    set accessToken(value) {
        if (value === null) {
            this.remove(ACCESS_TOKEN_STORAGE_KEY);
        }
        else {
            this.set(ACCESS_TOKEN_STORAGE_KEY, value);
        }
    }
    /**
     * Get the refresh token from storage.
     * @returns Refresh token (null if unknown and user is logged out).
     */
    get refreshToken() {
        return this.get(REFRESH_TOKEN_STORAGE_KEY);
    }
    /**
     * Set the refresh token in storage.
     * @param value Refresh token (null if unknown and user is logged out).
     */
    set refreshToken(value) {
        if (value === null) {
            this.remove(REFRESH_TOKEN_STORAGE_KEY);
        }
        else {
            this.set(REFRESH_TOKEN_STORAGE_KEY, value);
        }
    }
    /**
     * Get the user profile from storage.
     * @returns User profile (undefined if its unknown).
     */
    get profile() {
        const value = this.get(PROFILE_STORAGE_KEY);
        if (value) {
            const profile = new UserProfile();
            // Patch in the values
            Object.assign(profile, JSON.parse(value));
            return profile;
        }
    }
    /**
     * Set the user profile in storage.
     * @param value User profile (undefined if its unknown).
     */
    set profile(value) {
        if (value) {
            this.set(PROFILE_STORAGE_KEY, JSON.stringify(value));
        }
        else {
            this.remove(PROFILE_STORAGE_KEY);
        }
    }
    /**
     * Get the type of authentication provider used to authenticate
     * @returns User profile (undefined if its unknown).
     */
    get providerType() {
        const value = this.get(PROVIDER_TYPE_STORAGE_KEY);
        if (value) {
            return value;
        }
    }
    /**
     * Set the type of authentication provider used to authenticate
     * @param value Type of authentication provider.
     */
    set providerType(value) {
        if (value) {
            this.set(PROVIDER_TYPE_STORAGE_KEY, value);
        }
        else {
            this.remove(PROVIDER_TYPE_STORAGE_KEY);
        }
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * @param obj The object to remove keys (and undefined values from)
 * @returns A new object without the keys where the value is undefined.
 */
function removeKeysWithUndefinedValues(obj) {
    return Object.fromEntries(Object.entries(obj).filter((entry) => typeof entry[1] !== "undefined"));
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * Generate a random sequence of characters.
 * @param length The length of the string.
 * @param alphabet The alphabet of characters to pick from.
 * @returns A string of characters picked randomly from `alphabet`.
 */
function generateRandomString(length, alphabet) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
}
/**
 * Encode an object mapping from string to string, into a query string to be appended a URL.
 * @param params The parameters to include in the string.
 * @param prefixed Should the "?" prefix be added if values exists?
 * @returns A URL encoded representation of the parameters (omitting a "?" prefix).
 */
function encodeQueryString(params, prefixed = true) {
    // Filter out undefined values
    const cleanedParams = removeKeysWithUndefinedValues(params);
    // Determine if a prefixed "?" is appropreate
    const prefix = prefixed && Object.keys(cleanedParams).length > 0 ? "?" : "";
    // Transform keys and values to a query string
    return (prefix +
        Object.entries(cleanedParams)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join("&"));
}
/**
 * Decodes a query string into an object.
 * @param str The query string to decode.
 * @returns The decoded query string.
 */
function decodeQueryString(str) {
    const cleanStr = str[0] === "?" ? str.substr(1) : str;
    return Object.fromEntries(cleanStr
        .split("&")
        .filter((s) => s.length > 0)
        .map((kvp) => kvp.split("="))
        .map(([k, v]) => [k, decodeURIComponent(v)]));
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * A list of names that functions cannot have to be callable through the functions proxy.
 */
const RESERVED_NAMES = [
    "inspect",
    "callFunction",
    "callFunctionStreaming",
    // Methods defined on the Object.prototype might be "typeof probed" and called by libraries and runtime environments.
    ...Object.getOwnPropertyNames(Object.prototype),
];
/**
 * Remove the key for any fields with undefined values.
 * @param args The arguments to clean.
 * @returns The cleaned arguments.
 */
function cleanArgs(args) {
    for (const arg of args) {
        if (typeof arg === "object" && arg) {
            for (const [key, value] of Object.entries(arg)) {
                if (value === undefined) {
                    delete arg[key];
                }
            }
        }
    }
    return args;
}
/**
 * Remove keys for any undefined values and serialize to EJSON.
 * @param args The arguments to clean and serialize.
 * @returns The cleaned and serialized arguments.
 */
function cleanArgsAndSerialize(args) {
    const cleaned = cleanArgs(args);
    return cleaned.map((arg) => (typeof arg === "object" ? serialize(arg) : arg));
}
/**
 * Defines how functions are called.
 */
class FunctionsFactory {
    /**
     * Create a factory of functions, wrapped in a Proxy that returns bound copies of `callFunction` on any property.
     * @param fetcher The underlying fetcher to use when requesting.
     * @param config Additional configuration parameters.
     * @returns The newly created factory of functions.
     */
    static create(fetcher, config = {}) {
        // Create a proxy, wrapping a simple object returning methods that calls functions
        // TODO: Lazily fetch available functions and return these from the ownKeys() trap
        const factory = new FunctionsFactory(fetcher, config);
        // Wrap the factory in a proxy that calls the internal call method
        return new Proxy(factory, {
            get(target, p, receiver) {
                if (typeof p === "string" && RESERVED_NAMES.indexOf(p) === -1) {
                    return target.callFunction.bind(target, p);
                }
                else {
                    const prop = Reflect.get(target, p, receiver);
                    return typeof prop === "function" ? prop.bind(target) : prop;
                }
            },
        });
    }
    /**
     * @param fetcher The underlying fetcher to use when sending requests.
     * @param config Additional configuration parameters.
     */
    constructor(fetcher, config = {}) {
        this.fetcher = fetcher;
        this.serviceName = config.serviceName;
        this.argsTransformation = config.argsTransformation || cleanArgsAndSerialize;
    }
    /**
     * Call a remote function by it's name.
     * @param name Name of the remote function.
     * @param args Arguments to pass to the remote function.
     * @returns A promise of the value returned when executing the remote function.
     */
    async callFunction(name, ...args) {
        // See https://github.com/mongodb/stitch-js-sdk/blob/master/packages/core/sdk/src/services/internal/CoreStitchServiceClientImpl.ts
        const body = {
            name,
            arguments: this.argsTransformation ? this.argsTransformation(args) : args,
        };
        if (this.serviceName) {
            body.service = this.serviceName;
        }
        const appRoute = this.fetcher.appRoute;
        return this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.functionsCall().path,
            body,
        });
    }
    /**
     * Call a remote function by it's name.
     * @param name Name of the remote function.
     * @param args Arguments to pass to the remote function.
     * @returns A promise of the value returned when executing the remote function.
     */
    callFunctionStreaming(name, ...args) {
        const body = {
            name,
            arguments: this.argsTransformation ? this.argsTransformation(args) : args,
        };
        if (this.serviceName) {
            body.service = this.serviceName;
        }
        const appRoute = this.fetcher.appRoute;
        const qs = encodeQueryString({
            ["baas_request"]: gBase64.encode(JSON.stringify(body)),
        });
        return this.fetcher.fetchStream({
            method: "GET",
            path: appRoute.functionsCall().path + qs,
        });
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/** @inheritdoc */
class EmailPasswordAuth {
    /**
     * Construct an interface to the email / password authentication provider.
     * @param fetcher The underlying fetcher used to request the services.
     * @param providerName Optional custom name of the authentication provider.
     */
    constructor(fetcher, providerName = "local-userpass") {
        this.fetcher = fetcher;
        this.providerName = providerName;
    }
    /** @inheritdoc */
    async registerUser(details) {
        const appRoute = this.fetcher.appRoute;
        await this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.emailPasswordAuth(this.providerName).register().path,
            body: details,
        });
    }
    /** @inheritdoc */
    async confirmUser(details) {
        const appRoute = this.fetcher.appRoute;
        await this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.emailPasswordAuth(this.providerName).confirm().path,
            body: details,
        });
    }
    /** @inheritdoc */
    async resendConfirmationEmail(details) {
        const appRoute = this.fetcher.appRoute;
        await this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.emailPasswordAuth(this.providerName).confirmSend().path,
            body: details,
        });
    }
    /** @inheritdoc */
    async retryCustomConfirmation(details) {
        const appRoute = this.fetcher.appRoute;
        await this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.emailPasswordAuth(this.providerName).confirmCall().path,
            body: details,
        });
    }
    /** @inheritdoc */
    async resetPassword(details) {
        const appRoute = this.fetcher.appRoute;
        await this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.emailPasswordAuth(this.providerName).reset().path,
            body: details,
        });
    }
    /** @inheritdoc */
    async sendResetPasswordEmail(details) {
        const appRoute = this.fetcher.appRoute;
        await this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.emailPasswordAuth(this.providerName).resetSend().path,
            body: details,
        });
    }
    /** @inheritdoc */
    async callResetPasswordFunction(details, ...args) {
        const appRoute = this.fetcher.appRoute;
        await this.fetcher.fetchJSON({
            method: "POST",
            path: appRoute.emailPasswordAuth(this.providerName).resetCall().path,
            body: { ...details, arguments: args },
        });
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * @returns The base api route.
 */
function api() {
    return {
        path: "/api/client/v2.0",
        /**
         * @param appId The id of the app.
         * @returns The URL of the app endpoint.
         */
        app(appId) {
            return {
                path: this.path + `/app/${appId}`,
                /**
                 * @returns The URL of the app location endpoint.
                 */
                location() {
                    return {
                        path: this.path + "/location",
                    };
                },
                /**
                 * @param providerName The name of the provider.
                 * @returns The app url concatinated with the /auth/providers/{providerName}
                 */
                authProvider(providerName) {
                    return {
                        path: this.path + `/auth/providers/${providerName}`,
                        /**
                         * @returns Get the URL of an authentication provider.
                         */
                        login() {
                            return { path: this.path + "/login" };
                        },
                    };
                },
                /**
                 * @param providerName The name of the provider.
                 * @returns The app url concatinated with the /auth/providers/{providerName}
                 */
                emailPasswordAuth(providerName) {
                    const authProviderRoutes = this.authProvider(providerName);
                    return {
                        ...authProviderRoutes,
                        register() {
                            return { path: this.path + "/register" };
                        },
                        confirm() {
                            return { path: this.path + "/confirm" };
                        },
                        confirmSend() {
                            return { path: this.path + "/confirm/send" };
                        },
                        confirmCall() {
                            return { path: this.path + "/confirm/call" };
                        },
                        reset() {
                            return { path: this.path + "/reset" };
                        },
                        resetSend() {
                            return { path: this.path + "/reset/send" };
                        },
                        resetCall() {
                            return { path: this.path + "/reset/call" };
                        },
                    };
                },
                functionsCall() {
                    return {
                        path: this.path + "/functions/call",
                    };
                },
            };
        },
        auth() {
            return {
                path: this.path + "/auth",
                apiKeys() {
                    return {
                        path: this.path + "/api_keys",
                        key(id) {
                            return {
                                path: this.path + `/${id}`,
                                enable() {
                                    return { path: this.path + "/enable" };
                                },
                                disable() {
                                    return { path: this.path + "/disable" };
                                },
                            };
                        },
                    };
                },
                profile() {
                    return { path: this.path + "/profile" };
                },
                session() {
                    return { path: this.path + "/session" };
                },
                delete() {
                    return { path: this.path + "/delete" };
                },
            };
        },
    };
}
var routes = { api };

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/** @inheritdoc */
class ApiKeyAuth {
    /**
     * Construct an interface to the API-key authentication provider.
     * @param fetcher The fetcher used to send requests to services.
     */
    constructor(fetcher) {
        this.fetcher = fetcher;
    }
    /** @inheritdoc */
    create(name) {
        return this.fetcher.fetchJSON({
            method: "POST",
            body: { name },
            path: routes.api().auth().apiKeys().path,
            tokenType: "refresh",
        });
    }
    /** @inheritdoc */
    fetch(keyId) {
        return this.fetcher.fetchJSON({
            method: "GET",
            path: routes.api().auth().apiKeys().key(keyId).path,
            tokenType: "refresh",
        });
    }
    /** @inheritdoc */
    fetchAll() {
        return this.fetcher.fetchJSON({
            method: "GET",
            tokenType: "refresh",
            path: routes.api().auth().apiKeys().path,
        });
    }
    /** @inheritdoc */
    async delete(keyId) {
        await this.fetcher.fetchJSON({
            method: "DELETE",
            path: routes.api().auth().apiKeys().key(keyId).path,
            tokenType: "refresh",
        });
    }
    /** @inheritdoc */
    async enable(keyId) {
        await this.fetcher.fetchJSON({
            method: "PUT",
            path: routes.api().auth().apiKeys().key(keyId).enable().path,
            tokenType: "refresh",
        });
    }
    /** @inheritdoc */
    async disable(keyId) {
        await this.fetcher.fetchJSON({
            method: "PUT",
            path: routes.api().auth().apiKeys().key(keyId).disable().path,
            tokenType: "refresh",
        });
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * An error occured during the parsing of a watch stream.
 */
class WatchError extends Error {
    constructor({ message, code }) {
        super(message);
        /**
         * The name of this type of error
         */
        this.name = "WatchError";
        this.code = code;
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
// NOTE: this is a fully processed event, not a single "data: foo" line!
/**
 * The state of a WatchStream.
 */
var WatchStreamState;
(function (WatchStreamState) {
    /**
     * Need to call one of the feed functions.
     */
    WatchStreamState["NEED_DATA"] = "NEED_DATA";
    /**
     * Call nextEvent() to consume an event.
     */
    WatchStreamState["HAVE_EVENT"] = "HAVE_EVENT";
    /**
     * Call error().
     */
    WatchStreamState["HAVE_ERROR"] = "HAVE_ERROR";
})(WatchStreamState || (WatchStreamState = {}));
/**
 * Represents a stream of events
 */
class WatchStream {
    constructor() {
        this._state = WatchStreamState.NEED_DATA;
        this._error = null;
        // Used by feedBuffer to construct lines
        this._textDecoder = new (getEnvironment().TextDecoder)();
        this._buffer = "";
        this._bufferOffset = 0;
        // Used by feedLine for building the next SSE
        this._eventType = "";
        this._dataBuffer = "";
    }
    // Call these when you have data, in whatever shape is easiest for your SDK to get.
    // Pick one, mixing and matching on a single instance isn't supported.
    // These can only be called in NEED_DATA state, which is the initial state.
    feedBuffer(buffer) {
        this.assertState(WatchStreamState.NEED_DATA);
        this._buffer += this._textDecoder.decode(buffer, { stream: true });
        this.advanceBufferState();
    }
    feedLine(line) {
        this.assertState(WatchStreamState.NEED_DATA);
        // This is an implementation of the algorithm described at
        // https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation.
        // Currently the server does not use id or retry lines, so that processing isn't implemented.
        // ignore trailing LF if not removed by SDK.
        if (line.endsWith("\n"))
            line = line.substr(0, line.length - 1);
        // ignore trailing CR from CRLF
        if (line.endsWith("\r"))
            line = line.substr(0, line.length - 1);
        if (line.length === 0) {
            // This is the "dispatch the event" portion of the algorithm.
            if (this._dataBuffer.length === 0) {
                this._eventType = "";
                return;
            }
            if (this._dataBuffer.endsWith("\n"))
                this._dataBuffer = this._dataBuffer.substr(0, this._dataBuffer.length - 1);
            this.feedSse({
                data: this._dataBuffer,
                eventType: this._eventType,
            });
            this._dataBuffer = "";
            this._eventType = "";
        }
        if (line[0] === ":")
            return;
        const colon = line.indexOf(":");
        const field = line.substr(0, colon);
        let value = colon === -1 ? "" : line.substr(colon + 1);
        if (value.startsWith(" "))
            value = value.substr(1);
        if (field === "event") {
            this._eventType = value;
        }
        else if (field === "data") {
            this._dataBuffer += value;
            this._dataBuffer += "\n";
        }
        else ;
    }
    feedSse(sse) {
        this.assertState(WatchStreamState.NEED_DATA);
        const firstPercentIndex = sse.data.indexOf("%");
        if (firstPercentIndex !== -1) {
            // For some reason, the stich server decided to add percent-encoding for '%', '\n', and '\r' to its
            // event-stream replies. But it isn't real urlencoding, since most characters pass through, so we can't use
            // uri_percent_decode() here.
            let buffer = "";
            let start = 0;
            for (let percentIndex = firstPercentIndex; percentIndex !== -1; percentIndex = sse.data.indexOf("%", start)) {
                buffer += sse.data.substr(start, percentIndex - start);
                const encoded = sse.data.substr(percentIndex, 3); // may be smaller than 3 if string ends with %
                if (encoded === "%25") {
                    buffer += "%";
                }
                else if (encoded === "%0A") {
                    buffer += "\x0A"; // '\n'
                }
                else if (encoded === "%0D") {
                    buffer += "\x0D"; // '\r'
                }
                else {
                    buffer += encoded; // propagate as-is
                }
                start = percentIndex + encoded.length;
            }
            // Advance the buffer with the last part
            buffer += sse.data.substr(start);
            sse.data = buffer;
        }
        if (!sse.eventType || sse.eventType === "message") {
            try {
                const parsed = bson.EJSON.parse(sse.data);
                if (typeof parsed === "object") {
                    // ???
                    this._nextEvent = parsed;
                    this._state = WatchStreamState.HAVE_EVENT;
                    return;
                }
            }
            catch {
                // fallthrough to same handling as for non-document value.
            }
            this._state = WatchStreamState.HAVE_ERROR;
            this._error = new WatchError({
                message: "server returned malformed event: " + sse.data,
                code: "bad bson parse",
            });
        }
        else if (sse.eventType === "error") {
            this._state = WatchStreamState.HAVE_ERROR;
            // default error message if we have issues parsing the reply.
            this._error = new WatchError({
                message: sse.data,
                code: "unknown",
            });
            try {
                const { error_code: errorCode, error } = bson.EJSON.parse(sse.data);
                if (typeof errorCode !== "string")
                    return;
                if (typeof error !== "string")
                    return;
                // XXX in realm-js, object-store will error if the error_code is not one of the known
                // error code enum values.
                this._error = new WatchError({
                    message: error,
                    code: errorCode,
                });
            }
            catch {
                return; // Use the default state.
            }
        }
        else ;
    }
    get state() {
        return this._state;
    }
    // Consumes the returned event. If you used feedBuffer(), there may be another event or error after this one,
    // so you need to call state() again to see what to do next.
    nextEvent() {
        this.assertState(WatchStreamState.HAVE_EVENT);
        // We can use "as ChangeEvent<T>" since we just asserted the state.
        const out = this._nextEvent;
        this._state = WatchStreamState.NEED_DATA;
        this.advanceBufferState();
        return out;
    }
    // Once this enters the error state, it stays that way. You should not feed any more data.
    get error() {
        return this._error;
    }
    ////////////////////////////////////////////
    advanceBufferState() {
        this.assertState(WatchStreamState.NEED_DATA);
        while (this.state === WatchStreamState.NEED_DATA) {
            if (this._bufferOffset === this._buffer.length) {
                this._buffer = "";
                this._bufferOffset = 0;
                return;
            }
            // NOTE not supporting CR-only newlines, just LF and CRLF.
            const nextNewlineIndex = this._buffer.indexOf("\n", this._bufferOffset);
            if (nextNewlineIndex === -1) {
                // We have a partial line.
                if (this._bufferOffset !== 0) {
                    // Slide the partial line down to the front of the buffer.
                    this._buffer = this._buffer.substr(this._bufferOffset, this._buffer.length - this._bufferOffset);
                    this._bufferOffset = 0;
                }
                return;
            }
            this.feedLine(this._buffer.substr(this._bufferOffset, nextNewlineIndex - this._bufferOffset));
            this._bufferOffset = nextNewlineIndex + 1; // Advance past this line, including its newline.
        }
    }
    assertState(state) {
        if (this._state !== state) {
            throw Error(`Expected WatchStream to be in state ${state}, but in state ${this._state}`);
        }
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * A remote collection of documents.
 */
class MongoDBCollection {
    /**
     * Construct a remote collection of documents.
     * @param fetcher The fetcher to use when requesting the service.
     * @param serviceName The name of the remote service.
     * @param databaseName The name of the database.
     * @param collectionName The name of the remote collection.
     */
    constructor(fetcher, serviceName, databaseName, collectionName) {
        this.functions = FunctionsFactory.create(fetcher, {
            serviceName,
        });
        this.databaseName = databaseName;
        this.collectionName = collectionName;
        this.serviceName = serviceName;
        this.fetcher = fetcher;
    }
    /** @inheritdoc */
    find(filter = {}, options = {}) {
        return this.functions.find({
            database: this.databaseName,
            collection: this.collectionName,
            query: filter,
            project: options.projection,
            sort: options.sort,
            limit: options.limit,
        });
    }
    /** @inheritdoc */
    findOne(filter = {}, options = {}) {
        return this.functions.findOne({
            database: this.databaseName,
            collection: this.collectionName,
            query: filter,
            project: options.projection,
            sort: options.sort,
        });
    }
    /** @inheritdoc */
    findOneAndUpdate(filter = {}, update, options = {}) {
        return this.functions.findOneAndUpdate({
            database: this.databaseName,
            collection: this.collectionName,
            filter,
            update,
            sort: options.sort,
            projection: options.projection,
            upsert: options.upsert,
            returnNewDocument: options.returnNewDocument,
        });
    }
    /** @inheritdoc */
    findOneAndReplace(filter = {}, replacement, options = {}) {
        return this.functions.findOneAndReplace({
            database: this.databaseName,
            collection: this.collectionName,
            filter: filter,
            update: replacement,
            sort: options.sort,
            projection: options.projection,
            upsert: options.upsert,
            returnNewDocument: options.returnNewDocument,
        });
    }
    /** @inheritdoc */
    findOneAndDelete(filter = {}, options = {}) {
        return this.functions.findOneAndReplace({
            database: this.databaseName,
            collection: this.collectionName,
            filter,
            sort: options.sort,
            projection: options.projection,
        });
    }
    /** @inheritdoc */
    aggregate(pipeline) {
        return this.functions.aggregate({
            database: this.databaseName,
            collection: this.collectionName,
            pipeline,
        });
    }
    /** @inheritdoc */
    count(filter = {}, options = {}) {
        return this.functions.count({
            database: this.databaseName,
            collection: this.collectionName,
            query: filter,
            limit: options.limit,
        });
    }
    /** @inheritdoc */
    insertOne(document) {
        return this.functions.insertOne({
            database: this.databaseName,
            collection: this.collectionName,
            document,
        });
    }
    /** @inheritdoc */
    insertMany(documents) {
        return this.functions.insertMany({
            database: this.databaseName,
            collection: this.collectionName,
            documents,
        });
    }
    /** @inheritdoc */
    deleteOne(filter = {}) {
        return this.functions.deleteOne({
            database: this.databaseName,
            collection: this.collectionName,
            query: filter,
        });
    }
    /** @inheritdoc */
    deleteMany(filter = {}) {
        return this.functions.deleteMany({
            database: this.databaseName,
            collection: this.collectionName,
            query: filter,
        });
    }
    /** @inheritdoc */
    updateOne(filter, update, options = {}) {
        return this.functions.updateOne({
            database: this.databaseName,
            collection: this.collectionName,
            query: filter,
            update,
            upsert: options.upsert,
            arrayFilters: options.arrayFilters,
        });
    }
    /** @inheritdoc */
    updateMany(filter, update, options = {}) {
        return this.functions.updateMany({
            database: this.databaseName,
            collection: this.collectionName,
            query: filter,
            update,
            upsert: options.upsert,
            arrayFilters: options.arrayFilters,
        });
    }
    watch({ ids, filter, } = {}) {
        const iterable = this.functions.callFunctionStreaming("watch", {
            database: this.databaseName,
            collection: this.collectionName,
            ids,
            filter,
        });
        // Unpack the async iterable, making it possible for us to propagate the `return` when this generator is returning
        const iterator = iterable.then((i) => i[Symbol.asyncIterator]());
        const stream = this.watchImpl(iterator);
        // Store the original return on the stream, to enable propagating to the original implementation after we've returned on the iterator
        const originalReturn = stream.return;
        return Object.assign(stream, {
            return(value) {
                iterator.then((i) => (i.return ? i.return(value) : undefined));
                return originalReturn.call(stream, value);
            },
        });
    }
    /**
     * @param iterator An async iterator of the response body of a watch request.
     * @yields Change events.
     * Note: We had to split this from the `watch` method above to enable manually calling `return` on the response body iterator.
     */
    async *watchImpl(iterator) {
        const watchStream = new WatchStream();
        // Repack the iterator into an interable for the `watchImpl` to consume
        const iterable = iterator.then((i) => ({ [Symbol.asyncIterator]: () => i }));
        // Start consuming change events
        for await (const chunk of await iterable) {
            if (!chunk)
                continue;
            watchStream.feedBuffer(chunk);
            while (watchStream.state == WatchStreamState.HAVE_EVENT) {
                yield watchStream.nextEvent();
            }
            if (watchStream.state == WatchStreamState.HAVE_ERROR)
                // XXX this is just throwing an error like {error_code: "BadRequest, error: "message"},
                // which matches realm-js, but is different from how errors are handled in realm-web
                throw watchStream.error;
        }
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * Creates an Remote MongoDB Collection.
 * Note: This method exists to enable function binding.
 * @param fetcher The underlying fetcher.
 * @param serviceName A service name.
 * @param databaseName A database name.
 * @param collectionName A collection name.
 * @returns The collection.
 */
function createCollection(fetcher, serviceName, databaseName, collectionName) {
    return new MongoDBCollection(fetcher, serviceName, databaseName, collectionName);
}
/**
 * Creates a Remote MongoDB Database.
 * Note: This method exists to enable function binding.
 * @param fetcher The underlying fetcher
 * @param serviceName A service name
 * @param databaseName A database name
 * @returns The database.
 */
function createDatabase(fetcher, serviceName, databaseName) {
    return {
        collection: createCollection.bind(null, fetcher, serviceName, databaseName),
    };
}
/**
 * Creates a Remote MongoDB Service.
 * Note: This method exists to enable function binding.
 * @param fetcher The underlying fetcher.
 * @param serviceName An optional service name.
 * @returns The service.
 */
function createService(fetcher, serviceName = "mongo-db") {
    return { db: createDatabase.bind(null, fetcher, serviceName) };
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
// We're using a dependency to decode Base64 to UTF-8, because of https://stackoverflow.com/a/30106551/503899
const DEFAULT_DEVICE_ID = "000000000000000000000000";
/** The state of a user within the app */
exports.UserState = void 0;
(function (UserState) {
    /** Active, with both access and refresh tokens */
    UserState["Active"] = "active";
    /** Logged out, but there might still be data persisted about the user, in the browser. */
    UserState["LoggedOut"] = "logged-out";
    /** Logged out and all data about the user has been removed. */
    UserState["Removed"] = "removed";
})(exports.UserState || (exports.UserState = {}));
/** The type of a user. */
exports.UserType = void 0;
(function (UserType) {
    /** Created by the user itself. */
    UserType["Normal"] = "normal";
    /** Created by an administrator of the app. */
    UserType["Server"] = "server";
})(exports.UserType || (exports.UserType = {}));
/**
 * Representation of an authenticated user of an app.
 */
class User {
    /**
     * @param parameters Parameters of the user.
     */
    constructor(parameters) {
        this.app = parameters.app;
        this.id = parameters.id;
        this.storage = new UserStorage(this.app.storage, this.id);
        if ("accessToken" in parameters && "refreshToken" in parameters && "providerType" in parameters) {
            this._accessToken = parameters.accessToken;
            this._refreshToken = parameters.refreshToken;
            this.providerType = parameters.providerType;
            // Save the parameters to storage, for future instances to be hydrated from
            this.storage.accessToken = parameters.accessToken;
            this.storage.refreshToken = parameters.refreshToken;
            this.storage.providerType = parameters.providerType;
        }
        else {
            // Hydrate the rest of the parameters from storage
            this._accessToken = this.storage.accessToken;
            this._refreshToken = this.storage.refreshToken;
            const providerType = this.storage.providerType;
            this._profile = this.storage.profile;
            if (providerType) {
                this.providerType = providerType;
            }
            else {
                throw new Error("Storage is missing a provider type");
            }
        }
        this.fetcher = this.app.fetcher.clone({
            userContext: { currentUser: this },
        });
        this.apiKeys = new ApiKeyAuth(this.fetcher);
        this.functions = FunctionsFactory.create(this.fetcher);
    }
    /**
     * @returns The access token used to authenticate the user towards Atlas App Services.
     */
    get accessToken() {
        return this._accessToken;
    }
    /**
     * @param token The new access token.
     */
    set accessToken(token) {
        this._accessToken = token;
        this.storage.accessToken = token;
    }
    /**
     * @returns The refresh token used to issue new access tokens.
     */
    get refreshToken() {
        return this._refreshToken;
    }
    /**
     * @param token The new refresh token.
     */
    set refreshToken(token) {
        this._refreshToken = token;
        this.storage.refreshToken = token;
    }
    /**
     * @returns The current state of the user.
     */
    get state() {
        if (this.id in this.app.allUsers) {
            return this.refreshToken === null ? exports.UserState.LoggedOut : exports.UserState.Active;
        }
        else {
            return exports.UserState.Removed;
        }
    }
    /**
     * @returns The logged in state of the user.
     */
    get isLoggedIn() {
        return this.state === exports.UserState.Active;
    }
    get customData() {
        if (this.accessToken) {
            const decodedToken = this.decodeAccessToken();
            return decodedToken.userData;
        }
        else {
            throw new Error("Cannot read custom data without an access token");
        }
    }
    /**
     * @returns Profile containing detailed information about the user.
     */
    get profile() {
        if (this._profile) {
            return this._profile.data;
        }
        else {
            throw new Error("A profile was never fetched for this user");
        }
    }
    get identities() {
        if (this._profile) {
            return this._profile.identities;
        }
        else {
            throw new Error("A profile was never fetched for this user");
        }
    }
    get deviceId() {
        if (this.accessToken) {
            const payload = this.accessToken.split(".")[1];
            if (payload) {
                const parsedPayload = JSON.parse(gBase64.decode(payload));
                const deviceId = parsedPayload["baas_device_id"];
                if (typeof deviceId === "string" && deviceId !== DEFAULT_DEVICE_ID) {
                    return deviceId;
                }
            }
        }
        return null;
    }
    /**
     * Refresh the users profile data.
     */
    async refreshProfile() {
        // Fetch the latest profile
        const response = await this.fetcher.fetchJSON({
            method: "GET",
            path: routes.api().auth().profile().path,
        });
        // Create a profile instance
        this._profile = new UserProfile(response);
        // Store this for later hydration
        this.storage.profile = this._profile;
    }
    /**
     * Log out the user, invalidating the session (and its refresh token).
     */
    async logOut() {
        // Invalidate the refresh token
        try {
            if (this._refreshToken !== null) {
                await this.fetcher.fetchJSON({
                    method: "DELETE",
                    path: routes.api().auth().session().path,
                    tokenType: "refresh",
                });
            }
        }
        catch (err) {
            // Ignore failing to delete a missing refresh token
            // It might have expired or it might be gone due to the user being deleted
            if (!(err instanceof Error) || !err.message.includes("failed to find refresh token")) {
                throw err;
            }
        }
        finally {
            // Forget the access and refresh token
            this.accessToken = null;
            this.refreshToken = null;
        }
    }
    /** @inheritdoc */
    async linkCredentials(credentials) {
        const response = await this.app.authenticator.authenticate(credentials, this);
        // Sanity check the response
        if (this.id !== response.userId) {
            const details = `got user id ${response.userId} expected ${this.id}`;
            throw new Error(`Link response ment for another user (${details})`);
        }
        // Update the access token
        this.accessToken = response.accessToken;
        // Refresh the profile to include the new identity
        await this.refreshProfile();
    }
    /**
     * Request a new access token, using the refresh token.
     */
    async refreshAccessToken() {
        const response = await this.fetcher.fetchJSON({
            method: "POST",
            path: routes.api().auth().session().path,
            tokenType: "refresh",
        });
        const { access_token: accessToken } = response;
        if (typeof accessToken === "string") {
            this.accessToken = accessToken;
        }
        else {
            throw new Error("Expected an 'access_token' in the response");
        }
    }
    /** @inheritdoc */
    async refreshCustomData() {
        await this.refreshAccessToken();
        return this.customData;
    }
    /**
     * @inheritdoc
     */
    addListener() {
        throw new Error("Not yet implemented");
    }
    /**
     * @inheritdoc
     */
    removeListener() {
        throw new Error("Not yet implemented");
    }
    /**
     * @inheritdoc
     */
    removeAllListeners() {
        throw new Error("Not yet implemented");
    }
    /** @inheritdoc */
    callFunction(name, ...args) {
        return this.functions.callFunction(name, ...args);
    }
    /**
     * @returns A plain ol' JavaScript object representation of the user.
     */
    toJSON() {
        return {
            id: this.id,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            profile: this._profile,
            state: this.state,
            customData: this.customData,
        };
    }
    /** @inheritdoc */
    push() {
        throw new Error("Not yet implemented");
    }
    /** @inheritdoc */
    mongoClient(serviceName) {
        return createService(this.fetcher, serviceName);
    }
    decodeAccessToken() {
        if (this.accessToken) {
            // Decode and spread the token
            const parts = this.accessToken.split(".");
            if (parts.length !== 3) {
                throw new Error("Expected an access token with three parts");
            }
            // Decode the payload
            const encodedPayload = parts[1];
            const decodedPayload = gBase64.decode(encodedPayload);
            const parsedPayload = JSON.parse(decodedPayload);
            const { exp: expires, iat: issuedAt, sub: subject, user_data: userData = {} } = parsedPayload;
            // Validate the types
            if (typeof expires !== "number") {
                throw new Error("Failed to decode access token 'exp'");
            }
            else if (typeof issuedAt !== "number") {
                throw new Error("Failed to decode access token 'iat'");
            }
            return { expires, issuedAt, subject, userData };
        }
        else {
            throw new Error("Missing an access token");
        }
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
// TODO: Ensure the static interface of the Credentials class implements the static interface of Realm.Credentials
// See https://stackoverflow.com/a/43484801
/**
 * Instances of this class can be passed to the `app.logIn` method to authenticate an end-user.
 */
class Credentials {
    /**
     * Creates credentials that logs in using the [Anonymous Provider](https://docs.mongodb.com/realm/authentication/anonymous/).
     * @param reuse - Reuse any existing anonymous user already logged in.
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static anonymous(reuse = true) {
        return new Credentials("anon-user", "anon-user", reuse, {});
    }
    /**
     * Creates credentials that logs in using the [API Key Provider](https://docs.mongodb.com/realm/authentication/api-key/).
     * @param key The secret content of the API key.
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static apiKey(key) {
        return new Credentials("api-key", "api-key", false, { key });
    }
    /**
     * Creates credentials that logs in using the [Email/Password Provider](https://docs.mongodb.com/realm/authentication/email-password/).
     * Note: This was formerly known as the "Username/Password" provider.
     * @param email The end-users email address.
     * @param password The end-users password.
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static emailPassword(email, password) {
        return new Credentials("local-userpass", "local-userpass", false, {
            username: email,
            password,
        });
    }
    /**
     * Creates credentials that logs in using the [Custom Function Provider](https://docs.mongodb.com/realm/authentication/custom-function/).
     * @param payload The custom payload as expected by the server.
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static function(payload) {
        return new Credentials("custom-function", "custom-function", false, payload);
    }
    /**
     * Creates credentials that logs in using the [Custom JWT Provider](https://docs.mongodb.com/realm/authentication/custom-jwt/).
     * @param token The JSON Web Token (JWT).
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static jwt(token) {
        return new Credentials("custom-token", "custom-token", false, {
            token,
        });
    }
    /**
     * Creates credentials that logs in using the [Google Provider](https://docs.mongodb.com/realm/authentication/google/).
     * @param payload The URL that users should be redirected to, the auth code or id token from Google.
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static google(payload) {
        return new Credentials("oauth2-google", "oauth2-google", false, Credentials.derivePayload(payload));
    }
    /**
     * @param payload The payload string.
     * @returns A payload object based on the string.
     */
    static derivePayload(payload) {
        if (typeof payload === "string") {
            throw new Error("`google(<tokenString>)` has been deprecated.  Please use `google(<authCodeObject>).");
        }
        else if (Object.keys(payload).length === 1) {
            if ("authCode" in payload || "redirectUrl" in payload) {
                return payload;
            }
            else if ("idToken" in payload) {
                return { id_token: payload.idToken };
            }
            else {
                throw new Error("Unexpected payload: " + JSON.stringify(payload));
            }
        }
        else {
            throw new Error("Expected only one property in payload, got " + JSON.stringify(payload));
        }
    }
    /**
     * Creates credentials that logs in using the [Facebook Provider](https://docs.mongodb.com/realm/authentication/facebook/).
     * @param redirectUrlOrAccessToken The URL that users should be redirected to or the auth code returned from Facebook.
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static facebook(redirectUrlOrAccessToken) {
        return new Credentials("oauth2-facebook", "oauth2-facebook", false, redirectUrlOrAccessToken.includes("://")
            ? { redirectUrl: redirectUrlOrAccessToken }
            : { accessToken: redirectUrlOrAccessToken });
    }
    /**
     * Creates credentials that logs in using the [Apple ID Provider](https://docs.mongodb.com/realm/authentication/apple/).
     * @param redirectUrlOrIdToken The URL that users should be redirected to or the id_token returned from Apple.
     * @returns The credentials instance, which can be passed to `app.logIn`.
     */
    static apple(redirectUrlOrIdToken) {
        return new Credentials("oauth2-apple", "oauth2-apple", false, redirectUrlOrIdToken.includes("://") ? { redirectUrl: redirectUrlOrIdToken } : { id_token: redirectUrlOrIdToken });
    }
    /**
     * Constructs an instance of credentials.
     * @param providerName The name of the authentication provider used when authenticating.
     * @param providerType The type of the authentication provider used when authenticating.
     * @param reuse Reuse any user already authenticated with this provider.
     * @param payload The data being sent to the service when authenticating.
     */
    constructor(providerName, providerType, reuse, payload) {
        this.providerName = providerName;
        this.providerType = providerType;
        this.reuse = reuse;
        this.payload = payload;
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
const USER_IDS_STORAGE_KEY = "userIds";
const DEVICE_ID_STORAGE_KEY$1 = "deviceId";
/**
 * Storage specific to the app.
 */
class AppStorage extends PrefixedStorage {
    /**
     * @param storage The underlying storage to wrap.
     * @param appId The id of the app.
     */
    constructor(storage, appId) {
        super(storage, `app(${appId})`);
    }
    /**
     * Reads out the list of user ids from storage.
     * @returns A list of user ids.
     */
    getUserIds() {
        const userIdsString = this.get(USER_IDS_STORAGE_KEY);
        const userIds = userIdsString ? JSON.parse(userIdsString) : [];
        if (Array.isArray(userIds)) {
            // Remove any duplicates that might have been added
            // The Set preserves insertion order
            return [...new Set(userIds)];
        }
        else {
            throw new Error("Expected the user ids to be an array");
        }
    }
    /**
     * Sets the list of ids in storage.
     * Optionally merging with existing ids stored in the storage, by prepending these while voiding duplicates.
     * @param userIds The list of ids to store.
     * @param mergeWithExisting Prepend existing ids to avoid data-races with other apps using this storage.
     */
    setUserIds(userIds, mergeWithExisting) {
        if (mergeWithExisting) {
            // Add any existing user id to the end of this list, avoiding duplicates
            const existingIds = this.getUserIds();
            for (const id of existingIds) {
                if (userIds.indexOf(id) === -1) {
                    userIds.push(id);
                }
            }
        }
        // Store the list of ids
        this.set(USER_IDS_STORAGE_KEY, JSON.stringify(userIds));
    }
    /**
     * Remove an id from the list of ids.
     * @param userId The id of a User to be removed.
     */
    removeUserId(userId) {
        const existingIds = this.getUserIds();
        const userIds = existingIds.filter((id) => id !== userId);
        // Store the list of ids
        this.setUserIds(userIds, false);
    }
    /**
     * @returns id of this device (if any exists)
     */
    getDeviceId() {
        return this.get(DEVICE_ID_STORAGE_KEY$1);
    }
    /**
     * @param deviceId The id of this device, to send on subsequent authentication requests.
     */
    setDeviceId(deviceId) {
        this.set(DEVICE_ID_STORAGE_KEY$1, deviceId);
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const CLOSE_CHECK_INTERVAL = 100; // 10 times per second
const REDIRECT_HASH_TO_RESULT = {
    _baas_client_app_id: "appId",
    _baas_ua: "userAuth",
    _baas_link: "link",
    _baas_error: "error",
    _baas_state: "state",
};
/**
 * A collection of methods helping implement the OAuth2 flow.
 */
class OAuth2Helper {
    /**
     * Parses the query string from the final step of the OAuth flow.
     * @param queryString The query string passed through in location.hash.
     * @returns The result of the OAuth flow.
     */
    static parseRedirectLocation(queryString) {
        const params = decodeQueryString(queryString);
        const result = {};
        for (const [p, r] of Object.entries(REDIRECT_HASH_TO_RESULT)) {
            const value = params[p];
            if (value) {
                result[r] = value;
            }
        }
        return result;
    }
    /**
     * Handle the redirect querystring by parsing it and storing it for others to consume.
     * @param queryString The query string containing the encoded result from the OAuth provider.
     * @param storage The underlying storage used to persist the result.
     */
    static handleRedirect(queryString, storage = getEnvironment().defaultStorage) {
        const result = OAuth2Helper.parseRedirectLocation(queryString);
        const { state, error } = result;
        if (typeof state === "string") {
            const oauth2Storage = storage.prefix("oauth2");
            const stateStorage = OAuth2Helper.getStateStorage(oauth2Storage, state);
            stateStorage.set("result", JSON.stringify(result));
        }
        else if (error) {
            throw new Error(`Failed to handle OAuth 2.0 redirect: ${error}`);
        }
        else {
            throw new Error("Failed to handle OAuth 2.0 redirect.");
        }
    }
    /**
     * Decodes the authInfo string into its seperate parts.
     * @param authInfo An authInfo string returned from the server.
     * @returns An object containing the separate parts of the authInfo string.
     */
    static decodeAuthInfo(authInfo) {
        const parts = (authInfo || "").split("$");
        if (parts.length === 4) {
            const [accessToken, refreshToken, userId, deviceId] = parts;
            return { accessToken, refreshToken, userId, deviceId };
        }
        else {
            throw new Error("Failed to decode 'authInfo' into ids and tokens");
        }
    }
    /**
     * Get the storage key associated of an secret associated with a state.
     * @param storage The root storage used to derive a "state namespaced" storage.
     * @param state The random state.
     * @returns The storage associated with a particular state.
     */
    static getStateStorage(storage, state) {
        return storage.prefix(`state(${state})`);
    }
    /**
     * @param storage The underlying storage to use when storing and retriving secrets.
     * @param openWindow An optional function called when a browser window needs to open.
     */
    constructor(storage, openWindow = getEnvironment().openWindow) {
        this.storage = storage.prefix("oauth2");
        this.openWindow = openWindow;
    }
    /**
     * Open a window and wait for the redirect to be handled.
     * @param url The URL to open.
     * @param state The state which will be used to listen for storage updates.
     * @returns The result passed through the redirect.
     */
    openWindowAndWaitForRedirect(url, state) {
        const stateStorage = OAuth2Helper.getStateStorage(this.storage, state);
        // Return a promise that resolves when the  gets known
        return new Promise((resolve, reject) => {
            let redirectWindow = null;
            // We're declaring the interval now to enable referencing before its initialized
            let windowClosedInterval; // eslint-disable-line prefer-const
            const handleStorageUpdate = () => {
                // Trying to get the secret from storage
                const result = stateStorage.get("result");
                if (result) {
                    const parsedResult = JSON.parse(result);
                    // The secret got updated!
                    stateStorage.removeListener(handleStorageUpdate);
                    // Clear the storage to prevent others from reading this
                    stateStorage.clear();
                    // Try closing the newly created window
                    try {
                        if (redirectWindow) {
                            // Stop checking if the window closed
                            clearInterval(windowClosedInterval);
                            redirectWindow.close();
                        }
                    }
                    catch (err) {
                        console.warn(`Failed closing redirect window: ${err}`);
                    }
                    finally {
                        resolve(parsedResult);
                    }
                }
            };
            // Add a listener to the state storage, awaiting an update to the secret
            stateStorage.addListener(handleStorageUpdate);
            // Open up a window
            redirectWindow = this.openWindow(url);
            // Not using a const, because we need the two listeners to reference each other when removing the other.
            windowClosedInterval = setInterval(() => {
                // Polling "closed" because registering listeners on the window violates cross-origin policies
                if (!redirectWindow) {
                    // No need to keep polling for a window that we can't check
                    clearInterval(windowClosedInterval);
                }
                else if (redirectWindow.closed) {
                    // Stop polling the window state
                    clearInterval(windowClosedInterval);
                    // Stop listening for changes to the storage
                    stateStorage.removeListener(handleStorageUpdate);
                    // Reject the promise
                    const err = new Error("Window closed");
                    reject(err);
                }
            }, CLOSE_CHECK_INTERVAL);
        });
    }
    /**
     * Generate a random state string.
     * @returns The random state string.
     */
    generateState() {
        return generateRandomString(12, LOWERCASE_LETTERS);
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
const REDIRECT_LOCATION_HEADER = "x-baas-location";
/**
 * Handles authentication and linking of users.
 */
class Authenticator {
    /**
     * @param fetcher The fetcher used to fetch responses from the server.
     * @param storage The storage used when completing OAuth 2.0 flows (should not be scoped to a specific app).
     * @param getDeviceInformation Called to get device information to be sent to the server.
     */
    constructor(fetcher, storage, getDeviceInformation) {
        this.fetcher = fetcher;
        this.oauth2 = new OAuth2Helper(storage);
        this.getDeviceInformation = getDeviceInformation;
    }
    /**
     * @param credentials Credentials to use when logging in.
     * @param linkingUser A user requesting to link.
     * @returns A promise resolving to the response from the server.
     */
    async authenticate(credentials, linkingUser) {
        const deviceInformation = this.getDeviceInformation();
        const isLinking = typeof linkingUser === "object";
        if (credentials.providerType.startsWith("oauth2") && typeof credentials.payload.redirectUrl === "string") {
            // Initiate the OAuth2 flow by generating a state and fetch a redirect URL
            const state = this.oauth2.generateState();
            const url = await this.getLogInUrl(credentials, isLinking, {
                state,
                redirect: credentials.payload.redirectUrl,
                // Ensure redirects are communicated in a header different from "Location" and status remains 200 OK
                providerRedirectHeader: isLinking ? true : undefined,
                // Add the device information, only if we're not linking - since that request won't have a body of its own.
                device: !isLinking ? deviceInformation.encode() : undefined,
            });
            // If we're linking, we need to send the users access token in the request
            if (isLinking) {
                const response = await this.fetcher.fetch({
                    method: "GET",
                    url,
                    tokenType: isLinking ? "access" : "none",
                    user: linkingUser,
                    // The response will set a cookie that we need to tell the browser to store
                    mode: "cors",
                    credentials: "include",
                });
                // If a response header contains a redirect URL: Open a window and wait for the redirect to be handled
                const redirectUrl = response.headers.get(REDIRECT_LOCATION_HEADER);
                if (redirectUrl) {
                    return this.openWindowAndWaitForAuthResponse(redirectUrl, state);
                }
                else {
                    throw new Error(`Missing ${REDIRECT_LOCATION_HEADER} header`);
                }
            }
            else {
                // Otherwise we can open a window and let the server redirect the user right away
                // This gives lower latency (as we don't need the client to receive and execute the redirect in code)
                // This also has less dependency on cookies and doesn't sent any tokens.
                return this.openWindowAndWaitForAuthResponse(url, state);
            }
        }
        else {
            const logInUrl = await this.getLogInUrl(credentials, isLinking);
            const response = await this.fetcher.fetchJSON({
                method: "POST",
                url: logInUrl,
                body: {
                    ...credentials.payload,
                    options: {
                        device: deviceInformation.toJSON(),
                    },
                },
                tokenType: isLinking ? "access" : "none",
                user: linkingUser,
            });
            // Spread out values from the response and ensure they're valid
            const { user_id: userId, access_token: accessToken, refresh_token: refreshToken = null, device_id: deviceId, } = response;
            if (typeof userId !== "string") {
                throw new Error("Expected a user id in the response");
            }
            if (typeof accessToken !== "string") {
                throw new Error("Expected an access token in the response");
            }
            if (typeof refreshToken !== "string" && refreshToken !== null) {
                throw new Error("Expected refresh token to be a string or null");
            }
            if (typeof deviceId !== "string") {
                throw new Error("Expected device id to be a string");
            }
            return { userId, accessToken, refreshToken, deviceId };
        }
    }
    /**
     * @param credentials Credentials to use when logging in.
     * @param link Should the request link with the current user?
     * @param extraQueryParams Any extra parameters to include in the query string
     * @returns A promise resolving to the url to be used when logging in.
     */
    async getLogInUrl(credentials, link = false, extraQueryParams = {}) {
        // See https://github.com/mongodb/stitch-js-sdk/blob/310f0bd5af80f818cdfbc3caf1ae29ffa8e9c7cf/packages/core/sdk/src/auth/internal/CoreStitchAuth.ts#L746-L780
        const appRoute = this.fetcher.appRoute;
        const loginRoute = appRoute.authProvider(credentials.providerName).login();
        const qs = encodeQueryString({
            link: link ? "true" : undefined,
            ...extraQueryParams,
        });
        const locationUrl = await this.fetcher.locationUrl;
        return locationUrl + loginRoute.path + qs;
    }
    async openWindowAndWaitForAuthResponse(redirectUrl, state) {
        const redirectResult = await this.oauth2.openWindowAndWaitForRedirect(redirectUrl, state);
        // Decode the auth info (id, tokens, etc.) from the result of the redirect
        return OAuth2Helper.decodeAuthInfo(redirectResult.userAuth);
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
// TODO: Determine if the shape of an error response is specific to each service or widely used.
/**
 * An error produced while communicating with the MongoDB Realm server.
 */
class MongoDBRealmError extends Error {
    /**
     * Constructs and returns an error from a request and a response.
     * Note: The caller must throw this error themselves.
     * @param url The url of the requested resource.
     * @param request The request sent to the server.
     * @param response A raw response, as returned from the server.
     * @returns An error from a request and a response.
     */
    static async fromRequestAndResponse(url, request, response) {
        var _a;
        const { method = "unknown" } = request;
        const { status, statusText } = response;
        if ((_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.startsWith("application/json")) {
            const body = await response.json();
            if (typeof body === "object" && body) {
                const { error, error_code: errorCode, link } = body;
                return new MongoDBRealmError(method, url, status, statusText, typeof error === "string" ? error : undefined, typeof errorCode === "string" ? errorCode : undefined, typeof link === "string" ? link : undefined);
            }
        }
        return new MongoDBRealmError(method, url, status, statusText);
    }
    constructor(method, url, statusCode, statusText, error, errorCode, link) {
        const summary = statusText ? `status ${statusCode} ${statusText}` : `status ${statusCode}`;
        if (typeof error === "string") {
            super(`Request failed (${method} ${url}): ${error} (${summary})`);
        }
        else {
            super(`Request failed (${method} ${url}): (${summary})`);
        }
        this.method = method;
        this.url = url;
        this.statusText = statusText;
        this.statusCode = statusCode;
        this.error = error;
        this.errorCode = errorCode;
        this.link = link;
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * @param response A possible response.
 * @param response.body A possible response body.
 * @returns An async iterator.
 */
function asyncIteratorFromResponseBody({ body }) {
    if (typeof body !== "object" || body === null) {
        throw new Error("Expected a non-null object");
    }
    // else if (Symbol.asyncIterator in body) {
    //   return body as AsyncIterable<Uint8Array>;
    // }
    else if ("getReader" in body) {
        return {
            [Symbol.asyncIterator]() {
                const reader = body.getReader();
                return {
                    async next() {
                        const { done, value } = await reader.read();
                        if (done) {
                            // TODO: Simply return the result once https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1676 is merged and released
                            return { done, value: undefined };
                        }
                        else if (value instanceof Uint8Array) {
                            return { done, value };
                        }
                        else {
                            throw new Error("Expected value to be Uint8Array");
                        }
                    },
                    async return() {
                        await reader.cancel();
                        return { done: true, value: null };
                    },
                };
            },
        };
    }
    else {
        throw new Error("Expected an AsyncIterable or a ReadableStream");
    }
}
/**
 * Wraps the fetch from the "@realm/fetch" package.
 * Extracts error messages and throws `MongoDBRealmError` objects upon failures.
 * Injects access or refresh tokens for a current or specific user.
 * Refreshes access tokens if requests fails due to a 401 error.
 * Optionally parses response as JSON before returning it.
 * Fetches and exposes an app's location url.
 */
class Fetcher {
    /**
     * @param user An optional user to generate the header for.
     * @param tokenType The type of token (access or refresh).
     * @returns An object containing the user's token as "Authorization" header or undefined if no user is given.
     */
    static buildAuthorizationHeader(user, tokenType) {
        if (!user || tokenType === "none") {
            return {};
        }
        else if (tokenType === "access") {
            return { Authorization: `Bearer ${user.accessToken}` };
        }
        else if (tokenType === "refresh") {
            return { Authorization: `Bearer ${user.refreshToken}` };
        }
        else {
            throw new Error(`Unexpected token type (${tokenType})`);
        }
    }
    /**
     * @param body The body string or object passed from a request.
     * @returns An object optionally specifying the "Content-Type" header.
     */
    static buildBody(body) {
        if (!body) {
            return;
        }
        else if (typeof body === "object" && body !== null) {
            return JSON.stringify(serialize(body));
        }
        else if (typeof body === "string") {
            return body;
        }
        else {
            console.log("body is", body);
            throw new Error("Unexpected type of body");
        }
    }
    /**
     * @param body The body string or object passed from a request.
     * @returns An object optionally specifying the "Content-Type" header.
     */
    static buildJsonHeader(body) {
        if (body && body.length > 0) {
            return { "Content-Type": "application/json" };
        }
        else {
            return {};
        }
    }
    /**
     * @param config A configuration of the fetcher.
     * @param config.appId The application id.
     * @param config.fetch The fetch function used when fetching.
     * @param config.userContext An object used to determine the requesting user.
     * @param config.locationUrlContext An object used to determine the location / base URL.
     */
    constructor(config) {
        this.config = config;
    }
    clone(config) {
        return new Fetcher({
            ...this.config,
            ...config,
        });
    }
    /**
     * Fetch a network resource as an authenticated user.
     * @param request The request which should be sent to the server.
     * @returns The response from the server.
     */
    async fetch(request) {
        const { path, url, tokenType = "access", user = this.config.userContext.currentUser, ...restOfRequest } = request;
        if (typeof path === "string" && typeof url === "string") {
            throw new Error("Use of 'url' and 'path' mutually exclusive");
        }
        else if (typeof path === "string") {
            // Derive the URL
            const url = (await this.config.locationUrlContext.locationUrl) + path;
            return this.fetch({ ...request, path: undefined, url });
        }
        else if (typeof url === "string") {
            const response = await this.config.fetch(url, {
                ...restOfRequest,
                headers: {
                    ...Fetcher.buildAuthorizationHeader(user, tokenType),
                    ...request.headers,
                },
            });
            if (response.ok) {
                return response;
            }
            else {
                const error = await MongoDBRealmError.fromRequestAndResponse(url, request, response);
                if (user &&
                    response.status === 401 &&
                    (error.errorCode === "InvalidSession" || // Expired token
                        error.error === "unauthorized") // Entirely invalid signature
                ) {
                    if (tokenType === "access") {
                        // If the access token has expired, it would help refreshing it
                        await user.refreshAccessToken();
                        // Retry with the specific user, since the currentUser might have changed.
                        return this.fetch({ ...request, user });
                    }
                    else if (tokenType === "refresh") {
                        // A 401 error while using the refresh token indicates the token has an issue.
                        // Reset the tokens to prevent a lock.
                        user.accessToken = null;
                        user.refreshToken = null;
                    }
                }
                // Throw an error with a message extracted from the body
                throw error;
            }
        }
        else {
            throw new Error("Expected either 'url' or 'path'");
        }
    }
    /**
     * Fetch a network resource as an authenticated user and parse the result as extended JSON.
     * @param request The request which should be sent to the server.
     * @returns The response from the server, parsed as extended JSON.
     */
    async fetchJSON(request) {
        const { body } = request;
        const serializedBody = Fetcher.buildBody(body);
        const contentTypeHeaders = Fetcher.buildJsonHeader(serializedBody);
        const response = await this.fetch({
            ...request,
            body: serializedBody,
            headers: {
                Accept: "application/json",
                ...contentTypeHeaders,
                ...request.headers,
            },
        });
        const contentType = response.headers.get("content-type");
        if (contentType === null || contentType === void 0 ? void 0 : contentType.startsWith("application/json")) {
            const responseBody = await response.json();
            return deserialize(responseBody);
        }
        else if (contentType === null) {
            return null;
        }
        else {
            throw new Error(`Expected JSON response, got "${contentType}"`);
        }
    }
    /**
     * Fetch an "event-stream" resource as an authenticated user.
     * @param request The request which should be sent to the server.
     * @returns An async iterator over the response body.
     */
    async fetchStream(request) {
        const response = await this.fetch({
            ...request,
            headers: {
                Accept: "text/event-stream",
                ...request.headers,
            },
        });
        return asyncIteratorFromResponseBody(response);
    }
    /**
     * @returns The path of the app route.
     */
    get appRoute() {
        return routes.api().app(this.config.appId);
    }
    /**
     * @returns A promise of the location URL of the app.
     */
    get locationUrl() {
        return this.config.locationUrlContext.locationUrl;
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * The key in a storage on which the device id is stored.
 */
const DEVICE_ID_STORAGE_KEY = "deviceId";
var DeviceFields;
(function (DeviceFields) {
    DeviceFields["DEVICE_ID"] = "deviceId";
    DeviceFields["APP_ID"] = "appId";
    DeviceFields["APP_VERSION"] = "appVersion";
    DeviceFields["PLATFORM"] = "platform";
    DeviceFields["PLATFORM_VERSION"] = "platformVersion";
    DeviceFields["SDK_VERSION"] = "sdkVersion";
})(DeviceFields || (DeviceFields = {}));
/**
 * Information describing the device, app and SDK.
 */
class DeviceInformation {
    /**
     * @param params Construct the device information from these parameters.
     * @param params.appId A user-defined application id.
     * @param params.appVersion A user-defined application version.
     * @param params.deviceId An unique id for the end-users device.
     */
    constructor({ appId, appVersion, deviceId }) {
        /**
         * The version of the Realm Web SDK (constant provided by Rollup).
         */
        this.sdkVersion = "2.0.0";
        const environment = getEnvironment();
        this.platform = environment.platform;
        this.platformVersion = environment.platformVersion;
        this.appId = appId;
        this.appVersion = appVersion;
        this.deviceId = deviceId;
    }
    /**
     * @returns An base64 URI encoded representation of the device information.
     */
    encode() {
        const obj = removeKeysWithUndefinedValues(this);
        return gBase64.encode(JSON.stringify(obj));
    }
    /**
     * @returns The defaults
     */
    toJSON() {
        return removeKeysWithUndefinedValues(this);
    }
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * Default base url to prefix all requests if no baseUrl is specified in the configuration.
 */
const DEFAULT_BASE_URL = "https://services.cloud.mongodb.com";
/**
 * Atlas App Services Application
 */
class App {
    /**
     * Get or create a singleton Realm App from an id.
     * Calling this function multiple times with the same id will return the same instance.
     * @param id The Realm App id visible from the Atlas App Services UI or a configuration.
     * @returns The Realm App instance.
     */
    static getApp(id) {
        if (id in App.appCache) {
            return App.appCache[id];
        }
        else {
            const instance = new App(id);
            App.appCache[id] = instance;
            return instance;
        }
    }
    /**
     * Construct a Realm App, either from the Realm App id visible from the Atlas App Services UI or a configuration.
     * @param idOrConfiguration The Realm App id or a configuration to use for this app.
     */
    constructor(idOrConfiguration) {
        var _a;
        /**
         * An array of active and logged-out users.
         * Elements in the beginning of the array is considered more recent than the later elements.
         */
        this.users = [];
        /**
         * A promise resolving to the App's location url.
         */
        this._locationUrl = null;
        // If the argument is a string, convert it to a simple configuration object.
        const configuration = typeof idOrConfiguration === "string" ? { id: idOrConfiguration } : idOrConfiguration;
        // Initialize properties from the configuration
        if (typeof configuration === "object" && typeof configuration.id === "string") {
            this.id = configuration.id;
        }
        else {
            throw new Error("Missing an Atlas App Services app-id");
        }
        this.baseUrl = configuration.baseUrl || DEFAULT_BASE_URL;
        if (configuration.skipLocationRequest) {
            // Use the base url directly, instead of requesting a location URL from the server
            this._locationUrl = Promise.resolve(this.baseUrl);
        }
        this.localApp = configuration.app;
        // Construct a fetcher wrapping the network transport
        this.fetcher = new Fetcher({
            appId: this.id,
            userContext: this,
            locationUrlContext: this,
            fetch: (_a = configuration.fetch) !== null && _a !== void 0 ? _a : fetch,
        });
        // Construct the auth providers
        this.emailPasswordAuth = new EmailPasswordAuth(this.fetcher);
        // Construct the storage
        const baseStorage = configuration.storage || getEnvironment().defaultStorage;
        this.storage = new AppStorage(baseStorage, this.id);
        this.authenticator = new Authenticator(this.fetcher, baseStorage, () => this.deviceInformation);
        // Hydrate the app state from storage
        try {
            this.hydrate();
        }
        catch (err) {
            // The storage was corrupted
            this.storage.clear();
            // A failed hydration shouldn't throw and break the app experience
            // Since this is "just" persisted state that unfortunately got corrupted or partially lost
            console.warn("Realm app hydration failed:", err instanceof Error ? err.message : err);
        }
    }
    /**
     * Switch user.
     * @param nextUser The user or id of the user to switch to.
     */
    switchUser(nextUser) {
        const index = this.users.findIndex((u) => u === nextUser);
        if (index === -1) {
            throw new Error("The user was never logged into this app");
        }
        // Remove the user from the stack
        const [user] = this.users.splice(index, 1);
        // Insert the user in the beginning of the stack
        this.users.unshift(user);
    }
    /**
     * Log in a user.
     * @param credentials Credentials to use when logging in.
     * @param fetchProfile Should the users profile be fetched? (default: true)
     * @returns A promise resolving to the newly logged in user.
     */
    async logIn(credentials, fetchProfile = true) {
        if (credentials.reuse) {
            // TODO: Consider exposing providerName on "User" and match against that instead?
            const existingUser = this.users.find((user) => user.providerType === credentials.providerType);
            if (existingUser) {
                this.switchUser(existingUser);
                // If needed, fetch and set the profile on the user
                if (fetchProfile) {
                    await existingUser.refreshProfile();
                }
                return existingUser;
            }
        }
        const response = await this.authenticator.authenticate(credentials);
        const user = this.createOrUpdateUser(response, credentials.providerType);
        // Let's ensure this will be the current user, in case the user object was reused.
        this.switchUser(user);
        // If needed, fetch and set the profile on the user
        if (fetchProfile) {
            await user.refreshProfile();
        }
        // Persist the user id in the storage,
        // merging to avoid overriding logins from other apps using the same underlying storage
        this.storage.setUserIds(this.users.map((u) => u.id), true);
        // Read out and store the device id from the server
        const deviceId = response.deviceId;
        if (deviceId && deviceId !== "000000000000000000000000") {
            this.storage.set(DEVICE_ID_STORAGE_KEY, deviceId);
        }
        // Return the user
        return user;
    }
    /**
     * @inheritdoc
     */
    async removeUser(user) {
        // Remove the user from the list of users
        const index = this.users.findIndex((u) => u === user);
        if (index === -1) {
            throw new Error("The user was never logged into this app");
        }
        this.users.splice(index, 1);
        // Log out the user - this removes access and refresh tokens from storage
        await user.logOut();
        // Remove the users profile from storage
        this.storage.remove(`user(${user.id}):profile`);
        // Remove the user from the storage
        this.storage.removeUserId(user.id);
    }
    /**
     * @inheritdoc
     */
    async deleteUser(user) {
        await this.fetcher.fetchJSON({
            method: "DELETE",
            path: routes.api().auth().delete().path,
        });
        await this.removeUser(user);
    }
    /**
     * @inheritdoc
     */
    addListener() {
        throw new Error("Not yet implemented");
    }
    /**
     * @inheritdoc
     */
    removeListener() {
        throw new Error("Not yet implemented");
    }
    /**
     * @inheritdoc
     */
    removeAllListeners() {
        throw new Error("Not yet implemented");
    }
    /**
     * The currently active user (or null if no active users exists).
     * @returns the currently active user or null.
     */
    get currentUser() {
        const activeUsers = this.users.filter((user) => user.state === exports.UserState.Active);
        if (activeUsers.length === 0) {
            return null;
        }
        else {
            // Current user is the top of the stack
            return activeUsers[0];
        }
    }
    /**
     * All active and logged-out users:
     * - First in the list are active users (ordered by most recent call to switchUser or login)
     * - Followed by logged out users (also ordered by most recent call to switchUser or login).
     * @returns An array of users active or logged out users (current user being the first).
     */
    get allUsers() {
        // Returning a freezed copy of the list of users to prevent outside changes
        return Object.fromEntries(this.users.map((user) => [user.id, user]));
    }
    /**
     * @returns A promise of the app URL, with the app location resolved.
     */
    get locationUrl() {
        if (!this._locationUrl) {
            const path = routes.api().app(this.id).location().path;
            this._locationUrl = this.fetcher
                .fetchJSON({
                method: "GET",
                url: this.baseUrl + path,
                tokenType: "none",
            })
                .then((body) => {
                if (typeof body !== "object") {
                    throw new Error("Expected response body be an object");
                }
                else {
                    return body;
                }
            })
                .then(({ hostname }) => {
                if (typeof hostname !== "string") {
                    throw new Error("Expected response to contain a 'hostname'");
                }
                else {
                    return hostname;
                }
            })
                .catch((err) => {
                // Reset the location to allow another request to fetch again.
                this._locationUrl = null;
                throw err;
            });
        }
        return this._locationUrl;
    }
    /**
     * @returns Information about the current device, sent to the server when authenticating.
     */
    get deviceInformation() {
        const deviceIdStr = this.storage.getDeviceId();
        const deviceId = typeof deviceIdStr === "string" && deviceIdStr !== "000000000000000000000000"
            ? new bson.ObjectId(deviceIdStr)
            : undefined;
        return new DeviceInformation({
            appId: this.localApp ? this.localApp.name : undefined,
            appVersion: this.localApp ? this.localApp.version : undefined,
            deviceId,
        });
    }
    /**
     * Create (and store) a new user or update an existing user's access and refresh tokens.
     * This helps de-duplicating users in the list of users known to the app.
     * @param response A response from the Authenticator.
     * @param providerType The type of the authentication provider used.
     * @returns A new or an existing user.
     */
    createOrUpdateUser(response, providerType) {
        const existingUser = this.users.find((u) => u.id === response.userId);
        if (existingUser) {
            // Update the users access and refresh tokens
            existingUser.accessToken = response.accessToken;
            existingUser.refreshToken = response.refreshToken;
            return existingUser;
        }
        else {
            // Create and store a new user
            if (!response.refreshToken) {
                throw new Error("No refresh token in response from server");
            }
            const user = new User({
                app: this,
                id: response.userId,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                providerType,
            });
            this.users.unshift(user);
            return user;
        }
    }
    /**
     * Restores the state of the app (active and logged-out users) from the storage
     */
    hydrate() {
        const userIds = this.storage.getUserIds();
        this.users = userIds.map((id) => new User({ app: this, id }));
    }
}
/**
 * A map of app instances returned from calling getApp.
 */
App.appCache = {};
/**
 * Instances of this class can be passed to the `app.logIn` method to authenticate an end-user.
 */
App.Credentials = Credentials;

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
/**
 * Get or create a singleton Realm App from an id.
 * Calling this function multiple times with the same id will return the same instance.
 * @param id The Realm App id visible from the Atlas App Services UI or a configuration.
 * @returns The Realm App instance.
 */
function getApp(id) {
    return App.getApp(id);
}

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
const environment = {
    defaultStorage: new MemoryStorage(),
    openWindow: (url) => {
        console.log(`Please open this URL: ${url}`);
        return null;
    },
    platform: process.release.name || "node",
    platformVersion: process.versions.node,
    TextDecoder: util.TextDecoder,
};
setEnvironment(environment);
/**
 * Handle an OAuth 2.0 redirect.
 */
function handleAuthRedirect() {
    throw new Error("Handling OAuth 2.0 redirects is not supported outside a browser");
}

exports.BSON = bson__namespace;
exports.App = App;
exports.Credentials = Credentials;
exports.DEFAULT_BASE_URL = DEFAULT_BASE_URL;
exports.MongoDBRealmError = MongoDBRealmError;
exports.User = User;
exports.getApp = getApp;
exports.getEnvironment = getEnvironment;
exports.handleAuthRedirect = handleAuthRedirect;
exports.setEnvironment = setEnvironment;
//# sourceMappingURL=bundle.cjs.js.map
