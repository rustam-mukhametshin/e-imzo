export class Main {
    _Base64: string;
    version: string;
    buffer: any;
    b64chars: string;
    fromCharCode: any;
    b64tab: Object;
    re_utob: RegExp;

    constructor(
        private global
    ) {
        this.init();
    }

    private init(): void {
        this._Base64 = this.global.Base64;
        this.version = "2.1.4";

        // if node.js, we use Buffer
        this.setBuffer()

        // constants
        this.b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        this.b64tab = () => this.getB64tab();
        this.fromCharCode = String.fromCharCode;

        this.re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;

        // export Base64
        this.global.Base64 = {
            VERSION: this.version,
            atob: this.atob,
            btoa: this.btoa,
            fromBase64: this.decode,
            toBase64: this.encode,
            utob: this.utob,
            encode: this.encode,
            encodeURI: this.encodeURI,
            btou: this.btou,
            decode: this.decode,
            noConflict: this.noConflict
        };

        this.extendString();
    }

    private setBuffer(): void {
        if (typeof module !== 'undefined' && module.exports) {
            this.buffer = require('buffer').Buffer;
        }
    };

    // constants
    private getB64tab(): {} {
        const bin = this.b64chars;
        const t = {};
        for (let i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }

    // encoder stuff
    cb_utob(c) {
        let cc;
        const fromCharCode = this.fromCharCode;
        if (c.length < 2) {
            cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                    + fromCharCode(0x80 | (cc & 0x3f)))
                    : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                        + fromCharCode(0x80 | ((cc >>> 6) & 0x3f))
                        + fromCharCode(0x80 | (cc & 0x3f)));
        } else {
            cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                + fromCharCode(0x80 | ((cc >>> 6) & 0x3f))
                + fromCharCode(0x80 | (cc & 0x3f)));
        }
    }

    utob(u) {
        return u.replace(this.re_utob, this.cb_utob);
    }

    cb_encode(ccc) {
        const padlen = [0, 2, 1][ccc.length % 3],
            ord = ccc.charCodeAt(0) << 16
                | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
                | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
            chars = [
                this.b64chars.charAt(ord >>> 18),
                this.b64chars.charAt((ord >>> 12) & 63),
                padlen >= 2 ? '=' : this.b64chars.charAt((ord >>> 6) & 63),
                padlen >= 1 ? '=' : this.b64chars.charAt(ord & 63)
            ];
        return chars.join('');
    }

    btoa(a) {
        return global.btoa ? () => global.btoa(a) : () => {
            return a.replace(/[\s\S]{1,3}/g, this.cb_encode);
        }
    }

    _encode(s): string | any {
        if (this.buffer) {
            return (new this.buffer(s)).toString('base64')
        } else {
            return this.btoa(this.utob(s))
        }
    }


    encode(u, urisafe) {
        return !urisafe
            ? this._encode(u)
            : this._encode(u).replace(/[+\/]/g, function (m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    }

    encodeURI(u) {
        return this.encode(u, true)
    }


    // decoder stuff
    re_btou(): RegExp {
        return new RegExp([
            '[\xC0-\xDF][\x80-\xBF]',
            '[\xE0-\xEF][\x80-\xBF]{2}',
            '[\xF0-\xF7][\x80-\xBF]{3}'
        ].join('|'), 'g')
    }

    cb_btou(cccc) {
        switch (cccc.length) {
            case 4:
                const cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                    | ((0x3f & cccc.charCodeAt(1)) << 12)
                    | ((0x3f & cccc.charCodeAt(2)) << 6)
                    | (0x3f & cccc.charCodeAt(3)),
                    offset = cp - 0x10000;
                return (this.fromCharCode((offset >>> 10) + 0xD800)
                    + this.fromCharCode((offset & 0x3FF) + 0xDC00));
            case 3:
                return this.fromCharCode(
                    ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    | (0x3f & cccc.charCodeAt(2))
                );
            default:
                return this.fromCharCode(
                    ((0x1f & cccc.charCodeAt(0)) << 6)
                    | (0x3f & cccc.charCodeAt(1))
                );
        }
    }

    btou(b) {
        return b.replace(this.re_btou, this.cb_btou);
    }

    cb_decode = (cccc) => {
        const b64tab = this.b64tab;
        const fromCharCode = this.fromCharCode;
        const len = cccc.length,
            padlen = len % 4,
            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
                | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
                | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0)
                | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
            chars = [
                fromCharCode(n >>> 16),
                fromCharCode((n >>> 8) & 0xff),
                fromCharCode(n & 0xff)
            ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    }

    atob(b) {
        return this.global.atob ? () => {
            return this.global.atob(b);
        } : () => {
            return b.replace(/[\s\S]{1,4}/g, this.cb_decode);
        }
    }

    _decode(b) {
        return this.buffer
            ? () => {
                return (new this.buffer(b, 'base64')).toString()
            }
            : () => {
                return this.btou(this.atob(b))
            }
    }

    decode(a) {
        return this._decode(
            a.replace(/[-_]/g, function (m0) {
                return m0 == '-' ? '+' : '/'
            })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    }

    noConflict() {
        const Base64 = this.global.Base64;
        this.global.Base64 = this._Base64;
        return Base64;
    }

    // if ES5 is available, make Base64.extendString() available
    extendString() {
        if (typeof Object.defineProperty === 'function') {
            const noEnum = v => ({value: v, enumerable: false, writable: true, configurable: true});

            this.global.Base64.extendString = () => {
                Object.defineProperty(
                    String.prototype, 'fromBase64', noEnum(() => {
                        return this.decode(this)
                    }));
                Object.defineProperty(
                    String.prototype, 'toBase64', noEnum((urisafe) => {
                        return this.encode(this, urisafe)
                    }));
                Object.defineProperty(
                    String.prototype, 'toBase64URI', noEnum(() => {
                        return this.encode(this, true)
                    }));
            };
        }
    }

}
