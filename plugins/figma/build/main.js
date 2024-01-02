var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol = (name, symbol) => {
  return (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);

// src/config/env.ts
var F2RN_UI_WIDTH_MIN, F2RN_STYLEGEN_API, F2RN_CONFIG_NS, F2RN_PROJECT_NS, F2RN_NAVIGATE_NS;
var init_env = __esm({
  "src/config/env.ts"() {
    F2RN_UI_WIDTH_MIN = 249;
    F2RN_STYLEGEN_API = "https://f2rn.deno.dev";
    F2RN_CONFIG_NS = "f2rn:config:v3";
    F2RN_PROJECT_NS = "f2rn:project:v3";
    F2RN_NAVIGATE_NS = "f2rn:navigate:v3";
  }
});

// ../../node_modules/.pnpm/@create-figma-plugin+utilities@3.1.0/node_modules/@create-figma-plugin/utilities/lib/events.js
function on(name, handler) {
  const id = `${currentId}`;
  currentId += 1;
  eventHandlers[id] = { handler, name };
  return function() {
    delete eventHandlers[id];
  };
}
function once(name, handler) {
  let done = false;
  return on(name, function(...args) {
    if (done === true) {
      return;
    }
    done = true;
    handler(...args);
  });
}
function invokeEventHandler(name, args) {
  let invoked = false;
  for (const id in eventHandlers) {
    if (eventHandlers[id].name === name) {
      eventHandlers[id].handler.apply(null, args);
      invoked = true;
    }
  }
  if (invoked === false) {
    throw new Error(`No event handler with name \`${name}\``);
  }
}
var eventHandlers, currentId, emit;
var init_events = __esm({
  "../../node_modules/.pnpm/@create-figma-plugin+utilities@3.1.0/node_modules/@create-figma-plugin/utilities/lib/events.js"() {
    eventHandlers = {};
    currentId = 0;
    emit = typeof window === "undefined" ? function(name, ...args) {
      figma.ui.postMessage([name, ...args]);
    } : function(name, ...args) {
      window.parent.postMessage({
        pluginMessage: [name, ...args]
      }, "*");
    };
    if (typeof window === "undefined") {
      figma.ui.onmessage = function(args) {
        if (!Array.isArray(args)) {
          return;
        }
        const [name, ...rest] = args;
        if (typeof name !== "string") {
          return;
        }
        invokeEventHandler(name, rest);
      };
    } else {
      window.onmessage = function(event) {
        if (typeof event.data.pluginMessage === "undefined") {
          return;
        }
        const args = event.data.pluginMessage;
        if (!Array.isArray(args)) {
          return;
        }
        const [name, ...rest] = event.data.pluginMessage;
        if (typeof name !== "string") {
          return;
        }
        invokeEventHandler(name, rest);
      };
    }
  }
});

// ../../node_modules/.pnpm/@create-figma-plugin+utilities@3.1.0/node_modules/@create-figma-plugin/utilities/lib/ui.js
function showUI(options, data) {
  if (typeof __html__ === "undefined") {
    throw new Error("No UI defined");
  }
  const html = `<div id="create-figma-plugin"></div><script>document.body.classList.add('theme-${figma.editorType}');const __FIGMA_COMMAND__='${typeof figma.command === "undefined" ? "" : figma.command}';const __SHOW_UI_DATA__=${JSON.stringify(typeof data === "undefined" ? {} : data)};${__html__}</script>`;
  figma.showUI(html, __spreadProps(__spreadValues({}, options), {
    themeColors: typeof options.themeColors === "undefined" ? true : options.themeColors
  }));
}
var init_ui = __esm({
  "../../node_modules/.pnpm/@create-figma-plugin+utilities@3.1.0/node_modules/@create-figma-plugin/utilities/lib/ui.js"() {
  }
});

// ../../node_modules/.pnpm/@create-figma-plugin+utilities@3.1.0/node_modules/@create-figma-plugin/utilities/lib/index.js
var init_lib = __esm({
  "../../node_modules/.pnpm/@create-figma-plugin+utilities@3.1.0/node_modules/@create-figma-plugin/utilities/lib/index.js"() {
    init_events();
    init_ui();
  }
});

// src/backend/parser/lib/validate.ts
function validate(component) {
  if (!component || component.type !== "COMPONENT") {
    throw new Error(`Component not found.`);
  }
  if (component.findAllWithCriteria({ types: ["GROUP", "SECTION"] }).length > 0) {
    throw new Error(`Groups & sections are not supported. Convert to frames.`);
  }
  return true;
}
var init_validate = __esm({
  "src/backend/parser/lib/validate.ts"() {
  }
});

// ../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/util.js
var require_util = __commonJS({
  "../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/util.js"(exports, module) {
    var ERROR_MSG_INPUT = "Input must be an string, Buffer or Uint8Array";
    function normalizeInput(input) {
      let ret;
      if (input instanceof Uint8Array) {
        ret = input;
      } else if (typeof input === "string") {
        const encoder = new TextEncoder();
        ret = encoder.encode(input);
      } else {
        throw new Error(ERROR_MSG_INPUT);
      }
      return ret;
    }
    function toHex2(bytes) {
      return Array.prototype.map.call(bytes, function(n) {
        return (n < 16 ? "0" : "") + n.toString(16);
      }).join("");
    }
    function uint32ToHex(val) {
      return (4294967296 + val).toString(16).substring(1);
    }
    function debugPrint(label, arr, size) {
      let msg = "\n" + label + " = ";
      for (let i = 0; i < arr.length; i += 2) {
        if (size === 32) {
          msg += uint32ToHex(arr[i]).toUpperCase();
          msg += " ";
          msg += uint32ToHex(arr[i + 1]).toUpperCase();
        } else if (size === 64) {
          msg += uint32ToHex(arr[i + 1]).toUpperCase();
          msg += uint32ToHex(arr[i]).toUpperCase();
        } else
          throw new Error("Invalid size " + size);
        if (i % 6 === 4) {
          msg += "\n" + new Array(label.length + 4).join(" ");
        } else if (i < arr.length - 2) {
          msg += " ";
        }
      }
      console.log(msg);
    }
    function testSpeed(hashFn, N, M) {
      let startMs = (/* @__PURE__ */ new Date()).getTime();
      const input = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        input[i] = i % 256;
      }
      const genMs = (/* @__PURE__ */ new Date()).getTime();
      console.log("Generated random input in " + (genMs - startMs) + "ms");
      startMs = genMs;
      for (let i = 0; i < M; i++) {
        const hashHex = hashFn(input);
        const hashMs = (/* @__PURE__ */ new Date()).getTime();
        const ms = hashMs - startMs;
        startMs = hashMs;
        console.log("Hashed in " + ms + "ms: " + hashHex.substring(0, 20) + "...");
        console.log(
          Math.round(N / (1 << 20) / (ms / 1e3) * 100) / 100 + " MB PER SECOND"
        );
      }
    }
    module.exports = {
      normalizeInput,
      toHex: toHex2,
      debugPrint,
      testSpeed
    };
  }
});

// ../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/blake2b.js
var require_blake2b = __commonJS({
  "../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/blake2b.js"(exports, module) {
    var util = require_util();
    function ADD64AA(v2, a, b) {
      const o0 = v2[a] + v2[b];
      let o1 = v2[a + 1] + v2[b + 1];
      if (o0 >= 4294967296) {
        o1++;
      }
      v2[a] = o0;
      v2[a + 1] = o1;
    }
    function ADD64AC(v2, a, b0, b1) {
      let o0 = v2[a] + b0;
      if (b0 < 0) {
        o0 += 4294967296;
      }
      let o1 = v2[a + 1] + b1;
      if (o0 >= 4294967296) {
        o1++;
      }
      v2[a] = o0;
      v2[a + 1] = o1;
    }
    function B2B_GET32(arr, i) {
      return arr[i] ^ arr[i + 1] << 8 ^ arr[i + 2] << 16 ^ arr[i + 3] << 24;
    }
    function B2B_G(a, b, c, d, ix, iy) {
      const x0 = m[ix];
      const x1 = m[ix + 1];
      const y0 = m[iy];
      const y1 = m[iy + 1];
      ADD64AA(v, a, b);
      ADD64AC(v, a, x0, x1);
      let xor0 = v[d] ^ v[a];
      let xor1 = v[d + 1] ^ v[a + 1];
      v[d] = xor1;
      v[d + 1] = xor0;
      ADD64AA(v, c, d);
      xor0 = v[b] ^ v[c];
      xor1 = v[b + 1] ^ v[c + 1];
      v[b] = xor0 >>> 24 ^ xor1 << 8;
      v[b + 1] = xor1 >>> 24 ^ xor0 << 8;
      ADD64AA(v, a, b);
      ADD64AC(v, a, y0, y1);
      xor0 = v[d] ^ v[a];
      xor1 = v[d + 1] ^ v[a + 1];
      v[d] = xor0 >>> 16 ^ xor1 << 16;
      v[d + 1] = xor1 >>> 16 ^ xor0 << 16;
      ADD64AA(v, c, d);
      xor0 = v[b] ^ v[c];
      xor1 = v[b + 1] ^ v[c + 1];
      v[b] = xor1 >>> 31 ^ xor0 << 1;
      v[b + 1] = xor0 >>> 31 ^ xor1 << 1;
    }
    var BLAKE2B_IV32 = new Uint32Array([
      4089235720,
      1779033703,
      2227873595,
      3144134277,
      4271175723,
      1013904242,
      1595750129,
      2773480762,
      2917565137,
      1359893119,
      725511199,
      2600822924,
      4215389547,
      528734635,
      327033209,
      1541459225
    ]);
    var SIGMA8 = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3,
      11,
      8,
      12,
      0,
      5,
      2,
      15,
      13,
      10,
      14,
      3,
      6,
      7,
      1,
      9,
      4,
      7,
      9,
      3,
      1,
      13,
      12,
      11,
      14,
      2,
      6,
      5,
      10,
      4,
      0,
      15,
      8,
      9,
      0,
      5,
      7,
      2,
      4,
      10,
      15,
      14,
      1,
      11,
      12,
      6,
      8,
      3,
      13,
      2,
      12,
      6,
      10,
      0,
      11,
      8,
      3,
      4,
      13,
      7,
      5,
      15,
      14,
      1,
      9,
      12,
      5,
      1,
      15,
      14,
      13,
      4,
      10,
      0,
      7,
      6,
      3,
      9,
      2,
      8,
      11,
      13,
      11,
      7,
      14,
      12,
      1,
      3,
      9,
      5,
      0,
      15,
      4,
      8,
      6,
      2,
      10,
      6,
      15,
      14,
      9,
      11,
      3,
      0,
      8,
      12,
      2,
      13,
      7,
      1,
      4,
      10,
      5,
      10,
      2,
      8,
      4,
      7,
      6,
      1,
      5,
      15,
      11,
      9,
      14,
      3,
      12,
      13,
      0,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3
    ];
    var SIGMA82 = new Uint8Array(
      SIGMA8.map(function(x) {
        return x * 2;
      })
    );
    var v = new Uint32Array(32);
    var m = new Uint32Array(32);
    function blake2bCompress(ctx, last) {
      let i = 0;
      for (i = 0; i < 16; i++) {
        v[i] = ctx.h[i];
        v[i + 16] = BLAKE2B_IV32[i];
      }
      v[24] = v[24] ^ ctx.t;
      v[25] = v[25] ^ ctx.t / 4294967296;
      if (last) {
        v[28] = ~v[28];
        v[29] = ~v[29];
      }
      for (i = 0; i < 32; i++) {
        m[i] = B2B_GET32(ctx.b, 4 * i);
      }
      for (i = 0; i < 12; i++) {
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
      }
      for (i = 0; i < 16; i++) {
        ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
      }
    }
    var parameterBlock = new Uint8Array([
      0,
      0,
      0,
      0,
      //  0: outlen, keylen, fanout, depth
      0,
      0,
      0,
      0,
      //  4: leaf length, sequential mode
      0,
      0,
      0,
      0,
      //  8: node offset
      0,
      0,
      0,
      0,
      // 12: node offset
      0,
      0,
      0,
      0,
      // 16: node depth, inner length, rfu
      0,
      0,
      0,
      0,
      // 20: rfu
      0,
      0,
      0,
      0,
      // 24: rfu
      0,
      0,
      0,
      0,
      // 28: rfu
      0,
      0,
      0,
      0,
      // 32: salt
      0,
      0,
      0,
      0,
      // 36: salt
      0,
      0,
      0,
      0,
      // 40: salt
      0,
      0,
      0,
      0,
      // 44: salt
      0,
      0,
      0,
      0,
      // 48: personal
      0,
      0,
      0,
      0,
      // 52: personal
      0,
      0,
      0,
      0,
      // 56: personal
      0,
      0,
      0,
      0
      // 60: personal
    ]);
    function blake2bInit(outlen, key, salt, personal) {
      if (outlen === 0 || outlen > 64) {
        throw new Error("Illegal output length, expected 0 < length <= 64");
      }
      if (key && key.length > 64) {
        throw new Error("Illegal key, expected Uint8Array with 0 < length <= 64");
      }
      if (salt && salt.length !== 16) {
        throw new Error("Illegal salt, expected Uint8Array with length is 16");
      }
      if (personal && personal.length !== 16) {
        throw new Error("Illegal personal, expected Uint8Array with length is 16");
      }
      const ctx = {
        b: new Uint8Array(128),
        h: new Uint32Array(16),
        t: 0,
        // input count
        c: 0,
        // pointer within buffer
        outlen
        // output length in bytes
      };
      parameterBlock.fill(0);
      parameterBlock[0] = outlen;
      if (key)
        parameterBlock[1] = key.length;
      parameterBlock[2] = 1;
      parameterBlock[3] = 1;
      if (salt)
        parameterBlock.set(salt, 32);
      if (personal)
        parameterBlock.set(personal, 48);
      for (let i = 0; i < 16; i++) {
        ctx.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(parameterBlock, i * 4);
      }
      if (key) {
        blake2bUpdate(ctx, key);
        ctx.c = 128;
      }
      return ctx;
    }
    function blake2bUpdate(ctx, input) {
      for (let i = 0; i < input.length; i++) {
        if (ctx.c === 128) {
          ctx.t += ctx.c;
          blake2bCompress(ctx, false);
          ctx.c = 0;
        }
        ctx.b[ctx.c++] = input[i];
      }
    }
    function blake2bFinal(ctx) {
      ctx.t += ctx.c;
      while (ctx.c < 128) {
        ctx.b[ctx.c++] = 0;
      }
      blake2bCompress(ctx, true);
      const out = new Uint8Array(ctx.outlen);
      for (let i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> 8 * (i & 3);
      }
      return out;
    }
    function blake2b(input, key, outlen, salt, personal) {
      outlen = outlen || 64;
      input = util.normalizeInput(input);
      if (salt) {
        salt = util.normalizeInput(salt);
      }
      if (personal) {
        personal = util.normalizeInput(personal);
      }
      const ctx = blake2bInit(outlen, key, salt, personal);
      blake2bUpdate(ctx, input);
      return blake2bFinal(ctx);
    }
    function blake2bHex(input, key, outlen, salt, personal) {
      const output = blake2b(input, key, outlen, salt, personal);
      return util.toHex(output);
    }
    module.exports = {
      blake2b,
      blake2bHex,
      blake2bInit,
      blake2bUpdate,
      blake2bFinal
    };
  }
});

// ../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/blake2s.js
var require_blake2s = __commonJS({
  "../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/blake2s.js"(exports, module) {
    var util = require_util();
    function B2S_GET32(v2, i) {
      return v2[i] ^ v2[i + 1] << 8 ^ v2[i + 2] << 16 ^ v2[i + 3] << 24;
    }
    function B2S_G(a, b, c, d, x, y) {
      v[a] = v[a] + v[b] + x;
      v[d] = ROTR32(v[d] ^ v[a], 16);
      v[c] = v[c] + v[d];
      v[b] = ROTR32(v[b] ^ v[c], 12);
      v[a] = v[a] + v[b] + y;
      v[d] = ROTR32(v[d] ^ v[a], 8);
      v[c] = v[c] + v[d];
      v[b] = ROTR32(v[b] ^ v[c], 7);
    }
    function ROTR32(x, y) {
      return x >>> y ^ x << 32 - y;
    }
    var BLAKE2S_IV = new Uint32Array([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    var SIGMA = new Uint8Array([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3,
      11,
      8,
      12,
      0,
      5,
      2,
      15,
      13,
      10,
      14,
      3,
      6,
      7,
      1,
      9,
      4,
      7,
      9,
      3,
      1,
      13,
      12,
      11,
      14,
      2,
      6,
      5,
      10,
      4,
      0,
      15,
      8,
      9,
      0,
      5,
      7,
      2,
      4,
      10,
      15,
      14,
      1,
      11,
      12,
      6,
      8,
      3,
      13,
      2,
      12,
      6,
      10,
      0,
      11,
      8,
      3,
      4,
      13,
      7,
      5,
      15,
      14,
      1,
      9,
      12,
      5,
      1,
      15,
      14,
      13,
      4,
      10,
      0,
      7,
      6,
      3,
      9,
      2,
      8,
      11,
      13,
      11,
      7,
      14,
      12,
      1,
      3,
      9,
      5,
      0,
      15,
      4,
      8,
      6,
      2,
      10,
      6,
      15,
      14,
      9,
      11,
      3,
      0,
      8,
      12,
      2,
      13,
      7,
      1,
      4,
      10,
      5,
      10,
      2,
      8,
      4,
      7,
      6,
      1,
      5,
      15,
      11,
      9,
      14,
      3,
      12,
      13,
      0
    ]);
    var v = new Uint32Array(16);
    var m = new Uint32Array(16);
    function blake2sCompress(ctx, last) {
      let i = 0;
      for (i = 0; i < 8; i++) {
        v[i] = ctx.h[i];
        v[i + 8] = BLAKE2S_IV[i];
      }
      v[12] ^= ctx.t;
      v[13] ^= ctx.t / 4294967296;
      if (last) {
        v[14] = ~v[14];
      }
      for (i = 0; i < 16; i++) {
        m[i] = B2S_GET32(ctx.b, 4 * i);
      }
      for (i = 0; i < 10; i++) {
        B2S_G(0, 4, 8, 12, m[SIGMA[i * 16 + 0]], m[SIGMA[i * 16 + 1]]);
        B2S_G(1, 5, 9, 13, m[SIGMA[i * 16 + 2]], m[SIGMA[i * 16 + 3]]);
        B2S_G(2, 6, 10, 14, m[SIGMA[i * 16 + 4]], m[SIGMA[i * 16 + 5]]);
        B2S_G(3, 7, 11, 15, m[SIGMA[i * 16 + 6]], m[SIGMA[i * 16 + 7]]);
        B2S_G(0, 5, 10, 15, m[SIGMA[i * 16 + 8]], m[SIGMA[i * 16 + 9]]);
        B2S_G(1, 6, 11, 12, m[SIGMA[i * 16 + 10]], m[SIGMA[i * 16 + 11]]);
        B2S_G(2, 7, 8, 13, m[SIGMA[i * 16 + 12]], m[SIGMA[i * 16 + 13]]);
        B2S_G(3, 4, 9, 14, m[SIGMA[i * 16 + 14]], m[SIGMA[i * 16 + 15]]);
      }
      for (i = 0; i < 8; i++) {
        ctx.h[i] ^= v[i] ^ v[i + 8];
      }
    }
    function blake2sInit(outlen, key) {
      if (!(outlen > 0 && outlen <= 32)) {
        throw new Error("Incorrect output length, should be in [1, 32]");
      }
      const keylen = key ? key.length : 0;
      if (key && !(keylen > 0 && keylen <= 32)) {
        throw new Error("Incorrect key length, should be in [1, 32]");
      }
      const ctx = {
        h: new Uint32Array(BLAKE2S_IV),
        // hash state
        b: new Uint8Array(64),
        // input block
        c: 0,
        // pointer within block
        t: 0,
        // input count
        outlen
        // output length in bytes
      };
      ctx.h[0] ^= 16842752 ^ keylen << 8 ^ outlen;
      if (keylen > 0) {
        blake2sUpdate(ctx, key);
        ctx.c = 64;
      }
      return ctx;
    }
    function blake2sUpdate(ctx, input) {
      for (let i = 0; i < input.length; i++) {
        if (ctx.c === 64) {
          ctx.t += ctx.c;
          blake2sCompress(ctx, false);
          ctx.c = 0;
        }
        ctx.b[ctx.c++] = input[i];
      }
    }
    function blake2sFinal(ctx) {
      ctx.t += ctx.c;
      while (ctx.c < 64) {
        ctx.b[ctx.c++] = 0;
      }
      blake2sCompress(ctx, true);
      const out = new Uint8Array(ctx.outlen);
      for (let i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> 8 * (i & 3) & 255;
      }
      return out;
    }
    function blake2s(input, key, outlen) {
      outlen = outlen || 32;
      input = util.normalizeInput(input);
      const ctx = blake2sInit(outlen, key);
      blake2sUpdate(ctx, input);
      return blake2sFinal(ctx);
    }
    function blake2sHex2(input, key, outlen) {
      const output = blake2s(input, key, outlen);
      return util.toHex(output);
    }
    module.exports = {
      blake2s,
      blake2sHex: blake2sHex2,
      blake2sInit,
      blake2sUpdate,
      blake2sFinal
    };
  }
});

// ../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/index.js
var require_blakejs = __commonJS({
  "../../node_modules/.pnpm/blakejs@1.2.1/node_modules/blakejs/index.js"(exports, module) {
    var b2b = require_blake2b();
    var b2s = require_blake2s();
    module.exports = {
      blake2b: b2b.blake2b,
      blake2bHex: b2b.blake2bHex,
      blake2bInit: b2b.blake2bInit,
      blake2bUpdate: b2b.blake2bUpdate,
      blake2bFinal: b2b.blake2bFinal,
      blake2s: b2s.blake2s,
      blake2sHex: b2s.blake2sHex,
      blake2sInit: b2s.blake2sInit,
      blake2sUpdate: b2s.blake2sUpdate,
      blake2sFinal: b2s.blake2sFinal
    };
  }
});

// ../../node_modules/.pnpm/lodash.camelcase@4.3.0/node_modules/lodash.camelcase/index.js
var require_lodash = __commonJS({
  "../../node_modules/.pnpm/lodash.camelcase@4.3.0/node_modules/lodash.camelcase/index.js"(exports, module) {
    var INFINITY = 1 / 0;
    var symbolTag = "[object Symbol]";
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
    var rsComboSymbolsRange = "\\u20d0-\\u20f0";
    var rsDingbatRange = "\\u2700-\\u27bf";
    var rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
    var rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
    var rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
    var rsPunctuationRange = "\\u2000-\\u206f";
    var rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
    var rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['\u2019]";
    var rsAstral = "[" + rsAstralRange + "]";
    var rsBreak = "[" + rsBreakRange + "]";
    var rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]";
    var rsDigits = "\\d+";
    var rsDingbat = "[" + rsDingbatRange + "]";
    var rsLower = "[" + rsLowerRange + "]";
    var rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]";
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
    var rsNonAstral = "[^" + rsAstralRange + "]";
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsUpper = "[" + rsUpperRange + "]";
    var rsZWJ = "\\u200d";
    var rsLowerMisc = "(?:" + rsLower + "|" + rsMisc + ")";
    var rsUpperMisc = "(?:" + rsUpper + "|" + rsMisc + ")";
    var rsOptLowerContr = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?";
    var rsOptUpperContr = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?";
    var reOptMod = rsModifier + "?";
    var rsOptVar = "[" + rsVarRange + "]?";
    var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq;
    var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptLowerContr + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsUpperMisc + "+" + rsOptUpperContr + "(?=" + [rsBreak, rsUpper + rsLowerMisc, "$"].join("|") + ")",
      rsUpper + "?" + rsLowerMisc + "+" + rsOptLowerContr,
      rsUpper + "+" + rsOptUpperContr,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var deburredLetters = {
      // Latin-1 Supplement block.
      "\xC0": "A",
      "\xC1": "A",
      "\xC2": "A",
      "\xC3": "A",
      "\xC4": "A",
      "\xC5": "A",
      "\xE0": "a",
      "\xE1": "a",
      "\xE2": "a",
      "\xE3": "a",
      "\xE4": "a",
      "\xE5": "a",
      "\xC7": "C",
      "\xE7": "c",
      "\xD0": "D",
      "\xF0": "d",
      "\xC8": "E",
      "\xC9": "E",
      "\xCA": "E",
      "\xCB": "E",
      "\xE8": "e",
      "\xE9": "e",
      "\xEA": "e",
      "\xEB": "e",
      "\xCC": "I",
      "\xCD": "I",
      "\xCE": "I",
      "\xCF": "I",
      "\xEC": "i",
      "\xED": "i",
      "\xEE": "i",
      "\xEF": "i",
      "\xD1": "N",
      "\xF1": "n",
      "\xD2": "O",
      "\xD3": "O",
      "\xD4": "O",
      "\xD5": "O",
      "\xD6": "O",
      "\xD8": "O",
      "\xF2": "o",
      "\xF3": "o",
      "\xF4": "o",
      "\xF5": "o",
      "\xF6": "o",
      "\xF8": "o",
      "\xD9": "U",
      "\xDA": "U",
      "\xDB": "U",
      "\xDC": "U",
      "\xF9": "u",
      "\xFA": "u",
      "\xFB": "u",
      "\xFC": "u",
      "\xDD": "Y",
      "\xFD": "y",
      "\xFF": "y",
      "\xC6": "Ae",
      "\xE6": "ae",
      "\xDE": "Th",
      "\xFE": "th",
      "\xDF": "ss",
      // Latin Extended-A block.
      "\u0100": "A",
      "\u0102": "A",
      "\u0104": "A",
      "\u0101": "a",
      "\u0103": "a",
      "\u0105": "a",
      "\u0106": "C",
      "\u0108": "C",
      "\u010A": "C",
      "\u010C": "C",
      "\u0107": "c",
      "\u0109": "c",
      "\u010B": "c",
      "\u010D": "c",
      "\u010E": "D",
      "\u0110": "D",
      "\u010F": "d",
      "\u0111": "d",
      "\u0112": "E",
      "\u0114": "E",
      "\u0116": "E",
      "\u0118": "E",
      "\u011A": "E",
      "\u0113": "e",
      "\u0115": "e",
      "\u0117": "e",
      "\u0119": "e",
      "\u011B": "e",
      "\u011C": "G",
      "\u011E": "G",
      "\u0120": "G",
      "\u0122": "G",
      "\u011D": "g",
      "\u011F": "g",
      "\u0121": "g",
      "\u0123": "g",
      "\u0124": "H",
      "\u0126": "H",
      "\u0125": "h",
      "\u0127": "h",
      "\u0128": "I",
      "\u012A": "I",
      "\u012C": "I",
      "\u012E": "I",
      "\u0130": "I",
      "\u0129": "i",
      "\u012B": "i",
      "\u012D": "i",
      "\u012F": "i",
      "\u0131": "i",
      "\u0134": "J",
      "\u0135": "j",
      "\u0136": "K",
      "\u0137": "k",
      "\u0138": "k",
      "\u0139": "L",
      "\u013B": "L",
      "\u013D": "L",
      "\u013F": "L",
      "\u0141": "L",
      "\u013A": "l",
      "\u013C": "l",
      "\u013E": "l",
      "\u0140": "l",
      "\u0142": "l",
      "\u0143": "N",
      "\u0145": "N",
      "\u0147": "N",
      "\u014A": "N",
      "\u0144": "n",
      "\u0146": "n",
      "\u0148": "n",
      "\u014B": "n",
      "\u014C": "O",
      "\u014E": "O",
      "\u0150": "O",
      "\u014D": "o",
      "\u014F": "o",
      "\u0151": "o",
      "\u0154": "R",
      "\u0156": "R",
      "\u0158": "R",
      "\u0155": "r",
      "\u0157": "r",
      "\u0159": "r",
      "\u015A": "S",
      "\u015C": "S",
      "\u015E": "S",
      "\u0160": "S",
      "\u015B": "s",
      "\u015D": "s",
      "\u015F": "s",
      "\u0161": "s",
      "\u0162": "T",
      "\u0164": "T",
      "\u0166": "T",
      "\u0163": "t",
      "\u0165": "t",
      "\u0167": "t",
      "\u0168": "U",
      "\u016A": "U",
      "\u016C": "U",
      "\u016E": "U",
      "\u0170": "U",
      "\u0172": "U",
      "\u0169": "u",
      "\u016B": "u",
      "\u016D": "u",
      "\u016F": "u",
      "\u0171": "u",
      "\u0173": "u",
      "\u0174": "W",
      "\u0175": "w",
      "\u0176": "Y",
      "\u0177": "y",
      "\u0178": "Y",
      "\u0179": "Z",
      "\u017B": "Z",
      "\u017D": "Z",
      "\u017A": "z",
      "\u017C": "z",
      "\u017E": "z",
      "\u0132": "IJ",
      "\u0133": "ij",
      "\u0152": "Oe",
      "\u0153": "oe",
      "\u0149": "'n",
      "\u017F": "ss"
    };
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array ? array.length : 0;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    function asciiToArray(string) {
      return string.split("");
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? void 0 : object[key];
      };
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var Symbol2 = root.Symbol;
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function baseSlice(array, start, end) {
      var index = -1, length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : length + start;
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : end - start >>> 0;
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === void 0 ? length : end;
      return !start && end >= length ? array : baseSlice(array, start, end);
    }
    function createCaseFirst(methodName) {
      return function(string) {
        string = toString(string);
        var strSymbols = hasUnicode(string) ? stringToArray(string) : void 0;
        var chr = strSymbols ? strSymbols[0] : string.charAt(0);
        var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
        return chr[methodName]() + trailing;
      };
    }
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
      };
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toString(value) {
      return value == null ? "" : baseToString(value);
    }
    var camelCase2 = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? capitalize(word) : word);
    });
    function capitalize(string) {
      return upperFirst(toString(string).toLowerCase());
    }
    function deburr(string) {
      string = toString(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
    }
    var upperFirst = createCaseFirst("toUpperCase");
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? void 0 : pattern;
      if (pattern === void 0) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }
    module.exports = camelCase2;
  }
});

// ../../node_modules/.pnpm/reserved@0.1.2/node_modules/reserved/index.js
var require_reserved = __commonJS({
  "../../node_modules/.pnpm/reserved@0.1.2/node_modules/reserved/index.js"(exports, module) {
    exports.reserved = [
      "abstract",
      "arguments",
      "boolean",
      "break",
      "byte",
      "case",
      "catch",
      "char",
      "class",
      "const",
      "continue",
      "debugger",
      "default",
      "delete",
      "do",
      "double",
      "else",
      "enum",
      "eval",
      "export",
      "extends",
      "false",
      "final",
      "finally",
      "float",
      "for",
      "function",
      "goto",
      "if",
      "implements",
      "import",
      "in",
      "instanceof",
      "int",
      "interface",
      "let",
      "long",
      "native",
      "new",
      "null",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "short",
      "static",
      "super",
      "switch",
      "synchronized",
      "this",
      "throw",
      "throws",
      "transient",
      "true",
      "try",
      "typeof",
      "var",
      "void",
      "volatile",
      "while",
      "with",
      "yield"
    ];
    exports.builtins = [
      "Array",
      "Date",
      "eval",
      "function",
      "hasOwnProperty",
      "Infinity",
      "isFinite",
      "isNaN",
      "isPrototypeOf",
      "length",
      "Math",
      "name",
      "NaN",
      "Number",
      "Object",
      "prototype",
      "String",
      "toString",
      "undefined",
      "valueOf"
    ];
    module.exports = exports.reserved.concat(exports.builtins);
  }
});

// src/common/string.ts
function titleCase(input) {
  return input.replace(/^[a-z]/, function(m) {
    return m.toUpperCase();
  });
}
function camelCase(input) {
  return (0, import_lodash.default)(input);
}
function pascalCase(input) {
  return camelCase(input).replace(/^[a-z]/, function(m) {
    return m.toUpperCase();
  });
}
function escapeBacktick(input) {
  return input.replace(/[\`]/g, "\\$&");
}
function createIdentifier(input) {
  let identifier = input.trim();
  identifier = identifier.replace(/[^a-zA-Z0-9_$]/g, "_");
  if (/^[0-9]/.test(identifier) || import_reserved.default === identifier)
    identifier = "$" + identifier;
  if (!identifier)
    identifier = `$${Date.now()}`;
  return identifier;
}
function createIdentifierPascal(input) {
  return createIdentifier(pascalCase(input));
}
function createIdentifierCamel(input) {
  return createIdentifier(camelCase(input));
}
var import_lodash, import_reserved;
var init_string = __esm({
  "src/common/string.ts"() {
    import_lodash = __toESM(require_lodash());
    import_reserved = __toESM(require_reserved());
  }
});

// src/backend/parser/lib/assets.ts
async function getAssets(nodes) {
  var _a;
  const assetData = {};
  const assetMap = {};
  const rasters = {};
  const vectors = {};
  let hasRaster = false;
  let hasVector = false;
  try {
    try {
      for (var iter = __forAwait(nodes), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
        const id = temp.value;
        let embed;
        let count;
        let bytes;
        const node = figma.getNodeById(id);
        const isVector = VECTOR_NODE_TYPES.includes(node.type) || node.findAllWithCriteria && ((_a = node.findAllWithCriteria({ types: VECTOR_NODE_TYPES })) == null ? void 0 : _a.length) > 0;
        const identifier = isVector ? createIdentifierPascal(node.name) : createIdentifierCamel(node.name);
        if (isVector) {
          vectors[node.name] = 1 + (vectors[node.name] || 0);
          hasVector = true;
          count = vectors[node.name];
          bytes = await node.exportAsync({ format: "SVG" });
          embed = bytes ? `data:image/svg+xml;base64,${figma.base64Encode(bytes)}` : "data:image/svg+xml;base64,<svg/>";
        } else {
          rasters[node.name] = 1 + (rasters[node.name] || 0);
          hasRaster = true;
          count = rasters[node.name];
          bytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 2 } });
          embed = bytes ? `data:image/png;base64,${figma.base64Encode(bytes)}` : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
        }
        const name = count > 1 ? `${identifier}${count}` : identifier;
        const data = bytes || embed;
        const hash = bytes ? (0, import_blakejs.blake2sHex)(data) : "";
        const { width, height } = node;
        assetData[id] = { width, height, name, hash, embed, bytes, isVector };
        assetMap[id] = hash;
      }
    } catch (temp) {
      error = [temp];
    } finally {
      try {
        more && (temp = iter.return) && await temp.call(iter);
      } finally {
        if (error)
          throw error[0];
      }
    }
  } catch (err) {
    console.error("[assets] Failed to convert", err);
  }
  return {
    assetData,
    assetMap,
    hasRaster,
    hasVector
  };
}
var import_blakejs, VECTOR_NODE_TYPES;
var init_assets = __esm({
  "src/backend/parser/lib/assets.ts"() {
    import_blakejs = __toESM(require_blakejs());
    init_string();
    VECTOR_NODE_TYPES = ["VECTOR", "LINE", "POLYGON", "STAR"];
  }
});

// ../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/utils.js
var isDate, isEmpty, isObject, hasOwnProperty, isEmptyObject, makeObjectWithoutPrototype;
var init_utils = __esm({
  "../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/utils.js"() {
    isDate = (d) => d instanceof Date;
    isEmpty = (o) => Object.keys(o).length === 0;
    isObject = (o) => o != null && typeof o === "object";
    hasOwnProperty = (o, ...args) => Object.prototype.hasOwnProperty.call(o, ...args);
    isEmptyObject = (o) => isObject(o) && isEmpty(o);
    makeObjectWithoutPrototype = () => /* @__PURE__ */ Object.create(null);
  }
});

// ../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/diff.js
var diff, diff_default;
var init_diff = __esm({
  "../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/diff.js"() {
    init_utils();
    diff = (lhs, rhs) => {
      if (lhs === rhs)
        return {};
      if (!isObject(lhs) || !isObject(rhs))
        return rhs;
      const deletedValues = Object.keys(lhs).reduce((acc, key) => {
        if (!hasOwnProperty(rhs, key)) {
          acc[key] = void 0;
        }
        return acc;
      }, makeObjectWithoutPrototype());
      if (isDate(lhs) || isDate(rhs)) {
        if (lhs.valueOf() == rhs.valueOf())
          return {};
        return rhs;
      }
      return Object.keys(rhs).reduce((acc, key) => {
        if (!hasOwnProperty(lhs, key)) {
          acc[key] = rhs[key];
          return acc;
        }
        const difference = diff(lhs[key], rhs[key]);
        if (isEmptyObject(difference) && !isDate(difference) && (isEmptyObject(lhs[key]) || !isEmptyObject(rhs[key])))
          return acc;
        acc[key] = difference;
        return acc;
      }, deletedValues);
    };
    diff_default = diff;
  }
});

// ../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/added.js
var init_added = __esm({
  "../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/added.js"() {
    init_utils();
  }
});

// ../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/deleted.js
var init_deleted = __esm({
  "../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/deleted.js"() {
    init_utils();
  }
});

// ../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/updated.js
var init_updated = __esm({
  "../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/updated.js"() {
    init_utils();
  }
});

// ../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/detailed.js
var init_detailed = __esm({
  "../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/detailed.js"() {
    init_added();
    init_deleted();
    init_updated();
  }
});

// ../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/index.js
var init_mjs = __esm({
  "../../node_modules/.pnpm/deep-object-diff@1.1.9/node_modules/deep-object-diff/mjs/index.js"() {
    init_diff();
    init_added();
    init_deleted();
    init_updated();
    init_detailed();
  }
});

// src/backend/parser/lib/styles.ts
async function getStyleSheet(nodes, variants) {
  var _a;
  let css = {};
  try {
    for (var iter = __forAwait(nodes), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
      const id = temp.value;
      const node = figma.getNodeById(id);
      css[id] = await node.getCSSAsync();
    }
  } catch (temp) {
    error = [temp];
  } finally {
    try {
      more && (temp = iter.return) && await temp.call(iter);
    } finally {
      if (error)
        throw error[0];
    }
  }
  if (variants == null ? void 0 : variants.mapping) {
    try {
      for (var iter3 = __forAwait(Object.keys(variants.mapping)), more3, temp3, error3; more3 = !(temp3 = await iter3.next()).done; more3 = false) {
        const id = temp3.value;
        try {
          for (var iter2 = __forAwait(Object.entries(variants.mapping[id])), more2, temp2, error2; more2 = !(temp2 = await iter2.next()).done; more2 = false) {
            const [bid, vid] = temp2.value;
            const vnode = figma.getNodeById(vid);
            const vcss = await vnode.getCSSAsync();
            const diff2 = diffStyles(css[bid], vcss);
            for (const k in diff2) {
              if (diff2[k] === void 0) {
                diff2[k] = "unset";
              }
            }
            if (diff2 && Object.keys(diff2).length > 0) {
              css[vid] = diff2;
            }
          }
        } catch (temp2) {
          error2 = [temp2];
        } finally {
          try {
            more2 && (temp2 = iter2.return) && await temp2.call(iter2);
          } finally {
            if (error2)
              throw error2[0];
          }
        }
      }
    } catch (temp3) {
      error3 = [temp3];
    } finally {
      try {
        more3 && (temp3 = iter3.return) && await temp3.call(iter3);
      } finally {
        if (error3)
          throw error3[0];
      }
    }
  }
  const output = await convertStyles(css);
  const stylesheet = {};
  for (const key in output) {
    const style = (_a = output[key]) == null ? void 0 : _a.style;
    if (style) {
      const id = key.slice(1).replace(/\-/g, ":");
      const props2 = {};
      for (const k in style) {
        if (k === "display" && style[k] === "flex") {
          if (!style["flexDirection"]) {
            props2["flexDirection"] = "row";
          }
        } else {
          props2[k] = style[k];
        }
      }
      stylesheet[id] = props2;
    }
  }
  return stylesheet;
}
async function convertStyles(css) {
  if (_remoteStyleGenOnly || figma.mode === "codegen") {
    return await convertStylesRemote(css);
  } else {
    try {
      return await convertStylesLocal(css);
    } catch (e) {
      console.warn("Failed to use local stylegen, falling back to remote");
      _remoteStyleGenOnly = true;
      return await convertStylesRemote(css);
    }
  }
}
async function convertStylesLocal(css) {
  return new Promise((resolve, reject) => {
    try {
      const timeout = setTimeout(() => {
        _remoteStyleGenOnly = true;
        reject(new Error("STYLE_GEN_TIMEOUT"));
      }, 5e3);
      once("STYLE_GEN_RES", async (stylesheet) => {
        clearTimeout(timeout);
        resolve(stylesheet.declarations);
      });
      emit("STYLE_GEN_REQ", css);
    } catch (e) {
      reject(e);
    }
  });
}
async function convertStylesRemote(css) {
  const response = await fetch(F2RN_STYLEGEN_API, {
    body: JSON.stringify(css),
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
  return await response.json();
}
function diffStyles(a, b) {
  return diff_default(a, b);
}
var _remoteStyleGenOnly;
var init_styles = __esm({
  "src/backend/parser/lib/styles.ts"() {
    init_lib();
    init_mjs();
    init_env();
    _remoteStyleGenOnly = false;
  }
});

// src/backend/parser/lib/colors.ts
function getColorSheet(nodes, variants) {
  const colors = {};
  for (const id of nodes) {
    const node = figma.getNodeById(id);
    if (node.isAsset && node.findAllWithCriteria) {
      const vector = node.findAllWithCriteria({ types: ["VECTOR"] })[0];
      if ((vector == null ? void 0 : vector.type) === "VECTOR") {
        colors[id] = getFillToken(vector);
      }
    }
  }
  if (variants == null ? void 0 : variants.mapping) {
    for (const id of Object.keys(variants.mapping)) {
      for (const [baseId, variantId] of Object.entries(variants.mapping[id])) {
        const vnode = figma.getNodeById(variantId);
        if (vnode.isAsset && vnode.findAllWithCriteria) {
          const vector = vnode.findAllWithCriteria({ types: ["VECTOR"] })[0];
          if ((vector == null ? void 0 : vector.type) === "VECTOR") {
            const token = getFillToken(vector);
            const isModified = colors[baseId] !== token;
            if (isModified) {
              colors[variantId] = token;
            }
          }
        }
      }
    }
  }
  return colors;
}
function getColor(color, opacity, skipHex) {
  if (!color)
    return;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity > 0 && opacity < 1 ? `, ${opacity}` : "";
  if (skipHex) {
    return `rgb${a ? "a" : ""}(${r}, ${g}, ${b}${a})`;
  } else {
    return toHex(r, g, b, opacity);
  }
}
function getTopFill(fills) {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    return [...fills].reverse().find((fill) => fill.type === "SOLID" && fill.visible !== false);
  }
}
function getFillToken(node) {
  var _a, _b;
  const placeholder = '"#000000"';
  if (!node)
    return placeholder;
  const fill = getTopFill(node.fills);
  if (!fill)
    return placeholder;
  const fillId = (_b = (_a = fill == null ? void 0 : fill.boundVariables) == null ? void 0 : _a.color) == null ? void 0 : _b.id;
  const fillVar = fillId && figma.variables.getVariableById(fillId);
  return fillVar && fillVar.resolvedType === "COLOR" ? `theme.colors.${createIdentifierCamel(fillVar.name)}` : `"${getColor(fill.color, fill.opacity)}"`;
}
function toHex(r, g, b, a) {
  const hexValue = (r << 16 | g << 8 | b).toString(16).padStart(6, "0");
  if (a !== void 0 && a !== 1) {
    const alphaValue = Math.round(a * 255).toString(16).padStart(2, "0");
    return `#${hexValue}${alphaValue}`;
  }
  return `#${hexValue}`;
}
var init_colors = __esm({
  "src/backend/parser/lib/colors.ts"() {
    init_string();
  }
});

// src/backend/parser/lib/props.ts
function getPropName(value) {
  if (!value)
    return "";
  return createIdentifierCamel(value.split("#").shift());
}
function getPropsJSX(props2, colorsheet, nodeRef) {
  if (!props2)
    return "";
  const attrs = Object.entries(props2);
  if (attrs.length === 0)
    return "";
  return " " + Object.entries(props2).sort(sortProps).map((p) => propValueToJSX(p, props2, colorsheet, nodeRef)).filter(Boolean).join(" ");
}
function propValueToJSX([key, prop], allProps, colorsheet, nodeRef) {
  var _a, _b;
  const { type, value, defaultValue } = prop;
  const k = getPropName(key);
  const v = value || defaultValue;
  if (type === "BOOLEAN") {
    return v ? k : false;
  } else if (type === "TEXT") {
    return `${k}={\`${escapeBacktick(v)}\`}`;
  } else if (type === "VARIANT") {
    return `${k}="${createIdentifier(v)}"`;
  } else if (type === "INSTANCE_SWAP") {
    const id = defaultValue || value;
    const node = figma.getNodeById(id);
    const props2 = node.variantProperties;
    const propsRef = node.instances[0].componentPropertyReferences;
    const isVariant = !!props2;
    const masterNode = isVariant ? node == null ? void 0 : node.parent : node;
    const isIconNode = isNodeIcon(masterNode);
    if (typeof allProps[propsRef.visible] !== "undefined") {
      if (((_a = allProps[propsRef.visible]) == null ? void 0 : _a.value) === false)
        return "";
    }
    let variantNode;
    if (isVariant) {
      if (nodeRef[masterNode.id]) {
        variantNode = nodeRef[masterNode.id][1];
      }
    }
    const propsInstance = !!variantNode ? getPropsJSX(variantNode.componentProperties, colorsheet, nodeRef) : node.type === "COMPONENT" ? isVariant ? getPropsJSX((_b = node == null ? void 0 : node.parent) == null ? void 0 : _b.componentPropertyDefinitions, colorsheet, nodeRef) : getPropsJSX(node == null ? void 0 : node.componentPropertyDefinitions, colorsheet, nodeRef) : "";
    const tagName = !isIconNode ? createIdentifierPascal(masterNode == null ? void 0 : masterNode.name) : "Icon";
    const propsIcon = isIconNode ? ` icon="${masterNode.name}"` : " ";
    const propTestID = !isIconNode ? ` testID="${variantNode ? variantNode.id : masterNode.id}"` : "";
    const tag = tagName ? `<${tagName}${propsIcon}${propsInstance}${propTestID}/>` : "<View/>";
    return `${k}={${tag}}`;
  }
}
function sortProps(a, b) {
  if (a[1].type === "BOOLEAN" && b[1].type !== "BOOLEAN") {
    return -1;
  } else {
    return a[0].localeCompare(b[0]);
  }
}
function sortPropsDef(a, b) {
  const isCondA = a[1].type === "BOOLEAN" || a[1].type === "INSTANCE_SWAP";
  const isCondB = b[1].type === "BOOLEAN" || b[1].type === "INSTANCE_SWAP";
  if (isCondA !== isCondB)
    return isCondA ? 1 : -1;
  if (a[1].type !== b[1].type)
    return a[1].type.localeCompare(b[1].type);
  return a[0].localeCompare(b[0]);
}
var init_props = __esm({
  "src/backend/parser/lib/props.ts"() {
    init_lib2();
    init_string();
  }
});

// src/backend/parser/lib/traverse.ts
function getSelectedComponent() {
  const { selection } = figma.currentPage;
  if (selection.length === 0)
    return null;
  const components = Array.from(getComponentTargets(selection));
  return components.length > 0 ? components[0] : null;
}
function getComponentTargets(nodes) {
  var _a;
  const components = /* @__PURE__ */ new Set();
  for (const node of nodes) {
    const component = getComponentTarget(node);
    if (component && ((_a = getPage(component)) == null ? void 0 : _a.name) !== "Icons") {
      components.add(component);
    }
  }
  return components;
}
function getComponentTarget(node) {
  var _a, _b;
  let target = node;
  if (!target)
    return null;
  if (target.type === "FRAME" && ((_a = target.children) == null ? void 0 : _a.length) > 0 && ((_b = target.children[0]) == null ? void 0 : _b.type) === "COMPONENT") {
    return target.children[0];
  }
  while (target.type !== "COMPONENT_SET" && target.type !== "COMPONENT" && target.type !== "INSTANCE" && target.parent && target.parent.type !== "PAGE") {
    target = target.parent;
  }
  const parentComponent = getComponentParent(node);
  if (parentComponent)
    return parentComponent;
  if (target.type === "COMPONENT_SET")
    return target.defaultVariant;
  if (target.type === "INSTANCE")
    return target.mainComponent;
  if (target.type === "COMPONENT")
    return (target == null ? void 0 : target.parent.type) === "COMPONENT_SET" ? target.parent.defaultVariant : target;
  return null;
}
function getComponentParent(node) {
  let target = node;
  if (!target)
    return null;
  while (target.type !== "COMPONENT_SET" && target.type !== "COMPONENT" && target.parent && target.parent.type !== "PAGE") {
    target = target.parent;
  }
  if (target.type === "COMPONENT_SET")
    return target.defaultVariant;
  if (target.type === "COMPONENT")
    return (target == null ? void 0 : target.parent.type) === "COMPONENT_SET" ? target.parent.defaultVariant : target;
  return null;
}
function getCollectionModes(collectionName) {
  var _a, _b;
  const theme = getCollectionByName(collectionName);
  if (!theme)
    return null;
  const component = (_a = figma.currentPage.findAllWithCriteria({ types: ["COMPONENT"] })) == null ? void 0 : _a.pop();
  const current = (_b = component == null ? void 0 : component.resolvedVariableModes) == null ? void 0 : _b[theme.id];
  return {
    current: theme.modes.find((m) => m.modeId === current),
    default: theme.modes.find((m) => m.modeId === theme.defaultModeId),
    modes: theme.modes
  };
}
function getCollectionByName(collectionName) {
  const collections = figma.variables.getLocalVariableCollections();
  const collection = collections == null ? void 0 : collections.find((c) => c.name === collectionName);
  return collection;
}
function getPage(node) {
  if (!node)
    return null;
  while (node.type !== "PAGE") {
    node = node.parent;
    if (!node)
      return null;
  }
  return node;
}
var init_traverse = __esm({
  "src/backend/parser/lib/traverse.ts"() {
  }
});

// src/backend/parser/lib/node.ts
function focusNode(id) {
  try {
    const node = figma.getNodeById(id);
    if (node) {
      const page = getPage(node);
      if (page && figma.currentPage !== page) {
        figma.currentPage = page;
      }
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  } catch (e) {
  }
}
function isNodeVisible(node) {
  const isVariant = !!node.variantProperties;
  const masterNode = isVariant ? node == null ? void 0 : node.parent : node;
  const propRefs = masterNode == null ? void 0 : masterNode.componentPropertyReferences;
  return node.visible || (propRefs == null ? void 0 : propRefs.visible);
}
function isNodeIcon(node) {
  var _a;
  return node.name.includes(":") && ((_a = getPage(node)) == null ? void 0 : _a.name) === "Icons";
}
function getInstanceInfo(node) {
  var _a;
  const isInstance = node.type === "INSTANCE";
  const isVariant = !!node.variantProperties;
  const main = isVariant ? node.mainComponent.parent : node.mainComponent;
  const props2 = node.componentProperties;
  const propId = (_a = node.componentPropertyReferences) == null ? void 0 : _a.mainComponent;
  const propName = propId ? getPropName(propId) : null;
  return { node, main, props: props2, propName, isInstance };
}
function getCustomReaction(node) {
  var _a, _b;
  return (_b = (_a = node.reactions) == null ? void 0 : _a.filter((r) => {
    var _a2, _b2;
    return ((_a2 = r.trigger) == null ? void 0 : _a2.type) === "ON_CLICK" && ((_b2 = r.action) == null ? void 0 : _b2.type) === "URL";
  })[0]) == null ? void 0 : _b.action;
}
var init_node = __esm({
  "src/backend/parser/lib/node.ts"() {
    init_props();
    init_traverse();
  }
});

// src/backend/parser/lib/index.ts
var init_lib2 = __esm({
  "src/backend/parser/lib/index.ts"() {
    init_validate();
    init_assets();
    init_styles();
    init_colors();
    init_node();
    init_props();
    init_traverse();
  }
});

// src/common/delay.ts
function wait(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
var init_delay = __esm({
  "src/common/delay.ts"() {
  }
});

// src/backend/icons.ts
async function importIcons(setName, icons) {
  var _a;
  const columns = 15;
  let page = figma.root.children.find((p) => p.name === "Icons");
  if (!page) {
    page = figma.createPage();
    page.name = "Icons";
    figma.root.appendChild(page);
  } else {
    page.children.forEach((c) => c.remove());
  }
  const theme = getThemeTokens();
  if (!theme.background || !theme.foreground) {
    return;
  }
  const frame = figma.createFrame();
  frame.name = `${setName}, Normal, ${svgSize}`;
  frame.cornerRadius = 3;
  frame.itemSpacing = 5;
  frame.counterAxisSpacing = 5;
  frame.verticalPadding = 10;
  frame.horizontalPadding = 10;
  frame.layoutMode = "HORIZONTAL";
  frame.layoutWrap = "WRAP";
  frame.layoutPositioning = "AUTO";
  frame.layoutSizingVertical = "HUG";
  frame.layoutSizingHorizontal = "FIXED";
  frame.resize(
    columns * svgSize + (columns - 1) * frame.itemSpacing + frame.horizontalPadding * 2,
    100
  );
  if (theme.isVariable) {
    const fills = frame.fills !== figma.mixed ? __spreadValues({}, frame.fills) : {};
    fills[0] = figma.variables.setBoundVariableForPaint(fills[0], "color", theme.background);
    frame.fills = [fills[0]];
  } else {
    frame.fillStyleId = (_a = theme.background) == null ? void 0 : _a.id;
  }
  page.appendChild(frame);
  figma.notify(`Importing ${titleCase(setName)} Icons...`, {
    timeout: 3e3,
    button: {
      text: "View",
      action: () => focusNode(frame.id)
    }
  });
  let iconStyle;
  let iconVariable;
  if (theme.isVariable) {
    iconVariable = theme.foreground;
  } else if (theme.isVariable === false) {
    iconStyle = theme.foreground;
  }
  await createIcons(frame, icons, iconStyle, iconVariable);
}
async function createIcons(root, icons, style, variable) {
  const batch = 5;
  const delay = 5;
  let i = 0;
  try {
    for (var iter = __forAwait(Object.entries(icons)), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
      const [name, svg] = temp.value;
      if (i++ % batch === 0)
        await wait(delay);
      const component = figma.createComponent();
      component.name = name;
      component.layoutMode = "VERTICAL";
      component.layoutPositioning = "AUTO";
      component.primaryAxisAlignItems = "CENTER";
      component.counterAxisAlignItems = "CENTER";
      component.layoutSizingVertical = "FIXED";
      component.layoutSizingHorizontal = "FIXED";
      component.resize(svgSize, svgSize);
      const frame = figma.createNodeFromSvg(`<svg ${svgProps}>${svg}</svg>`);
      frame.name = "Frame";
      frame.findAllWithCriteria({ types: ["VECTOR"] }).forEach((c) => {
        if (style) {
          c.fillStyleId = style == null ? void 0 : style.id;
        } else if (variable) {
          const fills = c.fills !== figma.mixed ? __spreadValues({}, c.fills) : {};
          fills[0] = figma.variables.setBoundVariableForPaint(fills[0], "color", variable);
          c.fills = [fills[0]];
        }
      });
      component.appendChild(frame);
      figma.ungroup(frame);
      root.appendChild(component);
    }
  } catch (temp) {
    error = [temp];
  } finally {
    try {
      more && (temp = iter.return) && await temp.call(iter);
    } finally {
      if (error)
        throw error[0];
    }
  }
}
function getThemeTokens() {
  try {
    return getVariables();
  } catch (e) {
    return getLocalStyles();
  }
}
function getLocalStyles() {
  const styles = figma.getLocalPaintStyles();
  const background = styles.find((s) => s.name === "background");
  const foreground = styles.find((s) => s.name === "foreground");
  return { background, foreground, isVariable: false };
}
function getVariables() {
  var _a;
  let background;
  let foreground;
  const theme = (_a = figma.variables.getLocalVariableCollections()) == null ? void 0 : _a.find((c) => c.name === "Theme");
  if (theme) {
    const variables = theme.variableIds.map((id) => figma.variables.getVariableById(id));
    for (const variable of variables) {
      if (variable.name === "background")
        background = variable;
      if (variable.name === "foreground")
        foreground = variable;
      if (background && foreground)
        break;
    }
  }
  return { background, foreground, isVariable: true };
}
function getAllIconComponents() {
  var _a, _b;
  const iconPage = (_b = (_a = figma.root) == null ? void 0 : _a.children) == null ? void 0 : _b.find((p) => p.name === "Icons");
  const components = iconPage == null ? void 0 : iconPage.findAllWithCriteria({ types: ["COMPONENT"] });
  const icons = components == null ? void 0 : components.filter((c) => c.name.includes(":"));
  return icons;
}
function getIconComponentMap() {
  const map = {};
  getAllIconComponents().forEach((icon) => {
    map[icon.name] = icon.id;
  });
  return map;
}
var svgSize, svgProps;
var init_icons = __esm({
  "src/backend/icons.ts"() {
    init_delay();
    init_string();
    init_lib2();
    svgSize = 16;
    svgProps = `xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" width="${svgSize}" height="${svgSize}" viewBox="0 0 256 256"`;
  }
});

// src/common/assert.ts
function areMapsEqual(map1, map2) {
  if (map1.size !== map2.size) {
    return false;
  }
  for (const [key, value] of map1) {
    if (!map2.has(key)) {
      return false;
    }
    if (map2.get(key) !== value) {
      return false;
    }
  }
  return true;
}
function areSetsEqual(set1, set2) {
  if (set1.size !== set2.size) {
    return false;
  }
  for (const element of set1) {
    if (!set2.has(element)) {
      return false;
    }
  }
  return true;
}
var init_assert = __esm({
  "src/common/assert.ts"() {
  }
});

// src/config/user.ts
var user, user_default;
var init_user = __esm({
  "src/config/user.ts"() {
    user = {
      react: {
        flavor: "react-native",
        addTranslate: false
      },
      writer: {
        indentNumberOfSpaces: 2,
        useSingleQuote: true,
        useTabs: false,
        newLine: "\n"
      },
      monaco: {
        general: {
          lineNumbers: "off",
          minimap: { enabled: false },
          padding: { top: 10 }
        }
      },
      esbuild: {
        format: "esm"
      }
    };
    user_default = user;
  }
});

// src/backend/config.ts
async function load(isHeadless) {
  const config2 = await figma.clientStorage.getAsync(F2RN_CONFIG_NS);
  if (config2) {
    update(config2, true);
    if (!isHeadless) {
      emit("CONFIG_LOAD", config2);
    }
  }
}
function update(value, skipSave) {
  state = value;
  if (!skipSave) {
    figma.clientStorage.setAsync(F2RN_CONFIG_NS, value);
  }
}
var state;
var init_config = __esm({
  "src/backend/config.ts"() {
    init_lib();
    init_env();
    init_user();
    state = user_default;
  }
});

// src/backend/parser/index.ts
async function parser_default(component) {
  try {
    validate(component);
  } catch (e) {
    figma.notify(e.message, { error: true, timeout: 5e3 });
    return null;
  }
  const data = crawl(component);
  const [stylesheet, colorsheet, { assetData, assetMap }] = await Promise.all([
    getStyleSheet(data.meta.styleNodes, data.variants),
    getColorSheet(data.meta.assetNodes, data.variants),
    getAssets(data.meta.assetNodes)
  ]);
  return __spreadProps(__spreadValues({}, data), { stylesheet, colorsheet, assetData, assetMap });
}
function crawl(node) {
  const { dict, tree, meta } = crawlChildren(node.children);
  const root = getRoot(node);
  const frame = getFrame(node);
  const children = getChildren(dict);
  const variants = getVariants(node, children);
  root && meta.styleNodes.add(root.node.id);
  frame && meta.styleNodes.add(frame.node.id);
  return {
    tree,
    meta,
    root,
    frame,
    children,
    variants
  };
}
function crawlChildren(nodes, dict, tree, meta) {
  dict = dict || /* @__PURE__ */ new Set();
  tree = tree || [];
  meta = meta || {
    assetNodes: /* @__PURE__ */ new Set(),
    styleNodes: /* @__PURE__ */ new Set(),
    iconsUsed: /* @__PURE__ */ new Set(),
    components: {},
    includes: {}
  };
  for (const node of nodes) {
    if (!isNodeVisible(node))
      continue;
    const isInstance = node.type === "INSTANCE";
    const isAsset = node.isAsset && !isInstance || node.type === "VECTOR";
    if (isAsset) {
      meta.assetNodes.add(node.id);
      dict.add(node);
      tree.push({ node });
      continue;
    }
    if (NODES_WITH_STYLES.includes(node.type) && !node.isAsset) {
      meta.styleNodes.add(node.id);
    }
    switch (node.type) {
      case "FRAME":
      case "COMPONENT":
        const sub = crawlChildren(node.children, dict, [], meta);
        meta.components = __spreadValues(__spreadValues({}, meta.components), sub.meta.components);
        meta.iconsUsed = /* @__PURE__ */ new Set([...meta.iconsUsed, ...sub.meta.iconsUsed]);
        meta.assetNodes = /* @__PURE__ */ new Set([...meta.assetNodes, ...sub.meta.assetNodes]);
        meta.includes = __spreadValues(__spreadValues({}, meta.includes), sub.meta.includes);
        dict = /* @__PURE__ */ new Set([...dict, node, ...sub.dict]);
        tree.push({ node, children: sub.tree });
        break;
      case "INSTANCE":
        const info = getInstanceInfo(node);
        if (info.propName) {
          meta.includes[info.main.id] = [info.main, node];
        } else {
          if (!isNodeIcon(info.main)) {
            meta.components[info.main.id] = [info.main, node];
          }
          Object.keys(info.props).forEach((key) => {
            var _a, _b, _c;
            const { type, value } = info.props[key];
            if (type === "INSTANCE_SWAP" && typeof value === "string") {
              const swapComponent = figma.getNodeById(value);
              const swapPropsRef = (_b = (_a = swapComponent == null ? void 0 : swapComponent.instances) == null ? void 0 : _a[0]) == null ? void 0 : _b.componentPropertyReferences;
              let swapInvisible = false;
              if (typeof node.componentProperties[swapPropsRef.visible] !== "undefined") {
                if (((_c = node.componentProperties[swapPropsRef.visible]) == null ? void 0 : _c.value) === false)
                  swapInvisible = true;
              }
              if (isNodeIcon(swapComponent)) {
                meta.iconsUsed.add(swapComponent.name);
              } else if (!swapInvisible) {
                meta.components[swapComponent.id] = [swapComponent, node];
              }
            }
          });
        }
        dict.add(node);
        tree.push({ node });
        break;
      case "TEXT":
        dict.add(node);
        tree.push({ node });
        break;
      case "RECTANGLE":
        dict.add(node);
        tree.push({ node });
    }
  }
  return { dict, tree, meta };
}
function getRoot(node) {
  return { node, slug: "root", click: getCustomReaction(node) };
}
function getFrame(node) {
  if (node.parent.type !== "FRAME")
    return null;
  return { node: node.parent, slug: "frame" };
}
function getChildren(nodes) {
  const children = [];
  for (const node of nodes) {
    const id = createIdentifierCamel(node.name);
    const ref = children.filter((c) => id === createIdentifierCamel(c.node.name)).length;
    const slug = ref > 0 ? `${id}${ref + 1}` : id;
    children.push({ node, slug });
  }
  return children;
}
function getVariants(root, rootChildren) {
  var _a;
  const variants = {
    mapping: {},
    classes: {},
    fills: {}
  };
  if (!root || !root.variantProperties)
    return null;
  const compSet = root.parent;
  const compVars = compSet.children.filter(
    (n) => n !== compSet.defaultVariant
  );
  for (const variant of compVars) {
    variants.mapping[variant.id] = {};
    variants.mapping[variant.id][root.id] = variant.id;
    if (!variants.classes.root)
      variants.classes.root = {};
    variants.classes.root[variant.name] = variant.id;
    if (variant.children) {
      const nodes = crawlChildren(variant.children);
      const children = getChildren(nodes.dict);
      for (const child of children) {
        if (!child || !child.node)
          continue;
        const childId = createIdentifierCamel(child == null ? void 0 : child.node.name);
        const baseNode = rootChildren.find(
          (c) => createIdentifierCamel(c == null ? void 0 : c.node.name) === childId && (c == null ? void 0 : c.node.type) === (child == null ? void 0 : child.node.type)
        );
        variants.mapping[variant.id][baseNode == null ? void 0 : baseNode.node.id] = child == null ? void 0 : child.node.id;
        if ((_a = child == null ? void 0 : child.node) == null ? void 0 : _a.isAsset) {
          if (!variants.fills[childId])
            variants.fills[childId] = {};
          variants.fills[childId][variant.name] = child == null ? void 0 : child.node.id;
        }
        if (NODES_WITH_STYLES.includes(child == null ? void 0 : child.node.type)) {
          if (!variants.classes[childId])
            variants.classes[childId] = {};
          variants.classes[childId][variant.name] = child == null ? void 0 : child.node.id;
        }
      }
    }
  }
  return variants;
}
var NODES_WITH_STYLES;
var init_parser = __esm({
  "src/backend/parser/index.ts"() {
    init_lib2();
    init_lib2();
    init_string();
    NODES_WITH_STYLES = ["TEXT", "FRAME", "SECTION", "COMPONENT", "RECTANGLE", "ELLIPSE"];
  }
});

// src/backend/generator/lib/primitives/exo/Slider.ts
function Slider(component) {
  const nodeRange = component.findOne((c) => c.name === "Range" && c.type === "RECTANGLE");
  const nodeTrack = component.findOne((c) => c.name === "Track" && c.type === "RECTANGLE");
  const nodeThumb = component.findOne((c) => c.name === "Thumb" && c.type === "ELLIPSE");
  return template({
    fillRange: getFillToken(nodeRange),
    fillTrack: getFillToken(nodeTrack),
    fillThumb: getFillToken(nodeThumb),
    importStyles: `import {useStyles} from 'react-native-unistyles';
`
  }).slice(1);
}
var props, template;
var init_Slider = __esm({
  "src/backend/generator/lib/primitives/exo/Slider.ts"() {
    init_lib2();
    props = [
      ["onChange", "(min: number, max?: number) => void"],
      ["name?", "string"],
      ["value?", "number"],
      ["step?", "number"],
      ["minimumValue?", "number"],
      ["maximumValue?", "number"],
      ["trackColor?", "string"],
      ["rangeColor?", "string"],
      ["thumbColor?", "string"],
      ["testID?", "string"]
    ];
    template = (_) => `
import {Slider as SliderBase} from 'react-exo';
${_.importStyles}
export interface SliderProps {
  ${props.map((p) => p.join(": ")).join(",\n  ")}
}

export function Slider(props: SliderProps) {
  const {theme} = useStyles();
  return (
    <SliderBase
      rangeColor={props.rangeColor || ${_.fillRange}}
      trackColor={props.trackColor || ${_.fillTrack}}
      thumbColor={props.thumbColor || ${_.fillThumb}}
      {...props}
    />
  );
}
`;
  }
});

// src/backend/generator/lib/primitives/index.ts
function generatePrimitives() {
  const page = figma.root.children.find((p) => p.name === "Primitives");
  if (!page)
    return;
  const nodes = page.findAllWithCriteria({ types: ["COMPONENT"] });
  const primitives = {};
  for (const component of getComponentTargets(nodes)) {
    switch (component.name) {
      case "Switch":
        break;
      case "Radio":
        break;
      case "Checkbox":
        break;
      case "Progress":
        break;
      case "Slider":
        primitives.Slider = Slider(component);
        break;
    }
  }
  return primitives;
}
var init_primitives = __esm({
  "src/backend/generator/lib/primitives/index.ts"() {
    init_lib2();
    init_Slider();
  }
});

// ../../node_modules/.pnpm/code-block-writer@12.0.0/node_modules/code-block-writer/esm/utils/string_utils.js
function escapeForWithinString(str, quoteKind) {
  return escapeChar(str, quoteKind).replace(newlineRegex, "\\$1");
}
function escapeChar(str, char) {
  if (char.length !== 1) {
    throw new Error(`Specified char must be one character long.`);
  }
  let result = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === char) {
      result += "\\";
    }
    result += str[i];
  }
  return result;
}
function getStringFromStrOrFunc(strOrFunc) {
  return strOrFunc instanceof Function ? strOrFunc() : strOrFunc;
}
var newlineRegex;
var init_string_utils = __esm({
  "../../node_modules/.pnpm/code-block-writer@12.0.0/node_modules/code-block-writer/esm/utils/string_utils.js"() {
    newlineRegex = /(\r?\n)/g;
  }
});

// ../../node_modules/.pnpm/code-block-writer@12.0.0/node_modules/code-block-writer/esm/mod.js
function isRegExStart(currentChar, pastChar, pastPastChar) {
  return pastChar === CHARS.FORWARD_SLASH && currentChar !== CHARS.FORWARD_SLASH && currentChar !== CHARS.ASTERISK && pastPastChar !== CHARS.ASTERISK && pastPastChar !== CHARS.FORWARD_SLASH;
}
function getIndentationText(useTabs, numberSpaces) {
  if (useTabs) {
    return "	";
  }
  return Array(numberSpaces + 1).join(" ");
}
function getSpacesAndTabsCount(str) {
  let spacesCount = 0;
  let tabsCount = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode === CHARS.SPACE) {
      spacesCount++;
    } else if (charCode === CHARS.TAB) {
      tabsCount++;
    }
  }
  return { spacesCount, tabsCount };
}
var CommentChar, CHARS, isCharToHandle, CodeBlockWriter;
var init_mod = __esm({
  "../../node_modules/.pnpm/code-block-writer@12.0.0/node_modules/code-block-writer/esm/mod.js"() {
    init_string_utils();
    (function(CommentChar2) {
      CommentChar2[CommentChar2["Line"] = 0] = "Line";
      CommentChar2[CommentChar2["Star"] = 1] = "Star";
    })(CommentChar || (CommentChar = {}));
    CHARS = {
      BACK_SLASH: "\\".charCodeAt(0),
      FORWARD_SLASH: "/".charCodeAt(0),
      NEW_LINE: "\n".charCodeAt(0),
      CARRIAGE_RETURN: "\r".charCodeAt(0),
      ASTERISK: "*".charCodeAt(0),
      DOUBLE_QUOTE: '"'.charCodeAt(0),
      SINGLE_QUOTE: "'".charCodeAt(0),
      BACK_TICK: "`".charCodeAt(0),
      OPEN_BRACE: "{".charCodeAt(0),
      CLOSE_BRACE: "}".charCodeAt(0),
      DOLLAR_SIGN: "$".charCodeAt(0),
      SPACE: " ".charCodeAt(0),
      TAB: "	".charCodeAt(0)
    };
    isCharToHandle = /* @__PURE__ */ new Set([
      CHARS.BACK_SLASH,
      CHARS.FORWARD_SLASH,
      CHARS.NEW_LINE,
      CHARS.CARRIAGE_RETURN,
      CHARS.ASTERISK,
      CHARS.DOUBLE_QUOTE,
      CHARS.SINGLE_QUOTE,
      CHARS.BACK_TICK,
      CHARS.OPEN_BRACE,
      CHARS.CLOSE_BRACE
    ]);
    CodeBlockWriter = class _CodeBlockWriter {
      /**
       * Constructor.
       * @param opts - Options for the writer.
       */
      constructor(opts = {}) {
        Object.defineProperty(this, "_indentationText", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_newLine", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_useTabs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_quoteChar", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_indentNumberOfSpaces", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_currentIndentation", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 0
        });
        Object.defineProperty(this, "_queuedIndentation", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_queuedOnlyIfNotBlock", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_length", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 0
        });
        Object.defineProperty(this, "_newLineOnNextWrite", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "_currentCommentChar", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_stringCharStack", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "_isInRegEx", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "_isOnFirstLineOfBlock", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "_texts", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        this._newLine = opts.newLine || "\n";
        this._useTabs = opts.useTabs || false;
        this._indentNumberOfSpaces = opts.indentNumberOfSpaces || 4;
        this._indentationText = getIndentationText(this._useTabs, this._indentNumberOfSpaces);
        this._quoteChar = opts.useSingleQuote ? "'" : `"`;
      }
      /**
       * Gets the options.
       */
      getOptions() {
        return {
          indentNumberOfSpaces: this._indentNumberOfSpaces,
          newLine: this._newLine,
          useTabs: this._useTabs,
          useSingleQuote: this._quoteChar === "'"
        };
      }
      queueIndentationLevel(countOrText) {
        this._queuedIndentation = this._getIndentationLevelFromArg(countOrText);
        this._queuedOnlyIfNotBlock = void 0;
        return this;
      }
      /**
       * Writes the text within the provided action with hanging indentation.
       * @param action - Action to perform with hanging indentation.
       */
      hangingIndent(action) {
        return this._withResetIndentation(() => this.queueIndentationLevel(this.getIndentationLevel() + 1), action);
      }
      /**
       * Writes the text within the provided action with hanging indentation unless writing a block.
       * @param action - Action to perform with hanging indentation unless a block is written.
       */
      hangingIndentUnlessBlock(action) {
        return this._withResetIndentation(() => {
          this.queueIndentationLevel(this.getIndentationLevel() + 1);
          this._queuedOnlyIfNotBlock = true;
        }, action);
      }
      setIndentationLevel(countOrText) {
        this._currentIndentation = this._getIndentationLevelFromArg(countOrText);
        return this;
      }
      withIndentationLevel(countOrText, action) {
        return this._withResetIndentation(() => this.setIndentationLevel(countOrText), action);
      }
      /** @internal */
      _withResetIndentation(setStateAction, writeAction) {
        const previousState = this._getIndentationState();
        setStateAction();
        try {
          writeAction();
        } finally {
          this._setIndentationState(previousState);
        }
        return this;
      }
      /**
       * Gets the current indentation level.
       */
      getIndentationLevel() {
        return this._currentIndentation;
      }
      /**
       * Writes a block using braces.
       * @param block - Write using the writer within this block.
       */
      block(block) {
        this._newLineIfNewLineOnNextWrite();
        if (this.getLength() > 0 && !this.isLastNewLine()) {
          this.spaceIfLastNot();
        }
        this.inlineBlock(block);
        this._newLineOnNextWrite = true;
        return this;
      }
      /**
       * Writes an inline block with braces.
       * @param block - Write using the writer within this block.
       */
      inlineBlock(block) {
        this._newLineIfNewLineOnNextWrite();
        this.write("{");
        this._indentBlockInternal(block);
        this.newLineIfLastNot().write("}");
        return this;
      }
      indent(timesOrBlock = 1) {
        if (typeof timesOrBlock === "number") {
          this._newLineIfNewLineOnNextWrite();
          return this.write(this._indentationText.repeat(timesOrBlock));
        } else {
          this._indentBlockInternal(timesOrBlock);
          if (!this.isLastNewLine()) {
            this._newLineOnNextWrite = true;
          }
          return this;
        }
      }
      /** @internal */
      _indentBlockInternal(block) {
        if (this.getLastChar() != null) {
          this.newLineIfLastNot();
        }
        this._currentIndentation++;
        this._isOnFirstLineOfBlock = true;
        if (block != null) {
          block();
        }
        this._isOnFirstLineOfBlock = false;
        this._currentIndentation = Math.max(0, this._currentIndentation - 1);
      }
      conditionalWriteLine(condition, strOrFunc) {
        if (condition) {
          this.writeLine(getStringFromStrOrFunc(strOrFunc));
        }
        return this;
      }
      /**
       * Writes a line of text.
       * @param text - String to write.
       */
      writeLine(text) {
        this._newLineIfNewLineOnNextWrite();
        if (this.getLastChar() != null) {
          this.newLineIfLastNot();
        }
        this._writeIndentingNewLines(text);
        this.newLine();
        return this;
      }
      /**
       * Writes a newline if the last line was not a newline.
       */
      newLineIfLastNot() {
        this._newLineIfNewLineOnNextWrite();
        if (!this.isLastNewLine()) {
          this.newLine();
        }
        return this;
      }
      /**
       * Writes a blank line if the last written text was not a blank line.
       */
      blankLineIfLastNot() {
        if (!this.isLastBlankLine()) {
          this.blankLine();
        }
        return this;
      }
      /**
       * Writes a blank line if the condition is true.
       * @param condition - Condition to evaluate.
       */
      conditionalBlankLine(condition) {
        if (condition) {
          this.blankLine();
        }
        return this;
      }
      /**
       * Writes a blank line.
       */
      blankLine() {
        return this.newLineIfLastNot().newLine();
      }
      /**
       * Writes a newline if the condition is true.
       * @param condition - Condition to evaluate.
       */
      conditionalNewLine(condition) {
        if (condition) {
          this.newLine();
        }
        return this;
      }
      /**
       * Writes a newline.
       */
      newLine() {
        this._newLineOnNextWrite = false;
        this._baseWriteNewline();
        return this;
      }
      quote(text) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines(text == null ? this._quoteChar : this._quoteChar + escapeForWithinString(text, this._quoteChar) + this._quoteChar);
        return this;
      }
      /**
       * Writes a space if the last character was not a space.
       */
      spaceIfLastNot() {
        this._newLineIfNewLineOnNextWrite();
        if (!this.isLastSpace()) {
          this._writeIndentingNewLines(" ");
        }
        return this;
      }
      /**
       * Writes a space.
       * @param times - Number of times to write a space.
       */
      space(times = 1) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines(" ".repeat(times));
        return this;
      }
      /**
       * Writes a tab if the last character was not a tab.
       */
      tabIfLastNot() {
        this._newLineIfNewLineOnNextWrite();
        if (!this.isLastTab()) {
          this._writeIndentingNewLines("	");
        }
        return this;
      }
      /**
       * Writes a tab.
       * @param times - Number of times to write a tab.
       */
      tab(times = 1) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines("	".repeat(times));
        return this;
      }
      conditionalWrite(condition, textOrFunc) {
        if (condition) {
          this.write(getStringFromStrOrFunc(textOrFunc));
        }
        return this;
      }
      /**
       * Writes the provided text.
       * @param text - Text to write.
       */
      write(text) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines(text);
        return this;
      }
      /**
       * Writes text to exit a comment if in a comment.
       */
      closeComment() {
        const commentChar = this._currentCommentChar;
        switch (commentChar) {
          case CommentChar.Line:
            this.newLine();
            break;
          case CommentChar.Star:
            if (!this.isLastNewLine()) {
              this.spaceIfLastNot();
            }
            this.write("*/");
            break;
          default: {
            const _assertUndefined = commentChar;
            break;
          }
        }
        return this;
      }
      /**
       * Inserts text at the provided position.
       *
       * This method is "unsafe" because it won't update the state of the writer unless
       * inserting at the end position. It is biased towards being fast at inserting closer
       * to the start or end, but slower to insert in the middle. Only use this if
       * absolutely necessary.
       * @param pos - Position to insert at.
       * @param text - Text to insert.
       */
      unsafeInsert(pos, text) {
        const textLength = this._length;
        const texts = this._texts;
        verifyInput();
        if (pos === textLength) {
          return this.write(text);
        }
        updateInternalArray();
        this._length += text.length;
        return this;
        function verifyInput() {
          if (pos < 0) {
            throw new Error(`Provided position of '${pos}' was less than zero.`);
          }
          if (pos > textLength) {
            throw new Error(`Provided position of '${pos}' was greater than the text length of '${textLength}'.`);
          }
        }
        function updateInternalArray() {
          const { index, localIndex } = getArrayIndexAndLocalIndex();
          if (localIndex === 0) {
            texts.splice(index, 0, text);
          } else if (localIndex === texts[index].length) {
            texts.splice(index + 1, 0, text);
          } else {
            const textItem = texts[index];
            const startText = textItem.substring(0, localIndex);
            const endText = textItem.substring(localIndex);
            texts.splice(index, 1, startText, text, endText);
          }
        }
        function getArrayIndexAndLocalIndex() {
          if (pos < textLength / 2) {
            let endPos = 0;
            for (let i = 0; i < texts.length; i++) {
              const textItem = texts[i];
              const startPos = endPos;
              endPos += textItem.length;
              if (endPos >= pos) {
                return { index: i, localIndex: pos - startPos };
              }
            }
          } else {
            let startPos = textLength;
            for (let i = texts.length - 1; i >= 0; i--) {
              const textItem = texts[i];
              startPos -= textItem.length;
              if (startPos <= pos) {
                return { index: i, localIndex: pos - startPos };
              }
            }
          }
          throw new Error("Unhandled situation inserting. This should never happen.");
        }
      }
      /**
       * Gets the length of the string in the writer.
       */
      getLength() {
        return this._length;
      }
      /**
       * Gets if the writer is currently in a comment.
       */
      isInComment() {
        return this._currentCommentChar !== void 0;
      }
      /**
       * Gets if the writer is currently at the start of the first line of the text, block, or indentation block.
       */
      isAtStartOfFirstLineOfBlock() {
        return this.isOnFirstLineOfBlock() && (this.isLastNewLine() || this.getLastChar() == null);
      }
      /**
       * Gets if the writer is currently on the first line of the text, block, or indentation block.
       */
      isOnFirstLineOfBlock() {
        return this._isOnFirstLineOfBlock;
      }
      /**
       * Gets if the writer is currently in a string.
       */
      isInString() {
        return this._stringCharStack.length > 0 && this._stringCharStack[this._stringCharStack.length - 1] !== CHARS.OPEN_BRACE;
      }
      /**
       * Gets if the last chars written were for a newline.
       */
      isLastNewLine() {
        const lastChar = this.getLastChar();
        return lastChar === "\n" || lastChar === "\r";
      }
      /**
       * Gets if the last chars written were for a blank line.
       */
      isLastBlankLine() {
        let foundCount = 0;
        for (let i = this._texts.length - 1; i >= 0; i--) {
          const currentText = this._texts[i];
          for (let j = currentText.length - 1; j >= 0; j--) {
            const currentChar = currentText.charCodeAt(j);
            if (currentChar === CHARS.NEW_LINE) {
              foundCount++;
              if (foundCount === 2) {
                return true;
              }
            } else if (currentChar !== CHARS.CARRIAGE_RETURN) {
              return false;
            }
          }
        }
        return false;
      }
      /**
       * Gets if the last char written was a space.
       */
      isLastSpace() {
        return this.getLastChar() === " ";
      }
      /**
       * Gets if the last char written was a tab.
       */
      isLastTab() {
        return this.getLastChar() === "	";
      }
      /**
       * Gets the last char written.
       */
      getLastChar() {
        const charCode = this._getLastCharCodeWithOffset(0);
        return charCode == null ? void 0 : String.fromCharCode(charCode);
      }
      /**
       * Gets if the writer ends with the provided text.
       * @param text - Text to check if the writer ends with the provided text.
       */
      endsWith(text) {
        const length = this._length;
        return this.iterateLastCharCodes((charCode, index) => {
          const offset = length - index;
          const textIndex = text.length - offset;
          if (text.charCodeAt(textIndex) !== charCode) {
            return false;
          }
          return textIndex === 0 ? true : void 0;
        }) || false;
      }
      /**
       * Iterates over the writer characters in reverse order. The iteration stops when a non-null or
       * undefined value is returned from the action. The returned value is then returned by the method.
       *
       * @remarks It is much more efficient to use this method rather than `#toString()` since `#toString()`
       * will combine the internal array into a string.
       */
      iterateLastChars(action) {
        return this.iterateLastCharCodes((charCode, index) => action(String.fromCharCode(charCode), index));
      }
      /**
       * Iterates over the writer character char codes in reverse order. The iteration stops when a non-null or
       * undefined value is returned from the action. The returned value is then returned by the method.
       *
       * @remarks It is much more efficient to use this method rather than `#toString()` since `#toString()`
       * will combine the internal array into a string. Additionally, this is slightly more efficient that
       * `iterateLastChars` as this won't allocate a string per character.
       */
      iterateLastCharCodes(action) {
        let index = this._length;
        for (let i = this._texts.length - 1; i >= 0; i--) {
          const currentText = this._texts[i];
          for (let j = currentText.length - 1; j >= 0; j--) {
            index--;
            const result = action(currentText.charCodeAt(j), index);
            if (result != null) {
              return result;
            }
          }
        }
        return void 0;
      }
      /**
       * Gets the writer's text.
       */
      toString() {
        if (this._texts.length > 1) {
          const text = this._texts.join("");
          this._texts.length = 0;
          this._texts.push(text);
        }
        return this._texts[0] || "";
      }
      /** @internal */
      _writeIndentingNewLines(text) {
        text = text || "";
        if (text.length === 0) {
          writeIndividual(this, "");
          return;
        }
        const items = text.split(_CodeBlockWriter._newLineRegEx);
        items.forEach((s, i) => {
          if (i > 0) {
            this._baseWriteNewline();
          }
          if (s.length === 0) {
            return;
          }
          writeIndividual(this, s);
        });
        function writeIndividual(writer, s) {
          if (!writer.isInString()) {
            const isAtStartOfLine = writer.isLastNewLine() || writer.getLastChar() == null;
            if (isAtStartOfLine) {
              writer._writeIndentation();
            }
          }
          writer._updateInternalState(s);
          writer._internalWrite(s);
        }
      }
      /** @internal */
      _baseWriteNewline() {
        if (this._currentCommentChar === CommentChar.Line) {
          this._currentCommentChar = void 0;
        }
        const lastStringCharOnStack = this._stringCharStack[this._stringCharStack.length - 1];
        if ((lastStringCharOnStack === CHARS.DOUBLE_QUOTE || lastStringCharOnStack === CHARS.SINGLE_QUOTE) && this._getLastCharCodeWithOffset(0) !== CHARS.BACK_SLASH) {
          this._stringCharStack.pop();
        }
        this._internalWrite(this._newLine);
        this._isOnFirstLineOfBlock = false;
        this._dequeueQueuedIndentation();
      }
      /** @internal */
      _dequeueQueuedIndentation() {
        if (this._queuedIndentation == null) {
          return;
        }
        if (this._queuedOnlyIfNotBlock && wasLastBlock(this)) {
          this._queuedIndentation = void 0;
          this._queuedOnlyIfNotBlock = void 0;
        } else {
          this._currentIndentation = this._queuedIndentation;
          this._queuedIndentation = void 0;
        }
        function wasLastBlock(writer) {
          let foundNewLine = false;
          return writer.iterateLastCharCodes((charCode) => {
            switch (charCode) {
              case CHARS.NEW_LINE:
                if (foundNewLine) {
                  return false;
                } else {
                  foundNewLine = true;
                }
                break;
              case CHARS.CARRIAGE_RETURN:
                return void 0;
              case CHARS.OPEN_BRACE:
                return true;
              default:
                return false;
            }
          });
        }
      }
      /** @internal */
      _updateInternalState(str) {
        for (let i = 0; i < str.length; i++) {
          const currentChar = str.charCodeAt(i);
          if (!isCharToHandle.has(currentChar)) {
            continue;
          }
          const pastChar = i === 0 ? this._getLastCharCodeWithOffset(0) : str.charCodeAt(i - 1);
          const pastPastChar = i === 0 ? this._getLastCharCodeWithOffset(1) : i === 1 ? this._getLastCharCodeWithOffset(0) : str.charCodeAt(i - 2);
          if (this._isInRegEx) {
            if (pastChar === CHARS.FORWARD_SLASH && pastPastChar !== CHARS.BACK_SLASH || pastChar === CHARS.NEW_LINE) {
              this._isInRegEx = false;
            } else {
              continue;
            }
          } else if (!this.isInString() && !this.isInComment() && isRegExStart(currentChar, pastChar, pastPastChar)) {
            this._isInRegEx = true;
            continue;
          }
          if (this._currentCommentChar == null && pastChar === CHARS.FORWARD_SLASH && currentChar === CHARS.FORWARD_SLASH) {
            this._currentCommentChar = CommentChar.Line;
          } else if (this._currentCommentChar == null && pastChar === CHARS.FORWARD_SLASH && currentChar === CHARS.ASTERISK) {
            this._currentCommentChar = CommentChar.Star;
          } else if (this._currentCommentChar === CommentChar.Star && pastChar === CHARS.ASTERISK && currentChar === CHARS.FORWARD_SLASH) {
            this._currentCommentChar = void 0;
          }
          if (this.isInComment()) {
            continue;
          }
          const lastStringCharOnStack = this._stringCharStack.length === 0 ? void 0 : this._stringCharStack[this._stringCharStack.length - 1];
          if (pastChar !== CHARS.BACK_SLASH && (currentChar === CHARS.DOUBLE_QUOTE || currentChar === CHARS.SINGLE_QUOTE || currentChar === CHARS.BACK_TICK)) {
            if (lastStringCharOnStack === currentChar) {
              this._stringCharStack.pop();
            } else if (lastStringCharOnStack === CHARS.OPEN_BRACE || lastStringCharOnStack === void 0) {
              this._stringCharStack.push(currentChar);
            }
          } else if (pastPastChar !== CHARS.BACK_SLASH && pastChar === CHARS.DOLLAR_SIGN && currentChar === CHARS.OPEN_BRACE && lastStringCharOnStack === CHARS.BACK_TICK) {
            this._stringCharStack.push(currentChar);
          } else if (currentChar === CHARS.CLOSE_BRACE && lastStringCharOnStack === CHARS.OPEN_BRACE) {
            this._stringCharStack.pop();
          }
        }
      }
      /** @internal - This is private, but exposed for testing. */
      _getLastCharCodeWithOffset(offset) {
        if (offset >= this._length || offset < 0) {
          return void 0;
        }
        for (let i = this._texts.length - 1; i >= 0; i--) {
          const currentText = this._texts[i];
          if (offset >= currentText.length) {
            offset -= currentText.length;
          } else {
            return currentText.charCodeAt(currentText.length - 1 - offset);
          }
        }
        return void 0;
      }
      /** @internal */
      _writeIndentation() {
        const flooredIndentation = Math.floor(this._currentIndentation);
        this._internalWrite(this._indentationText.repeat(flooredIndentation));
        const overflow = this._currentIndentation - flooredIndentation;
        if (this._useTabs) {
          if (overflow > 0.5) {
            this._internalWrite(this._indentationText);
          }
        } else {
          const portion = Math.round(this._indentationText.length * overflow);
          let text = "";
          for (let i = 0; i < portion; i++) {
            text += this._indentationText[i];
          }
          this._internalWrite(text);
        }
      }
      /** @internal */
      _newLineIfNewLineOnNextWrite() {
        if (!this._newLineOnNextWrite) {
          return;
        }
        this._newLineOnNextWrite = false;
        this.newLine();
      }
      /** @internal */
      _internalWrite(text) {
        if (text.length === 0) {
          return;
        }
        this._texts.push(text);
        this._length += text.length;
      }
      /** @internal */
      _getIndentationLevelFromArg(countOrText) {
        if (typeof countOrText === "number") {
          if (countOrText < 0) {
            throw new Error("Passed in indentation level should be greater than or equal to 0.");
          }
          return countOrText;
        } else if (typeof countOrText === "string") {
          if (!_CodeBlockWriter._spacesOrTabsRegEx.test(countOrText)) {
            throw new Error("Provided string must be empty or only contain spaces or tabs.");
          }
          const { spacesCount, tabsCount } = getSpacesAndTabsCount(countOrText);
          return tabsCount + spacesCount / this._indentNumberOfSpaces;
        } else {
          throw new Error("Argument provided must be a string or number.");
        }
      }
      /** @internal */
      _setIndentationState(state2) {
        this._currentIndentation = state2.current;
        this._queuedIndentation = state2.queued;
        this._queuedOnlyIfNotBlock = state2.queuedOnlyIfNotBlock;
      }
      /** @internal */
      _getIndentationState() {
        return {
          current: this._currentIndentation,
          queued: this._queuedIndentation,
          queuedOnlyIfNotBlock: this._queuedOnlyIfNotBlock
        };
      }
    };
    Object.defineProperty(CodeBlockWriter, "_newLineRegEx", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /\r?\n/
    });
    Object.defineProperty(CodeBlockWriter, "_spacesOrTabsRegEx", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /^[ \t]*$/
    });
  }
});

// src/backend/generator/generateIndex.ts
function generateIndex(names, settings, isMainIndex = false) {
  const writer = new CodeBlockWriter(settings == null ? void 0 : settings.writer);
  const prefix = isMainIndex ? "./components/" : "./";
  names.forEach((name) => {
    writer.write(`export {${name}} from `);
    writer.quote(`${prefix}${name}`);
    writer.write(";");
    writer.newLine();
  });
  writer.newLine();
  return writer.toString();
}
var init_generateIndex = __esm({
  "src/backend/generator/generateIndex.ts"() {
    init_mod();
  }
});

// src/backend/generator/lib/writeImports.ts
function writeImports(writer, flags, data) {
  function writeImport(name, props2, isType) {
    const names = Object.entries(props2).map(([k, f]) => f && k).filter(Boolean);
    if (!names.length)
      return;
    writer.write(`import ${isType ? "type " : ""}{${names.join(", ")}} from`);
    writer.space();
    writer.quote(name);
    writer.write(";");
    writer.newLine();
  }
  writeImport("react", flags.react);
  writeImport("react-native-unistyles", flags.unistyles);
  writeImport("react-native", flags.reactNative);
  writeImport("react-native-exo", flags.exo);
  writeImport("@lingui/macro", flags.lingui);
  const components = Object.entries(data.meta.components);
  if (components.length > 0) {
    components.sort((a, b) => a[1][0].name.localeCompare(b[1][0].name)).forEach(([_id, [node, _instance]]) => {
      const component = createIdentifierPascal(node.name);
      writer.write(`import {${component}} from`);
      writer.space();
      writer.quote(`components/${component}`);
      writer.write(";");
      writer.newLine();
    });
  }
  const assets = Object.entries(data.assetData);
  if (assets.length > 0) {
    assets.sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([_id, asset]) => {
      writer.write(`import ${asset.name} from`);
      writer.space();
      const base = `assets/${asset.isVector ? "svgs" : "images"}`;
      const path = `${base}/${asset.name}.${asset.isVector ? "svg" : "png"}`;
      writer.quote(path);
      writer.write(";");
      writer.newLine();
    });
    writer.blankLineIfLastNot();
  }
  if (flags.reactNativeTypes) {
    writer.blankLineIfLastNot();
    writeImport("react-native", flags.reactNativeTypes, true);
  }
  writer.blankLineIfLastNot();
}
var init_writeImports = __esm({
  "src/backend/generator/lib/writeImports.ts"() {
    init_string();
  }
});

// src/backend/generator/lib/writeChildren.ts
function writeChildren(writer, flags, data, settings, children, getStylePrefix, pressables) {
  const state2 = { writer, flags, data, settings, pressables, getStylePrefix };
  children.forEach((child) => {
    var _a, _b, _c;
    const slug = (_b = (_a = data.children) == null ? void 0 : _a.find((c) => c.node === child.node)) == null ? void 0 : _b.slug;
    const pressId = (_c = pressables == null ? void 0 : pressables.find((e) => (e == null ? void 0 : e[1]) === slug)) == null ? void 0 : _c[2];
    const isVariant = !!child.node.variantProperties;
    const masterNode = isVariant ? child.node.parent : child.node;
    const propRefs = masterNode == null ? void 0 : masterNode.componentPropertyReferences;
    const isPressable = Boolean(pressId);
    const isConditional = Boolean(propRefs == null ? void 0 : propRefs.visible);
    if (isPressable)
      flags.reactNative.Pressable = true;
    writer.conditionalWriteLine(isConditional, `{props.${getPropName(propRefs == null ? void 0 : propRefs.visible)} && `);
    writer.withIndentationLevel((isConditional ? 1 : 0) + writer.getIndentationLevel(), () => {
      writer.conditionalWriteLine(isPressable, `<Pressable onPress={props.${pressId}}>`);
      writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChild(child, slug, isConditional, state2);
      });
      writer.conditionalWriteLine(isPressable, `</Pressable>`);
    });
    writer.conditionalWriteLine(isConditional, `}`);
  });
}
function writeChild(child, slug, isConditional, state2) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const { writer, data, settings, pressables, getStylePrefix } = state2;
  const testID = ` testID="${child.node.id}"`;
  const propRefs = child.node.componentPropertyReferences;
  const instance = getInstanceInfo(child.node);
  const reaction = getCustomReaction(instance.node);
  const swapNodeProp = getPropName(propRefs == null ? void 0 : propRefs.mainComponent);
  const jsxBaseProps = getPropsJSX(instance.node.componentProperties, data.colorsheet, data.meta.includes);
  const hasCustomProps = (reaction == null ? void 0 : reaction.type) === "URL";
  const isRootPressable = (pressables == null ? void 0 : pressables.find((e) => e[1] === "root" || !e[1])) !== void 0;
  const isInstance = child.node.type === "INSTANCE";
  const isAsset = child.node.type === "VECTOR" || child.node.isAsset && !isInstance;
  const isText = child.node.type === "TEXT";
  const isSwap = Boolean(swapNodeProp);
  const isIcon = isInstance && child.node.name.includes(":") && ((_a = getPage(child.node.mainComponent)) == null ? void 0 : _a.name) === "Icons";
  if (isIcon) {
    const iconVector = (_b = instance.node.children) == null ? void 0 : _b.find((c) => c.type === "VECTOR");
    const iconColor = getFillToken(iconVector);
    const variantFills = (_d = (_c = data.variants) == null ? void 0 : _c.fills) == null ? void 0 : _d[slug];
    const hasVariant = data.variants && variantFills && !!Object.values(variantFills);
    const fillToken = hasVariant ? `colors.${slug}` : iconColor;
    const dynamic = isRootPressable && hasVariant ? "(e)" : "";
    const style = `{color: ${fillToken}${dynamic}}`;
    if (isSwap) {
      state2.flags.react.cloneElement = true;
      const statement = `cloneElement(props.${swapNodeProp}, `;
      writer.write((isConditional ? "" : "{") + statement).inlineBlock(() => {
        writer.writeLine(`style: ${style},`);
        writer.writeLine(`size: ${child.node.width},`);
      });
      writer.write(")" + (isConditional ? "" : "}"));
      writer.newLine();
    } else {
      writer.writeLine(`<Icon icon="${child.node.name}" size={${child.node.width}} style={${style}}/>`);
      state2.flags.exo.Icon = true;
    }
    return;
  }
  if (isAsset) {
    const asset = data.assetData[child.node.id];
    if (asset) {
      if (asset.isVector) {
        const vectorTag = "<" + asset.name + "/>";
        writer.writeLine(vectorTag);
      } else {
        const uri = asset.name;
        const style = `{width: ${asset.width}, height: ${asset.height}}`;
        writer.writeLine(`<Image source={{uri: ${uri}}} style={${style}} resizeMode="cover"/>`);
        state2.flags.reactNative.Image = true;
      }
    } else {
      writer.writeLine(`<View/>`);
    }
    return;
  }
  if (isSwap) {
    const statement = `props.${swapNodeProp}`;
    writer.writeLine(isConditional ? statement : `{${statement}}`);
    return;
  }
  let jsxTag;
  let jsxTagWithProps;
  let jsxCustomProps = "";
  if (hasCustomProps) {
    jsxCustomProps = (_h = (_g = (_f = (_e = reaction.url) == null ? void 0 : _e.split(",")) == null ? void 0 : _f.map((p) => p.trim())) == null ? void 0 : _g.map((p) => {
      const relation = p == null ? void 0 : p.split("->");
      if (relation.length === 2) {
        const [k, v] = relation;
        if (k && v) {
          return ` ${getPropName(k)}={props.${getPropName(v)}}`;
        }
      }
      const custom = p == null ? void 0 : p.split("=");
      if (custom.length === 1 && custom[0])
        return " " + custom[0];
      if (custom.length === 2 && custom[1])
        return " " + custom.join("=");
      return "";
    })) == null ? void 0 : _h.join("");
  }
  if (isInstance) {
    jsxTag = createIdentifierPascal(instance.main.name);
    jsxTagWithProps = jsxTag + jsxCustomProps + jsxBaseProps + testID;
    if (jsxTagWithProps.includes("<Icon"))
      state2.flags.exo.Icon = true;
  } else {
    const dynamic = isRootPressable ? "(e)" : "";
    const styles = slug ? ` style={${getStylePrefix(slug)}.${slug}${dynamic}}` : "";
    jsxTag = getReactNativeTag(child.node.type);
    jsxTagWithProps = jsxTag + styles + jsxCustomProps + jsxBaseProps + testID;
    state2.flags.reactNative[jsxTag] = true;
  }
  if (!isText && !child.children) {
    writer.writeLine(`<${jsxTagWithProps}/>`);
    return;
  }
  writer.write(`<${jsxTagWithProps}>`).indent(() => {
    var _a2;
    switch (jsxTag) {
      case "View":
        writeChildren(
          writer,
          state2.flags,
          data,
          settings,
          child.children,
          getStylePrefix,
          pressables
        );
        break;
      case "Text":
        const propId = propRefs == null ? void 0 : propRefs.characters;
        const propName = propId ? getPropName(propId) : null;
        const propValue = propName ? `props.${propName}` : child.node.characters || "";
        if (propValue.startsWith("props.")) {
          writer.write(`{${propValue}}`);
        } else {
          if ((_a2 = settings == null ? void 0 : settings.react) == null ? void 0 : _a2.addTranslate) {
            state2.flags.lingui.Trans = true;
            writer.write(`<Trans>${propValue}</Trans>`);
          } else {
            writer.write(`{\`${propValue}\`}`);
          }
        }
        break;
    }
  });
  writer.writeLine(`</${jsxTag}>`);
}
function getReactNativeTag(type) {
  switch (type) {
    case "TEXT":
      return "Text";
    case "IMAGE":
      return "Image";
    case "COMPONENT":
    case "INSTANCE":
    case "RECTANGLE":
    case "ELLIPSE":
    case "FRAME":
    default:
      return "View";
  }
}
var init_writeChildren = __esm({
  "src/backend/generator/lib/writeChildren.ts"() {
    init_string();
    init_lib2();
  }
});

// src/backend/generator/lib/writeClasses.ts
function writeClasses(writer, flags, data, isRootPressable) {
  const props2 = /* @__PURE__ */ new Set();
  const classes = /* @__PURE__ */ new Set();
  const conditions = /* @__PURE__ */ new Set();
  Object.keys(data.variants.classes).forEach((k) => {
    classes[k] = Object.keys(data.variants.classes[k]).filter((v) => !!data.variants.classes[k][v]).map((v) => {
      var _a;
      const decoded = (_a = v.split(", ")) == null ? void 0 : _a.map((part) => {
        const [state2, value] = part.split("=");
        const enumVal = createIdentifierPascal(value);
        const propId = getPropName(state2);
        const condVal = `props.${propId} === '${enumVal}'`;
        const condName = `${state2}_${value}`.split(", ").join("_").replace(/\=/g, "_");
        const condId = "_" + createIdentifierCamel(condName);
        conditions[condId] = condVal;
        props2.add(propId);
        return condId;
      });
      return [decoded, v];
    });
  });
  const pressableFunction = "(e: PressableStateCallbackType) => ";
  const pressableDisableState = {
    "_stateDisabled": " || props.disabled"
  };
  const pressableStates = {
    "_stateFocused": "e.focused",
    "_stateHovered": "e.hovered",
    "_statePressed": "e.pressed"
  };
  Object.keys(conditions).sort((a, b) => a.localeCompare(b)).forEach((cond) => {
    const specialState = pressableDisableState[cond] || "";
    const expression = conditions[cond];
    writer.write(`const ${cond} = ${expression}${specialState};`).newLine();
  });
  writer.blankLine();
  flags.react.useMemo = true;
  writer.write(`const classes = useMemo(() => (`).inlineBlock(() => {
    for (const slug of Object.keys(classes)) {
      const dynamic = isRootPressable ? pressableFunction : "";
      writer.write(`${slug}: ${dynamic}[`).indent(() => {
        writer.writeLine(`styles.${slug},`);
        Array.from(classes[slug]).forEach((data2) => {
          const [rules, raw] = data2;
          const condition = rules.map((ruleName) => {
            const pressableState = pressableStates[ruleName];
            return pressableState && dynamic ? `(${ruleName} || ${pressableState})` : ruleName;
          }).filter(Boolean).join(" && ");
          const className = `${slug}_${raw}`.split(", ").join("_").replace(/\=/g, "_");
          writer.writeLine(`${condition} && styles.${createIdentifierCamel(className)},`);
        });
      });
      writer.writeLine("],");
    }
  });
  const cacheProps = Array.from(props2).map((p) => `props.${p}`);
  writer.write(`), [styles, ${cacheProps.join(", ")}]);`);
  writer.blankLine();
}
var init_writeClasses = __esm({
  "src/backend/generator/lib/writeClasses.ts"() {
    init_string();
    init_lib2();
  }
});

// src/backend/generator/lib/writeColors.ts
function writeColors(writer, flags, data, isRootPressable) {
  const props2 = /* @__PURE__ */ new Set();
  const fills = /* @__PURE__ */ new Set();
  const conds = /* @__PURE__ */ new Set();
  const pressableFunction = "(e: PressableStateCallbackType) => ";
  const pressableStates = {
    "_stateFocused": "e.focused",
    "_stateHovered": "e.hovered",
    "_statePressed": "e.pressed"
  };
  Object.keys(data.variants.fills).forEach((k) => {
    fills[k] = Object.keys(data.variants.fills[k]).filter((v) => !!data.variants.fills[k][v]).map((v) => {
      var _a;
      const decoded = (_a = v.split(", ")) == null ? void 0 : _a.map((part) => {
        const [state2, value] = part.split("=");
        const propId = getPropName(state2);
        const enumVal = createIdentifierPascal(value);
        const condVal = `props.${propId} === '${enumVal}'`;
        const condName = `${state2}_${value}`.split(", ").join("_").replace(/\=/g, "_");
        const condId = "_" + createIdentifierCamel(condName);
        conds[condId] = condVal;
        props2.add(propId);
        return condId;
      });
      return [decoded, v];
    });
  });
  flags.react.useMemo = true;
  writer.write(`const colors = useMemo(() => (`).inlineBlock(() => {
    for (const slug of Object.keys(fills)) {
      const dynamic = isRootPressable ? pressableFunction : "";
      const variants = data.variants.fills[slug];
      writer.write(`${slug}: ${dynamic}[`).indent(() => {
        const defaultColor = "theme.colors.primaryForeground";
        writer.writeLine(`${defaultColor},`);
        Array.from(fills[slug]).forEach((value) => {
          const [rules, raw] = value;
          const condition = rules.map((ruleName) => {
            const pressableState = pressableStates[ruleName];
            return pressableState && dynamic ? `(${ruleName} || ${pressableState})` : ruleName;
          }).filter(Boolean).join(" && ");
          const varNodeId = variants[raw.toString()];
          const fillToken = data.colorsheet[varNodeId];
          writer.writeLine(`${condition} && ${fillToken},`);
        });
      });
      writer.writeLine("].filter(Boolean).pop(),");
    }
  });
  const cacheProps = Array.from(props2).map((p) => `props.${p}`);
  writer.write(`), [${cacheProps.join(", ")}]);`);
  writer.blankLine();
}
var init_writeColors = __esm({
  "src/backend/generator/lib/writeColors.ts"() {
    init_string();
    init_lib2();
  }
});

// src/backend/generator/lib/writeProps.ts
function writeProps(writer, flags, propDefs, componentName, pressables, isIcon, isRootPressable) {
  const props2 = propDefs ? Object.entries(propDefs) : [];
  writer.write(`export interface ${componentName}Props`).block(() => {
    let hasWroteDisableProp = false;
    props2.sort(sortPropsDef).forEach(([key, prop]) => {
      const propName = getPropName(key);
      if (propName === "disabled") {
        if (hasWroteDisableProp)
          return;
        hasWroteDisableProp = true;
      }
      const isBoolean = prop.type === "BOOLEAN";
      const isVariant = prop.type === "VARIANT";
      const isInstanceSwap = prop.type === "INSTANCE_SWAP";
      const isRootPressableState = propName === "state" && isRootPressable && isVariant;
      const isConditionalProp = isBoolean || isInstanceSwap || isRootPressableState;
      const propCond = isConditionalProp ? "?" : "";
      const propType = isVariant ? prop.variantOptions.map((v) => `'${createIdentifierPascal(v)}'`).join(" | ") : isInstanceSwap ? `JSX.Element` : prop.type === "TEXT" ? "string" : prop.type.toLowerCase();
      writer.writeLine(`${propName}${propCond}: ${propType},`);
      if (isRootPressableState && !hasWroteDisableProp) {
        writer.writeLine(`disabled?: boolean,`);
        hasWroteDisableProp = true;
      }
    });
    if ((pressables == null ? void 0 : pressables.length) > 0) {
      flags.reactNativeTypes.GestureResponderEvent = true;
      pressables.forEach(([, , id]) => {
        writer.writeLine(`${id}?: (e: GestureResponderEvent) => void,`);
      });
    }
    if (isIcon) {
      writer.writeLine(`color?: string,`);
    }
    writer.writeLine(`testID?: string,`);
  });
  writer.blankLine();
}
var init_writeProps = __esm({
  "src/backend/generator/lib/writeProps.ts"() {
    init_string();
    init_lib2();
  }
});

// src/backend/generator/lib/writeState.ts
function writeState(writer, flags, data) {
  const state2 = getCollectionByName("State");
  if (!state2)
    return;
  const rootName = data.root.node.name;
  const rootPage = getPage(data.root.node);
  state2.variableIds.forEach((id) => {
    const variable = figma.variables.getVariableById(id);
    if (!variable)
      return;
    const [page, component, name] = variable.name.split("/");
    if (page !== rootPage.name || component !== rootName)
      return;
    const initValue = variable.valuesByMode[state2.defaultModeId];
    writer.writeLine(`const [${name}, set${titleCase(name)}] = useState(${initValue});`);
    flags.react.useState = true;
  });
}
var init_writeState = __esm({
  "src/backend/generator/lib/writeState.ts"() {
    init_string();
    init_lib2();
  }
});

// src/backend/generator/lib/writeFunction.ts
function writeFunction(writer, flags, data, settings) {
  var _a, _b, _c, _d, _e, _f, _g;
  const isVariant = !!data.root.node.variantProperties;
  const masterNode = isVariant ? (_a = data.root.node) == null ? void 0 : _a.parent : data.root.node;
  const propDefs = masterNode == null ? void 0 : masterNode.componentPropertyDefinitions;
  const name = createIdentifierPascal(masterNode.name);
  const isIcon = name.startsWith("Icon");
  const pressables = ((_c = (_b = data.root) == null ? void 0 : _b.click) == null ? void 0 : _c.type) === "URL" ? (_f = (_e = (_d = data.root.click.url) == null ? void 0 : _d.split(",")) == null ? void 0 : _e.map((s) => {
    var _a2;
    return (_a2 = s == null ? void 0 : s.trim()) == null ? void 0 : _a2.split("#");
  })) == null ? void 0 : _f.map(([prop, label]) => {
    const id = createIdentifierCamel(
      label && label !== "root" && prop === "onPress" ? `${prop}_${label}` : prop
    );
    return [prop, label, id];
  }) : null;
  const isRootPressable = pressables !== null && pressables.find((e) => e[1] === "root" || !e[1]) !== void 0;
  writeProps(writer, flags, propDefs, name, pressables, isIcon, isRootPressable);
  if (masterNode.description) {
    writer.writeLine(`/**`);
    masterNode.description.split("\n").forEach((line) => {
      writer.writeLine(` * ${line.trim()}`);
    });
    if (((_g = masterNode == null ? void 0 : masterNode.documentationLinks) == null ? void 0 : _g.length) > 0) {
      writer.writeLine(` * @link ${masterNode.documentationLinks[0].uri}`);
    }
    writer.writeLine(` */`);
  }
  const getStylePrefix = (slug) => (data == null ? void 0 : data.variants) && Object.keys(data.variants.classes).includes(slug) ? "classes" : "styles";
  writer.write(`export function ${name}(props: ${name}Props)`).block(() => {
    writeState(writer, flags, data);
    flags.unistyles.useStyles = true;
    writer.writeLine(`const {styles, theme} = useStyles(stylesheet);`);
    writer.blankLine();
    if (isVariant && (data == null ? void 0 : data.variants)) {
      if (Object.keys(data.variants.classes).length > 0)
        writeClasses(writer, flags, data, isRootPressable);
      if (Object.keys(data.variants.fills).length > 0)
        writeColors(writer, flags, data, isRootPressable);
    }
    writer.write(`return (`).indent(() => {
      var _a2;
      const pressId = isRootPressable && ((_a2 = pressables == null ? void 0 : pressables.find((e) => e[1] === "root" || !e[1])) == null ? void 0 : _a2[2]);
      const rootTag = isRootPressable ? "Pressable" : "View";
      const rootStyle = ` style={${getStylePrefix("root")}.root}`;
      const rootTestID = ` testID={props.testID}`;
      const rootProps = isRootPressable ? ` onPress={props.${pressId}} disabled={_stateDisabled}` : "";
      flags.reactNative[rootTag] = true;
      if (isRootPressable)
        flags.reactNativeTypes.PressableStateCallbackType = true;
      writer.write("<" + rootTag + rootStyle + rootProps + rootTestID + ">").indent(() => {
        writer.conditionalWriteLine(isRootPressable, `{(e: PressableStateCallbackType) => <>`);
        writer.withIndentationLevel((isRootPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
          writeChildren(
            writer,
            flags,
            data,
            settings,
            data.tree,
            getStylePrefix,
            pressables
          );
        });
        writer.conditionalWriteLine(isRootPressable, `</>}`);
      });
      writer.writeLine(`</${rootTag}>`);
    });
    writer.writeLine(");");
  });
  writer.blankLine();
  return flags;
}
var init_writeFunction = __esm({
  "src/backend/generator/lib/writeFunction.ts"() {
    init_string();
    init_writeChildren();
    init_writeClasses();
    init_writeColors();
    init_writeProps();
    init_writeState();
  }
});

// src/backend/generator/lib/writeStyleSheet.ts
function writeStyleSheet(writer, flags, data) {
  flags.unistyles.createStyleSheet = true;
  writer.write(`const stylesheet = createStyleSheet(theme => (`).inlineBlock(() => {
    var _a, _b, _c;
    writeStyle(writer, "root", data.stylesheet[data.root.node.id]);
    const rootVariants = (_b = (_a = data.variants) == null ? void 0 : _a.classes) == null ? void 0 : _b.root;
    if (rootVariants) {
      Object.keys(rootVariants).forEach((key) => {
        const classKey = rootVariants[key];
        const classStyle = data.stylesheet[classKey];
        if (classStyle) {
          const className = createIdentifierCamel(`root_${key}`.split(", ").join("_"));
          writeStyle(writer, className, classStyle);
        }
      });
    }
    for (const child of data.children) {
      const childStyles = data.stylesheet[child.node.id];
      if (childStyles) {
        writeStyle(writer, child.slug, childStyles);
        const childVariants = (_c = data.variants) == null ? void 0 : _c.classes[child.slug];
        if (childVariants) {
          Object.keys(childVariants).forEach((key) => {
            const classStyle = data.stylesheet[childVariants[key]];
            if (classStyle) {
              const className = createIdentifierCamel(`${child.slug}_${key}`.split(", ").join("_"));
              writeStyle(writer, className, classStyle);
            }
          });
        }
      }
    }
  });
  writer.write("));");
  writer.newLine();
  writer.blankLine();
  return flags;
}
function writeStyle(writer, slug, styles) {
  const props2 = styles && Object.keys(styles);
  if (props2.length > 0) {
    writeProps2(props2, writer, slug, styles);
  }
}
function writeProps2(props2, writer, slug, styles) {
  writer.write(`${slug}: {`).indent(() => {
    props2.forEach((prop) => {
      writeProp(prop, styles[prop], writer);
    });
  });
  writer.writeLine("},");
}
function writeProp(prop, value, writer) {
  if (prop === "border") {
    if (Array.isArray(value)) {
      const [width, style, color] = value;
      const colorVal = (color == null ? void 0 : color.type) === "runtime" && (color == null ? void 0 : color.name) === "var" ? `theme.colors.${createIdentifierCamel(color.arguments[0])}` : color;
      writer.writeLine(`borderWidth: ${width},`);
      writer.write(`borderStyle: `);
      writer.quote(style);
      writer.write(",");
      writer.writeLine(`borderColor: ${colorVal},`);
    } else {
      writer.writeLine(`borderWidth: 'unset' as any,`);
      writer.writeLine(`borderStyle: 'unset' as any,`);
      writer.writeLine(`borderColor: 'unset' as any,`);
    }
  } else {
    writer.write(`${prop}: `);
    if (typeof value === "undefined" || value === "unset") {
      writer.quote("unset");
      writer.write(" as any");
    } else if (typeof value === "number") {
      writer.write(
        Number.isInteger(value) ? value.toString() : parseFloat(value.toFixed(5)).toString()
      );
    } else if (typeof value === "string" && value.startsWith("theme.")) {
      writer.write(value);
    } else if ((value == null ? void 0 : value.type) === "runtime" && (value == null ? void 0 : value.name) === "var") {
      writer.write("theme.colors." + createIdentifierCamel(value.arguments[0]));
    } else if (typeof value === "string") {
      writer.quote(value);
    } else {
      writer.write(JSON.stringify(value));
    }
    writer.write(",");
    writer.newLine();
  }
}
var init_writeStyleSheet = __esm({
  "src/backend/generator/lib/writeStyleSheet.ts"() {
    init_string();
  }
});

// src/backend/generator/generateCode.ts
function generateCode(data, settings) {
  const head = new CodeBlockWriter(settings == null ? void 0 : settings.writer);
  const body = new CodeBlockWriter(settings == null ? void 0 : settings.writer);
  const flags = {
    exo: {},
    lingui: {},
    unistyles: {},
    react: {},
    reactNative: {},
    reactNativeTypes: {}
  };
  writeFunction(body, flags, data, settings);
  writeStyleSheet(body, flags, data);
  writeImports(head, flags, data);
  return head.toString() + body.toString();
}
var init_generateCode = __esm({
  "src/backend/generator/generateCode.ts"() {
    init_mod();
    init_writeImports();
    init_writeFunction();
    init_writeStyleSheet();
  }
});

// src/backend/generator/generateStory.ts
function generateStory(target, isVariant, props2, settings) {
  const writer = new CodeBlockWriter(settings == null ? void 0 : settings.writer);
  const masterNode = isVariant ? target.parent : target;
  const componentName = createIdentifierPascal(masterNode.name);
  const componentProps = props2 ? Object.entries(props2) : [];
  writer.write(`import {${componentName} as Component} from`);
  writer.space();
  writer.quote(`components/${componentName}`);
  writer.write(";");
  writer.newLine();
  const components = [];
  componentProps == null ? void 0 : componentProps.sort(sortProps).forEach(([_key, prop]) => {
    const { type, value, defaultValue } = prop;
    if (type === "INSTANCE_SWAP") {
      const component = figma.getNodeById(value || defaultValue);
      components.push(component);
    }
  });
  if (components.length > 0) {
    components.forEach((component) => {
      const name = createIdentifierPascal(component.name);
      writer.write(`import {${name}} from`);
      writer.space();
      writer.quote(`components/${name}`);
      writer.write(";");
      writer.newLine();
    });
  }
  writer.write("import type {StoryObj, Meta} from");
  writer.space();
  writer.quote("@storybook/react");
  writer.write(";");
  writer.newLine();
  writer.blankLine();
  writer.writeLine("type Story = StoryObj<typeof Component>;");
  writer.blankLine();
  writer.write("const meta: Meta<typeof Component> = ").inlineBlock(() => {
    writer.write("title:");
    writer.space();
    writer.quote(isVariant ? target.parent.name : target.name);
    writer.write(",");
    writer.newLine();
    writer.writeLine("component: Component,");
  });
  writer.write(";");
  writer.blankLine();
  if (!isVariant) {
    writer.write(`export const ${componentName}: Story = `).inlineBlock(() => {
      if (componentProps.length > 0) {
        writer.write("args: ").inlineBlock(() => {
          componentProps.sort(sortProps).forEach(([key, prop]) => {
            const { type, value, defaultValue } = prop;
            const name = getPropName(key);
            const val = value || defaultValue;
            if (type === "TEXT" || type === "VARIANT") {
              writer.write(`${name}:`);
              writer.space();
              writer.quote(val);
              writer.write(",");
              writer.newLine();
            } else if (type === "INSTANCE_SWAP") {
              const component = figma.getNodeById(val);
              const tagName = "<" + (createIdentifierPascal(component.name) || "View") + "/>";
              writer.writeLine(`${name}: ${tagName},`);
            } else {
              writer.writeLine(`${name}: ${val},`);
            }
          });
        });
        writer.write(",");
      } else {
        writer.writeLine("// ...");
      }
    });
    writer.write(";");
    writer.blankLine();
  } else {
    target.parent.children.forEach((child) => {
      const name = createIdentifierPascal(child.name.split(", ").map((n) => n.split("=").pop()).join(""));
      const props3 = componentProps == null ? void 0 : componentProps.sort(sortProps);
      writer.write(`export const ${name}: Story = `).inlineBlock(() => {
        writer.write("args: ").inlineBlock(() => {
          props3.forEach(([key, prop]) => {
            const { type, defaultValue } = prop;
            const propName = getPropName(key);
            if (type === "TEXT") {
              writer.write(`${propName}:`);
              writer.space();
              writer.quote(defaultValue);
              writer.write(",");
              writer.newLine();
            } else if (type === "VARIANT") {
              writer.write(`${propName}:`);
              writer.space();
              writer.quote(name);
              writer.write(",");
              writer.newLine();
            } else if (type === "INSTANCE_SWAP") {
              const component = figma.getNodeById(defaultValue);
              const tagName = "<" + (createIdentifierPascal(component.name) || "View") + "/>";
              writer.writeLine(`${propName}: ${tagName},`);
            } else {
              writer.writeLine(`${propName}: ${defaultValue.toString() || ""},`);
            }
          });
        });
        writer.write(",");
      });
      writer.write(";");
      writer.blankLine();
    });
  }
  writer.writeLine("export default meta;");
  return writer.toString();
}
var init_generateStory = __esm({
  "src/backend/generator/generateStory.ts"() {
    init_mod();
    init_lib2();
    init_string();
  }
});

// src/backend/generator/generateData.ts
async function generateData(target, settings) {
  var _a, _b;
  if (!target) {
    return emptyBundle;
  }
  const isExo = ((_a = getPage(target)) == null ? void 0 : _a.name) === "Primitives";
  const exo = generatePrimitives();
  if (isExo && exo[target.name]) {
    return __spreadProps(__spreadValues({}, emptyBundle), {
      id: target.id,
      page: "Primitives",
      width: target.width,
      height: target.height,
      name: createIdentifierPascal(target.name),
      code: exo[target.name]
    });
  }
  const data = await parser_default(target);
  if (!data) {
    return emptyBundle;
  }
  const links = {};
  const isVariant = !!target.variantProperties;
  const masterNode = isVariant ? target == null ? void 0 : target.parent : target;
  const selectedVariant = isVariant ? masterNode.children.filter((n) => figma.currentPage.selection.includes(n)).pop() : void 0;
  const propDefs = masterNode == null ? void 0 : masterNode.componentPropertyDefinitions;
  if (selectedVariant) {
    Object.entries(selectedVariant == null ? void 0 : selectedVariant.variantProperties).forEach((v) => {
      propDefs[v[0]].defaultValue = v[1];
    });
  }
  links[createIdentifierPascal(masterNode.name)] = masterNode.id;
  Object.entries(data.meta.components).forEach((c) => {
    links[createIdentifierPascal(c[1][0].name)] = c[0];
  });
  const id = masterNode.id;
  const key = masterNode.key;
  const width = data.frame ? data.frame.node.width : data.root.node.width;
  const height = data.frame ? data.frame.node.height : data.root.node.height;
  const name = createIdentifierPascal(masterNode.name);
  const page = (_b = getPage(masterNode)) == null ? void 0 : _b.name;
  const props2 = getPropsJSX(__spreadValues({}, propDefs), data.colorsheet, data.meta.includes);
  const code = generateCode(data, settings);
  const index = generateIndex((/* @__PURE__ */ new Set()).add(name), settings);
  const story = generateStory(target, isVariant, propDefs, settings);
  const assets = Object.values(data.assetData);
  const icons = Array.from(data.meta.iconsUsed);
  return {
    id,
    key,
    name,
    page,
    props: props2,
    width,
    height,
    links,
    icons,
    assets,
    code,
    index,
    story
  };
}
var emptyBundle;
var init_generateData = __esm({
  "src/backend/generator/generateData.ts"() {
    init_parser();
    init_lib2();
    init_string();
    init_primitives();
    init_generateIndex();
    init_generateCode();
    init_generateStory();
    emptyBundle = {
      id: "",
      key: "",
      page: "",
      name: "",
      props: "",
      index: "",
      code: "",
      story: "",
      width: 0,
      height: 0,
      links: {},
      assets: null,
      icons: []
    };
  }
});

// src/backend/generator/generateTheme.ts
function generateTheme(settings) {
  const writer = new CodeBlockWriter(settings == null ? void 0 : settings.writer);
  const theme = getCollectionModes("Theme");
  let hasStyles = false;
  writer.write("export const breakpoints = ").inlineBlock(() => {
    writer.writeLine("xs: 0,");
    writer.writeLine("sm: 576,");
    writer.writeLine("md: 768,");
    writer.writeLine("lg: 992,");
    writer.writeLine("xl: 1200,");
  });
  writer.blankLine();
  writer.write("export const pallete = ").inlineBlock(() => {
    writeColorTokens(writer, getColorTokenVariables());
  });
  writer.blankLine();
  writer.write("export const themes = ").inlineBlock(() => {
    if (theme) {
      theme.modes.forEach((mode) => {
        writer.write(`${createIdentifierCamel(mode.name)}: `).inlineBlock(() => {
          hasStyles = writeThemeTokens(writer, getAllThemeTokens(mode.modeId));
        });
        writer.write(",");
        writer.newLine();
      });
    } else {
      writer.write(`main: `).inlineBlock(() => {
        hasStyles = writeThemeTokens(writer, getThemeTokenLocalStyles());
      });
      writer.write(",");
      writer.newLine();
    }
  });
  writer.blankLine();
  if (theme) {
    const initialTheme = createIdentifierCamel(theme.default.name);
    writer.writeLine(`export default '${initialTheme}'`);
  } else {
    writer.writeLine(`export default 'main'`);
  }
  return { code: writer.toString(), theme, hasStyles };
}
function writeColorTokens(writer, colors) {
  if (Object.keys(colors).length > 0) {
    Object.keys(colors).forEach((group) => {
      const groupId = createIdentifierCamel(group);
      const groupItem = colors[group];
      writeColorToken(writer, groupId, groupItem);
      writer.newLine();
    });
  } else {
    writer.write("// No color variables found");
  }
}
function writeColorToken(writer, name, color) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (color.comment)
    writer.writeLine(`/** ${color.comment} */`);
  writer.write(`${id}: `);
  writer.quote(color.value);
  writer.write(`,`);
}
function writeThemeTokens(writer, colors) {
  if (Object.keys(colors).length > 0) {
    writer.write("colors: ").inlineBlock(() => {
      Object.keys(colors).forEach((group) => {
        const groupId = createIdentifierCamel(group);
        const groupItem = colors[group];
        writeThemeToken(writer, groupId, groupItem);
        writer.newLine();
      });
    });
    writer.write(",");
    writer.newLine();
    return true;
  } else {
    writer.write("// No local color styles or color variables found");
    return false;
  }
}
function writeThemeToken(writer, name, color) {
  const needsPrefix = /^[0-9]/.test(name);
  const id = needsPrefix ? `$${name}` : name;
  if (color.comment)
    writer.writeLine(`/** ${color.comment} */`);
  writer.write(`${id}: `);
  if (color.value.startsWith("pallete.")) {
    writer.write(color.value);
  } else {
    writer.quote(color.value);
  }
  writer.write(`,`);
}
function getAllThemeTokens(themeId) {
  return __spreadValues(__spreadValues({}, getThemeTokenVariables(themeId)), getThemeTokenLocalStyles());
}
function getThemeTokenLocalStyles() {
  const colors = {};
  const styles = figma.getLocalPaintStyles();
  styles == null ? void 0 : styles.forEach((paint) => {
    var _a;
    colors[paint.name] = {
      // @ts-ignore (TODO: expect only solid paints to fix this)
      value: getColor(((_a = paint.paints[0]) == null ? void 0 : _a.color) || { r: 0, g: 0, b: 0 }),
      comment: paint.description
    };
  });
  return colors;
}
function getThemeTokenVariables(themeId) {
  var _a;
  const colors = {};
  const collection = (_a = figma.variables.getLocalVariableCollections()) == null ? void 0 : _a.find((c) => c.name === "Theme");
  if (!collection)
    return colors;
  collection.variableIds.map((id) => figma.variables.getVariableById(id)).filter((v) => v.resolvedType === "COLOR").forEach((v) => {
    const value = v.valuesByMode[themeId];
    if (!value && !value.id)
      return;
    const color = figma.variables.getVariableById(value.id);
    if (!color)
      return;
    colors[v.name] = {
      value: `pallete.${createIdentifierCamel(color.name)}`,
      comment: v.description
    };
  });
  return colors;
}
function getColorTokenVariables() {
  var _a;
  const colors = {};
  const collection = (_a = figma.variables.getLocalVariableCollections()) == null ? void 0 : _a.find((c) => c.name === "Colors");
  if (!collection)
    return colors;
  collection.variableIds.map((id) => figma.variables.getVariableById(id)).filter((v) => v.resolvedType === "COLOR").forEach((v) => {
    colors[v.name] = {
      value: getColor(v.valuesByMode[collection.defaultModeId]),
      comment: v.description
    };
  });
  return colors;
}
var init_generateTheme = __esm({
  "src/backend/generator/generateTheme.ts"() {
    init_mod();
    init_string();
    init_lib2();
  }
});

// src/backend/generator/index.ts
async function generateBundle(node, settings, skipCache) {
  if (!node)
    return;
  const instanceSettings = __spreadValues({}, settings);
  if (!skipCache) {
    if (_cache[node.key]) {
      return { bundle: _cache[node.key], cached: true };
    }
    const data = node.getSharedPluginData("f2rn", "data");
    if (data) {
      try {
        const bundle2 = JSON.parse(data);
        _cache[node.key] = bundle2;
        return { bundle: bundle2, cached: true };
      } catch (e) {
        console.error("Failed to parse cached bundle", node, e);
      }
    }
  }
  const bundle = await generateData(node, instanceSettings);
  _cache[node.key] = bundle;
  return { bundle, cached: false };
}
function watchTheme(settings) {
  const updateTheme = () => {
    const { code, theme, hasStyles } = generateTheme(settings);
    const currentTheme = (theme == null ? void 0 : theme.current) ? `${createIdentifierCamel(theme.current.name)}` : "main";
    emit("PROJECT_THEME", code, currentTheme, hasStyles);
  };
  setInterval(updateTheme, 300);
  updateTheme();
}
function watchIcons() {
  let _sets = /* @__PURE__ */ new Set();
  let _list = /* @__PURE__ */ new Set();
  let _map = /* @__PURE__ */ new Map();
  const updateIcons = () => {
    const icons = getAllIconComponents();
    const sets = new Set(icons == null ? void 0 : icons.map((i) => i.name.split(":")[0]));
    const list = new Set(icons == null ? void 0 : icons.map((i) => i.name));
    const map = new Map(icons == null ? void 0 : icons.map((i) => [i.name, i.id]));
    if (areMapsEqual(map, _map) && areSetsEqual(sets, _sets) && areSetsEqual(list, _list))
      return;
    _sets = sets;
    _list = list;
    _map = map;
    emit(
      "PROJECT_ICONS",
      Array.from(sets),
      Array.from(list),
      Object.fromEntries(map)
    );
  };
  setInterval(updateIcons, 500);
  updateIcons();
}
async function watchVariantSelect() {
  figma.on("selectionchange", () => {
    if (!figma.currentPage.selection.length)
      return;
    const selection = figma.currentPage.selection[0];
    let target = selection;
    while (target.type !== "COMPONENT" && target.parent.type !== "PAGE")
      target = target.parent;
    if ((target == null ? void 0 : target.type) !== "COMPONENT")
      return;
    const name = target.parent.name;
    const variantProperties = target == null ? void 0 : target.variantProperties;
    emit("SELECT_VARIANT", name, variantProperties);
    return;
  });
}
async function watchComponents() {
  figma.on("documentchange", async (e) => {
    const all = getComponentTargets(figma.root.findAllWithCriteria({ types: ["COMPONENT"] }));
    if (all.size === 0)
      return;
    const updates = [];
    e.documentChanges.forEach((change) => {
      if (change.type !== "CREATE" && change.type !== "PROPERTY_CHANGE")
        return;
      if (change.type === "PROPERTY_CHANGE" && change.properties.includes("pluginData"))
        return;
      if (change.node.type === "COMPONENT") {
        updates.push(change.node);
      } else {
        const target = getComponentTarget(change.node);
        if (target) {
          updates.push(target);
        }
      }
    });
    if (updates.length === 0)
      return;
    const update2 = getComponentTargets(updates);
    await compile(all, true, update2);
  });
}
async function loadComponents(targetComponent) {
  const all = getComponentTargets(figma.root.findAllWithCriteria({ types: ["COMPONENT"] }));
  if (all.size > 0) {
    const cached = await compile(all);
    if (cached) {
      targetComponent();
      await compile(all, true);
    }
  }
}
async function compile(components, skipCache, updated) {
  var _a;
  const _names = /* @__PURE__ */ new Set();
  const _icons = /* @__PURE__ */ new Set();
  const _assets = {};
  const _roster = {};
  let _links = {};
  let _total = 0;
  let _loaded = 0;
  let _cached = false;
  try {
    for (var iter = __forAwait(components), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
      const component = temp.value;
      const isVariant = !!component.variantProperties;
      const masterNode = isVariant ? component == null ? void 0 : component.parent : component;
      const imageExport = false;
      const preview = imageExport ? `data:image/png;base64,${figma.base64Encode(imageExport)}` : "";
      const name = createIdentifierPascal(masterNode.name);
      const page = getPage(masterNode).name;
      const key = masterNode.key;
      const id = masterNode.id;
      _total++;
      _names.add(name);
      _roster[key] = {
        id,
        key,
        name,
        page,
        preview,
        loading: !skipCache
      };
    }
  } catch (temp) {
    error = [temp];
  } finally {
    try {
      more && (temp = iter.return) && await temp.call(iter);
    } finally {
      if (error)
        throw error[0];
    }
  }
  const index = generateIndex(_names, state, true);
  const targets = updated || components;
  try {
    for (var iter2 = __forAwait(targets), more2, temp2, error2; more2 = !(temp2 = await iter2.next()).done; more2 = false) {
      const component = temp2.value;
      wait(1);
      try {
        const { bundle, cached } = await generateBundle(component, state, skipCache);
        const { id, key, page, name, links, icons, assets } = bundle;
        const pages = (_a = figma.root.children) == null ? void 0 : _a.map((p) => p.name);
        _loaded++;
        _cached = cached;
        _links = __spreadValues(__spreadValues({}, _links), links);
        _cache[component.id] = bundle;
        _roster[key] = __spreadProps(__spreadValues({}, _roster[name]), {
          id,
          name,
          page,
          loading: false
        });
        icons == null ? void 0 : icons.forEach((icon) => {
          _icons.add(icon);
        });
        assets == null ? void 0 : assets.forEach((asset) => {
          _assets[asset.hash] = asset;
        });
        component.setSharedPluginData("f2rn", "data", JSON.stringify(bundle));
        emit("COMPONENT_BUILD", {
          index,
          pages,
          links: _links,
          total: _total,
          loaded: _loaded,
          roster: _roster,
          assets: _assets,
          icons: Array.from(_icons),
          assetMap: {}
        }, bundle);
      } catch (e) {
        console.error("Failed to export", component, e);
      }
    }
  } catch (temp2) {
    error2 = [temp2];
  } finally {
    try {
      more2 && (temp2 = iter2.return) && await temp2.call(iter2);
    } finally {
      if (error2)
        throw error2[0];
    }
  }
  return _cached;
}
var _cache;
var init_generator = __esm({
  "src/backend/generator/index.ts"() {
    init_lib();
    init_icons();
    init_lib2();
    init_string();
    init_assert();
    init_delay();
    init_config();
    init_generateData();
    init_generateCode();
    init_generateIndex();
    init_generateStory();
    init_generateTheme();
    _cache = {};
  }
});

// src/backend/app.ts
async function loadCurrentPage() {
  try {
    return await figma.clientStorage.getAsync(F2RN_NAVIGATE_NS);
  } catch (e) {
    return null;
  }
}
async function saveCurrentPage(page) {
  try {
    return figma.clientStorage.setAsync(F2RN_NAVIGATE_NS, page);
  } catch (e) {
    return false;
  }
}
function targetSelectedComponent() {
  const component = getSelectedComponent();
  if (!component)
    return;
  const isVariant = !!component.variantProperties;
  const masterNode = isVariant ? component == null ? void 0 : component.parent : component;
  emit("SELECT_COMPONENT", masterNode.key);
}
var init_app = __esm({
  "src/backend/app.ts"() {
    init_lib();
    init_lib2();
    init_env();
  }
});

// src/backend/exo.ts
async function importComponents(iconSet) {
  let common = figma.root.children.find((p) => p.name === "Common");
  if (!common) {
    common = figma.createPage();
    common.name = "Common";
    figma.root.appendChild(common);
  } else {
    common.children.forEach((c) => c.remove());
  }
  let primitives = figma.root.children.find((p) => p.name === "Primitives");
  if (!primitives) {
    primitives = figma.createPage();
    primitives.name = "Primitives";
    figma.root.appendChild(primitives);
  } else {
    primitives.children.forEach((c) => c.remove());
  }
  figma.notify(`Importing EXO components...`, {
    timeout: 3e3,
    button: {
      text: "View",
      action: () => focusNode(common.id)
    }
  });
  const icons = getIconComponentMap();
  const variables = figma.variables.getLocalVariables();
  await createComponents(primitives, iconSet, icons, variables, EXO_PRIMITIVES);
  await createComponents(common, iconSet, icons, variables, EXO_COMPONENTS);
}
async function createComponents(root, iconSet, icons, variables, exoComponents) {
  try {
    for (var iter2 = __forAwait(Object.entries(exoComponents)), more2, temp2, error2; more2 = !(temp2 = await iter2.next()).done; more2 = false) {
      const [sectionName, components] = temp2.value;
      const background = variables.find((v) => v.name === "background");
      const section = figma.createSection();
      section.name = sectionName;
      section.x = components.rect.x;
      section.y = components.rect.y;
      section.resizeWithoutConstraints(components.rect.width, components.rect.height);
      try {
        section.devStatus = { type: "READY_FOR_DEV" };
      } catch (err) {
      }
      if (background) {
        const fills = section.fills !== figma.mixed ? __spreadValues({}, section.fills) : {};
        fills[0] = figma.variables.setBoundVariableForPaint(fills[0], "color", background);
        section.fills = [fills[0]];
      }
      try {
        for (var iter = __forAwait(Object.values(components.list)), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
          const [key, isComponentSet, x, y] = temp.value;
          const origin = isComponentSet ? await figma.importComponentSetByKeyAsync(key) : await figma.importComponentByKeyAsync(key);
          const local = origin.clone();
          replaceComponentSwaps(local, iconSet, icons);
          replaceBoundVariables(local, variables);
          if (isComponentSet) {
            local.x = x;
            local.y = y;
            section.appendChild(local);
          } else {
            const frame = figma.createFrame();
            frame.x = x;
            frame.y = y;
            frame.name = `[${local.name}]`;
            frame.layoutMode = "HORIZONTAL";
            frame.layoutPositioning = "AUTO";
            frame.layoutSizingVertical = "FIXED";
            frame.layoutSizingHorizontal = "FIXED";
            frame.resize(local.width, local.height);
            frame.appendChild(local);
            section.appendChild(frame);
          }
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && await temp.call(iter);
        } finally {
          if (error)
            throw error[0];
        }
      }
      root.appendChild(section);
    }
  } catch (temp2) {
    error2 = [temp2];
  } finally {
    try {
      more2 && (temp2 = iter2.return) && await temp2.call(iter2);
    } finally {
      if (error2)
        throw error2[0];
    }
  }
}
function replaceComponentSwaps(component, iconSet, icons) {
  for (const [prop, value] of Object.entries(component.componentPropertyDefinitions)) {
    if (value.type !== "INSTANCE_SWAP")
      continue;
    if (typeof value.defaultValue !== "string")
      continue;
    const originNode = figma.getNodeById(value.defaultValue);
    if (isNodeIcon(originNode))
      continue;
    const [originSet, originName] = originNode.name.split(":");
    const uriOrigin = `${originSet}:${originName}`;
    const uriLocal = `${iconSet}:${originName}`;
    const iconLocal = figma.getNodeById(icons[uriLocal]);
    const iconNode = iconLocal || figma.getNodeById(icons[uriOrigin]);
    if (!iconNode)
      continue;
    const instances = component.findAllWithCriteria({ types: ["INSTANCE"] });
    const iconInstances = instances.filter((i) => i.componentPropertyReferences.mainComponent === prop);
    iconInstances.forEach((instance) => {
      instance.swapComponent(iconNode);
    });
  }
}
function replaceBoundVariables(component, variables) {
  const children = component.findAll();
  const nodes = [component, ...children];
  for (const node of nodes) {
    const vars = node.boundVariables || node.inferredVariables;
    if (!vars)
      continue;
    for (const [key, value] of Object.entries(vars)) {
      if (value instanceof Array) {
        for (const v of value) {
          if (v.type === "VARIABLE_ALIAS") {
            const origin = figma.variables.getVariableById(v.id);
            const local = variables.find((v2) => v2.name === origin.name);
            if (local) {
              if (key === "fills") {
                const fills = node.fills !== figma.mixed ? [...node.fills] : [];
                const last = fills.length - 1;
                fills[last] = figma.variables.setBoundVariableForPaint(fills[last], "color", local);
                node.fills = [fills[last]];
              } else if (key === "strokes") {
                const strokes = node.strokes ? [...node.strokes] : [];
                const last = strokes.length - 1;
                strokes[last] = figma.variables.setBoundVariableForPaint(strokes[last], "color", local);
                node.strokes = [strokes[last]];
              } else {
                node.setBoundVariable(key, local.id);
              }
            }
          }
        }
      }
    }
  }
}
var EXO_COMPONENTS, EXO_PRIMITIVES;
var init_exo = __esm({
  "src/backend/exo.ts"() {
    init_lib2();
    init_icons();
    EXO_COMPONENTS = {
      Controls: {
        rect: { x: 0, y: 0, width: 745, height: 414 },
        list: {
          Button: ["e4b4b352052ba71c847b20b49d9e88a0093d4449", true, 100, 100]
        }
      },
      Popovers: {
        rect: { x: 845, y: 0, width: 562, height: 670 },
        list: {
          Prompt: ["9261d5fed575a841eefc0de81b039814ef81b3ae", false, 100, 100],
          HoverCard: ["172abba0061738f4b1c69e85ef956603b4cdd5c4", false, 100, 400]
        }
      },
      Layout: {
        rect: { x: 1507, y: 0, width: 558, height: 400 },
        list: {
          Placeholder: ["5863ef713ca50d36c7f32f8d1f33335d7f9eb552", false, 100, 100]
        }
      }
    };
    EXO_PRIMITIVES = {
      Controls: {
        rect: { x: 0, y: 0, width: 673, height: 624 },
        list: {
          Slider: ["35f02e59aa82623edd3e65a47ae53d0d8c93b190", false, 100, 100]
        }
      }
    };
  }
});

// src/backend/drop.ts
function importNode(event) {
  const item = event.items[0];
  if ((item == null ? void 0 : item.type) !== "figma/node-id")
    return true;
  try {
    const target = event.node;
    const node = figma.getNodeById(item.data);
    const master = node.type === "COMPONENT_SET" ? node.defaultVariant : node;
    if (master.type === "COMPONENT") {
      const instance = master.createInstance();
      target.appendChild(instance);
      instance.x = event.absoluteX;
      instance.y = event.absoluteY;
      figma.currentPage.selection = [instance];
    }
  } catch (e) {
    console.log("[importNode/error]", e);
  }
  return false;
}
var init_drop = __esm({
  "src/backend/drop.ts"() {
  }
});

// src/backend/themes.ts
async function importTheme(color, radius) {
  const preset = getPresetTokens(color);
  createTheme(preset);
  figma.notify(`${titleCase(color)} theme created`, {
    timeout: 3e3
    /*button: {
      text: 'View',
      action: () => focusNode(frame.id),
    }*/
  });
}
function createTheme(preset) {
  try {
    return createVariableTheme(preset);
  } catch (e) {
    return createLocalStylesTheme(preset);
  }
}
function createLocalStylesTheme(preset) {
  var _a;
  const styles = {};
  const existingStyles = figma.getLocalPaintStyles();
  (_a = Object.entries(preset.modes.light)) == null ? void 0 : _a.forEach(([name, token]) => {
    let style = existingStyles.find((s) => s.name === name);
    const color = preset.colors[token];
    if (!style && color) {
      style = figma.createPaintStyle();
      style.name = name;
      style.paints = [{ color, type: "SOLID" }];
    }
  });
  return { styles, isVariable: false };
}
function createVariableTheme(preset) {
  var _a, _b;
  const themeVariables = {};
  const colorVariables = {};
  const createdThemeVars = {};
  let theme = (_a = figma.variables.getLocalVariableCollections()) == null ? void 0 : _a.find((c) => c.name === "Theme");
  let colors = (_b = figma.variables.getLocalVariableCollections()) == null ? void 0 : _b.find((c) => c.name === "Colors");
  if (!theme) {
    try {
      theme = figma.variables.createVariableCollection("Theme");
    } catch (e) {
      throw new Error(e);
    }
  } else {
    const themeVars = theme.variableIds.map((id) => figma.variables.getVariableById(id));
    const presetVars2 = Object.keys(colorMapping.light);
    for (const themeVar of themeVars) {
      if (presetVars2.includes(themeVar.name))
        themeVariables[themeVar.name] = themeVar;
    }
  }
  if (!colors) {
    try {
      colors = figma.variables.createVariableCollection("Colors");
      colors.renameMode(colors.defaultModeId, "Default");
    } catch (e) {
      throw new Error(e);
    }
  }
  const colorVars = colors.variableIds.map((id) => figma.variables.getVariableById(id));
  const presetVars = Object.keys(preset.colors);
  for (const colorVar of colorVars) {
    if (presetVars.includes(colorVar.name))
      colorVariables[colorVar.name] = colorVar;
  }
  try {
    if (theme.modes.length === 1) {
      theme.addMode("Dark");
      theme.renameMode(theme.defaultModeId, "Light");
    }
  } catch (e) {
    theme.renameMode(theme.defaultModeId, "Main");
    console.log("Could not add dark mode", e);
  }
  for (const name of Object.keys(preset.modes.light)) {
    if (!themeVariables[name]) {
      try {
        themeVariables[name] = figma.variables.createVariable(name, theme.id, "COLOR");
        createdThemeVars[name] = true;
      } catch (e) {
        throw new Error(e);
      }
    }
  }
  for (const [name, rgb] of Object.entries(preset.colors)) {
    if (!colorVariables[name]) {
      try {
        const colorVar = figma.variables.createVariable(name, colors.id, "COLOR");
        colorVar.setValueForMode(colors.defaultModeId, rgb);
        colorVariables[name] = colorVar;
      } catch (e) {
        throw new Error(e);
      }
    }
  }
  if (Object.keys(createdThemeVars).length > 0) {
    theme.modes.forEach(({ modeId }) => {
      var _a2;
      const isDefault = modeId === theme.defaultModeId;
      const modeType = isDefault ? "light" : "dark";
      (_a2 = Object.entries(preset.modes[modeType])) == null ? void 0 : _a2.forEach(([name, token]) => {
        const variable = themeVariables[name];
        variable.setValueForMode(modeId, {
          id: colorVariables[token].id,
          type: "VARIABLE_ALIAS"
        });
      });
    });
  }
  return {
    themeVariables,
    colorVariables,
    isVariable: true
  };
}
function getPresetTokens(color) {
  const tokens = { colors: {}, modes: { light: {}, dark: {} } };
  tokens.colors.white = { r: 1, g: 1, b: 1 };
  tokens.colors.black = { r: 0, g: 0, b: 0 };
  Object.entries(colorPresets).forEach(([colorName, colorScale]) => {
    for (const { scale, hex } of colorScale) {
      if (hex) {
        tokens.colors[`${colorName}/${scale}`] = figma.util.rgb(hex);
      }
    }
  });
  for (const [name, token] of Object.entries(colorMapping.light))
    tokens.modes.light[name] = token.replace("{{base}}", color);
  for (const [name, token] of Object.entries(colorMapping.dark))
    tokens.modes.dark[name] = token.replace("{{base}}", color);
  return tokens;
}
var colorMapping, colorPresets;
var init_themes = __esm({
  "src/backend/themes.ts"() {
    init_string();
    colorMapping = {
      light: {
        background: "white",
        foreground: "{{base}}/950",
        card: "white",
        cardForeground: "{{base}}/950",
        popover: "white",
        popoverForeground: "{{base}}/950",
        primary: "{{base}}/900",
        primaryForeground: "{{base}}/50",
        secondary: "{{base}}/100",
        secondaryForeground: "{{base}}/900",
        muted: "{{base}}/100",
        mutedForeground: "{{base}}/500",
        accent: "{{base}}/100",
        accentForeground: "{{base}}/900",
        destructive: "red/500",
        destructiveForeground: "{{base}}/50",
        border: "{{base}}/200",
        input: "{{base}}/200",
        ring: "{{base}}/950"
      },
      dark: {
        background: "{{base}}/950",
        foreground: "{{base}}/50",
        card: "{{base}}/950",
        cardForeground: "{{base}}/50",
        popover: "{{base}}/950",
        popoverForeground: "{{base}}/50",
        primary: "{{base}}/50",
        primaryForeground: "{{base}}/900",
        secondary: "{{base}}/800",
        secondaryForeground: "{{base}}/50",
        muted: "{{base}}/800",
        mutedForeground: "{{base}}/400",
        accent: "{{base}}/800",
        accentForeground: "{{base}}/50",
        destructive: "red/900",
        destructiveForeground: "{{base}}/50",
        border: "{{base}}/800",
        input: "{{base}}/800",
        ring: "{{base}}/300"
      }
    };
    colorPresets = {
      slate: [
        { scale: 50, hex: "#f8fafc" },
        { scale: 100, hex: "#f1f5f9" },
        { scale: 200, hex: "#e2e8f0" },
        { scale: 300, hex: "#cbd5e1" },
        { scale: 400, hex: "#94a3b8" },
        { scale: 500, hex: "#64748b" },
        { scale: 600, hex: "#475569" },
        { scale: 700, hex: "#334155" },
        { scale: 800, hex: "#1e293b" },
        { scale: 900, hex: "#0f172a" },
        { scale: 950, hex: "#020617" }
      ],
      gray: [
        { scale: 50, hex: "#f9fafb" },
        { scale: 100, hex: "#f3f4f6" },
        { scale: 200, hex: "#e5e7eb" },
        { scale: 300, hex: "#d1d5db" },
        { scale: 400, hex: "#9ca3af" },
        { scale: 500, hex: "#6b7280" },
        { scale: 600, hex: "#4b5563" },
        { scale: 700, hex: "#374151" },
        { scale: 800, hex: "#1f2937" },
        { scale: 900, hex: "#111827" },
        { scale: 950, hex: "#030712" }
      ],
      zinc: [
        { scale: 50, hex: "#fafafa" },
        { scale: 100, hex: "#f4f4f5" },
        { scale: 200, hex: "#e4e4e7" },
        { scale: 300, hex: "#d4d4d8" },
        { scale: 400, hex: "#a1a1aa" },
        { scale: 500, hex: "#71717a" },
        { scale: 600, hex: "#52525b" },
        { scale: 700, hex: "#3f3f46" },
        { scale: 800, hex: "#27272a" },
        { scale: 900, hex: "#18181b" },
        { scale: 950, hex: "#09090b" }
      ],
      neutral: [
        { scale: 50, hex: "#fafafa" },
        { scale: 100, hex: "#f5f5f5" },
        { scale: 200, hex: "#e5e5e5" },
        { scale: 300, hex: "#d4d4d4" },
        { scale: 400, hex: "#a3a3a3" },
        { scale: 500, hex: "#737373" },
        { scale: 600, hex: "#525252" },
        { scale: 700, hex: "#404040" },
        { scale: 800, hex: "#262626" },
        { scale: 900, hex: "#171717" },
        { scale: 950, hex: "#0a0a0a" }
      ],
      stone: [
        { scale: 50, hex: "#fafaf9" },
        { scale: 100, hex: "#f5f5f4" },
        { scale: 200, hex: "#e7e5e4" },
        { scale: 300, hex: "#d6d3d1" },
        { scale: 400, hex: "#a8a29e" },
        { scale: 500, hex: "#78716c" },
        { scale: 600, hex: "#57534e" },
        { scale: 700, hex: "#44403c" },
        { scale: 800, hex: "#292524" },
        { scale: 900, hex: "#1c1917" },
        { scale: 950, hex: "#0c0a09" }
      ],
      red: [
        { scale: 50, hex: "#fef2f2" },
        { scale: 100, hex: "#fee2e2" },
        { scale: 200, hex: "#fecaca" },
        { scale: 300, hex: "#fca5a5" },
        { scale: 400, hex: "#f87171" },
        { scale: 500, hex: "#ef4444" },
        { scale: 600, hex: "#dc2626" },
        { scale: 700, hex: "#b91c1c" },
        { scale: 800, hex: "#991b1b" },
        { scale: 900, hex: "#7f1d1d" },
        { scale: 950, hex: "#450a0a" }
      ],
      orange: [
        { scale: 50, hex: "#fff7ed" },
        { scale: 100, hex: "#ffedd5" },
        { scale: 200, hex: "#fed7aa" },
        { scale: 300, hex: "#fdba74" },
        { scale: 400, hex: "#fb923c" },
        { scale: 500, hex: "#f97316" },
        { scale: 600, hex: "#ea580c" },
        { scale: 700, hex: "#c2410c" },
        { scale: 800, hex: "#9a3412" },
        { scale: 900, hex: "#7c2d12" },
        { scale: 950, hex: "#431407" }
      ],
      amber: [
        { scale: 50, hex: "#fffbeb" },
        { scale: 100, hex: "#fef3c7" },
        { scale: 200, hex: "#fde68a" },
        { scale: 300, hex: "#fcd34d" },
        { scale: 400, hex: "#fbbf24" },
        { scale: 500, hex: "#f59e0b" },
        { scale: 600, hex: "#d97706" },
        { scale: 700, hex: "#b45309" },
        { scale: 800, hex: "#92400e" },
        { scale: 900, hex: "#78350f" },
        { scale: 950, hex: "#451a03" }
      ],
      yellow: [
        { scale: 50, hex: "#fefce8" },
        { scale: 100, hex: "#fef9c3" },
        { scale: 200, hex: "#fef08a" },
        { scale: 300, hex: "#fde047" },
        { scale: 400, hex: "#facc15" },
        { scale: 500, hex: "#eab308" },
        { scale: 600, hex: "#ca8a04" },
        { scale: 700, hex: "#a16207" },
        { scale: 800, hex: "#854d0e" },
        { scale: 900, hex: "#713f12" },
        { scale: 950, hex: "#422006" }
      ],
      lime: [
        { scale: 50, hex: "#f7fee7" },
        { scale: 100, hex: "#ecfccb" },
        { scale: 200, hex: "#d9f99d" },
        { scale: 300, hex: "#bef264" },
        { scale: 400, hex: "#a3e635" },
        { scale: 500, hex: "#84cc16" },
        { scale: 600, hex: "#65a30d" },
        { scale: 700, hex: "#4d7c0f" },
        { scale: 800, hex: "#3f6212" },
        { scale: 900, hex: "#365314" },
        { scale: 950, hex: "#1a2e05" }
      ],
      green: [
        { scale: 50, hex: "#f0fdf4" },
        { scale: 100, hex: "#dcfce7" },
        { scale: 200, hex: "#bbf7d0" },
        { scale: 300, hex: "#86efac" },
        { scale: 400, hex: "#4ade80" },
        { scale: 500, hex: "#22c55e" },
        { scale: 600, hex: "#16a34a" },
        { scale: 700, hex: "#15803d" },
        { scale: 800, hex: "#166534" },
        { scale: 900, hex: "#14532d" },
        { scale: 950, hex: "#052e16" }
      ],
      emerald: [
        { scale: 50, hex: "#ecfdf5" },
        { scale: 100, hex: "#d1fae5" },
        { scale: 200, hex: "#a7f3d0" },
        { scale: 300, hex: "#6ee7b7" },
        { scale: 400, hex: "#34d399" },
        { scale: 500, hex: "#10b981" },
        { scale: 600, hex: "#059669" },
        { scale: 700, hex: "#047857" },
        { scale: 800, hex: "#065f46" },
        { scale: 900, hex: "#064e3b" },
        { scale: 950, hex: "#022c22" }
      ],
      teal: [
        { scale: 50, hex: "#f0fdfa" },
        { scale: 100, hex: "#ccfbf1" },
        { scale: 200, hex: "#99f6e4" },
        { scale: 300, hex: "#5eead4" },
        { scale: 400, hex: "#2dd4bf" },
        { scale: 500, hex: "#14b8a6" },
        { scale: 600, hex: "#0d9488" },
        { scale: 700, hex: "#0f766e" },
        { scale: 800, hex: "#115e59" },
        { scale: 900, hex: "#134e4a" },
        { scale: 950, hex: "#042f2e" }
      ],
      cyan: [
        { scale: 50, hex: "#ecfeff" },
        { scale: 100, hex: "#cffafe" },
        { scale: 200, hex: "#a5f3fc" },
        { scale: 300, hex: "#67e8f9" },
        { scale: 400, hex: "#22d3ee" },
        { scale: 500, hex: "#06b6d4" },
        { scale: 600, hex: "#0891b2" },
        { scale: 700, hex: "#0e7490" },
        { scale: 800, hex: "#155e75" },
        { scale: 900, hex: "#164e63" },
        { scale: 950, hex: "#083344" }
      ],
      sky: [
        { scale: 50, hex: "#f0f9ff" },
        { scale: 100, hex: "#e0f2fe" },
        { scale: 200, hex: "#bae6fd" },
        { scale: 300, hex: "#7dd3fc" },
        { scale: 400, hex: "#38bdf8" },
        { scale: 500, hex: "#0ea5e9" },
        { scale: 600, hex: "#0284c7" },
        { scale: 700, hex: "#0369a1" },
        { scale: 800, hex: "#075985" },
        { scale: 900, hex: "#0c4a6e" },
        { scale: 950, hex: "#082f49" }
      ],
      blue: [
        { scale: 50, hex: "#eff6ff" },
        { scale: 100, hex: "#dbeafe" },
        { scale: 200, hex: "#bfdbfe" },
        { scale: 300, hex: "#93c5fd" },
        { scale: 400, hex: "#60a5fa" },
        { scale: 500, hex: "#3b82f6" },
        { scale: 600, hex: "#2563eb" },
        { scale: 700, hex: "#1d4ed8" },
        { scale: 800, hex: "#1e40af" },
        { scale: 900, hex: "#1e3a8a" },
        { scale: 950, hex: "#172554" }
      ],
      indigo: [
        { scale: 50, hex: "#eef2ff" },
        { scale: 100, hex: "#e0e7ff" },
        { scale: 200, hex: "#c7d2fe" },
        { scale: 300, hex: "#a5b4fc" },
        { scale: 400, hex: "#818cf8" },
        { scale: 500, hex: "#6366f1" },
        { scale: 600, hex: "#4f46e5" },
        { scale: 700, hex: "#4338ca" },
        { scale: 800, hex: "#3730a3" },
        { scale: 900, hex: "#312e81" },
        { scale: 950, hex: "#1e1b4b" }
      ],
      violet: [
        { scale: 50, hex: "#f5f3ff" },
        { scale: 100, hex: "#ede9fe" },
        { scale: 200, hex: "#ddd6fe" },
        { scale: 300, hex: "#c4b5fd" },
        { scale: 400, hex: "#a78bfa" },
        { scale: 500, hex: "#8b5cf6" },
        { scale: 600, hex: "#7c3aed" },
        { scale: 700, hex: "#6d28d9" },
        { scale: 800, hex: "#5b21b6" },
        { scale: 900, hex: "#4c1d95" },
        { scale: 950, hex: "#1e1b4b" }
      ],
      purple: [
        { scale: 50, hex: "#faf5ff" },
        { scale: 100, hex: "#f3e8ff" },
        { scale: 200, hex: "#e9d5ff" },
        { scale: 300, hex: "#d8b4fe" },
        { scale: 400, hex: "#c084fc" },
        { scale: 500, hex: "#a855f7" },
        { scale: 600, hex: "#9333ea" },
        { scale: 700, hex: "#7e22ce" },
        { scale: 800, hex: "#6b21a8" },
        { scale: 900, hex: "#581c87" },
        { scale: 950, hex: "#3b0764" }
      ],
      fuchsia: [
        { scale: 50, hex: "#fdf4ff" },
        { scale: 100, hex: "#fae8ff" },
        { scale: 200, hex: "#f5d0fe" },
        { scale: 300, hex: "#f0abfc" },
        { scale: 400, hex: "#e879f9" },
        { scale: 500, hex: "#d946ef" },
        { scale: 600, hex: "#c026d3" },
        { scale: 700, hex: "#a21caf" },
        { scale: 800, hex: "#86198f" },
        { scale: 900, hex: "#701a75" },
        { scale: 950, hex: "#4a044e" }
      ],
      pink: [
        { scale: 50, hex: "#fdf2f8" },
        { scale: 100, hex: "#fce7f3" },
        { scale: 200, hex: "#fbcfe8" },
        { scale: 300, hex: "#f9a8d4" },
        { scale: 400, hex: "#f472b6" },
        { scale: 500, hex: "#ec4899" },
        { scale: 600, hex: "#db2777" },
        { scale: 700, hex: "#be185d" },
        { scale: 800, hex: "#9d174d" },
        { scale: 900, hex: "#831843" },
        { scale: 950, hex: "#500724" }
      ],
      rose: [
        { scale: 50, hex: "#fff1f2" },
        { scale: 100, hex: "#ffe4e6" },
        { scale: 200, hex: "#fecdd3" },
        { scale: 300, hex: "#fda4af" },
        { scale: 400, hex: "#fb7185" },
        { scale: 500, hex: "#f43f5e" },
        { scale: 600, hex: "#e11d48" },
        { scale: 700, hex: "#be123c" },
        { scale: 800, hex: "#9f1239" },
        { scale: 900, hex: "#881337" },
        { scale: 950, hex: "#4c0519" }
      ]
    };
  }
});

// src/backend/codegen.ts
async function render(node) {
  if (!node || node.type !== "COMPONENT")
    return [];
  const { bundle } = await generateBundle(node, state);
  const { code } = generateTheme(state);
  return bundle.code ? [
    {
      language: "TYPESCRIPT",
      title: `${bundle.name}.tsx`,
      code: bundle.code
    },
    {
      language: "TYPESCRIPT",
      title: `${bundle.name}.story.tsx`,
      code: bundle.story
    },
    {
      language: "TYPESCRIPT",
      title: `theme.ts`,
      code
    }
  ] : [];
}
function handleConfigChange() {
  const settings = Object.entries(figma.codegen.preferences.customSettings);
  const newConfig = __spreadValues({}, state);
  let configChanged = false;
  settings.forEach(([key, value]) => {
    switch (key) {
      case "tab-size": {
        const newValue = parseInt(value, 10);
        if (newValue !== state.writer.indentNumberOfSpaces) {
          newConfig.writer.indentNumberOfSpaces = newValue;
          configChanged = true;
        }
        break;
      }
      case "quote-style": {
        const newValue = value === "single";
        if (newValue != state.writer.useSingleQuote) {
          newConfig.writer.useSingleQuote = newValue;
          configChanged = true;
        }
        break;
      }
      case "white-space": {
        const newValue = value === "tabs";
        if (newValue !== state.writer.useTabs) {
          newConfig.writer.useTabs = newValue;
          configChanged = true;
        }
        break;
      }
      case "translate": {
        const newValue = value === "on";
        if (newValue !== state.react.addTranslate) {
          newConfig.react.addTranslate = newValue;
          configChanged = true;
        }
        break;
      }
    }
  });
  if (configChanged) {
    update(newConfig, false);
  }
}
var init_codegen = __esm({
  "src/backend/codegen.ts"() {
    init_generator();
    init_config();
  }
});

// src/config/project.ts
var config, project_default;
var init_project = __esm({
  "src/config/project.ts"() {
    config = {
      method: "download",
      scope: "document",
      docKey: "",
      apiKey: "",
      packageName: "",
      packageVersion: "",
      includeAssets: true,
      enableAssetOptimizations: false,
      enableAutoTranslations: false
    };
    project_default = config;
  }
});

// src/backend/project.ts
function build(projectConfig) {
  const user2 = figma.currentUser;
  emit("PROJECT_CONFIG_LOAD", projectConfig);
  figma.root.setPluginData(F2RN_PROJECT_NS, JSON.stringify(__spreadProps(__spreadValues({}, projectConfig), {
    method: "download",
    scope: "document"
  })));
  let projectName = "Components";
  let exportNodes = /* @__PURE__ */ new Set();
  switch (projectConfig.scope) {
    case "document":
    case "page":
      const useDoc = projectConfig.scope === "document";
      const target = useDoc ? figma.root : figma.currentPage;
      projectName = useDoc ? figma.root.name : figma.currentPage.name;
      exportNodes = getComponentTargets(target.findAllWithCriteria({ types: ["COMPONENT"] }));
      break;
    case "selected":
      exportNodes = getComponentTargets(figma.currentPage.selection);
      break;
  }
  if (exportNodes.size > 0) {
    figma.notify(`Exporting ${exportNodes.size} component${exportNodes.size === 1 ? "" : "s"}\u2026`, { timeout: 3500 });
    setTimeout(async () => {
      var _a;
      const names = /* @__PURE__ */ new Set();
      const assets = /* @__PURE__ */ new Map();
      const buildAssets = [];
      const components = [];
      try {
        for (var iter = __forAwait(exportNodes), more, temp, error; more = !(temp = await iter.next()).done; more = false) {
          const component = temp.value;
          try {
            const { bundle } = await generateBundle(component, state);
            if (bundle.code) {
              (_a = bundle.assets) == null ? void 0 : _a.forEach((asset) => assets.set(asset.hash, asset));
              components.push([bundle.name, bundle.index, bundle.code, bundle.story]);
              names.add(bundle.name);
            }
          } catch (e) {
            console.error("Failed to export", component, e);
          }
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && await temp.call(iter);
        } finally {
          if (error)
            throw error[0];
        }
      }
      assets.forEach((asset) => buildAssets.push([
        asset.name,
        asset.isVector,
        asset.bytes
      ]));
      const build2 = {
        components,
        name: projectName,
        id: projectConfig.docKey,
        index: generateIndex(names, state, true),
        theme: generateTheme(state).code,
        assets: buildAssets
      };
      emit("PROJECT_BUILD", build2, projectConfig, user2);
    }, 500);
  } else {
    emit("PROJECT_BUILD", null, projectConfig, user2);
    figma.notify("No components found to export", { error: true });
  }
}
function loadConfig() {
  let config2;
  try {
    const rawConfig = figma.root.getPluginData(F2RN_PROJECT_NS);
    const parsedConfig = JSON.parse(rawConfig);
    config2 = parsedConfig;
  } catch (e) {
  }
  emit("PROJECT_CONFIG_LOAD", config2 || project_default);
}
var init_project2 = __esm({
  "src/backend/project.ts"() {
    init_lib();
    init_lib2();
    init_generator();
    init_env();
    init_project();
    init_config();
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
async function main_default() {
  if (figma.mode === "codegen") {
    await load(true);
    figma.codegen.on("generate", (e) => {
      handleConfigChange();
      return render(e.node);
    });
    return;
  }
  once("APP_READY", async () => {
    await load();
    _page = await loadCurrentPage() || "code";
    emit(
      "APP_START",
      _page,
      figma.currentUser,
      // @ts-ignore
      Boolean(figma.vscode),
      figma.mode === "inspect"
    );
    loadConfig();
    loadComponents(targetSelectedComponent);
    watchTheme(state);
    watchIcons();
    watchComponents();
    watchVariantSelect();
    figma.on("selectionchange", () => {
      targetSelectedComponent();
      if (figma.vscode && figma.currentPage.selection.length === 0) {
      }
    });
    figma.on("drop", importNode);
    on("APP_NAVIGATE", (page) => {
      saveCurrentPage(page);
      _page = page;
    });
    on("CONFIG_UPDATE", (newConfig) => {
      update(newConfig);
    });
    on("PROJECT_EXPORT", (newConfig) => {
      build(newConfig);
    });
    on("PROJECT_IMPORT_COMPONENTS", (iconSet) => {
      importComponents(iconSet);
    });
    on("PROJECT_IMPORT_ICONS", (name, svgs) => {
      importIcons(name, svgs);
    });
    on("PROJECT_IMPORT_THEME", (color, radius) => {
      importTheme(color, radius);
    });
    on("FOCUS", (nodeId) => {
      if (nodeId === null) {
        figma.currentPage.selection = [];
      } else {
        focusNode(nodeId);
      }
    });
    on("OPEN_LINK", (link) => {
      figma.openExternal(link);
    });
    on("NOTIFY", (message, error) => {
      figma.notify(message, { error });
    });
    on("RESIZE_WINDOW", (size) => {
      figma.ui.resize(size.width, size.height);
    });
  });
}
var _page;
var init_main = __esm({
  "src/main.ts"() {
    init_env();
    init_lib();
    init_lib2();
    init_generator();
    init_app();
    init_exo();
    init_drop();
    init_icons();
    init_themes();
    init_config();
    init_codegen();
    init_project2();
    _page = "code";
    if (figma.mode !== "codegen") {
      const width = F2RN_UI_WIDTH_MIN;
      const height = 999999;
      const x = Math.round(figma.viewport.bounds.x);
      const y = Math.round(figma.viewport.bounds.y) - 20;
      showUI({ width, height, position: { x, y } });
    }
  }
});

// <stdin>
var modules = { "src/main.ts--default": (init_main(), __toCommonJS(main_exports))["default"] };
var commandId = true ? "src/main.ts--default" : figma.command;
modules[commandId]();
/*! Bundled license information:

reserved/index.js:
  (*!
   * reserved <https://github.com/jonschlinkert/reserved
   *
   * Copyright (c) 2014 Jon Schlinkert, contributors
   * Licensed under the MIT License (MIT)
   *)
*/
