import { createRequire } from "node:module";
import * as tty from "node:tty";
import { WriteStream } from "node:tty";
import { createHmac, createPrivateKey, subtle, timingSafeEqual } from "node:crypto";
import { Buffer as Buffer$1 } from "node:buffer";
import { AsyncLocalStorage } from "node:async_hooks";
import nodeHTTP from "node:http";
import { PassThrough, Readable } from "node:stream";
import nodeHTTPS from "node:https";
import nodeHTTP2 from "node:http2";
import process$1, { cwd, stdin, stdout } from "node:process";
import path, { delimiter, dirname, join, normalize, resolve, sep } from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { formatWithOptions } from "node:util";
import f from "node:readline";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { Socket } from "node:net";
import { fileURLToPath } from "node:url";
import { createRequire as createRequire$1 } from "module";

//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* @__PURE__ */ createRequire(import.meta.url);

//#endregion
//#region ../../node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs
function isPlainObject$5(value) {
	if (value === null || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) return false;
	if (Symbol.iterator in value) return false;
	if (Symbol.toStringTag in value) return Object.prototype.toString.call(value) === "[object Module]";
	return true;
}
function _defu$1(baseObject, defaults, namespace = ".", merger) {
	if (!isPlainObject$5(defaults)) return _defu$1(baseObject, {}, namespace, merger);
	const object = Object.assign({}, defaults);
	for (const key in baseObject) {
		if (key === "__proto__" || key === "constructor") continue;
		const value = baseObject[key];
		if (value === null || value === void 0) continue;
		if (merger && merger(object, key, value, namespace)) continue;
		if (Array.isArray(value) && Array.isArray(object[key])) object[key] = [...value, ...object[key]];
		else if (isPlainObject$5(value) && isPlainObject$5(object[key])) object[key] = _defu$1(value, object[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
		else object[key] = value;
	}
	return object;
}
function createDefu$1(merger) {
	return (...arguments_) => arguments_.reduce((p, c) => _defu$1(p, c, "", merger), {});
}
const defu$1 = createDefu$1();
const defuFn = createDefu$1((object, key, currentValue) => {
	if (object[key] !== void 0 && typeof currentValue === "function") {
		object[key] = currentValue(object[key]);
		return true;
	}
});
const defuArrayFn = createDefu$1((object, key, currentValue) => {
	if (Array.isArray(object[key]) && typeof currentValue === "function") {
		object[key] = currentValue(object[key]);
		return true;
	}
});

//#endregion
//#region ../../node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/shared/consola.DXBYu-KD.mjs
const { env = {}, argv = [], platform = "" } = typeof process === "undefined" ? {} : process;
const isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
const isForced = "FORCE_COLOR" in env || argv.includes("--color");
const isWindows = platform === "win32";
const isDumbTerminal = env.TERM === "dumb";
const isCompatibleTerminal = tty && tty.isatty && tty.isatty(1) && env.TERM && !isDumbTerminal;
const isCI = "CI" in env && ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);
const isColorSupported = !isDisabled && (isForced || isWindows && !isDumbTerminal || isCompatibleTerminal || isCI);
function replaceClose(index, string, close, replace, head = string.slice(0, Math.max(0, index)) + replace, tail = string.slice(Math.max(0, index + close.length)), next = tail.indexOf(close)) {
	return head + (next < 0 ? tail : replaceClose(next, tail, close, replace));
}
function clearBleed(index, string, open, close, replace) {
	return index < 0 ? open + string + close : open + replaceClose(index, string, close, replace) + close;
}
function filterEmpty(open, close, replace = open, at = open.length + 1) {
	return (string) => string || !(string === "" || string === void 0) ? clearBleed(("" + string).indexOf(close, at), string, open, close, replace) : "";
}
function init(open, close, replace) {
	return filterEmpty(`\x1B[${open}m`, `\x1B[${close}m`, replace);
}
const colorDefs = {
	reset: init(0, 0),
	bold: init(1, 22, "\x1B[22m\x1B[1m"),
	dim: init(2, 22, "\x1B[22m\x1B[2m"),
	italic: init(3, 23),
	underline: init(4, 24),
	inverse: init(7, 27),
	hidden: init(8, 28),
	strikethrough: init(9, 29),
	black: init(30, 39),
	red: init(31, 39),
	green: init(32, 39),
	yellow: init(33, 39),
	blue: init(34, 39),
	magenta: init(35, 39),
	cyan: init(36, 39),
	white: init(37, 39),
	gray: init(90, 39),
	bgBlack: init(40, 49),
	bgRed: init(41, 49),
	bgGreen: init(42, 49),
	bgYellow: init(43, 49),
	bgBlue: init(44, 49),
	bgMagenta: init(45, 49),
	bgCyan: init(46, 49),
	bgWhite: init(47, 49),
	blackBright: init(90, 39),
	redBright: init(91, 39),
	greenBright: init(92, 39),
	yellowBright: init(93, 39),
	blueBright: init(94, 39),
	magentaBright: init(95, 39),
	cyanBright: init(96, 39),
	whiteBright: init(97, 39),
	bgBlackBright: init(100, 49),
	bgRedBright: init(101, 49),
	bgGreenBright: init(102, 49),
	bgYellowBright: init(103, 49),
	bgBlueBright: init(104, 49),
	bgMagentaBright: init(105, 49),
	bgCyanBright: init(106, 49),
	bgWhiteBright: init(107, 49)
};
function createColors(useColor = isColorSupported) {
	return useColor ? colorDefs : Object.fromEntries(Object.keys(colorDefs).map((key) => [key, String]));
}
const colors = createColors();
function getColor$1(color, fallback = "reset") {
	return colors[color] || colors[fallback];
}
const ansiRegex$1 = [String.raw`[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007)`, String.raw`(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))`].join("|");
function stripAnsi$1(text) {
	return text.replace(new RegExp(ansiRegex$1, "g"), "");
}
const boxStylePresets = {
	solid: {
		tl: "┌",
		tr: "┐",
		bl: "└",
		br: "┘",
		h: "─",
		v: "│"
	},
	double: {
		tl: "╔",
		tr: "╗",
		bl: "╚",
		br: "╝",
		h: "═",
		v: "║"
	},
	doubleSingle: {
		tl: "╓",
		tr: "╖",
		bl: "╙",
		br: "╜",
		h: "─",
		v: "║"
	},
	doubleSingleRounded: {
		tl: "╭",
		tr: "╮",
		bl: "╰",
		br: "╯",
		h: "─",
		v: "║"
	},
	singleThick: {
		tl: "┏",
		tr: "┓",
		bl: "┗",
		br: "┛",
		h: "━",
		v: "┃"
	},
	singleDouble: {
		tl: "╒",
		tr: "╕",
		bl: "╘",
		br: "╛",
		h: "═",
		v: "│"
	},
	singleDoubleRounded: {
		tl: "╭",
		tr: "╮",
		bl: "╰",
		br: "╯",
		h: "═",
		v: "│"
	},
	rounded: {
		tl: "╭",
		tr: "╮",
		bl: "╰",
		br: "╯",
		h: "─",
		v: "│"
	}
};
const defaultStyle = {
	borderColor: "white",
	borderStyle: "rounded",
	valign: "center",
	padding: 2,
	marginLeft: 1,
	marginTop: 1,
	marginBottom: 1
};
function box(text, _opts = {}) {
	const opts = {
		..._opts,
		style: {
			...defaultStyle,
			..._opts.style
		}
	};
	const textLines = text.split("\n");
	const boxLines = [];
	const _color = getColor$1(opts.style.borderColor);
	const borderStyle = { ...typeof opts.style.borderStyle === "string" ? boxStylePresets[opts.style.borderStyle] || boxStylePresets.solid : opts.style.borderStyle };
	if (_color) for (const key in borderStyle) borderStyle[key] = _color(borderStyle[key]);
	const paddingOffset = opts.style.padding % 2 === 0 ? opts.style.padding : opts.style.padding + 1;
	const height = textLines.length + paddingOffset;
	const width = Math.max(...textLines.map((line) => stripAnsi$1(line).length), opts.title ? stripAnsi$1(opts.title).length : 0) + paddingOffset;
	const widthOffset = width + paddingOffset;
	const leftSpace = opts.style.marginLeft > 0 ? " ".repeat(opts.style.marginLeft) : "";
	if (opts.style.marginTop > 0) boxLines.push("".repeat(opts.style.marginTop));
	if (opts.title) {
		const title = _color ? _color(opts.title) : opts.title;
		const left = borderStyle.h.repeat(Math.floor((width - stripAnsi$1(opts.title).length) / 2));
		const right = borderStyle.h.repeat(width - stripAnsi$1(opts.title).length - stripAnsi$1(left).length + paddingOffset);
		boxLines.push(`${leftSpace}${borderStyle.tl}${left}${title}${right}${borderStyle.tr}`);
	} else boxLines.push(`${leftSpace}${borderStyle.tl}${borderStyle.h.repeat(widthOffset)}${borderStyle.tr}`);
	const valignOffset = opts.style.valign === "center" ? Math.floor((height - textLines.length) / 2) : opts.style.valign === "top" ? height - textLines.length - paddingOffset : height - textLines.length;
	for (let i = 0; i < height; i++) if (i < valignOffset || i >= valignOffset + textLines.length) boxLines.push(`${leftSpace}${borderStyle.v}${" ".repeat(widthOffset)}${borderStyle.v}`);
	else {
		const line = textLines[i - valignOffset];
		const left = " ".repeat(paddingOffset);
		const right = " ".repeat(width - stripAnsi$1(line).length);
		boxLines.push(`${leftSpace}${borderStyle.v}${left}${line}${right}${borderStyle.v}`);
	}
	boxLines.push(`${leftSpace}${borderStyle.bl}${borderStyle.h.repeat(widthOffset)}${borderStyle.br}`);
	if (opts.style.marginBottom > 0) boxLines.push("".repeat(opts.style.marginBottom));
	return boxLines.join("\n");
}

//#endregion
//#region src/logging.ts
function formatTable(headers, values) {
	const widths = headers.map((header, index) => Math.max(header.length, values[index]?.length ?? 0));
	const top = `╔${widths.map((width) => "═".repeat(width + 2)).join("╤")}╗`;
	const middle = `╟${widths.map((width) => "─".repeat(width + 2)).join("┼")}╢`;
	const bottom = `╚${widths.map((width) => "═".repeat(width + 2)).join("╧")}╝`;
	return [
		top,
		`║ ${headers.map((header, index) => header.padEnd(widths[index] ?? header.length, " ")).join(" │ ")} ║`,
		middle,
		`║ ${values.map((value, index) => value.padEnd(widths[index] ?? value.length, " ")).join(" │ ")} ║`,
		bottom
	].join("\n");
}
function logUsageSummary(totals) {
	console.log(formatTable([
		"Cost",
		"Input",
		"Cache Read",
		"Cache Write",
		"Output"
	], [
		`$${totals.cost.toFixed(4)}`,
		String(totals.inputTokens),
		String(totals.cacheReadTokens),
		String(totals.cacheWriteTokens),
		String(totals.outputTokens)
	]));
}
function logAgentMessage(info, lines) {
	const msg = Array.isArray(lines) ? lines.join("\n") : lines;
	console.log(box(msg, {
		title: ` ${info.agent} - ${info.model} `,
		style: { borderStyle: "double" }
	}));
}

//#endregion
//#region ../../node_modules/.pnpm/universal-user-agent@7.0.3/node_modules/universal-user-agent/index.js
function getUserAgent() {
	if (typeof navigator === "object" && "userAgent" in navigator) return navigator.userAgent;
	if (typeof process === "object" && process.version !== void 0) return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
	return "<environment undetectable>";
}

//#endregion
//#region ../../node_modules/.pnpm/before-after-hook@4.0.0/node_modules/before-after-hook/lib/register.js
function register(state, name, method, options) {
	if (typeof method !== "function") throw new Error("method for before hook must be a function");
	if (!options) options = {};
	if (Array.isArray(name)) return name.reverse().reduce((callback, name) => {
		return register.bind(null, state, name, callback, options);
	}, method)();
	return Promise.resolve().then(() => {
		if (!state.registry[name]) return method(options);
		return state.registry[name].reduce((method, registered) => {
			return registered.hook.bind(null, method, options);
		}, method)();
	});
}

//#endregion
//#region ../../node_modules/.pnpm/before-after-hook@4.0.0/node_modules/before-after-hook/lib/add.js
function addHook(state, kind, name, hook) {
	const orig = hook;
	if (!state.registry[name]) state.registry[name] = [];
	if (kind === "before") hook = (method, options) => {
		return Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options));
	};
	if (kind === "after") hook = (method, options) => {
		let result;
		return Promise.resolve().then(method.bind(null, options)).then((result_) => {
			result = result_;
			return orig(result, options);
		}).then(() => {
			return result;
		});
	};
	if (kind === "error") hook = (method, options) => {
		return Promise.resolve().then(method.bind(null, options)).catch((error) => {
			return orig(error, options);
		});
	};
	state.registry[name].push({
		hook,
		orig
	});
}

//#endregion
//#region ../../node_modules/.pnpm/before-after-hook@4.0.0/node_modules/before-after-hook/lib/remove.js
function removeHook(state, name, method) {
	if (!state.registry[name]) return;
	const index = state.registry[name].map((registered) => {
		return registered.orig;
	}).indexOf(method);
	if (index === -1) return;
	state.registry[name].splice(index, 1);
}

//#endregion
//#region ../../node_modules/.pnpm/before-after-hook@4.0.0/node_modules/before-after-hook/index.js
const bind = Function.bind;
const bindable = bind.bind(bind);
function bindApi(hook, state, name) {
	const removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state]);
	hook.api = { remove: removeHookRef };
	hook.remove = removeHookRef;
	[
		"before",
		"error",
		"after",
		"wrap"
	].forEach((kind) => {
		const args = name ? [
			state,
			kind,
			name
		] : [state, kind];
		hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args);
	});
}
function Singular() {
	const singularHookName = Symbol("Singular");
	const singularHookState = { registry: {} };
	const singularHook = register.bind(null, singularHookState, singularHookName);
	bindApi(singularHook, singularHookState, singularHookName);
	return singularHook;
}
function Collection() {
	const state = { registry: {} };
	const hook = register.bind(null, state);
	bindApi(hook, state);
	return hook;
}
var before_after_hook_default = {
	Singular,
	Collection
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+endpoint@11.0.3/node_modules/@octokit/endpoint/dist-bundle/index.js
var userAgent = `octokit-endpoint.js/0.0.0-development ${getUserAgent()}`;
var DEFAULTS = {
	method: "GET",
	baseUrl: "https://api.github.com",
	headers: {
		accept: "application/vnd.github.v3+json",
		"user-agent": userAgent
	},
	mediaType: { format: "" }
};
function lowercaseKeys(object) {
	if (!object) return {};
	return Object.keys(object).reduce((newObj, key) => {
		newObj[key.toLowerCase()] = object[key];
		return newObj;
	}, {});
}
function isPlainObject$4(value) {
	if (typeof value !== "object" || value === null) return false;
	if (Object.prototype.toString.call(value) !== "[object Object]") return false;
	const proto = Object.getPrototypeOf(value);
	if (proto === null) return true;
	const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
	return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
}
function mergeDeep(defaults, options) {
	const result = Object.assign({}, defaults);
	Object.keys(options).forEach((key) => {
		if (isPlainObject$4(options[key])) if (!(key in defaults)) Object.assign(result, { [key]: options[key] });
		else result[key] = mergeDeep(defaults[key], options[key]);
		else Object.assign(result, { [key]: options[key] });
	});
	return result;
}
function removeUndefinedProperties(obj) {
	for (const key in obj) if (obj[key] === void 0) delete obj[key];
	return obj;
}
function merge(defaults, route, options) {
	if (typeof route === "string") {
		let [method, url] = route.split(" ");
		options = Object.assign(url ? {
			method,
			url
		} : { url: method }, options);
	} else options = Object.assign({}, route);
	options.headers = lowercaseKeys(options.headers);
	removeUndefinedProperties(options);
	removeUndefinedProperties(options.headers);
	const mergedOptions = mergeDeep(defaults || {}, options);
	if (options.url === "/graphql") {
		if (defaults && defaults.mediaType.previews?.length) mergedOptions.mediaType.previews = defaults.mediaType.previews.filter((preview) => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
		mergedOptions.mediaType.previews = (mergedOptions.mediaType.previews || []).map((preview) => preview.replace(/-preview/, ""));
	}
	return mergedOptions;
}
function addQueryParameters(url, parameters) {
	const separator = /\?/.test(url) ? "&" : "?";
	const names = Object.keys(parameters);
	if (names.length === 0) return url;
	return url + separator + names.map((name) => {
		if (name === "q") return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
		return `${name}=${encodeURIComponent(parameters[name])}`;
	}).join("&");
}
var urlVariableRegex = /\{[^{}}]+\}/g;
function removeNonChars(variableName) {
	return variableName.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g, "").split(/,/);
}
function extractUrlVariableNames(url) {
	const matches = url.match(urlVariableRegex);
	if (!matches) return [];
	return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}
function omit(object, keysToOmit) {
	const result = { __proto__: null };
	for (const key of Object.keys(object)) if (keysToOmit.indexOf(key) === -1) result[key] = object[key];
	return result;
}
function encodeReserved(str) {
	return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
		if (!/%[0-9A-Fa-f]/.test(part)) part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
		return part;
	}).join("");
}
function encodeUnreserved(str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
		return "%" + c.charCodeAt(0).toString(16).toUpperCase();
	});
}
function encodeValue(operator, value, key) {
	value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
	if (key) return encodeUnreserved(key) + "=" + value;
	else return value;
}
function isDefined(value) {
	return value !== void 0 && value !== null;
}
function isKeyOperator(operator) {
	return operator === ";" || operator === "&" || operator === "?";
}
function getValues(context, operator, key, modifier) {
	var value = context[key], result = [];
	if (isDefined(value) && value !== "") if (typeof value === "string" || typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
		value = value.toString();
		if (modifier && modifier !== "*") value = value.substring(0, parseInt(modifier, 10));
		result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
	} else if (modifier === "*") if (Array.isArray(value)) value.filter(isDefined).forEach(function(value2) {
		result.push(encodeValue(operator, value2, isKeyOperator(operator) ? key : ""));
	});
	else Object.keys(value).forEach(function(k) {
		if (isDefined(value[k])) result.push(encodeValue(operator, value[k], k));
	});
	else {
		const tmp = [];
		if (Array.isArray(value)) value.filter(isDefined).forEach(function(value2) {
			tmp.push(encodeValue(operator, value2));
		});
		else Object.keys(value).forEach(function(k) {
			if (isDefined(value[k])) {
				tmp.push(encodeUnreserved(k));
				tmp.push(encodeValue(operator, value[k].toString()));
			}
		});
		if (isKeyOperator(operator)) result.push(encodeUnreserved(key) + "=" + tmp.join(","));
		else if (tmp.length !== 0) result.push(tmp.join(","));
	}
	else if (operator === ";") {
		if (isDefined(value)) result.push(encodeUnreserved(key));
	} else if (value === "" && (operator === "&" || operator === "?")) result.push(encodeUnreserved(key) + "=");
	else if (value === "") result.push("");
	return result;
}
function parseUrl(template) {
	return { expand: expand.bind(null, template) };
}
function expand(template, context) {
	var operators = [
		"+",
		"#",
		".",
		"/",
		";",
		"?",
		"&"
	];
	template = template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function(_, expression, literal) {
		if (expression) {
			let operator = "";
			const values = [];
			if (operators.indexOf(expression.charAt(0)) !== -1) {
				operator = expression.charAt(0);
				expression = expression.substr(1);
			}
			expression.split(/,/g).forEach(function(variable) {
				var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
				values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
			});
			if (operator && operator !== "+") {
				var separator = ",";
				if (operator === "?") separator = "&";
				else if (operator !== "#") separator = operator;
				return (values.length !== 0 ? operator : "") + values.join(separator);
			} else return values.join(",");
		} else return encodeReserved(literal);
	});
	if (template === "/") return template;
	else return template.replace(/\/$/, "");
}
function parse$1(options) {
	let method = options.method.toUpperCase();
	let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
	let headers = Object.assign({}, options.headers);
	let body;
	let parameters = omit(options, [
		"method",
		"baseUrl",
		"url",
		"headers",
		"request",
		"mediaType"
	]);
	const urlVariableNames = extractUrlVariableNames(url);
	url = parseUrl(url).expand(parameters);
	if (!/^http/.test(url)) url = options.baseUrl + url;
	const remainingParameters = omit(parameters, Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl"));
	if (!/application\/octet-stream/i.test(headers.accept)) {
		if (options.mediaType.format) headers.accept = headers.accept.split(/,/).map((format) => format.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`)).join(",");
		if (url.endsWith("/graphql")) {
			if (options.mediaType.previews?.length) headers.accept = (headers.accept.match(/(?<![\w-])[\w-]+(?=-preview)/g) || []).concat(options.mediaType.previews).map((preview) => {
				return `application/vnd.github.${preview}-preview${options.mediaType.format ? `.${options.mediaType.format}` : "+json"}`;
			}).join(",");
		}
	}
	if (["GET", "HEAD"].includes(method)) url = addQueryParameters(url, remainingParameters);
	else if ("data" in remainingParameters) body = remainingParameters.data;
	else if (Object.keys(remainingParameters).length) body = remainingParameters;
	if (!headers["content-type"] && typeof body !== "undefined") headers["content-type"] = "application/json; charset=utf-8";
	if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") body = "";
	return Object.assign({
		method,
		url,
		headers
	}, typeof body !== "undefined" ? { body } : null, options.request ? { request: options.request } : null);
}
function endpointWithDefaults(defaults, route, options) {
	return parse$1(merge(defaults, route, options));
}
function withDefaults$2(oldDefaults, newDefaults) {
	const DEFAULTS2 = merge(oldDefaults, newDefaults);
	const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
	return Object.assign(endpoint2, {
		DEFAULTS: DEFAULTS2,
		defaults: withDefaults$2.bind(null, DEFAULTS2),
		merge: merge.bind(null, DEFAULTS2),
		parse: parse$1
	});
}
var endpoint = withDefaults$2(null, DEFAULTS);

//#endregion
//#region ../../node_modules/.pnpm/fast-content-type-parse@3.0.0/node_modules/fast-content-type-parse/index.js
var require_fast_content_type_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const NullObject = function NullObject() {};
	NullObject.prototype = Object.create(null);
	/**
	* RegExp to match *( ";" parameter ) in RFC 7231 sec 3.1.1.1
	*
	* parameter     = token "=" ( token / quoted-string )
	* token         = 1*tchar
	* tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
	*               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
	*               / DIGIT / ALPHA
	*               ; any VCHAR, except delimiters
	* quoted-string = DQUOTE *( qdtext / quoted-pair ) DQUOTE
	* qdtext        = HTAB / SP / %x21 / %x23-5B / %x5D-7E / obs-text
	* obs-text      = %x80-FF
	* quoted-pair   = "\" ( HTAB / SP / VCHAR / obs-text )
	*/
	const paramRE = /; *([!#$%&'*+.^\w`|~-]+)=("(?:[\v\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\v\u0020-\u00ff])*"|[!#$%&'*+.^\w`|~-]+) */gu;
	/**
	* RegExp to match quoted-pair in RFC 7230 sec 3.2.6
	*
	* quoted-pair = "\" ( HTAB / SP / VCHAR / obs-text )
	* obs-text    = %x80-FF
	*/
	const quotedPairRE = /\\([\v\u0020-\u00ff])/gu;
	/**
	* RegExp to match type in RFC 7231 sec 3.1.1.1
	*
	* media-type = type "/" subtype
	* type       = token
	* subtype    = token
	*/
	const mediaTypeRE = /^[!#$%&'*+.^\w|~-]+\/[!#$%&'*+.^\w|~-]+$/u;
	const defaultContentType = {
		type: "",
		parameters: new NullObject()
	};
	Object.freeze(defaultContentType.parameters);
	Object.freeze(defaultContentType);
	/**
	* Parse media type to object.
	*
	* @param {string|object} header
	* @return {Object}
	* @public
	*/
	function parse(header) {
		if (typeof header !== "string") throw new TypeError("argument header is required and must be a string");
		let index = header.indexOf(";");
		const type = index !== -1 ? header.slice(0, index).trim() : header.trim();
		if (mediaTypeRE.test(type) === false) throw new TypeError("invalid media type");
		const result = {
			type: type.toLowerCase(),
			parameters: new NullObject()
		};
		if (index === -1) return result;
		let key;
		let match;
		let value;
		paramRE.lastIndex = index;
		while (match = paramRE.exec(header)) {
			if (match.index !== index) throw new TypeError("invalid parameter format");
			index += match[0].length;
			key = match[1].toLowerCase();
			value = match[2];
			if (value[0] === "\"") {
				value = value.slice(1, value.length - 1);
				quotedPairRE.test(value) && (value = value.replace(quotedPairRE, "$1"));
			}
			result.parameters[key] = value;
		}
		if (index !== header.length) throw new TypeError("invalid parameter format");
		return result;
	}
	function safeParse(header) {
		if (typeof header !== "string") return defaultContentType;
		let index = header.indexOf(";");
		const type = index !== -1 ? header.slice(0, index).trim() : header.trim();
		if (mediaTypeRE.test(type) === false) return defaultContentType;
		const result = {
			type: type.toLowerCase(),
			parameters: new NullObject()
		};
		if (index === -1) return result;
		let key;
		let match;
		let value;
		paramRE.lastIndex = index;
		while (match = paramRE.exec(header)) {
			if (match.index !== index) return defaultContentType;
			index += match[0].length;
			key = match[1].toLowerCase();
			value = match[2];
			if (value[0] === "\"") {
				value = value.slice(1, value.length - 1);
				quotedPairRE.test(value) && (value = value.replace(quotedPairRE, "$1"));
			}
			result.parameters[key] = value;
		}
		if (index !== header.length) return defaultContentType;
		return result;
	}
	module.exports.default = {
		parse,
		safeParse
	};
	module.exports.parse = parse;
	module.exports.safeParse = safeParse;
	module.exports.defaultContentType = defaultContentType;
}));

//#endregion
//#region ../../node_modules/.pnpm/@octokit+request-error@7.1.0/node_modules/@octokit/request-error/dist-src/index.js
var import_fast_content_type_parse = require_fast_content_type_parse();
var RequestError = class extends Error {
	name;
	/**
	* http status code
	*/
	status;
	/**
	* Request options that lead to the error.
	*/
	request;
	/**
	* Response object if a response was received
	*/
	response;
	constructor(message, statusCode, options) {
		super(message, { cause: options.cause });
		this.name = "HttpError";
		this.status = Number.parseInt(statusCode);
		if (Number.isNaN(this.status)) this.status = 0;
		/* v8 ignore else -- @preserve -- Bug with vitest coverage where it sees an else branch that doesn't exist */
		if ("response" in options) this.response = options.response;
		const requestCopy = Object.assign({}, options.request);
		if (options.request.headers.authorization) requestCopy.headers = Object.assign({}, options.request.headers, { authorization: options.request.headers.authorization.replace(/(?<! ) .*$/, " [REDACTED]") });
		requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
		this.request = requestCopy;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+request@10.0.7/node_modules/@octokit/request/dist-bundle/index.js
var VERSION$14 = "10.0.7";
var defaults_default = { headers: { "user-agent": `octokit-request.js/${VERSION$14} ${getUserAgent()}` } };
function isPlainObject$3(value) {
	if (typeof value !== "object" || value === null) return false;
	if (Object.prototype.toString.call(value) !== "[object Object]") return false;
	const proto = Object.getPrototypeOf(value);
	if (proto === null) return true;
	const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
	return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
}
var noop$2 = () => "";
async function fetchWrapper(requestOptions) {
	const fetch = requestOptions.request?.fetch || globalThis.fetch;
	if (!fetch) throw new Error("fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing");
	const log = requestOptions.request?.log || console;
	const parseSuccessResponseBody = requestOptions.request?.parseSuccessResponseBody !== false;
	const body = isPlainObject$3(requestOptions.body) || Array.isArray(requestOptions.body) ? JSON.stringify(requestOptions.body) : requestOptions.body;
	const requestHeaders = Object.fromEntries(Object.entries(requestOptions.headers).map(([name, value]) => [name, String(value)]));
	let fetchResponse;
	try {
		fetchResponse = await fetch(requestOptions.url, {
			method: requestOptions.method,
			body,
			redirect: requestOptions.request?.redirect,
			headers: requestHeaders,
			signal: requestOptions.request?.signal,
			...requestOptions.body && { duplex: "half" }
		});
	} catch (error) {
		let message = "Unknown Error";
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				error.status = 500;
				throw error;
			}
			message = error.message;
			if (error.name === "TypeError" && "cause" in error) {
				if (error.cause instanceof Error) message = error.cause.message;
				else if (typeof error.cause === "string") message = error.cause;
			}
		}
		const requestError = new RequestError(message, 500, { request: requestOptions });
		requestError.cause = error;
		throw requestError;
	}
	const status = fetchResponse.status;
	const url = fetchResponse.url;
	const responseHeaders = {};
	for (const [key, value] of fetchResponse.headers) responseHeaders[key] = value;
	const octokitResponse = {
		url,
		status,
		headers: responseHeaders,
		data: ""
	};
	if ("deprecation" in responseHeaders) {
		const matches = responseHeaders.link && responseHeaders.link.match(/<([^<>]+)>; rel="deprecation"/);
		const deprecationLink = matches && matches.pop();
		log.warn(`[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${responseHeaders.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`);
	}
	if (status === 204 || status === 205) return octokitResponse;
	if (requestOptions.method === "HEAD") {
		if (status < 400) return octokitResponse;
		throw new RequestError(fetchResponse.statusText, status, {
			response: octokitResponse,
			request: requestOptions
		});
	}
	if (status === 304) {
		octokitResponse.data = await getResponseData(fetchResponse);
		throw new RequestError("Not modified", status, {
			response: octokitResponse,
			request: requestOptions
		});
	}
	if (status >= 400) {
		octokitResponse.data = await getResponseData(fetchResponse);
		throw new RequestError(toErrorMessage(octokitResponse.data), status, {
			response: octokitResponse,
			request: requestOptions
		});
	}
	octokitResponse.data = parseSuccessResponseBody ? await getResponseData(fetchResponse) : fetchResponse.body;
	return octokitResponse;
}
async function getResponseData(response) {
	const contentType = response.headers.get("content-type");
	if (!contentType) return response.text().catch(noop$2);
	const mimetype = (0, import_fast_content_type_parse.safeParse)(contentType);
	if (isJSONResponse(mimetype)) {
		let text = "";
		try {
			text = await response.text();
			return JSON.parse(text);
		} catch (err) {
			return text;
		}
	} else if (mimetype.type.startsWith("text/") || mimetype.parameters.charset?.toLowerCase() === "utf-8") return response.text().catch(noop$2);
	else return response.arrayBuffer().catch(
		/* v8 ignore next -- @preserve */
		() => /* @__PURE__ */ new ArrayBuffer(0)
	);
}
function isJSONResponse(mimetype) {
	return mimetype.type === "application/json" || mimetype.type === "application/scim+json";
}
function toErrorMessage(data) {
	if (typeof data === "string") return data;
	if (data instanceof ArrayBuffer) return "Unknown error";
	if ("message" in data) {
		const suffix = "documentation_url" in data ? ` - ${data.documentation_url}` : "";
		return Array.isArray(data.errors) ? `${data.message}: ${data.errors.map((v) => JSON.stringify(v)).join(", ")}${suffix}` : `${data.message}${suffix}`;
	}
	return `Unknown error: ${JSON.stringify(data)}`;
}
function withDefaults$1(oldEndpoint, newDefaults) {
	const endpoint2 = oldEndpoint.defaults(newDefaults);
	const newApi = function(route, parameters) {
		const endpointOptions = endpoint2.merge(route, parameters);
		if (!endpointOptions.request || !endpointOptions.request.hook) return fetchWrapper(endpoint2.parse(endpointOptions));
		const request2 = (route2, parameters2) => {
			return fetchWrapper(endpoint2.parse(endpoint2.merge(route2, parameters2)));
		};
		Object.assign(request2, {
			endpoint: endpoint2,
			defaults: withDefaults$1.bind(null, endpoint2)
		});
		return endpointOptions.request.hook(request2, endpointOptions);
	};
	return Object.assign(newApi, {
		endpoint: endpoint2,
		defaults: withDefaults$1.bind(null, endpoint2)
	});
}
var request = withDefaults$1(endpoint, defaults_default);
/* v8 ignore next -- @preserve */
/* v8 ignore else -- @preserve */

//#endregion
//#region ../../node_modules/.pnpm/@octokit+graphql@9.0.3/node_modules/@octokit/graphql/dist-bundle/index.js
var VERSION$13 = "0.0.0-development";
function _buildMessageForResponseErrors(data) {
	return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
}
var GraphqlResponseError = class extends Error {
	constructor(request2, headers, response) {
		super(_buildMessageForResponseErrors(response));
		this.request = request2;
		this.headers = headers;
		this.response = response;
		this.errors = response.errors;
		this.data = response.data;
		if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
	}
	name = "GraphqlResponseError";
	errors;
	data;
};
var NON_VARIABLE_OPTIONS = [
	"method",
	"baseUrl",
	"url",
	"headers",
	"request",
	"query",
	"mediaType",
	"operationName"
];
var FORBIDDEN_VARIABLE_OPTIONS = [
	"query",
	"method",
	"url"
];
var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql(request2, query, options) {
	if (options) {
		if (typeof query === "string" && "query" in options) return Promise.reject(/* @__PURE__ */ new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
		for (const key in options) {
			if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;
			return Promise.reject(/* @__PURE__ */ new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`));
		}
	}
	const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
	const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
		if (NON_VARIABLE_OPTIONS.includes(key)) {
			result[key] = parsedOptions[key];
			return result;
		}
		if (!result.variables) result.variables = {};
		result.variables[key] = parsedOptions[key];
		return result;
	}, {});
	const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
	if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
	return request2(requestOptions).then((response) => {
		if (response.data.errors) {
			const headers = {};
			for (const key of Object.keys(response.headers)) headers[key] = response.headers[key];
			throw new GraphqlResponseError(requestOptions, headers, response.data);
		}
		return response.data.data;
	});
}
function withDefaults(request2, newDefaults) {
	const newRequest = request2.defaults(newDefaults);
	const newApi = (query, options) => {
		return graphql(newRequest, query, options);
	};
	return Object.assign(newApi, {
		defaults: withDefaults.bind(null, newRequest),
		endpoint: newRequest.endpoint
	});
}
var graphql2 = withDefaults(request, {
	headers: { "user-agent": `octokit-graphql.js/${VERSION$13} ${getUserAgent()}` },
	method: "POST",
	url: "/graphql"
});
function withCustomRequest(customRequest) {
	return withDefaults(customRequest, {
		method: "POST",
		url: "/graphql"
	});
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+auth-token@6.0.0/node_modules/@octokit/auth-token/dist-bundle/index.js
var b64url = "(?:[a-zA-Z0-9_-]+)";
var sep$1 = "\\.";
var jwtRE = new RegExp(`^${b64url}${sep$1}${b64url}${sep$1}${b64url}$`);
var isJWT = jwtRE.test.bind(jwtRE);
async function auth$5(token) {
	const isApp = isJWT(token);
	const isInstallation = token.startsWith("v1.") || token.startsWith("ghs_");
	const isUserToServer = token.startsWith("ghu_");
	return {
		type: "token",
		token,
		tokenType: isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth"
	};
}
function withAuthorizationPrefix(token) {
	if (token.split(/\./).length === 3) return `bearer ${token}`;
	return `token ${token}`;
}
async function hook$5(token, request, route, parameters) {
	const endpoint = request.endpoint.merge(route, parameters);
	endpoint.headers.authorization = withAuthorizationPrefix(token);
	return request(endpoint);
}
var createTokenAuth = function createTokenAuth2(token) {
	if (!token) throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
	if (typeof token !== "string") throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
	token = token.replace(/^(token|bearer) +/i, "");
	return Object.assign(auth$5.bind(null, token), { hook: hook$5.bind(null, token) });
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+core@7.0.6/node_modules/@octokit/core/dist-src/version.js
const VERSION$12 = "7.0.6";

//#endregion
//#region ../../node_modules/.pnpm/@octokit+core@7.0.6/node_modules/@octokit/core/dist-src/index.js
const noop$1 = () => {};
const consoleWarn = console.warn.bind(console);
const consoleError = console.error.bind(console);
function createLogger$1(logger = {}) {
	if (typeof logger.debug !== "function") logger.debug = noop$1;
	if (typeof logger.info !== "function") logger.info = noop$1;
	if (typeof logger.warn !== "function") logger.warn = consoleWarn;
	if (typeof logger.error !== "function") logger.error = consoleError;
	return logger;
}
const userAgentTrail = `octokit-core.js/${VERSION$12} ${getUserAgent()}`;
var Octokit$1 = class {
	static VERSION = VERSION$12;
	static defaults(defaults) {
		const OctokitWithDefaults = class extends this {
			constructor(...args) {
				const options = args[0] || {};
				if (typeof defaults === "function") {
					super(defaults(options));
					return;
				}
				super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent ? { userAgent: `${options.userAgent} ${defaults.userAgent}` } : null));
			}
		};
		return OctokitWithDefaults;
	}
	static plugins = [];
	/**
	* Attach a plugin (or many) to your Octokit instance.
	*
	* @example
	* const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
	*/
	static plugin(...newPlugins) {
		const currentPlugins = this.plugins;
		const NewOctokit = class extends this {
			static plugins = currentPlugins.concat(newPlugins.filter((plugin) => !currentPlugins.includes(plugin)));
		};
		return NewOctokit;
	}
	constructor(options = {}) {
		const hook = new before_after_hook_default.Collection();
		const requestDefaults = {
			baseUrl: request.endpoint.DEFAULTS.baseUrl,
			headers: {},
			request: Object.assign({}, options.request, { hook: hook.bind(null, "request") }),
			mediaType: {
				previews: [],
				format: ""
			}
		};
		requestDefaults.headers["user-agent"] = options.userAgent ? `${options.userAgent} ${userAgentTrail}` : userAgentTrail;
		if (options.baseUrl) requestDefaults.baseUrl = options.baseUrl;
		if (options.previews) requestDefaults.mediaType.previews = options.previews;
		if (options.timeZone) requestDefaults.headers["time-zone"] = options.timeZone;
		this.request = request.defaults(requestDefaults);
		this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
		this.log = createLogger$1(options.log);
		this.hook = hook;
		if (!options.authStrategy) if (!options.auth) this.auth = async () => ({ type: "unauthenticated" });
		else {
			const auth = createTokenAuth(options.auth);
			hook.wrap("request", auth.hook);
			this.auth = auth;
		}
		else {
			const { authStrategy, ...otherOptions } = options;
			const auth = authStrategy(Object.assign({
				request: this.request,
				log: this.log,
				octokit: this,
				octokitOptions: otherOptions
			}, options.auth));
			hook.wrap("request", auth.hook);
			this.auth = auth;
		}
		const classConstructor = this.constructor;
		for (let i = 0; i < classConstructor.plugins.length; ++i) Object.assign(this, classConstructor.plugins[i](this, options));
	}
	request;
	graphql;
	log;
	hook;
	auth;
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-paginate-rest@14.0.0_@octokit+core@7.0.6/node_modules/@octokit/plugin-paginate-rest/dist-bundle/index.js
var VERSION$11 = "0.0.0-development";
function normalizePaginatedListResponse(response) {
	if (!response.data) return {
		...response,
		data: []
	};
	if (!(("total_count" in response.data || "total_commits" in response.data) && !("url" in response.data))) return response;
	const incompleteResults = response.data.incomplete_results;
	const repositorySelection = response.data.repository_selection;
	const totalCount = response.data.total_count;
	const totalCommits = response.data.total_commits;
	delete response.data.incomplete_results;
	delete response.data.repository_selection;
	delete response.data.total_count;
	delete response.data.total_commits;
	const namespaceKey = Object.keys(response.data)[0];
	response.data = response.data[namespaceKey];
	if (typeof incompleteResults !== "undefined") response.data.incomplete_results = incompleteResults;
	if (typeof repositorySelection !== "undefined") response.data.repository_selection = repositorySelection;
	response.data.total_count = totalCount;
	response.data.total_commits = totalCommits;
	return response;
}
function iterator(octokit, route, parameters) {
	const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
	const requestMethod = typeof route === "function" ? route : octokit.request;
	const method = options.method;
	const headers = options.headers;
	let url = options.url;
	return { [Symbol.asyncIterator]: () => ({ async next() {
		if (!url) return { done: true };
		try {
			const normalizedResponse = normalizePaginatedListResponse(await requestMethod({
				method,
				url,
				headers
			}));
			url = ((normalizedResponse.headers.link || "").match(/<([^<>]+)>;\s*rel="next"/) || [])[1];
			if (!url && "total_commits" in normalizedResponse.data) {
				const parsedUrl = new URL(normalizedResponse.url);
				const params = parsedUrl.searchParams;
				const page = parseInt(params.get("page") || "1", 10);
				if (page * parseInt(params.get("per_page") || "250", 10) < normalizedResponse.data.total_commits) {
					params.set("page", String(page + 1));
					url = parsedUrl.toString();
				}
			}
			return { value: normalizedResponse };
		} catch (error) {
			if (error.status !== 409) throw error;
			url = "";
			return { value: {
				status: 200,
				headers: {},
				data: []
			} };
		}
	} }) };
}
function paginate(octokit, route, parameters, mapFn) {
	if (typeof parameters === "function") {
		mapFn = parameters;
		parameters = void 0;
	}
	return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
}
function gather(octokit, results, iterator2, mapFn) {
	return iterator2.next().then((result) => {
		if (result.done) return results;
		let earlyExit = false;
		function done() {
			earlyExit = true;
		}
		results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);
		if (earlyExit) return results;
		return gather(octokit, results, iterator2, mapFn);
	});
}
var composePaginateRest = Object.assign(paginate, { iterator });
function paginateRest(octokit) {
	return { paginate: Object.assign(paginate.bind(null, octokit), { iterator: iterator.bind(null, octokit) }) };
}
paginateRest.VERSION = VERSION$11;

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-paginate-graphql@6.0.0_@octokit+core@7.0.6/node_modules/@octokit/plugin-paginate-graphql/dist-bundle/index.js
var generateMessage = (path, cursorValue) => `The cursor at "${path.join(",")}" did not change its value "${cursorValue}" after a page transition. Please make sure your that your query is set up correctly.`;
var MissingCursorChange = class extends Error {
	constructor(pageInfo, cursorValue) {
		super(generateMessage(pageInfo.pathInQuery, cursorValue));
		this.pageInfo = pageInfo;
		this.cursorValue = cursorValue;
		if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
	}
	name = "MissingCursorChangeError";
};
var MissingPageInfo = class extends Error {
	constructor(response) {
		super(`No pageInfo property found in response. Please make sure to specify the pageInfo in your query. Response-Data: ${JSON.stringify(response, null, 2)}`);
		this.response = response;
		if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
	}
	name = "MissingPageInfo";
};
var isObject = (value) => Object.prototype.toString.call(value) === "[object Object]";
function findPaginatedResourcePath(responseData) {
	const paginatedResourcePath = deepFindPathToProperty(responseData, "pageInfo");
	if (paginatedResourcePath.length === 0) throw new MissingPageInfo(responseData);
	return paginatedResourcePath;
}
var deepFindPathToProperty = (object, searchProp, path = []) => {
	for (const key of Object.keys(object)) {
		const currentPath = [...path, key];
		const currentValue = object[key];
		if (isObject(currentValue)) {
			if (currentValue.hasOwnProperty(searchProp)) return currentPath;
			const result = deepFindPathToProperty(currentValue, searchProp, currentPath);
			if (result.length > 0) return result;
		}
	}
	return [];
};
var get$1 = (object, path) => {
	return path.reduce((current, nextProperty) => current[nextProperty], object);
};
var set$1 = (object, path, mutator) => {
	const lastProperty = path[path.length - 1];
	const parent = get$1(object, [...path].slice(0, -1));
	if (typeof mutator === "function") parent[lastProperty] = mutator(parent[lastProperty]);
	else parent[lastProperty] = mutator;
};
var extractPageInfos = (responseData) => {
	const pageInfoPath = findPaginatedResourcePath(responseData);
	return {
		pathInQuery: pageInfoPath,
		pageInfo: get$1(responseData, [...pageInfoPath, "pageInfo"])
	};
};
var isForwardSearch = (givenPageInfo) => {
	return givenPageInfo.hasOwnProperty("hasNextPage");
};
var getCursorFrom = (pageInfo) => isForwardSearch(pageInfo) ? pageInfo.endCursor : pageInfo.startCursor;
var hasAnotherPage = (pageInfo) => isForwardSearch(pageInfo) ? pageInfo.hasNextPage : pageInfo.hasPreviousPage;
var createIterator = (octokit) => {
	return (query, initialParameters = {}) => {
		let nextPageExists = true;
		let parameters = { ...initialParameters };
		return { [Symbol.asyncIterator]: () => ({ async next() {
			if (!nextPageExists) return {
				done: true,
				value: {}
			};
			const response = await octokit.graphql(query, parameters);
			const pageInfoContext = extractPageInfos(response);
			const nextCursorValue = getCursorFrom(pageInfoContext.pageInfo);
			nextPageExists = hasAnotherPage(pageInfoContext.pageInfo);
			if (nextPageExists && nextCursorValue === parameters.cursor) throw new MissingCursorChange(pageInfoContext, nextCursorValue);
			parameters = {
				...parameters,
				cursor: nextCursorValue
			};
			return {
				done: false,
				value: response
			};
		} }) };
	};
};
var mergeResponses = (response1, response2) => {
	if (Object.keys(response1).length === 0) return Object.assign(response1, response2);
	const path = findPaginatedResourcePath(response1);
	const nodesPath = [...path, "nodes"];
	const newNodes = get$1(response2, nodesPath);
	if (newNodes) set$1(response1, nodesPath, (values) => {
		return [...values, ...newNodes];
	});
	const edgesPath = [...path, "edges"];
	const newEdges = get$1(response2, edgesPath);
	if (newEdges) set$1(response1, edgesPath, (values) => {
		return [...values, ...newEdges];
	});
	const pageInfoPath = [...path, "pageInfo"];
	set$1(response1, pageInfoPath, get$1(response2, pageInfoPath));
	return response1;
};
var createPaginate = (octokit) => {
	const iterator = createIterator(octokit);
	return async (query, initialParameters = {}) => {
		let mergedResponse = {};
		for await (const response of iterator(query, initialParameters)) mergedResponse = mergeResponses(mergedResponse, response);
		return mergedResponse;
	};
};
function paginateGraphQL(octokit) {
	return { graphql: Object.assign(octokit.graphql, { paginate: Object.assign(createPaginate(octokit), { iterator: createIterator(octokit) }) }) };
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-rest-endpoint-methods@17.0.0_@octokit+core@7.0.6/node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/version.js
const VERSION$10 = "17.0.0";

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-rest-endpoint-methods@17.0.0_@octokit+core@7.0.6/node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/generated/endpoints.js
var endpoints_default = {
	actions: {
		addCustomLabelsToSelfHostedRunnerForOrg: ["POST /orgs/{org}/actions/runners/{runner_id}/labels"],
		addCustomLabelsToSelfHostedRunnerForRepo: ["POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		addRepoAccessToSelfHostedRunnerGroupInOrg: ["PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}"],
		addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
		addSelectedRepoToOrgVariable: ["PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"],
		approveWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"],
		cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
		createEnvironmentVariable: ["POST /repos/{owner}/{repo}/environments/{environment_name}/variables"],
		createHostedRunnerForOrg: ["POST /orgs/{org}/actions/hosted-runners"],
		createOrUpdateEnvironmentSecret: ["PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],
		createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
		createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
		createOrgVariable: ["POST /orgs/{org}/actions/variables"],
		createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
		createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
		createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
		createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
		createRepoVariable: ["POST /repos/{owner}/{repo}/actions/variables"],
		createWorkflowDispatch: ["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],
		deleteActionsCacheById: ["DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}"],
		deleteActionsCacheByKey: ["DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}"],
		deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
		deleteCustomImageFromOrg: ["DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}"],
		deleteCustomImageVersionFromOrg: ["DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}"],
		deleteEnvironmentSecret: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],
		deleteEnvironmentVariable: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],
		deleteHostedRunnerForOrg: ["DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
		deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
		deleteOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}"],
		deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
		deleteRepoVariable: ["DELETE /repos/{owner}/{repo}/actions/variables/{name}"],
		deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
		deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
		deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
		deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
		disableSelectedRepositoryGithubActionsOrganization: ["DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"],
		disableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"],
		downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
		downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
		downloadWorkflowRunAttemptLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs"],
		downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
		enableSelectedRepositoryGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"],
		enableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"],
		forceCancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel"],
		generateRunnerJitconfigForOrg: ["POST /orgs/{org}/actions/runners/generate-jitconfig"],
		generateRunnerJitconfigForRepo: ["POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig"],
		getActionsCacheList: ["GET /repos/{owner}/{repo}/actions/caches"],
		getActionsCacheUsage: ["GET /repos/{owner}/{repo}/actions/cache/usage"],
		getActionsCacheUsageByRepoForOrg: ["GET /orgs/{org}/actions/cache/usage-by-repository"],
		getActionsCacheUsageForOrg: ["GET /orgs/{org}/actions/cache/usage"],
		getAllowedActionsOrganization: ["GET /orgs/{org}/actions/permissions/selected-actions"],
		getAllowedActionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions/selected-actions"],
		getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
		getCustomImageForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}"],
		getCustomImageVersionForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}"],
		getCustomOidcSubClaimForRepo: ["GET /repos/{owner}/{repo}/actions/oidc/customization/sub"],
		getEnvironmentPublicKey: ["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key"],
		getEnvironmentSecret: ["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],
		getEnvironmentVariable: ["GET /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],
		getGithubActionsDefaultWorkflowPermissionsOrganization: ["GET /orgs/{org}/actions/permissions/workflow"],
		getGithubActionsDefaultWorkflowPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions/workflow"],
		getGithubActionsPermissionsOrganization: ["GET /orgs/{org}/actions/permissions"],
		getGithubActionsPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions"],
		getHostedRunnerForOrg: ["GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
		getHostedRunnersGithubOwnedImagesForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/github-owned"],
		getHostedRunnersLimitsForOrg: ["GET /orgs/{org}/actions/hosted-runners/limits"],
		getHostedRunnersMachineSpecsForOrg: ["GET /orgs/{org}/actions/hosted-runners/machine-sizes"],
		getHostedRunnersPartnerImagesForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/partner"],
		getHostedRunnersPlatformsForOrg: ["GET /orgs/{org}/actions/hosted-runners/platforms"],
		getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
		getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
		getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
		getOrgVariable: ["GET /orgs/{org}/actions/variables/{name}"],
		getPendingDeploymentsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
		getRepoPermissions: [
			"GET /repos/{owner}/{repo}/actions/permissions",
			{},
			{ renamed: ["actions", "getGithubActionsPermissionsRepository"] }
		],
		getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
		getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
		getRepoVariable: ["GET /repos/{owner}/{repo}/actions/variables/{name}"],
		getReviewsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"],
		getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
		getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
		getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
		getWorkflowAccessToRepository: ["GET /repos/{owner}/{repo}/actions/permissions/access"],
		getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
		getWorkflowRunAttempt: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}"],
		getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
		getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
		listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
		listCustomImageVersionsForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions"],
		listCustomImagesForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom"],
		listEnvironmentSecrets: ["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets"],
		listEnvironmentVariables: ["GET /repos/{owner}/{repo}/environments/{environment_name}/variables"],
		listGithubHostedRunnersInGroupForOrg: ["GET /orgs/{org}/actions/runner-groups/{runner_group_id}/hosted-runners"],
		listHostedRunnersForOrg: ["GET /orgs/{org}/actions/hosted-runners"],
		listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
		listJobsForWorkflowRunAttempt: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs"],
		listLabelsForSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}/labels"],
		listLabelsForSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
		listOrgVariables: ["GET /orgs/{org}/actions/variables"],
		listRepoOrganizationSecrets: ["GET /repos/{owner}/{repo}/actions/organization-secrets"],
		listRepoOrganizationVariables: ["GET /repos/{owner}/{repo}/actions/organization-variables"],
		listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
		listRepoVariables: ["GET /repos/{owner}/{repo}/actions/variables"],
		listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
		listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
		listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
		listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
		listSelectedReposForOrgVariable: ["GET /orgs/{org}/actions/variables/{name}/repositories"],
		listSelectedRepositoriesEnabledGithubActionsOrganization: ["GET /orgs/{org}/actions/permissions/repositories"],
		listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
		listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
		listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
		listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
		listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
		reRunJobForWorkflowRun: ["POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun"],
		reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
		reRunWorkflowFailedJobs: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs"],
		removeAllCustomLabelsFromSelfHostedRunnerForOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}/labels"],
		removeAllCustomLabelsFromSelfHostedRunnerForRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		removeCustomLabelFromSelfHostedRunnerForOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}"],
		removeCustomLabelFromSelfHostedRunnerForRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}"],
		removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
		removeSelectedRepoFromOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"],
		reviewCustomGatesForRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule"],
		reviewPendingDeploymentsForRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
		setAllowedActionsOrganization: ["PUT /orgs/{org}/actions/permissions/selected-actions"],
		setAllowedActionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"],
		setCustomLabelsForSelfHostedRunnerForOrg: ["PUT /orgs/{org}/actions/runners/{runner_id}/labels"],
		setCustomLabelsForSelfHostedRunnerForRepo: ["PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		setCustomOidcSubClaimForRepo: ["PUT /repos/{owner}/{repo}/actions/oidc/customization/sub"],
		setGithubActionsDefaultWorkflowPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions/workflow"],
		setGithubActionsDefaultWorkflowPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/workflow"],
		setGithubActionsPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions"],
		setGithubActionsPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions"],
		setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"],
		setSelectedReposForOrgVariable: ["PUT /orgs/{org}/actions/variables/{name}/repositories"],
		setSelectedRepositoriesEnabledGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories"],
		setWorkflowAccessToRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/access"],
		updateEnvironmentVariable: ["PATCH /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],
		updateHostedRunnerForOrg: ["PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
		updateOrgVariable: ["PATCH /orgs/{org}/actions/variables/{name}"],
		updateRepoVariable: ["PATCH /repos/{owner}/{repo}/actions/variables/{name}"]
	},
	activity: {
		checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
		deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
		deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
		getFeeds: ["GET /feeds"],
		getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
		getThread: ["GET /notifications/threads/{thread_id}"],
		getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
		listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
		listNotificationsForAuthenticatedUser: ["GET /notifications"],
		listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
		listPublicEvents: ["GET /events"],
		listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
		listPublicEventsForUser: ["GET /users/{username}/events/public"],
		listPublicOrgEvents: ["GET /orgs/{org}/events"],
		listReceivedEventsForUser: ["GET /users/{username}/received_events"],
		listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
		listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
		listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
		listReposStarredByAuthenticatedUser: ["GET /user/starred"],
		listReposStarredByUser: ["GET /users/{username}/starred"],
		listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
		listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
		listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
		listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
		markNotificationsAsRead: ["PUT /notifications"],
		markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
		markThreadAsDone: ["DELETE /notifications/threads/{thread_id}"],
		markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
		setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
		setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
		starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
		unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
	},
	apps: {
		addRepoToInstallation: [
			"PUT /user/installations/{installation_id}/repositories/{repository_id}",
			{},
			{ renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"] }
		],
		addRepoToInstallationForAuthenticatedUser: ["PUT /user/installations/{installation_id}/repositories/{repository_id}"],
		checkToken: ["POST /applications/{client_id}/token"],
		createFromManifest: ["POST /app-manifests/{code}/conversions"],
		createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
		deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
		deleteInstallation: ["DELETE /app/installations/{installation_id}"],
		deleteToken: ["DELETE /applications/{client_id}/token"],
		getAuthenticated: ["GET /app"],
		getBySlug: ["GET /apps/{app_slug}"],
		getInstallation: ["GET /app/installations/{installation_id}"],
		getOrgInstallation: ["GET /orgs/{org}/installation"],
		getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
		getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
		getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
		getUserInstallation: ["GET /users/{username}/installation"],
		getWebhookConfigForApp: ["GET /app/hook/config"],
		getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
		listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
		listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
		listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories"],
		listInstallationRequestsForAuthenticatedApp: ["GET /app/installation-requests"],
		listInstallations: ["GET /app/installations"],
		listInstallationsForAuthenticatedUser: ["GET /user/installations"],
		listPlans: ["GET /marketplace_listing/plans"],
		listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
		listReposAccessibleToInstallation: ["GET /installation/repositories"],
		listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
		listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
		listWebhookDeliveries: ["GET /app/hook/deliveries"],
		redeliverWebhookDelivery: ["POST /app/hook/deliveries/{delivery_id}/attempts"],
		removeRepoFromInstallation: [
			"DELETE /user/installations/{installation_id}/repositories/{repository_id}",
			{},
			{ renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"] }
		],
		removeRepoFromInstallationForAuthenticatedUser: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],
		resetToken: ["PATCH /applications/{client_id}/token"],
		revokeInstallationAccessToken: ["DELETE /installation/token"],
		scopeToken: ["POST /applications/{client_id}/token/scoped"],
		suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
		unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"],
		updateWebhookConfigForApp: ["PATCH /app/hook/config"]
	},
	billing: {
		getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
		getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
		getGithubBillingPremiumRequestUsageReportOrg: ["GET /organizations/{org}/settings/billing/premium_request/usage"],
		getGithubBillingPremiumRequestUsageReportUser: ["GET /users/{username}/settings/billing/premium_request/usage"],
		getGithubBillingUsageReportOrg: ["GET /organizations/{org}/settings/billing/usage"],
		getGithubBillingUsageReportUser: ["GET /users/{username}/settings/billing/usage"],
		getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
		getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
		getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
		getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"]
	},
	campaigns: {
		createCampaign: ["POST /orgs/{org}/campaigns"],
		deleteCampaign: ["DELETE /orgs/{org}/campaigns/{campaign_number}"],
		getCampaignSummary: ["GET /orgs/{org}/campaigns/{campaign_number}"],
		listOrgCampaigns: ["GET /orgs/{org}/campaigns"],
		updateCampaign: ["PATCH /orgs/{org}/campaigns/{campaign_number}"]
	},
	checks: {
		create: ["POST /repos/{owner}/{repo}/check-runs"],
		createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
		get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
		getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
		listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"],
		listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
		listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"],
		listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
		rerequestRun: ["POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"],
		rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"],
		setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences"],
		update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
	},
	codeScanning: {
		commitAutofix: ["POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix/commits"],
		createAutofix: ["POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],
		createVariantAnalysis: ["POST /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses"],
		deleteAnalysis: ["DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"],
		deleteCodeqlDatabase: ["DELETE /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"],
		getAlert: [
			"GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
			{},
			{ renamedParameters: { alert_id: "alert_number" } }
		],
		getAnalysis: ["GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"],
		getAutofix: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],
		getCodeqlDatabase: ["GET /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"],
		getDefaultSetup: ["GET /repos/{owner}/{repo}/code-scanning/default-setup"],
		getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
		getVariantAnalysis: ["GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}"],
		getVariantAnalysisRepoTask: ["GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}/repos/{repo_owner}/{repo_name}"],
		listAlertInstances: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"],
		listAlertsForOrg: ["GET /orgs/{org}/code-scanning/alerts"],
		listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
		listAlertsInstances: [
			"GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
			{},
			{ renamed: ["codeScanning", "listAlertInstances"] }
		],
		listCodeqlDatabases: ["GET /repos/{owner}/{repo}/code-scanning/codeql/databases"],
		listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
		updateAlert: ["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],
		updateDefaultSetup: ["PATCH /repos/{owner}/{repo}/code-scanning/default-setup"],
		uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
	},
	codeSecurity: {
		attachConfiguration: ["POST /orgs/{org}/code-security/configurations/{configuration_id}/attach"],
		attachEnterpriseConfiguration: ["POST /enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach"],
		createConfiguration: ["POST /orgs/{org}/code-security/configurations"],
		createConfigurationForEnterprise: ["POST /enterprises/{enterprise}/code-security/configurations"],
		deleteConfiguration: ["DELETE /orgs/{org}/code-security/configurations/{configuration_id}"],
		deleteConfigurationForEnterprise: ["DELETE /enterprises/{enterprise}/code-security/configurations/{configuration_id}"],
		detachConfiguration: ["DELETE /orgs/{org}/code-security/configurations/detach"],
		getConfiguration: ["GET /orgs/{org}/code-security/configurations/{configuration_id}"],
		getConfigurationForRepository: ["GET /repos/{owner}/{repo}/code-security-configuration"],
		getConfigurationsForEnterprise: ["GET /enterprises/{enterprise}/code-security/configurations"],
		getConfigurationsForOrg: ["GET /orgs/{org}/code-security/configurations"],
		getDefaultConfigurations: ["GET /orgs/{org}/code-security/configurations/defaults"],
		getDefaultConfigurationsForEnterprise: ["GET /enterprises/{enterprise}/code-security/configurations/defaults"],
		getRepositoriesForConfiguration: ["GET /orgs/{org}/code-security/configurations/{configuration_id}/repositories"],
		getRepositoriesForEnterpriseConfiguration: ["GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}/repositories"],
		getSingleConfigurationForEnterprise: ["GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}"],
		setConfigurationAsDefault: ["PUT /orgs/{org}/code-security/configurations/{configuration_id}/defaults"],
		setConfigurationAsDefaultForEnterprise: ["PUT /enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults"],
		updateConfiguration: ["PATCH /orgs/{org}/code-security/configurations/{configuration_id}"],
		updateEnterpriseConfiguration: ["PATCH /enterprises/{enterprise}/code-security/configurations/{configuration_id}"]
	},
	codesOfConduct: {
		getAllCodesOfConduct: ["GET /codes_of_conduct"],
		getConductCode: ["GET /codes_of_conduct/{key}"]
	},
	codespaces: {
		addRepositoryForSecretForAuthenticatedUser: ["PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		checkPermissionsForDevcontainer: ["GET /repos/{owner}/{repo}/codespaces/permissions_check"],
		codespaceMachinesForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}/machines"],
		createForAuthenticatedUser: ["POST /user/codespaces"],
		createOrUpdateOrgSecret: ["PUT /orgs/{org}/codespaces/secrets/{secret_name}"],
		createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
		createOrUpdateSecretForAuthenticatedUser: ["PUT /user/codespaces/secrets/{secret_name}"],
		createWithPrForAuthenticatedUser: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces"],
		createWithRepoForAuthenticatedUser: ["POST /repos/{owner}/{repo}/codespaces"],
		deleteForAuthenticatedUser: ["DELETE /user/codespaces/{codespace_name}"],
		deleteFromOrganization: ["DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}"],
		deleteOrgSecret: ["DELETE /orgs/{org}/codespaces/secrets/{secret_name}"],
		deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
		deleteSecretForAuthenticatedUser: ["DELETE /user/codespaces/secrets/{secret_name}"],
		exportForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/exports"],
		getCodespacesForUserInOrg: ["GET /orgs/{org}/members/{username}/codespaces"],
		getExportDetailsForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}/exports/{export_id}"],
		getForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}"],
		getOrgPublicKey: ["GET /orgs/{org}/codespaces/secrets/public-key"],
		getOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}"],
		getPublicKeyForAuthenticatedUser: ["GET /user/codespaces/secrets/public-key"],
		getRepoPublicKey: ["GET /repos/{owner}/{repo}/codespaces/secrets/public-key"],
		getRepoSecret: ["GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
		getSecretForAuthenticatedUser: ["GET /user/codespaces/secrets/{secret_name}"],
		listDevcontainersInRepositoryForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/devcontainers"],
		listForAuthenticatedUser: ["GET /user/codespaces"],
		listInOrganization: [
			"GET /orgs/{org}/codespaces",
			{},
			{ renamedParameters: { org_id: "org" } }
		],
		listInRepositoryForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces"],
		listOrgSecrets: ["GET /orgs/{org}/codespaces/secrets"],
		listRepoSecrets: ["GET /repos/{owner}/{repo}/codespaces/secrets"],
		listRepositoriesForSecretForAuthenticatedUser: ["GET /user/codespaces/secrets/{secret_name}/repositories"],
		listSecretsForAuthenticatedUser: ["GET /user/codespaces/secrets"],
		listSelectedReposForOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories"],
		preFlightWithRepoForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/new"],
		publishForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/publish"],
		removeRepositoryForSecretForAuthenticatedUser: ["DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		repoMachinesForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/machines"],
		setRepositoriesForSecretForAuthenticatedUser: ["PUT /user/codespaces/secrets/{secret_name}/repositories"],
		setSelectedReposForOrgSecret: ["PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories"],
		startForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/start"],
		stopForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/stop"],
		stopInOrganization: ["POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop"],
		updateForAuthenticatedUser: ["PATCH /user/codespaces/{codespace_name}"]
	},
	copilot: {
		addCopilotSeatsForTeams: ["POST /orgs/{org}/copilot/billing/selected_teams"],
		addCopilotSeatsForUsers: ["POST /orgs/{org}/copilot/billing/selected_users"],
		cancelCopilotSeatAssignmentForTeams: ["DELETE /orgs/{org}/copilot/billing/selected_teams"],
		cancelCopilotSeatAssignmentForUsers: ["DELETE /orgs/{org}/copilot/billing/selected_users"],
		copilotMetricsForOrganization: ["GET /orgs/{org}/copilot/metrics"],
		copilotMetricsForTeam: ["GET /orgs/{org}/team/{team_slug}/copilot/metrics"],
		getCopilotOrganizationDetails: ["GET /orgs/{org}/copilot/billing"],
		getCopilotSeatDetailsForUser: ["GET /orgs/{org}/members/{username}/copilot"],
		listCopilotSeats: ["GET /orgs/{org}/copilot/billing/seats"]
	},
	credentials: { revoke: ["POST /credentials/revoke"] },
	dependabot: {
		addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"],
		createOrUpdateOrgSecret: ["PUT /orgs/{org}/dependabot/secrets/{secret_name}"],
		createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
		deleteOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}"],
		deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
		getAlert: ["GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
		getOrgPublicKey: ["GET /orgs/{org}/dependabot/secrets/public-key"],
		getOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}"],
		getRepoPublicKey: ["GET /repos/{owner}/{repo}/dependabot/secrets/public-key"],
		getRepoSecret: ["GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
		listAlertsForEnterprise: ["GET /enterprises/{enterprise}/dependabot/alerts"],
		listAlertsForOrg: ["GET /orgs/{org}/dependabot/alerts"],
		listAlertsForRepo: ["GET /repos/{owner}/{repo}/dependabot/alerts"],
		listOrgSecrets: ["GET /orgs/{org}/dependabot/secrets"],
		listRepoSecrets: ["GET /repos/{owner}/{repo}/dependabot/secrets"],
		listSelectedReposForOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories"],
		removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"],
		repositoryAccessForOrg: ["GET /organizations/{org}/dependabot/repository-access"],
		setRepositoryAccessDefaultLevel: ["PUT /organizations/{org}/dependabot/repository-access/default-level"],
		setSelectedReposForOrgSecret: ["PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories"],
		updateAlert: ["PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
		updateRepositoryAccessForOrg: ["PATCH /organizations/{org}/dependabot/repository-access"]
	},
	dependencyGraph: {
		createRepositorySnapshot: ["POST /repos/{owner}/{repo}/dependency-graph/snapshots"],
		diffRange: ["GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}"],
		exportSbom: ["GET /repos/{owner}/{repo}/dependency-graph/sbom"]
	},
	emojis: { get: ["GET /emojis"] },
	enterpriseTeamMemberships: {
		add: ["PUT /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"],
		bulkAdd: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/add"],
		bulkRemove: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/remove"],
		get: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"],
		list: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships"],
		remove: ["DELETE /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"]
	},
	enterpriseTeamOrganizations: {
		add: ["PUT /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
		bulkAdd: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/add"],
		bulkRemove: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/remove"],
		delete: ["DELETE /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
		getAssignment: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
		getAssignments: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations"]
	},
	enterpriseTeams: {
		create: ["POST /enterprises/{enterprise}/teams"],
		delete: ["DELETE /enterprises/{enterprise}/teams/{team_slug}"],
		get: ["GET /enterprises/{enterprise}/teams/{team_slug}"],
		list: ["GET /enterprises/{enterprise}/teams"],
		update: ["PATCH /enterprises/{enterprise}/teams/{team_slug}"]
	},
	gists: {
		checkIsStarred: ["GET /gists/{gist_id}/star"],
		create: ["POST /gists"],
		createComment: ["POST /gists/{gist_id}/comments"],
		delete: ["DELETE /gists/{gist_id}"],
		deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
		fork: ["POST /gists/{gist_id}/forks"],
		get: ["GET /gists/{gist_id}"],
		getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
		getRevision: ["GET /gists/{gist_id}/{sha}"],
		list: ["GET /gists"],
		listComments: ["GET /gists/{gist_id}/comments"],
		listCommits: ["GET /gists/{gist_id}/commits"],
		listForUser: ["GET /users/{username}/gists"],
		listForks: ["GET /gists/{gist_id}/forks"],
		listPublic: ["GET /gists/public"],
		listStarred: ["GET /gists/starred"],
		star: ["PUT /gists/{gist_id}/star"],
		unstar: ["DELETE /gists/{gist_id}/star"],
		update: ["PATCH /gists/{gist_id}"],
		updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
	},
	git: {
		createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
		createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
		createRef: ["POST /repos/{owner}/{repo}/git/refs"],
		createTag: ["POST /repos/{owner}/{repo}/git/tags"],
		createTree: ["POST /repos/{owner}/{repo}/git/trees"],
		deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
		getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
		getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
		getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
		getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
		getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
		listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
		updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
	},
	gitignore: {
		getAllTemplates: ["GET /gitignore/templates"],
		getTemplate: ["GET /gitignore/templates/{name}"]
	},
	hostedCompute: {
		createNetworkConfigurationForOrg: ["POST /orgs/{org}/settings/network-configurations"],
		deleteNetworkConfigurationFromOrg: ["DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id}"],
		getNetworkConfigurationForOrg: ["GET /orgs/{org}/settings/network-configurations/{network_configuration_id}"],
		getNetworkSettingsForOrg: ["GET /orgs/{org}/settings/network-settings/{network_settings_id}"],
		listNetworkConfigurationsForOrg: ["GET /orgs/{org}/settings/network-configurations"],
		updateNetworkConfigurationForOrg: ["PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id}"]
	},
	interactions: {
		getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
		getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
		getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
		getRestrictionsForYourPublicRepos: [
			"GET /user/interaction-limits",
			{},
			{ renamed: ["interactions", "getRestrictionsForAuthenticatedUser"] }
		],
		removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
		removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
		removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits"],
		removeRestrictionsForYourPublicRepos: [
			"DELETE /user/interaction-limits",
			{},
			{ renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"] }
		],
		setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
		setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
		setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
		setRestrictionsForYourPublicRepos: [
			"PUT /user/interaction-limits",
			{},
			{ renamed: ["interactions", "setRestrictionsForAuthenticatedUser"] }
		]
	},
	issues: {
		addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
		addBlockedByDependency: ["POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by"],
		addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		addSubIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],
		checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
		checkUserCanBeAssignedToIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}"],
		create: ["POST /repos/{owner}/{repo}/issues"],
		createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
		createLabel: ["POST /repos/{owner}/{repo}/labels"],
		createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
		deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
		deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
		deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
		get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
		getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
		getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
		getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
		getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
		getParent: ["GET /repos/{owner}/{repo}/issues/{issue_number}/parent"],
		list: ["GET /issues"],
		listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
		listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
		listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
		listDependenciesBlockedBy: ["GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by"],
		listDependenciesBlocking: ["GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocking"],
		listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
		listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
		listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"],
		listForAuthenticatedUser: ["GET /user/issues"],
		listForOrg: ["GET /orgs/{org}/issues"],
		listForRepo: ["GET /repos/{owner}/{repo}/issues"],
		listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
		listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
		listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
		listSubIssues: ["GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],
		lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
		removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
		removeDependencyBlockedBy: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by/{issue_id}"],
		removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
		removeSubIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue"],
		reprioritizeSubIssue: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority"],
		setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
		update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
		updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
		updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
		updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
	},
	licenses: {
		get: ["GET /licenses/{license}"],
		getAllCommonlyUsed: ["GET /licenses"],
		getForRepo: ["GET /repos/{owner}/{repo}/license"]
	},
	markdown: {
		render: ["POST /markdown"],
		renderRaw: ["POST /markdown/raw", { headers: { "content-type": "text/plain; charset=utf-8" } }]
	},
	meta: {
		get: ["GET /meta"],
		getAllVersions: ["GET /versions"],
		getOctocat: ["GET /octocat"],
		getZen: ["GET /zen"],
		root: ["GET /"]
	},
	migrations: {
		deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive"],
		deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive"],
		downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive"],
		getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive"],
		getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
		getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
		listForAuthenticatedUser: ["GET /user/migrations"],
		listForOrg: ["GET /orgs/{org}/migrations"],
		listReposForAuthenticatedUser: ["GET /user/migrations/{migration_id}/repositories"],
		listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
		listReposForUser: [
			"GET /user/migrations/{migration_id}/repositories",
			{},
			{ renamed: ["migrations", "listReposForAuthenticatedUser"] }
		],
		startForAuthenticatedUser: ["POST /user/migrations"],
		startForOrg: ["POST /orgs/{org}/migrations"],
		unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock"],
		unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"]
	},
	oidc: {
		getOidcCustomSubTemplateForOrg: ["GET /orgs/{org}/actions/oidc/customization/sub"],
		updateOidcCustomSubTemplateForOrg: ["PUT /orgs/{org}/actions/oidc/customization/sub"]
	},
	orgs: {
		addSecurityManagerTeam: [
			"PUT /orgs/{org}/security-managers/teams/{team_slug}",
			{},
			{ deprecated: "octokit.rest.orgs.addSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#add-a-security-manager-team" }
		],
		assignTeamToOrgRole: ["PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],
		assignUserToOrgRole: ["PUT /orgs/{org}/organization-roles/users/{username}/{role_id}"],
		blockUser: ["PUT /orgs/{org}/blocks/{username}"],
		cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
		checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
		checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
		checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
		convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
		createArtifactStorageRecord: ["POST /orgs/{org}/artifacts/metadata/storage-record"],
		createInvitation: ["POST /orgs/{org}/invitations"],
		createIssueType: ["POST /orgs/{org}/issue-types"],
		createWebhook: ["POST /orgs/{org}/hooks"],
		customPropertiesForOrgsCreateOrUpdateOrganizationValues: ["PATCH /organizations/{org}/org-properties/values"],
		customPropertiesForOrgsGetOrganizationValues: ["GET /organizations/{org}/org-properties/values"],
		customPropertiesForReposCreateOrUpdateOrganizationDefinition: ["PUT /orgs/{org}/properties/schema/{custom_property_name}"],
		customPropertiesForReposCreateOrUpdateOrganizationDefinitions: ["PATCH /orgs/{org}/properties/schema"],
		customPropertiesForReposCreateOrUpdateOrganizationValues: ["PATCH /orgs/{org}/properties/values"],
		customPropertiesForReposDeleteOrganizationDefinition: ["DELETE /orgs/{org}/properties/schema/{custom_property_name}"],
		customPropertiesForReposGetOrganizationDefinition: ["GET /orgs/{org}/properties/schema/{custom_property_name}"],
		customPropertiesForReposGetOrganizationDefinitions: ["GET /orgs/{org}/properties/schema"],
		customPropertiesForReposGetOrganizationValues: ["GET /orgs/{org}/properties/values"],
		delete: ["DELETE /orgs/{org}"],
		deleteAttestationsBulk: ["POST /orgs/{org}/attestations/delete-request"],
		deleteAttestationsById: ["DELETE /orgs/{org}/attestations/{attestation_id}"],
		deleteAttestationsBySubjectDigest: ["DELETE /orgs/{org}/attestations/digest/{subject_digest}"],
		deleteIssueType: ["DELETE /orgs/{org}/issue-types/{issue_type_id}"],
		deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
		disableSelectedRepositoryImmutableReleasesOrganization: ["DELETE /orgs/{org}/settings/immutable-releases/repositories/{repository_id}"],
		enableSelectedRepositoryImmutableReleasesOrganization: ["PUT /orgs/{org}/settings/immutable-releases/repositories/{repository_id}"],
		get: ["GET /orgs/{org}"],
		getImmutableReleasesSettings: ["GET /orgs/{org}/settings/immutable-releases"],
		getImmutableReleasesSettingsRepositories: ["GET /orgs/{org}/settings/immutable-releases/repositories"],
		getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
		getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
		getOrgRole: ["GET /orgs/{org}/organization-roles/{role_id}"],
		getOrgRulesetHistory: ["GET /orgs/{org}/rulesets/{ruleset_id}/history"],
		getOrgRulesetVersion: ["GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id}"],
		getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
		getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
		getWebhookDelivery: ["GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"],
		list: ["GET /organizations"],
		listAppInstallations: ["GET /orgs/{org}/installations"],
		listArtifactStorageRecords: ["GET /orgs/{org}/artifacts/{subject_digest}/metadata/storage-records"],
		listAttestationRepositories: ["GET /orgs/{org}/attestations/repositories"],
		listAttestations: ["GET /orgs/{org}/attestations/{subject_digest}"],
		listAttestationsBulk: ["POST /orgs/{org}/attestations/bulk-list{?per_page,before,after}"],
		listBlockedUsers: ["GET /orgs/{org}/blocks"],
		listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
		listForAuthenticatedUser: ["GET /user/orgs"],
		listForUser: ["GET /users/{username}/orgs"],
		listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
		listIssueTypes: ["GET /orgs/{org}/issue-types"],
		listMembers: ["GET /orgs/{org}/members"],
		listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
		listOrgRoleTeams: ["GET /orgs/{org}/organization-roles/{role_id}/teams"],
		listOrgRoleUsers: ["GET /orgs/{org}/organization-roles/{role_id}/users"],
		listOrgRoles: ["GET /orgs/{org}/organization-roles"],
		listOrganizationFineGrainedPermissions: ["GET /orgs/{org}/organization-fine-grained-permissions"],
		listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
		listPatGrantRepositories: ["GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories"],
		listPatGrantRequestRepositories: ["GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories"],
		listPatGrantRequests: ["GET /orgs/{org}/personal-access-token-requests"],
		listPatGrants: ["GET /orgs/{org}/personal-access-tokens"],
		listPendingInvitations: ["GET /orgs/{org}/invitations"],
		listPublicMembers: ["GET /orgs/{org}/public_members"],
		listSecurityManagerTeams: [
			"GET /orgs/{org}/security-managers",
			{},
			{ deprecated: "octokit.rest.orgs.listSecurityManagerTeams() is deprecated, see https://docs.github.com/rest/orgs/security-managers#list-security-manager-teams" }
		],
		listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
		listWebhooks: ["GET /orgs/{org}/hooks"],
		pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
		redeliverWebhookDelivery: ["POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
		removeMember: ["DELETE /orgs/{org}/members/{username}"],
		removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
		removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
		removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
		removeSecurityManagerTeam: [
			"DELETE /orgs/{org}/security-managers/teams/{team_slug}",
			{},
			{ deprecated: "octokit.rest.orgs.removeSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#remove-a-security-manager-team" }
		],
		reviewPatGrantRequest: ["POST /orgs/{org}/personal-access-token-requests/{pat_request_id}"],
		reviewPatGrantRequestsInBulk: ["POST /orgs/{org}/personal-access-token-requests"],
		revokeAllOrgRolesTeam: ["DELETE /orgs/{org}/organization-roles/teams/{team_slug}"],
		revokeAllOrgRolesUser: ["DELETE /orgs/{org}/organization-roles/users/{username}"],
		revokeOrgRoleTeam: ["DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],
		revokeOrgRoleUser: ["DELETE /orgs/{org}/organization-roles/users/{username}/{role_id}"],
		setImmutableReleasesSettings: ["PUT /orgs/{org}/settings/immutable-releases"],
		setImmutableReleasesSettingsRepositories: ["PUT /orgs/{org}/settings/immutable-releases/repositories"],
		setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
		setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
		unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
		update: ["PATCH /orgs/{org}"],
		updateIssueType: ["PUT /orgs/{org}/issue-types/{issue_type_id}"],
		updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
		updatePatAccess: ["POST /orgs/{org}/personal-access-tokens/{pat_id}"],
		updatePatAccesses: ["POST /orgs/{org}/personal-access-tokens"],
		updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
		updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
	},
	packages: {
		deletePackageForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}"],
		deletePackageForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}"],
		deletePackageForUser: ["DELETE /users/{username}/packages/{package_type}/{package_name}"],
		deletePackageVersionForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		deletePackageVersionForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		deletePackageVersionForUser: ["DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		getAllPackageVersionsForAPackageOwnedByAnOrg: [
			"GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
			{},
			{ renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"] }
		],
		getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
			"GET /user/packages/{package_type}/{package_name}/versions",
			{},
			{ renamed: ["packages", "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"] }
		],
		getAllPackageVersionsForPackageOwnedByAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions"],
		getAllPackageVersionsForPackageOwnedByOrg: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions"],
		getAllPackageVersionsForPackageOwnedByUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions"],
		getPackageForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}"],
		getPackageForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}"],
		getPackageForUser: ["GET /users/{username}/packages/{package_type}/{package_name}"],
		getPackageVersionForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		getPackageVersionForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		getPackageVersionForUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		listDockerMigrationConflictingPackagesForAuthenticatedUser: ["GET /user/docker/conflicts"],
		listDockerMigrationConflictingPackagesForOrganization: ["GET /orgs/{org}/docker/conflicts"],
		listDockerMigrationConflictingPackagesForUser: ["GET /users/{username}/docker/conflicts"],
		listPackagesForAuthenticatedUser: ["GET /user/packages"],
		listPackagesForOrganization: ["GET /orgs/{org}/packages"],
		listPackagesForUser: ["GET /users/{username}/packages"],
		restorePackageForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/restore{?token}"],
		restorePackageForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"],
		restorePackageForUser: ["POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}"],
		restorePackageVersionForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],
		restorePackageVersionForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],
		restorePackageVersionForUser: ["POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"]
	},
	privateRegistries: {
		createOrgPrivateRegistry: ["POST /orgs/{org}/private-registries"],
		deleteOrgPrivateRegistry: ["DELETE /orgs/{org}/private-registries/{secret_name}"],
		getOrgPrivateRegistry: ["GET /orgs/{org}/private-registries/{secret_name}"],
		getOrgPublicKey: ["GET /orgs/{org}/private-registries/public-key"],
		listOrgPrivateRegistries: ["GET /orgs/{org}/private-registries"],
		updateOrgPrivateRegistry: ["PATCH /orgs/{org}/private-registries/{secret_name}"]
	},
	projects: {
		addItemForOrg: ["POST /orgs/{org}/projectsV2/{project_number}/items"],
		addItemForUser: ["POST /users/{username}/projectsV2/{project_number}/items"],
		deleteItemForOrg: ["DELETE /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
		deleteItemForUser: ["DELETE /users/{username}/projectsV2/{project_number}/items/{item_id}"],
		getFieldForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields/{field_id}"],
		getFieldForUser: ["GET /users/{username}/projectsV2/{project_number}/fields/{field_id}"],
		getForOrg: ["GET /orgs/{org}/projectsV2/{project_number}"],
		getForUser: ["GET /users/{username}/projectsV2/{project_number}"],
		getOrgItem: ["GET /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
		getUserItem: ["GET /users/{username}/projectsV2/{project_number}/items/{item_id}"],
		listFieldsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields"],
		listFieldsForUser: ["GET /users/{username}/projectsV2/{project_number}/fields"],
		listForOrg: ["GET /orgs/{org}/projectsV2"],
		listForUser: ["GET /users/{username}/projectsV2"],
		listItemsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/items"],
		listItemsForUser: ["GET /users/{username}/projectsV2/{project_number}/items"],
		updateItemForOrg: ["PATCH /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
		updateItemForUser: ["PATCH /users/{username}/projectsV2/{project_number}/items/{item_id}"]
	},
	pulls: {
		checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
		create: ["POST /repos/{owner}/{repo}/pulls"],
		createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
		createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
		createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
		deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
		deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
		dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
		get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
		getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
		getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
		list: ["GET /repos/{owner}/{repo}/pulls"],
		listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
		listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
		listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
		listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
		listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
		listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
		listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
		merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
		removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
		requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
		submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
		update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
		updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"],
		updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
		updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
	},
	rateLimit: { get: ["GET /rate_limit"] },
	reactions: {
		createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
		createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
		createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
		createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],
		createForRelease: ["POST /repos/{owner}/{repo}/releases/{release_id}/reactions"],
		createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],
		createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"],
		deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}"],
		deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}"],
		deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}"],
		deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}"],
		deleteForRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}"],
		deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}"],
		deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}"],
		listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
		listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
		listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
		listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],
		listForRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}/reactions"],
		listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],
		listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"]
	},
	repos: {
		acceptInvitation: [
			"PATCH /user/repository_invitations/{invitation_id}",
			{},
			{ renamed: ["repos", "acceptInvitationForAuthenticatedUser"] }
		],
		acceptInvitationForAuthenticatedUser: ["PATCH /user/repository_invitations/{invitation_id}"],
		addAppAccessRestrictions: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
			{},
			{ mapToData: "apps" }
		],
		addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
		addStatusCheckContexts: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
			{},
			{ mapToData: "contexts" }
		],
		addTeamAccessRestrictions: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
			{},
			{ mapToData: "teams" }
		],
		addUserAccessRestrictions: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
			{},
			{ mapToData: "users" }
		],
		cancelPagesDeployment: ["POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel"],
		checkAutomatedSecurityFixes: ["GET /repos/{owner}/{repo}/automated-security-fixes"],
		checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
		checkImmutableReleases: ["GET /repos/{owner}/{repo}/immutable-releases"],
		checkPrivateVulnerabilityReporting: ["GET /repos/{owner}/{repo}/private-vulnerability-reporting"],
		checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts"],
		codeownersErrors: ["GET /repos/{owner}/{repo}/codeowners/errors"],
		compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
		compareCommitsWithBasehead: ["GET /repos/{owner}/{repo}/compare/{basehead}"],
		createAttestation: ["POST /repos/{owner}/{repo}/attestations"],
		createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
		createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
		createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
		createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
		createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
		createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
		createDeploymentBranchPolicy: ["POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"],
		createDeploymentProtectionRule: ["POST /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"],
		createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
		createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
		createForAuthenticatedUser: ["POST /user/repos"],
		createFork: ["POST /repos/{owner}/{repo}/forks"],
		createInOrg: ["POST /orgs/{org}/repos"],
		createOrUpdateEnvironment: ["PUT /repos/{owner}/{repo}/environments/{environment_name}"],
		createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
		createOrgRuleset: ["POST /orgs/{org}/rulesets"],
		createPagesDeployment: ["POST /repos/{owner}/{repo}/pages/deployments"],
		createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
		createRelease: ["POST /repos/{owner}/{repo}/releases"],
		createRepoRuleset: ["POST /repos/{owner}/{repo}/rulesets"],
		createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate"],
		createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
		customPropertiesForReposCreateOrUpdateRepositoryValues: ["PATCH /repos/{owner}/{repo}/properties/values"],
		customPropertiesForReposGetRepositoryValues: ["GET /repos/{owner}/{repo}/properties/values"],
		declineInvitation: [
			"DELETE /user/repository_invitations/{invitation_id}",
			{},
			{ renamed: ["repos", "declineInvitationForAuthenticatedUser"] }
		],
		declineInvitationForAuthenticatedUser: ["DELETE /user/repository_invitations/{invitation_id}"],
		delete: ["DELETE /repos/{owner}/{repo}"],
		deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
		deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
		deleteAnEnvironment: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}"],
		deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
		deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
		deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
		deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
		deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
		deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
		deleteDeploymentBranchPolicy: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],
		deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
		deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
		deleteOrgRuleset: ["DELETE /orgs/{org}/rulesets/{ruleset_id}"],
		deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
		deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
		deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
		deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
		deleteRepoRuleset: ["DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
		deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
		disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes"],
		disableDeploymentProtectionRule: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"],
		disableImmutableReleases: ["DELETE /repos/{owner}/{repo}/immutable-releases"],
		disablePrivateVulnerabilityReporting: ["DELETE /repos/{owner}/{repo}/private-vulnerability-reporting"],
		disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts"],
		downloadArchive: [
			"GET /repos/{owner}/{repo}/zipball/{ref}",
			{},
			{ renamed: ["repos", "downloadZipballArchive"] }
		],
		downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
		downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
		enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes"],
		enableImmutableReleases: ["PUT /repos/{owner}/{repo}/immutable-releases"],
		enablePrivateVulnerabilityReporting: ["PUT /repos/{owner}/{repo}/private-vulnerability-reporting"],
		enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts"],
		generateReleaseNotes: ["POST /repos/{owner}/{repo}/releases/generate-notes"],
		get: ["GET /repos/{owner}/{repo}"],
		getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
		getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
		getAllDeploymentProtectionRules: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"],
		getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
		getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
		getAllTopics: ["GET /repos/{owner}/{repo}/topics"],
		getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
		getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
		getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
		getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
		getBranchRules: ["GET /repos/{owner}/{repo}/rules/branches/{branch}"],
		getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
		getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
		getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
		getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
		getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
		getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
		getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
		getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
		getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
		getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
		getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
		getCustomDeploymentProtectionRule: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"],
		getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
		getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
		getDeploymentBranchPolicy: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],
		getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
		getEnvironment: ["GET /repos/{owner}/{repo}/environments/{environment_name}"],
		getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
		getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
		getOrgRuleSuite: ["GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}"],
		getOrgRuleSuites: ["GET /orgs/{org}/rulesets/rule-suites"],
		getOrgRuleset: ["GET /orgs/{org}/rulesets/{ruleset_id}"],
		getOrgRulesets: ["GET /orgs/{org}/rulesets"],
		getPages: ["GET /repos/{owner}/{repo}/pages"],
		getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
		getPagesDeployment: ["GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}"],
		getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
		getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
		getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
		getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
		getReadme: ["GET /repos/{owner}/{repo}/readme"],
		getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
		getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
		getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
		getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
		getRepoRuleSuite: ["GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}"],
		getRepoRuleSuites: ["GET /repos/{owner}/{repo}/rulesets/rule-suites"],
		getRepoRuleset: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
		getRepoRulesetHistory: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history"],
		getRepoRulesetVersion: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id}"],
		getRepoRulesets: ["GET /repos/{owner}/{repo}/rulesets"],
		getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
		getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
		getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
		getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
		getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
		getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
		getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
		getWebhookConfigForRepo: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/config"],
		getWebhookDelivery: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"],
		listActivities: ["GET /repos/{owner}/{repo}/activity"],
		listAttestations: ["GET /repos/{owner}/{repo}/attestations/{subject_digest}"],
		listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
		listBranches: ["GET /repos/{owner}/{repo}/branches"],
		listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head"],
		listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
		listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
		listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
		listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
		listCommits: ["GET /repos/{owner}/{repo}/commits"],
		listContributors: ["GET /repos/{owner}/{repo}/contributors"],
		listCustomDeploymentRuleIntegrations: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps"],
		listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
		listDeploymentBranchPolicies: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"],
		listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
		listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
		listForAuthenticatedUser: ["GET /user/repos"],
		listForOrg: ["GET /orgs/{org}/repos"],
		listForUser: ["GET /users/{username}/repos"],
		listForks: ["GET /repos/{owner}/{repo}/forks"],
		listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
		listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
		listLanguages: ["GET /repos/{owner}/{repo}/languages"],
		listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
		listPublic: ["GET /repositories"],
		listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls"],
		listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
		listReleases: ["GET /repos/{owner}/{repo}/releases"],
		listTags: ["GET /repos/{owner}/{repo}/tags"],
		listTeams: ["GET /repos/{owner}/{repo}/teams"],
		listWebhookDeliveries: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"],
		listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
		merge: ["POST /repos/{owner}/{repo}/merges"],
		mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
		pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
		redeliverWebhookDelivery: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
		removeAppAccessRestrictions: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
			{},
			{ mapToData: "apps" }
		],
		removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
		removeStatusCheckContexts: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
			{},
			{ mapToData: "contexts" }
		],
		removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
		removeTeamAccessRestrictions: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
			{},
			{ mapToData: "teams" }
		],
		removeUserAccessRestrictions: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
			{},
			{ mapToData: "users" }
		],
		renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
		replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics"],
		requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
		setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
		setAppAccessRestrictions: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
			{},
			{ mapToData: "apps" }
		],
		setStatusCheckContexts: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
			{},
			{ mapToData: "contexts" }
		],
		setTeamAccessRestrictions: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
			{},
			{ mapToData: "teams" }
		],
		setUserAccessRestrictions: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
			{},
			{ mapToData: "users" }
		],
		testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
		transfer: ["POST /repos/{owner}/{repo}/transfer"],
		update: ["PATCH /repos/{owner}/{repo}"],
		updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
		updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
		updateDeploymentBranchPolicy: ["PUT /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],
		updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
		updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
		updateOrgRuleset: ["PUT /orgs/{org}/rulesets/{ruleset_id}"],
		updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
		updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
		updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
		updateRepoRuleset: ["PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
		updateStatusCheckPotection: [
			"PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
			{},
			{ renamed: ["repos", "updateStatusCheckProtection"] }
		],
		updateStatusCheckProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
		updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
		updateWebhookConfigForRepo: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"],
		uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", { baseUrl: "https://uploads.github.com" }]
	},
	search: {
		code: ["GET /search/code"],
		commits: ["GET /search/commits"],
		issuesAndPullRequests: ["GET /search/issues"],
		labels: ["GET /search/labels"],
		repos: ["GET /search/repositories"],
		topics: ["GET /search/topics"],
		users: ["GET /search/users"]
	},
	secretScanning: {
		createPushProtectionBypass: ["POST /repos/{owner}/{repo}/secret-scanning/push-protection-bypasses"],
		getAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
		getScanHistory: ["GET /repos/{owner}/{repo}/secret-scanning/scan-history"],
		listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
		listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
		listLocationsForAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations"],
		listOrgPatternConfigs: ["GET /orgs/{org}/secret-scanning/pattern-configurations"],
		updateAlert: ["PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
		updateOrgPatternConfigs: ["PATCH /orgs/{org}/secret-scanning/pattern-configurations"]
	},
	securityAdvisories: {
		createFork: ["POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks"],
		createPrivateVulnerabilityReport: ["POST /repos/{owner}/{repo}/security-advisories/reports"],
		createRepositoryAdvisory: ["POST /repos/{owner}/{repo}/security-advisories"],
		createRepositoryAdvisoryCveRequest: ["POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve"],
		getGlobalAdvisory: ["GET /advisories/{ghsa_id}"],
		getRepositoryAdvisory: ["GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}"],
		listGlobalAdvisories: ["GET /advisories"],
		listOrgRepositoryAdvisories: ["GET /orgs/{org}/security-advisories"],
		listRepositoryAdvisories: ["GET /repos/{owner}/{repo}/security-advisories"],
		updateRepositoryAdvisory: ["PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}"]
	},
	teams: {
		addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
		addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
		checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
		create: ["POST /orgs/{org}/teams"],
		createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
		createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
		deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
		deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
		deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
		getByName: ["GET /orgs/{org}/teams/{team_slug}"],
		getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
		getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
		getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
		list: ["GET /orgs/{org}/teams"],
		listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
		listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
		listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
		listForAuthenticatedUser: ["GET /user/teams"],
		listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
		listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
		listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
		removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
		removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
		updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
		updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
		updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
	},
	users: {
		addEmailForAuthenticated: [
			"POST /user/emails",
			{},
			{ renamed: ["users", "addEmailForAuthenticatedUser"] }
		],
		addEmailForAuthenticatedUser: ["POST /user/emails"],
		addSocialAccountForAuthenticatedUser: ["POST /user/social_accounts"],
		block: ["PUT /user/blocks/{username}"],
		checkBlocked: ["GET /user/blocks/{username}"],
		checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
		checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
		createGpgKeyForAuthenticated: [
			"POST /user/gpg_keys",
			{},
			{ renamed: ["users", "createGpgKeyForAuthenticatedUser"] }
		],
		createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
		createPublicSshKeyForAuthenticated: [
			"POST /user/keys",
			{},
			{ renamed: ["users", "createPublicSshKeyForAuthenticatedUser"] }
		],
		createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
		createSshSigningKeyForAuthenticatedUser: ["POST /user/ssh_signing_keys"],
		deleteAttestationsBulk: ["POST /users/{username}/attestations/delete-request"],
		deleteAttestationsById: ["DELETE /users/{username}/attestations/{attestation_id}"],
		deleteAttestationsBySubjectDigest: ["DELETE /users/{username}/attestations/digest/{subject_digest}"],
		deleteEmailForAuthenticated: [
			"DELETE /user/emails",
			{},
			{ renamed: ["users", "deleteEmailForAuthenticatedUser"] }
		],
		deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
		deleteGpgKeyForAuthenticated: [
			"DELETE /user/gpg_keys/{gpg_key_id}",
			{},
			{ renamed: ["users", "deleteGpgKeyForAuthenticatedUser"] }
		],
		deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
		deletePublicSshKeyForAuthenticated: [
			"DELETE /user/keys/{key_id}",
			{},
			{ renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"] }
		],
		deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
		deleteSocialAccountForAuthenticatedUser: ["DELETE /user/social_accounts"],
		deleteSshSigningKeyForAuthenticatedUser: ["DELETE /user/ssh_signing_keys/{ssh_signing_key_id}"],
		follow: ["PUT /user/following/{username}"],
		getAuthenticated: ["GET /user"],
		getById: ["GET /user/{account_id}"],
		getByUsername: ["GET /users/{username}"],
		getContextForUser: ["GET /users/{username}/hovercard"],
		getGpgKeyForAuthenticated: [
			"GET /user/gpg_keys/{gpg_key_id}",
			{},
			{ renamed: ["users", "getGpgKeyForAuthenticatedUser"] }
		],
		getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
		getPublicSshKeyForAuthenticated: [
			"GET /user/keys/{key_id}",
			{},
			{ renamed: ["users", "getPublicSshKeyForAuthenticatedUser"] }
		],
		getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
		getSshSigningKeyForAuthenticatedUser: ["GET /user/ssh_signing_keys/{ssh_signing_key_id}"],
		list: ["GET /users"],
		listAttestations: ["GET /users/{username}/attestations/{subject_digest}"],
		listAttestationsBulk: ["POST /users/{username}/attestations/bulk-list{?per_page,before,after}"],
		listBlockedByAuthenticated: [
			"GET /user/blocks",
			{},
			{ renamed: ["users", "listBlockedByAuthenticatedUser"] }
		],
		listBlockedByAuthenticatedUser: ["GET /user/blocks"],
		listEmailsForAuthenticated: [
			"GET /user/emails",
			{},
			{ renamed: ["users", "listEmailsForAuthenticatedUser"] }
		],
		listEmailsForAuthenticatedUser: ["GET /user/emails"],
		listFollowedByAuthenticated: [
			"GET /user/following",
			{},
			{ renamed: ["users", "listFollowedByAuthenticatedUser"] }
		],
		listFollowedByAuthenticatedUser: ["GET /user/following"],
		listFollowersForAuthenticatedUser: ["GET /user/followers"],
		listFollowersForUser: ["GET /users/{username}/followers"],
		listFollowingForUser: ["GET /users/{username}/following"],
		listGpgKeysForAuthenticated: [
			"GET /user/gpg_keys",
			{},
			{ renamed: ["users", "listGpgKeysForAuthenticatedUser"] }
		],
		listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
		listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
		listPublicEmailsForAuthenticated: [
			"GET /user/public_emails",
			{},
			{ renamed: ["users", "listPublicEmailsForAuthenticatedUser"] }
		],
		listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
		listPublicKeysForUser: ["GET /users/{username}/keys"],
		listPublicSshKeysForAuthenticated: [
			"GET /user/keys",
			{},
			{ renamed: ["users", "listPublicSshKeysForAuthenticatedUser"] }
		],
		listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
		listSocialAccountsForAuthenticatedUser: ["GET /user/social_accounts"],
		listSocialAccountsForUser: ["GET /users/{username}/social_accounts"],
		listSshSigningKeysForAuthenticatedUser: ["GET /user/ssh_signing_keys"],
		listSshSigningKeysForUser: ["GET /users/{username}/ssh_signing_keys"],
		setPrimaryEmailVisibilityForAuthenticated: [
			"PATCH /user/email/visibility",
			{},
			{ renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"] }
		],
		setPrimaryEmailVisibilityForAuthenticatedUser: ["PATCH /user/email/visibility"],
		unblock: ["DELETE /user/blocks/{username}"],
		unfollow: ["DELETE /user/following/{username}"],
		updateAuthenticated: ["PATCH /user"]
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-rest-endpoint-methods@17.0.0_@octokit+core@7.0.6/node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/endpoints-to-methods.js
const endpointMethodsMap = /* @__PURE__ */ new Map();
for (const [scope, endpoints] of Object.entries(endpoints_default)) for (const [methodName, endpoint] of Object.entries(endpoints)) {
	const [route, defaults, decorations] = endpoint;
	const [method, url] = route.split(/ /);
	const endpointDefaults = Object.assign({
		method,
		url
	}, defaults);
	if (!endpointMethodsMap.has(scope)) endpointMethodsMap.set(scope, /* @__PURE__ */ new Map());
	endpointMethodsMap.get(scope).set(methodName, {
		scope,
		methodName,
		endpointDefaults,
		decorations
	});
}
const handler = {
	has({ scope }, methodName) {
		return endpointMethodsMap.get(scope).has(methodName);
	},
	getOwnPropertyDescriptor(target, methodName) {
		return {
			value: this.get(target, methodName),
			configurable: true,
			writable: true,
			enumerable: true
		};
	},
	defineProperty(target, methodName, descriptor) {
		Object.defineProperty(target.cache, methodName, descriptor);
		return true;
	},
	deleteProperty(target, methodName) {
		delete target.cache[methodName];
		return true;
	},
	ownKeys({ scope }) {
		return [...endpointMethodsMap.get(scope).keys()];
	},
	set(target, methodName, value) {
		return target.cache[methodName] = value;
	},
	get({ octokit, scope, cache }, methodName) {
		if (cache[methodName]) return cache[methodName];
		const method = endpointMethodsMap.get(scope).get(methodName);
		if (!method) return;
		const { endpointDefaults, decorations } = method;
		if (decorations) cache[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
		else cache[methodName] = octokit.request.defaults(endpointDefaults);
		return cache[methodName];
	}
};
function endpointsToMethods(octokit) {
	const newMethods = {};
	for (const scope of endpointMethodsMap.keys()) newMethods[scope] = new Proxy({
		octokit,
		scope,
		cache: {}
	}, handler);
	return newMethods;
}
function decorate(octokit, scope, methodName, defaults, decorations) {
	const requestWithDefaults = octokit.request.defaults(defaults);
	function withDecorations(...args) {
		let options = requestWithDefaults.endpoint.merge(...args);
		if (decorations.mapToData) {
			options = Object.assign({}, options, {
				data: options[decorations.mapToData],
				[decorations.mapToData]: void 0
			});
			return requestWithDefaults(options);
		}
		if (decorations.renamed) {
			const [newScope, newMethodName] = decorations.renamed;
			octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
		}
		if (decorations.deprecated) octokit.log.warn(decorations.deprecated);
		if (decorations.renamedParameters) {
			const options2 = requestWithDefaults.endpoint.merge(...args);
			for (const [name, alias] of Object.entries(decorations.renamedParameters)) if (name in options2) {
				octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);
				if (!(alias in options2)) options2[alias] = options2[name];
				delete options2[name];
			}
			return requestWithDefaults(options2);
		}
		return requestWithDefaults(...args);
	}
	return Object.assign(withDecorations, requestWithDefaults);
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-rest-endpoint-methods@17.0.0_@octokit+core@7.0.6/node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/index.js
function restEndpointMethods(octokit) {
	return { rest: endpointsToMethods(octokit) };
}
restEndpointMethods.VERSION = VERSION$10;
function legacyRestEndpointMethods(octokit) {
	const api = endpointsToMethods(octokit);
	return {
		...api,
		rest: api
	};
}
legacyRestEndpointMethods.VERSION = VERSION$10;

//#endregion
//#region ../../node_modules/.pnpm/bottleneck@2.19.5/node_modules/bottleneck/light.js
var require_light = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This file contains the Bottleneck library (MIT), compiled to ES2017, and without Clustering support.
	* https://github.com/SGrondin/bottleneck
	*/
	(function(global, factory) {
		typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.Bottleneck = factory();
	})(exports, (function() {
		"use strict";
		var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
		function getCjsExportFromNamespace(n) {
			return n && n["default"] || n;
		}
		var load = function(received, defaults, onto = {}) {
			var k, ref, v;
			for (k in defaults) {
				v = defaults[k];
				onto[k] = (ref = received[k]) != null ? ref : v;
			}
			return onto;
		};
		var overwrite = function(received, defaults, onto = {}) {
			var k, v;
			for (k in received) {
				v = received[k];
				if (defaults[k] !== void 0) onto[k] = v;
			}
			return onto;
		};
		var parser = {
			load,
			overwrite
		};
		var DLList_1 = class DLList {
			constructor(incr, decr) {
				this.incr = incr;
				this.decr = decr;
				this._first = null;
				this._last = null;
				this.length = 0;
			}
			push(value) {
				var node;
				this.length++;
				if (typeof this.incr === "function") this.incr();
				node = {
					value,
					prev: this._last,
					next: null
				};
				if (this._last != null) {
					this._last.next = node;
					this._last = node;
				} else this._first = this._last = node;
			}
			shift() {
				var value;
				if (this._first == null) return;
				else {
					this.length--;
					if (typeof this.decr === "function") this.decr();
				}
				value = this._first.value;
				if ((this._first = this._first.next) != null) this._first.prev = null;
				else this._last = null;
				return value;
			}
			first() {
				if (this._first != null) return this._first.value;
			}
			getArray() {
				var node = this._first, ref, results = [];
				while (node != null) results.push((ref = node, node = node.next, ref.value));
				return results;
			}
			forEachShift(cb) {
				var node = this.shift();
				while (node != null) cb(node), node = this.shift();
			}
			debug() {
				var node = this._first, ref, ref1, ref2, results = [];
				while (node != null) results.push((ref = node, node = node.next, {
					value: ref.value,
					prev: (ref1 = ref.prev) != null ? ref1.value : void 0,
					next: (ref2 = ref.next) != null ? ref2.value : void 0
				}));
				return results;
			}
		};
		var Events_1 = class Events {
			constructor(instance) {
				this.instance = instance;
				this._events = {};
				if (this.instance.on != null || this.instance.once != null || this.instance.removeAllListeners != null) throw new Error("An Emitter already exists for this object");
				this.instance.on = (name, cb) => {
					return this._addListener(name, "many", cb);
				};
				this.instance.once = (name, cb) => {
					return this._addListener(name, "once", cb);
				};
				this.instance.removeAllListeners = (name = null) => {
					if (name != null) return delete this._events[name];
					else return this._events = {};
				};
			}
			_addListener(name, status, cb) {
				var base;
				if ((base = this._events)[name] == null) base[name] = [];
				this._events[name].push({
					cb,
					status
				});
				return this.instance;
			}
			listenerCount(name) {
				if (this._events[name] != null) return this._events[name].length;
				else return 0;
			}
			async trigger(name, ...args) {
				var e, promises;
				try {
					if (name !== "debug") this.trigger("debug", `Event triggered: ${name}`, args);
					if (this._events[name] == null) return;
					this._events[name] = this._events[name].filter(function(listener) {
						return listener.status !== "none";
					});
					promises = this._events[name].map(async (listener) => {
						var e, returned;
						if (listener.status === "none") return;
						if (listener.status === "once") listener.status = "none";
						try {
							returned = typeof listener.cb === "function" ? listener.cb(...args) : void 0;
							if (typeof (returned != null ? returned.then : void 0) === "function") return await returned;
							else return returned;
						} catch (error) {
							e = error;
							this.trigger("error", e);
							return null;
						}
					});
					return (await Promise.all(promises)).find(function(x) {
						return x != null;
					});
				} catch (error) {
					e = error;
					this.trigger("error", e);
					return null;
				}
			}
		};
		var DLList$1 = DLList_1, Events$1 = Events_1;
		var Queues_1 = class Queues {
			constructor(num_priorities) {
				this.Events = new Events$1(this);
				this._length = 0;
				this._lists = (function() {
					var j, ref, results = [];
					for (j = 1, ref = num_priorities; 1 <= ref ? j <= ref : j >= ref; 1 <= ref ? ++j : --j) results.push(new DLList$1((() => {
						return this.incr();
					}), (() => {
						return this.decr();
					})));
					return results;
				}).call(this);
			}
			incr() {
				if (this._length++ === 0) return this.Events.trigger("leftzero");
			}
			decr() {
				if (--this._length === 0) return this.Events.trigger("zero");
			}
			push(job) {
				return this._lists[job.options.priority].push(job);
			}
			queued(priority) {
				if (priority != null) return this._lists[priority].length;
				else return this._length;
			}
			shiftAll(fn) {
				return this._lists.forEach(function(list) {
					return list.forEachShift(fn);
				});
			}
			getFirst(arr = this._lists) {
				var j, len, list;
				for (j = 0, len = arr.length; j < len; j++) {
					list = arr[j];
					if (list.length > 0) return list;
				}
				return [];
			}
			shiftLastFrom(priority) {
				return this.getFirst(this._lists.slice(priority).reverse()).shift();
			}
		};
		var BottleneckError_1 = class BottleneckError extends Error {};
		var BottleneckError$1, DEFAULT_PRIORITY, Job, NUM_PRIORITIES = 10, parser$1;
		DEFAULT_PRIORITY = 5;
		parser$1 = parser;
		BottleneckError$1 = BottleneckError_1;
		Job = class Job {
			constructor(task, args, options, jobDefaults, rejectOnDrop, Events, _states, Promise) {
				this.task = task;
				this.args = args;
				this.rejectOnDrop = rejectOnDrop;
				this.Events = Events;
				this._states = _states;
				this.Promise = Promise;
				this.options = parser$1.load(options, jobDefaults);
				this.options.priority = this._sanitizePriority(this.options.priority);
				if (this.options.id === jobDefaults.id) this.options.id = `${this.options.id}-${this._randomIndex()}`;
				this.promise = new this.Promise((_resolve, _reject) => {
					this._resolve = _resolve;
					this._reject = _reject;
				});
				this.retryCount = 0;
			}
			_sanitizePriority(priority) {
				var sProperty = ~~priority !== priority ? DEFAULT_PRIORITY : priority;
				if (sProperty < 0) return 0;
				else if (sProperty > NUM_PRIORITIES - 1) return NUM_PRIORITIES - 1;
				else return sProperty;
			}
			_randomIndex() {
				return Math.random().toString(36).slice(2);
			}
			doDrop({ error, message = "This job has been dropped by Bottleneck" } = {}) {
				if (this._states.remove(this.options.id)) {
					if (this.rejectOnDrop) this._reject(error != null ? error : new BottleneckError$1(message));
					this.Events.trigger("dropped", {
						args: this.args,
						options: this.options,
						task: this.task,
						promise: this.promise
					});
					return true;
				} else return false;
			}
			_assertStatus(expected) {
				var status = this._states.jobStatus(this.options.id);
				if (!(status === expected || expected === "DONE" && status === null)) throw new BottleneckError$1(`Invalid job status ${status}, expected ${expected}. Please open an issue at https://github.com/SGrondin/bottleneck/issues`);
			}
			doReceive() {
				this._states.start(this.options.id);
				return this.Events.trigger("received", {
					args: this.args,
					options: this.options
				});
			}
			doQueue(reachedHWM, blocked) {
				this._assertStatus("RECEIVED");
				this._states.next(this.options.id);
				return this.Events.trigger("queued", {
					args: this.args,
					options: this.options,
					reachedHWM,
					blocked
				});
			}
			doRun() {
				if (this.retryCount === 0) {
					this._assertStatus("QUEUED");
					this._states.next(this.options.id);
				} else this._assertStatus("EXECUTING");
				return this.Events.trigger("scheduled", {
					args: this.args,
					options: this.options
				});
			}
			async doExecute(chained, clearGlobalState, run, free) {
				var error, eventInfo, passed;
				if (this.retryCount === 0) {
					this._assertStatus("RUNNING");
					this._states.next(this.options.id);
				} else this._assertStatus("EXECUTING");
				eventInfo = {
					args: this.args,
					options: this.options,
					retryCount: this.retryCount
				};
				this.Events.trigger("executing", eventInfo);
				try {
					passed = await (chained != null ? chained.schedule(this.options, this.task, ...this.args) : this.task(...this.args));
					if (clearGlobalState()) {
						this.doDone(eventInfo);
						await free(this.options, eventInfo);
						this._assertStatus("DONE");
						return this._resolve(passed);
					}
				} catch (error1) {
					error = error1;
					return this._onFailure(error, eventInfo, clearGlobalState, run, free);
				}
			}
			doExpire(clearGlobalState, run, free) {
				var error, eventInfo;
				if (this._states.jobStatus(this.options.id === "RUNNING")) this._states.next(this.options.id);
				this._assertStatus("EXECUTING");
				eventInfo = {
					args: this.args,
					options: this.options,
					retryCount: this.retryCount
				};
				error = new BottleneckError$1(`This job timed out after ${this.options.expiration} ms.`);
				return this._onFailure(error, eventInfo, clearGlobalState, run, free);
			}
			async _onFailure(error, eventInfo, clearGlobalState, run, free) {
				var retry, retryAfter;
				if (clearGlobalState()) {
					retry = await this.Events.trigger("failed", error, eventInfo);
					if (retry != null) {
						retryAfter = ~~retry;
						this.Events.trigger("retry", `Retrying ${this.options.id} after ${retryAfter} ms`, eventInfo);
						this.retryCount++;
						return run(retryAfter);
					} else {
						this.doDone(eventInfo);
						await free(this.options, eventInfo);
						this._assertStatus("DONE");
						return this._reject(error);
					}
				}
			}
			doDone(eventInfo) {
				this._assertStatus("EXECUTING");
				this._states.next(this.options.id);
				return this.Events.trigger("done", eventInfo);
			}
		};
		var Job_1 = Job;
		var BottleneckError$2, LocalDatastore, parser$2 = parser;
		BottleneckError$2 = BottleneckError_1;
		LocalDatastore = class LocalDatastore {
			constructor(instance, storeOptions, storeInstanceOptions) {
				this.instance = instance;
				this.storeOptions = storeOptions;
				this.clientId = this.instance._randomIndex();
				parser$2.load(storeInstanceOptions, storeInstanceOptions, this);
				this._nextRequest = this._lastReservoirRefresh = this._lastReservoirIncrease = Date.now();
				this._running = 0;
				this._done = 0;
				this._unblockTime = 0;
				this.ready = this.Promise.resolve();
				this.clients = {};
				this._startHeartbeat();
			}
			_startHeartbeat() {
				var base;
				if (this.heartbeat == null && (this.storeOptions.reservoirRefreshInterval != null && this.storeOptions.reservoirRefreshAmount != null || this.storeOptions.reservoirIncreaseInterval != null && this.storeOptions.reservoirIncreaseAmount != null)) return typeof (base = this.heartbeat = setInterval(() => {
					var amount, incr, maximum, now = Date.now(), reservoir;
					if (this.storeOptions.reservoirRefreshInterval != null && now >= this._lastReservoirRefresh + this.storeOptions.reservoirRefreshInterval) {
						this._lastReservoirRefresh = now;
						this.storeOptions.reservoir = this.storeOptions.reservoirRefreshAmount;
						this.instance._drainAll(this.computeCapacity());
					}
					if (this.storeOptions.reservoirIncreaseInterval != null && now >= this._lastReservoirIncrease + this.storeOptions.reservoirIncreaseInterval) {
						({reservoirIncreaseAmount: amount, reservoirIncreaseMaximum: maximum, reservoir} = this.storeOptions);
						this._lastReservoirIncrease = now;
						incr = maximum != null ? Math.min(amount, maximum - reservoir) : amount;
						if (incr > 0) {
							this.storeOptions.reservoir += incr;
							return this.instance._drainAll(this.computeCapacity());
						}
					}
				}, this.heartbeatInterval)).unref === "function" ? base.unref() : void 0;
				else return clearInterval(this.heartbeat);
			}
			async __publish__(message) {
				await this.yieldLoop();
				return this.instance.Events.trigger("message", message.toString());
			}
			async __disconnect__(flush) {
				await this.yieldLoop();
				clearInterval(this.heartbeat);
				return this.Promise.resolve();
			}
			yieldLoop(t = 0) {
				return new this.Promise(function(resolve, reject) {
					return setTimeout(resolve, t);
				});
			}
			computePenalty() {
				var ref;
				return (ref = this.storeOptions.penalty) != null ? ref : 15 * this.storeOptions.minTime || 5e3;
			}
			async __updateSettings__(options) {
				await this.yieldLoop();
				parser$2.overwrite(options, options, this.storeOptions);
				this._startHeartbeat();
				this.instance._drainAll(this.computeCapacity());
				return true;
			}
			async __running__() {
				await this.yieldLoop();
				return this._running;
			}
			async __queued__() {
				await this.yieldLoop();
				return this.instance.queued();
			}
			async __done__() {
				await this.yieldLoop();
				return this._done;
			}
			async __groupCheck__(time) {
				await this.yieldLoop();
				return this._nextRequest + this.timeout < time;
			}
			computeCapacity() {
				var maxConcurrent, reservoir;
				({maxConcurrent, reservoir} = this.storeOptions);
				if (maxConcurrent != null && reservoir != null) return Math.min(maxConcurrent - this._running, reservoir);
				else if (maxConcurrent != null) return maxConcurrent - this._running;
				else if (reservoir != null) return reservoir;
				else return null;
			}
			conditionsCheck(weight) {
				var capacity = this.computeCapacity();
				return capacity == null || weight <= capacity;
			}
			async __incrementReservoir__(incr) {
				var reservoir;
				await this.yieldLoop();
				reservoir = this.storeOptions.reservoir += incr;
				this.instance._drainAll(this.computeCapacity());
				return reservoir;
			}
			async __currentReservoir__() {
				await this.yieldLoop();
				return this.storeOptions.reservoir;
			}
			isBlocked(now) {
				return this._unblockTime >= now;
			}
			check(weight, now) {
				return this.conditionsCheck(weight) && this._nextRequest - now <= 0;
			}
			async __check__(weight) {
				var now;
				await this.yieldLoop();
				now = Date.now();
				return this.check(weight, now);
			}
			async __register__(index, weight, expiration) {
				var now, wait;
				await this.yieldLoop();
				now = Date.now();
				if (this.conditionsCheck(weight)) {
					this._running += weight;
					if (this.storeOptions.reservoir != null) this.storeOptions.reservoir -= weight;
					wait = Math.max(this._nextRequest - now, 0);
					this._nextRequest = now + wait + this.storeOptions.minTime;
					return {
						success: true,
						wait,
						reservoir: this.storeOptions.reservoir
					};
				} else return { success: false };
			}
			strategyIsBlock() {
				return this.storeOptions.strategy === 3;
			}
			async __submit__(queueLength, weight) {
				var blocked, now, reachedHWM;
				await this.yieldLoop();
				if (this.storeOptions.maxConcurrent != null && weight > this.storeOptions.maxConcurrent) throw new BottleneckError$2(`Impossible to add a job having a weight of ${weight} to a limiter having a maxConcurrent setting of ${this.storeOptions.maxConcurrent}`);
				now = Date.now();
				reachedHWM = this.storeOptions.highWater != null && queueLength === this.storeOptions.highWater && !this.check(weight, now);
				blocked = this.strategyIsBlock() && (reachedHWM || this.isBlocked(now));
				if (blocked) {
					this._unblockTime = now + this.computePenalty();
					this._nextRequest = this._unblockTime + this.storeOptions.minTime;
					this.instance._dropAllQueued();
				}
				return {
					reachedHWM,
					blocked,
					strategy: this.storeOptions.strategy
				};
			}
			async __free__(index, weight) {
				await this.yieldLoop();
				this._running -= weight;
				this._done += weight;
				this.instance._drainAll(this.computeCapacity());
				return { running: this._running };
			}
		};
		var LocalDatastore_1 = LocalDatastore;
		var BottleneckError$3 = BottleneckError_1;
		var States_1 = class States {
			constructor(status1) {
				this.status = status1;
				this._jobs = {};
				this.counts = this.status.map(function() {
					return 0;
				});
			}
			next(id) {
				var current = this._jobs[id], next = current + 1;
				if (current != null && next < this.status.length) {
					this.counts[current]--;
					this.counts[next]++;
					return this._jobs[id]++;
				} else if (current != null) {
					this.counts[current]--;
					return delete this._jobs[id];
				}
			}
			start(id) {
				var initial = 0;
				this._jobs[id] = initial;
				return this.counts[initial]++;
			}
			remove(id) {
				var current = this._jobs[id];
				if (current != null) {
					this.counts[current]--;
					delete this._jobs[id];
				}
				return current != null;
			}
			jobStatus(id) {
				var ref;
				return (ref = this.status[this._jobs[id]]) != null ? ref : null;
			}
			statusJobs(status) {
				var k, pos, ref, results, v;
				if (status != null) {
					pos = this.status.indexOf(status);
					if (pos < 0) throw new BottleneckError$3(`status must be one of ${this.status.join(", ")}`);
					ref = this._jobs;
					results = [];
					for (k in ref) {
						v = ref[k];
						if (v === pos) results.push(k);
					}
					return results;
				} else return Object.keys(this._jobs);
			}
			statusCounts() {
				return this.counts.reduce(((acc, v, i) => {
					acc[this.status[i]] = v;
					return acc;
				}), {});
			}
		};
		var DLList$2 = DLList_1;
		var Sync_1 = class Sync {
			constructor(name, Promise) {
				this.schedule = this.schedule.bind(this);
				this.name = name;
				this.Promise = Promise;
				this._running = 0;
				this._queue = new DLList$2();
			}
			isEmpty() {
				return this._queue.length === 0;
			}
			async _tryToRun() {
				var args, cb, error, reject, resolve, returned, task;
				if (this._running < 1 && this._queue.length > 0) {
					this._running++;
					({task, args, resolve, reject} = this._queue.shift());
					cb = await (async function() {
						try {
							returned = await task(...args);
							return function() {
								return resolve(returned);
							};
						} catch (error1) {
							error = error1;
							return function() {
								return reject(error);
							};
						}
					})();
					this._running--;
					this._tryToRun();
					return cb();
				}
			}
			schedule(task, ...args) {
				var promise, reject, resolve = reject = null;
				promise = new this.Promise(function(_resolve, _reject) {
					resolve = _resolve;
					return reject = _reject;
				});
				this._queue.push({
					task,
					args,
					resolve,
					reject
				});
				this._tryToRun();
				return promise;
			}
		};
		var version = "2.19.5";
		var version$1 = { version };
		var version$2 = /* @__PURE__ */ Object.freeze({
			version,
			default: version$1
		});
		var require$$2 = () => console.log("You must import the full version of Bottleneck in order to use this feature.");
		var require$$3 = () => console.log("You must import the full version of Bottleneck in order to use this feature.");
		var require$$4 = () => console.log("You must import the full version of Bottleneck in order to use this feature.");
		var Events$2, Group, IORedisConnection$1, RedisConnection$1, Scripts$1, parser$3 = parser;
		Events$2 = Events_1;
		RedisConnection$1 = require$$2;
		IORedisConnection$1 = require$$3;
		Scripts$1 = require$$4;
		Group = (function() {
			class Group {
				constructor(limiterOptions = {}) {
					this.deleteKey = this.deleteKey.bind(this);
					this.limiterOptions = limiterOptions;
					parser$3.load(this.limiterOptions, this.defaults, this);
					this.Events = new Events$2(this);
					this.instances = {};
					this.Bottleneck = Bottleneck_1;
					this._startAutoCleanup();
					this.sharedConnection = this.connection != null;
					if (this.connection == null) {
						if (this.limiterOptions.datastore === "redis") this.connection = new RedisConnection$1(Object.assign({}, this.limiterOptions, { Events: this.Events }));
						else if (this.limiterOptions.datastore === "ioredis") this.connection = new IORedisConnection$1(Object.assign({}, this.limiterOptions, { Events: this.Events }));
					}
				}
				key(key = "") {
					var ref;
					return (ref = this.instances[key]) != null ? ref : (() => {
						var limiter = this.instances[key] = new this.Bottleneck(Object.assign(this.limiterOptions, {
							id: `${this.id}-${key}`,
							timeout: this.timeout,
							connection: this.connection
						}));
						this.Events.trigger("created", limiter, key);
						return limiter;
					})();
				}
				async deleteKey(key = "") {
					var deleted, instance = this.instances[key];
					if (this.connection) deleted = await this.connection.__runCommand__(["del", ...Scripts$1.allKeys(`${this.id}-${key}`)]);
					if (instance != null) {
						delete this.instances[key];
						await instance.disconnect();
					}
					return instance != null || deleted > 0;
				}
				limiters() {
					var k, ref = this.instances, results = [], v;
					for (k in ref) {
						v = ref[k];
						results.push({
							key: k,
							limiter: v
						});
					}
					return results;
				}
				keys() {
					return Object.keys(this.instances);
				}
				async clusterKeys() {
					var cursor, end, found, i, k, keys, len, next, start;
					if (this.connection == null) return this.Promise.resolve(this.keys());
					keys = [];
					cursor = null;
					start = `b_${this.id}-`.length;
					end = 9;
					while (cursor !== 0) {
						[next, found] = await this.connection.__runCommand__([
							"scan",
							cursor != null ? cursor : 0,
							"match",
							`b_${this.id}-*_settings`,
							"count",
							1e4
						]);
						cursor = ~~next;
						for (i = 0, len = found.length; i < len; i++) {
							k = found[i];
							keys.push(k.slice(start, -end));
						}
					}
					return keys;
				}
				_startAutoCleanup() {
					var base;
					clearInterval(this.interval);
					return typeof (base = this.interval = setInterval(async () => {
						var e, k, ref, results, time = Date.now(), v;
						ref = this.instances;
						results = [];
						for (k in ref) {
							v = ref[k];
							try {
								if (await v._store.__groupCheck__(time)) results.push(this.deleteKey(k));
								else results.push(void 0);
							} catch (error) {
								e = error;
								results.push(v.Events.trigger("error", e));
							}
						}
						return results;
					}, this.timeout / 2)).unref === "function" ? base.unref() : void 0;
				}
				updateSettings(options = {}) {
					parser$3.overwrite(options, this.defaults, this);
					parser$3.overwrite(options, options, this.limiterOptions);
					if (options.timeout != null) return this._startAutoCleanup();
				}
				disconnect(flush = true) {
					var ref;
					if (!this.sharedConnection) return (ref = this.connection) != null ? ref.disconnect(flush) : void 0;
				}
			}
			Group.prototype.defaults = {
				timeout: 1e3 * 60 * 5,
				connection: null,
				Promise,
				id: "group-key"
			};
			return Group;
		}).call(commonjsGlobal);
		var Group_1 = Group;
		var Batcher, Events$3, parser$4 = parser;
		Events$3 = Events_1;
		Batcher = (function() {
			class Batcher {
				constructor(options = {}) {
					this.options = options;
					parser$4.load(this.options, this.defaults, this);
					this.Events = new Events$3(this);
					this._arr = [];
					this._resetPromise();
					this._lastFlush = Date.now();
				}
				_resetPromise() {
					return this._promise = new this.Promise((res, rej) => {
						return this._resolve = res;
					});
				}
				_flush() {
					clearTimeout(this._timeout);
					this._lastFlush = Date.now();
					this._resolve();
					this.Events.trigger("batch", this._arr);
					this._arr = [];
					return this._resetPromise();
				}
				add(data) {
					var ret;
					this._arr.push(data);
					ret = this._promise;
					if (this._arr.length === this.maxSize) this._flush();
					else if (this.maxTime != null && this._arr.length === 1) this._timeout = setTimeout(() => {
						return this._flush();
					}, this.maxTime);
					return ret;
				}
			}
			Batcher.prototype.defaults = {
				maxTime: null,
				maxSize: null,
				Promise
			};
			return Batcher;
		}).call(commonjsGlobal);
		var Batcher_1 = Batcher;
		var require$$4$1 = () => console.log("You must import the full version of Bottleneck in order to use this feature.");
		var require$$8 = getCjsExportFromNamespace(version$2);
		var Bottleneck, DEFAULT_PRIORITY$1, Events$4, Job$1, LocalDatastore$1, NUM_PRIORITIES$1, Queues$1, RedisDatastore$1, States$1, Sync$1, parser$5, splice = [].splice;
		NUM_PRIORITIES$1 = 10;
		DEFAULT_PRIORITY$1 = 5;
		parser$5 = parser;
		Queues$1 = Queues_1;
		Job$1 = Job_1;
		LocalDatastore$1 = LocalDatastore_1;
		RedisDatastore$1 = require$$4$1;
		Events$4 = Events_1;
		States$1 = States_1;
		Sync$1 = Sync_1;
		Bottleneck = (function() {
			class Bottleneck {
				constructor(options = {}, ...invalid) {
					var storeInstanceOptions, storeOptions;
					this._addToQueue = this._addToQueue.bind(this);
					this._validateOptions(options, invalid);
					parser$5.load(options, this.instanceDefaults, this);
					this._queues = new Queues$1(NUM_PRIORITIES$1);
					this._scheduled = {};
					this._states = new States$1([
						"RECEIVED",
						"QUEUED",
						"RUNNING",
						"EXECUTING"
					].concat(this.trackDoneStatus ? ["DONE"] : []));
					this._limiter = null;
					this.Events = new Events$4(this);
					this._submitLock = new Sync$1("submit", this.Promise);
					this._registerLock = new Sync$1("register", this.Promise);
					storeOptions = parser$5.load(options, this.storeDefaults, {});
					this._store = (function() {
						if (this.datastore === "redis" || this.datastore === "ioredis" || this.connection != null) {
							storeInstanceOptions = parser$5.load(options, this.redisStoreDefaults, {});
							return new RedisDatastore$1(this, storeOptions, storeInstanceOptions);
						} else if (this.datastore === "local") {
							storeInstanceOptions = parser$5.load(options, this.localStoreDefaults, {});
							return new LocalDatastore$1(this, storeOptions, storeInstanceOptions);
						} else throw new Bottleneck.prototype.BottleneckError(`Invalid datastore type: ${this.datastore}`);
					}).call(this);
					this._queues.on("leftzero", () => {
						var ref;
						return (ref = this._store.heartbeat) != null ? typeof ref.ref === "function" ? ref.ref() : void 0 : void 0;
					});
					this._queues.on("zero", () => {
						var ref;
						return (ref = this._store.heartbeat) != null ? typeof ref.unref === "function" ? ref.unref() : void 0 : void 0;
					});
				}
				_validateOptions(options, invalid) {
					if (!(options != null && typeof options === "object" && invalid.length === 0)) throw new Bottleneck.prototype.BottleneckError("Bottleneck v2 takes a single object argument. Refer to https://github.com/SGrondin/bottleneck#upgrading-to-v2 if you're upgrading from Bottleneck v1.");
				}
				ready() {
					return this._store.ready;
				}
				clients() {
					return this._store.clients;
				}
				channel() {
					return `b_${this.id}`;
				}
				channel_client() {
					return `b_${this.id}_${this._store.clientId}`;
				}
				publish(message) {
					return this._store.__publish__(message);
				}
				disconnect(flush = true) {
					return this._store.__disconnect__(flush);
				}
				chain(_limiter) {
					this._limiter = _limiter;
					return this;
				}
				queued(priority) {
					return this._queues.queued(priority);
				}
				clusterQueued() {
					return this._store.__queued__();
				}
				empty() {
					return this.queued() === 0 && this._submitLock.isEmpty();
				}
				running() {
					return this._store.__running__();
				}
				done() {
					return this._store.__done__();
				}
				jobStatus(id) {
					return this._states.jobStatus(id);
				}
				jobs(status) {
					return this._states.statusJobs(status);
				}
				counts() {
					return this._states.statusCounts();
				}
				_randomIndex() {
					return Math.random().toString(36).slice(2);
				}
				check(weight = 1) {
					return this._store.__check__(weight);
				}
				_clearGlobalState(index) {
					if (this._scheduled[index] != null) {
						clearTimeout(this._scheduled[index].expiration);
						delete this._scheduled[index];
						return true;
					} else return false;
				}
				async _free(index, job, options, eventInfo) {
					var e, running;
					try {
						({running} = await this._store.__free__(index, options.weight));
						this.Events.trigger("debug", `Freed ${options.id}`, eventInfo);
						if (running === 0 && this.empty()) return this.Events.trigger("idle");
					} catch (error1) {
						e = error1;
						return this.Events.trigger("error", e);
					}
				}
				_run(index, job, wait) {
					var clearGlobalState, free, run;
					job.doRun();
					clearGlobalState = this._clearGlobalState.bind(this, index);
					run = this._run.bind(this, index, job);
					free = this._free.bind(this, index, job);
					return this._scheduled[index] = {
						timeout: setTimeout(() => {
							return job.doExecute(this._limiter, clearGlobalState, run, free);
						}, wait),
						expiration: job.options.expiration != null ? setTimeout(function() {
							return job.doExpire(clearGlobalState, run, free);
						}, wait + job.options.expiration) : void 0,
						job
					};
				}
				_drainOne(capacity) {
					return this._registerLock.schedule(() => {
						var args, index, next, options, queue;
						if (this.queued() === 0) return this.Promise.resolve(null);
						queue = this._queues.getFirst();
						({options, args} = next = queue.first());
						if (capacity != null && options.weight > capacity) return this.Promise.resolve(null);
						this.Events.trigger("debug", `Draining ${options.id}`, {
							args,
							options
						});
						index = this._randomIndex();
						return this._store.__register__(index, options.weight, options.expiration).then(({ success, wait, reservoir }) => {
							var empty;
							this.Events.trigger("debug", `Drained ${options.id}`, {
								success,
								args,
								options
							});
							if (success) {
								queue.shift();
								empty = this.empty();
								if (empty) this.Events.trigger("empty");
								if (reservoir === 0) this.Events.trigger("depleted", empty);
								this._run(index, next, wait);
								return this.Promise.resolve(options.weight);
							} else return this.Promise.resolve(null);
						});
					});
				}
				_drainAll(capacity, total = 0) {
					return this._drainOne(capacity).then((drained) => {
						var newCapacity;
						if (drained != null) {
							newCapacity = capacity != null ? capacity - drained : capacity;
							return this._drainAll(newCapacity, total + drained);
						} else return this.Promise.resolve(total);
					}).catch((e) => {
						return this.Events.trigger("error", e);
					});
				}
				_dropAllQueued(message) {
					return this._queues.shiftAll(function(job) {
						return job.doDrop({ message });
					});
				}
				stop(options = {}) {
					var done, waitForExecuting;
					options = parser$5.load(options, this.stopDefaults);
					waitForExecuting = (at) => {
						var finished = () => {
							var counts = this._states.counts;
							return counts[0] + counts[1] + counts[2] + counts[3] === at;
						};
						return new this.Promise((resolve, reject) => {
							if (finished()) return resolve();
							else return this.on("done", () => {
								if (finished()) {
									this.removeAllListeners("done");
									return resolve();
								}
							});
						});
					};
					done = options.dropWaitingJobs ? (this._run = function(index, next) {
						return next.doDrop({ message: options.dropErrorMessage });
					}, this._drainOne = () => {
						return this.Promise.resolve(null);
					}, this._registerLock.schedule(() => {
						return this._submitLock.schedule(() => {
							var k, ref = this._scheduled, v;
							for (k in ref) {
								v = ref[k];
								if (this.jobStatus(v.job.options.id) === "RUNNING") {
									clearTimeout(v.timeout);
									clearTimeout(v.expiration);
									v.job.doDrop({ message: options.dropErrorMessage });
								}
							}
							this._dropAllQueued(options.dropErrorMessage);
							return waitForExecuting(0);
						});
					})) : this.schedule({
						priority: NUM_PRIORITIES$1 - 1,
						weight: 0
					}, () => {
						return waitForExecuting(1);
					});
					this._receive = function(job) {
						return job._reject(new Bottleneck.prototype.BottleneckError(options.enqueueErrorMessage));
					};
					this.stop = () => {
						return this.Promise.reject(new Bottleneck.prototype.BottleneckError("stop() has already been called"));
					};
					return done;
				}
				async _addToQueue(job) {
					var args, blocked, error, options, reachedHWM, shifted, strategy;
					({args, options} = job);
					try {
						({reachedHWM, blocked, strategy} = await this._store.__submit__(this.queued(), options.weight));
					} catch (error1) {
						error = error1;
						this.Events.trigger("debug", `Could not queue ${options.id}`, {
							args,
							options,
							error
						});
						job.doDrop({ error });
						return false;
					}
					if (blocked) {
						job.doDrop();
						return true;
					} else if (reachedHWM) {
						shifted = strategy === Bottleneck.prototype.strategy.LEAK ? this._queues.shiftLastFrom(options.priority) : strategy === Bottleneck.prototype.strategy.OVERFLOW_PRIORITY ? this._queues.shiftLastFrom(options.priority + 1) : strategy === Bottleneck.prototype.strategy.OVERFLOW ? job : void 0;
						if (shifted != null) shifted.doDrop();
						if (shifted == null || strategy === Bottleneck.prototype.strategy.OVERFLOW) {
							if (shifted == null) job.doDrop();
							return reachedHWM;
						}
					}
					job.doQueue(reachedHWM, blocked);
					this._queues.push(job);
					await this._drainAll();
					return reachedHWM;
				}
				_receive(job) {
					if (this._states.jobStatus(job.options.id) != null) {
						job._reject(new Bottleneck.prototype.BottleneckError(`A job with the same id already exists (id=${job.options.id})`));
						return false;
					} else {
						job.doReceive();
						return this._submitLock.schedule(this._addToQueue, job);
					}
				}
				submit(...args) {
					var cb, fn, job, options, ref, ref1, task;
					if (typeof args[0] === "function") {
						ref = args, [fn, ...args] = ref, [cb] = splice.call(args, -1);
						options = parser$5.load({}, this.jobDefaults);
					} else {
						ref1 = args, [options, fn, ...args] = ref1, [cb] = splice.call(args, -1);
						options = parser$5.load(options, this.jobDefaults);
					}
					task = (...args) => {
						return new this.Promise(function(resolve, reject) {
							return fn(...args, function(...args) {
								return (args[0] != null ? reject : resolve)(args);
							});
						});
					};
					job = new Job$1(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);
					job.promise.then(function(args) {
						return typeof cb === "function" ? cb(...args) : void 0;
					}).catch(function(args) {
						if (Array.isArray(args)) return typeof cb === "function" ? cb(...args) : void 0;
						else return typeof cb === "function" ? cb(args) : void 0;
					});
					return this._receive(job);
				}
				schedule(...args) {
					var job, options, task;
					if (typeof args[0] === "function") {
						[task, ...args] = args;
						options = {};
					} else [options, task, ...args] = args;
					job = new Job$1(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);
					this._receive(job);
					return job.promise;
				}
				wrap(fn) {
					var schedule = this.schedule.bind(this), wrapped = function(...args) {
						return schedule(fn.bind(this), ...args);
					};
					wrapped.withOptions = function(options, ...args) {
						return schedule(options, fn, ...args);
					};
					return wrapped;
				}
				async updateSettings(options = {}) {
					await this._store.__updateSettings__(parser$5.overwrite(options, this.storeDefaults));
					parser$5.overwrite(options, this.instanceDefaults, this);
					return this;
				}
				currentReservoir() {
					return this._store.__currentReservoir__();
				}
				incrementReservoir(incr = 0) {
					return this._store.__incrementReservoir__(incr);
				}
			}
			Bottleneck.default = Bottleneck;
			Bottleneck.Events = Events$4;
			Bottleneck.version = Bottleneck.prototype.version = require$$8.version;
			Bottleneck.strategy = Bottleneck.prototype.strategy = {
				LEAK: 1,
				OVERFLOW: 2,
				OVERFLOW_PRIORITY: 4,
				BLOCK: 3
			};
			Bottleneck.BottleneckError = Bottleneck.prototype.BottleneckError = BottleneckError_1;
			Bottleneck.Group = Bottleneck.prototype.Group = Group_1;
			Bottleneck.RedisConnection = Bottleneck.prototype.RedisConnection = require$$2;
			Bottleneck.IORedisConnection = Bottleneck.prototype.IORedisConnection = require$$3;
			Bottleneck.Batcher = Bottleneck.prototype.Batcher = Batcher_1;
			Bottleneck.prototype.jobDefaults = {
				priority: DEFAULT_PRIORITY$1,
				weight: 1,
				expiration: null,
				id: "<no-id>"
			};
			Bottleneck.prototype.storeDefaults = {
				maxConcurrent: null,
				minTime: 0,
				highWater: null,
				strategy: Bottleneck.prototype.strategy.LEAK,
				penalty: null,
				reservoir: null,
				reservoirRefreshInterval: null,
				reservoirRefreshAmount: null,
				reservoirIncreaseInterval: null,
				reservoirIncreaseAmount: null,
				reservoirIncreaseMaximum: null
			};
			Bottleneck.prototype.localStoreDefaults = {
				Promise,
				timeout: null,
				heartbeatInterval: 250
			};
			Bottleneck.prototype.redisStoreDefaults = {
				Promise,
				timeout: null,
				heartbeatInterval: 5e3,
				clientTimeout: 1e4,
				Redis: null,
				clientOptions: {},
				clusterNodes: null,
				clearDatastore: false,
				connection: null
			};
			Bottleneck.prototype.instanceDefaults = {
				datastore: "local",
				connection: null,
				id: "<no-id>",
				rejectOnDrop: true,
				trackDoneStatus: false,
				Promise
			};
			Bottleneck.prototype.stopDefaults = {
				enqueueErrorMessage: "This limiter has been stopped and cannot accept new jobs.",
				dropWaitingJobs: true,
				dropErrorMessage: "This limiter has been stopped."
			};
			return Bottleneck;
		}).call(commonjsGlobal);
		var Bottleneck_1 = Bottleneck;
		return Bottleneck_1;
	}));
}));

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-retry@8.1.0_@octokit+core@7.0.6/node_modules/@octokit/plugin-retry/dist-bundle/index.js
var import_light = /* @__PURE__ */ __toESM(require_light(), 1);
var VERSION$9 = "0.0.0-development";
function isRequestError(error) {
	return error.request !== void 0;
}
async function errorRequest(state, octokit, error, options) {
	if (!isRequestError(error) || !error?.request.request) throw error;
	if (error.status >= 400 && !state.doNotRetry.includes(error.status)) {
		const retries = options.request.retries != null ? options.request.retries : state.retries;
		const retryAfter = Math.pow((options.request.retryCount || 0) + 1, 2);
		throw octokit.retry.retryRequest(error, retries, retryAfter);
	}
	throw error;
}
async function wrapRequest$1(state, octokit, request, options) {
	const limiter = new import_light.default();
	limiter.on("failed", function(error, info) {
		const maxRetries = ~~error.request.request?.retries;
		const after = ~~error.request.request?.retryAfter;
		options.request.retryCount = info.retryCount + 1;
		if (maxRetries > info.retryCount) return after * state.retryAfterBaseValue;
	});
	return limiter.schedule(requestWithGraphqlErrorHandling.bind(null, state, octokit, request), options);
}
async function requestWithGraphqlErrorHandling(state, octokit, request, options) {
	const response = await request(options);
	if (response.data && response.data.errors && response.data.errors.length > 0 && /Something went wrong while executing your query/.test(response.data.errors[0].message)) return errorRequest(state, octokit, new RequestError(response.data.errors[0].message, 500, {
		request: options,
		response
	}), options);
	return response;
}
function retry(octokit, octokitOptions) {
	const state = Object.assign({
		enabled: true,
		retryAfterBaseValue: 1e3,
		doNotRetry: [
			400,
			401,
			403,
			404,
			410,
			422,
			451
		],
		retries: 3
	}, octokitOptions.retry);
	const retryPlugin = { retry: { retryRequest: (error, retries, retryAfter) => {
		error.request.request = Object.assign({}, error.request.request, {
			retries,
			retryAfter
		});
		return error;
	} } };
	if (state.enabled) {
		octokit.hook.error("request", errorRequest.bind(null, state, retryPlugin));
		octokit.hook.wrap("request", wrapRequest$1.bind(null, state, retryPlugin));
	}
	return retryPlugin;
}
retry.VERSION = VERSION$9;

//#endregion
//#region ../../node_modules/.pnpm/@octokit+plugin-throttling@11.0.3_@octokit+core@7.0.6/node_modules/@octokit/plugin-throttling/dist-bundle/index.js
var VERSION$8 = "0.0.0-development";
var noop = () => Promise.resolve();
function wrapRequest(state, request, options) {
	return state.retryLimiter.schedule(doRequest, state, request, options);
}
async function doRequest(state, request, options) {
	const { pathname } = new URL(options.url, "http://github.test");
	const isAuth = isAuthRequest(options.method, pathname);
	const isWrite = !isAuth && options.method !== "GET" && options.method !== "HEAD";
	const isSearch = options.method === "GET" && pathname.startsWith("/search/");
	const isGraphQL = pathname.startsWith("/graphql");
	const jobOptions = ~~request.retryCount > 0 ? {
		priority: 0,
		weight: 0
	} : {};
	if (state.clustering) jobOptions.expiration = 1e3 * 60;
	if (isWrite || isGraphQL) await state.write.key(state.id).schedule(jobOptions, noop);
	if (isWrite && state.triggersNotification(pathname)) await state.notifications.key(state.id).schedule(jobOptions, noop);
	if (isSearch) await state.search.key(state.id).schedule(jobOptions, noop);
	const req = (isAuth ? state.auth : state.global).key(state.id).schedule(jobOptions, request, options);
	if (isGraphQL) {
		const res = await req;
		if (res.data.errors != null && res.data.errors.some((error) => error.type === "RATE_LIMITED")) throw Object.assign(/* @__PURE__ */ new Error("GraphQL Rate Limit Exceeded"), {
			response: res,
			data: res.data
		});
	}
	return req;
}
function isAuthRequest(method, pathname) {
	return method === "PATCH" && /^\/applications\/[^/]+\/token\/scoped$/.test(pathname) || method === "POST" && (/^\/applications\/[^/]+\/token$/.test(pathname) || /^\/app\/installations\/[^/]+\/access_tokens$/.test(pathname) || pathname === "/login/oauth/access_token");
}
var triggers_notification_paths_default = [
	"/orgs/{org}/invitations",
	"/orgs/{org}/invitations/{invitation_id}",
	"/orgs/{org}/teams/{team_slug}/discussions",
	"/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
	"/repos/{owner}/{repo}/collaborators/{username}",
	"/repos/{owner}/{repo}/commits/{commit_sha}/comments",
	"/repos/{owner}/{repo}/issues",
	"/repos/{owner}/{repo}/issues/{issue_number}/comments",
	"/repos/{owner}/{repo}/issues/{issue_number}/sub_issue",
	"/repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority",
	"/repos/{owner}/{repo}/pulls",
	"/repos/{owner}/{repo}/pulls/{pull_number}/comments",
	"/repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies",
	"/repos/{owner}/{repo}/pulls/{pull_number}/merge",
	"/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
	"/repos/{owner}/{repo}/pulls/{pull_number}/reviews",
	"/repos/{owner}/{repo}/releases",
	"/teams/{team_id}/discussions",
	"/teams/{team_id}/discussions/{discussion_number}/comments"
];
function routeMatcher$1(paths) {
	const regex2 = `^(?:${paths.map((path) => path.split("/").map((c) => c.startsWith("{") ? "(?:.+?)" : c).join("/")).map((r) => `(?:${r})`).join("|")})[^/]*$`;
	return new RegExp(regex2, "i");
}
var regex$1 = routeMatcher$1(triggers_notification_paths_default);
var triggersNotification = regex$1.test.bind(regex$1);
var groups = {};
var createGroups = function(Bottleneck, common) {
	groups.global = new Bottleneck.Group({
		id: "octokit-global",
		maxConcurrent: 10,
		...common
	});
	groups.auth = new Bottleneck.Group({
		id: "octokit-auth",
		maxConcurrent: 1,
		...common
	});
	groups.search = new Bottleneck.Group({
		id: "octokit-search",
		maxConcurrent: 1,
		minTime: 2e3,
		...common
	});
	groups.write = new Bottleneck.Group({
		id: "octokit-write",
		maxConcurrent: 1,
		minTime: 1e3,
		...common
	});
	groups.notifications = new Bottleneck.Group({
		id: "octokit-notifications",
		maxConcurrent: 1,
		minTime: 3e3,
		...common
	});
};
function throttling(octokit, octokitOptions) {
	const { enabled = true, Bottleneck = import_light.default, id = "no-id", timeout = 1e3 * 60 * 2, connection } = octokitOptions.throttle || {};
	if (!enabled) return {};
	const common = { timeout };
	if (typeof connection !== "undefined") common.connection = connection;
	if (groups.global == null) createGroups(Bottleneck, common);
	const state = Object.assign({
		clustering: connection != null,
		triggersNotification,
		fallbackSecondaryRateRetryAfter: 60,
		retryAfterBaseValue: 1e3,
		retryLimiter: new Bottleneck(),
		id,
		...groups
	}, octokitOptions.throttle);
	if (typeof state.onSecondaryRateLimit !== "function" || typeof state.onRateLimit !== "function") throw new Error(`octokit/plugin-throttling error:
        You must pass the onSecondaryRateLimit and onRateLimit error handlers.
        See https://octokit.github.io/rest.js/#throttling

        const octokit = new Octokit({
          throttle: {
            onSecondaryRateLimit: (retryAfter, options) => {/* ... */},
            onRateLimit: (retryAfter, options) => {/* ... */}
          }
        })
    `);
	const events = {};
	const emitter = new Bottleneck.Events(events);
	events.on("secondary-limit", state.onSecondaryRateLimit);
	events.on("rate-limit", state.onRateLimit);
	events.on("error", (e) => octokit.log.warn("Error in throttling-plugin limit handler", e));
	state.retryLimiter.on("failed", async function(error, info) {
		const [state2, request, options] = info.args;
		const { pathname } = new URL(options.url, "http://github.test");
		if (!(pathname.startsWith("/graphql") && error.status !== 401 || error.status === 403 || error.status === 429)) return;
		const retryCount = ~~request.retryCount;
		request.retryCount = retryCount;
		options.request.retryCount = retryCount;
		const { wantRetry, retryAfter = 0 } = await (async function() {
			if (/\bsecondary rate\b/i.test(error.message)) {
				const retryAfter2 = Number(error.response.headers["retry-after"]) || state2.fallbackSecondaryRateRetryAfter;
				return {
					wantRetry: await emitter.trigger("secondary-limit", retryAfter2, options, octokit, retryCount),
					retryAfter: retryAfter2
				};
			}
			if (error.response.headers != null && error.response.headers["x-ratelimit-remaining"] === "0" || (error.response.data?.errors ?? []).some((error2) => error2.type === "RATE_LIMITED")) {
				const rateLimitReset = (/* @__PURE__ */ new Date(~~error.response.headers["x-ratelimit-reset"] * 1e3)).getTime();
				const retryAfter2 = Math.max(Math.ceil((rateLimitReset - Date.now()) / 1e3) + 1, 0);
				return {
					wantRetry: await emitter.trigger("rate-limit", retryAfter2, options, octokit, retryCount),
					retryAfter: retryAfter2
				};
			}
			return {};
		})();
		if (wantRetry) {
			request.retryCount++;
			return retryAfter * state2.retryAfterBaseValue;
		}
	});
	octokit.hook.wrap("request", wrapRequest.bind(null, state));
	return {};
}
throttling.VERSION = VERSION$8;
throttling.triggersNotification = triggersNotification;

//#endregion
//#region ../../node_modules/.pnpm/@octokit+oauth-authorization-url@8.0.0/node_modules/@octokit/oauth-authorization-url/dist-src/index.js
function oauthAuthorizationUrl(options) {
	const clientType = options.clientType || "oauth-app";
	const baseUrl = options.baseUrl || "https://github.com";
	const result = {
		clientType,
		allowSignup: options.allowSignup === false ? false : true,
		clientId: options.clientId,
		login: options.login || null,
		redirectUrl: options.redirectUrl || null,
		state: options.state || Math.random().toString(36).substr(2),
		url: ""
	};
	if (clientType === "oauth-app") {
		const scopes = "scopes" in options ? options.scopes : [];
		result.scopes = typeof scopes === "string" ? scopes.split(/[,\s]+/).filter(Boolean) : scopes;
	}
	result.url = urlBuilderAuthorize(`${baseUrl}/login/oauth/authorize`, result);
	return result;
}
function urlBuilderAuthorize(base, options) {
	const map = {
		allowSignup: "allow_signup",
		clientId: "client_id",
		login: "login",
		redirectUrl: "redirect_uri",
		scopes: "scope",
		state: "state"
	};
	let url = base;
	Object.keys(map).filter((k) => options[k] !== null).filter((k) => {
		if (k !== "scopes") return true;
		if (options.clientType === "github-app") return false;
		return !Array.isArray(options[k]) || options[k].length > 0;
	}).map((key) => [map[key], `${options[key]}`]).forEach(([key, value], index) => {
		url += index === 0 ? `?` : "&";
		url += `${key}=${encodeURIComponent(value)}`;
	});
	return url;
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+oauth-methods@6.0.2/node_modules/@octokit/oauth-methods/dist-bundle/index.js
function requestToOAuthBaseUrl(request) {
	const endpointDefaults = request.endpoint.DEFAULTS;
	return /^https:\/\/(api\.)?github\.com$/.test(endpointDefaults.baseUrl) ? "https://github.com" : endpointDefaults.baseUrl.replace("/api/v3", "");
}
async function oauthRequest(request, route, parameters) {
	const withOAuthParameters = {
		baseUrl: requestToOAuthBaseUrl(request),
		headers: { accept: "application/json" },
		...parameters
	};
	const response = await request(route, withOAuthParameters);
	if ("error" in response.data) {
		const error = new RequestError(`${response.data.error_description} (${response.data.error}, ${response.data.error_uri})`, 400, { request: request.endpoint.merge(route, withOAuthParameters) });
		error.response = response;
		throw error;
	}
	return response;
}
function getWebFlowAuthorizationUrl({ request: request$4 = request, ...options }) {
	const baseUrl = requestToOAuthBaseUrl(request$4);
	return oauthAuthorizationUrl({
		...options,
		baseUrl
	});
}
async function exchangeWebFlowCode(options) {
	const response = await oauthRequest(options.request || request, "POST /login/oauth/access_token", {
		client_id: options.clientId,
		client_secret: options.clientSecret,
		code: options.code,
		redirect_uri: options.redirectUrl
	});
	const authentication = {
		clientType: options.clientType,
		clientId: options.clientId,
		clientSecret: options.clientSecret,
		token: response.data.access_token,
		scopes: response.data.scope.split(/\s+/).filter(Boolean)
	};
	if (options.clientType === "github-app") {
		if ("refresh_token" in response.data) {
			const apiTimeInMs = new Date(response.headers.date).getTime();
			authentication.refreshToken = response.data.refresh_token, authentication.expiresAt = toTimestamp(apiTimeInMs, response.data.expires_in), authentication.refreshTokenExpiresAt = toTimestamp(apiTimeInMs, response.data.refresh_token_expires_in);
		}
		delete authentication.scopes;
	}
	return {
		...response,
		authentication
	};
}
function toTimestamp(apiTimeInMs, expirationInSeconds) {
	return new Date(apiTimeInMs + expirationInSeconds * 1e3).toISOString();
}
async function createDeviceCode(options) {
	const request$5 = options.request || request;
	const parameters = { client_id: options.clientId };
	if ("scopes" in options && Array.isArray(options.scopes)) parameters.scope = options.scopes.join(" ");
	return oauthRequest(request$5, "POST /login/device/code", parameters);
}
async function exchangeDeviceCode(options) {
	const response = await oauthRequest(options.request || request, "POST /login/oauth/access_token", {
		client_id: options.clientId,
		device_code: options.code,
		grant_type: "urn:ietf:params:oauth:grant-type:device_code"
	});
	const authentication = {
		clientType: options.clientType,
		clientId: options.clientId,
		token: response.data.access_token,
		scopes: response.data.scope.split(/\s+/).filter(Boolean)
	};
	if ("clientSecret" in options) authentication.clientSecret = options.clientSecret;
	if (options.clientType === "github-app") {
		if ("refresh_token" in response.data) {
			const apiTimeInMs = new Date(response.headers.date).getTime();
			authentication.refreshToken = response.data.refresh_token, authentication.expiresAt = toTimestamp2(apiTimeInMs, response.data.expires_in), authentication.refreshTokenExpiresAt = toTimestamp2(apiTimeInMs, response.data.refresh_token_expires_in);
		}
		delete authentication.scopes;
	}
	return {
		...response,
		authentication
	};
}
function toTimestamp2(apiTimeInMs, expirationInSeconds) {
	return new Date(apiTimeInMs + expirationInSeconds * 1e3).toISOString();
}
async function checkToken(options) {
	const response = await (options.request || request)("POST /applications/{client_id}/token", {
		headers: { authorization: `basic ${btoa(`${options.clientId}:${options.clientSecret}`)}` },
		client_id: options.clientId,
		access_token: options.token
	});
	const authentication = {
		clientType: options.clientType,
		clientId: options.clientId,
		clientSecret: options.clientSecret,
		token: options.token,
		scopes: response.data.scopes
	};
	if (response.data.expires_at) authentication.expiresAt = response.data.expires_at;
	if (options.clientType === "github-app") delete authentication.scopes;
	return {
		...response,
		authentication
	};
}
async function refreshToken(options) {
	const response = await oauthRequest(options.request || request, "POST /login/oauth/access_token", {
		client_id: options.clientId,
		client_secret: options.clientSecret,
		grant_type: "refresh_token",
		refresh_token: options.refreshToken
	});
	const apiTimeInMs = new Date(response.headers.date).getTime();
	const authentication = {
		clientType: "github-app",
		clientId: options.clientId,
		clientSecret: options.clientSecret,
		token: response.data.access_token,
		refreshToken: response.data.refresh_token,
		expiresAt: toTimestamp3(apiTimeInMs, response.data.expires_in),
		refreshTokenExpiresAt: toTimestamp3(apiTimeInMs, response.data.refresh_token_expires_in)
	};
	return {
		...response,
		authentication
	};
}
function toTimestamp3(apiTimeInMs, expirationInSeconds) {
	return new Date(apiTimeInMs + expirationInSeconds * 1e3).toISOString();
}
async function scopeToken(options) {
	const { request: optionsRequest, clientType, clientId, clientSecret, token, ...requestOptions } = options;
	const response = await (options.request || request)("POST /applications/{client_id}/token/scoped", {
		headers: { authorization: `basic ${btoa(`${clientId}:${clientSecret}`)}` },
		client_id: clientId,
		access_token: token,
		...requestOptions
	});
	const authentication = Object.assign({
		clientType,
		clientId,
		clientSecret,
		token: response.data.token
	}, response.data.expires_at ? { expiresAt: response.data.expires_at } : {});
	return {
		...response,
		authentication
	};
}
async function resetToken(options) {
	const response = await (options.request || request)("PATCH /applications/{client_id}/token", {
		headers: { authorization: `basic ${btoa(`${options.clientId}:${options.clientSecret}`)}` },
		client_id: options.clientId,
		access_token: options.token
	});
	const authentication = {
		clientType: options.clientType,
		clientId: options.clientId,
		clientSecret: options.clientSecret,
		token: response.data.token,
		scopes: response.data.scopes
	};
	if (response.data.expires_at) authentication.expiresAt = response.data.expires_at;
	if (options.clientType === "github-app") delete authentication.scopes;
	return {
		...response,
		authentication
	};
}
async function deleteToken(options) {
	return (options.request || request)("DELETE /applications/{client_id}/token", {
		headers: { authorization: `basic ${btoa(`${options.clientId}:${options.clientSecret}`)}` },
		client_id: options.clientId,
		access_token: options.token
	});
}
async function deleteAuthorization(options) {
	return (options.request || request)("DELETE /applications/{client_id}/grant", {
		headers: { authorization: `basic ${btoa(`${options.clientId}:${options.clientSecret}`)}` },
		client_id: options.clientId,
		access_token: options.token
	});
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+auth-oauth-device@8.0.3/node_modules/@octokit/auth-oauth-device/dist-bundle/index.js
async function getOAuthAccessToken(state, options) {
	const cachedAuthentication = getCachedAuthentication(state, options.auth);
	if (cachedAuthentication) return cachedAuthentication;
	const { data: verification } = await createDeviceCode({
		clientType: state.clientType,
		clientId: state.clientId,
		request: options.request || state.request,
		scopes: options.auth.scopes || state.scopes
	});
	await state.onVerification(verification);
	const authentication = await waitForAccessToken(options.request || state.request, state.clientId, state.clientType, verification);
	state.authentication = authentication;
	return authentication;
}
function getCachedAuthentication(state, auth2) {
	if (auth2.refresh === true) return false;
	if (!state.authentication) return false;
	if (state.clientType === "github-app") return state.authentication;
	const authentication = state.authentication;
	return ("scopes" in auth2 && auth2.scopes || state.scopes).join(" ") === authentication.scopes.join(" ") ? authentication : false;
}
async function wait(seconds) {
	await new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
}
async function waitForAccessToken(request, clientId, clientType, verification) {
	try {
		const options = {
			clientId,
			request,
			code: verification.device_code
		};
		const { authentication } = clientType === "oauth-app" ? await exchangeDeviceCode({
			...options,
			clientType: "oauth-app"
		}) : await exchangeDeviceCode({
			...options,
			clientType: "github-app"
		});
		return {
			type: "token",
			tokenType: "oauth",
			...authentication
		};
	} catch (error) {
		if (!error.response) throw error;
		const errorType = error.response.data.error;
		if (errorType === "authorization_pending") {
			await wait(verification.interval);
			return waitForAccessToken(request, clientId, clientType, verification);
		}
		if (errorType === "slow_down") {
			await wait(verification.interval + 7);
			return waitForAccessToken(request, clientId, clientType, verification);
		}
		throw error;
	}
}
async function auth$4(state, authOptions) {
	return getOAuthAccessToken(state, { auth: authOptions });
}
async function hook$4(state, request, route, parameters) {
	let endpoint = request.endpoint.merge(route, parameters);
	if (/\/login\/(oauth\/access_token|device\/code)$/.test(endpoint.url)) return request(endpoint);
	const { token } = await getOAuthAccessToken(state, {
		request,
		auth: { type: "oauth" }
	});
	endpoint.headers.authorization = `token ${token}`;
	return request(endpoint);
}
var VERSION$7 = "0.0.0-development";
function createOAuthDeviceAuth(options) {
	const requestWithDefaults = options.request || request.defaults({ headers: { "user-agent": `octokit-auth-oauth-device.js/${VERSION$7} ${getUserAgent()}` } });
	const { request: request$3 = requestWithDefaults, ...otherOptions } = options;
	const state = options.clientType === "github-app" ? {
		...otherOptions,
		clientType: "github-app",
		request: request$3
	} : {
		...otherOptions,
		clientType: "oauth-app",
		request: request$3,
		scopes: options.scopes || []
	};
	if (!options.clientId) throw new Error("[@octokit/auth-oauth-device] \"clientId\" option must be set (https://github.com/octokit/auth-oauth-device.js#usage)");
	if (!options.onVerification) throw new Error("[@octokit/auth-oauth-device] \"onVerification\" option must be a function (https://github.com/octokit/auth-oauth-device.js#usage)");
	return Object.assign(auth$4.bind(null, state), { hook: hook$4.bind(null, state) });
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+auth-oauth-user@6.0.2/node_modules/@octokit/auth-oauth-user/dist-bundle/index.js
var VERSION$6 = "0.0.0-development";
async function getAuthentication(state) {
	if ("code" in state.strategyOptions) {
		const { authentication } = await exchangeWebFlowCode({
			clientId: state.clientId,
			clientSecret: state.clientSecret,
			clientType: state.clientType,
			onTokenCreated: state.onTokenCreated,
			...state.strategyOptions,
			request: state.request
		});
		return {
			type: "token",
			tokenType: "oauth",
			...authentication
		};
	}
	if ("onVerification" in state.strategyOptions) {
		const authentication = await createOAuthDeviceAuth({
			clientType: state.clientType,
			clientId: state.clientId,
			onTokenCreated: state.onTokenCreated,
			...state.strategyOptions,
			request: state.request
		})({ type: "oauth" });
		return {
			clientSecret: state.clientSecret,
			...authentication
		};
	}
	if ("token" in state.strategyOptions) return {
		type: "token",
		tokenType: "oauth",
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		clientType: state.clientType,
		onTokenCreated: state.onTokenCreated,
		...state.strategyOptions
	};
	throw new Error("[@octokit/auth-oauth-user] Invalid strategy options");
}
async function auth$3(state, options = {}) {
	if (!state.authentication) state.authentication = state.clientType === "oauth-app" ? await getAuthentication(state) : await getAuthentication(state);
	if (state.authentication.invalid) throw new Error("[@octokit/auth-oauth-user] Token is invalid");
	const currentAuthentication = state.authentication;
	if ("expiresAt" in currentAuthentication) {
		if (options.type === "refresh" || new Date(currentAuthentication.expiresAt) < /* @__PURE__ */ new Date()) {
			const { authentication } = await refreshToken({
				clientType: "github-app",
				clientId: state.clientId,
				clientSecret: state.clientSecret,
				refreshToken: currentAuthentication.refreshToken,
				request: state.request
			});
			state.authentication = {
				tokenType: "oauth",
				type: "token",
				...authentication
			};
		}
	}
	if (options.type === "refresh") {
		if (state.clientType === "oauth-app") throw new Error("[@octokit/auth-oauth-user] OAuth Apps do not support expiring tokens");
		if (!currentAuthentication.hasOwnProperty("expiresAt")) throw new Error("[@octokit/auth-oauth-user] Refresh token missing");
		await state.onTokenCreated?.(state.authentication, { type: options.type });
	}
	if (options.type === "check" || options.type === "reset") {
		const method = options.type === "check" ? checkToken : resetToken;
		try {
			const { authentication } = await method({
				clientType: state.clientType,
				clientId: state.clientId,
				clientSecret: state.clientSecret,
				token: state.authentication.token,
				request: state.request
			});
			state.authentication = {
				tokenType: "oauth",
				type: "token",
				...authentication
			};
			if (options.type === "reset") await state.onTokenCreated?.(state.authentication, { type: options.type });
			return state.authentication;
		} catch (error) {
			if (error.status === 404) {
				error.message = "[@octokit/auth-oauth-user] Token is invalid";
				state.authentication.invalid = true;
			}
			throw error;
		}
	}
	if (options.type === "delete" || options.type === "deleteAuthorization") {
		const method = options.type === "delete" ? deleteToken : deleteAuthorization;
		try {
			await method({
				clientType: state.clientType,
				clientId: state.clientId,
				clientSecret: state.clientSecret,
				token: state.authentication.token,
				request: state.request
			});
		} catch (error) {
			if (error.status !== 404) throw error;
		}
		state.authentication.invalid = true;
		return state.authentication;
	}
	return state.authentication;
}
var ROUTES_REQUIRING_BASIC_AUTH = /\/applications\/[^/]+\/(token|grant)s?/;
function requiresBasicAuth(url) {
	return url && ROUTES_REQUIRING_BASIC_AUTH.test(url);
}
async function hook$3(state, request, route, parameters = {}) {
	const endpoint = request.endpoint.merge(route, parameters);
	if (/\/login\/(oauth\/access_token|device\/code)$/.test(endpoint.url)) return request(endpoint);
	if (requiresBasicAuth(endpoint.url)) {
		const credentials = btoa(`${state.clientId}:${state.clientSecret}`);
		endpoint.headers.authorization = `basic ${credentials}`;
		return request(endpoint);
	}
	const { token } = state.clientType === "oauth-app" ? await auth$3({
		...state,
		request
	}) : await auth$3({
		...state,
		request
	});
	endpoint.headers.authorization = "token " + token;
	return request(endpoint);
}
function createOAuthUserAuth({ clientId, clientSecret, clientType = "oauth-app", request: request$2 = request.defaults({ headers: { "user-agent": `octokit-auth-oauth-app.js/${VERSION$6} ${getUserAgent()}` } }), onTokenCreated, ...strategyOptions }) {
	const state = Object.assign({
		clientType,
		clientId,
		clientSecret,
		onTokenCreated,
		strategyOptions,
		request: request$2
	});
	return Object.assign(auth$3.bind(null, state), { hook: hook$3.bind(null, state) });
}
createOAuthUserAuth.VERSION = VERSION$6;

//#endregion
//#region ../../node_modules/.pnpm/@octokit+auth-oauth-app@9.0.3/node_modules/@octokit/auth-oauth-app/dist-bundle/index.js
async function auth$2(state, authOptions) {
	if (authOptions.type === "oauth-app") return {
		type: "oauth-app",
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		clientType: state.clientType,
		headers: { authorization: `basic ${btoa(`${state.clientId}:${state.clientSecret}`)}` }
	};
	if ("factory" in authOptions) {
		const { type, ...options } = {
			...authOptions,
			...state
		};
		return authOptions.factory(options);
	}
	const common = {
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		request: state.request,
		...authOptions
	};
	return (state.clientType === "oauth-app" ? await createOAuthUserAuth({
		...common,
		clientType: state.clientType
	}) : await createOAuthUserAuth({
		...common,
		clientType: state.clientType
	}))();
}
async function hook$2(state, request2, route, parameters) {
	let endpoint = request2.endpoint.merge(route, parameters);
	if (/\/login\/(oauth\/access_token|device\/code)$/.test(endpoint.url)) return request2(endpoint);
	if (state.clientType === "github-app" && !requiresBasicAuth(endpoint.url)) throw new Error(`[@octokit/auth-oauth-app] GitHub Apps cannot use their client ID/secret for basic authentication for endpoints other than "/applications/{client_id}/**". "${endpoint.method} ${endpoint.url}" is not supported.`);
	const credentials = btoa(`${state.clientId}:${state.clientSecret}`);
	endpoint.headers.authorization = `basic ${credentials}`;
	try {
		return await request2(endpoint);
	} catch (error) {
		if (error.status !== 401) throw error;
		error.message = `[@octokit/auth-oauth-app] "${endpoint.method} ${endpoint.url}" does not support clientId/clientSecret basic authentication.`;
		throw error;
	}
}
var VERSION$5 = "0.0.0-development";
function createOAuthAppAuth(options) {
	const state = Object.assign({
		request: request.defaults({ headers: { "user-agent": `octokit-auth-oauth-app.js/${VERSION$5} ${getUserAgent()}` } }),
		clientType: "oauth-app"
	}, options);
	return Object.assign(auth$2.bind(null, state), { hook: hook$2.bind(null, state) });
}

//#endregion
//#region ../../node_modules/.pnpm/universal-github-app-jwt@2.2.2/node_modules/universal-github-app-jwt/lib/utils.js
/**
* @param {string} privateKey
* @returns {boolean}
*/
function isPkcs1(privateKey) {
	return privateKey.includes("-----BEGIN RSA PRIVATE KEY-----");
}
/**
* @param {string} privateKey
* @returns {boolean}
*/
function isOpenSsh(privateKey) {
	return privateKey.includes("-----BEGIN OPENSSH PRIVATE KEY-----");
}
/**
* @param {string} str
* @returns {ArrayBuffer}
*/
function string2ArrayBuffer(str) {
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i++) bufView[i] = str.charCodeAt(i);
	return buf;
}
/**
* @param {string} pem
* @returns {ArrayBuffer}
*/
function getDERfromPEM(pem) {
	const pemB64 = pem.trim().split("\n").slice(1, -1).join("");
	return string2ArrayBuffer(atob(pemB64));
}
/**
* @param {import('../internals').Header} header
* @param {import('../internals').Payload} payload
* @returns {string}
*/
function getEncodedMessage(header, payload) {
	return `${base64encodeJSON(header)}.${base64encodeJSON(payload)}`;
}
/**
* @param {ArrayBuffer} buffer
* @returns {string}
*/
function base64encode(buffer) {
	var binary = "";
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
	return fromBase64(btoa(binary));
}
/**
* @param {string} base64
* @returns {string}
*/
function fromBase64(base64) {
	return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
/**
* @param {Record<string,unknown>} obj
* @returns {string}
*/
function base64encodeJSON(obj) {
	return fromBase64(btoa(JSON.stringify(obj)));
}

//#endregion
//#region ../../node_modules/.pnpm/universal-github-app-jwt@2.2.2/node_modules/universal-github-app-jwt/lib/crypto-node.js
function convertPrivateKey(privateKey) {
	if (!isPkcs1(privateKey)) return privateKey;
	return createPrivateKey(privateKey).export({
		type: "pkcs8",
		format: "pem"
	});
}

//#endregion
//#region ../../node_modules/.pnpm/universal-github-app-jwt@2.2.2/node_modules/universal-github-app-jwt/lib/get-token.js
/**
* @param {import('../internals').GetTokenOptions} options
* @returns {Promise<string>}
*/
async function getToken({ privateKey, payload }) {
	const convertedPrivateKey = convertPrivateKey(privateKey);
	/* c8 ignore start */
	if (isPkcs1(convertedPrivateKey)) throw new Error("[universal-github-app-jwt] Private Key is in PKCS#1 format, but only PKCS#8 is supported. See https://github.com/gr2m/universal-github-app-jwt#private-key-formats");
	/* c8 ignore stop */
	if (isOpenSsh(convertedPrivateKey)) throw new Error("[universal-github-app-jwt] Private Key is in OpenSSH format, but only PKCS#8 is supported. See https://github.com/gr2m/universal-github-app-jwt#private-key-formats");
	const algorithm = {
		name: "RSASSA-PKCS1-v1_5",
		hash: { name: "SHA-256" }
	};
	/** @type {import('../internals').Header} */
	const header = {
		alg: "RS256",
		typ: "JWT"
	};
	const privateKeyDER = getDERfromPEM(convertedPrivateKey);
	const importedKey = await subtle.importKey("pkcs8", privateKeyDER, algorithm, false, ["sign"]);
	const encodedMessage = getEncodedMessage(header, payload);
	const encodedMessageArrBuf = string2ArrayBuffer(encodedMessage);
	return `${encodedMessage}.${base64encode(await subtle.sign(algorithm.name, importedKey, encodedMessageArrBuf))}`;
}

//#endregion
//#region ../../node_modules/.pnpm/universal-github-app-jwt@2.2.2/node_modules/universal-github-app-jwt/index.js
/**
* @param {import(".").Options} options
* @returns {Promise<import(".").Result>}
*/
async function githubAppJwt({ id, privateKey, now = Math.floor(Date.now() / 1e3) }) {
	const privateKeyWithNewlines = privateKey.replace(/\\n/g, "\n");
	const nowWithSafetyMargin = now - 30;
	const expiration = nowWithSafetyMargin + 600;
	return {
		appId: id,
		expiration,
		token: await getToken({
			privateKey: privateKeyWithNewlines,
			payload: {
				iat: nowWithSafetyMargin,
				exp: expiration,
				iss: id
			}
		})
	};
}

//#endregion
//#region ../../node_modules/.pnpm/toad-cache@3.7.0/node_modules/toad-cache/dist/toad-cache.mjs
var LruObject = class {
	constructor(max = 1e3, ttlInMsecs = 0) {
		if (isNaN(max) || max < 0) throw new Error("Invalid max value");
		if (isNaN(ttlInMsecs) || ttlInMsecs < 0) throw new Error("Invalid ttl value");
		this.first = null;
		this.items = Object.create(null);
		this.last = null;
		this.size = 0;
		this.max = max;
		this.ttl = ttlInMsecs;
	}
	bumpLru(item) {
		if (this.last === item) return;
		const last = this.last;
		const next = item.next;
		const prev = item.prev;
		if (this.first === item) this.first = next;
		item.next = null;
		item.prev = last;
		last.next = item;
		if (prev !== null) prev.next = next;
		if (next !== null) next.prev = prev;
		this.last = item;
	}
	clear() {
		this.items = Object.create(null);
		this.first = null;
		this.last = null;
		this.size = 0;
	}
	delete(key) {
		if (Object.prototype.hasOwnProperty.call(this.items, key)) {
			const item = this.items[key];
			delete this.items[key];
			this.size--;
			if (item.prev !== null) item.prev.next = item.next;
			if (item.next !== null) item.next.prev = item.prev;
			if (this.first === item) this.first = item.next;
			if (this.last === item) this.last = item.prev;
		}
	}
	deleteMany(keys) {
		for (var i = 0; i < keys.length; i++) this.delete(keys[i]);
	}
	evict() {
		if (this.size > 0) {
			const item = this.first;
			delete this.items[item.key];
			if (--this.size === 0) {
				this.first = null;
				this.last = null;
			} else {
				this.first = item.next;
				this.first.prev = null;
			}
		}
	}
	expiresAt(key) {
		if (Object.prototype.hasOwnProperty.call(this.items, key)) return this.items[key].expiry;
	}
	get(key) {
		if (Object.prototype.hasOwnProperty.call(this.items, key)) {
			const item = this.items[key];
			if (this.ttl > 0 && item.expiry <= Date.now()) {
				this.delete(key);
				return;
			}
			this.bumpLru(item);
			return item.value;
		}
	}
	getMany(keys) {
		const result = [];
		for (var i = 0; i < keys.length; i++) result.push(this.get(keys[i]));
		return result;
	}
	keys() {
		return Object.keys(this.items);
	}
	set(key, value) {
		if (Object.prototype.hasOwnProperty.call(this.items, key)) {
			const item = this.items[key];
			item.value = value;
			item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
			if (this.last !== item) this.bumpLru(item);
			return;
		}
		if (this.max > 0 && this.size === this.max) this.evict();
		const item = {
			expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
			key,
			prev: this.last,
			next: null,
			value
		};
		this.items[key] = item;
		if (++this.size === 1) this.first = item;
		else this.last.next = item;
		this.last = item;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+auth-app@8.2.0/node_modules/@octokit/auth-app/dist-node/index.js
async function getAppAuthentication({ appId, privateKey, timeDifference, createJwt }) {
	try {
		if (createJwt) {
			const { jwt, expiresAt } = await createJwt(appId, timeDifference);
			return {
				type: "app",
				token: jwt,
				appId,
				expiresAt
			};
		}
		const authOptions = {
			id: appId,
			privateKey
		};
		if (timeDifference) Object.assign(authOptions, { now: Math.floor(Date.now() / 1e3) + timeDifference });
		const appAuthentication = await githubAppJwt(authOptions);
		return {
			type: "app",
			token: appAuthentication.token,
			appId: appAuthentication.appId,
			expiresAt: (/* @__PURE__ */ new Date(appAuthentication.expiration * 1e3)).toISOString()
		};
	} catch (error) {
		if (privateKey === "-----BEGIN RSA PRIVATE KEY-----") throw new Error("The 'privateKey` option contains only the first line '-----BEGIN RSA PRIVATE KEY-----'. If you are setting it using a `.env` file, make sure it is set on a single line with newlines replaced by '\n'");
		else throw error;
	}
}
function getCache() {
	return new LruObject(15e3, 1e3 * 60 * 59);
}
async function get(cache, options) {
	const cacheKey = optionsToCacheKey(options);
	const result = await cache.get(cacheKey);
	if (!result) return;
	const [token, createdAt, expiresAt, repositorySelection, permissionsString, singleFileName] = result.split("|");
	return {
		token,
		createdAt,
		expiresAt,
		permissions: options.permissions || permissionsString.split(/,/).reduce((permissions2, string) => {
			if (/!$/.test(string)) permissions2[string.slice(0, -1)] = "write";
			else permissions2[string] = "read";
			return permissions2;
		}, {}),
		repositoryIds: options.repositoryIds,
		repositoryNames: options.repositoryNames,
		singleFileName,
		repositorySelection
	};
}
async function set(cache, options, data) {
	const key = optionsToCacheKey(options);
	const permissionsString = options.permissions ? "" : Object.keys(data.permissions).map((name) => `${name}${data.permissions[name] === "write" ? "!" : ""}`).join(",");
	const value = [
		data.token,
		data.createdAt,
		data.expiresAt,
		data.repositorySelection,
		permissionsString,
		data.singleFileName
	].join("|");
	await cache.set(key, value);
}
function optionsToCacheKey({ installationId, permissions = {}, repositoryIds = [], repositoryNames = [] }) {
	const permissionsString = Object.keys(permissions).sort().map((name) => permissions[name] === "read" ? name : `${name}!`).join(",");
	return [
		installationId,
		repositoryIds.sort().join(","),
		repositoryNames.join(","),
		permissionsString
	].filter(Boolean).join("|");
}
function toTokenAuthentication({ installationId, token, createdAt, expiresAt, repositorySelection, permissions, repositoryIds, repositoryNames, singleFileName }) {
	return Object.assign({
		type: "token",
		tokenType: "installation",
		token,
		installationId,
		permissions,
		createdAt,
		expiresAt,
		repositorySelection
	}, repositoryIds ? { repositoryIds } : null, repositoryNames ? { repositoryNames } : null, singleFileName ? { singleFileName } : null);
}
async function getInstallationAuthentication(state, options, customRequest) {
	const installationId = Number(options.installationId || state.installationId);
	if (!installationId) throw new Error("[@octokit/auth-app] installationId option is required for installation authentication.");
	if (options.factory) {
		const { type, factory, oauthApp, ...factoryAuthOptions } = {
			...state,
			...options
		};
		return factory(factoryAuthOptions);
	}
	const request = customRequest || state.request;
	return getInstallationAuthenticationConcurrently(state, {
		...options,
		installationId
	}, request);
}
var pendingPromises = /* @__PURE__ */ new Map();
function getInstallationAuthenticationConcurrently(state, options, request) {
	const cacheKey = optionsToCacheKey(options);
	if (pendingPromises.has(cacheKey)) return pendingPromises.get(cacheKey);
	const promise = getInstallationAuthenticationImpl(state, options, request).finally(() => pendingPromises.delete(cacheKey));
	pendingPromises.set(cacheKey, promise);
	return promise;
}
async function getInstallationAuthenticationImpl(state, options, request) {
	if (!options.refresh) {
		const result = await get(state.cache, options);
		if (result) {
			const { token: token2, createdAt: createdAt2, expiresAt: expiresAt2, permissions: permissions2, repositoryIds: repositoryIds2, repositoryNames: repositoryNames2, singleFileName: singleFileName2, repositorySelection: repositorySelection2 } = result;
			return toTokenAuthentication({
				installationId: options.installationId,
				token: token2,
				createdAt: createdAt2,
				expiresAt: expiresAt2,
				permissions: permissions2,
				repositorySelection: repositorySelection2,
				repositoryIds: repositoryIds2,
				repositoryNames: repositoryNames2,
				singleFileName: singleFileName2
			});
		}
	}
	const appAuthentication = await getAppAuthentication(state);
	const payload = {
		installation_id: options.installationId,
		mediaType: { previews: ["machine-man"] },
		headers: { authorization: `bearer ${appAuthentication.token}` }
	};
	if (options.repositoryIds) Object.assign(payload, { repository_ids: options.repositoryIds });
	if (options.repositoryNames) Object.assign(payload, { repositories: options.repositoryNames });
	if (options.permissions) Object.assign(payload, { permissions: options.permissions });
	const { data: { token, expires_at: expiresAt, repositories, permissions: permissionsOptional, repository_selection: repositorySelectionOptional, single_file: singleFileName } } = await request("POST /app/installations/{installation_id}/access_tokens", payload);
	const permissions = permissionsOptional || {};
	const repositorySelection = repositorySelectionOptional || "all";
	const repositoryIds = repositories ? repositories.map((r) => r.id) : void 0;
	const repositoryNames = repositories ? repositories.map((repo) => repo.name) : void 0;
	const createdAt = (/* @__PURE__ */ new Date()).toISOString();
	const cacheOptions = {
		token,
		createdAt,
		expiresAt,
		repositorySelection,
		permissions,
		repositoryIds,
		repositoryNames
	};
	if (singleFileName) Object.assign(payload, { singleFileName });
	await set(state.cache, options, cacheOptions);
	const cacheData = {
		installationId: options.installationId,
		token,
		createdAt,
		expiresAt,
		repositorySelection,
		permissions,
		repositoryIds,
		repositoryNames
	};
	if (singleFileName) Object.assign(cacheData, { singleFileName });
	return toTokenAuthentication(cacheData);
}
async function auth$1(state, authOptions) {
	switch (authOptions.type) {
		case "app": return getAppAuthentication(state);
		case "oauth-app": return state.oauthApp({ type: "oauth-app" });
		case "installation": return getInstallationAuthentication(state, {
			...authOptions,
			type: "installation"
		});
		case "oauth-user": return state.oauthApp(authOptions);
		default: throw new Error(`Invalid auth type: ${authOptions.type}`);
	}
}
var PATHS = [
	"/app",
	"/app/hook/config",
	"/app/hook/deliveries",
	"/app/hook/deliveries/{delivery_id}",
	"/app/hook/deliveries/{delivery_id}/attempts",
	"/app/installations",
	"/app/installations/{installation_id}",
	"/app/installations/{installation_id}/access_tokens",
	"/app/installations/{installation_id}/suspended",
	"/app/installation-requests",
	"/marketplace_listing/accounts/{account_id}",
	"/marketplace_listing/plan",
	"/marketplace_listing/plans",
	"/marketplace_listing/plans/{plan_id}/accounts",
	"/marketplace_listing/stubbed/accounts/{account_id}",
	"/marketplace_listing/stubbed/plan",
	"/marketplace_listing/stubbed/plans",
	"/marketplace_listing/stubbed/plans/{plan_id}/accounts",
	"/orgs/{org}/installation",
	"/repos/{owner}/{repo}/installation",
	"/users/{username}/installation",
	"/enterprises/{enterprise}/installation"
];
function routeMatcher(paths) {
	const regex = `^(?:${paths.map((p) => p.split("/").map((c) => c.startsWith("{") ? "(?:.+?)" : c).join("/")).map((r) => `(?:${r})`).join("|")})$`;
	return new RegExp(regex, "i");
}
var REGEX = routeMatcher(PATHS);
function requiresAppAuth(url) {
	return !!url && REGEX.test(url.split("?")[0]);
}
var FIVE_SECONDS_IN_MS = 5 * 1e3;
function isNotTimeSkewError(error) {
	return !(error.message.match(/'Expiration time' claim \('exp'\) is too far in the future/) || error.message.match(/'Expiration time' claim \('exp'\) must be a numeric value representing the future time at which the assertion expires/) || error.message.match(/'Issued at' claim \('iat'\) must be an Integer representing the time that the assertion was issued/));
}
async function hook$1(state, request, route, parameters) {
	const endpoint = request.endpoint.merge(route, parameters);
	const url = endpoint.url;
	if (/\/login\/oauth\/access_token$/.test(url)) return request(endpoint);
	if (requiresAppAuth(url.replace(request.endpoint.DEFAULTS.baseUrl, ""))) {
		const { token: token2 } = await getAppAuthentication(state);
		endpoint.headers.authorization = `bearer ${token2}`;
		let response;
		try {
			response = await request(endpoint);
		} catch (error) {
			if (isNotTimeSkewError(error)) throw error;
			if (typeof error.response.headers.date === "undefined") throw error;
			const diff = Math.floor((Date.parse(error.response.headers.date) - Date.parse((/* @__PURE__ */ new Date()).toString())) / 1e3);
			state.log.warn(error.message);
			state.log.warn(`[@octokit/auth-app] GitHub API time and system time are different by ${diff} seconds. Retrying request with the difference accounted for.`);
			const { token: token3 } = await getAppAuthentication({
				...state,
				timeDifference: diff
			});
			endpoint.headers.authorization = `bearer ${token3}`;
			return request(endpoint);
		}
		return response;
	}
	if (requiresBasicAuth(url)) {
		const authentication = await state.oauthApp({ type: "oauth-app" });
		endpoint.headers.authorization = authentication.headers.authorization;
		return request(endpoint);
	}
	const { token, createdAt } = await getInstallationAuthentication(state, {}, request.defaults({ baseUrl: endpoint.baseUrl }));
	endpoint.headers.authorization = `token ${token}`;
	return sendRequestWithRetries(state, request, endpoint, createdAt);
}
async function sendRequestWithRetries(state, request, options, createdAt, retries = 0) {
	const timeSinceTokenCreationInMs = +/* @__PURE__ */ new Date() - +new Date(createdAt);
	try {
		return await request(options);
	} catch (error) {
		if (error.status !== 401) throw error;
		if (timeSinceTokenCreationInMs >= FIVE_SECONDS_IN_MS) {
			if (retries > 0) error.message = `After ${retries} retries within ${timeSinceTokenCreationInMs / 1e3}s of creating the installation access token, the response remains 401. At this point, the cause may be an authentication problem or a system outage. Please check https://www.githubstatus.com for status information`;
			throw error;
		}
		++retries;
		const awaitTime = retries * 1e3;
		state.log.warn(`[@octokit/auth-app] Retrying after 401 response to account for token replication delay (retry: ${retries}, wait: ${awaitTime / 1e3}s)`);
		await new Promise((resolve) => setTimeout(resolve, awaitTime));
		return sendRequestWithRetries(state, request, options, createdAt, retries);
	}
}
var VERSION$4 = "8.2.0";
function createAppAuth(options) {
	if (!options.appId) throw new Error("[@octokit/auth-app] appId option is required");
	if (!options.privateKey && !options.createJwt) throw new Error("[@octokit/auth-app] privateKey option is required");
	else if (options.privateKey && options.createJwt) throw new Error("[@octokit/auth-app] privateKey and createJwt options are mutually exclusive");
	if ("installationId" in options && !options.installationId) throw new Error("[@octokit/auth-app] installationId is set to a falsy value");
	const log = options.log || {};
	if (typeof log.warn !== "function") log.warn = console.warn.bind(console);
	const request$1 = options.request || request.defaults({ headers: { "user-agent": `octokit-auth-app.js/${VERSION$4} ${getUserAgent()}` } });
	const state = Object.assign({
		request: request$1,
		cache: getCache()
	}, options, options.installationId ? { installationId: Number(options.installationId) } : {}, {
		log,
		oauthApp: createOAuthAppAuth({
			clientType: "github-app",
			clientId: options.clientId || "",
			clientSecret: options.clientSecret || "",
			request: request$1
		})
	});
	return Object.assign(auth$1.bind(null, state), { hook: hook$1.bind(null, state) });
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+auth-unauthenticated@7.0.3/node_modules/@octokit/auth-unauthenticated/dist-node/index.js
async function auth(reason) {
	return {
		type: "unauthenticated",
		reason
	};
}
function isRateLimitError(error) {
	if (error.status !== 403) return false;
	if (!error.response) return false;
	return error.response.headers["x-ratelimit-remaining"] === "0";
}
var REGEX_ABUSE_LIMIT_MESSAGE = /\babuse\b/i;
function isAbuseLimitError(error) {
	if (error.status !== 403) return false;
	return REGEX_ABUSE_LIMIT_MESSAGE.test(error.message);
}
async function hook(reason, request, route, parameters) {
	const endpoint = request.endpoint.merge(route, parameters);
	return request(endpoint).catch((error) => {
		if (error.status === 404) {
			error.message = `Not found. May be due to lack of authentication. Reason: ${reason}`;
			throw error;
		}
		if (isRateLimitError(error)) {
			error.message = `API rate limit exceeded. This maybe caused by the lack of authentication. Reason: ${reason}`;
			throw error;
		}
		if (isAbuseLimitError(error)) {
			error.message = `You have triggered an abuse detection mechanism. This maybe caused by the lack of authentication. Reason: ${reason}`;
			throw error;
		}
		if (error.status === 401) {
			error.message = `Unauthorized. "${endpoint.method} ${endpoint.url}" failed most likely due to lack of authentication. Reason: ${reason}`;
			throw error;
		}
		if (error.status >= 400 && error.status < 500) error.message = error.message.replace(/\.?$/, `. May be caused by lack of authentication (${reason}).`);
		throw error;
	});
}
var createUnauthenticatedAuth = function createUnauthenticatedAuth2(options) {
	if (!options || !options.reason) throw new Error("[@octokit/auth-unauthenticated] No reason passed to createUnauthenticatedAuth");
	return Object.assign(auth.bind(null, options.reason), { hook: hook.bind(null, options.reason) });
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+oauth-app@8.0.3/node_modules/@octokit/oauth-app/dist-node/index.js
var VERSION$3 = "8.0.3";
function addEventHandler(state, eventName, eventHandler) {
	if (Array.isArray(eventName)) {
		for (const singleEventName of eventName) addEventHandler(state, singleEventName, eventHandler);
		return;
	}
	if (!state.eventHandlers[eventName]) state.eventHandlers[eventName] = [];
	state.eventHandlers[eventName].push(eventHandler);
}
var OAuthAppOctokit = Octokit$1.defaults({ userAgent: `octokit-oauth-app.js/${VERSION$3} ${getUserAgent()}` });
async function emitEvent(state, context) {
	const { name, action } = context;
	if (state.eventHandlers[`${name}.${action}`]) for (const eventHandler of state.eventHandlers[`${name}.${action}`]) await eventHandler(context);
	if (state.eventHandlers[name]) for (const eventHandler of state.eventHandlers[name]) await eventHandler(context);
}
async function getUserOctokitWithState(state, options) {
	return state.octokit.auth({
		type: "oauth-user",
		...options,
		async factory(options2) {
			const octokit = new state.Octokit({
				authStrategy: createOAuthUserAuth,
				auth: options2
			});
			const authentication = await octokit.auth({ type: "get" });
			await emitEvent(state, {
				name: "token",
				action: "created",
				token: authentication.token,
				scopes: authentication.scopes,
				authentication,
				octokit
			});
			return octokit;
		}
	});
}
function getWebFlowAuthorizationUrlWithState(state, options) {
	const optionsWithDefaults = {
		clientId: state.clientId,
		request: state.octokit.request,
		...options,
		allowSignup: state.allowSignup ?? options.allowSignup,
		redirectUrl: options.redirectUrl ?? state.redirectUrl,
		scopes: options.scopes ?? state.defaultScopes
	};
	return getWebFlowAuthorizationUrl({
		clientType: state.clientType,
		...optionsWithDefaults
	});
}
async function createTokenWithState(state, options) {
	const authentication = await state.octokit.auth({
		type: "oauth-user",
		...options
	});
	await emitEvent(state, {
		name: "token",
		action: "created",
		token: authentication.token,
		scopes: authentication.scopes,
		authentication,
		octokit: new state.Octokit({
			authStrategy: createOAuthUserAuth,
			auth: {
				clientType: state.clientType,
				clientId: state.clientId,
				clientSecret: state.clientSecret,
				token: authentication.token,
				scopes: authentication.scopes,
				refreshToken: authentication.refreshToken,
				expiresAt: authentication.expiresAt,
				refreshTokenExpiresAt: authentication.refreshTokenExpiresAt
			}
		})
	});
	return { authentication };
}
async function checkTokenWithState(state, options) {
	const result = await checkToken({
		clientType: state.clientType,
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		request: state.octokit.request,
		...options
	});
	Object.assign(result.authentication, {
		type: "token",
		tokenType: "oauth"
	});
	return result;
}
async function resetTokenWithState(state, options) {
	const optionsWithDefaults = {
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		request: state.octokit.request,
		...options
	};
	if (state.clientType === "oauth-app") {
		const response2 = await resetToken({
			clientType: "oauth-app",
			...optionsWithDefaults
		});
		const authentication2 = Object.assign(response2.authentication, {
			type: "token",
			tokenType: "oauth"
		});
		await emitEvent(state, {
			name: "token",
			action: "reset",
			token: response2.authentication.token,
			scopes: response2.authentication.scopes || void 0,
			authentication: authentication2,
			octokit: new state.Octokit({
				authStrategy: createOAuthUserAuth,
				auth: {
					clientType: state.clientType,
					clientId: state.clientId,
					clientSecret: state.clientSecret,
					token: response2.authentication.token,
					scopes: response2.authentication.scopes
				}
			})
		});
		return {
			...response2,
			authentication: authentication2
		};
	}
	const response = await resetToken({
		clientType: "github-app",
		...optionsWithDefaults
	});
	const authentication = Object.assign(response.authentication, {
		type: "token",
		tokenType: "oauth"
	});
	await emitEvent(state, {
		name: "token",
		action: "reset",
		token: response.authentication.token,
		authentication,
		octokit: new state.Octokit({
			authStrategy: createOAuthUserAuth,
			auth: {
				clientType: state.clientType,
				clientId: state.clientId,
				clientSecret: state.clientSecret,
				token: response.authentication.token
			}
		})
	});
	return {
		...response,
		authentication
	};
}
async function refreshTokenWithState(state, options) {
	if (state.clientType === "oauth-app") throw new Error("[@octokit/oauth-app] app.refreshToken() is not supported for OAuth Apps");
	const response = await refreshToken({
		clientType: "github-app",
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		request: state.octokit.request,
		refreshToken: options.refreshToken
	});
	const authentication = Object.assign(response.authentication, {
		type: "token",
		tokenType: "oauth"
	});
	await emitEvent(state, {
		name: "token",
		action: "refreshed",
		token: response.authentication.token,
		authentication,
		octokit: new state.Octokit({
			authStrategy: createOAuthUserAuth,
			auth: {
				clientType: state.clientType,
				clientId: state.clientId,
				clientSecret: state.clientSecret,
				token: response.authentication.token
			}
		})
	});
	return {
		...response,
		authentication
	};
}
async function scopeTokenWithState(state, options) {
	if (state.clientType === "oauth-app") throw new Error("[@octokit/oauth-app] app.scopeToken() is not supported for OAuth Apps");
	const response = await scopeToken({
		clientType: "github-app",
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		request: state.octokit.request,
		...options
	});
	const authentication = Object.assign(response.authentication, {
		type: "token",
		tokenType: "oauth"
	});
	await emitEvent(state, {
		name: "token",
		action: "scoped",
		token: response.authentication.token,
		authentication,
		octokit: new state.Octokit({
			authStrategy: createOAuthUserAuth,
			auth: {
				clientType: state.clientType,
				clientId: state.clientId,
				clientSecret: state.clientSecret,
				token: response.authentication.token
			}
		})
	});
	return {
		...response,
		authentication
	};
}
async function deleteTokenWithState(state, options) {
	const optionsWithDefaults = {
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		request: state.octokit.request,
		...options
	};
	const response = state.clientType === "oauth-app" ? await deleteToken({
		clientType: "oauth-app",
		...optionsWithDefaults
	}) : await deleteToken({
		clientType: "github-app",
		...optionsWithDefaults
	});
	await emitEvent(state, {
		name: "token",
		action: "deleted",
		token: options.token,
		octokit: new state.Octokit({
			authStrategy: createUnauthenticatedAuth,
			auth: { reason: `Handling "token.deleted" event. The access for the token has been revoked.` }
		})
	});
	return response;
}
async function deleteAuthorizationWithState(state, options) {
	const optionsWithDefaults = {
		clientId: state.clientId,
		clientSecret: state.clientSecret,
		request: state.octokit.request,
		...options
	};
	const response = state.clientType === "oauth-app" ? await deleteAuthorization({
		clientType: "oauth-app",
		...optionsWithDefaults
	}) : await deleteAuthorization({
		clientType: "github-app",
		...optionsWithDefaults
	});
	await emitEvent(state, {
		name: "token",
		action: "deleted",
		token: options.token,
		octokit: new state.Octokit({
			authStrategy: createUnauthenticatedAuth,
			auth: { reason: `Handling "token.deleted" event. The access for the token has been revoked.` }
		})
	});
	await emitEvent(state, {
		name: "authorization",
		action: "deleted",
		token: options.token,
		octokit: new state.Octokit({
			authStrategy: createUnauthenticatedAuth,
			auth: { reason: `Handling "authorization.deleted" event. The access for the app has been revoked.` }
		})
	});
	return response;
}
var OAuthApp$1 = class {
	static VERSION = VERSION$3;
	static defaults(defaults) {
		const OAuthAppWithDefaults = class extends this {
			constructor(...args) {
				super({
					...defaults,
					...args[0]
				});
			}
		};
		return OAuthAppWithDefaults;
	}
	constructor(options) {
		const Octokit2 = options.Octokit || OAuthAppOctokit;
		this.type = options.clientType || "oauth-app";
		const octokit = new Octokit2({
			authStrategy: createOAuthAppAuth,
			auth: {
				clientType: this.type,
				clientId: options.clientId,
				clientSecret: options.clientSecret
			}
		});
		const state = {
			clientType: this.type,
			clientId: options.clientId,
			clientSecret: options.clientSecret,
			defaultScopes: options.defaultScopes || [],
			allowSignup: options.allowSignup,
			baseUrl: options.baseUrl,
			redirectUrl: options.redirectUrl,
			log: options.log,
			Octokit: Octokit2,
			octokit,
			eventHandlers: {}
		};
		this.on = addEventHandler.bind(null, state);
		this.octokit = octokit;
		this.getUserOctokit = getUserOctokitWithState.bind(null, state);
		this.getWebFlowAuthorizationUrl = getWebFlowAuthorizationUrlWithState.bind(null, state);
		this.createToken = createTokenWithState.bind(null, state);
		this.checkToken = checkTokenWithState.bind(null, state);
		this.resetToken = resetTokenWithState.bind(null, state);
		this.refreshToken = refreshTokenWithState.bind(null, state);
		this.scopeToken = scopeTokenWithState.bind(null, state);
		this.deleteToken = deleteTokenWithState.bind(null, state);
		this.deleteAuthorization = deleteAuthorizationWithState.bind(null, state);
	}
	type;
	on;
	octokit;
	getUserOctokit;
	getWebFlowAuthorizationUrl;
	createToken;
	checkToken;
	resetToken;
	refreshToken;
	scopeToken;
	deleteToken;
	deleteAuthorization;
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+webhooks-methods@6.0.0/node_modules/@octokit/webhooks-methods/dist-node/index.js
var VERSION$2 = "6.0.0";
async function sign(secret, payload) {
	if (!secret || !payload) throw new TypeError("[@octokit/webhooks-methods] secret & payload required for sign()");
	if (typeof payload !== "string") throw new TypeError("[@octokit/webhooks-methods] payload must be a string");
	const algorithm = "sha256";
	return `${algorithm}=${createHmac(algorithm, secret).update(payload).digest("hex")}`;
}
sign.VERSION = VERSION$2;
async function verify(secret, eventPayload, signature) {
	if (!secret || !eventPayload || !signature) throw new TypeError("[@octokit/webhooks-methods] secret, eventPayload & signature required");
	if (typeof eventPayload !== "string") throw new TypeError("[@octokit/webhooks-methods] eventPayload must be a string");
	const signatureBuffer = Buffer$1.from(signature);
	const verificationBuffer = Buffer$1.from(await sign(secret, eventPayload));
	if (signatureBuffer.length !== verificationBuffer.length) return false;
	return timingSafeEqual(signatureBuffer, verificationBuffer);
}
verify.VERSION = VERSION$2;
async function verifyWithFallback(secret, payload, signature, additionalSecrets) {
	if (await verify(secret, payload, signature)) return true;
	if (additionalSecrets !== void 0) for (const s of additionalSecrets) {
		const v = await verify(s, payload, signature);
		if (v) return v;
	}
	return false;
}

//#endregion
//#region ../../node_modules/.pnpm/@octokit+webhooks@14.2.0/node_modules/@octokit/webhooks/dist-bundle/index.js
var createLogger = (logger = {}) => {
	if (typeof logger.debug !== "function") logger.debug = () => {};
	if (typeof logger.info !== "function") logger.info = () => {};
	if (typeof logger.warn !== "function") logger.warn = console.warn.bind(console);
	if (typeof logger.error !== "function") logger.error = console.error.bind(console);
	return logger;
};
var emitterEventNames = [
	"branch_protection_configuration",
	"branch_protection_configuration.disabled",
	"branch_protection_configuration.enabled",
	"branch_protection_rule",
	"branch_protection_rule.created",
	"branch_protection_rule.deleted",
	"branch_protection_rule.edited",
	"check_run",
	"check_run.completed",
	"check_run.created",
	"check_run.requested_action",
	"check_run.rerequested",
	"check_suite",
	"check_suite.completed",
	"check_suite.requested",
	"check_suite.rerequested",
	"code_scanning_alert",
	"code_scanning_alert.appeared_in_branch",
	"code_scanning_alert.closed_by_user",
	"code_scanning_alert.created",
	"code_scanning_alert.fixed",
	"code_scanning_alert.reopened",
	"code_scanning_alert.reopened_by_user",
	"commit_comment",
	"commit_comment.created",
	"create",
	"custom_property",
	"custom_property.created",
	"custom_property.deleted",
	"custom_property.promote_to_enterprise",
	"custom_property.updated",
	"custom_property_values",
	"custom_property_values.updated",
	"delete",
	"dependabot_alert",
	"dependabot_alert.auto_dismissed",
	"dependabot_alert.auto_reopened",
	"dependabot_alert.created",
	"dependabot_alert.dismissed",
	"dependabot_alert.fixed",
	"dependabot_alert.reintroduced",
	"dependabot_alert.reopened",
	"deploy_key",
	"deploy_key.created",
	"deploy_key.deleted",
	"deployment",
	"deployment.created",
	"deployment_protection_rule",
	"deployment_protection_rule.requested",
	"deployment_review",
	"deployment_review.approved",
	"deployment_review.rejected",
	"deployment_review.requested",
	"deployment_status",
	"deployment_status.created",
	"discussion",
	"discussion.answered",
	"discussion.category_changed",
	"discussion.closed",
	"discussion.created",
	"discussion.deleted",
	"discussion.edited",
	"discussion.labeled",
	"discussion.locked",
	"discussion.pinned",
	"discussion.reopened",
	"discussion.transferred",
	"discussion.unanswered",
	"discussion.unlabeled",
	"discussion.unlocked",
	"discussion.unpinned",
	"discussion_comment",
	"discussion_comment.created",
	"discussion_comment.deleted",
	"discussion_comment.edited",
	"fork",
	"github_app_authorization",
	"github_app_authorization.revoked",
	"gollum",
	"installation",
	"installation.created",
	"installation.deleted",
	"installation.new_permissions_accepted",
	"installation.suspend",
	"installation.unsuspend",
	"installation_repositories",
	"installation_repositories.added",
	"installation_repositories.removed",
	"installation_target",
	"installation_target.renamed",
	"issue_comment",
	"issue_comment.created",
	"issue_comment.deleted",
	"issue_comment.edited",
	"issue_dependencies",
	"issue_dependencies.blocked_by_added",
	"issue_dependencies.blocked_by_removed",
	"issue_dependencies.blocking_added",
	"issue_dependencies.blocking_removed",
	"issues",
	"issues.assigned",
	"issues.closed",
	"issues.deleted",
	"issues.demilestoned",
	"issues.edited",
	"issues.labeled",
	"issues.locked",
	"issues.milestoned",
	"issues.opened",
	"issues.pinned",
	"issues.reopened",
	"issues.transferred",
	"issues.typed",
	"issues.unassigned",
	"issues.unlabeled",
	"issues.unlocked",
	"issues.unpinned",
	"issues.untyped",
	"label",
	"label.created",
	"label.deleted",
	"label.edited",
	"marketplace_purchase",
	"marketplace_purchase.cancelled",
	"marketplace_purchase.changed",
	"marketplace_purchase.pending_change",
	"marketplace_purchase.pending_change_cancelled",
	"marketplace_purchase.purchased",
	"member",
	"member.added",
	"member.edited",
	"member.removed",
	"membership",
	"membership.added",
	"membership.removed",
	"merge_group",
	"merge_group.checks_requested",
	"merge_group.destroyed",
	"meta",
	"meta.deleted",
	"milestone",
	"milestone.closed",
	"milestone.created",
	"milestone.deleted",
	"milestone.edited",
	"milestone.opened",
	"org_block",
	"org_block.blocked",
	"org_block.unblocked",
	"organization",
	"organization.deleted",
	"organization.member_added",
	"organization.member_invited",
	"organization.member_removed",
	"organization.renamed",
	"package",
	"package.published",
	"package.updated",
	"page_build",
	"personal_access_token_request",
	"personal_access_token_request.approved",
	"personal_access_token_request.cancelled",
	"personal_access_token_request.created",
	"personal_access_token_request.denied",
	"ping",
	"project",
	"project.closed",
	"project.created",
	"project.deleted",
	"project.edited",
	"project.reopened",
	"project_card",
	"project_card.converted",
	"project_card.created",
	"project_card.deleted",
	"project_card.edited",
	"project_card.moved",
	"project_column",
	"project_column.created",
	"project_column.deleted",
	"project_column.edited",
	"project_column.moved",
	"projects_v2",
	"projects_v2.closed",
	"projects_v2.created",
	"projects_v2.deleted",
	"projects_v2.edited",
	"projects_v2.reopened",
	"projects_v2_item",
	"projects_v2_item.archived",
	"projects_v2_item.converted",
	"projects_v2_item.created",
	"projects_v2_item.deleted",
	"projects_v2_item.edited",
	"projects_v2_item.reordered",
	"projects_v2_item.restored",
	"projects_v2_status_update",
	"projects_v2_status_update.created",
	"projects_v2_status_update.deleted",
	"projects_v2_status_update.edited",
	"public",
	"pull_request",
	"pull_request.assigned",
	"pull_request.auto_merge_disabled",
	"pull_request.auto_merge_enabled",
	"pull_request.closed",
	"pull_request.converted_to_draft",
	"pull_request.demilestoned",
	"pull_request.dequeued",
	"pull_request.edited",
	"pull_request.enqueued",
	"pull_request.labeled",
	"pull_request.locked",
	"pull_request.milestoned",
	"pull_request.opened",
	"pull_request.ready_for_review",
	"pull_request.reopened",
	"pull_request.review_request_removed",
	"pull_request.review_requested",
	"pull_request.synchronize",
	"pull_request.unassigned",
	"pull_request.unlabeled",
	"pull_request.unlocked",
	"pull_request_review",
	"pull_request_review.dismissed",
	"pull_request_review.edited",
	"pull_request_review.submitted",
	"pull_request_review_comment",
	"pull_request_review_comment.created",
	"pull_request_review_comment.deleted",
	"pull_request_review_comment.edited",
	"pull_request_review_thread",
	"pull_request_review_thread.resolved",
	"pull_request_review_thread.unresolved",
	"push",
	"registry_package",
	"registry_package.published",
	"registry_package.updated",
	"release",
	"release.created",
	"release.deleted",
	"release.edited",
	"release.prereleased",
	"release.published",
	"release.released",
	"release.unpublished",
	"repository",
	"repository.archived",
	"repository.created",
	"repository.deleted",
	"repository.edited",
	"repository.privatized",
	"repository.publicized",
	"repository.renamed",
	"repository.transferred",
	"repository.unarchived",
	"repository_advisory",
	"repository_advisory.published",
	"repository_advisory.reported",
	"repository_dispatch",
	"repository_dispatch.sample.collected",
	"repository_import",
	"repository_ruleset",
	"repository_ruleset.created",
	"repository_ruleset.deleted",
	"repository_ruleset.edited",
	"repository_vulnerability_alert",
	"repository_vulnerability_alert.create",
	"repository_vulnerability_alert.dismiss",
	"repository_vulnerability_alert.reopen",
	"repository_vulnerability_alert.resolve",
	"secret_scanning_alert",
	"secret_scanning_alert.assigned",
	"secret_scanning_alert.created",
	"secret_scanning_alert.publicly_leaked",
	"secret_scanning_alert.reopened",
	"secret_scanning_alert.resolved",
	"secret_scanning_alert.unassigned",
	"secret_scanning_alert.validated",
	"secret_scanning_alert_location",
	"secret_scanning_alert_location.created",
	"secret_scanning_scan",
	"secret_scanning_scan.completed",
	"security_advisory",
	"security_advisory.published",
	"security_advisory.updated",
	"security_advisory.withdrawn",
	"security_and_analysis",
	"sponsorship",
	"sponsorship.cancelled",
	"sponsorship.created",
	"sponsorship.edited",
	"sponsorship.pending_cancellation",
	"sponsorship.pending_tier_change",
	"sponsorship.tier_changed",
	"star",
	"star.created",
	"star.deleted",
	"status",
	"sub_issues",
	"sub_issues.parent_issue_added",
	"sub_issues.parent_issue_removed",
	"sub_issues.sub_issue_added",
	"sub_issues.sub_issue_removed",
	"team",
	"team.added_to_repository",
	"team.created",
	"team.deleted",
	"team.edited",
	"team.removed_from_repository",
	"team_add",
	"watch",
	"watch.started",
	"workflow_dispatch",
	"workflow_job",
	"workflow_job.completed",
	"workflow_job.in_progress",
	"workflow_job.queued",
	"workflow_job.waiting",
	"workflow_run",
	"workflow_run.completed",
	"workflow_run.in_progress",
	"workflow_run.requested"
];
function validateEventName(eventName, options = {}) {
	if (typeof eventName !== "string") throw new TypeError("eventName must be of type string");
	if (eventName === "*") throw new TypeError(`Using the "*" event with the regular Webhooks.on() function is not supported. Please use the Webhooks.onAny() method instead`);
	if (eventName === "error") throw new TypeError(`Using the "error" event with the regular Webhooks.on() function is not supported. Please use the Webhooks.onError() method instead`);
	if (options.onUnknownEventName === "ignore") return;
	if (!emitterEventNames.includes(eventName)) if (options.onUnknownEventName !== "warn") throw new TypeError(`"${eventName}" is not a known webhook name (https://developer.github.com/v3/activity/events/types/)`);
	else (options.log || console).warn(`"${eventName}" is not a known webhook name (https://developer.github.com/v3/activity/events/types/)`);
}
function handleEventHandlers(state, webhookName, handler) {
	if (!state.hooks[webhookName]) state.hooks[webhookName] = [];
	state.hooks[webhookName].push(handler);
}
function receiverOn(state, webhookNameOrNames, handler) {
	if (Array.isArray(webhookNameOrNames)) {
		webhookNameOrNames.forEach((webhookName) => receiverOn(state, webhookName, handler));
		return;
	}
	validateEventName(webhookNameOrNames, {
		onUnknownEventName: "warn",
		log: state.log
	});
	handleEventHandlers(state, webhookNameOrNames, handler);
}
function receiverOnAny(state, handler) {
	handleEventHandlers(state, "*", handler);
}
function receiverOnError(state, handler) {
	handleEventHandlers(state, "error", handler);
}
function wrapErrorHandler(handler, error) {
	let returnValue;
	try {
		returnValue = handler(error);
	} catch (error2) {
		console.log("FATAL: Error occurred in \"error\" event handler");
		console.log(error2);
	}
	if (returnValue && returnValue.catch) returnValue.catch((error2) => {
		console.log("FATAL: Error occurred in \"error\" event handler");
		console.log(error2);
	});
}
function getHooks(state, eventPayloadAction, eventName) {
	const hooks = [state.hooks[eventName], state.hooks["*"]];
	if (eventPayloadAction) hooks.unshift(state.hooks[`${eventName}.${eventPayloadAction}`]);
	return [].concat(...hooks.filter(Boolean));
}
function receiverHandle(state, event) {
	const errorHandlers = state.hooks.error || [];
	if (event instanceof Error) {
		const error = Object.assign(new AggregateError([event], event.message), { event });
		errorHandlers.forEach((handler) => wrapErrorHandler(handler, error));
		return Promise.reject(error);
	}
	if (!event || !event.name) {
		const error = /* @__PURE__ */ new Error("Event name not passed");
		throw new AggregateError([error], error.message);
	}
	if (!event.payload) {
		const error = /* @__PURE__ */ new Error("Event name not passed");
		throw new AggregateError([error], error.message);
	}
	const hooks = getHooks(state, "action" in event.payload ? event.payload.action : null, event.name);
	if (hooks.length === 0) return Promise.resolve();
	const errors = [];
	const promises = hooks.map((handler) => {
		let promise = Promise.resolve(event);
		if (state.transform) promise = promise.then(state.transform);
		return promise.then((event2) => {
			return handler(event2);
		}).catch((error) => errors.push(Object.assign(error, { event })));
	});
	return Promise.all(promises).then(() => {
		if (errors.length === 0) return;
		const error = new AggregateError(errors, errors.map((error2) => error2.message).join("\n"));
		Object.assign(error, { event });
		errorHandlers.forEach((handler) => wrapErrorHandler(handler, error));
		throw error;
	});
}
function removeListener(state, webhookNameOrNames, handler) {
	if (Array.isArray(webhookNameOrNames)) {
		webhookNameOrNames.forEach((webhookName) => removeListener(state, webhookName, handler));
		return;
	}
	if (!state.hooks[webhookNameOrNames]) return;
	for (let i = state.hooks[webhookNameOrNames].length - 1; i >= 0; i--) if (state.hooks[webhookNameOrNames][i] === handler) {
		state.hooks[webhookNameOrNames].splice(i, 1);
		return;
	}
}
function createEventHandler(options) {
	const state = {
		hooks: {},
		log: createLogger(options && options.log)
	};
	if (options && options.transform) state.transform = options.transform;
	return {
		on: receiverOn.bind(null, state),
		onAny: receiverOnAny.bind(null, state),
		onError: receiverOnError.bind(null, state),
		removeListener: removeListener.bind(null, state),
		receive: receiverHandle.bind(null, state)
	};
}
async function verifyAndReceive(state, event) {
	if (!await verifyWithFallback(state.secret, event.payload, event.signature, state.additionalSecrets).catch(() => false)) {
		const error = /* @__PURE__ */ new Error("[@octokit/webhooks] signature does not match event payload and secret");
		error.event = event;
		error.status = 400;
		return state.eventHandler.receive(error);
	}
	let payload;
	try {
		payload = JSON.parse(event.payload);
	} catch (error) {
		error.message = "Invalid JSON";
		error.status = 400;
		throw new AggregateError([error], error.message);
	}
	return state.eventHandler.receive({
		id: event.id,
		name: event.name,
		payload
	});
}
var textDecoder = new TextDecoder("utf-8", { fatal: false });
var decode = textDecoder.decode.bind(textDecoder);
var Webhooks = class {
	sign;
	verify;
	on;
	onAny;
	onError;
	removeListener;
	receive;
	verifyAndReceive;
	constructor(options) {
		if (!options || !options.secret) throw new Error("[@octokit/webhooks] options.secret required");
		const state = {
			eventHandler: createEventHandler(options),
			secret: options.secret,
			additionalSecrets: options.additionalSecrets,
			hooks: {},
			log: createLogger(options.log)
		};
		this.sign = sign.bind(null, options.secret);
		this.verify = verify.bind(null, options.secret);
		this.on = state.eventHandler.on;
		this.onAny = state.eventHandler.onAny;
		this.onError = state.eventHandler.onError;
		this.removeListener = state.eventHandler.removeListener;
		this.receive = state.eventHandler.receive;
		this.verifyAndReceive = verifyAndReceive.bind(null, state);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@octokit+app@16.1.2/node_modules/@octokit/app/dist-node/index.js
var VERSION$1 = "16.1.2";
function webhooks(appOctokit, options) {
	return new Webhooks({
		secret: options.secret,
		transform: async (event) => {
			if (!("installation" in event.payload) || typeof event.payload.installation !== "object") {
				const octokit2 = new appOctokit.constructor({
					authStrategy: createUnauthenticatedAuth,
					auth: { reason: `"installation" key missing in webhook event payload` }
				});
				return {
					...event,
					octokit: octokit2
				};
			}
			const installationId = event.payload.installation.id;
			const octokit = await appOctokit.auth({
				type: "installation",
				installationId,
				factory(auth) {
					return new auth.octokit.constructor({
						...auth.octokitOptions,
						authStrategy: createAppAuth,
						auth: {
							...auth,
							installationId
						}
					});
				}
			});
			octokit.hook.before("request", (options2) => {
				options2.headers["x-github-delivery"] = event.id;
			});
			return {
				...event,
				octokit
			};
		}
	});
}
async function getInstallationOctokit(app, installationId) {
	return app.octokit.auth({
		type: "installation",
		installationId,
		factory(auth) {
			const options = {
				...auth.octokitOptions,
				authStrategy: createAppAuth,
				auth: {
					...auth,
					installationId
				}
			};
			return new auth.octokit.constructor(options);
		}
	});
}
function eachInstallationFactory(app) {
	return Object.assign(eachInstallation.bind(null, app), { iterator: eachInstallationIterator.bind(null, app) });
}
async function eachInstallation(app, callback) {
	const i = eachInstallationIterator(app)[Symbol.asyncIterator]();
	let result = await i.next();
	while (!result.done) {
		await callback(result.value);
		result = await i.next();
	}
}
function eachInstallationIterator(app) {
	return { async *[Symbol.asyncIterator]() {
		const iterator = composePaginateRest.iterator(app.octokit, "GET /app/installations");
		for await (const { data: installations } of iterator) for (const installation of installations) yield {
			octokit: await getInstallationOctokit(app, installation.id),
			installation
		};
	} };
}
function eachRepositoryFactory(app) {
	return Object.assign(eachRepository.bind(null, app), { iterator: eachRepositoryIterator.bind(null, app) });
}
async function eachRepository(app, queryOrCallback, callback) {
	const i = eachRepositoryIterator(app, callback ? queryOrCallback : void 0)[Symbol.asyncIterator]();
	let result = await i.next();
	while (!result.done) {
		if (callback) await callback(result.value);
		else await queryOrCallback(result.value);
		result = await i.next();
	}
}
function singleInstallationIterator(app, installationId) {
	return { async *[Symbol.asyncIterator]() {
		yield { octokit: await app.getInstallationOctokit(installationId) };
	} };
}
function eachRepositoryIterator(app, query) {
	return { async *[Symbol.asyncIterator]() {
		const iterator = query ? singleInstallationIterator(app, query.installationId) : app.eachInstallation.iterator();
		for await (const { octokit } of iterator) {
			const repositoriesIterator = composePaginateRest.iterator(octokit, "GET /installation/repositories");
			for await (const { data: repositories } of repositoriesIterator) for (const repository of repositories) yield {
				octokit,
				repository
			};
		}
	} };
}
function getInstallationUrlFactory(app) {
	let installationUrlBasePromise;
	return async function getInstallationUrl(options = {}) {
		if (!installationUrlBasePromise) installationUrlBasePromise = getInstallationUrlBase(app);
		const installationUrlBase = await installationUrlBasePromise;
		const installationUrl = new URL(installationUrlBase);
		if (options.target_id !== void 0) {
			installationUrl.pathname += "/permissions";
			installationUrl.searchParams.append("target_id", options.target_id.toFixed());
		}
		if (options.state !== void 0) installationUrl.searchParams.append("state", options.state);
		return installationUrl.href;
	};
}
async function getInstallationUrlBase(app) {
	const { data: appInfo } = await app.octokit.request("GET /app");
	if (!appInfo) throw new Error("[@octokit/app] unable to fetch metadata for app");
	return `${appInfo.html_url}/installations/new`;
}
var App$1 = class {
	static VERSION = VERSION$1;
	static defaults(defaults) {
		const AppWithDefaults = class extends this {
			constructor(...args) {
				super({
					...defaults,
					...args[0]
				});
			}
		};
		return AppWithDefaults;
	}
	octokit;
	webhooks;
	oauth;
	getInstallationOctokit;
	eachInstallation;
	eachRepository;
	getInstallationUrl;
	log;
	constructor(options) {
		const Octokit = options.Octokit || Octokit$1;
		const octokitOptions = {
			authStrategy: createAppAuth,
			auth: Object.assign({
				appId: options.appId,
				privateKey: options.privateKey
			}, options.oauth ? {
				clientId: options.oauth.clientId,
				clientSecret: options.oauth.clientSecret
			} : {})
		};
		if ("log" in options && typeof options.log !== "undefined") octokitOptions.log = options.log;
		this.octokit = new Octokit(octokitOptions);
		this.log = Object.assign({
			debug: () => {},
			info: () => {},
			warn: console.warn.bind(console),
			error: console.error.bind(console)
		}, options.log);
		if (options.webhooks) this.webhooks = webhooks(this.octokit, options.webhooks);
		else Object.defineProperty(this, "webhooks", { get() {
			throw new Error("[@octokit/app] webhooks option not set");
		} });
		if (options.oauth) this.oauth = new OAuthApp$1({
			...options.oauth,
			clientType: "github-app",
			Octokit
		});
		else Object.defineProperty(this, "oauth", { get() {
			throw new Error("[@octokit/app] oauth.clientId / oauth.clientSecret options are not set");
		} });
		this.getInstallationOctokit = getInstallationOctokit.bind(null, this);
		this.eachInstallation = eachInstallationFactory(this);
		this.eachRepository = eachRepositoryFactory(this);
		this.getInstallationUrl = getInstallationUrlFactory(this);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/octokit@5.0.5/node_modules/octokit/dist-bundle/index.js
var VERSION = "0.0.0-development";
var Octokit = Octokit$1.plugin(restEndpointMethods, paginateRest, paginateGraphQL, retry, throttling).defaults({
	userAgent: `octokit.js/${VERSION}`,
	throttle: {
		onRateLimit,
		onSecondaryRateLimit
	}
});
function onRateLimit(retryAfter, options, octokit) {
	octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
	if (options.request.retryCount === 0) {
		octokit.log.info(`Retrying after ${retryAfter} seconds!`);
		return true;
	}
}
function onSecondaryRateLimit(retryAfter, options, octokit) {
	octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
	if (options.request.retryCount === 0) {
		octokit.log.info(`Retrying after ${retryAfter} seconds!`);
		return true;
	}
}
var App = App$1.defaults({ Octokit });
var OAuthApp = OAuthApp$1.defaults({ Octokit });
/* v8 ignore next no need to test internals of the throttle plugin -- @preserve */

//#endregion
//#region src/setup.ts
let _runtimeContext = null;
function requireRuntimeContext() {
	if (!_runtimeContext) throw new Error("Clank8y runtime context is not initialized. Call setClank8yRuntimeContext first.");
	return _runtimeContext;
}
function normalizeRuntimeContext(context) {
	if (!context.promptContext.trim()) throw new Error("Clank8y runtime context requires a non-empty promptContext.");
	if (!context.auth.githubToken.trim()) throw new Error("Clank8y runtime context requires a non-empty auth.githubToken.");
	if (!context.auth.copilotToken.trim()) throw new Error("Clank8y runtime context requires a non-empty auth.copilotToken.");
	return {
		...context,
		promptContext: context.promptContext.trim(),
		auth: {
			githubToken: context.auth.githubToken.trim(),
			copilotToken: context.auth.copilotToken.trim()
		}
	};
}
function setClank8yRuntimeContext(context) {
	_runtimeContext = normalizeRuntimeContext(context);
}
function getClank8yRuntimeContext() {
	return requireRuntimeContext();
}

//#endregion
//#region src/gh/octokit-clank8y.ts
async function clank8yOctokit() {
	return new Octokit({ auth: getClank8yRuntimeContext().auth.githubToken });
}

//#endregion
//#region src/gh/index.ts
async function getOctokit() {
	return await clank8yOctokit();
}

//#endregion
//#region ../../node_modules/.pnpm/tmcp@1.19.2_typescript@5.9.3/node_modules/tmcp/src/adapter.js
/**
* @import { StandardSchemaV1 } from "@standard-schema/spec";
* @import { JSONSchema7 } from "json-schema";
*/
/**
* @template {StandardSchemaV1} TSchema
*/
var JsonSchemaAdapter = class {
	/**
	* @param {TSchema} schema
	* @returns {Promise<JSONSchema7>}
	*/
	toJsonSchema(schema) {
		throw new Error("toJsonSchema method not implemented");
	}
};

//#endregion
//#region ../../node_modules/.pnpm/valibot@1.2.0_typescript@5.9.3/node_modules/valibot/dist/index.mjs
let store$4;
/**
* Returns the global configuration.
*
* @param config The config to merge.
*
* @returns The configuration.
*/
/* @__NO_SIDE_EFFECTS__ */
function getGlobalConfig(config$1) {
	return {
		lang: config$1?.lang ?? store$4?.lang,
		message: config$1?.message,
		abortEarly: config$1?.abortEarly ?? store$4?.abortEarly,
		abortPipeEarly: config$1?.abortPipeEarly ?? store$4?.abortPipeEarly
	};
}
let store$3;
/**
* Returns a global error message.
*
* @param lang The language of the message.
*
* @returns The error message.
*/
/* @__NO_SIDE_EFFECTS__ */
function getGlobalMessage(lang) {
	return store$3?.get(lang);
}
let store$2;
/**
* Returns a schema error message.
*
* @param lang The language of the message.
*
* @returns The error message.
*/
/* @__NO_SIDE_EFFECTS__ */
function getSchemaMessage(lang) {
	return store$2?.get(lang);
}
let store$1;
/**
* Returns a specific error message.
*
* @param reference The identifier reference.
* @param lang The language of the message.
*
* @returns The error message.
*/
/* @__NO_SIDE_EFFECTS__ */
function getSpecificMessage(reference, lang) {
	return store$1?.get(reference)?.get(lang);
}
/**
* Stringifies an unknown input to a literal or type string.
*
* @param input The unknown input.
*
* @returns A literal or type string.
*
* @internal
*/
/* @__NO_SIDE_EFFECTS__ */
function _stringify(input) {
	const type = typeof input;
	if (type === "string") return `"${input}"`;
	if (type === "number" || type === "bigint" || type === "boolean") return `${input}`;
	if (type === "object" || type === "function") return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
	return type;
}
/**
* Adds an issue to the dataset.
*
* @param context The issue context.
* @param label The issue label.
* @param dataset The input dataset.
* @param config The configuration.
* @param other The optional props.
*
* @internal
*/
function _addIssue(context, label, dataset, config$1, other) {
	const input = other && "input" in other ? other.input : dataset.value;
	const expected = other?.expected ?? context.expects ?? null;
	const received = other?.received ?? /* @__PURE__ */ _stringify(input);
	const issue = {
		kind: context.kind,
		type: context.type,
		input,
		expected,
		received,
		message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
		requirement: context.requirement,
		path: other?.path,
		issues: other?.issues,
		lang: config$1.lang,
		abortEarly: config$1.abortEarly,
		abortPipeEarly: config$1.abortPipeEarly
	};
	const isSchema = context.kind === "schema";
	const message$1 = other?.message ?? context.message ?? /* @__PURE__ */ getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? /* @__PURE__ */ getSchemaMessage(issue.lang) : null) ?? config$1.message ?? /* @__PURE__ */ getGlobalMessage(issue.lang);
	if (message$1 !== void 0) issue.message = typeof message$1 === "function" ? message$1(issue) : message$1;
	if (isSchema) dataset.typed = false;
	if (dataset.issues) dataset.issues.push(issue);
	else dataset.issues = [issue];
}
/**
* Returns the Standard Schema properties.
*
* @param context The schema context.
*
* @returns The Standard Schema properties.
*/
/* @__NO_SIDE_EFFECTS__ */
function _getStandardProps(context) {
	return {
		version: 1,
		vendor: "valibot",
		validate(value$1) {
			return context["~run"]({ value: value$1 }, /* @__PURE__ */ getGlobalConfig());
		}
	};
}
/**
* Disallows inherited object properties and prevents object prototype
* pollution by disallowing certain keys.
*
* @param object The object to check.
* @param key The key to check.
*
* @returns Whether the key is allowed.
*
* @internal
*/
/* @__NO_SIDE_EFFECTS__ */
function _isValidObjectKey(object$1, key) {
	return Object.hasOwn(object$1, key) && key !== "__proto__" && key !== "prototype" && key !== "constructor";
}
/**
* Joins multiple `expects` values with the given separator.
*
* @param values The `expects` values.
* @param separator The separator.
*
* @returns The joined `expects` property.
*
* @internal
*/
/* @__NO_SIDE_EFFECTS__ */
function _joinExpects(values$1, separator) {
	const list = [...new Set(values$1)];
	if (list.length > 1) return `(${list.join(` ${separator} `)})`;
	return list[0] ?? "never";
}
/**
* A Valibot error with useful information.
*/
var ValiError = class extends Error {
	/**
	* Creates a Valibot error with useful information.
	*
	* @param issues The error issues.
	*/
	constructor(issues) {
		super(issues[0].message);
		this.name = "ValiError";
		this.issues = issues;
	}
};
/**
* [Base64](https://en.wikipedia.org/wiki/Base64) regex.
*/
const BASE64_REGEX = /^(?:[\da-z+/]{4})*(?:[\da-z+/]{2}==|[\da-z+/]{3}=)?$/iu;
/* @__NO_SIDE_EFFECTS__ */
function base64(message$1) {
	return {
		kind: "validation",
		type: "base64",
		reference: base64,
		async: false,
		expects: null,
		requirement: BASE64_REGEX,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "Base64", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function check(requirement, message$1) {
	return {
		kind: "validation",
		type: "check",
		reference: check,
		async: false,
		expects: null,
		requirement,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && !this.requirement(dataset.value)) _addIssue(this, "input", dataset, config$1);
			return dataset;
		}
	};
}
/**
* Creates a description metadata action.
*
* @param description_ The description text.
*
* @returns A description action.
*/
/* @__NO_SIDE_EFFECTS__ */
function description(description_) {
	return {
		kind: "metadata",
		type: "description",
		reference: description,
		description: description_
	};
}
/* @__NO_SIDE_EFFECTS__ */
function integer(message$1) {
	return {
		kind: "validation",
		type: "integer",
		reference: integer,
		async: false,
		expects: null,
		requirement: Number.isInteger,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && !this.requirement(dataset.value)) _addIssue(this, "integer", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function maxLength(requirement, message$1) {
	return {
		kind: "validation",
		type: "max_length",
		reference: maxLength,
		async: false,
		expects: `<=${requirement}`,
		requirement,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && dataset.value.length > this.requirement) _addIssue(this, "length", dataset, config$1, { received: `${dataset.value.length}` });
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function maxValue(requirement, message$1) {
	return {
		kind: "validation",
		type: "max_value",
		reference: maxValue,
		async: false,
		expects: `<=${requirement instanceof Date ? requirement.toJSON() : /* @__PURE__ */ _stringify(requirement)}`,
		requirement,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && !(dataset.value <= this.requirement)) _addIssue(this, "value", dataset, config$1, { received: dataset.value instanceof Date ? dataset.value.toJSON() : /* @__PURE__ */ _stringify(dataset.value) });
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function minLength(requirement, message$1) {
	return {
		kind: "validation",
		type: "min_length",
		reference: minLength,
		async: false,
		expects: `>=${requirement}`,
		requirement,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && dataset.value.length < this.requirement) _addIssue(this, "length", dataset, config$1, { received: `${dataset.value.length}` });
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function minValue(requirement, message$1) {
	return {
		kind: "validation",
		type: "min_value",
		reference: minValue,
		async: false,
		expects: `>=${requirement instanceof Date ? requirement.toJSON() : /* @__PURE__ */ _stringify(requirement)}`,
		requirement,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && !(dataset.value >= this.requirement)) _addIssue(this, "value", dataset, config$1, { received: dataset.value instanceof Date ? dataset.value.toJSON() : /* @__PURE__ */ _stringify(dataset.value) });
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function regex$2(requirement, message$1) {
	return {
		kind: "validation",
		type: "regex",
		reference: regex$2,
		async: false,
		expects: `${requirement}`,
		requirement,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "format", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function startsWith(requirement, message$1) {
	return {
		kind: "validation",
		type: "starts_with",
		reference: startsWith,
		async: false,
		expects: `"${requirement}"`,
		requirement,
		message: message$1,
		"~run"(dataset, config$1) {
			if (dataset.typed && !dataset.value.startsWith(this.requirement)) _addIssue(this, "start", dataset, config$1, { received: `"${dataset.value.slice(0, this.requirement.length)}"` });
			return dataset;
		}
	};
}
/**
* Returns the fallback value of the schema.
*
* @param schema The schema to get it from.
* @param dataset The output dataset if available.
* @param config The config if available.
*
* @returns The fallback value.
*/
/* @__NO_SIDE_EFFECTS__ */
function getFallback(schema, dataset, config$1) {
	return typeof schema.fallback === "function" ? schema.fallback(dataset, config$1) : schema.fallback;
}
/**
* Returns the default value of the schema.
*
* @param schema The schema to get it from.
* @param dataset The input dataset if available.
* @param config The config if available.
*
* @returns The default value.
*/
/* @__NO_SIDE_EFFECTS__ */
function getDefault(schema, dataset, config$1) {
	return typeof schema.default === "function" ? schema.default(dataset, config$1) : schema.default;
}
/* @__NO_SIDE_EFFECTS__ */
function array(item, message$1) {
	return {
		kind: "schema",
		type: "array",
		reference: array,
		expects: "Array",
		async: false,
		item,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			const input = dataset.value;
			if (Array.isArray(input)) {
				dataset.typed = true;
				dataset.value = [];
				for (let key = 0; key < input.length; key++) {
					const value$1 = input[key];
					const itemDataset = this.item["~run"]({ value: value$1 }, config$1);
					if (itemDataset.issues) {
						const pathItem = {
							type: "array",
							origin: "value",
							input,
							key,
							value: value$1
						};
						for (const issue of itemDataset.issues) {
							if (issue.path) issue.path.unshift(pathItem);
							else issue.path = [pathItem];
							dataset.issues?.push(issue);
						}
						if (!dataset.issues) dataset.issues = itemDataset.issues;
						if (config$1.abortEarly) {
							dataset.typed = false;
							break;
						}
					}
					if (!itemDataset.typed) dataset.typed = false;
					dataset.value.push(itemDataset.value);
				}
			} else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function boolean(message$1) {
	return {
		kind: "schema",
		type: "boolean",
		reference: boolean,
		expects: "boolean",
		async: false,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			if (typeof dataset.value === "boolean") dataset.typed = true;
			else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function literal(literal_, message$1) {
	return {
		kind: "schema",
		type: "literal",
		reference: literal,
		expects: /* @__PURE__ */ _stringify(literal_),
		async: false,
		literal: literal_,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			if (dataset.value === this.literal) dataset.typed = true;
			else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function looseObject(entries$1, message$1) {
	return {
		kind: "schema",
		type: "loose_object",
		reference: looseObject,
		expects: "Object",
		async: false,
		entries: entries$1,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			const input = dataset.value;
			if (input && typeof input === "object") {
				dataset.typed = true;
				dataset.value = {};
				for (const key in this.entries) {
					const valueSchema = this.entries[key];
					if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && valueSchema.default !== void 0) {
						const value$1 = key in input ? input[key] : /* @__PURE__ */ getDefault(valueSchema);
						const valueDataset = valueSchema["~run"]({ value: value$1 }, config$1);
						if (valueDataset.issues) {
							const pathItem = {
								type: "object",
								origin: "value",
								input,
								key,
								value: value$1
							};
							for (const issue of valueDataset.issues) {
								if (issue.path) issue.path.unshift(pathItem);
								else issue.path = [pathItem];
								dataset.issues?.push(issue);
							}
							if (!dataset.issues) dataset.issues = valueDataset.issues;
							if (config$1.abortEarly) {
								dataset.typed = false;
								break;
							}
						}
						if (!valueDataset.typed) dataset.typed = false;
						dataset.value[key] = valueDataset.value;
					} else if (valueSchema.fallback !== void 0) dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
					else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
						_addIssue(this, "key", dataset, config$1, {
							input: void 0,
							expected: `"${key}"`,
							path: [{
								type: "object",
								origin: "key",
								input,
								key,
								value: input[key]
							}]
						});
						if (config$1.abortEarly) break;
					}
				}
				if (!dataset.issues || !config$1.abortEarly) {
					for (const key in input) if (/* @__PURE__ */ _isValidObjectKey(input, key) && !(key in this.entries)) dataset.value[key] = input[key];
				}
			} else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function number(message$1) {
	return {
		kind: "schema",
		type: "number",
		reference: number,
		expects: "number",
		async: false,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			if (typeof dataset.value === "number" && !isNaN(dataset.value)) dataset.typed = true;
			else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function object(entries$1, message$1) {
	return {
		kind: "schema",
		type: "object",
		reference: object,
		expects: "Object",
		async: false,
		entries: entries$1,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			const input = dataset.value;
			if (input && typeof input === "object") {
				dataset.typed = true;
				dataset.value = {};
				for (const key in this.entries) {
					const valueSchema = this.entries[key];
					if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && valueSchema.default !== void 0) {
						const value$1 = key in input ? input[key] : /* @__PURE__ */ getDefault(valueSchema);
						const valueDataset = valueSchema["~run"]({ value: value$1 }, config$1);
						if (valueDataset.issues) {
							const pathItem = {
								type: "object",
								origin: "value",
								input,
								key,
								value: value$1
							};
							for (const issue of valueDataset.issues) {
								if (issue.path) issue.path.unshift(pathItem);
								else issue.path = [pathItem];
								dataset.issues?.push(issue);
							}
							if (!dataset.issues) dataset.issues = valueDataset.issues;
							if (config$1.abortEarly) {
								dataset.typed = false;
								break;
							}
						}
						if (!valueDataset.typed) dataset.typed = false;
						dataset.value[key] = valueDataset.value;
					} else if (valueSchema.fallback !== void 0) dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
					else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
						_addIssue(this, "key", dataset, config$1, {
							input: void 0,
							expected: `"${key}"`,
							path: [{
								type: "object",
								origin: "key",
								input,
								key,
								value: input[key]
							}]
						});
						if (config$1.abortEarly) break;
					}
				}
			} else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function optional(wrapped, default_) {
	return {
		kind: "schema",
		type: "optional",
		reference: optional,
		expects: `(${wrapped.expects} | undefined)`,
		async: false,
		wrapped,
		default: default_,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			if (dataset.value === void 0) {
				if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
				if (dataset.value === void 0) {
					dataset.typed = true;
					return dataset;
				}
			}
			return this.wrapped["~run"](dataset, config$1);
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function picklist(options, message$1) {
	return {
		kind: "schema",
		type: "picklist",
		reference: picklist,
		expects: /* @__PURE__ */ _joinExpects(options.map(_stringify), "|"),
		async: false,
		options,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			if (this.options.includes(dataset.value)) dataset.typed = true;
			else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function record(key, value$1, message$1) {
	return {
		kind: "schema",
		type: "record",
		reference: record,
		expects: "Object",
		async: false,
		key,
		value: value$1,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			const input = dataset.value;
			if (input && typeof input === "object") {
				dataset.typed = true;
				dataset.value = {};
				for (const entryKey in input) if (/* @__PURE__ */ _isValidObjectKey(input, entryKey)) {
					const entryValue = input[entryKey];
					const keyDataset = this.key["~run"]({ value: entryKey }, config$1);
					if (keyDataset.issues) {
						const pathItem = {
							type: "object",
							origin: "key",
							input,
							key: entryKey,
							value: entryValue
						};
						for (const issue of keyDataset.issues) {
							issue.path = [pathItem];
							dataset.issues?.push(issue);
						}
						if (!dataset.issues) dataset.issues = keyDataset.issues;
						if (config$1.abortEarly) {
							dataset.typed = false;
							break;
						}
					}
					const valueDataset = this.value["~run"]({ value: entryValue }, config$1);
					if (valueDataset.issues) {
						const pathItem = {
							type: "object",
							origin: "value",
							input,
							key: entryKey,
							value: entryValue
						};
						for (const issue of valueDataset.issues) {
							if (issue.path) issue.path.unshift(pathItem);
							else issue.path = [pathItem];
							dataset.issues?.push(issue);
						}
						if (!dataset.issues) dataset.issues = valueDataset.issues;
						if (config$1.abortEarly) {
							dataset.typed = false;
							break;
						}
					}
					if (!keyDataset.typed || !valueDataset.typed) dataset.typed = false;
					if (keyDataset.typed) dataset.value[keyDataset.value] = valueDataset.value;
				}
			} else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function strictObject(entries$1, message$1) {
	return {
		kind: "schema",
		type: "strict_object",
		reference: strictObject,
		expects: "Object",
		async: false,
		entries: entries$1,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			const input = dataset.value;
			if (input && typeof input === "object") {
				dataset.typed = true;
				dataset.value = {};
				for (const key in this.entries) {
					const valueSchema = this.entries[key];
					if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && valueSchema.default !== void 0) {
						const value$1 = key in input ? input[key] : /* @__PURE__ */ getDefault(valueSchema);
						const valueDataset = valueSchema["~run"]({ value: value$1 }, config$1);
						if (valueDataset.issues) {
							const pathItem = {
								type: "object",
								origin: "value",
								input,
								key,
								value: value$1
							};
							for (const issue of valueDataset.issues) {
								if (issue.path) issue.path.unshift(pathItem);
								else issue.path = [pathItem];
								dataset.issues?.push(issue);
							}
							if (!dataset.issues) dataset.issues = valueDataset.issues;
							if (config$1.abortEarly) {
								dataset.typed = false;
								break;
							}
						}
						if (!valueDataset.typed) dataset.typed = false;
						dataset.value[key] = valueDataset.value;
					} else if (valueSchema.fallback !== void 0) dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
					else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
						_addIssue(this, "key", dataset, config$1, {
							input: void 0,
							expected: `"${key}"`,
							path: [{
								type: "object",
								origin: "key",
								input,
								key,
								value: input[key]
							}]
						});
						if (config$1.abortEarly) break;
					}
				}
				if (!dataset.issues || !config$1.abortEarly) {
					for (const key in input) if (!(key in this.entries)) {
						_addIssue(this, "key", dataset, config$1, {
							input: key,
							expected: "never",
							path: [{
								type: "object",
								origin: "key",
								input,
								key,
								value: input[key]
							}]
						});
						break;
					}
				}
			} else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function string(message$1) {
	return {
		kind: "schema",
		type: "string",
		reference: string,
		expects: "string",
		async: false,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			if (typeof dataset.value === "string") dataset.typed = true;
			else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/**
* Returns the sub issues of the provided datasets for the union issue.
*
* @param datasets The datasets.
*
* @returns The sub issues.
*
* @internal
*/
/* @__NO_SIDE_EFFECTS__ */
function _subIssues(datasets) {
	let issues;
	if (datasets) for (const dataset of datasets) if (issues) issues.push(...dataset.issues);
	else issues = dataset.issues;
	return issues;
}
/* @__NO_SIDE_EFFECTS__ */
function union(options, message$1) {
	return {
		kind: "schema",
		type: "union",
		reference: union,
		expects: /* @__PURE__ */ _joinExpects(options.map((option) => option.expects), "|"),
		async: false,
		options,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			let validDataset;
			let typedDatasets;
			let untypedDatasets;
			for (const schema of this.options) {
				const optionDataset = schema["~run"]({ value: dataset.value }, config$1);
				if (optionDataset.typed) if (optionDataset.issues) if (typedDatasets) typedDatasets.push(optionDataset);
				else typedDatasets = [optionDataset];
				else {
					validDataset = optionDataset;
					break;
				}
				else if (untypedDatasets) untypedDatasets.push(optionDataset);
				else untypedDatasets = [optionDataset];
			}
			if (validDataset) return validDataset;
			if (typedDatasets) {
				if (typedDatasets.length === 1) return typedDatasets[0];
				_addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(typedDatasets) });
				dataset.typed = true;
			} else if (untypedDatasets?.length === 1) return untypedDatasets[0];
			else _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(untypedDatasets) });
			return dataset;
		}
	};
}
/**
* Creates a unknown schema.
*
* @returns A unknown schema.
*/
/* @__NO_SIDE_EFFECTS__ */
function unknown() {
	return {
		kind: "schema",
		type: "unknown",
		reference: unknown,
		expects: "unknown",
		async: false,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset) {
			dataset.typed = true;
			return dataset;
		}
	};
}
/* @__NO_SIDE_EFFECTS__ */
function variant(key, options, message$1) {
	return {
		kind: "schema",
		type: "variant",
		reference: variant,
		expects: "Object",
		async: false,
		key,
		options,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			const input = dataset.value;
			if (input && typeof input === "object") {
				let outputDataset;
				let maxDiscriminatorPriority = 0;
				let invalidDiscriminatorKey = this.key;
				let expectedDiscriminators = [];
				const parseOptions = (variant$1, allKeys) => {
					for (const schema of variant$1.options) {
						if (schema.type === "variant") parseOptions(schema, new Set(allKeys).add(schema.key));
						else {
							let keysAreValid = true;
							let currentPriority = 0;
							for (const currentKey of allKeys) {
								const discriminatorSchema = schema.entries[currentKey];
								if (currentKey in input ? discriminatorSchema["~run"]({
									typed: false,
									value: input[currentKey]
								}, { abortEarly: true }).issues : discriminatorSchema.type !== "exact_optional" && discriminatorSchema.type !== "optional" && discriminatorSchema.type !== "nullish") {
									keysAreValid = false;
									if (invalidDiscriminatorKey !== currentKey && (maxDiscriminatorPriority < currentPriority || maxDiscriminatorPriority === currentPriority && currentKey in input && !(invalidDiscriminatorKey in input))) {
										maxDiscriminatorPriority = currentPriority;
										invalidDiscriminatorKey = currentKey;
										expectedDiscriminators = [];
									}
									if (invalidDiscriminatorKey === currentKey) expectedDiscriminators.push(schema.entries[currentKey].expects);
									break;
								}
								currentPriority++;
							}
							if (keysAreValid) {
								const optionDataset = schema["~run"]({ value: input }, config$1);
								if (!outputDataset || !outputDataset.typed && optionDataset.typed) outputDataset = optionDataset;
							}
						}
						if (outputDataset && !outputDataset.issues) break;
					}
				};
				parseOptions(this, new Set([this.key]));
				if (outputDataset) return outputDataset;
				_addIssue(this, "type", dataset, config$1, {
					input: input[invalidDiscriminatorKey],
					expected: /* @__PURE__ */ _joinExpects(expectedDiscriminators, "|"),
					path: [{
						type: "object",
						origin: "value",
						input,
						key: invalidDiscriminatorKey,
						value: input[invalidDiscriminatorKey]
					}]
				});
			} else _addIssue(this, "type", dataset, config$1);
			return dataset;
		}
	};
}
/**
* Parses an unknown input based on a schema.
*
* @param schema The schema to be used.
* @param input The input to be parsed.
* @param config The parse configuration.
*
* @returns The parsed input.
*/
function parse(schema, input, config$1) {
	const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config$1));
	if (dataset.issues) throw new ValiError(dataset.issues);
	return dataset.value;
}
/* @__NO_SIDE_EFFECTS__ */
function pipe(...pipe$1) {
	return {
		...pipe$1[0],
		pipe: pipe$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			for (const item of pipe$1) if (item.kind !== "metadata") {
				if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
					dataset.typed = false;
					break;
				}
				if (!dataset.issues || !config$1.abortEarly && !config$1.abortPipeEarly) dataset = item["~run"](dataset, config$1);
			}
			return dataset;
		}
	};
}
/**
* Parses an unknown input based on a schema.
*
* @param schema The schema to be used.
* @param input The input to be parsed.
* @param config The parse configuration.
*
* @returns The parse result.
*/
/* @__NO_SIDE_EFFECTS__ */
function safeParse(schema, input, config$1) {
	const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config$1));
	return {
		typed: dataset.typed,
		success: !dataset.issues,
		output: dataset.value,
		issues: dataset.issues
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@valibot+to-json-schema@1.5.0_valibot@1.2.0_typescript@5.9.3_/node_modules/@valibot/to-json-schema/dist/index.mjs
/**
* Adds an error message to the errors array.
*
* @param errors The array of error messages.
* @param message The error message to add.
*
* @returns The new errors.
*/
function addError(errors, message) {
	if (errors) {
		errors.push(message);
		return errors;
	}
	return [message];
}
/**
* Throws an error or logs a warning based on the configuration.
*
* @param message The message to throw or log.
* @param config The conversion configuration.
*/
function handleError(message, config) {
	switch (config?.errorMode) {
		case "ignore": break;
		case "warn":
			console.warn(message);
			break;
		default: throw new Error(message);
	}
}
/**
* Converts any supported Valibot action to the JSON Schema format.
*
* @param jsonSchema The JSON Schema object.
* @param valibotAction The Valibot action object.
* @param config The conversion configuration.
*
* @returns The converted JSON Schema.
*/
function convertAction(jsonSchema, valibotAction, config) {
	if (config?.ignoreActions?.includes(valibotAction.type)) return jsonSchema;
	let errors;
	switch (valibotAction.type) {
		case "base64":
			jsonSchema.contentEncoding = "base64";
			break;
		case "bic":
		case "cuid2":
		case "decimal":
		case "digits":
		case "emoji":
		case "hexadecimal":
		case "hex_color":
		case "nanoid":
		case "octal":
		case "ulid":
			jsonSchema.pattern = valibotAction.requirement.source;
			break;
		case "description":
			jsonSchema.description = valibotAction.description;
			break;
		case "email":
			jsonSchema.format = "email";
			break;
		case "empty":
			if (jsonSchema.type === "array") jsonSchema.maxItems = 0;
			else {
				if (jsonSchema.type !== "string") errors = addError(errors, `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`);
				jsonSchema.maxLength = 0;
			}
			break;
		case "entries":
			jsonSchema.minProperties = valibotAction.requirement;
			jsonSchema.maxProperties = valibotAction.requirement;
			break;
		case "examples":
			if (Array.isArray(jsonSchema.examples)) jsonSchema.examples = [...jsonSchema.examples, ...valibotAction.examples];
			else jsonSchema.examples = valibotAction.examples;
			break;
		case "integer":
			jsonSchema.type = "integer";
			break;
		case "ipv4":
			jsonSchema.format = "ipv4";
			break;
		case "ipv6":
			jsonSchema.format = "ipv6";
			break;
		case "iso_date":
			jsonSchema.format = "date";
			break;
		case "iso_date_time":
		case "iso_timestamp":
			jsonSchema.format = "date-time";
			break;
		case "iso_time":
			jsonSchema.format = "time";
			break;
		case "length":
			if (jsonSchema.type === "array") {
				jsonSchema.minItems = valibotAction.requirement;
				jsonSchema.maxItems = valibotAction.requirement;
			} else {
				if (jsonSchema.type !== "string") errors = addError(errors, `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`);
				jsonSchema.minLength = valibotAction.requirement;
				jsonSchema.maxLength = valibotAction.requirement;
			}
			break;
		case "max_entries":
			jsonSchema.maxProperties = valibotAction.requirement;
			break;
		case "max_length":
			if (jsonSchema.type === "array") jsonSchema.maxItems = valibotAction.requirement;
			else {
				if (jsonSchema.type !== "string") errors = addError(errors, `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`);
				jsonSchema.maxLength = valibotAction.requirement;
			}
			break;
		case "max_value":
			if (jsonSchema.type !== "number" && jsonSchema.type !== "integer") errors = addError(errors, `The "max_value" action is not supported on type "${jsonSchema.type}".`);
			jsonSchema.maximum = valibotAction.requirement;
			break;
		case "metadata":
			if (typeof valibotAction.metadata.title === "string") jsonSchema.title = valibotAction.metadata.title;
			if (typeof valibotAction.metadata.description === "string") jsonSchema.description = valibotAction.metadata.description;
			if (Array.isArray(valibotAction.metadata.examples)) if (Array.isArray(jsonSchema.examples)) jsonSchema.examples = [...jsonSchema.examples, ...valibotAction.metadata.examples];
			else jsonSchema.examples = valibotAction.metadata.examples;
			break;
		case "min_entries":
			jsonSchema.minProperties = valibotAction.requirement;
			break;
		case "min_length":
			if (jsonSchema.type === "array") jsonSchema.minItems = valibotAction.requirement;
			else {
				if (jsonSchema.type !== "string") errors = addError(errors, `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`);
				jsonSchema.minLength = valibotAction.requirement;
			}
			break;
		case "min_value":
			if (jsonSchema.type !== "number" && jsonSchema.type !== "integer") errors = addError(errors, `The "min_value" action is not supported on type "${jsonSchema.type}".`);
			jsonSchema.minimum = valibotAction.requirement;
			break;
		case "multiple_of":
			jsonSchema.multipleOf = valibotAction.requirement;
			break;
		case "non_empty":
			if (jsonSchema.type === "array") jsonSchema.minItems = 1;
			else {
				if (jsonSchema.type !== "string") errors = addError(errors, `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`);
				jsonSchema.minLength = 1;
			}
			break;
		case "regex":
			if (valibotAction.requirement.flags) errors = addError(errors, "RegExp flags are not supported by JSON Schema.");
			jsonSchema.pattern = valibotAction.requirement.source;
			break;
		case "title":
			jsonSchema.title = valibotAction.title;
			break;
		case "url":
			jsonSchema.format = "uri";
			break;
		case "uuid":
			jsonSchema.format = "uuid";
			break;
		case "value":
			jsonSchema.const = valibotAction.requirement;
			break;
		default: errors = addError(errors, `The "${valibotAction.type}" action cannot be converted to JSON Schema.`);
	}
	if (config?.overrideAction) {
		const actionOverride = config.overrideAction({
			valibotAction,
			jsonSchema,
			errors
		});
		if (actionOverride) return { ...actionOverride };
	}
	if (errors) for (const message of errors) handleError(message, config);
	return jsonSchema;
}
/**
* Flattens a Valibot pipe by recursively expanding nested pipes.
*
* @param pipe The pipeline to flatten.
*
* @returns A flat pipeline.
*/
function flattenPipe(pipe) {
	return pipe.flatMap((item) => "pipe" in item ? flattenPipe(item.pipe) : item);
}
let refCount = 0;
/**
* Converts any supported Valibot schema to the JSON Schema format.
*
* @param jsonSchema The JSON Schema object.
* @param valibotSchema The Valibot schema object.
* @param config The conversion configuration.
* @param context The conversion context.
* @param skipRef Whether to skip using a reference.
*
* @returns The converted JSON Schema.
*/
function convertSchema(jsonSchema, valibotSchema, config, context, skipRef = false) {
	if (!skipRef) {
		const referenceId = context.referenceMap.get(valibotSchema);
		if (referenceId) {
			jsonSchema.$ref = `#/$defs/${referenceId}`;
			if (config?.overrideRef) {
				const refOverride = config.overrideRef({
					...context,
					referenceId,
					valibotSchema,
					jsonSchema
				});
				if (refOverride) jsonSchema.$ref = refOverride;
			}
			return jsonSchema;
		}
	}
	if ("pipe" in valibotSchema) {
		const flatPipe = flattenPipe(valibotSchema.pipe);
		let startIndex = 0;
		let stopIndex = flatPipe.length - 1;
		if (config?.typeMode === "input") {
			const inputStopIndex = flatPipe.slice(1).findIndex((item) => item.kind === "schema" || item.kind === "transformation" && (item.type === "find_item" || item.type === "parse_json" || item.type === "raw_transform" || item.type === "reduce_items" || item.type === "stringify_json" || item.type === "to_bigint" || item.type === "to_boolean" || item.type === "to_date" || item.type === "to_number" || item.type === "to_string" || item.type === "transform"));
			if (inputStopIndex !== -1) stopIndex = inputStopIndex;
		} else if (config?.typeMode === "output") {
			const outputStartIndex = flatPipe.findLastIndex((item) => item.kind === "schema");
			if (outputStartIndex !== -1) startIndex = outputStartIndex;
		}
		for (let index = startIndex; index <= stopIndex; index++) {
			const valibotPipeItem = flatPipe[index];
			if (valibotPipeItem.kind === "schema") {
				if (index > startIndex) handleError("Set the \"typeMode\" config to \"input\" or \"output\" to convert pipelines with multiple schemas.", config);
				jsonSchema = convertSchema(jsonSchema, valibotPipeItem, config, context, true);
			} else jsonSchema = convertAction(jsonSchema, valibotPipeItem, config);
		}
		return jsonSchema;
	}
	let errors;
	switch (valibotSchema.type) {
		case "boolean":
			jsonSchema.type = "boolean";
			break;
		case "null":
			if (config?.target === "openapi-3.0") jsonSchema.enum = [null];
			else jsonSchema.type = "null";
			break;
		case "number":
			jsonSchema.type = "number";
			break;
		case "string":
			jsonSchema.type = "string";
			break;
		case "array":
			jsonSchema.type = "array";
			jsonSchema.items = convertSchema({}, valibotSchema.item, config, context);
			break;
		case "tuple":
		case "tuple_with_rest":
		case "loose_tuple":
		case "strict_tuple":
			jsonSchema.type = "array";
			if (config?.target === "openapi-3.0") {
				jsonSchema.items = { anyOf: [] };
				jsonSchema.minItems = valibotSchema.items.length;
				for (const item of valibotSchema.items) jsonSchema.items.anyOf.push(convertSchema({}, item, config, context));
				if (valibotSchema.type === "tuple_with_rest") jsonSchema.items.anyOf.push(convertSchema({}, valibotSchema.rest, config, context));
				else if (valibotSchema.type === "strict_tuple" || valibotSchema.type === "tuple") jsonSchema.maxItems = valibotSchema.items.length;
			} else if (config?.target === "draft-2020-12") {
				jsonSchema.prefixItems = [];
				jsonSchema.minItems = valibotSchema.items.length;
				for (const item of valibotSchema.items) jsonSchema.prefixItems.push(convertSchema({}, item, config, context));
				if (valibotSchema.type === "tuple_with_rest") jsonSchema.items = convertSchema({}, valibotSchema.rest, config, context);
				else if (valibotSchema.type === "strict_tuple") jsonSchema.items = false;
			} else {
				jsonSchema.items = [];
				jsonSchema.minItems = valibotSchema.items.length;
				for (const item of valibotSchema.items) jsonSchema.items.push(convertSchema({}, item, config, context));
				if (valibotSchema.type === "tuple_with_rest") jsonSchema.additionalItems = convertSchema({}, valibotSchema.rest, config, context);
				else if (valibotSchema.type === "strict_tuple") jsonSchema.additionalItems = false;
			}
			break;
		case "object":
		case "object_with_rest":
		case "loose_object":
		case "strict_object":
			jsonSchema.type = "object";
			jsonSchema.properties = {};
			jsonSchema.required = [];
			for (const key in valibotSchema.entries) {
				const entry = valibotSchema.entries[key];
				jsonSchema.properties[key] = convertSchema({}, entry, config, context);
				if (entry.type !== "exact_optional" && entry.type !== "nullish" && entry.type !== "optional") jsonSchema.required.push(key);
			}
			if (valibotSchema.type === "object_with_rest") jsonSchema.additionalProperties = convertSchema({}, valibotSchema.rest, config, context);
			else if (valibotSchema.type === "strict_object") jsonSchema.additionalProperties = false;
			break;
		case "record":
			if (config?.target === "openapi-3.0" && "pipe" in valibotSchema.key) errors = addError(errors, "The \"record\" schema with a schema for the key that contains a \"pipe\" cannot be converted to JSON Schema.");
			if (valibotSchema.key.type !== "string") errors = addError(errors, `The "record" schema with the "${valibotSchema.key.type}" schema for the key cannot be converted to JSON Schema.`);
			jsonSchema.type = "object";
			if (config?.target !== "openapi-3.0") jsonSchema.propertyNames = convertSchema({}, valibotSchema.key, config, context);
			jsonSchema.additionalProperties = convertSchema({}, valibotSchema.value, config, context);
			break;
		case "any":
		case "unknown": break;
		case "nullable":
		case "nullish":
			if (config?.target === "openapi-3.0") {
				const innerSchema = convertSchema({}, valibotSchema.wrapped, config, context);
				Object.assign(jsonSchema, innerSchema);
				jsonSchema.nullable = true;
			} else jsonSchema.anyOf = [convertSchema({}, valibotSchema.wrapped, config, context), { type: "null" }];
			if (valibotSchema.default !== void 0) jsonSchema.default = getDefault(valibotSchema);
			break;
		case "exact_optional":
		case "optional":
		case "undefinedable":
			jsonSchema = convertSchema(jsonSchema, valibotSchema.wrapped, config, context);
			if (valibotSchema.default !== void 0) jsonSchema.default = getDefault(valibotSchema);
			break;
		case "literal":
			if (typeof valibotSchema.literal !== "boolean" && typeof valibotSchema.literal !== "number" && typeof valibotSchema.literal !== "string") errors = addError(errors, "The value of the \"literal\" schema is not JSON compatible.");
			if (config?.target === "openapi-3.0") jsonSchema.enum = [valibotSchema.literal];
			else jsonSchema.const = valibotSchema.literal;
			break;
		case "enum":
			jsonSchema.enum = valibotSchema.options;
			break;
		case "picklist":
			if (valibotSchema.options.some((option) => typeof option !== "number" && typeof option !== "string")) errors = addError(errors, "An option of the \"picklist\" schema is not JSON compatible.");
			jsonSchema.enum = valibotSchema.options;
			break;
		case "union":
			jsonSchema.anyOf = valibotSchema.options.map((option) => convertSchema({}, option, config, context));
			break;
		case "variant":
			jsonSchema.oneOf = valibotSchema.options.map((option) => convertSchema({}, option, config, context));
			break;
		case "intersect":
			jsonSchema.allOf = valibotSchema.options.map((option) => convertSchema({}, option, config, context));
			break;
		case "lazy": {
			let wrappedValibotSchema = context.getterMap.get(valibotSchema.getter);
			if (!wrappedValibotSchema) {
				wrappedValibotSchema = valibotSchema.getter(void 0);
				context.getterMap.set(valibotSchema.getter, wrappedValibotSchema);
			}
			let referenceId = context.referenceMap.get(wrappedValibotSchema);
			if (!referenceId) {
				referenceId = `${refCount++}`;
				context.referenceMap.set(wrappedValibotSchema, referenceId);
				context.definitions[referenceId] = convertSchema({}, wrappedValibotSchema, config, context, true);
			}
			jsonSchema.$ref = `#/$defs/${referenceId}`;
			if (config?.overrideRef) {
				const refOverride = config.overrideRef({
					...context,
					referenceId,
					valibotSchema: wrappedValibotSchema,
					jsonSchema
				});
				if (refOverride) jsonSchema.$ref = refOverride;
			}
			break;
		}
		default: errors = addError(errors, `The "${valibotSchema.type}" schema cannot be converted to JSON Schema.`);
	}
	if (config?.overrideSchema) {
		const schemaOverride = config.overrideSchema({
			...context,
			referenceId: context.referenceMap.get(valibotSchema),
			valibotSchema,
			jsonSchema,
			errors
		});
		if (schemaOverride) return { ...schemaOverride };
	}
	if (errors) for (const message of errors) handleError(message, config);
	return jsonSchema;
}
let store;
/**
* Returns the current global schema definitions.
*
* @returns The schema definitions.
*
* @beta
*/
function getGlobalDefs() {
	return store;
}
/**
* Converts a Valibot schema to the JSON Schema format.
*
* @param schema The Valibot schema object.
* @param config The JSON Schema configuration.
*
* @returns The converted JSON Schema.
*/
function toJsonSchema$1(schema, config) {
	const context = {
		definitions: {},
		referenceMap: /* @__PURE__ */ new Map(),
		getterMap: /* @__PURE__ */ new Map()
	};
	const definitions = config?.definitions ?? getGlobalDefs();
	if (definitions) {
		for (const key in definitions) context.referenceMap.set(definitions[key], key);
		for (const key in definitions) context.definitions[key] = convertSchema({}, definitions[key], config, context, true);
	}
	const jsonSchema = convertSchema({}, schema, config, context);
	const target = config?.target ?? "draft-07";
	if (target === "draft-2020-12") jsonSchema.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (target === "draft-07") jsonSchema.$schema = "http://json-schema.org/draft-07/schema#";
	if (context.referenceMap.size) jsonSchema.$defs = context.definitions;
	return jsonSchema;
}

//#endregion
//#region ../../node_modules/.pnpm/@tmcp+adapter-valibot@0.1.5_tmcp@1.19.2_typescript@5.9.3__valibot@1.2.0_typescript@5.9.3_/node_modules/@tmcp/adapter-valibot/src/index.js
/**
* @import { GenericSchema } from "valibot";
*/
/**
* Atrocious hack to satisfy the current version of the protocol that for some reason
* requires `type: string` on enum fields despite JSON Schema spec not requiring it.
*
* TODO: Remove this once the protocol is fixed to align with JSON Schema spec.
* @param {ReturnType<typeof toJsonSchema>} json_schema
*/
function add_type_to_enums(json_schema) {
	for (let key in json_schema) {
		const property = json_schema[key];
		if (property != null && typeof property === "object" && !Array.isArray(property)) {
			if ("enum" in property && !("type" in property)) property.type = "string";
			add_type_to_enums(property);
		}
	}
	return json_schema;
}
/**
* Valibot adapter for converting Valibot schemas to JSON Schema format
* @augments {JsonSchemaAdapter<GenericSchema>}
*/
var ValibotJsonSchemaAdapter = class extends JsonSchemaAdapter {
	/**
	* Converts a Valibot schema to JSON Schema format
	* @param {GenericSchema} schema - The Valibot schema to convert
	* @returns {Promise<ReturnType<typeof toJsonSchema>>} - The converted JSON Schema
	*/
	async toJsonSchema(schema) {
		return add_type_to_enums(toJsonSchema$1(schema));
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@tmcp+session-manager@0.2.1_tmcp@1.19.2_typescript@5.9.3_/node_modules/@tmcp/session-manager/src/index.js
/**
* @import { Context } from "tmcp";
*/
/**
* @abstract
*/
var StreamSessionManager = class {
	/**
	* @abstract
	* @param {string} id
	* @param {ReadableStreamDefaultController} controller
	* @returns {void | Promise<void>}
	*/
	create(id, controller) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @returns {void | Promise<void>}
	*/
	delete(id) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @returns {boolean | Promise<boolean>}
	*/
	has(id) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string[] | undefined} sessions
	* @param {string} data
	* @returns {void | Promise<void>}
	*/
	send(sessions, data) {
		throw new Error("Method not implemented.");
	}
};
var InMemoryStreamSessionManager = class extends StreamSessionManager {
	/**
	* @type {Map<string, ReadableStreamDefaultController>}
	*/
	#sessions = /* @__PURE__ */ new Map();
	#text_encoder = new TextEncoder();
	/**
	* @param {string} id
	* @param {ReadableStreamDefaultController} controller
	*/
	create(id, controller) {
		this.#sessions.set(id, controller);
	}
	/**
	* @param {string} id
	*/
	delete(id) {
		const controller = this.#sessions.get(id);
		if (controller) {
			this.#sessions.delete(id);
			try {
				controller.close();
			} catch {}
		}
	}
	/**
	* @param {string} id
	* @returns {Promise<boolean>}
	*/
	async has(id) {
		return this.#sessions.has(id);
	}
	/**
	* @param {string[] | undefined} sessions
	* @param {string} data
	*/
	send(sessions, data) {
		for (const [id, controller] of this.#sessions.entries()) if (sessions == null || sessions.includes(id)) controller.enqueue(this.#text_encoder.encode(data));
	}
};
/**
* @abstract
*/
var InfoSessionManager = class {
	/**
	* @abstract
	* @param {string} id
	* @returns {Promise<NonNullable<Context["sessionInfo"]>["clientInfo"]>}
	*/
	getClientInfo(id) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @param {NonNullable<Context["sessionInfo"]>["clientInfo"]} client_info
	*/
	setClientInfo(id, client_info) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @returns {Promise<NonNullable<Context["sessionInfo"]>["clientCapabilities"]>}
	*/
	getClientCapabilities(id) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @param {NonNullable<Context["sessionInfo"]>["clientCapabilities"]} client_capabilities
	*/
	setClientCapabilities(id, client_capabilities) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @returns {Promise<NonNullable<Context["sessionInfo"]>["logLevel"]>}
	*/
	getLogLevel(id) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @param {NonNullable<Context["sessionInfo"]>["logLevel"]} log_level
	*/
	setLogLevel(id, log_level) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} uri
	* @returns {Promise<string[]>}
	*/
	getSubscriptions(uri) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @param {string} uri
	*/
	addSubscription(id, uri) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	* @param {string} uri
	*/
	removeSubscription(id, uri) {
		throw new Error("Method not implemented.");
	}
	/**
	* @abstract
	* @param {string} id
	*/
	delete(id) {
		throw new Error("Method not implemented.");
	}
};
var InMemoryInfoSessionManager = class extends InfoSessionManager {
	/**
	* @type {Map<string, NonNullable<Context["sessionInfo"]>["clientInfo"]>}
	*/
	#client_info = /* @__PURE__ */ new Map();
	/**
	* @type {Map<string, NonNullable<Context["sessionInfo"]>["clientCapabilities"]>}
	*/
	#client_capabilities = /* @__PURE__ */ new Map();
	/**
	* @type {Map<string, NonNullable<Context["sessionInfo"]>["logLevel"]>}
	*/
	#log_level = /* @__PURE__ */ new Map();
	/**
	* @type {Map<string, Set<string>>}
	*/
	#subscriptions = /* @__PURE__ */ new Map();
	/**
	* @param {string} session
	* @param {string} name
	* @returns {Promise<never>}
	*/
	async #invariant(session, name) {
		throw new Error(`${name} not found for session ${session}`);
	}
	/**
	* @type {InfoSessionManager["getClientInfo"]}
	*/
	getClientInfo(id) {
		return Promise.resolve(this.#client_info.get(id) ?? this.#invariant(id, "Client info"));
	}
	/**
	* @type {InfoSessionManager["setClientInfo"]}
	*/
	setClientInfo(id, client_info) {
		this.#client_info.set(id, client_info);
	}
	/**
	* @type {InfoSessionManager["getClientCapabilities"]}
	*/
	getClientCapabilities(id) {
		return Promise.resolve(this.#client_capabilities.get(id) ?? this.#invariant(id, "Client capabilities"));
	}
	/**
	* @type {InfoSessionManager["setClientCapabilities"]}
	*/
	setClientCapabilities(id, client_capabilities) {
		this.#client_capabilities.set(id, client_capabilities);
	}
	/**
	* @type {InfoSessionManager["getLogLevel"]}
	*/
	getLogLevel(id) {
		return Promise.resolve(this.#log_level.get(id) ?? this.#invariant(id, "Log Level"));
	}
	/**
	* @type {InfoSessionManager["setLogLevel"]}
	*/
	setLogLevel(id, log_level) {
		this.#log_level.set(id, log_level);
	}
	/**
	* @type {InfoSessionManager["getSubscriptions"]}
	*/
	getSubscriptions(uri) {
		return Promise.resolve([...this.#subscriptions.get(uri) ?? []]);
	}
	/**
	* @type {InfoSessionManager["addSubscription"]}
	*/
	addSubscription(id, uri) {
		let subscriptions = this.#subscriptions.get(uri);
		if (!subscriptions) {
			subscriptions = /* @__PURE__ */ new Set();
			this.#subscriptions.set(uri, subscriptions);
		}
		subscriptions.add(id);
	}
	/**
	* @type {InfoSessionManager["removeSubscription"]}
	*/
	removeSubscription(id, uri) {
		let subscriptions = this.#subscriptions.get(uri);
		if (subscriptions) subscriptions.delete(id);
	}
	/**
	* @type {InfoSessionManager["delete"]}
	*/
	delete(id) {
		this.#subscriptions.delete(id);
		this.#log_level.delete(id);
		this.#client_capabilities.delete(id);
		this.#client_info.delete(id);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/esm-env@1.2.2/node_modules/esm-env/dev-fallback.js
const node_env = globalThis.process?.env?.NODE_ENV;
var dev_fallback_default = node_env && !node_env.toLowerCase().startsWith("prod");

//#endregion
//#region ../../node_modules/.pnpm/@tmcp+transport-http@0.8.4_tmcp@1.19.2_typescript@5.9.3_/node_modules/@tmcp/transport-http/src/index.js
/**
* @import { AuthInfo, McpServer } from "tmcp";
* @import { OAuth  } from "@tmcp/auth";
* @import { StreamSessionManager, InfoSessionManager } from "@tmcp/session-manager";
* @import { OptionalizeSessionManager } from "./type-utils.js"
*/
/**
* @typedef {{
* 	origin?: string | string[] | boolean
* 	methods?: string[]
* 	allowedHeaders?: string[]
* 	exposedHeaders?: string[]
* 	credentials?: boolean
* 	maxAge?: number
* }} CorsConfig
*/
/**
* @typedef {{
* 	getSessionId?: () => string
* 	path?: string | null
* 	oauth?: OAuth<"built">
* 	cors?: CorsConfig | boolean,
* 	sessionManager?: { streams?: StreamSessionManager, info?: OptionalizeSessionManager<InfoSessionManager> }
* 	disableSse?: boolean
* }} HttpTransportOptions
*/
/**
* @template {Record<string, unknown> | undefined} [TCustom=undefined]
*/
var HttpTransport = class {
	/**
	* @typedef {NonNullable<Required<Pick<HttpTransportOptions, "sessionManager">["sessionManager"]>>} SessionManager
	*/
	/**
	* @type {McpServer<any, TCustom>}
	*/
	#server;
	/**
	* @type {Required<Omit<HttpTransportOptions, 'oauth' | 'cors' | 'sessionManager' | 'disableSse'>> & { cors?: CorsConfig | boolean, sessionManager: SessionManager, disableSse?: boolean }}
	*/
	#options;
	/**
	* @type {string | null}
	*/
	#path;
	/**
	* @type {AsyncLocalStorage<ReadableStreamDefaultController | undefined>}
	*/
	#controller_storage = new AsyncLocalStorage();
	/**
	* @type {AsyncLocalStorage<string>}
	*/
	#session_id_storage = new AsyncLocalStorage();
	/**
	* @type {OAuth<"built"> | undefined}
	*/
	#oauth;
	#text_encoder = new TextEncoder();
	/**
	*
	* @param {McpServer<any, TCustom>} server
	* @param {HttpTransportOptions} [options]
	*/
	constructor(server, options) {
		this.#server = server;
		const { getSessionId = () => crypto.randomUUID(), path = "/mcp", oauth, cors, disableSse, sessionManager: _sessionManager = {
			streams: new InMemoryStreamSessionManager(),
			info: new InMemoryInfoSessionManager()
		} } = options ?? { getSessionId: () => crypto.randomUUID() };
		/**
		* @type {SessionManager}
		*/
		const sessionManager = {
			streams: _sessionManager.streams ?? new InMemoryStreamSessionManager(),
			info: _sessionManager.info ?? new InMemoryInfoSessionManager()
		};
		if (options?.path === void 0 && dev_fallback_default) console.warn("[tmcp][transport-http] `options.path` is undefined, in future versions passing `undefined` will default to respond on all paths. To keep the current behavior, explicitly set `path` to '/mcp' or your desired path.");
		if (oauth) this.#oauth = oauth;
		this.#options = {
			getSessionId,
			path,
			cors,
			sessionManager,
			disableSse
		};
		this.#path = path;
		this.#server.on("initialize", ({ capabilities, clientInfo }) => {
			const sessionId = this.#session_id_storage.getStore();
			if (!sessionId) return;
			this.#options.sessionManager.info.setClientCapabilities(sessionId, capabilities);
			this.#options.sessionManager.info.setClientInfo(sessionId, clientInfo);
		});
		this.#server.on("subscription", async ({ uri, action }) => {
			const sessionId = this.#session_id_storage.getStore();
			if (!sessionId) return;
			if (action === "remove") this.#options.sessionManager.info.removeSubscription?.(sessionId, uri);
			else this.#options.sessionManager.info.addSubscription(sessionId, uri);
		});
		this.#server.on("loglevelchange", ({ level }) => {
			const sessionId = this.#session_id_storage.getStore();
			if (!sessionId) return;
			this.#options.sessionManager.info.setLogLevel(sessionId, level);
		});
		this.#server.on("broadcast", async ({ request }) => {
			let sessions = void 0;
			if (request.method === "notifications/resources/updated") sessions = await this.#options.sessionManager.info.getSubscriptions(request.params.uri);
			await this.#options.sessionManager.streams.send(sessions, "event: message\ndata: " + JSON.stringify(request) + "\n\n");
		});
		this.#server.on("send", async ({ request }) => {
			const controller = this.#controller_storage.getStore();
			if (!controller) return;
			controller.enqueue(this.#text_encoder.encode("event: message\ndata: " + JSON.stringify(request) + "\n\n"));
		});
	}
	/**
	* Applies CORS headers to a response based on the configuration
	* @param {Response} response - The response to modify
	* @param {Request} request - The original request
	*/
	#apply_cors_headers(response, request) {
		const cors_config = this.#options.cors;
		if (!cors_config) return;
		if (cors_config === true) {
			response.headers.set("Access-Control-Allow-Origin", "*");
			response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
			response.headers.set("Access-Control-Allow-Headers", "*");
			return;
		}
		const config = cors_config;
		const origin = request.headers.get("origin");
		if (config.origin !== void 0) {
			if (config.origin === true || config.origin === "*") response.headers.set("Access-Control-Allow-Origin", "*");
			else if (typeof config.origin === "string") {
				if (origin === config.origin) response.headers.set("Access-Control-Allow-Origin", config.origin);
			} else if (Array.isArray(config.origin)) {
				if (origin && config.origin.includes(origin)) response.headers.set("Access-Control-Allow-Origin", origin);
			}
		}
		const methods = config.methods ?? [
			"GET",
			"POST",
			"DELETE",
			"OPTIONS"
		];
		response.headers.set("Access-Control-Allow-Methods", methods.join(", "));
		const allowed_headers = config.allowedHeaders ?? "*";
		if (Array.isArray(allowed_headers)) response.headers.set("Access-Control-Allow-Headers", allowed_headers.join(", "));
		else response.headers.set("Access-Control-Allow-Headers", allowed_headers);
		if (config.exposedHeaders) response.headers.set("Access-Control-Expose-Headers", config.exposedHeaders.join(", "));
		if (config.credentials) response.headers.set("Access-Control-Allow-Credentials", "true");
		if (config.maxAge !== void 0) response.headers.set("Access-Control-Max-Age", config.maxAge.toString());
	}
	/**
	* @param {string} session_id
	*/
	async #handle_delete(session_id) {
		await this.#options.sessionManager.streams.delete(session_id);
		await this.#options.sessionManager.info.delete(session_id);
		return new Response(null, {
			status: 200,
			headers: { "mcp-session-id": session_id }
		});
	}
	/**
	*
	* @param {string} session_id
	* @returns
	*/
	async #handle_get(session_id) {
		if (this.#options.disableSse) return new Response(null, {
			status: 405,
			headers: { Allow: "POST, DELETE, OPTIONS" }
		});
		const sessions = this.#options.sessionManager;
		const text_encoder = this.#text_encoder;
		if (await sessions.streams.has(session_id)) return new Response(JSON.stringify({
			jsonrpc: "2.0",
			error: {
				code: -32e3,
				message: "Conflict: Only one SSE stream is allowed per session"
			},
			id: null
		}), {
			headers: {
				"Content-Type": "application/json",
				"mcp-session-id": session_id
			},
			status: 409
		});
		const stream = new ReadableStream({
			async start(controller) {
				await sessions.streams.create(session_id, controller);
				controller.enqueue(text_encoder.encode(": connected\n\n"));
			},
			async cancel() {
				await sessions.streams.delete(session_id);
			}
		});
		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
				"mcp-session-id": session_id
			},
			status: 200
		});
	}
	/**
	*
	* @param {string} session_id
	* @param {Request} request
	* @param {AuthInfo | null} auth_info
	* @param {TCustom} [ctx]
	*/
	async #handle_post(session_id, request, auth_info, ctx) {
		const content_type = request.headers.get("content-type");
		if (!content_type || !content_type.includes("application/json")) return new Response(JSON.stringify({
			jsonrpc: "2.0",
			error: {
				code: -32600,
				message: "Invalid Request",
				data: "Content-Type must be application/json"
			}
		}), {
			status: 415,
			headers: {
				"Content-Type": "application/json",
				"mcp-session-id": session_id
			}
		});
		try {
			const body = await request.clone().json();
			/**
			* @type {ReadableStreamDefaultController | undefined}
			*/
			let controller;
			const stream = new ReadableStream({ start(_controller) {
				controller = _controller;
			} });
			const session_id_storage = this.#session_id_storage;
			const handle = async () => {
				const client_capabilities = await this.#options.sessionManager.info.getClientCapabilities(session_id).catch(() => void 0);
				const client_info = await this.#options.sessionManager.info.getClientInfo(session_id).catch(() => void 0);
				const log_level = await this.#options.sessionManager.info.getLogLevel(session_id).catch(() => void 0);
				const response = await this.#controller_storage.run(controller, () => session_id_storage.run(session_id, () => this.#server.receive(body, {
					sessionId: session_id,
					auth: auth_info ?? void 0,
					sessionInfo: {
						clientCapabilities: client_capabilities,
						clientInfo: client_info,
						logLevel: log_level
					},
					custom: ctx
				})));
				controller?.enqueue(this.#text_encoder.encode("event: message\ndata: " + JSON.stringify(response) + "\n\n"));
				controller?.close();
			};
			handle();
			const has_request = (Array.isArray(body) ? body : [body]).some((message) => message.id != null);
			const status = !has_request ? 202 : 200;
			return new Response(has_request ? stream : null, {
				headers: has_request ? {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					connection: "keep-alive",
					"mcp-session-id": session_id
				} : void 0,
				status
			});
		} catch (error) {
			return new Response(JSON.stringify({
				jsonrpc: "2.0",
				error: {
					code: -32700,
					message: "Parse error",
					data: error.message
				}
			}), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
					"mcp-session-id": session_id
				}
			});
		}
	}
	/**
	*
	* @param {string} method
	* @returns
	*/
	#handle_default(method) {
		return new Response(JSON.stringify({
			jsonrpc: "2.0",
			error: {
				code: -32601,
				message: "Method not found",
				data: `HTTP method ${method} not supported`
			}
		}), {
			status: 405,
			headers: {
				"Content-Type": "application/json",
				Allow: "GET, POST, DELETE, OPTIONS"
			}
		});
	}
	/**
	*
	* @param {Request} request
	* @param {TCustom} [ctx]
	* @returns {Promise<Response | null>}
	*/
	async respond(request, ctx) {
		const url = new URL(request.url);
		/**
		* @type {AuthInfo | null}
		*/
		let auth_info = null;
		if (this.#oauth) {
			try {
				const response = await this.#oauth.respond(request);
				if (response) return response;
			} catch (error) {
				return new Response(JSON.stringify({
					error: "server_error",
					error_description: error.message
				}), {
					status: 500,
					headers: { "Content-Type": "application/json" }
				});
			}
			auth_info = await this.#oauth.verify(request);
		}
		if (url.pathname !== this.#path && this.#path !== null) return null;
		const method = request.method;
		const session_id = request.headers.get("mcp-session-id") || this.#options.getSessionId();
		/**
		* @type {Response | null}
		*/
		let response = null;
		if (method === "OPTIONS") response = new Response(null, {
			status: 204,
			headers: { "Content-Type": "application/json" }
		});
		else if (method === "DELETE") response = await this.#handle_delete(session_id);
		else if (method === "GET") response = await this.#handle_get(session_id);
		else if (method === "POST") response = await this.#handle_post(session_id, request, auth_info, ctx);
		else response = this.#handle_default(method);
		if (response) this.#apply_cors_headers(response, request);
		return response;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@toon-format+toon@2.1.0/node_modules/@toon-format/toon/dist/index.mjs
const LIST_ITEM_MARKER = "-";
const LIST_ITEM_PREFIX = "- ";
const COMMA = ",";
const PIPE = "|";
const DOT = ".";
const NULL_LITERAL = "null";
const TRUE_LITERAL = "true";
const FALSE_LITERAL = "false";
const BACKSLASH = "\\";
const DOUBLE_QUOTE = "\"";
const TAB = "	";
const DELIMITERS = {
	comma: COMMA,
	tab: TAB,
	pipe: PIPE
};
const DEFAULT_DELIMITER = DELIMITERS.comma;
/**
* Escapes special characters in a string for encoding.
*
* @remarks
* Handles backslashes, quotes, newlines, carriage returns, and tabs.
*/
function escapeString(value) {
	return value.replace(/\\/g, `${BACKSLASH}${BACKSLASH}`).replace(/"/g, `${BACKSLASH}${DOUBLE_QUOTE}`).replace(/\n/g, `${BACKSLASH}n`).replace(/\r/g, `${BACKSLASH}r`).replace(/\t/g, `${BACKSLASH}t`);
}
function isBooleanOrNullLiteral(token) {
	return token === TRUE_LITERAL || token === FALSE_LITERAL || token === NULL_LITERAL;
}
function normalizeValue(value) {
	if (value === null) return null;
	if (typeof value === "object" && value !== null && "toJSON" in value && typeof value.toJSON === "function") {
		const next = value.toJSON();
		if (next !== value) return normalizeValue(next);
	}
	if (typeof value === "string" || typeof value === "boolean") return value;
	if (typeof value === "number") {
		if (Object.is(value, -0)) return 0;
		if (!Number.isFinite(value)) return null;
		return value;
	}
	if (typeof value === "bigint") {
		if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) return Number(value);
		return value.toString();
	}
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(normalizeValue);
	if (value instanceof Set) return Array.from(value).map(normalizeValue);
	if (value instanceof Map) return Object.fromEntries(Array.from(value, ([k, v]) => [String(k), normalizeValue(v)]));
	if (isPlainObject$2(value)) {
		const normalized = {};
		for (const key in value) if (Object.prototype.hasOwnProperty.call(value, key)) normalized[key] = normalizeValue(value[key]);
		return normalized;
	}
	return null;
}
function isJsonPrimitive(value) {
	return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function isJsonArray(value) {
	return Array.isArray(value);
}
function isJsonObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isEmptyObject(value) {
	return Object.keys(value).length === 0;
}
function isPlainObject$2(value) {
	if (value === null || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}
function isArrayOfPrimitives(value) {
	return value.length === 0 || value.every((item) => isJsonPrimitive(item));
}
function isArrayOfArrays(value) {
	return value.length === 0 || value.every((item) => isJsonArray(item));
}
function isArrayOfObjects(value) {
	return value.length === 0 || value.every((item) => isJsonObject(item));
}
/**
* Checks if a key can be used without quotes.
*
* @remarks
* Valid unquoted keys must start with a letter or underscore,
* followed by letters, digits, underscores, or dots.
*/
function isValidUnquotedKey(key) {
	return /^[A-Z_][\w.]*$/i.test(key);
}
/**
* Checks if a key segment is a valid identifier for safe folding/expansion.
*
* @remarks
* Identifier segments are more restrictive than unquoted keys:
* - Must start with a letter or underscore
* - Followed only by letters, digits, or underscores (no dots)
* - Used for safe key folding and path expansion
*/
function isIdentifierSegment(key) {
	return /^[A-Z_]\w*$/i.test(key);
}
/**
* Determines if a string value can be safely encoded without quotes.
*
* @remarks
* A string needs quoting if it:
* - Is empty
* - Has leading or trailing whitespace
* - Could be confused with a literal (boolean, null, number)
* - Contains structural characters (colons, brackets, braces)
* - Contains quotes or backslashes (need escaping)
* - Contains control characters (newlines, tabs, etc.)
* - Contains the active delimiter
* - Starts with a list marker (hyphen)
*/
function isSafeUnquoted(value, delimiter = DEFAULT_DELIMITER) {
	if (!value) return false;
	if (value !== value.trim()) return false;
	if (isBooleanOrNullLiteral(value) || isNumericLike(value)) return false;
	if (value.includes(":")) return false;
	if (value.includes("\"") || value.includes("\\")) return false;
	if (/[[\]{}]/.test(value)) return false;
	if (/[\n\r\t]/.test(value)) return false;
	if (value.includes(delimiter)) return false;
	if (value.startsWith(LIST_ITEM_MARKER)) return false;
	return true;
}
/**
* Checks if a string looks like a number.
*
* @remarks
* Match numbers like `42`, `-3.14`, `1e-6`, `05`, etc.
*/
function isNumericLike(value) {
	return /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value) || /^0\d+$/.test(value);
}
/**
* Attempts to fold a single-key object chain into a dotted path.
*
* @remarks
* Folding traverses nested objects with single keys, collapsing them into a dotted path.
* It stops when:
* - A non-single-key object is encountered
* - An array is encountered (arrays are not "single-key objects")
* - A primitive value is reached
* - The flatten depth limit is reached
* - Any segment fails safe mode validation
*
* Safe mode requirements:
* - `options.keyFolding` must be `'safe'`
* - Every segment must be a valid identifier (no dots, no special chars)
* - The folded key must not collide with existing sibling keys
* - No segment should require quoting
*
* @param key - The starting key to fold
* @param value - The value associated with the key
* @param siblings - Array of all sibling keys at this level (for collision detection)
* @param options - Resolved encoding options
* @returns A FoldResult if folding is possible, undefined otherwise
*/
function tryFoldKeyChain(key, value, siblings, options, rootLiteralKeys, pathPrefix, flattenDepth) {
	if (options.keyFolding !== "safe") return;
	if (!isJsonObject(value)) return;
	const { segments, tail, leafValue } = collectSingleKeyChain(key, value, flattenDepth ?? options.flattenDepth);
	if (segments.length < 2) return;
	if (!segments.every((seg) => isIdentifierSegment(seg))) return;
	const foldedKey = buildFoldedKey(segments);
	const absolutePath = pathPrefix ? `${pathPrefix}${DOT}${foldedKey}` : foldedKey;
	if (siblings.includes(foldedKey)) return;
	if (rootLiteralKeys && rootLiteralKeys.has(absolutePath)) return;
	return {
		foldedKey,
		remainder: tail,
		leafValue,
		segmentCount: segments.length
	};
}
/**
* Collects a chain of single-key objects into segments.
*
* @remarks
* Traverses nested objects, collecting keys until:
* - A non-single-key object is found
* - An array is encountered
* - A primitive is reached
* - An empty object is reached
* - The depth limit is reached
*
* @param startKey - The initial key to start the chain
* @param startValue - The value to traverse
* @param maxDepth - Maximum number of segments to collect
* @returns Object containing segments array, tail value, and leaf value
*/
function collectSingleKeyChain(startKey, startValue, maxDepth) {
	const segments = [startKey];
	let currentValue = startValue;
	while (segments.length < maxDepth) {
		if (!isJsonObject(currentValue)) break;
		const keys = Object.keys(currentValue);
		if (keys.length !== 1) break;
		const nextKey = keys[0];
		const nextValue = currentValue[nextKey];
		segments.push(nextKey);
		currentValue = nextValue;
	}
	if (!isJsonObject(currentValue) || isEmptyObject(currentValue)) return {
		segments,
		tail: void 0,
		leafValue: currentValue
	};
	return {
		segments,
		tail: currentValue,
		leafValue: currentValue
	};
}
function buildFoldedKey(segments) {
	return segments.join(DOT);
}
function encodePrimitive(value, delimiter) {
	if (value === null) return NULL_LITERAL;
	if (typeof value === "boolean") return String(value);
	if (typeof value === "number") return String(value);
	return encodeStringLiteral(value, delimiter);
}
function encodeStringLiteral(value, delimiter = DEFAULT_DELIMITER) {
	if (isSafeUnquoted(value, delimiter)) return value;
	return `${DOUBLE_QUOTE}${escapeString(value)}${DOUBLE_QUOTE}`;
}
function encodeKey(key) {
	if (isValidUnquotedKey(key)) return key;
	return `${DOUBLE_QUOTE}${escapeString(key)}${DOUBLE_QUOTE}`;
}
function encodeAndJoinPrimitives(values, delimiter = DEFAULT_DELIMITER) {
	return values.map((v) => encodePrimitive(v, delimiter)).join(delimiter);
}
function formatHeader(length, options) {
	const key = options?.key;
	const fields = options?.fields;
	const delimiter = options?.delimiter ?? COMMA;
	let header = "";
	if (key) header += encodeKey(key);
	header += `[${length}${delimiter !== DEFAULT_DELIMITER ? delimiter : ""}]`;
	if (fields) {
		const quotedFields = fields.map((f) => encodeKey(f));
		header += `{${quotedFields.join(delimiter)}}`;
	}
	header += ":";
	return header;
}
function* encodeJsonValue(value, options, depth) {
	if (isJsonPrimitive(value)) {
		const encodedPrimitive = encodePrimitive(value, options.delimiter);
		if (encodedPrimitive !== "") yield encodedPrimitive;
		return;
	}
	if (isJsonArray(value)) yield* encodeArrayLines(void 0, value, depth, options);
	else if (isJsonObject(value)) yield* encodeObjectLines(value, depth, options);
}
function* encodeObjectLines(value, depth, options, rootLiteralKeys, pathPrefix, remainingDepth) {
	const keys = Object.keys(value);
	if (depth === 0 && !rootLiteralKeys) rootLiteralKeys = new Set(keys.filter((k) => k.includes(".")));
	const effectiveFlattenDepth = remainingDepth ?? options.flattenDepth;
	for (const [key, val] of Object.entries(value)) yield* encodeKeyValuePairLines(key, val, depth, options, keys, rootLiteralKeys, pathPrefix, effectiveFlattenDepth);
}
function* encodeKeyValuePairLines(key, value, depth, options, siblings, rootLiteralKeys, pathPrefix, flattenDepth) {
	const currentPath = pathPrefix ? `${pathPrefix}${DOT}${key}` : key;
	const effectiveFlattenDepth = flattenDepth ?? options.flattenDepth;
	if (options.keyFolding === "safe" && siblings) {
		const foldResult = tryFoldKeyChain(key, value, siblings, options, rootLiteralKeys, pathPrefix, effectiveFlattenDepth);
		if (foldResult) {
			const { foldedKey, remainder, leafValue, segmentCount } = foldResult;
			const encodedFoldedKey = encodeKey(foldedKey);
			if (remainder === void 0) {
				if (isJsonPrimitive(leafValue)) {
					yield indentedLine(depth, `${encodedFoldedKey}: ${encodePrimitive(leafValue, options.delimiter)}`, options.indent);
					return;
				} else if (isJsonArray(leafValue)) {
					yield* encodeArrayLines(foldedKey, leafValue, depth, options);
					return;
				} else if (isJsonObject(leafValue) && isEmptyObject(leafValue)) {
					yield indentedLine(depth, `${encodedFoldedKey}:`, options.indent);
					return;
				}
			}
			if (isJsonObject(remainder)) {
				yield indentedLine(depth, `${encodedFoldedKey}:`, options.indent);
				const remainingDepth = effectiveFlattenDepth - segmentCount;
				const foldedPath = pathPrefix ? `${pathPrefix}${DOT}${foldedKey}` : foldedKey;
				yield* encodeObjectLines(remainder, depth + 1, options, rootLiteralKeys, foldedPath, remainingDepth);
				return;
			}
		}
	}
	const encodedKey = encodeKey(key);
	if (isJsonPrimitive(value)) yield indentedLine(depth, `${encodedKey}: ${encodePrimitive(value, options.delimiter)}`, options.indent);
	else if (isJsonArray(value)) yield* encodeArrayLines(key, value, depth, options);
	else if (isJsonObject(value)) {
		yield indentedLine(depth, `${encodedKey}:`, options.indent);
		if (!isEmptyObject(value)) yield* encodeObjectLines(value, depth + 1, options, rootLiteralKeys, currentPath, effectiveFlattenDepth);
	}
}
function* encodeArrayLines(key, value, depth, options) {
	if (value.length === 0) {
		yield indentedLine(depth, formatHeader(0, {
			key,
			delimiter: options.delimiter
		}), options.indent);
		return;
	}
	if (isArrayOfPrimitives(value)) {
		yield indentedLine(depth, encodeInlineArrayLine(value, options.delimiter, key), options.indent);
		return;
	}
	if (isArrayOfArrays(value)) {
		if (value.every((arr) => isArrayOfPrimitives(arr))) {
			yield* encodeArrayOfArraysAsListItemsLines(key, value, depth, options);
			return;
		}
	}
	if (isArrayOfObjects(value)) {
		const header = extractTabularHeader(value);
		if (header) yield* encodeArrayOfObjectsAsTabularLines(key, value, header, depth, options);
		else yield* encodeMixedArrayAsListItemsLines(key, value, depth, options);
		return;
	}
	yield* encodeMixedArrayAsListItemsLines(key, value, depth, options);
}
function* encodeArrayOfArraysAsListItemsLines(prefix, values, depth, options) {
	yield indentedLine(depth, formatHeader(values.length, {
		key: prefix,
		delimiter: options.delimiter
	}), options.indent);
	for (const arr of values) if (isArrayOfPrimitives(arr)) {
		const arrayLine = encodeInlineArrayLine(arr, options.delimiter);
		yield indentedListItem(depth + 1, arrayLine, options.indent);
	}
}
function encodeInlineArrayLine(values, delimiter, prefix) {
	const header = formatHeader(values.length, {
		key: prefix,
		delimiter
	});
	const joinedValue = encodeAndJoinPrimitives(values, delimiter);
	if (values.length === 0) return header;
	return `${header} ${joinedValue}`;
}
function* encodeArrayOfObjectsAsTabularLines(prefix, rows, header, depth, options) {
	yield indentedLine(depth, formatHeader(rows.length, {
		key: prefix,
		fields: header,
		delimiter: options.delimiter
	}), options.indent);
	yield* writeTabularRowsLines(rows, header, depth + 1, options);
}
function extractTabularHeader(rows) {
	if (rows.length === 0) return;
	const firstRow = rows[0];
	const firstKeys = Object.keys(firstRow);
	if (firstKeys.length === 0) return;
	if (isTabularArray(rows, firstKeys)) return firstKeys;
}
function isTabularArray(rows, header) {
	for (const row of rows) {
		if (Object.keys(row).length !== header.length) return false;
		for (const key of header) {
			if (!(key in row)) return false;
			if (!isJsonPrimitive(row[key])) return false;
		}
	}
	return true;
}
function* writeTabularRowsLines(rows, header, depth, options) {
	for (const row of rows) yield indentedLine(depth, encodeAndJoinPrimitives(header.map((key) => row[key]), options.delimiter), options.indent);
}
function* encodeMixedArrayAsListItemsLines(prefix, items, depth, options) {
	yield indentedLine(depth, formatHeader(items.length, {
		key: prefix,
		delimiter: options.delimiter
	}), options.indent);
	for (const item of items) yield* encodeListItemValueLines(item, depth + 1, options);
}
function* encodeObjectAsListItemLines(obj, depth, options) {
	if (isEmptyObject(obj)) {
		yield indentedLine(depth, LIST_ITEM_MARKER, options.indent);
		return;
	}
	const entries = Object.entries(obj);
	const [firstKey, firstValue] = entries[0];
	const restEntries = entries.slice(1);
	if (isJsonArray(firstValue) && isArrayOfObjects(firstValue)) {
		const header = extractTabularHeader(firstValue);
		if (header) {
			yield indentedListItem(depth, formatHeader(firstValue.length, {
				key: firstKey,
				fields: header,
				delimiter: options.delimiter
			}), options.indent);
			yield* writeTabularRowsLines(firstValue, header, depth + 2, options);
			if (restEntries.length > 0) yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
			return;
		}
	}
	const encodedKey = encodeKey(firstKey);
	if (isJsonPrimitive(firstValue)) yield indentedListItem(depth, `${encodedKey}: ${encodePrimitive(firstValue, options.delimiter)}`, options.indent);
	else if (isJsonArray(firstValue)) if (firstValue.length === 0) yield indentedListItem(depth, `${encodedKey}${formatHeader(0, { delimiter: options.delimiter })}`, options.indent);
	else if (isArrayOfPrimitives(firstValue)) yield indentedListItem(depth, `${encodedKey}${encodeInlineArrayLine(firstValue, options.delimiter)}`, options.indent);
	else {
		yield indentedListItem(depth, `${encodedKey}${formatHeader(firstValue.length, { delimiter: options.delimiter })}`, options.indent);
		for (const item of firstValue) yield* encodeListItemValueLines(item, depth + 2, options);
	}
	else if (isJsonObject(firstValue)) {
		yield indentedListItem(depth, `${encodedKey}:`, options.indent);
		if (!isEmptyObject(firstValue)) yield* encodeObjectLines(firstValue, depth + 2, options);
	}
	if (restEntries.length > 0) yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
}
function* encodeListItemValueLines(value, depth, options) {
	if (isJsonPrimitive(value)) yield indentedListItem(depth, encodePrimitive(value, options.delimiter), options.indent);
	else if (isJsonArray(value)) if (isArrayOfPrimitives(value)) yield indentedListItem(depth, encodeInlineArrayLine(value, options.delimiter), options.indent);
	else {
		yield indentedListItem(depth, formatHeader(value.length, { delimiter: options.delimiter }), options.indent);
		for (const item of value) yield* encodeListItemValueLines(item, depth + 1, options);
	}
	else if (isJsonObject(value)) yield* encodeObjectAsListItemLines(value, depth, options);
}
function indentedLine(depth, content, indentSize) {
	return " ".repeat(indentSize * depth) + content;
}
function indentedListItem(depth, content, indentSize) {
	return indentedLine(depth, LIST_ITEM_PREFIX + content, indentSize);
}
/**
* Applies a replacer function to a `JsonValue` and all its descendants.
*
* The replacer is called for:
* - The root value (with key='', path=[])
* - Every object property (with the property name as key)
* - Every array element (with the string index as key: '0', '1', etc.)
*
* @param root - The normalized `JsonValue` to transform
* @param replacer - The replacer function to apply
* @returns The transformed `JsonValue`
*/
function applyReplacer(root, replacer) {
	const replacedRoot = replacer("", root, []);
	if (replacedRoot === void 0) return transformChildren(root, replacer, []);
	return transformChildren(normalizeValue(replacedRoot), replacer, []);
}
/**
* Recursively transforms the children of a `JsonValue` using the replacer.
*
* @param value - The value whose children should be transformed
* @param replacer - The replacer function to apply
* @param path - Current path from root
* @returns The value with transformed children
*/
function transformChildren(value, replacer, path) {
	if (isJsonObject(value)) return transformObject(value, replacer, path);
	if (isJsonArray(value)) return transformArray(value, replacer, path);
	return value;
}
/**
* Transforms an object by applying the replacer to each property.
*
* @param obj - The object to transform
* @param replacer - The replacer function to apply
* @param path - Current path from root
* @returns A new object with transformed properties
*/
function transformObject(obj, replacer, path) {
	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const childPath = [...path, key];
		const replacedValue = replacer(key, value, childPath);
		if (replacedValue === void 0) continue;
		result[key] = transformChildren(normalizeValue(replacedValue), replacer, childPath);
	}
	return result;
}
/**
* Transforms an array by applying the replacer to each element.
*
* @param arr - The array to transform
* @param replacer - The replacer function to apply
* @param path - Current path from root
* @returns A new array with transformed elements
*/
function transformArray(arr, replacer, path) {
	const result = [];
	for (let i = 0; i < arr.length; i++) {
		const value = arr[i];
		const childPath = [...path, i];
		const replacedValue = replacer(String(i), value, childPath);
		if (replacedValue === void 0) continue;
		const normalizedValue = normalizeValue(replacedValue);
		result.push(transformChildren(normalizedValue, replacer, childPath));
	}
	return result;
}
/**
* Encodes a JavaScript value into TOON format string.
*
* @param input - Any JavaScript value (objects, arrays, primitives)
* @param options - Optional encoding configuration
* @returns TOON formatted string
*
* @example
* ```ts
* encode({ name: 'Alice', age: 30 })
* // name: Alice
* // age: 30
*
* encode({ users: [{ id: 1 }, { id: 2 }] })
* // users[]:
* //   - id: 1
* //   - id: 2
*
* encode(data, { indent: 4, keyFolding: 'safe' })
* ```
*/
function encode(input, options) {
	return Array.from(encodeLines(input, options)).join("\n");
}
/**
* Encodes a JavaScript value into TOON format as a sequence of lines.
*
* This function yields TOON lines one at a time without building the full string,
* making it suitable for streaming large outputs to files, HTTP responses, or process stdout.
*
* @param input - Any JavaScript value (objects, arrays, primitives)
* @param options - Optional encoding configuration
* @returns Iterable of TOON lines (without trailing newlines)
*
* @example
* ```ts
* // Stream to stdout
* for (const line of encodeLines({ name: 'Alice', age: 30 })) {
*   console.log(line)
* }
*
* // Collect to array
* const lines = Array.from(encodeLines(data))
*
* // Equivalent to encode()
* const toonString = Array.from(encodeLines(data, options)).join('\n')
* ```
*/
function encodeLines(input, options) {
	const normalizedValue = normalizeValue(input);
	const resolvedOptions = resolveOptions(options);
	return encodeJsonValue(resolvedOptions.replacer ? applyReplacer(normalizedValue, resolvedOptions.replacer) : normalizedValue, resolvedOptions, 0);
}
function resolveOptions(options) {
	return {
		indent: options?.indent ?? 2,
		delimiter: options?.delimiter ?? DEFAULT_DELIMITER,
		keyFolding: options?.keyFolding ?? "off",
		flattenDepth: options?.flattenDepth ?? Number.POSITIVE_INFINITY,
		replacer: options?.replacer
	};
}

//#endregion
//#region ../../node_modules/.pnpm/srvx@0.11.8/node_modules/srvx/dist/_chunks/_utils.mjs
const noColor = /* @__PURE__ */ (() => {
	const env = globalThis.process?.env ?? {};
	return env.NO_COLOR === "1" || env.TERM === "dumb";
})();
const _c = (c, r = 39) => (t) => noColor ? t : `\u001B[${c}m${t}\u001B[${r}m`;
const bold = /* @__PURE__ */ _c(1, 22);
const red = /* @__PURE__ */ _c(31);
const green = /* @__PURE__ */ _c(32);
const gray = /* @__PURE__ */ _c(90);

//#endregion
//#region ../../node_modules/.pnpm/srvx@0.11.8/node_modules/srvx/dist/_chunks/_url.mjs
function lazyInherit(target, source, sourceKey) {
	for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
		if (key === "constructor") continue;
		const targetDesc = Object.getOwnPropertyDescriptor(target, key);
		const desc = Object.getOwnPropertyDescriptor(source, key);
		let modified = false;
		if (desc.get) {
			modified = true;
			desc.get = targetDesc?.get || function() {
				return this[sourceKey][key];
			};
		}
		if (desc.set) {
			modified = true;
			desc.set = targetDesc?.set || function(value) {
				this[sourceKey][key] = value;
			};
		}
		if (!targetDesc?.value && typeof desc.value === "function") {
			modified = true;
			desc.value = function(...args) {
				return this[sourceKey][key](...args);
			};
		}
		if (modified) Object.defineProperty(target, key, desc);
	}
}
/**
* URL wrapper with fast paths to access to the following props:
*
*  - `url.pathname`
*  - `url.search`
*  - `url.searchParams`
*  - `url.protocol`
*
* **NOTES:**
*
* - It is assumed that the input URL is **already encoded** and formatted from an HTTP request and contains no hash.
* - Triggering the setters or getters on other props will deoptimize to full URL parsing.
* - Changes to `searchParams` will be discarded as we don't track them.
*/
const FastURL = /* @__PURE__ */ (() => {
	const NativeURL = globalThis.URL;
	const FastURL = class URL {
		#url;
		#href;
		#protocol;
		#host;
		#pathname;
		#search;
		#searchParams;
		#pos;
		constructor(url) {
			if (typeof url === "string") this.#href = url;
			else {
				this.#protocol = url.protocol;
				this.#host = url.host;
				this.#pathname = url.pathname;
				this.#search = url.search;
			}
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeURL;
		}
		get _url() {
			if (this.#url) return this.#url;
			this.#url = new NativeURL(this.href);
			this.#href = void 0;
			this.#protocol = void 0;
			this.#host = void 0;
			this.#pathname = void 0;
			this.#search = void 0;
			this.#searchParams = void 0;
			this.#pos = void 0;
			return this.#url;
		}
		get href() {
			if (this.#url) return this.#url.href;
			if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
			return this.#href;
		}
		#getPos() {
			if (!this.#pos) {
				const url = this.href;
				const protoIndex = url.indexOf("://");
				const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
				this.#pos = [
					protoIndex,
					pathnameIndex,
					pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex)
				];
			}
			return this.#pos;
		}
		get pathname() {
			if (this.#url) return this.#url.pathname;
			if (this.#pathname === void 0) {
				const [, pathnameIndex, queryIndex] = this.#getPos();
				if (pathnameIndex === -1) return this._url.pathname;
				this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
			}
			return this.#pathname;
		}
		get search() {
			if (this.#url) return this.#url.search;
			if (this.#search === void 0) {
				const [, pathnameIndex, queryIndex] = this.#getPos();
				if (pathnameIndex === -1) return this._url.search;
				const url = this.href;
				this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
			}
			return this.#search;
		}
		get searchParams() {
			if (this.#url) return this.#url.searchParams;
			if (!this.#searchParams) this.#searchParams = new URLSearchParams(this.search);
			return this.#searchParams;
		}
		get protocol() {
			if (this.#url) return this.#url.protocol;
			if (this.#protocol === void 0) {
				const [protocolIndex] = this.#getPos();
				if (protocolIndex === -1) return this._url.protocol;
				this.#protocol = this.href.slice(0, protocolIndex + 1);
			}
			return this.#protocol;
		}
		toString() {
			return this.href;
		}
		toJSON() {
			return this.href;
		}
	};
	lazyInherit(FastURL.prototype, NativeURL.prototype, "_url");
	Object.setPrototypeOf(FastURL.prototype, NativeURL.prototype);
	Object.setPrototypeOf(FastURL, NativeURL);
	return FastURL;
})();

//#endregion
//#region ../../node_modules/.pnpm/srvx@0.11.8/node_modules/srvx/dist/_chunks/_utils2.mjs
function resolvePortAndHost(opts) {
	const _port = opts.port ?? globalThis.process?.env.PORT ?? 3e3;
	const port = typeof _port === "number" ? _port : Number.parseInt(_port, 10);
	if (port < 0 || port > 65535) throw new RangeError(`Port must be between 0 and 65535 (got "${port}").`);
	return {
		port,
		hostname: opts.hostname ?? globalThis.process?.env.HOST
	};
}
function fmtURL(host, port, secure) {
	if (!host || !port) return;
	if (host.includes(":")) host = `[${host}]`;
	return `http${secure ? "s" : ""}://${host}:${port}/`;
}
function printListening(opts, url) {
	if (!url || (opts.silent ?? globalThis.process?.env?.TEST)) return;
	let additionalInfo = "";
	try {
		const _url = new URL(url);
		if (_url.hostname === "[::]" || _url.hostname === "0.0.0.0") {
			_url.hostname = "localhost";
			url = _url.href;
			additionalInfo = " (all interfaces)";
		}
	} catch {}
	let listeningOn = `➜ Listening on:`;
	if (globalThis.process.stdout?.isTTY) {
		listeningOn = `\u001B[32m${listeningOn}\u001B[0m`;
		url = `\u001B[36m${url}\u001B[0m`;
		additionalInfo = `\u001B[2m${additionalInfo}\u001B[0m`;
	}
	console.log(`${listeningOn} ${url}${additionalInfo}`);
}
function resolveTLSOptions(opts) {
	if (!opts.tls || opts.protocol === "http") return;
	const cert = resolveCertOrKey(opts.tls.cert);
	const key = resolveCertOrKey(opts.tls.key);
	if (!cert && !key) {
		if (opts.protocol === "https") throw new TypeError("TLS `cert` and `key` must be provided for `https` protocol.");
		return;
	}
	if (!cert || !key) throw new TypeError("TLS `cert` and `key` must be provided together.");
	return {
		cert,
		key,
		passphrase: opts.tls.passphrase
	};
}
function resolveCertOrKey(value) {
	if (!value) return;
	if (typeof value !== "string") throw new TypeError("TLS certificate and key must be strings in PEM format or file paths.");
	if (value.startsWith("-----BEGIN ")) return value;
	const { readFileSync } = process.getBuiltinModule("node:fs");
	return readFileSync(value, "utf8");
}
function createWaitUntil() {
	const promises = /* @__PURE__ */ new Set();
	return {
		waitUntil: (promise) => {
			if (typeof promise?.then !== "function") return;
			promises.add(Promise.resolve(promise).catch(console.error).finally(() => {
				promises.delete(promise);
			}));
		},
		wait: () => {
			return Promise.all(promises);
		}
	};
}

//#endregion
//#region ../../node_modules/.pnpm/srvx@0.11.8/node_modules/srvx/dist/_chunks/_plugins.mjs
function wrapFetch(server) {
	const fetchHandler = server.options.fetch;
	const middleware = server.options.middleware || [];
	return middleware.length === 0 ? fetchHandler : (request) => callMiddleware(request, fetchHandler, middleware, 0);
}
function callMiddleware(request, fetchHandler, middleware, index) {
	if (index === middleware.length) return fetchHandler(request);
	return middleware[index](request, () => callMiddleware(request, fetchHandler, middleware, index + 1));
}
const errorPlugin = (server) => {
	const errorHandler = server.options.error;
	if (!errorHandler) return;
	server.options.middleware.unshift((_req, next) => {
		try {
			const res = next();
			return res instanceof Promise ? res.catch((error) => errorHandler(error)) : res;
		} catch (error) {
			return errorHandler(error);
		}
	});
};
const gracefulShutdownPlugin = (server) => {
	const config = server.options?.gracefulShutdown;
	if (!globalThis.process?.on || config === false || config === void 0 && (process.env.CI || process.env.TEST)) return;
	const gracefulTimeout = config === true || !config?.gracefulTimeout ? Number.parseInt(process.env.SERVER_SHUTDOWN_TIMEOUT || "") || 5 : config.gracefulTimeout;
	let isClosing = false;
	let isClosed = false;
	const w = server.options.silent ? () => {} : process.stderr.write.bind(process.stderr);
	const forceClose = async () => {
		if (isClosed) return;
		w(red("\x1B[2K\rForcibly closing connections...\n"));
		isClosed = true;
		await server.close(true);
	};
	const shutdown = async () => {
		if (isClosing || isClosed) return;
		setTimeout(() => {
			globalThis.process.once("SIGINT", forceClose);
		}, 100);
		isClosing = true;
		const closePromise = server.close();
		for (let remaining = gracefulTimeout; remaining > 0; remaining--) {
			w(gray(`\rStopping server gracefully (${remaining}s)... Press ${bold("Ctrl+C")} again to force close.`));
			if (await Promise.race([closePromise.then(() => true), new Promise((r) => setTimeout(() => r(false), 1e3))])) {
				w("\x1B[2K\r" + green("Server closed successfully.\n"));
				isClosed = true;
				return;
			}
		}
		w("\x1B[2K\rGraceful shutdown timed out.\n");
		await forceClose();
	};
	for (const sig of ["SIGINT", "SIGTERM"]) globalThis.process.on(sig, shutdown);
};

//#endregion
//#region ../../node_modules/.pnpm/srvx@0.11.8/node_modules/srvx/dist/adapters/node.mjs
async function sendNodeResponse(nodeRes, webRes) {
	if (!webRes) {
		nodeRes.statusCode = 500;
		return endNodeResponse(nodeRes);
	}
	if (webRes._toNodeResponse) {
		const res = webRes._toNodeResponse();
		writeHead(nodeRes, res.status, res.statusText, res.headers);
		if (res.body) {
			if (res.body instanceof ReadableStream) return streamBody(res.body, nodeRes);
			else if (typeof res.body?.pipe === "function") {
				res.body.pipe(nodeRes);
				return new Promise((resolve) => nodeRes.on("close", resolve));
			}
			nodeRes.write(res.body);
		}
		return endNodeResponse(nodeRes);
	}
	const rawHeaders = [...webRes.headers];
	writeHead(nodeRes, webRes.status, webRes.statusText, rawHeaders);
	return webRes.body ? streamBody(webRes.body, nodeRes) : endNodeResponse(nodeRes);
}
function writeHead(nodeRes, status, statusText, rawHeaders) {
	const writeHeaders = globalThis.Deno ? rawHeaders : rawHeaders.flat();
	if (!nodeRes.headersSent) if (nodeRes.req?.httpVersion === "2.0") nodeRes.writeHead(status, writeHeaders);
	else nodeRes.writeHead(status, statusText, writeHeaders);
}
function endNodeResponse(nodeRes) {
	return new Promise((resolve) => nodeRes.end(resolve));
}
function streamBody(stream, nodeRes) {
	if (nodeRes.destroyed) {
		stream.cancel();
		return;
	}
	const reader = stream.getReader();
	function streamCancel(error) {
		reader.cancel(error).catch(() => {});
		if (error) nodeRes.destroy(error);
	}
	function streamHandle({ done, value }) {
		try {
			if (done) nodeRes.end();
			else if (nodeRes.write(value)) reader.read().then(streamHandle, streamCancel);
			else nodeRes.once("drain", () => reader.read().then(streamHandle, streamCancel));
		} catch (error) {
			streamCancel(error instanceof Error ? error : void 0);
		}
	}
	nodeRes.on("close", streamCancel);
	nodeRes.on("error", streamCancel);
	reader.read().then(streamHandle, streamCancel);
	return reader.closed.catch(streamCancel).finally(() => {
		nodeRes.off("close", streamCancel);
		nodeRes.off("error", streamCancel);
	});
}
/**
* Validates an HTTP Host header value (domain, IPv4, or bracketed IPv6) with optional port.
* Intended for preliminary filtering invalid values like "localhost:3000/foobar?"
*/
const HOST_RE = /^(\[(?:[A-Fa-f0-9:.]+)\]|(?:[A-Za-z0-9_-]+\.)*[A-Za-z0-9_-]+|(?:\d{1,3}\.){3}\d{1,3})(:\d{1,5})?$/;
var NodeRequestURL = class extends FastURL {
	#req;
	constructor({ req }) {
		const path = req.url || "/";
		if (path[0] === "/") {
			const qIndex = path.indexOf("?");
			const pathname = qIndex === -1 ? path : path?.slice(0, qIndex) || "/";
			const search = qIndex === -1 ? "" : path?.slice(qIndex) || "";
			let host = req.headers.host || req.headers[":authority"];
			if (host) {
				if (!HOST_RE.test(host)) throw new TypeError(`Invalid host header: ${host}`);
			} else if (req.socket) host = `${req.socket.localFamily === "IPv6" ? "[" + req.socket.localAddress + "]" : req.socket.localAddress}:${req.socket?.localPort || "80"}`;
			else host = "localhost";
			const protocol = req.socket?.encrypted || req.headers["x-forwarded-proto"] === "https" || req.headers[":scheme"] === "https" ? "https:" : "http:";
			super({
				protocol,
				host,
				pathname,
				search
			});
		} else super(path);
		this.#req = req;
	}
	get pathname() {
		return super.pathname;
	}
	set pathname(value) {
		this._url.pathname = value;
		this.#req.url = this._url.pathname + this._url.search;
	}
};
const NodeRequestHeaders = /* @__PURE__ */ (() => {
	const NativeHeaders = globalThis.Headers;
	class Headers {
		#req;
		#headers;
		constructor(req) {
			this.#req = req;
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeHeaders;
		}
		get _headers() {
			if (!this.#headers) {
				const headers = new NativeHeaders();
				const rawHeaders = this.#req.rawHeaders;
				const len = rawHeaders.length;
				for (let i = 0; i < len; i += 2) {
					const key = rawHeaders[i];
					if (key.charCodeAt(0) === 58) continue;
					const value = rawHeaders[i + 1];
					headers.append(key, value);
				}
				this.#headers = headers;
			}
			return this.#headers;
		}
		get(name) {
			if (this.#headers) return this.#headers.get(name);
			const value = this.#req.headers[name.toLowerCase()];
			return Array.isArray(value) ? value.join(", ") : value || null;
		}
		has(name) {
			if (this.#headers) return this.#headers.has(name);
			return name.toLowerCase() in this.#req.headers;
		}
		getSetCookie() {
			if (this.#headers) return this.#headers.getSetCookie();
			const value = this.#req.headers["set-cookie"];
			return Array.isArray(value) ? value : value ? [value] : [];
		}
		*_entries() {
			const rawHeaders = this.#req.rawHeaders;
			const len = rawHeaders.length;
			for (let i = 0; i < len; i += 2) {
				const key = rawHeaders[i];
				if (key.charCodeAt(0) === 58) continue;
				yield [key.toLowerCase(), rawHeaders[i + 1]];
			}
		}
		entries() {
			return this.#headers ? this.#headers.entries() : this._entries();
		}
		[Symbol.iterator]() {
			return this.entries();
		}
	}
	lazyInherit(Headers.prototype, NativeHeaders.prototype, "_headers");
	Object.setPrototypeOf(Headers, NativeHeaders);
	Object.setPrototypeOf(Headers.prototype, NativeHeaders.prototype);
	return Headers;
})();
const NodeRequest = /* @__PURE__ */ (() => {
	const NativeRequest = globalThis.Request;
	class Request {
		runtime;
		#req;
		#url;
		#bodyStream;
		#request;
		#headers;
		#abortController;
		constructor(ctx) {
			this.#req = ctx.req;
			this.runtime = {
				name: "node",
				node: ctx
			};
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeRequest;
		}
		get ip() {
			return this.#req.socket?.remoteAddress;
		}
		get method() {
			if (this.#request) return this.#request.method;
			return this.#req.method || "GET";
		}
		get _url() {
			return this.#url ||= new NodeRequestURL({ req: this.#req });
		}
		set _url(url) {
			this.#url = url;
		}
		get url() {
			if (this.#request) return this.#request.url;
			return this._url.href;
		}
		get headers() {
			if (this.#request) return this.#request.headers;
			return this.#headers ||= new NodeRequestHeaders(this.#req);
		}
		get _abortController() {
			if (!this.#abortController) {
				this.#abortController = new AbortController();
				const { req, res } = this.runtime.node;
				const abortController = this.#abortController;
				const abort = (err) => abortController.abort?.(err);
				if (res) res.once("close", () => {
					const reqError = req.errored;
					if (reqError) abort(reqError);
					else if (!res.writableEnded) abort();
				});
				else req.once("close", () => {
					if (!req.complete) abort();
				});
			}
			return this.#abortController;
		}
		get signal() {
			return this.#request ? this.#request.signal : this._abortController.signal;
		}
		get body() {
			if (this.#request) return this.#request.body;
			if (this.#bodyStream === void 0) {
				const method = this.method;
				this.#bodyStream = !(method === "GET" || method === "HEAD") ? Readable.toWeb(this.#req) : null;
			}
			return this.#bodyStream;
		}
		text() {
			if (this.#request) return this.#request.text();
			if (this.#bodyStream !== void 0) return this.#bodyStream ? new Response(this.#bodyStream).text() : Promise.resolve("");
			return readBody(this.#req).then((buf) => buf.toString());
		}
		json() {
			if (this.#request) return this.#request.json();
			return this.text().then((text) => JSON.parse(text));
		}
		get _request() {
			if (!this.#request) {
				const body = this.body;
				this.#request = new NativeRequest(this.url, {
					method: this.method,
					headers: this.headers,
					signal: this._abortController.signal,
					body,
					duplex: body ? "half" : void 0
				});
				this.#headers = void 0;
				this.#bodyStream = void 0;
			}
			return this.#request;
		}
	}
	lazyInherit(Request.prototype, NativeRequest.prototype, "_request");
	Object.setPrototypeOf(Request.prototype, NativeRequest.prototype);
	return Request;
})();
function readBody(req) {
	if ("rawBody" in req && Buffer.isBuffer(req.rawBody)) return Promise.resolve(req.rawBody);
	return new Promise((resolve, reject) => {
		const chunks = [];
		const onData = (chunk) => {
			chunks.push(chunk);
		};
		const onError = (err) => {
			reject(err);
		};
		const onEnd = () => {
			req.off("error", onError);
			req.off("data", onData);
			resolve(Buffer.concat(chunks));
		};
		req.on("data", onData).once("end", onEnd).once("error", onError);
	});
}
/**
* Fast Response for Node.js runtime
*
* It is faster because in most cases it doesn't create a full Response instance.
*/
const NodeResponse = /* @__PURE__ */ (() => {
	const NativeResponse = globalThis.Response;
	const STATUS_CODES = globalThis.process?.getBuiltinModule?.("node:http")?.STATUS_CODES || {};
	class NodeResponse {
		#body;
		#init;
		#headers;
		#response;
		constructor(body, init) {
			this.#body = body;
			this.#init = init;
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeResponse;
		}
		get status() {
			return this.#response?.status || this.#init?.status || 200;
		}
		get statusText() {
			return this.#response?.statusText || this.#init?.statusText || STATUS_CODES[this.status] || "";
		}
		get headers() {
			if (this.#response) return this.#response.headers;
			if (this.#headers) return this.#headers;
			const initHeaders = this.#init?.headers;
			return this.#headers = initHeaders instanceof Headers ? initHeaders : new Headers(initHeaders);
		}
		get ok() {
			if (this.#response) return this.#response.ok;
			const status = this.status;
			return status >= 200 && status < 300;
		}
		get _response() {
			if (this.#response) return this.#response;
			let body = this.#body;
			if (body && typeof body.pipe === "function" && !(body instanceof Readable)) {
				const stream = new PassThrough();
				body.pipe(stream);
				const abort = body.abort;
				if (abort) stream.once("close", () => abort());
				body = stream;
			}
			this.#response = new NativeResponse(body, this.#headers ? {
				...this.#init,
				headers: this.#headers
			} : this.#init);
			this.#init = void 0;
			this.#headers = void 0;
			this.#body = void 0;
			return this.#response;
		}
		_toNodeResponse() {
			const status = this.status;
			const statusText = this.statusText;
			let body;
			let contentType;
			let contentLength;
			if (this.#response) body = this.#response.body;
			else if (this.#body) if (this.#body instanceof ReadableStream) body = this.#body;
			else if (typeof this.#body === "string") {
				body = this.#body;
				contentType = "text/plain; charset=UTF-8";
				contentLength = Buffer.byteLength(this.#body);
			} else if (this.#body instanceof ArrayBuffer) {
				body = Buffer.from(this.#body);
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof Uint8Array) {
				body = this.#body;
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof DataView) {
				body = Buffer.from(this.#body.buffer);
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof Blob) {
				body = this.#body.stream();
				contentType = this.#body.type;
				contentLength = this.#body.size;
			} else if (typeof this.#body.pipe === "function") body = this.#body;
			else body = this._response.body;
			const headers = [];
			const initHeaders = this.#init?.headers;
			const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders).map(([k, v]) => [k.toLowerCase(), v]) : void 0);
			let hasContentTypeHeader;
			let hasContentLength;
			if (headerEntries) for (const [key, value] of headerEntries) {
				if (Array.isArray(value)) for (const v of value) headers.push([key, v]);
				else headers.push([key, value]);
				if (key === "content-type") hasContentTypeHeader = true;
				else if (key === "content-length") hasContentLength = true;
			}
			if (contentType && !hasContentTypeHeader) headers.push(["content-type", contentType]);
			if (contentLength && !hasContentLength) headers.push(["content-length", String(contentLength)]);
			this.#init = void 0;
			this.#headers = void 0;
			this.#response = void 0;
			this.#body = void 0;
			return {
				status,
				statusText,
				headers,
				body
			};
		}
	}
	lazyInherit(NodeResponse.prototype, NativeResponse.prototype, "_response");
	Object.setPrototypeOf(NodeResponse, NativeResponse);
	Object.setPrototypeOf(NodeResponse.prototype, NativeResponse.prototype);
	return NodeResponse;
})();
function serve(options) {
	return new NodeServer(options);
}
var NodeServer = class {
	runtime = "node";
	options;
	node;
	serveOptions;
	fetch;
	waitUntil;
	#isSecure;
	#listeningPromise;
	#wait;
	constructor(options) {
		this.options = {
			...options,
			middleware: [...options.middleware || []]
		};
		for (const plugin of options.plugins || []) plugin(this);
		errorPlugin(this);
		const fetchHandler = this.fetch = wrapFetch(this);
		const handler = (nodeReq, nodeRes) => {
			const request = new NodeRequest({
				req: nodeReq,
				res: nodeRes
			});
			request.waitUntil = this.#wait?.waitUntil;
			const res = fetchHandler(request);
			return res instanceof Promise ? res.then((resolvedRes) => sendNodeResponse(nodeRes, resolvedRes)) : sendNodeResponse(nodeRes, res);
		};
		this.node = {
			handler,
			server: void 0
		};
		const loader = globalThis.__srvxLoader__;
		if (loader) {
			loader({ server: this });
			return;
		}
		gracefulShutdownPlugin(this);
		this.#wait = createWaitUntil();
		this.waitUntil = this.#wait.waitUntil;
		const tls = resolveTLSOptions(this.options);
		const { port, hostname: host } = resolvePortAndHost(this.options);
		this.serveOptions = {
			port,
			host,
			exclusive: !this.options.reusePort,
			...tls ? {
				cert: tls.cert,
				key: tls.key,
				passphrase: tls.passphrase
			} : {},
			...this.options.node
		};
		let server;
		this.#isSecure = !!this.serveOptions.cert && this.options.protocol !== "http";
		if (this.options.node?.http2 ?? this.#isSecure) if (this.#isSecure) server = nodeHTTP2.createSecureServer({
			allowHTTP1: true,
			...this.serveOptions
		}, handler);
		else throw new Error("node.http2 option requires tls certificate!");
		else if (this.#isSecure) server = nodeHTTPS.createServer(this.serveOptions, handler);
		else server = nodeHTTP.createServer(this.serveOptions, handler);
		this.node.server = server;
		if (!options.manual) this.serve();
	}
	serve() {
		if (this.#listeningPromise) return Promise.resolve(this.#listeningPromise).then(() => this);
		this.#listeningPromise = new Promise((resolve) => {
			this.node.server.listen(this.serveOptions, () => {
				printListening(this.options, this.url);
				resolve();
			});
		});
	}
	get url() {
		const addr = this.node?.server?.address();
		if (!addr) return;
		return typeof addr === "string" ? addr : fmtURL(addr.address, addr.port, this.#isSecure);
	}
	ready() {
		return Promise.resolve(this.#listeningPromise).then(() => this);
	}
	async close(closeAll) {
		await Promise.all([this.#wait?.wait(), new Promise((resolve, reject) => {
			const server = this.node?.server;
			if (server && closeAll && "closeAllConnections" in server) server.closeAllConnections();
			if (!server || !server.listening) return resolve();
			server.close((error) => error ? reject(error) : resolve());
		})]);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/json-rpc-2.0@1.7.1/node_modules/json-rpc-2.0/dist/models.js
var require_models = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __extends = exports && exports.__extends || (function() {
		var extendStatics = function(d, b) {
			extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
				d.__proto__ = b;
			} || function(d, b) {
				for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
			};
			return extendStatics(d, b);
		};
		return function(d, b) {
			if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createJSONRPCNotification = exports.createJSONRPCRequest = exports.createJSONRPCSuccessResponse = exports.createJSONRPCErrorResponse = exports.JSONRPCErrorCode = exports.JSONRPCErrorException = exports.isJSONRPCResponses = exports.isJSONRPCResponse = exports.isJSONRPCRequests = exports.isJSONRPCRequest = exports.isJSONRPCID = exports.JSONRPC = void 0;
	exports.JSONRPC = "2.0";
	var isJSONRPCID = function(id) {
		return typeof id === "string" || typeof id === "number" || id === null;
	};
	exports.isJSONRPCID = isJSONRPCID;
	var isJSONRPCRequest = function(payload) {
		return payload.jsonrpc === exports.JSONRPC && payload.method !== void 0 && payload.result === void 0 && payload.error === void 0;
	};
	exports.isJSONRPCRequest = isJSONRPCRequest;
	var isJSONRPCRequests = function(payload) {
		return Array.isArray(payload) && payload.every(exports.isJSONRPCRequest);
	};
	exports.isJSONRPCRequests = isJSONRPCRequests;
	var isJSONRPCResponse = function(payload) {
		return payload.jsonrpc === exports.JSONRPC && payload.id !== void 0 && (payload.result !== void 0 || payload.error !== void 0);
	};
	exports.isJSONRPCResponse = isJSONRPCResponse;
	var isJSONRPCResponses = function(payload) {
		return Array.isArray(payload) && payload.every(exports.isJSONRPCResponse);
	};
	exports.isJSONRPCResponses = isJSONRPCResponses;
	var createJSONRPCError = function(code, message, data) {
		var error = {
			code,
			message
		};
		if (data != null) error.data = data;
		return error;
	};
	var JSONRPCErrorException = function(_super) {
		__extends(JSONRPCErrorException, _super);
		function JSONRPCErrorException(message, code, data) {
			var _this = _super.call(this, message) || this;
			Object.setPrototypeOf(_this, JSONRPCErrorException.prototype);
			_this.code = code;
			_this.data = data;
			return _this;
		}
		JSONRPCErrorException.prototype.toObject = function() {
			return createJSONRPCError(this.code, this.message, this.data);
		};
		return JSONRPCErrorException;
	}(Error);
	exports.JSONRPCErrorException = JSONRPCErrorException;
	(function(JSONRPCErrorCode) {
		JSONRPCErrorCode[JSONRPCErrorCode["ParseError"] = -32700] = "ParseError";
		JSONRPCErrorCode[JSONRPCErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
		JSONRPCErrorCode[JSONRPCErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
		JSONRPCErrorCode[JSONRPCErrorCode["InvalidParams"] = -32602] = "InvalidParams";
		JSONRPCErrorCode[JSONRPCErrorCode["InternalError"] = -32603] = "InternalError";
	})(exports.JSONRPCErrorCode || (exports.JSONRPCErrorCode = {}));
	var createJSONRPCErrorResponse = function(id, code, message, data) {
		return {
			jsonrpc: exports.JSONRPC,
			id,
			error: createJSONRPCError(code, message, data)
		};
	};
	exports.createJSONRPCErrorResponse = createJSONRPCErrorResponse;
	var createJSONRPCSuccessResponse = function(id, result) {
		return {
			jsonrpc: exports.JSONRPC,
			id,
			result: result !== null && result !== void 0 ? result : null
		};
	};
	exports.createJSONRPCSuccessResponse = createJSONRPCSuccessResponse;
	var createJSONRPCRequest = function(id, method, params) {
		return {
			jsonrpc: exports.JSONRPC,
			id,
			method,
			params
		};
	};
	exports.createJSONRPCRequest = createJSONRPCRequest;
	var createJSONRPCNotification = function(method, params) {
		return {
			jsonrpc: exports.JSONRPC,
			method,
			params
		};
	};
	exports.createJSONRPCNotification = createJSONRPCNotification;
}));

//#endregion
//#region ../../node_modules/.pnpm/json-rpc-2.0@1.7.1/node_modules/json-rpc-2.0/dist/internal.js
var require_internal = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DefaultErrorCode = void 0;
	exports.DefaultErrorCode = 0;
}));

//#endregion
//#region ../../node_modules/.pnpm/json-rpc-2.0@1.7.1/node_modules/json-rpc-2.0/dist/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __generator = exports && exports.__generator || function(thisArg, body) {
		var _ = {
			label: 0,
			sent: function() {
				if (t[0] & 1) throw t[1];
				return t[1];
			},
			trys: [],
			ops: []
		}, f, y, t, g;
		return g = {
			next: verb(0),
			"throw": verb(1),
			"return": verb(2)
		}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
			return this;
		}), g;
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while (g && (g = 0, op[0] && (_ = 0)), _) try {
				if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
				if (y = 0, t) op = [op[0] & 2, t.value];
				switch (op[0]) {
					case 0:
					case 1:
						t = op;
						break;
					case 4:
						_.label++;
						return {
							value: op[1],
							done: false
						};
					case 5:
						_.label++;
						y = op[1];
						op = [0];
						continue;
					case 7:
						op = _.ops.pop();
						_.trys.pop();
						continue;
					default:
						if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
							_ = 0;
							continue;
						}
						if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
							_.label = op[1];
							break;
						}
						if (op[0] === 6 && _.label < t[1]) {
							_.label = t[1];
							t = op;
							break;
						}
						if (t && _.label < t[2]) {
							_.label = t[2];
							_.ops.push(op);
							break;
						}
						if (t[2]) _.ops.pop();
						_.trys.pop();
						continue;
				}
				op = body.call(thisArg, _);
			} catch (e) {
				op = [6, e];
				y = 0;
			} finally {
				f = t = 0;
			}
			if (op[0] & 5) throw op[1];
			return {
				value: op[0] ? op[1] : void 0,
				done: true
			};
		}
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSONRPCClient = void 0;
	var models_1 = require_models();
	var internal_1 = require_internal();
	var JSONRPCClient = function() {
		function JSONRPCClient(_send, createID) {
			this._send = _send;
			this.createID = createID;
			this.idToResolveMap = /* @__PURE__ */ new Map();
			this.id = 0;
		}
		JSONRPCClient.prototype._createID = function() {
			if (this.createID) return this.createID();
			else return ++this.id;
		};
		JSONRPCClient.prototype.timeout = function(delay, overrideCreateJSONRPCErrorResponse) {
			var _this = this;
			if (overrideCreateJSONRPCErrorResponse === void 0) overrideCreateJSONRPCErrorResponse = function(id) {
				return (0, models_1.createJSONRPCErrorResponse)(id, internal_1.DefaultErrorCode, "Request timeout");
			};
			var timeoutRequest = function(ids, request) {
				var timeoutID = setTimeout(function() {
					ids.forEach(function(id) {
						var resolve = _this.idToResolveMap.get(id);
						if (resolve) {
							_this.idToResolveMap.delete(id);
							resolve(overrideCreateJSONRPCErrorResponse(id));
						}
					});
				}, delay);
				return request().then(function(result) {
					clearTimeout(timeoutID);
					return result;
				}, function(error) {
					clearTimeout(timeoutID);
					return Promise.reject(error);
				});
			};
			var requestAdvanced = function(request, clientParams) {
				return timeoutRequest((!Array.isArray(request) ? [request] : request).map(function(request) {
					return request.id;
				}).filter(isDefinedAndNonNull), function() {
					return _this.requestAdvanced(request, clientParams);
				});
			};
			return {
				request: function(method, params, clientParams) {
					var id = _this._createID();
					return timeoutRequest([id], function() {
						return _this.requestWithID(method, params, clientParams, id);
					});
				},
				requestAdvanced: function(request, clientParams) {
					return requestAdvanced(request, clientParams);
				}
			};
		};
		JSONRPCClient.prototype.request = function(method, params, clientParams) {
			return this.requestWithID(method, params, clientParams, this._createID());
		};
		JSONRPCClient.prototype.requestWithID = function(method, params, clientParams, id) {
			return __awaiter(this, void 0, void 0, function() {
				var request, response;
				return __generator(this, function(_a) {
					switch (_a.label) {
						case 0:
							request = (0, models_1.createJSONRPCRequest)(id, method, params);
							return [4, this.requestAdvanced(request, clientParams)];
						case 1:
							response = _a.sent();
							if (response.result !== void 0 && !response.error) return [2, response.result];
							else if (response.result === void 0 && response.error) return [2, Promise.reject(new models_1.JSONRPCErrorException(response.error.message, response.error.code, response.error.data))];
							else return [2, Promise.reject(/* @__PURE__ */ new Error("An unexpected error occurred"))];
							return [2];
					}
				});
			});
		};
		JSONRPCClient.prototype.requestAdvanced = function(requests, clientParams) {
			var _this = this;
			var areRequestsOriginallyArray = Array.isArray(requests);
			if (!Array.isArray(requests)) requests = [requests];
			var requestsWithID = requests.filter(function(request) {
				return isDefinedAndNonNull(request.id);
			});
			var promises = requestsWithID.map(function(request) {
				return new Promise(function(resolve) {
					return _this.idToResolveMap.set(request.id, resolve);
				});
			});
			var promise = Promise.all(promises).then(function(responses) {
				if (areRequestsOriginallyArray || !responses.length) return responses;
				else return responses[0];
			});
			return this.send(areRequestsOriginallyArray ? requests : requests[0], clientParams).then(function() {
				return promise;
			}, function(error) {
				requestsWithID.forEach(function(request) {
					_this.receive((0, models_1.createJSONRPCErrorResponse)(request.id, internal_1.DefaultErrorCode, error && error.message || "Failed to send a request"));
				});
				return promise;
			});
		};
		JSONRPCClient.prototype.notify = function(method, params, clientParams) {
			var request = (0, models_1.createJSONRPCNotification)(method, params);
			this.send(request, clientParams).then(void 0, function() {});
		};
		JSONRPCClient.prototype.send = function(payload, clientParams) {
			return __awaiter(this, void 0, void 0, function() {
				return __generator(this, function(_a) {
					return [2, this._send(payload, clientParams)];
				});
			});
		};
		JSONRPCClient.prototype.rejectAllPendingRequests = function(message) {
			this.idToResolveMap.forEach(function(resolve, id) {
				return resolve((0, models_1.createJSONRPCErrorResponse)(id, internal_1.DefaultErrorCode, message));
			});
			this.idToResolveMap.clear();
		};
		JSONRPCClient.prototype.receive = function(responses) {
			var _this = this;
			if (!Array.isArray(responses)) responses = [responses];
			responses.forEach(function(response) {
				var resolve = _this.idToResolveMap.get(response.id);
				if (resolve) {
					_this.idToResolveMap.delete(response.id);
					resolve(response);
				}
			});
		};
		return JSONRPCClient;
	}();
	exports.JSONRPCClient = JSONRPCClient;
	var isDefinedAndNonNull = function(value) {
		return value !== void 0 && value !== null;
	};
}));

//#endregion
//#region ../../node_modules/.pnpm/json-rpc-2.0@1.7.1/node_modules/json-rpc-2.0/dist/interfaces.js
var require_interfaces = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region ../../node_modules/.pnpm/json-rpc-2.0@1.7.1/node_modules/json-rpc-2.0/dist/server.js
var require_server = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __assign = exports && exports.__assign || function() {
		__assign = Object.assign || function(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i];
				for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
			}
			return t;
		};
		return __assign.apply(this, arguments);
	};
	var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __generator = exports && exports.__generator || function(thisArg, body) {
		var _ = {
			label: 0,
			sent: function() {
				if (t[0] & 1) throw t[1];
				return t[1];
			},
			trys: [],
			ops: []
		}, f, y, t, g;
		return g = {
			next: verb(0),
			"throw": verb(1),
			"return": verb(2)
		}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
			return this;
		}), g;
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while (g && (g = 0, op[0] && (_ = 0)), _) try {
				if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
				if (y = 0, t) op = [op[0] & 2, t.value];
				switch (op[0]) {
					case 0:
					case 1:
						t = op;
						break;
					case 4:
						_.label++;
						return {
							value: op[1],
							done: false
						};
					case 5:
						_.label++;
						y = op[1];
						op = [0];
						continue;
					case 7:
						op = _.ops.pop();
						_.trys.pop();
						continue;
					default:
						if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
							_ = 0;
							continue;
						}
						if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
							_.label = op[1];
							break;
						}
						if (op[0] === 6 && _.label < t[1]) {
							_.label = t[1];
							t = op;
							break;
						}
						if (t && _.label < t[2]) {
							_.label = t[2];
							_.ops.push(op);
							break;
						}
						if (t[2]) _.ops.pop();
						_.trys.pop();
						continue;
				}
				op = body.call(thisArg, _);
			} catch (e) {
				op = [6, e];
				y = 0;
			} finally {
				f = t = 0;
			}
			if (op[0] & 5) throw op[1];
			return {
				value: op[0] ? op[1] : void 0,
				done: true
			};
		}
	};
	var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
		if (pack || arguments.length === 2) {
			for (var i = 0, l = from.length, ar; i < l; i++) if (ar || !(i in from)) {
				if (!ar) ar = Array.prototype.slice.call(from, 0, i);
				ar[i] = from[i];
			}
		}
		return to.concat(ar || Array.prototype.slice.call(from));
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSONRPCServer = void 0;
	var models_1 = require_models();
	var internal_1 = require_internal();
	var createParseErrorResponse = function() {
		return (0, models_1.createJSONRPCErrorResponse)(null, models_1.JSONRPCErrorCode.ParseError, "Parse error");
	};
	var createInvalidRequestResponse = function(request) {
		return (0, models_1.createJSONRPCErrorResponse)((0, models_1.isJSONRPCID)(request.id) ? request.id : null, models_1.JSONRPCErrorCode.InvalidRequest, "Invalid Request");
	};
	var createMethodNotFoundResponse = function(id) {
		return (0, models_1.createJSONRPCErrorResponse)(id, models_1.JSONRPCErrorCode.MethodNotFound, "Method not found");
	};
	var JSONRPCServer = function() {
		function JSONRPCServer(options) {
			if (options === void 0) options = {};
			var _a;
			this.mapErrorToJSONRPCErrorResponse = defaultMapErrorToJSONRPCErrorResponse;
			this.nameToMethodDictionary = {};
			this.middleware = null;
			this.errorListener = (_a = options.errorListener) !== null && _a !== void 0 ? _a : console.warn;
		}
		JSONRPCServer.prototype.hasMethod = function(name) {
			return !!this.nameToMethodDictionary[name];
		};
		JSONRPCServer.prototype.addMethod = function(name, method) {
			this.addMethodAdvanced(name, this.toJSONRPCMethod(method));
		};
		JSONRPCServer.prototype.removeMethod = function(name) {
			delete this.nameToMethodDictionary[name];
		};
		JSONRPCServer.prototype.toJSONRPCMethod = function(method) {
			return function(request, serverParams) {
				var response = method(request.params, serverParams);
				return Promise.resolve(response).then(function(result) {
					return mapResultToJSONRPCResponse(request.id, result);
				});
			};
		};
		JSONRPCServer.prototype.addMethodAdvanced = function(name, method) {
			var _a;
			this.nameToMethodDictionary = __assign(__assign({}, this.nameToMethodDictionary), (_a = {}, _a[name] = method, _a));
		};
		JSONRPCServer.prototype.receiveJSON = function(json, serverParams) {
			var request = this.tryParseRequestJSON(json);
			if (request) return this.receive(request, serverParams);
			else return Promise.resolve(createParseErrorResponse());
		};
		JSONRPCServer.prototype.tryParseRequestJSON = function(json) {
			try {
				return JSON.parse(json);
			} catch (_a) {
				return null;
			}
		};
		JSONRPCServer.prototype.receive = function(request, serverParams) {
			if (Array.isArray(request)) return this.receiveMultiple(request, serverParams);
			else return this.receiveSingle(request, serverParams);
		};
		JSONRPCServer.prototype.receiveMultiple = function(requests, serverParams) {
			return __awaiter(this, void 0, void 0, function() {
				var responses;
				var _this = this;
				return __generator(this, function(_a) {
					switch (_a.label) {
						case 0: return [4, Promise.all(requests.map(function(request) {
							return _this.receiveSingle(request, serverParams);
						}))];
						case 1:
							responses = _a.sent().filter(isNonNull);
							if (responses.length === 1) return [2, responses[0]];
							else if (responses.length) return [2, responses];
							else return [2, null];
							return [2];
					}
				});
			});
		};
		JSONRPCServer.prototype.receiveSingle = function(request, serverParams) {
			return __awaiter(this, void 0, void 0, function() {
				var method, response;
				return __generator(this, function(_a) {
					switch (_a.label) {
						case 0:
							method = this.nameToMethodDictionary[request.method];
							if (!!(0, models_1.isJSONRPCRequest)(request)) return [3, 1];
							return [2, createInvalidRequestResponse(request)];
						case 1: return [4, this.callMethod(method, request, serverParams)];
						case 2:
							response = _a.sent();
							return [2, mapResponse(request, response)];
					}
				});
			});
		};
		JSONRPCServer.prototype.applyMiddleware = function() {
			var middlewares = [];
			for (var _i = 0; _i < arguments.length; _i++) middlewares[_i] = arguments[_i];
			if (this.middleware) this.middleware = this.combineMiddlewares(__spreadArray([this.middleware], middlewares, true));
			else this.middleware = this.combineMiddlewares(middlewares);
		};
		JSONRPCServer.prototype.combineMiddlewares = function(middlewares) {
			if (!middlewares.length) return null;
			else return middlewares.reduce(this.middlewareReducer);
		};
		JSONRPCServer.prototype.middlewareReducer = function(prevMiddleware, nextMiddleware) {
			return function(next, request, serverParams) {
				return prevMiddleware(function(request, serverParams) {
					return nextMiddleware(next, request, serverParams);
				}, request, serverParams);
			};
		};
		JSONRPCServer.prototype.callMethod = function(method, request, serverParams) {
			var _this = this;
			var callMethod = function(request, serverParams) {
				if (method) return method(request, serverParams);
				else if (request.id !== void 0) return Promise.resolve(createMethodNotFoundResponse(request.id));
				else return Promise.resolve(null);
			};
			var onError = function(error) {
				_this.errorListener("An unexpected error occurred while executing \"".concat(request.method, "\" JSON-RPC method:"), error);
				return Promise.resolve(_this.mapErrorToJSONRPCErrorResponseIfNecessary(request.id, error));
			};
			try {
				return (this.middleware || noopMiddleware)(callMethod, request, serverParams).then(void 0, onError);
			} catch (error) {
				return onError(error);
			}
		};
		JSONRPCServer.prototype.mapErrorToJSONRPCErrorResponseIfNecessary = function(id, error) {
			if (id !== void 0) return this.mapErrorToJSONRPCErrorResponse(id, error);
			else return null;
		};
		return JSONRPCServer;
	}();
	exports.JSONRPCServer = JSONRPCServer;
	var isNonNull = function(value) {
		return value !== null;
	};
	var noopMiddleware = function(next, request, serverParams) {
		return next(request, serverParams);
	};
	var mapResultToJSONRPCResponse = function(id, result) {
		if (id !== void 0) return (0, models_1.createJSONRPCSuccessResponse)(id, result);
		else return null;
	};
	var defaultMapErrorToJSONRPCErrorResponse = function(id, error) {
		var _a;
		var message = (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "An unexpected error occurred";
		var code = internal_1.DefaultErrorCode;
		var data;
		if (error instanceof models_1.JSONRPCErrorException) {
			code = error.code;
			data = error.data;
		}
		return (0, models_1.createJSONRPCErrorResponse)(id, code, message, data);
	};
	var mapResponse = function(request, response) {
		if (response) return response;
		else if (request.id !== void 0) return (0, models_1.createJSONRPCErrorResponse)(request.id, models_1.JSONRPCErrorCode.InternalError, "Internal error");
		else return null;
	};
}));

//#endregion
//#region ../../node_modules/.pnpm/json-rpc-2.0@1.7.1/node_modules/json-rpc-2.0/dist/server-and-client.js
var require_server_and_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __generator = exports && exports.__generator || function(thisArg, body) {
		var _ = {
			label: 0,
			sent: function() {
				if (t[0] & 1) throw t[1];
				return t[1];
			},
			trys: [],
			ops: []
		}, f, y, t, g;
		return g = {
			next: verb(0),
			"throw": verb(1),
			"return": verb(2)
		}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
			return this;
		}), g;
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while (g && (g = 0, op[0] && (_ = 0)), _) try {
				if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
				if (y = 0, t) op = [op[0] & 2, t.value];
				switch (op[0]) {
					case 0:
					case 1:
						t = op;
						break;
					case 4:
						_.label++;
						return {
							value: op[1],
							done: false
						};
					case 5:
						_.label++;
						y = op[1];
						op = [0];
						continue;
					case 7:
						op = _.ops.pop();
						_.trys.pop();
						continue;
					default:
						if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
							_ = 0;
							continue;
						}
						if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
							_.label = op[1];
							break;
						}
						if (op[0] === 6 && _.label < t[1]) {
							_.label = t[1];
							t = op;
							break;
						}
						if (t && _.label < t[2]) {
							_.label = t[2];
							_.ops.push(op);
							break;
						}
						if (t[2]) _.ops.pop();
						_.trys.pop();
						continue;
				}
				op = body.call(thisArg, _);
			} catch (e) {
				op = [6, e];
				y = 0;
			} finally {
				f = t = 0;
			}
			if (op[0] & 5) throw op[1];
			return {
				value: op[0] ? op[1] : void 0,
				done: true
			};
		}
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSONRPCServerAndClient = void 0;
	var models_1 = require_models();
	var JSONRPCServerAndClient = function() {
		function JSONRPCServerAndClient(server, client, options) {
			if (options === void 0) options = {};
			var _a;
			this.server = server;
			this.client = client;
			this.errorListener = (_a = options.errorListener) !== null && _a !== void 0 ? _a : console.warn;
		}
		JSONRPCServerAndClient.prototype.applyServerMiddleware = function() {
			var _a;
			var middlewares = [];
			for (var _i = 0; _i < arguments.length; _i++) middlewares[_i] = arguments[_i];
			(_a = this.server).applyMiddleware.apply(_a, middlewares);
		};
		JSONRPCServerAndClient.prototype.hasMethod = function(name) {
			return this.server.hasMethod(name);
		};
		JSONRPCServerAndClient.prototype.addMethod = function(name, method) {
			this.server.addMethod(name, method);
		};
		JSONRPCServerAndClient.prototype.addMethodAdvanced = function(name, method) {
			this.server.addMethodAdvanced(name, method);
		};
		JSONRPCServerAndClient.prototype.removeMethod = function(name) {
			this.server.removeMethod(name);
		};
		JSONRPCServerAndClient.prototype.timeout = function(delay) {
			return this.client.timeout(delay);
		};
		JSONRPCServerAndClient.prototype.request = function(method, params, clientParams) {
			return this.client.request(method, params, clientParams);
		};
		JSONRPCServerAndClient.prototype.requestAdvanced = function(jsonRPCRequest, clientParams) {
			return this.client.requestAdvanced(jsonRPCRequest, clientParams);
		};
		JSONRPCServerAndClient.prototype.notify = function(method, params, clientParams) {
			this.client.notify(method, params, clientParams);
		};
		JSONRPCServerAndClient.prototype.rejectAllPendingRequests = function(message) {
			this.client.rejectAllPendingRequests(message);
		};
		JSONRPCServerAndClient.prototype.receiveAndSend = function(payload, serverParams, clientParams) {
			return __awaiter(this, void 0, void 0, function() {
				var response, message;
				return __generator(this, function(_a) {
					switch (_a.label) {
						case 0:
							if (!((0, models_1.isJSONRPCResponse)(payload) || (0, models_1.isJSONRPCResponses)(payload))) return [3, 1];
							this.client.receive(payload);
							return [3, 4];
						case 1:
							if (!((0, models_1.isJSONRPCRequest)(payload) || (0, models_1.isJSONRPCRequests)(payload))) return [3, 3];
							return [4, this.server.receive(payload, serverParams)];
						case 2:
							response = _a.sent();
							if (response) return [2, this.client.send(response, clientParams)];
							return [3, 4];
						case 3:
							message = "Received an invalid JSON-RPC message";
							this.errorListener(message, payload);
							return [2, Promise.reject(new Error(message))];
						case 4: return [2];
					}
				});
			});
		};
		return JSONRPCServerAndClient;
	}();
	exports.JSONRPCServerAndClient = JSONRPCServerAndClient;
}));

//#endregion
//#region ../../node_modules/.pnpm/json-rpc-2.0@1.7.1/node_modules/json-rpc-2.0/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$2) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$2, p)) __createBinding(exports$2, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_client(), exports);
	__exportStar(require_interfaces(), exports);
	__exportStar(require_models(), exports);
	__exportStar(require_server(), exports);
	__exportStar(require_server_and_client(), exports);
}));

//#endregion
//#region ../../node_modules/.pnpm/uri-template-matcher@1.1.2/node_modules/uri-template-matcher/src/parser.js
/**
* @fileoverview URI template parser implementation without regex
*/
/**
* @typedef {import('./types.js').ParsedTemplate} ParsedTemplate
* @typedef {import('./types.js').TemplateExpression} TemplateExpression
* @typedef {import('./types.js').TemplatePart} TemplatePart
* @typedef {import('./types.js').ExpressionPart} ExpressionPart
*/
/**
* Parse a URI template string into its component parts
* @param {string} template - The URI template to parse
* @returns {ParsedTemplate} Parsed template representation
*/
function parse_template(template) {
	/** @type {TemplatePart[]} */
	const parts = [];
	let current_literal = "";
	let i = 0;
	while (i < template.length) {
		const char = template[i];
		if (char === "{") {
			if (current_literal) {
				parts.push({
					type: "literal",
					value: current_literal
				});
				current_literal = "";
			}
			const expression_start = i + 1;
			let expression_end = expression_start;
			let brace_count = 1;
			while (expression_end < template.length && brace_count > 0) {
				if (template[expression_end] === "{") brace_count++;
				else if (template[expression_end] === "}") brace_count--;
				expression_end++;
			}
			if (brace_count > 0) throw new Error(`Unclosed expression in template: ${template}`);
			const parsed_expression = parse_expression(template.slice(expression_start, expression_end - 1));
			parts.push(parsed_expression);
			i = expression_end;
		} else {
			current_literal += char;
			i++;
		}
	}
	if (current_literal) parts.push({
		type: "literal",
		value: current_literal
	});
	return {
		template,
		parts
	};
}
/**
* Parse an expression content (without braces)
* @param {string} content - Expression content
* @returns {TemplatePart} Parsed expression part
*/
function parse_expression(content) {
	if (!content.trim()) throw new Error("Empty expression");
	const first_char = content[0];
	const operators = [
		"+",
		"#",
		".",
		"/",
		";",
		"?",
		"&"
	];
	/** @type {string | undefined} */
	let operator = void 0;
	let variables_part = content;
	if (operators.includes(first_char)) {
		operator = first_char;
		variables_part = content.slice(1);
	}
	return {
		type: "expression",
		expressions: split_variables(variables_part).map(parse_variable),
		operator
	};
}
/**
* Split variables by comma, handling nested structures
* @param {string} variables - Variables string
* @returns {string[]} Array of variable strings
*/
function split_variables(variables) {
	/** @type {string[]} */
	const result = [];
	let current = "";
	let i = 0;
	while (i < variables.length) {
		const char = variables[i];
		if (char === ",") {
			if (current.trim()) {
				result.push(current.trim());
				current = "";
			}
		} else current += char;
		i++;
	}
	if (current.trim()) result.push(current.trim());
	return result;
}
/**
* Parse a single variable specification
* @param {string} variable - Variable string
* @returns {TemplateExpression} Parsed variable expression
*/
function parse_variable(variable) {
	let name = variable;
	/** @type {number | undefined} */
	let prefix = void 0;
	let explode = false;
	if (name.endsWith("*")) {
		explode = true;
		name = name.slice(0, -1);
	}
	const colon_index = name.indexOf(":");
	if (colon_index !== -1) {
		const prefix_str = name.slice(colon_index + 1);
		prefix = parseInt(prefix_str, 10);
		if (isNaN(prefix) || prefix < 0) throw new Error(`Invalid prefix length: ${prefix_str}`);
		name = name.slice(0, colon_index);
	}
	if (!name) throw new Error("Empty variable name");
	return {
		name,
		prefix,
		explode
	};
}
/**
* Match a URI against a parsed template
* @param {string} uri - URI to match
* @param {ParsedTemplate} parsed_template - Parsed template
* @returns {Record<string, string | string[]> | null} Extracted parameters or null
*/
function match_uri(uri, parsed_template) {
	/** @type {Record<string, string | string[]>} */
	const params = {};
	const result = match_parts(uri, 0, parsed_template.parts, 0, params);
	if (!result || result.uri_index !== uri.length) return null;
	return params;
}
/**
* Recursively match template parts with backtracking for consecutive variables
* @param {string} uri - URI to match
* @param {number} uri_index - Current position in URI
* @param {TemplatePart[]} parts - Template parts to match
* @param {number} part_index - Current template part index
* @param {Record<string, string | string[]>} params - Parameters object
* @returns {{ uri_index: number } | null} Match result or null
*/
function match_parts(uri, uri_index, parts, part_index, params) {
	if (part_index >= parts.length) return { uri_index };
	const part = parts[part_index];
	if (part.type === "literal") {
		if (!uri.slice(uri_index).startsWith(part.value)) return null;
		return match_parts(uri, uri_index + part.value.length, parts, part_index + 1, params);
	} else {
		const next_part = parts[part_index + 1];
		const sorted_boundaries = find_expression_boundaries(uri, uri_index, next_part).sort((a, b) => {
			if (next_part && next_part.type === "expression" && !next_part.operator) return b - a;
			return a - b;
		});
		for (const boundary of sorted_boundaries) {
			const segment = uri.slice(uri_index, boundary);
			const temp_params = { ...params };
			if (match_simple_expression(segment, part, temp_params, uri, uri_index)) {
				const rest_result = match_parts(uri, boundary, parts, part_index + 1, temp_params);
				if (rest_result) {
					Object.assign(params, temp_params);
					return rest_result;
				}
			}
		}
		return null;
	}
}
/**
* Find possible boundaries for an expression
* @param {string} uri - URI to search
* @param {number} start_index - Start position
* @param {TemplatePart | undefined} next_part - Next template part
* @returns {number[]} Array of possible boundary positions
*/
function find_expression_boundaries(uri, start_index, next_part) {
	/** @type {number[]} */
	const boundaries = [];
	if (next_part && next_part.type === "literal") {
		let search_index = start_index;
		while (search_index < uri.length) {
			const found_index = uri.indexOf(next_part.value, search_index);
			if (found_index === -1) break;
			boundaries.push(found_index);
			search_index = found_index + 1;
		}
		if (boundaries.length === 0) return [];
	} else if (next_part && next_part.type === "expression") {
		const next_expr = next_part;
		if (next_expr.operator === ".") {
			for (let i = start_index; i < uri.length; i++) if (uri[i] === ".") boundaries.push(i);
			boundaries.push(uri.length);
		} else if (next_expr.operator === "/") {
			for (let i = start_index; i < uri.length; i++) if (uri[i] === "/") boundaries.push(i);
		} else for (let i = start_index; i <= uri.length; i++) boundaries.push(i);
	} else boundaries.push(uri.length);
	return boundaries.sort((a, b) => a - b);
}
/**
* Match a simple expression (no complex operators)
* @param {string} segment - URI segment to match
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @param {string} uri - Full URI
* @param {number} uri_index - Current URI index
* @returns {boolean} Whether the match was successful
*/
function match_simple_expression(segment, expression, params, uri, uri_index) {
	if (expression.type !== "expression") return false;
	switch (expression.operator) {
		case "+": return handle_reserved_match(segment, expression, params);
		case "#": return handle_fragment_match(segment, expression, params);
		case ".": return handle_dot_match(segment, expression, params);
		case "/": return handle_path_match(segment, expression, params);
		case ";": return handle_semicolon_match(segment, expression, params);
		case "?":
		case "&": return handle_query_match(segment, expression, params);
		default: return handle_simple_match(segment, expression, params, uri, uri_index);
	}
}
/**
* Handle fragment match (# operator)
* @param {string} segment - URI segment
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @returns {boolean} Whether the match was successful
*/
function handle_fragment_match(segment, expression, params) {
	if (expression.type !== "expression") return false;
	if (!segment.startsWith("#")) {
		for (const expr of expression.expressions) params[expr.name] = "";
		return segment === "";
	}
	const fragment_content = segment.slice(1);
	if (expression.expressions.length === 1) {
		const expr = expression.expressions[0];
		let value = fragment_content;
		if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
		params[expr.name] = decodeURIComponent(value);
		return true;
	} else {
		const values = fragment_content.split(",");
		for (let i = 0; i < expression.expressions.length; i++) {
			const expr = expression.expressions[i];
			let value = values[i] || "";
			if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
			params[expr.name] = decodeURIComponent(value);
		}
		return true;
	}
}
/**
* Handle reserved string match (+ operator)
* @param {string} segment - URI segment
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @returns {boolean} Whether the match was successful
*/
function handle_reserved_match(segment, expression, params) {
	if (expression.type !== "expression") return false;
	if (expression.expressions.length === 1) {
		const expr = expression.expressions[0];
		let value = segment;
		if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
		params[expr.name] = decodeURIComponent(value);
		return true;
	} else {
		const values = segment.split(",");
		for (let i = 0; i < expression.expressions.length; i++) {
			const expr = expression.expressions[i];
			let value = values[i] || "";
			if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
			params[expr.name] = decodeURIComponent(value);
		}
		return true;
	}
}
/**
* Handle simple string match
* @param {string} segment - URI segment
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @param {string} uri - Full URI
* @param {number} uri_index - Current URI index
* @returns {boolean} Whether the match was successful
*/
function handle_simple_match(segment, expression, params, uri, uri_index) {
	if (expression.type !== "expression") return false;
	if (expression.expressions.length === 1) {
		const expr = expression.expressions[0];
		let value = segment;
		if (value.includes("/")) return false;
		if (value === "" && uri_index + segment.length === uri.length && uri.endsWith("/")) return false;
		if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
		params[expr.name] = decodeURIComponent(value);
		return true;
	} else {
		const values = segment.split(",");
		for (let i = 0; i < expression.expressions.length; i++) {
			const expr = expression.expressions[i];
			let value = values[i] || "";
			if (value.includes("/")) return false;
			if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
			params[expr.name] = decodeURIComponent(value);
		}
		return true;
	}
}
/**
* Handle dot notation match
* @param {string} segment - URI segment
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @returns {boolean} Whether the match was successful
*/
function handle_dot_match(segment, expression, params) {
	if (expression.type !== "expression") return false;
	if (segment === "") {
		for (const expr of expression.expressions) params[expr.name] = "";
		return true;
	}
	const clean_segment = segment.startsWith(".") ? segment.slice(1) : segment;
	if (expression.expressions.length === 1) {
		const expr = expression.expressions[0];
		if (expr.explode) {
			const values = clean_segment.split(".");
			params[expr.name] = values.map((v) => decodeURIComponent(v));
		} else params[expr.name] = decodeURIComponent(clean_segment);
		return true;
	} else {
		const values = clean_segment.split(".");
		for (let i = 0; i < expression.expressions.length; i++) {
			const expr = expression.expressions[i];
			let value = values[i] || "";
			if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
			params[expr.name] = decodeURIComponent(value);
		}
		return true;
	}
}
/**
* Handle path match
* @param {string} segment - URI segment
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @returns {boolean} Whether the match was successful
*/
function handle_path_match(segment, expression, params) {
	if (expression.type !== "expression") return false;
	const clean_segment = segment.startsWith("/") ? segment.slice(1) : segment;
	if (expression.expressions.length === 1) {
		const expr = expression.expressions[0];
		params[expr.name] = decodeURIComponent(clean_segment);
		return true;
	} else {
		const values = clean_segment.split(",");
		for (let i = 0; i < expression.expressions.length; i++) {
			const expr = expression.expressions[i];
			let value = values[i] || "";
			if (expr.prefix && value.length > expr.prefix) value = value.slice(0, expr.prefix);
			params[expr.name] = decodeURIComponent(value);
		}
		return true;
	}
}
/**
* Handle semicolon match
* @param {string} segment - URI segment
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @returns {boolean} Whether the match was successful
*/
function handle_semicolon_match(segment, expression, params) {
	if (expression.type !== "expression") return false;
	const parts = segment.split(";").filter((p) => p);
	for (const part of parts) {
		const eq_index = part.indexOf("=");
		if (eq_index !== -1) {
			const key = part.slice(0, eq_index);
			const value = part.slice(eq_index + 1);
			const expr = expression.expressions.find((e) => e.name === key);
			if (expr) params[expr.name] = decodeURIComponent(value);
		}
	}
	return true;
}
/**
* Handle query match
* @param {string} segment - URI segment
* @param {TemplatePart} expression - Expression part
* @param {Record<string, string | string[]>} params - Parameters object
* @returns {boolean} Whether the match was successful
*/
function handle_query_match(segment, expression, params) {
	if (expression.type !== "expression") return false;
	const clean_segment = segment.replace(/^[?&]/, "");
	if (expression.expressions.length === 1) {
		const expr = expression.expressions[0];
		if (expr.explode) {
			const values = clean_segment.split("&");
			params[expr.name] = values.map((v) => decodeURIComponent(v));
		} else {
			const parts = clean_segment.split("&");
			for (const part of parts) {
				const eq_index = part.indexOf("=");
				if (eq_index !== -1) {
					const key = part.slice(0, eq_index);
					const value = part.slice(eq_index + 1);
					if (key === expr.name) params[expr.name] = decodeURIComponent(value);
				}
			}
		}
	} else {
		const parts = clean_segment.split("&");
		for (const part of parts) {
			const eq_index = part.indexOf("=");
			if (eq_index !== -1) {
				const key = part.slice(0, eq_index);
				const value = part.slice(eq_index + 1);
				const expr = expression.expressions.find((e) => e.name === key);
				if (expr) params[expr.name] = decodeURIComponent(value);
			}
		}
	}
	return true;
}

//#endregion
//#region ../../node_modules/.pnpm/uri-template-matcher@1.1.2/node_modules/uri-template-matcher/src/matcher.js
/**
* @fileoverview Main UriTemplateMatcher class
*/
/**
* @typedef {import('./types.js').MatchResult} MatchResult
* @typedef {import('./types.js').ParsedTemplate} ParsedTemplate
*/
/**
* URI Template Matcher class for registering and matching URI templates
*/
var UriTemplateMatcher = class {
	/**
	* Create a new UriTemplateMatcher instance
	*/
	constructor() {
		/** @type {ParsedTemplate[]} */
		this.templates = [];
	}
	/**
	* Add a URI template to the matcher
	* @param {string} template - The URI template string to add
	* @throws {Error} If template is invalid
	*/
	add(template) {
		if (typeof template !== "string") throw new Error("Template must be a string");
		if (template !== "" && template.trim() === "") throw new Error("Template cannot be empty");
		try {
			const parsed = parse_template(template);
			this.templates.push(parsed);
		} catch (error) {
			throw new Error(`Invalid template: ${template} - ${error instanceof Error ? error.message : String(error)}`);
		}
	}
	/**
	* Match a URI against all registered templates
	* @param {string} uri - The URI to match
	* @returns {MatchResult | null} Match result or null if no match found
	* @throws {Error} If URI is invalid
	*/
	match(uri) {
		if (typeof uri !== "string") throw new Error("URI must be a string");
		for (const template of this.templates) {
			const params = match_uri(uri, template);
			if (params !== null) return {
				template: template.template,
				params
			};
		}
		return null;
	}
	/**
	* Clear all registered templates
	*/
	clear() {
		this.templates = [];
	}
	/**
	* Get all registered template strings
	* @returns {string[]} Array of template strings
	*/
	all() {
		return this.templates.map((t) => t.template);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/tmcp@1.19.2_typescript@5.9.3/node_modules/tmcp/src/validation/index.js
var import_dist = require_dist();
const JSONRPC_VERSION = "2.0";
var McpError = class extends Error {
	/**
	* @param {number} code
	* @param {string} message
	*/
	constructor(code, message) {
		super(`MCP error ${code}: ${message}`);
		this.name = "McpError";
	}
};
/**
* A progress token, used to associate progress notifications with the original request.
*/
const ProgressTokenSchema = union([string(), pipe(number(), integer())]);
/**
* An opaque token used to represent a cursor for pagination.
*/
const CursorSchema = string();
const RequestMetaSchema = looseObject({ progressToken: optional(ProgressTokenSchema) });
const BaseRequestParamsSchema = looseObject({ _meta: optional(RequestMetaSchema) });
const RequestSchema = object({
	method: string(),
	params: optional(BaseRequestParamsSchema)
});
const BaseNotificationParamsSchema = looseObject({ _meta: optional(looseObject({})) });
const NotificationSchema = object({
	method: string(),
	params: optional(BaseNotificationParamsSchema)
});
const ResultSchema = looseObject({ _meta: optional(looseObject({})) });
/**
* A uniquely identifying ID for a request in JSON-RPC.
*/
const RequestIdSchema = union([string(), pipe(number(), integer())]);
/**
* A request that expects a response.
*/
const JSONRPCRequestSchema = object({
	jsonrpc: literal(JSONRPC_VERSION),
	id: RequestIdSchema,
	...RequestSchema.entries
});
/**
* A notification which does not expect a response.
*/
const JSONRPCNotificationSchema = object({
	jsonrpc: literal(JSONRPC_VERSION),
	...NotificationSchema.entries
});
/**
* A successful (non-error) response to a request.
*/
const JSONRPCResponseSchema = strictObject({
	jsonrpc: literal(JSONRPC_VERSION),
	id: RequestIdSchema,
	result: ResultSchema
});
/**
* A response to a request that indicates an error occurred.
*/
const JSONRPCErrorSchema = strictObject({
	jsonrpc: literal(JSONRPC_VERSION),
	id: RequestIdSchema,
	error: object({
		code: pipe(number(), integer()),
		message: string(),
		data: optional(unknown())
	})
});
const JSONRPCMessageSchema = union([
	JSONRPCRequestSchema,
	JSONRPCNotificationSchema,
	JSONRPCResponseSchema,
	JSONRPCErrorSchema
]);
/**
* A response that indicates success but carries no data.
*/
const EmptyResultSchema = strictObject({ ...ResultSchema.entries });
/**
* This notification can be sent by either side to indicate that it is cancelling a previously-issued request.
*
* The request SHOULD still be in-flight, but due to communication latency, it is always possible that this notification MAY arrive after the request has already finished.
*
* This notification indicates that the result will be unused, so any associated processing SHOULD cease.
*
* A client MUST NOT attempt to cancel its `initialize` request.
*/
const CancelledNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/cancelled"),
	params: object({
		...BaseNotificationParamsSchema.entries,
		requestId: RequestIdSchema,
		reason: optional(string())
	})
});
/**
* Base metadata interface for common properties across resources, tools, prompts, and implementations.
*/
const BaseMetadataSchema = object({
	name: string(),
	title: optional(string())
});
/**
* Icon schema for use in tools, prompts, resources, and implementations.
*/
const IconSchema = object({
	src: string(),
	mimeType: optional(string()),
	sizes: optional(array(string()))
});
const IconsSchema = object({ icons: optional(array(IconSchema)) });
/**
* Describes the name and version of an MCP implementation.
*/
const ImplementationSchema = object({
	...BaseMetadataSchema.entries,
	version: string(),
	websiteUrl: optional(string()),
	...IconsSchema.entries
});
/**
* Capabilities a client may support. Known capabilities are defined here, in this schema, but this is not a closed set: any client can define its own, additional capabilities.
*/
const ClientCapabilitiesSchema = object({
	experimental: optional(object({})),
	sampling: optional(object({})),
	elicitation: optional(object({})),
	roots: optional(object({ listChanged: optional(boolean()) }))
});
const InitializeRequestParamsSchema = object({
	...BaseRequestParamsSchema.entries,
	protocolVersion: string(),
	capabilities: ClientCapabilitiesSchema,
	clientInfo: ImplementationSchema
});
/**
* This request is sent from the client to the server when it first connects, asking it to begin initialization.
*/
const InitializeRequestSchema = object({
	...RequestSchema.entries,
	method: literal("initialize"),
	params: InitializeRequestParamsSchema
});
/**
* Capabilities that a server may support. Known capabilities are defined here, in this schema, but this is not a closed set: any server can define its own, additional capabilities.
*/
const ServerCapabilitiesSchema = object({
	experimental: optional(object({})),
	logging: optional(object({})),
	completions: optional(object({})),
	prompts: optional(object({ listChanged: optional(boolean()) })),
	resources: optional(object({
		subscribe: optional(boolean()),
		listChanged: optional(boolean())
	})),
	tools: optional(object({ listChanged: optional(boolean()) }))
});
/**
* After receiving an initialize request from the client, the server sends this response.
*/
const InitializeResultSchema = object({
	...ResultSchema.entries,
	protocolVersion: string(),
	capabilities: ServerCapabilitiesSchema,
	serverInfo: ImplementationSchema,
	instructions: optional(string())
});
/**
* This notification is sent from the client to the server after initialization has finished.
*/
const InitializedNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/initialized")
});
/**
* A ping, issued by either the server or the client, to check that the other party is still alive. The receiver must promptly respond, or else may be disconnected.
*/
const PingRequestSchema = object({
	...RequestSchema.entries,
	method: literal("ping")
});
const ProgressSchema = object({
	progress: number(),
	total: optional(number()),
	message: optional(string())
});
/**
* An out-of-band notification used to inform the receiver of a progress update for a long-running request.
*/
const ProgressNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/progress"),
	params: object({
		...BaseNotificationParamsSchema.entries,
		...ProgressSchema.entries,
		progressToken: ProgressTokenSchema
	})
});
const PaginatedRequestSchema = object({
	...RequestSchema.entries,
	params: optional(object({
		...BaseRequestParamsSchema.entries,
		cursor: optional(CursorSchema)
	}))
});
const PaginatedResultSchema = object({
	...ResultSchema.entries,
	nextCursor: optional(CursorSchema)
});
/**
* The contents of a specific resource or sub-resource.
*/
const ResourceContentsSchema = object({
	uri: string(),
	mimeType: optional(string()),
	_meta: optional(looseObject({}))
});
const TextResourceContentsSchema = object({
	...ResourceContentsSchema.entries,
	text: string()
});
const BlobResourceContentsSchema = object({
	...ResourceContentsSchema.entries,
	blob: pipe(string(), base64())
});
/**
* A known resource that the server is capable of reading.
*/
const ResourceSchema = object({
	...BaseMetadataSchema.entries,
	uri: string(),
	description: optional(string()),
	mimeType: optional(string()),
	_meta: optional(looseObject({})),
	...IconsSchema.entries
});
/**
* A template description for resources available on the server.
*/
const ResourceTemplateSchema = object({
	...BaseMetadataSchema.entries,
	uriTemplate: string(),
	description: optional(string()),
	mimeType: optional(string()),
	_meta: optional(looseObject({})),
	...IconsSchema.entries
});
/**
* Sent from the client to request a list of resources the server has.
*/
const ListResourcesRequestSchema = object({
	...PaginatedRequestSchema.entries,
	method: literal("resources/list")
});
/**
* The server's response to a resources/list request from the client.
*/
const ListResourcesResultSchema = object({
	...PaginatedResultSchema.entries,
	resources: array(ResourceSchema)
});
/**
* Sent from the client to request a list of resource templates the server has.
*/
const ListResourceTemplatesRequestSchema = object({
	...PaginatedRequestSchema.entries,
	method: literal("resources/templates/list")
});
/**
* The server's response to a resources/templates/list request from the client.
*/
const ListResourceTemplatesResultSchema = object({
	...PaginatedResultSchema.entries,
	resourceTemplates: array(ResourceTemplateSchema)
});
/**
* Sent from the client to the server, to read a specific resource URI.
*/
const ReadResourceRequestSchema = object({
	...RequestSchema.entries,
	method: literal("resources/read"),
	params: object({
		...BaseRequestParamsSchema.entries,
		uri: string()
	})
});
/**
* The server's response to a resources/read request from the client.
*/
const ReadResourceResultSchema = object({
	...ResultSchema.entries,
	contents: array(union([TextResourceContentsSchema, BlobResourceContentsSchema]))
});
/**
* An optional notification from the server to the client, informing it that the list of resources it can read from has changed. This may be issued by servers without any previous subscription from the client.
*/
const ResourceListChangedNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/resources/list_changed")
});
/**
* Sent from the client to request resources/updated notifications from the server whenever a particular resource changes.
*/
const SubscribeRequestSchema = object({
	...RequestSchema.entries,
	method: literal("resources/subscribe"),
	params: object({
		...BaseRequestParamsSchema.entries,
		uri: string()
	})
});
/**
* Sent from the client to request cancellation of resources/updated notifications from the server. This should follow a previous resources/subscribe request.
*/
const UnsubscribeRequestSchema = object({
	...RequestSchema.entries,
	method: literal("resources/unsubscribe"),
	params: object({
		...BaseRequestParamsSchema.entries,
		uri: string()
	})
});
/**
* A notification from the server to the client, informing it that a resource has changed and may need to be read again. This should only be sent if the client previously sent a resources/subscribe request.
*/
const ResourceUpdatedNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/resources/updated"),
	params: object({
		...BaseNotificationParamsSchema.entries,
		uri: string()
	})
});
/**
* Describes an argument that a prompt can accept.
*/
const PromptArgumentSchema = object({
	name: string(),
	description: optional(string()),
	required: optional(boolean())
});
/**
* A prompt or prompt template that the server offers.
*/
const PromptSchema = object({
	...BaseMetadataSchema.entries,
	description: optional(string()),
	arguments: optional(array(PromptArgumentSchema)),
	_meta: optional(looseObject({})),
	...IconsSchema.entries
});
/**
* Sent from the client to request a list of prompts and prompt templates the server has.
*/
const ListPromptsRequestSchema = object({
	...PaginatedRequestSchema.entries,
	method: literal("prompts/list")
});
/**
* The server's response to a prompts/list request from the client.
*/
const ListPromptsResultSchema = object({
	...PaginatedResultSchema.entries,
	prompts: array(PromptSchema)
});
/**
* Used by the client to get a prompt provided by the server.
*/
const GetPromptRequestSchema = object({
	...RequestSchema.entries,
	method: literal("prompts/get"),
	params: object({
		...BaseRequestParamsSchema.entries,
		name: string(),
		arguments: optional(record(string(), string()))
	})
});
/**
* Text provided to or from an LLM.
*/
const TextContentSchema = object({
	type: literal("text"),
	text: string(),
	_meta: optional(looseObject({}))
});
/**
* An image provided to or from an LLM.
*/
const ImageContentSchema = object({
	type: literal("image"),
	data: pipe(string(), base64()),
	mimeType: string(),
	_meta: optional(looseObject({}))
});
/**
* An Audio provided to or from an LLM.
*/
const AudioContentSchema = object({
	type: literal("audio"),
	data: pipe(string(), base64()),
	mimeType: string(),
	_meta: optional(looseObject({}))
});
/**
* The contents of a resource, embedded into a prompt or tool call result.
*/
const EmbeddedResourceSchema = object({
	type: literal("resource"),
	resource: union([TextResourceContentsSchema, BlobResourceContentsSchema]),
	_meta: optional(looseObject({}))
});
/**
* A resource that the server is capable of reading, included in a prompt or tool call result.
*
* Note: resource links returned by tools are not guaranteed to appear in the results of `resources/list` requests.
*/
const ResourceLinkSchema = object({
	...ResourceSchema.entries,
	type: literal("resource_link")
});
/**
* A content block that can be used in prompts and tool results.
*/
const ContentBlockSchema = union([
	TextContentSchema,
	ImageContentSchema,
	AudioContentSchema,
	ResourceLinkSchema,
	EmbeddedResourceSchema
]);
/**
* Describes a message returned as part of a prompt.
*/
const PromptMessageSchema = object({
	role: picklist(["user", "assistant"]),
	content: ContentBlockSchema
});
/**
* The server's response to a prompts/get request from the client.
*/
const GetPromptResultSchema = object({
	...ResultSchema.entries,
	description: optional(string()),
	messages: array(PromptMessageSchema)
});
/**
* An optional notification from the server to the client, informing it that the list of prompts it offers has changed. This may be issued by servers without any previous subscription from the client.
*/
const PromptListChangedNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/prompts/list_changed")
});
/**
* Additional properties describing a Tool to clients.
*
* NOTE: all properties in ToolAnnotations are **hints**.
* They are not guaranteed to provide a faithful description of
* tool behavior (including descriptive properties like `title`).
*
* Clients should never make tool use decisions based on ToolAnnotations
* received from untrusted servers.
*/
const ToolAnnotationsSchema = object({
	title: optional(string()),
	readOnlyHint: optional(boolean()),
	destructiveHint: optional(boolean()),
	idempotentHint: optional(boolean()),
	openWorldHint: optional(boolean())
});
/**
* Definition for a tool the client can call.
*/
const ToolSchema = object({
	...BaseMetadataSchema.entries,
	description: optional(string()),
	inputSchema: object({
		type: literal("object"),
		properties: optional(object({})),
		required: optional(array(string()))
	}),
	outputSchema: optional(object({
		type: literal("object"),
		properties: optional(object({})),
		required: optional(array(string()))
	})),
	annotations: optional(ToolAnnotationsSchema),
	_meta: optional(looseObject({})),
	...IconsSchema.entries
});
/**
* Sent from the client to request a list of tools the server has.
*/
const ListToolsRequestSchema = object({
	...PaginatedRequestSchema.entries,
	method: literal("tools/list")
});
/**
* The server's response to a tools/list request from the client.
*/
const ListToolsResultSchema = object({
	...PaginatedResultSchema.entries,
	tools: array(ToolSchema)
});
/**
* The server's response to a tool call.
*/
const CallToolResultSchema = object({
	...ResultSchema.entries,
	content: optional(array(ContentBlockSchema), []),
	structuredContent: optional(looseObject({})),
	isError: optional(boolean())
});
/**
* CallToolResultSchema extended with backwards compatibility to protocol version 2024-10-07.
*/
const CompatibilityCallToolResultSchema = union([CallToolResultSchema, object({
	...ResultSchema.entries,
	toolResult: unknown()
})]);
/**
* Used by the client to invoke a tool provided by the server.
*/
const CallToolRequestSchema = object({
	...RequestSchema.entries,
	method: literal("tools/call"),
	params: object({
		...BaseRequestParamsSchema.entries,
		name: string(),
		arguments: optional(record(string(), unknown()))
	})
});
/**
* An optional notification from the server to the client, informing it that the list of tools it offers has changed. This may be issued by servers without any previous subscription from the client.
*/
const ToolListChangedNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/tools/list_changed")
});
/**
* The severity of a log message.
*/
const LoggingLevelSchema = picklist([
	"debug",
	"info",
	"notice",
	"warning",
	"error",
	"critical",
	"alert",
	"emergency"
]);
/**
* A request from the client to the server, to enable or adjust logging.
*/
const SetLevelRequestSchema = object({
	...RequestSchema.entries,
	method: literal("logging/setLevel"),
	params: object({
		...BaseRequestParamsSchema.entries,
		level: LoggingLevelSchema
	})
});
/**
* Notification of a log message passed from server to client. If no logging/setLevel request has been sent from the client, the server MAY decide which messages to send automatically.
*/
const LoggingMessageNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/message"),
	params: object({
		...BaseNotificationParamsSchema.entries,
		level: LoggingLevelSchema,
		logger: optional(string()),
		data: unknown()
	})
});
/**
* Hints to use for model selection.
*/
const ModelHintSchema = object({ name: optional(string()) });
/**
* The server's preferences for model selection, requested of the client during sampling.
*/
const ModelPreferencesSchema = object({
	hints: optional(array(ModelHintSchema)),
	costPriority: optional(pipe(number(), minValue(0), maxValue(1))),
	speedPriority: optional(pipe(number(), minValue(0), maxValue(1))),
	intelligencePriority: optional(pipe(number(), minValue(0), maxValue(1)))
});
/**
* Describes a message issued to or received from an LLM API.
*/
const SamplingMessageSchema = object({
	role: picklist(["user", "assistant"]),
	content: union([
		TextContentSchema,
		ImageContentSchema,
		AudioContentSchema
	])
});
const CreateMessageRequestParamsSchema = object({
	...BaseRequestParamsSchema.entries,
	messages: array(SamplingMessageSchema),
	systemPrompt: optional(string()),
	includeContext: optional(picklist([
		"none",
		"thisServer",
		"allServers"
	])),
	temperature: optional(number()),
	maxTokens: pipe(number(), integer()),
	stopSequences: optional(array(string())),
	metadata: optional(object({})),
	modelPreferences: optional(ModelPreferencesSchema)
});
/**
* A request from the server to sample an LLM via the client. The client has full discretion over which model to select. The client should also inform the user before beginning sampling, to allow them to inspect the request (human in the loop) and decide whether to approve it.
*/
const CreateMessageRequestSchema = object({
	...RequestSchema.entries,
	method: literal("sampling/createMessage"),
	params: CreateMessageRequestParamsSchema
});
/**
* The client's response to a sampling/create_message request from the server. The client should inform the user before returning the sampled message, to allow them to inspect the response (human in the loop) and decide whether to allow the server to see it.
*/
const CreateMessageResultSchema = object({
	...ResultSchema.entries,
	model: string(),
	stopReason: optional(union([picklist([
		"endTurn",
		"stopSequence",
		"maxTokens"
	]), string()])),
	role: picklist(["user", "assistant"]),
	content: variant("type", [
		TextContentSchema,
		ImageContentSchema,
		AudioContentSchema
	])
});
/**
* Primitive schema definition for boolean fields.
*/
const BooleanSchemaSchema = object({
	type: literal("boolean"),
	title: optional(string()),
	description: optional(string()),
	default: optional(boolean())
});
/**
* Primitive schema definition for string fields.
*/
const StringSchemaSchema = object({
	type: literal("string"),
	title: optional(string()),
	description: optional(string()),
	minLength: optional(number()),
	maxLength: optional(number()),
	format: optional(picklist([
		"email",
		"uri",
		"date",
		"date-time"
	]))
});
/**
* Primitive schema definition for number fields.
*/
const NumberSchemaSchema = object({
	type: picklist(["number", "integer"]),
	title: optional(string()),
	description: optional(string()),
	minimum: optional(number()),
	maximum: optional(number())
});
/**
* Primitive schema definition for enum fields.
*/
const EnumSchemaSchema = object({
	type: literal("string"),
	title: optional(string()),
	description: optional(string()),
	enum: array(string()),
	enumNames: optional(array(string()))
});
/**
* Union of all primitive schema definitions.
*/
const PrimitiveSchemaDefinitionSchema = union([
	BooleanSchemaSchema,
	StringSchemaSchema,
	NumberSchemaSchema,
	EnumSchemaSchema
]);
/**
* A request from the server to elicit user input via the client.
* The client should present the message and form fields to the user.
*/
const ElicitRequestSchema = object({
	...RequestSchema.entries,
	method: literal("elicitation/create"),
	params: object({
		...BaseRequestParamsSchema.entries,
		message: string(),
		requestedSchema: object({
			type: literal("object"),
			properties: record(string(), PrimitiveSchemaDefinitionSchema),
			required: optional(array(string()))
		})
	})
});
/**
* The client's response to an elicitation/create request from the server.
*/
const ElicitResultSchema = object({
	...ResultSchema.entries,
	action: picklist([
		"accept",
		"decline",
		"cancel"
	]),
	content: optional(record(string(), unknown()))
});
/**
* A reference to a resource or resource template definition.
*/
const ResourceTemplateReferenceSchema = object({
	type: literal("ref/resource"),
	uri: string()
});
/**
* Identifies a prompt.
*/
const PromptReferenceSchema = object({
	type: literal("ref/prompt"),
	name: string()
});
/**
* A request from the client to the server, to ask for completion options.
*/
const CompleteRequestSchema = object({
	...RequestSchema.entries,
	method: literal("completion/complete"),
	params: object({
		...BaseRequestParamsSchema.entries,
		ref: union([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
		argument: object({
			name: string(),
			value: string()
		}),
		context: optional(object({ arguments: optional(record(string(), string())) }))
	})
});
/**
* The server's response to a completion/complete request
*/
const CompleteResultSchema = object({
	...ResultSchema.entries,
	completion: object({
		values: pipe(array(string()), maxLength(100)),
		total: optional(pipe(number(), integer())),
		hasMore: optional(boolean())
	})
});
/**
* Represents a root directory or file that the server can operate on.
*/
const RootSchema = object({
	uri: pipe(string(), startsWith("file://")),
	name: optional(string()),
	_meta: optional(looseObject({}))
});
/**
* Sent from the server to request a list of root URIs from the client.
*/
const ListRootsRequestSchema = object({
	...RequestSchema.entries,
	method: literal("roots/list")
});
/**
* The client's response to a roots/list request from the server.
*/
const ListRootsResultSchema = object({
	...ResultSchema.entries,
	roots: array(RootSchema)
});
/**
* A notification from the client to the server, informing it that the list of roots has changed.
*/
const RootsListChangedNotificationSchema = object({
	...NotificationSchema.entries,
	method: literal("notifications/roots/list_changed")
});
const ClientRequestSchema = union([
	PingRequestSchema,
	InitializeRequestSchema,
	CompleteRequestSchema,
	SetLevelRequestSchema,
	GetPromptRequestSchema,
	ListPromptsRequestSchema,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	ReadResourceRequestSchema,
	SubscribeRequestSchema,
	UnsubscribeRequestSchema,
	CallToolRequestSchema,
	ListToolsRequestSchema
]);
const ClientNotificationSchema = union([
	CancelledNotificationSchema,
	ProgressNotificationSchema,
	InitializedNotificationSchema,
	RootsListChangedNotificationSchema
]);
const ClientResultSchema = union([
	EmptyResultSchema,
	CreateMessageResultSchema,
	ElicitResultSchema,
	ListRootsResultSchema
]);
const ServerRequestSchema = union([
	PingRequestSchema,
	CreateMessageRequestSchema,
	ElicitRequestSchema,
	ListRootsRequestSchema
]);
const ServerNotificationSchema = union([
	CancelledNotificationSchema,
	ProgressNotificationSchema,
	LoggingMessageNotificationSchema,
	ResourceUpdatedNotificationSchema,
	ResourceListChangedNotificationSchema,
	ToolListChangedNotificationSchema,
	PromptListChangedNotificationSchema
]);
const ServerResultSchema = union([
	EmptyResultSchema,
	InitializeResultSchema,
	CompleteResultSchema,
	GetPromptResultSchema,
	ListPromptsResultSchema,
	ListResourcesResultSchema,
	ListResourceTemplatesResultSchema,
	ReadResourceResultSchema,
	CallToolResultSchema,
	ListToolsResultSchema
]);
/**
* @typedef {v.InferInput<typeof IconsSchema>} Icons
*/
/**
* @typedef {v.InferInput<typeof ClientCapabilitiesSchema>} ClientCapabilities
*/
/**
* @typedef {v.InferInput<typeof ServerCapabilitiesSchema>} ServerCapabilities
*/
/**
* @typedef {v.InferInput<typeof ImplementationSchema>} ClientInfo
*/
/**
* @typedef {v.InferInput<typeof ImplementationSchema> & { description?: string }} ServerInfo
*/
/**
* @typedef {v.InferInput<typeof InitializeRequestParamsSchema>} InitializeRequestParams
*/
/**
* @template {Record<string, unknown> | undefined} TStructuredContent
* @typedef {Omit<v.InferInput<typeof CallToolResultSchema>, "structuredContent" | "isError"> & (undefined extends TStructuredContent ? { structuredContent?: undefined, isError?: boolean } : ({ structuredContent: TStructuredContent, isError?: false } | { isError: true, structuredContent?: TStructuredContent }))} CallToolResult
*/
/**
* @typedef {v.InferInput<typeof ReadResourceResultSchema>} ReadResourceResult
*/
/**
* @typedef {v.InferInput<typeof GetPromptResultSchema>} GetPromptResult
*/
/**
* @typedef {v.InferInput<typeof CompleteResultSchema>} CompleteResult
*/
/**
* @typedef {v.InferInput<typeof CreateMessageRequestParamsSchema>} CreateMessageRequestParams
*/
/**
* @typedef {v.InferInput<typeof CreateMessageResultSchema>} CreateMessageResult
*/
/**
* @typedef {v.InferInput<typeof ModelPreferencesSchema>} ModelPreferences
*/
/**
* @typedef {v.InferInput<typeof SamplingMessageSchema>} SamplingMessage
*/
/**
* @typedef {v.InferInput<typeof ModelHintSchema>} ModelHint
*/
/**
* @typedef {v.InferInput<typeof ResourceSchema>} Resource
*/
/**
* @typedef {v.InferInput<typeof JSONRPCRequestSchema>} JSONRPCRequest
*/
/**
* @typedef {v.InferInput<typeof JSONRPCMessageSchema>} JSONRPCMessage
*/
/**
* @typedef {v.InferInput<typeof JSONRPCResponseSchema>} JSONRPCResponse
*/
/**
* @typedef {v.InferInput<typeof LoggingLevelSchema>} LoggingLevel
*/
/**
* @typedef {v.InferInput<typeof ToolAnnotationsSchema>} ToolAnnotations
*/
/**
* @typedef {v.InferInput<typeof ElicitResultSchema>} ElicitResult
*/
/**
* @typedef {v.InferInput<typeof InitializeResultSchema>} InitializeResult
*/
/**
* @typedef {v.InferInput<typeof ListToolsResultSchema>} ListToolsResult
*/
/**
* @typedef {v.InferInput<typeof ListPromptsResultSchema>} ListPromptsResult
*/
/**
* @typedef {v.InferInput<typeof ListResourcesResultSchema>} ListResourcesResult
*/
/**
* @typedef {v.InferInput<typeof ListResourceTemplatesResultSchema>} ListResourceTemplatesResult
*/
/**
* @typedef {v.InferInput<typeof EmbeddedResourceSchema>} EmbeddedResource
*/
/**
* @typedef {v.InferInput<typeof ResourceLinkSchema>} ResourceLink
*/

//#endregion
//#region ../../node_modules/.pnpm/tmcp@1.19.2_typescript@5.9.3/node_modules/tmcp/src/validation/version.js
/**
* Supported MCP protocol versions in order of preference (newest first)
*/
const SUPPORTED_VERSIONS = [
	"2025-06-18",
	"2025-03-26",
	"2024-11-05"
];
/**
* Latest stable protocol version
*/
const LATEST_PROTOCOL_VERSION = SUPPORTED_VERSIONS[0];
/**
* Validate MCP protocol version format (YYYY-MM-DD)
*/
const ProtocolVersionSchema = pipe(string(), regex$2(/^\d{4}-\d{2}-\d{2}$/, "Protocol version must be in YYYY-MM-DD format"));
/**
* Validate that the protocol version is supported
*/
const SupportedProtocolVersionSchema = pipe(ProtocolVersionSchema, check((version) => SUPPORTED_VERSIONS.includes(version), "Unsupported protocol version"));
/**
* Check if a protocol version is supported
* @param {string} version - The protocol version to check
* @returns {boolean} True if the version is supported
*/
function is_supported_version(version) {
	return SUPPORTED_VERSIONS.includes(version);
}
/**
* Get the latest supported protocol version
* @returns {string} The latest protocol version
*/
function get_latest_version() {
	return LATEST_PROTOCOL_VERSION;
}
/**
* Get all supported protocol versions
* @returns {string[]} Array of supported protocol versions
*/
function get_supported_versions() {
	return [...SUPPORTED_VERSIONS];
}
/**
* Negotiate protocol version between client and server
* According to MCP spec:
* - If server supports client's version, return same version
* - Otherwise, return server's latest supported version
* @param {string} client_version - The protocol version requested by client
* @returns {string} The negotiated protocol version
*/
function negotiate_protocol_version(client_version) {
	if (is_supported_version(client_version)) return client_version;
	return get_latest_version();
}
/**
* Check if version negotiation should result in an error
* @param {string} client_version - The protocol version requested by client
* @returns {boolean} True if negotiation should fail
*/
function should_version_negotiation_fail(client_version) {
	try {
		const date = new Date(client_version);
		return !/^\d{4}-\d{2}-\d{2}$/.test(client_version) || isNaN(date.getTime());
	} catch {
		return true;
	}
}

//#endregion
//#region ../../node_modules/.pnpm/tmcp@1.19.2_typescript@5.9.3/node_modules/tmcp/src/internal/utils.js
/**
* @import {McpEvents} from "./internal.js"
*/
/**
*	@template {keyof McpEvents} Key
* @param {Key} type
* @param {Parameters<McpEvents[Key]>[0]} detail
* @returns
*/
function event(type, detail) {
	return new CustomEvent(type, { detail });
}

//#endregion
//#region ../../node_modules/.pnpm/sqids@0.3.0/node_modules/sqids/esm/sqids.js
var sqids_exports = /* @__PURE__ */ __exportAll({
	default: () => Sqids$1,
	defaultOptions: () => defaultOptions
});
var defaultOptions, Sqids$1;
var init_sqids = __esmMin((() => {
	defaultOptions = {
		alphabet: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		minLength: 0,
		blocklist: new Set([
			"0rgasm",
			"1d10t",
			"1d1ot",
			"1di0t",
			"1diot",
			"1eccacu10",
			"1eccacu1o",
			"1eccacul0",
			"1eccaculo",
			"1mbec11e",
			"1mbec1le",
			"1mbeci1e",
			"1mbecile",
			"a11upat0",
			"a11upato",
			"a1lupat0",
			"a1lupato",
			"aand",
			"ah01e",
			"ah0le",
			"aho1e",
			"ahole",
			"al1upat0",
			"al1upato",
			"allupat0",
			"allupato",
			"ana1",
			"ana1e",
			"anal",
			"anale",
			"anus",
			"arrapat0",
			"arrapato",
			"arsch",
			"arse",
			"ass",
			"b00b",
			"b00be",
			"b01ata",
			"b0ceta",
			"b0iata",
			"b0ob",
			"b0obe",
			"b0sta",
			"b1tch",
			"b1te",
			"b1tte",
			"ba1atkar",
			"balatkar",
			"bastard0",
			"bastardo",
			"batt0na",
			"battona",
			"bitch",
			"bite",
			"bitte",
			"bo0b",
			"bo0be",
			"bo1ata",
			"boceta",
			"boiata",
			"boob",
			"boobe",
			"bosta",
			"bran1age",
			"bran1er",
			"bran1ette",
			"bran1eur",
			"bran1euse",
			"branlage",
			"branler",
			"branlette",
			"branleur",
			"branleuse",
			"c0ck",
			"c0g110ne",
			"c0g11one",
			"c0g1i0ne",
			"c0g1ione",
			"c0gl10ne",
			"c0gl1one",
			"c0gli0ne",
			"c0glione",
			"c0na",
			"c0nnard",
			"c0nnasse",
			"c0nne",
			"c0u111es",
			"c0u11les",
			"c0u1l1es",
			"c0u1lles",
			"c0ui11es",
			"c0ui1les",
			"c0uil1es",
			"c0uilles",
			"c11t",
			"c11t0",
			"c11to",
			"c1it",
			"c1it0",
			"c1ito",
			"cabr0n",
			"cabra0",
			"cabrao",
			"cabron",
			"caca",
			"cacca",
			"cacete",
			"cagante",
			"cagar",
			"cagare",
			"cagna",
			"cara1h0",
			"cara1ho",
			"caracu10",
			"caracu1o",
			"caracul0",
			"caraculo",
			"caralh0",
			"caralho",
			"cazz0",
			"cazz1mma",
			"cazzata",
			"cazzimma",
			"cazzo",
			"ch00t1a",
			"ch00t1ya",
			"ch00tia",
			"ch00tiya",
			"ch0d",
			"ch0ot1a",
			"ch0ot1ya",
			"ch0otia",
			"ch0otiya",
			"ch1asse",
			"ch1avata",
			"ch1er",
			"ch1ng0",
			"ch1ngadaz0s",
			"ch1ngadazos",
			"ch1ngader1ta",
			"ch1ngaderita",
			"ch1ngar",
			"ch1ngo",
			"ch1ngues",
			"ch1nk",
			"chatte",
			"chiasse",
			"chiavata",
			"chier",
			"ching0",
			"chingadaz0s",
			"chingadazos",
			"chingader1ta",
			"chingaderita",
			"chingar",
			"chingo",
			"chingues",
			"chink",
			"cho0t1a",
			"cho0t1ya",
			"cho0tia",
			"cho0tiya",
			"chod",
			"choot1a",
			"choot1ya",
			"chootia",
			"chootiya",
			"cl1t",
			"cl1t0",
			"cl1to",
			"clit",
			"clit0",
			"clito",
			"cock",
			"cog110ne",
			"cog11one",
			"cog1i0ne",
			"cog1ione",
			"cogl10ne",
			"cogl1one",
			"cogli0ne",
			"coglione",
			"cona",
			"connard",
			"connasse",
			"conne",
			"cou111es",
			"cou11les",
			"cou1l1es",
			"cou1lles",
			"coui11es",
			"coui1les",
			"couil1es",
			"couilles",
			"cracker",
			"crap",
			"cu10",
			"cu1att0ne",
			"cu1attone",
			"cu1er0",
			"cu1ero",
			"cu1o",
			"cul0",
			"culatt0ne",
			"culattone",
			"culer0",
			"culero",
			"culo",
			"cum",
			"cunt",
			"d11d0",
			"d11do",
			"d1ck",
			"d1ld0",
			"d1ldo",
			"damn",
			"de1ch",
			"deich",
			"depp",
			"di1d0",
			"di1do",
			"dick",
			"dild0",
			"dildo",
			"dyke",
			"encu1e",
			"encule",
			"enema",
			"enf01re",
			"enf0ire",
			"enfo1re",
			"enfoire",
			"estup1d0",
			"estup1do",
			"estupid0",
			"estupido",
			"etr0n",
			"etron",
			"f0da",
			"f0der",
			"f0ttere",
			"f0tters1",
			"f0ttersi",
			"f0tze",
			"f0utre",
			"f1ca",
			"f1cker",
			"f1ga",
			"fag",
			"fica",
			"ficker",
			"figa",
			"foda",
			"foder",
			"fottere",
			"fotters1",
			"fottersi",
			"fotze",
			"foutre",
			"fr0c10",
			"fr0c1o",
			"fr0ci0",
			"fr0cio",
			"fr0sc10",
			"fr0sc1o",
			"fr0sci0",
			"fr0scio",
			"froc10",
			"froc1o",
			"froci0",
			"frocio",
			"frosc10",
			"frosc1o",
			"frosci0",
			"froscio",
			"fuck",
			"g00",
			"g0o",
			"g0u1ne",
			"g0uine",
			"gandu",
			"go0",
			"goo",
			"gou1ne",
			"gouine",
			"gr0gnasse",
			"grognasse",
			"haram1",
			"harami",
			"haramzade",
			"hund1n",
			"hundin",
			"id10t",
			"id1ot",
			"idi0t",
			"idiot",
			"imbec11e",
			"imbec1le",
			"imbeci1e",
			"imbecile",
			"j1zz",
			"jerk",
			"jizz",
			"k1ke",
			"kam1ne",
			"kamine",
			"kike",
			"leccacu10",
			"leccacu1o",
			"leccacul0",
			"leccaculo",
			"m1erda",
			"m1gn0tta",
			"m1gnotta",
			"m1nch1a",
			"m1nchia",
			"m1st",
			"mam0n",
			"mamahuev0",
			"mamahuevo",
			"mamon",
			"masturbat10n",
			"masturbat1on",
			"masturbate",
			"masturbati0n",
			"masturbation",
			"merd0s0",
			"merd0so",
			"merda",
			"merde",
			"merdos0",
			"merdoso",
			"mierda",
			"mign0tta",
			"mignotta",
			"minch1a",
			"minchia",
			"mist",
			"musch1",
			"muschi",
			"n1gger",
			"neger",
			"negr0",
			"negre",
			"negro",
			"nerch1a",
			"nerchia",
			"nigger",
			"orgasm",
			"p00p",
			"p011a",
			"p01la",
			"p0l1a",
			"p0lla",
			"p0mp1n0",
			"p0mp1no",
			"p0mpin0",
			"p0mpino",
			"p0op",
			"p0rca",
			"p0rn",
			"p0rra",
			"p0uff1asse",
			"p0uffiasse",
			"p1p1",
			"p1pi",
			"p1r1a",
			"p1rla",
			"p1sc10",
			"p1sc1o",
			"p1sci0",
			"p1scio",
			"p1sser",
			"pa11e",
			"pa1le",
			"pal1e",
			"palle",
			"pane1e1r0",
			"pane1e1ro",
			"pane1eir0",
			"pane1eiro",
			"panele1r0",
			"panele1ro",
			"paneleir0",
			"paneleiro",
			"patakha",
			"pec0r1na",
			"pec0rina",
			"pecor1na",
			"pecorina",
			"pen1s",
			"pendej0",
			"pendejo",
			"penis",
			"pip1",
			"pipi",
			"pir1a",
			"pirla",
			"pisc10",
			"pisc1o",
			"pisci0",
			"piscio",
			"pisser",
			"po0p",
			"po11a",
			"po1la",
			"pol1a",
			"polla",
			"pomp1n0",
			"pomp1no",
			"pompin0",
			"pompino",
			"poop",
			"porca",
			"porn",
			"porra",
			"pouff1asse",
			"pouffiasse",
			"pr1ck",
			"prick",
			"pussy",
			"put1za",
			"puta",
			"puta1n",
			"putain",
			"pute",
			"putiza",
			"puttana",
			"queca",
			"r0mp1ba11e",
			"r0mp1ba1le",
			"r0mp1bal1e",
			"r0mp1balle",
			"r0mpiba11e",
			"r0mpiba1le",
			"r0mpibal1e",
			"r0mpiballe",
			"rand1",
			"randi",
			"rape",
			"recch10ne",
			"recch1one",
			"recchi0ne",
			"recchione",
			"retard",
			"romp1ba11e",
			"romp1ba1le",
			"romp1bal1e",
			"romp1balle",
			"rompiba11e",
			"rompiba1le",
			"rompibal1e",
			"rompiballe",
			"ruff1an0",
			"ruff1ano",
			"ruffian0",
			"ruffiano",
			"s1ut",
			"sa10pe",
			"sa1aud",
			"sa1ope",
			"sacanagem",
			"sal0pe",
			"salaud",
			"salope",
			"saugnapf",
			"sb0rr0ne",
			"sb0rra",
			"sb0rrone",
			"sbattere",
			"sbatters1",
			"sbattersi",
			"sborr0ne",
			"sborra",
			"sborrone",
			"sc0pare",
			"sc0pata",
			"sch1ampe",
			"sche1se",
			"sche1sse",
			"scheise",
			"scheisse",
			"schlampe",
			"schwachs1nn1g",
			"schwachs1nnig",
			"schwachsinn1g",
			"schwachsinnig",
			"schwanz",
			"scopare",
			"scopata",
			"sexy",
			"sh1t",
			"shit",
			"slut",
			"sp0mp1nare",
			"sp0mpinare",
			"spomp1nare",
			"spompinare",
			"str0nz0",
			"str0nza",
			"str0nzo",
			"stronz0",
			"stronza",
			"stronzo",
			"stup1d",
			"stupid",
			"succh1am1",
			"succh1ami",
			"succhiam1",
			"succhiami",
			"sucker",
			"t0pa",
			"tapette",
			"test1c1e",
			"test1cle",
			"testic1e",
			"testicle",
			"tette",
			"topa",
			"tr01a",
			"tr0ia",
			"tr0mbare",
			"tr1ng1er",
			"tr1ngler",
			"tring1er",
			"tringler",
			"tro1a",
			"troia",
			"trombare",
			"turd",
			"twat",
			"vaffancu10",
			"vaffancu1o",
			"vaffancul0",
			"vaffanculo",
			"vag1na",
			"vagina",
			"verdammt",
			"verga",
			"w1chsen",
			"wank",
			"wichsen",
			"x0ch0ta",
			"x0chota",
			"xana",
			"xoch0ta",
			"xochota",
			"z0cc01a",
			"z0cc0la",
			"z0cco1a",
			"z0ccola",
			"z1z1",
			"z1zi",
			"ziz1",
			"zizi",
			"zocc01a",
			"zocc0la",
			"zocco1a",
			"zoccola"
		])
	};
	Sqids$1 = class {
		constructor(options) {
			var _a, _b, _c;
			const alphabet = (_a = options === null || options === void 0 ? void 0 : options.alphabet) !== null && _a !== void 0 ? _a : defaultOptions.alphabet;
			const minLength = (_b = options === null || options === void 0 ? void 0 : options.minLength) !== null && _b !== void 0 ? _b : defaultOptions.minLength;
			const blocklist = (_c = options === null || options === void 0 ? void 0 : options.blocklist) !== null && _c !== void 0 ? _c : defaultOptions.blocklist;
			if (new Blob([alphabet]).size !== alphabet.length) throw new Error("Alphabet cannot contain multibyte characters");
			const minAlphabetLength = 3;
			if (alphabet.length < minAlphabetLength) throw new Error(`Alphabet length must be at least ${minAlphabetLength}`);
			if (new Set(alphabet).size !== alphabet.length) throw new Error("Alphabet must contain unique characters");
			const minLengthLimit = 255;
			if (typeof minLength !== "number" || minLength < 0 || minLength > minLengthLimit) throw new Error(`Minimum length has to be between 0 and ${minLengthLimit}`);
			const filteredBlocklist = /* @__PURE__ */ new Set();
			const alphabetChars = alphabet.toLowerCase().split("");
			for (const word of blocklist) if (word.length >= 3) {
				const wordLowercased = word.toLowerCase();
				const wordChars = wordLowercased.split("");
				if (wordChars.filter((c) => alphabetChars.includes(c)).length === wordChars.length) filteredBlocklist.add(wordLowercased);
			}
			this.alphabet = this.shuffle(alphabet);
			this.minLength = minLength;
			this.blocklist = filteredBlocklist;
		}
		encode(numbers) {
			if (numbers.length === 0) return "";
			if (numbers.filter((n) => n >= 0 && n <= this.maxValue()).length !== numbers.length) throw new Error(`Encoding supports numbers between 0 and ${this.maxValue()}`);
			return this.encodeNumbers(numbers);
		}
		decode(id) {
			const ret = [];
			if (id === "") return ret;
			const alphabetChars = this.alphabet.split("");
			for (const c of id.split("")) if (!alphabetChars.includes(c)) return ret;
			const prefix = id.charAt(0);
			const offset = this.alphabet.indexOf(prefix);
			let alphabet = this.alphabet.slice(offset) + this.alphabet.slice(0, offset);
			alphabet = alphabet.split("").reverse().join("");
			let slicedId = id.slice(1);
			while (slicedId.length > 0) {
				const separator = alphabet.slice(0, 1);
				const chunks = slicedId.split(separator);
				if (chunks.length > 0) {
					if (chunks[0] === "") return ret;
					ret.push(this.toNumber(chunks[0], alphabet.slice(1)));
					if (chunks.length > 1) alphabet = this.shuffle(alphabet);
				}
				slicedId = chunks.slice(1).join(separator);
			}
			return ret;
		}
		encodeNumbers(numbers, increment = 0) {
			if (increment > this.alphabet.length) throw new Error("Reached max attempts to re-generate the ID");
			let offset = numbers.reduce((a, v, i) => this.alphabet[v % this.alphabet.length].codePointAt(0) + i + a, numbers.length) % this.alphabet.length;
			offset = (offset + increment) % this.alphabet.length;
			let alphabet = this.alphabet.slice(offset) + this.alphabet.slice(0, offset);
			const prefix = alphabet.charAt(0);
			alphabet = alphabet.split("").reverse().join("");
			const ret = [prefix];
			for (let i = 0; i !== numbers.length; i++) {
				const num = numbers[i];
				ret.push(this.toId(num, alphabet.slice(1)));
				if (i < numbers.length - 1) {
					ret.push(alphabet.slice(0, 1));
					alphabet = this.shuffle(alphabet);
				}
			}
			let id = ret.join("");
			if (this.minLength > id.length) {
				id += alphabet.slice(0, 1);
				while (this.minLength - id.length > 0) {
					alphabet = this.shuffle(alphabet);
					id += alphabet.slice(0, Math.min(this.minLength - id.length, alphabet.length));
				}
			}
			if (this.isBlockedId(id)) id = this.encodeNumbers(numbers, increment + 1);
			return id;
		}
		shuffle(alphabet) {
			const chars = alphabet.split("");
			for (let i = 0, j = chars.length - 1; j > 0; i++, j--) {
				const r = (i * j + chars[i].codePointAt(0) + chars[j].codePointAt(0)) % chars.length;
				[chars[i], chars[r]] = [chars[r], chars[i]];
			}
			return chars.join("");
		}
		toId(num, alphabet) {
			const id = [];
			const chars = alphabet.split("");
			let result = num;
			do {
				id.unshift(chars[result % chars.length]);
				result = Math.floor(result / chars.length);
			} while (result > 0);
			return id.join("");
		}
		toNumber(id, alphabet) {
			const chars = alphabet.split("");
			return id.split("").reduce((a, v) => a * chars.length + chars.indexOf(v), 0);
		}
		isBlockedId(id) {
			const lowercaseId = id.toLowerCase();
			for (const word of this.blocklist) if (word.length <= lowercaseId.length) {
				if (lowercaseId.length <= 3 || word.length <= 3) {
					if (lowercaseId === word) return true;
				} else if (/\d/.test(word)) {
					if (lowercaseId.startsWith(word) || lowercaseId.endsWith(word)) return true;
				} else if (lowercaseId.includes(word)) return true;
			}
			return false;
		}
		maxValue() {
			return Number.MAX_SAFE_INTEGER;
		}
	};
}));

//#endregion
//#region ../../node_modules/.pnpm/tmcp@1.19.2_typescript@5.9.3/node_modules/tmcp/src/index.js
/**
* @import { StandardSchemaV1 } from "@standard-schema/spec";
* @import SqidsType from "sqids";
* @import { JSONRPCRequest, JSONRPCParams } from "json-rpc-2.0";
* @import { ExtractURITemplateVariables } from "./internal/uri-template.js";
* @import { CallToolResult as CallToolResultType, ReadResourceResult as ReadResourceResultType, GetPromptResult as GetPromptResultType, ServerInfo as ServerInfoType, ClientCapabilities as ClientCapabilitiesType, JSONRPCRequest as JSONRPCRequestType, JSONRPCResponse, CreateMessageRequestParams as CreateMessageRequestParamsType, CreateMessageResult as CreateMessageResultType, Resource as ResourceType, LoggingLevel as LoggingLevelType, ToolAnnotations, ClientInfo as ClientInfoType, ElicitResult as ElicitResultType, Icons as IconsType, JSONRPCMessage, InitializeResult as InitializeResultType, ListToolsResult as ListToolsResultType, ListPromptsResult as ListPromptsResultType, ListResourceTemplatesResult as ListResourceTemplatesResultType, ListResourcesResult as ListResourcesResultType, CompleteResult as CompleteResultType } from "./validation/index.js";
* @import { Tool, Completion, Prompt, StoredResource, ServerOptions, SubscriptionsKeys, ChangedArgs, McpEvents, AllSame, TemplateOptions } from "./internal/internal.js";
* @import { CreatedTool, ToolOptions, CreatedPrompt, PromptOptions, CreatedResource, CreatedTemplate, ResourceOptions } from "./internal/internal.js";
*/
/**
* Information about a validated access token, provided to request handlers.
* @typedef {Object} AuthInfo
* @property {string} token - The access token.
* @property {string} clientId - The client ID associated with this token.
* @property {string[]} scopes - Scopes associated with this token.
* @property {number} [expiresAt] - When the token expires (in seconds since epoch).
* @property {URL} [resource] - The RFC 8707 resource server identifier for which this token is valid.
*   If set, this MUST match the MCP server's resource identifier (minus hash fragment).
* @property {Record<string, unknown>} [extra] - Additional data associated with the token.
*   This field should be used for any additional data that needs to be attached to the auth info.
*/
/**
* @template {Record<string, unknown> | undefined} [TCustom=undefined]
* @typedef {Object} Context
* @property {string} [sessionId]
* @property {{ clientCapabilities?: ClientCapabilitiesType, clientInfo?: ClientInfoType, logLevel?: LoggingLevel }} [sessionInfo]
* @property {AuthInfo} [auth]
* @property {TCustom} [custom]
*/
/**
* @typedef {IconsType} Icons
*/
/**
* @typedef {Record<SubscriptionsKeys, string[]>} Subscriptions
*/
/**
* @template {Record<string, unknown> | undefined} TStructuredContent
* @typedef {CallToolResultType<TStructuredContent>} CallToolResult
*/
/**
* @typedef {ReadResourceResultType} ReadResourceResult
*/
/**
* @typedef {GetPromptResultType} GetPromptResult
*/
/**
* @typedef {ClientCapabilitiesType} ClientCapabilities
*/
/**
* @typedef {ServerInfoType} ServerInfo
*/
/**
* @typedef {CreateMessageRequestParamsType} CreateMessageRequestParams
*/
/**
* @typedef {CreateMessageResultType} CreateMessageResult
*/
/**
* @typedef {ResourceType} Resource
*/
/**
* @typedef  {LoggingLevelType} LoggingLevel
*/
/**
* @typedef  {ClientInfoType} ClientInfo
*/
/**
* @typedef  {ElicitResultType} ElicitResult
*/
/**
* @typedef {InitializeResultType} InitializeResult
*/
/**
* @typedef {ListToolsResultType} ListToolsResult
*/
/**
* @typedef {ListPromptsResultType} ListPromptsResult
*/
/**
* @typedef {ListResourceTemplatesResultType} ListResourceTemplatesResult
*/
/**
* @typedef {ListResourcesResultType} ListResourcesResult
*/
/**
* @typedef {CompleteResultType} CompleteResult
*/
/**
* @type {SqidsType | undefined}
*/
let Sqids;
async function get_sqids() {
	if (!Sqids) Sqids = new (await (Promise.resolve().then(() => (init_sqids(), sqids_exports)))).default();
	return Sqids;
}
/**
* Encode a cursor for pagination
* @param {number} offset
*/
async function encode_cursor(offset) {
	return (await get_sqids()).encode([offset]);
}
/**
* Decode a cursor from pagination
* @param {string} cursor
*/
async function decode_cursor(cursor) {
	const [decoded] = (await get_sqids()).decode(cursor);
	return decoded;
}
/**
* @param {()=>boolean | Promise<boolean>} enabled
*/
async function safe_enabled(enabled) {
	try {
		return await enabled();
	} catch {
		return false;
	}
}
/**
* @template {StandardSchemaV1 | undefined} [StandardSchema=undefined]
* @template {Record<string, unknown> | undefined} [CustomContext=undefined]
*/
var McpServer = class {
	#server = new import_dist.JSONRPCServer();
	/**
	* @type {JSONRPCClient<"broadcast" | "standalone"> | undefined}
	*/
	#client;
	#options;
	/**
	* @type {Map<string, Tool<any, any>>}
	*/
	#tools = /* @__PURE__ */ new Map();
	/**
	* @type {Map<string, Prompt<any>>}
	*/
	#prompts = /* @__PURE__ */ new Map();
	/**
	* @type {Map<string, StoredResource>}
	*/
	#resources = /* @__PURE__ */ new Map();
	#templates = new UriTemplateMatcher();
	/**
	* @type {Array<{uri: string, name?: string}>}
	*/
	roots = [];
	/**
	* @type {{ [ref: string]: Map<string, Partial<Record<string, Completion>>> }}
	*/
	#completions = {
		"ref/prompt": /* @__PURE__ */ new Map(),
		"ref/resource": /* @__PURE__ */ new Map()
	};
	#event_target = new EventTarget();
	/**
	* @type {AsyncLocalStorage<Context<CustomContext> & { progress_token?: string }>}
	*/
	#ctx_storage = new AsyncLocalStorage();
	/**
	* @param {ServerInfo} server_info
	* @param {ServerOptions<StandardSchema>} options
	*/
	constructor(server_info, options) {
		this.#options = options;
		this.#server.addMethod("initialize", (initialize_request) => {
			try {
				const validated_initialize = parse(InitializeRequestParamsSchema, initialize_request);
				if (should_version_negotiation_fail(validated_initialize.protocolVersion)) throw new McpError(-32602, "Invalid protocol version format");
				const negotiated_version = negotiate_protocol_version(validated_initialize.protocolVersion);
				this.#event_target.dispatchEvent(event("initialize", validated_initialize));
				return {
					protocolVersion: negotiated_version,
					...options,
					serverInfo: server_info
				};
			} catch (error) {
				if (error instanceof McpError) throw error;
				if (error.message?.includes("Protocol version")) throw new McpError(-32602, `Protocol version validation failed: ${error.message}. Server supports: ${get_supported_versions().join(", ")}`);
				throw new McpError(-32603, `Initialization failed: ${error.message}`);
			}
		});
		this.#server.addMethod("ping", () => {
			return {};
		});
		this.#server.addMethod("notifications/initialized", () => {
			return null;
		});
		this.#init_tools();
		this.#init_prompts();
		this.#init_resources();
		this.#init_roots();
		this.#init_completion();
		this.#init_logging();
	}
	/**
	* Utility method to specify the type of the custom context for this server instance without the need to specify the standard schema type.
	* @example
	* const server = new McpServer({ ... }, { ... }).withContext<{ name: string }>();
	* @template {Record<string, unknown>} TCustom
	* @returns {McpServer<StandardSchema, TCustom>}
	*/
	withContext() {
		return this;
	}
	get #progress_token() {
		return this.#ctx_storage.getStore()?.progress_token;
	}
	/**
	* The context of the current request, include the session ID, any auth information, and custom data.
	* @type {Context<CustomContext>}
	*/
	get ctx() {
		const { progress_token, ...rest } = this.#ctx_storage.getStore() ?? {};
		return rest;
	}
	get #client_capabilities() {
		return this.#ctx_storage.getStore()?.sessionInfo?.clientCapabilities;
	}
	/**
	* Get the client information (name, version, etc.) of the client that initiated the current request...useful if you want to do something different based on the client.
	* @deprecated Use `server.ctx.sessionInfo.clientInfo` instead.
	*/
	currentClientInfo() {
		return this.#ctx_storage.getStore()?.sessionInfo?.clientInfo;
	}
	/**
	* Get the client capabilities of the client that initiated the current request, you can use this to verify the client support something before invoking the respective method.
	* @deprecated Use `server.ctx.sessionInfo.clientCapabilities` instead.
	*/
	currentClientCapabilities() {
		return this.#client_capabilities;
	}
	#lazyily_create_client() {
		if (!this.#client) this.#client = new import_dist.JSONRPCClient((payload, kind) => {
			if (kind === "broadcast") {
				this.#event_target.dispatchEvent(event("broadcast", { request: payload }));
				return;
			}
			this.#event_target.dispatchEvent(event("send", { request: payload }));
		});
	}
	/**
	* @template {keyof McpEvents} TEvent
	* @param {TEvent} event
	* @param {McpEvents[TEvent]} callback
	* @param {AddEventListenerOptions} [options]
	*/
	on(event, callback, options) {
		if (event === "send" || event === "broadcast") this.#lazyily_create_client();
		/**
		* @param {Event} e
		*/
		const listener = (e) => {
			callback(
				/** @type {CustomEvent} */
				e.detail
			);
		};
		this.#event_target.addEventListener(event, listener, options);
		return () => {
			this.#event_target.removeEventListener(event, listener, options);
		};
	}
	/**
	* @param {string} method
	* @param {JSONRPCParams} [params]
	* @param {"broadcast" | "standalone"} [kind]
	*/
	#notify(method, params, kind = "standalone") {
		this.#client?.notify(method, params, kind);
	}
	/**
	*
	*/
	#init_tools() {
		if (!this.#options.capabilities?.tools) return;
		this.#server.addMethod("tools/list", async ({ cursor } = {}) => {
			const all_tools = (await Promise.all([...this.#tools].map(async ([name, tool]) => {
				if (tool.enabled != null && await safe_enabled(tool.enabled) === false) return null;
				return {
					name,
					title: tool.title || tool.description,
					description: tool.description,
					icons: tool.icons,
					_meta: tool._meta,
					inputSchema: tool.schema && this.#options.adapter ? await this.#options.adapter.toJsonSchema(tool.schema) : {
						type: "object",
						properties: {}
					},
					...tool.outputSchema && this.#options.adapter ? { outputSchema: await this.#options.adapter.toJsonSchema(tool.outputSchema) } : {},
					...tool.annotations ? { annotations: tool.annotations } : {}
				};
			}))).filter((tool) => tool !== null);
			const pagination_options = this.#options.pagination?.tools;
			if (!pagination_options || pagination_options.size == null) return { tools: all_tools };
			const page_length = pagination_options.size;
			const start_index = cursor ? await decode_cursor(cursor) : 0;
			const end_index = start_index + page_length;
			const tools = all_tools.slice(start_index, end_index);
			const next_cursor = end_index < all_tools.length ? await encode_cursor(end_index) : null;
			return {
				tools,
				...next_cursor && { nextCursor: next_cursor }
			};
		});
		this.#server.addMethod("tools/call", async ({ name, arguments: args }) => {
			const tool = this.#tools.get(name);
			if (!tool) return {
				isError: true,
				content: [{
					type: "text",
					text: `Tool ${name} not found`
				}]
			};
			let validated_args = args;
			if (tool.schema) {
				let validation_result = tool.schema["~standard"].validate(args);
				if (validation_result instanceof Promise) validation_result = await validation_result;
				if (validation_result.issues) return {
					isError: true,
					content: [{
						type: "text",
						text: `Invalid arguments for tool ${name}: ${JSON.stringify(validation_result.issues)}`
					}]
				};
				validated_args = validation_result.value;
			}
			const tool_result = tool.schema ? await tool.execute(validated_args) : await tool.execute();
			const parsed_result = parse(CallToolResultSchema, tool_result);
			if (tool.outputSchema && parsed_result.structuredContent !== void 0) {
				let output_validation = tool.outputSchema["~standard"].validate(parsed_result.structuredContent);
				if (output_validation instanceof Promise) output_validation = await output_validation;
				if (output_validation.issues) return {
					isError: true,
					content: [{
						type: "text",
						text: `Tool ${name} returned invalid structured content: ${JSON.stringify(output_validation.issues)}`
					}]
				};
				parsed_result.structuredContent = output_validation.value;
			}
			return parsed_result;
		});
	}
	/**
	*
	*/
	#init_prompts() {
		if (!this.#options.capabilities?.prompts) return;
		this.#server.addMethod("prompts/list", async ({ cursor } = {}) => {
			const all_prompts = (await Promise.all([...this.#prompts].map(async ([name, prompt]) => {
				if (prompt.enabled != null && await safe_enabled(prompt.enabled) === false) return null;
				const arguments_schema = prompt.schema && this.#options.adapter ? await this.#options.adapter.toJsonSchema(prompt.schema) : {
					type: "object",
					properties: {},
					required: []
				};
				const keys = Object.keys(arguments_schema.properties ?? {});
				const required = arguments_schema.required ?? [];
				return {
					name,
					title: prompt.title || prompt.description,
					icons: prompt.icons,
					description: prompt.description,
					arguments: keys.map((key) => {
						const property = arguments_schema.properties?.[key];
						const description = property && property !== true ? property.description : key;
						return {
							name: key,
							required: required.includes(key),
							description
						};
					})
				};
			}))).filter((prompt) => prompt !== null);
			const pagination_options = this.#options.pagination?.prompts;
			if (!pagination_options || pagination_options.size == null) return { prompts: all_prompts };
			const page_length = pagination_options.size;
			const start_index = cursor ? await decode_cursor(cursor) : 0;
			const end_index = start_index + page_length;
			const prompts = all_prompts.slice(start_index, end_index);
			const next_cursor = end_index < all_prompts.length ? await encode_cursor(end_index) : null;
			return {
				prompts,
				...next_cursor && { nextCursor: next_cursor }
			};
		});
		this.#server.addMethod("prompts/get", async ({ name, arguments: args }) => {
			const prompt = this.#prompts.get(name);
			if (!prompt) throw new McpError(-32601, `Prompt ${name} not found`);
			if (!prompt.schema) return parse(GetPromptResultSchema, await prompt.execute());
			let validated_args = prompt.schema["~standard"].validate(args);
			if (validated_args instanceof Promise) validated_args = await validated_args;
			if (validated_args.issues) throw new McpError(-32602, `Invalid arguments for prompt ${name}: ${JSON.stringify(validated_args.issues)}`);
			return parse(GetPromptResultSchema, await prompt.execute(validated_args.value));
		});
	}
	/**
	*
	*/
	#init_resources() {
		if (!this.#options.capabilities?.resources) return;
		if (this.#options.capabilities?.resources?.subscribe) {
			this.#server.addMethod("resources/subscribe", async ({ uri }) => {
				this.#event_target.dispatchEvent(event("subscription", {
					uri,
					action: "add"
				}));
				return {};
			});
			this.#server.addMethod("resources/unsubscribe", async ({ uri }) => {
				this.#event_target.dispatchEvent(event("subscription", {
					uri,
					action: "remove"
				}));
				return {};
			});
		}
		this.#server.addMethod("resources/list", async ({ cursor } = {}) => {
			const all_resources = [];
			for (const [uri, resource] of this.#resources) if (!resource.template) {
				if (resource.enabled != null && await safe_enabled(resource.enabled) === false) continue;
				all_resources.push({
					name: resource.name,
					title: resource.title || resource.description,
					description: resource.description,
					uri,
					mimeType: resource.mimeType,
					icons: resource.icons
				});
			} else if (resource.list_resources) {
				if (resource.enabled != null && await safe_enabled(resource.enabled) === false) continue;
				const template_resources = await resource.list_resources();
				all_resources.push(...template_resources);
			}
			const pagination_options = this.#options.pagination?.resources;
			if (!pagination_options || pagination_options.size == null) return { resources: all_resources };
			const page_length = pagination_options.size;
			const start_index = cursor ? await decode_cursor(cursor) : 0;
			const end_index = start_index + page_length;
			const resources = all_resources.slice(start_index, end_index);
			const next_cursor = end_index < all_resources.length ? await encode_cursor(end_index) : null;
			return {
				resources,
				...next_cursor && { nextCursor: next_cursor }
			};
		});
		this.#server.addMethod("resources/templates/list", async () => {
			return { resourceTemplates: (await Promise.all([...this.#resources].map(async ([uri, resource]) => {
				if (!resource.template) return null;
				if (resource.enabled != null && await safe_enabled(resource.enabled) === false) return null;
				return {
					name: resource.name,
					icons: resource.icons,
					title: resource.title || resource.description,
					description: resource.description,
					mimeType: resource.mimeType,
					uriTemplate: uri
				};
			}))).filter((resource) => resource != null) };
		});
		this.#server.addMethod("resources/read", async ({ uri }) => {
			let resource = this.#resources.get(uri);
			let params;
			if (!resource) {
				const match = this.#templates.match(uri);
				if (match) {
					resource = this.#resources.get(match.template);
					params = match.params;
				}
				if (!resource) throw new McpError(-32601, `Resource ${uri} not found`);
			}
			if (resource.template) {
				if (!params) throw new McpError(-32602, "Missing parameters for template resource");
				return parse(ReadResourceResultSchema, await resource.execute(uri, params));
			}
			return parse(ReadResourceResultSchema, await resource.execute(uri));
		});
	}
	/**
	*
	*/
	#init_roots() {
		this.#server.addMethod("notifications/roots/list_changed", () => {
			this.#refresh_roots();
			return null;
		});
	}
	/**
	* Request roots list from client
	*/
	async #refresh_roots() {
		if (!this.#client_capabilities?.roots) return;
		this.#lazyily_create_client();
		try {
			this.roots = (await this.#client?.request("roots/list", void 0, "standalone"))?.roots || [];
		} catch {
			this.roots = [];
		}
	}
	#init_completion() {
		this.#server.addMethod("completion/complete", async ({ argument, ref, context }) => {
			const completions = this.#completions[ref.type];
			if (!completions) return null;
			const complete = completions.get(ref.uri ?? ref.name);
			if (!complete) return null;
			const actual_complete = complete[argument.name];
			if (!actual_complete) return null;
			return parse(CompleteResultSchema, await actual_complete(argument.value, context));
		});
	}
	#init_logging() {
		if (!this.#options.capabilities?.logging) return;
		this.#server.addMethod("logging/setLevel", ({ level }) => {
			this.#event_target.dispatchEvent(event("loglevelchange", { level }));
			return {};
		});
	}
	#notify_tools_list_changed() {
		if (this.#options.capabilities?.tools?.listChanged) this.#notify("notifications/tools/list_changed", {}, "broadcast");
	}
	#notify_prompts_list_changed() {
		if (this.#options.capabilities?.prompts?.listChanged) this.#notify("notifications/prompts/list_changed", {}, "broadcast");
	}
	#notify_resources_list_changed() {
		if (this.#options.capabilities?.resources?.listChanged) this.#notify("notifications/resources/list_changed", {}, "broadcast");
	}
	/**
	* Use the `defineTool` utility to create a reusable tool and pass it to this method to add it to the server.
	* @template {Array<CreatedTool<any, any>>} T
	* @template {T extends Array<CreatedTool<infer TSchema, infer TOutputSchema>> ? AllSame<TSchema, StandardSchema | undefined> extends true ? AllSame<TOutputSchema, StandardSchema | undefined> extends true ? T : never : never : never} U
	* @param {T & NoInfer<U>} tools
	*/
	tools(tools) {
		for (const tool of tools) this.tool(tool);
	}
	/**
	* Use the `definePrompt` utility to create a reusable tool and pass it to this method to add it to the server.
	* @template {Array<CreatedPrompt<any>>} T
	* @template {T extends Array<CreatedPrompt<infer TSchema>> ? AllSame<TSchema, StandardSchema | undefined> extends true ?  T : never : never} U
	* @param {T & NoInfer<U>} prompts
	*/
	prompts(prompts) {
		for (const prompt of prompts) this.prompt(prompt);
	}
	/**
	* Use the `defineResource` utility to create a reusable resource and pass it to this method to add it to the server.
	*
	* @param {CreatedResource[]} resources
	*/
	resources(resources) {
		for (const resource of resources) this.resource(resource);
	}
	/**
	* Use the `defineTemplate` utility to create a reusable template and pass it to this method to add it to the server.
	*
	* @param {CreatedTemplate<any>[]} templates
	*/
	templates(templates) {
		for (const template of templates) this.template(template);
	}
	/**
	* Add a tool to the server. If you want to receive any input you need to provide a schema. The schema needs to be a valid Standard Schema V1 schema and needs to be an Object with the properties you need,
	* Use the description and title to help the LLM to understand what the tool does and when to use it. If you provide an outputSchema, you need to return a structuredContent that matches the schema.
	*
	* Tools will be invoked by the LLM when it thinks it needs to use them, you can use the annotations to provide additional information about the tool, like what it does, how to use it, etc.
	* @template {StandardSchema | undefined} [TSchema=undefined]
	* @template {StandardSchema | undefined} [TOutputSchema=undefined]
	* @overload
	* @param {CreatedTool<TSchema, TOutputSchema>} tool_or_options
	* @returns {void}
	*/
	/**
	* Add a tool to the server. If you want to receive any input you need to provide a schema. The schema needs to be a valid Standard Schema V1 schema and needs to be an Object with the properties you need,
	* Use the description and title to help the LLM to understand what the tool does and when to use it. If you provide an outputSchema, you need to return a structuredContent that matches the schema.
	*
	* Tools will be invoked by the LLM when it thinks it needs to use them, you can use the annotations to provide additional information about the tool, like what it does, how to use it, etc.
	* @template {StandardSchema | undefined} [TSchema=undefined]
	* @template {StandardSchema | undefined} [TOutputSchema=undefined]
	* @overload
	* @param {ToolOptions<TSchema, TOutputSchema>} tool_or_options
	* @param {TSchema extends undefined ? (()=>Promise<CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>> | CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>) : ((input: StandardSchemaV1.InferInput<TSchema extends undefined ? never : TSchema>) => Promise<CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>> | CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>)} execute
	* @returns {void}
	* */
	/**
	* Add a tool to the server. If you want to receive any input you need to provide a schema. The schema needs to be a valid Standard Schema V1 schema and needs to be an Object with the properties you need,
	* Use the description and title to help the LLM to understand what the tool does and when to use it. If you provide an outputSchema, you need to return a structuredContent that matches the schema.
	*
	* Tools will be invoked by the LLM when it thinks it needs to use them, you can use the annotations to provide additional information about the tool, like what it does, how to use it, etc.
	* @template {StandardSchema | undefined} [TSchema=undefined]
	* @template {StandardSchema | undefined} [TOutputSchema=undefined]
	* @param {CreatedTool<TSchema, TOutputSchema> | ToolOptions<TSchema, TOutputSchema>} tool_or_options
	* @param {undefined | TSchema extends undefined ? (()=>Promise<CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>> | CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>) : ((input: StandardSchemaV1.InferInput<TSchema extends undefined ? never : TSchema>) => Promise<CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>> | CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>)} [execute]
	*/
	tool(tool_or_options, execute) {
		if ("execute" in tool_or_options) execute = tool_or_options.execute;
		this.#notify_tools_list_changed();
		const stored_tool = tool_or_options;
		stored_tool.execute = execute;
		this.#tools.set(tool_or_options.name, stored_tool);
	}
	/**
	* Add a prompt to the server. Prompts are used to provide the user with pre-defined messages that adds context to the LLM.
	* Use the description and title to help the user to understand what the prompt does and when to use it.
	*
	* A prompt can also have a schema that defines the input it expects, the user will be prompted to enter the inputs you request. It can also have a complete function
	* for each input that will be used to provide completions for the user.
	* @template {StandardSchema | undefined} [TSchema=undefined]
	* @overload
	* @param {CreatedPrompt<TSchema>} prompt_or_options
	* @returns {void}
	*/
	/**
	* Add a prompt to the server. Prompts are used to provide the user with pre-defined messages that adds context to the LLM.
	* Use the description and title to help the user to understand what the prompt does and when to use it.
	*
	* A prompt can also have a schema that defines the input it expects, the user will be prompted to enter the inputs you request. It can also have a complete function
	* for each input that will be used to provide completions for the user.
	* @template {StandardSchema | undefined} [TSchema=undefined]
	* @overload
	* @param {PromptOptions<TSchema>} prompt_or_options
	* @param {TSchema extends undefined ? (()=>Promise<GetPromptResult> | GetPromptResult) : (input: StandardSchemaV1.InferInput<TSchema extends undefined ? never : TSchema>) => Promise<GetPromptResult> | GetPromptResult} execute
	* @returns {void}
	* */
	/**
	* Add a prompt to the server. Prompts are used to provide the user with pre-defined messages that adds context to the LLM.
	* Use the description and title to help the user to understand what the prompt does and when to use it.
	*
	* A prompt can also have a schema that defines the input it expects, the user will be prompted to enter the inputs you request. It can also have a complete function
	* for each input that will be used to provide completions for the user.
	* @template {StandardSchema | undefined} [TSchema=undefined]
	* @param {CreatedPrompt<TSchema> | PromptOptions<TSchema>} prompt_or_options
	* @param {TSchema extends undefined ? (()=>Promise<GetPromptResult> | GetPromptResult) : (input: StandardSchemaV1.InferInput<TSchema extends undefined ? never : TSchema>) => Promise<GetPromptResult> | GetPromptResult} [execute]
	*/
	prompt(prompt_or_options, execute) {
		if ("execute" in prompt_or_options) execute = prompt_or_options.execute;
		if (prompt_or_options.complete) this.#completions["ref/prompt"].set(prompt_or_options.name, prompt_or_options.complete);
		this.#notify_prompts_list_changed();
		const stored_prompt = prompt_or_options;
		stored_prompt.execute = execute;
		this.#prompts.set(prompt_or_options.name, stored_prompt);
	}
	/**
	* @type {(resource: StoredResource & { uri: string })=> void}
	*/
	#resource(resource) {
		if (resource.template && resource.complete) this.#completions["ref/resource"].set(resource.uri, resource.complete);
		if (resource.template) this.#templates.add(resource.uri);
		this.#notify_resources_list_changed();
		this.#resources.set(resource.uri, resource);
	}
	/**
	* Add a resource to the server. Resources are added manually to the context by the user to provide the LLM with additional context.
	* Use the description and title to help the user to understand what the resource is.
	* @overload
	* @param {CreatedResource} resource_or_options
	* @returns {void}
	*/
	/**
	* Add a resource to the server. Resources are added manually to the context by the user to provide the LLM with additional context.
	* Use the description and title to help the user to understand what the resource is.
	* @overload
	* @param {ResourceOptions} resource_or_options
	* @param {(uri: string) => Promise<ReadResourceResult> | ReadResourceResult} execute
	* @returns {void}
	*/
	/**
	* Add a resource to the server. Resources are added manually to the context by the user to provide the LLM with additional context.
	* Use the description and title to help the user to understand what the resource is.
	* @param {CreatedResource | ResourceOptions} resource_or_options
	* @param {(uri: string) => Promise<ReadResourceResult> | ReadResourceResult} [execute]
	*/
	resource(resource_or_options, execute) {
		if ("execute" in resource_or_options) execute = resource_or_options.execute;
		const stored_resource = resource_or_options;
		stored_resource.execute = execute;
		stored_resource.template = false;
		this.#resource(stored_resource);
	}
	/**
	* Add a resource template to the server. Resources are added manually to the context by the user to provide the LLM with additional context.
	* Resource templates are used to create resources dynamically based on a URI template. The URI template should be a valid URI template as defined in RFC 6570.
	* Resource templates can have a list method that returns a list of resources that match the template and a complete method that returns a list of resources given one of the template variables, this method will
	* be invoked to provide completions for the template variables to the user.
	* Use the description and title to help the user to understand what the resource is.
	* @template {string} TUri
	* @template {ExtractURITemplateVariables<TUri>} TVariables
	* @overload
	* @param {CreatedTemplate<TUri>} template_or_options
	* @returns {void}
	*/
	/**
	* Add a resource template to the server. Resources are added manually to the context by the user to provide the LLM with additional context.
	* Resource templates are used to create resources dynamically based on a URI template. The URI template should be a valid URI template as defined in RFC 6570.
	* Resource templates can have a list method that returns a list of resources that match the template and a complete method that returns a list of resources given one of the template variables, this method will
	* be invoked to provide completions for the template variables to the user.
	* Use the description and title to help the user to understand what the resource is.
	* @template {string} TUri
	* @template {ExtractURITemplateVariables<TUri>} TVariables
	* @overload
	* @param {TemplateOptions<TUri>} template_or_options
	* @param {(uri: string, params: Record<TVariables, string | string[]>) => Promise<ReadResourceResult> | ReadResourceResult} execute
	* @returns {void}
	*/
	/**
	* Add a resource template to the server. Resources are added manually to the context by the user to provide the LLM with additional context.
	* Resource templates are used to create resources dynamically based on a URI template. The URI template should be a valid URI template as defined in RFC 6570.
	* Resource templates can have a list method that returns a list of resources that match the template and a complete method that returns a list of resources given one of the template variables, this method will
	* be invoked to provide completions for the template variables to the user.
	* Use the description and title to help the user to understand what the resource is.
	* @template {string} TUri
	* @template {ExtractURITemplateVariables<TUri>} TVariables
	* @param {CreatedTemplate<TUri> | TemplateOptions<TUri>} template_or_options
	* @param {(uri: string, params: Record<TVariables, string | string[]>) => Promise<ReadResourceResult> | ReadResourceResult} [execute]
	*/
	template(template_or_options, execute) {
		if ("execute" in template_or_options) execute = template_or_options.execute;
		const stored_template = template_or_options;
		stored_template.execute = execute;
		stored_template.list_resources = template_or_options.list;
		stored_template.template = true;
		this.#resource(stored_template);
	}
	/**
	* The main function that receive a JSONRpc message and either dispatch a `send` event or process the request.
	*
	* @param {JSONRPCMessage} message
	* @param {Context<CustomContext>} [ctx]
	* @returns {ReturnType<JSONRPCServer['receive']> | ReturnType<JSONRPCClient['receive'] | undefined>}
	*/
	receive(message, ctx) {
		const validated_message = safeParse(union([JSONRPCRequestSchema, JSONRPCNotificationSchema]), message);
		if (validated_message.success) {
			const progress_token = validated_message.output.params?._meta?.progressToken;
			return this.#ctx_storage.run({
				...ctx ?? {},
				progress_token
			}, async () => await this.#server.receive(validated_message.output));
		}
		const validated_response = parse(union([JSONRPCResponseSchema, JSONRPCErrorSchema]), message);
		this.#lazyily_create_client();
		return this.#ctx_storage.run(ctx ?? {}, async () => this.#client?.receive(validated_response));
	}
	/**
	* Lower level api to send a request to the client, mostly useful to call client methods that not yet supported by the server or
	* if you want to send requests with json schema that is not expressible with your validation library.
	* @param {{ method: string, params?: JSONRPCParams }} request
	* @returns {Promise<unknown>}
	*/
	async request({ method, params }) {
		this.#lazyily_create_client();
		return this.#client?.request(method, params, "standalone");
	}
	/**
	* Send a notification for subscriptions
	* @template {keyof ChangedArgs} TWhat
	* @param {[what: TWhat, ...ChangedArgs[TWhat]]} args
	*/
	changed(...args) {
		const [what, id] = args;
		if (what === "prompts") this.#notify_prompts_list_changed();
		else if (what === "tools") this.#notify_tools_list_changed();
		else if (what === "resources") this.#notify_resources_list_changed();
		else {
			const resource = this.#resources.get(id);
			if (!resource) return;
			this.#notify(`notifications/resources/updated`, {
				uri: id,
				title: resource.name
			}, "broadcast");
		}
	}
	/**
	* Refresh roots list from client
	*/
	async refreshRoots() {
		await this.#refresh_roots();
	}
	/**
	* Emit an elicitation request to the client. Elicitations are used to ask the user for input in a structured way, the client will show a UI to the user to fill the input.
	* The schema should be a valid Standard Schema V1 schema and should be an Object with the properties you need.
	* The client will return the validated input as a JSON object that matches the schema.
	*
	* If the client doesn't support elicitation, it will throw an error.
	*
	* @template {StandardSchema extends undefined ? never : StandardSchema} TSchema
	* @param {string} message
	* @param {TSchema} schema
	* @returns {Promise<ElicitResult & { content?: StandardSchemaV1.InferOutput<TSchema> }>}
	*/
	async elicitation(message, schema) {
		if (!this.#client_capabilities?.elicitation) throw new McpError(-32601, "Client doesn't support elicitation");
		this.#lazyily_create_client();
		const result = await this.#client?.request("elicitation/create", {
			message,
			requestedSchema: await this.#options.adapter?.toJsonSchema(schema)
		}, "standalone");
		const elicit_result = parse(ElicitResultSchema, result);
		let validated_result = schema["~standard"].validate(elicit_result.content);
		if (validated_result instanceof Promise) validated_result = await validated_result;
		if (validated_result.issues) throw new McpError(-32603, `Invalid elicitation result: ${JSON.stringify(validated_result.issues)}`);
		return {
			...elicit_result,
			content: validated_result.value
		};
	}
	/**
	* Request language model sampling from the client
	* @param {CreateMessageRequestParams} request
	* @returns {Promise<CreateMessageResult>}
	*/
	async message(request) {
		if (!this.#client_capabilities?.sampling) throw new McpError(-32601, "Client doesn't support sampling");
		this.#lazyily_create_client();
		const validated_request = parse(CreateMessageRequestParamsSchema, request);
		const response = await this.#client?.request("sampling/createMessage", validated_request, "standalone");
		return parse(CreateMessageResultSchema, response);
	}
	/**
	* Send a progress notification to the client. This is useful for long-running operations where you want to inform the user about the progress.
	*
	* @param {number} progress The current progress value, it should be between 0 and total and should always increase
	* @param {number} [total] The total value, defaults to 1
	* @param {string} [message] An optional message to accompany the progress update
	*/
	progress(progress, total = 1, message = void 0) {
		if (this.#progress_token != null) this.#notify("notifications/progress", {
			progress,
			total,
			message,
			progressToken: this.#progress_token
		});
	}
	/**
	* Log a message to the client if logging is enabled and the level is appropriate
	*
	* @param {LoggingLevel} level
	* @param {unknown} data
	* @param {string} [logger]
	*/
	log(level, data, logger) {
		if (!this.#options.capabilities?.logging) throw new McpError(-32601, "The server doesn't support logging, please enable it in capabilities");
		const current_session_level = this.#ctx_storage.getStore()?.sessionInfo?.logLevel ?? this.#options.logging?.default ?? "info";
		if (current_session_level && this.#should_log(level, current_session_level)) this.#notify("notifications/message", {
			level,
			data,
			logger
		});
	}
	/**
	* Check if a log message should be sent based on severity levels
	* @param {LoggingLevel} message_level
	* @param {LoggingLevel} session_level
	* @returns {boolean}
	*/
	#should_log(message_level, session_level) {
		const levels = [
			"debug",
			"info",
			"notice",
			"warning",
			"error",
			"critical",
			"alert",
			"emergency"
		];
		return levels.indexOf(message_level) >= levels.indexOf(session_level);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/tmcp@1.19.2_typescript@5.9.3/node_modules/tmcp/src/tool.js
/**
* @import { StandardSchemaV1 } from "@standard-schema/spec";
* @import { ToolOptions, CreatedTool } from "./internal/internal.js";
*/
/**
* Add a tool to the server. If you want to receive any input you need to provide a schema. The schema needs to be a valid Standard Schema V1 schema and needs to be an Object with the properties you need,
* Use the description and title to help the LLM to understand what the tool does and when to use it. If you provide an outputSchema, you need to return a structuredContent that matches the schema.
*
* @template {StandardSchemaV1 | undefined} [TSchema=undefined]
* @template {StandardSchemaV1 | undefined} [TOutputSchema=undefined]
* @param {ToolOptions<TSchema, TOutputSchema>} options
* @param {TSchema extends undefined ? (()=>Promise<import("./index.js").CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>> | import("./index.js").CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>) : ((input: StandardSchemaV1.InferInput<TSchema extends undefined ? never : TSchema>) => Promise<import("./index.js").CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>> | import("./index.js").CallToolResult<TOutputSchema extends undefined ? undefined : StandardSchemaV1.InferInput<TOutputSchema extends undefined ? never : TOutputSchema>>)} execute
*/
function defineTool(options, execute) {
	return {
		...options,
		execute
	};
}

//#endregion
//#region ../../node_modules/.pnpm/tmcp@1.19.2_typescript@5.9.3/node_modules/tmcp/src/utils/index.js
/**
* @import { EmbeddedResource, ResourceLink, CallToolResult, ReadResourceResult, GetPromptResult,  CompleteResult } from "../validation/index.js";
*/
/**
* @satisfies {Record<string, (...args: any[])=>CallToolResult<any>>}
*/
const tool = {
	text(text) {
		return { content: [{
			type: "text",
			text
		}] };
	},
	error(text) {
		return {
			isError: true,
			content: [{
				type: "text",
				text
			}]
		};
	},
	media(type, data, mime_type) {
		return { content: [{
			type,
			data,
			mimeType: mime_type
		}] };
	},
	resource(resource) {
		return { content: [{
			type: "resource",
			resource
		}] };
	},
	resourceLink(resource_link) {
		return { content: [{
			type: "resource_link",
			...resource_link
		}] };
	},
	structured(obj) {
		return {
			content: [{
				type: "text",
				text: JSON.stringify(obj)
			}],
			structuredContent: obj
		};
	},
	mix(results, obj) {
		return {
			isError: results.some((r) => r.isError),
			content: results.flatMap((r) => r.content ? r.content : []),
			structuredContent: obj
		};
	}
};

//#endregion
//#region shared/comment.ts
const CLANK8Y_REPO_URL = "https://github.com/clank8y/clank8y";
const CUMULOCITY_URL = "https://cumulocity.com";
function buildClank8yCommentBody(rawBody, options) {
	const normalizedBody = (rawBody ?? "").trim();
	const footerLinks = [{
		label: "clank8y",
		url: CLANK8Y_REPO_URL
	}, {
		label: "cumulocity",
		url: CUMULOCITY_URL
	}];
	if (options?.workflowRunUrl) footerLinks.push({
		label: "workflow run",
		url: options.workflowRunUrl
	});
	const footer = footerLinks.map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`).join(" | ");
	return [
		normalizedBody || "_No summary provided._",
		"",
		`<sub>${footer}</sub>`
	].join("\n");
}

//#endregion
//#region src/utils/artifacts.ts
const CLANK8Y_ARTIFACT_DIR = ".clank8y";
const DIFF_ARTIFACT_FILE = "diff.txt";
const REVIEW_COMMENTS_ARTIFACT_FILE = "review-comments.md";
function getClank8yArtifactDirPath() {
	return path.join(process$1.cwd(), CLANK8Y_ARTIFACT_DIR);
}
function resolveClank8yArtifactPath(...segments) {
	return path.join(getClank8yArtifactDirPath(), ...segments);
}
function isWithinClank8yArtifacts(targetPath) {
	const artifactDir = getClank8yArtifactDirPath();
	const relativePath = path.relative(artifactDir, targetPath);
	return relativePath === "" || !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}
function getReviewArtifactPaths() {
	return {
		artifactDir: getClank8yArtifactDirPath(),
		diffPath: resolveClank8yArtifactPath(DIFF_ARTIFACT_FILE),
		reviewCommentsPath: resolveClank8yArtifactPath(REVIEW_COMMENTS_ARTIFACT_FILE)
	};
}
async function resetClank8yArtifacts() {
	const artifactPaths = getReviewArtifactPaths();
	await rm(artifactPaths.artifactDir, {
		force: true,
		recursive: true
	});
	await mkdir(artifactPaths.artifactDir, { recursive: true });
	return artifactPaths;
}
async function writeDiffArtifact(content) {
	const { diffPath } = getReviewArtifactPaths();
	await writeFile(diffPath, content, "utf-8");
}
async function writeReviewCommentsArtifact(content) {
	const { reviewCommentsPath } = getReviewArtifactPaths();
	await writeFile(reviewCommentsPath, content, "utf-8");
	return reviewCommentsPath;
}

//#endregion
//#region src/formatters/diff.ts
function formatFilesWithLineNumbers(files) {
	const output = [];
	const tocEntries = [];
	let currentLine = 1;
	for (const file of files) {
		const fileStartLine = currentLine;
		output.push(`## ${file.filename}`);
		output.push(`status: ${file.status}, +${file.additions}/-${file.deletions}`);
		currentLine += 2;
		if (!file.patch) {
			output.push("(binary file or no textual patch available)");
			output.push("");
			currentLine += 2;
			tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`);
			continue;
		}
		const lines = file.patch.split("\n");
		let oldLine = 0;
		let newLine = 0;
		for (const line of lines) {
			const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
			if (hunkMatch) {
				const oldStart = hunkMatch[1];
				const newStart = hunkMatch[2];
				if (!oldStart || !newStart) continue;
				oldLine = Number.parseInt(oldStart, 10);
				newLine = Number.parseInt(newStart, 10);
				output.push(line);
				currentLine += 1;
				continue;
			}
			const marker = line[0] ?? " ";
			const code = line.slice(1);
			if (marker === "-") {
				output.push(`|${oldLine}|-|${code}`);
				oldLine += 1;
			} else if (marker === "+") {
				output.push(`|${newLine}|+|${code}`);
				newLine += 1;
			} else {
				output.push(`|${oldLine}|${newLine}||${code}`);
				oldLine += 1;
				newLine += 1;
			}
			currentLine += 1;
		}
		output.push("");
		currentLine += 1;
		tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`);
	}
	const toc = [
		"# TOC",
		...tocEntries,
		""
	].join("\n");
	return {
		content: `${toc}${output.join("\n")}`,
		toc
	};
}

//#endregion
//#region src/formatters/reviewComments.ts
function formatTimestamp(timestamp) {
	if (!timestamp) return "unknown time";
	return timestamp;
}
function firstNonEmptyValue(...values) {
	for (const value of values) if (value !== null && value !== void 0) return value;
	return null;
}
function buildReviewHeader(review) {
	const reviewer = review.user?.login ?? "unknown";
	const submittedAt = formatTimestamp(review.submitted_at);
	const state = review.state ?? "UNKNOWN";
	return `Review ${review.id} by ${reviewer} at ${submittedAt} [${state}]`;
}
function buildThreadLocation(comment, rootCommentId) {
	const path = comment.path ?? "(no file path)";
	const line = firstNonEmptyValue(comment.line, comment.original_line, comment.start_line, comment.original_start_line);
	if (line === null) return `${path} [thread ${rootCommentId}]`;
	return `${path}:${line}`;
}
function formatPreviousReviewCommentsArtifact(pullRequestNumber, reviews, comments) {
	const lines = [];
	const tocEntries = [];
	const reviewById = new Map(reviews.map((review) => [review.id, review]));
	const commentById = new Map(comments.map((comment) => [comment.id, comment]));
	const threadMap = /* @__PURE__ */ new Map();
	function getRootCommentId(comment) {
		let current = comment;
		let rootId = current.id;
		const seen = /* @__PURE__ */ new Set();
		while (current.in_reply_to_id) {
			if (seen.has(current.id)) break;
			seen.add(current.id);
			const parent = commentById.get(current.in_reply_to_id);
			if (!parent) {
				rootId = current.in_reply_to_id;
				break;
			}
			current = parent;
			rootId = current.id;
		}
		return rootId;
	}
	for (const comment of comments) {
		const rootCommentId = getRootCommentId(comment);
		const threadComments = threadMap.get(rootCommentId);
		if (threadComments) threadComments.push(comment);
		else threadMap.set(rootCommentId, [comment]);
	}
	const threads = [...threadMap.entries()].flatMap(([rootCommentId, threadComments]) => {
		const sortedComments = [...threadComments].sort((left, right) => {
			const leftTime = left.created_at ?? "";
			const rightTime = right.created_at ?? "";
			return leftTime.localeCompare(rightTime) || left.id - right.id;
		});
		const rootComment = sortedComments.find((comment) => comment.id === rootCommentId) ?? sortedComments[0];
		if (!rootComment) return [];
		return {
			rootCommentId,
			rootComment,
			comments: sortedComments
		};
	}).sort((left, right) => {
		const leftPath = left.rootComment.path ?? "";
		const rightPath = right.rootComment.path ?? "";
		const pathCompare = leftPath.localeCompare(rightPath);
		if (pathCompare !== 0) return pathCompare;
		const leftLine = firstNonEmptyValue(left.rootComment.line, left.rootComment.original_line, left.rootComment.start_line, left.rootComment.original_start_line) ?? 0;
		const rightLine = firstNonEmptyValue(right.rootComment.line, right.rootComment.original_line, right.rootComment.start_line, right.rootComment.original_start_line) ?? 0;
		if (leftLine !== rightLine) return leftLine - rightLine;
		return left.rootCommentId - right.rootCommentId;
	});
	lines.push(`# Previous Review Comments For PR #${pullRequestNumber}`);
	lines.push("");
	lines.push(`reviews: ${reviews.length}`);
	lines.push(`inline_comments: ${comments.length}`);
	lines.push("");
	if (reviews.length > 0) {
		lines.push("## Reviews");
		lines.push("");
		for (const review of [...reviews].sort((left, right) => {
			const leftTime = left.submitted_at ?? "";
			const rightTime = right.submitted_at ?? "";
			return leftTime.localeCompare(rightTime) || left.id - right.id;
		})) {
			lines.push(`### ${buildReviewHeader(review)}`);
			lines.push("");
			lines.push(review.body?.trim() || "(no review body)");
			lines.push("");
		}
	}
	if (threads.length > 0) {
		lines.push("## Thread TOC");
		lines.push("");
		for (const thread of threads) tocEntries.push(`- ${buildThreadLocation(thread.rootComment, thread.rootCommentId)}`);
		lines.push(...tocEntries);
		lines.push("");
	}
	lines.push("---");
	lines.push("");
	if (threads.length === 0) {
		lines.push("No inline review comments found on this pull request yet.");
		lines.push("");
	}
	for (const thread of threads) {
		const location = buildThreadLocation(thread.rootComment, thread.rootCommentId);
		const review = thread.rootComment.pull_request_review_id ? reviewById.get(thread.rootComment.pull_request_review_id) ?? null : null;
		lines.push(`## ${location}`);
		lines.push("");
		lines.push(`root_comment_id: ${thread.rootCommentId}`);
		lines.push(`review_id: ${thread.rootComment.pull_request_review_id ?? "unknown"}`);
		lines.push(`reviewer: ${review?.user?.login ?? "unknown"}`);
		lines.push(`review_state: ${review?.state ?? "unknown"}`);
		lines.push(`thread_comments: ${thread.comments.length}`);
		lines.push("");
		if (thread.rootComment.diff_hunk) {
			lines.push("```diff");
			lines.push(thread.rootComment.diff_hunk);
			lines.push("```");
			lines.push("");
		}
		for (const comment of thread.comments) {
			const author = comment.user?.login ?? "unknown";
			lines.push(`### ${author} at ${formatTimestamp(comment.created_at)}`);
			lines.push("");
			lines.push(`comment_id: ${comment.id}`);
			lines.push(`reply_to: ${comment.in_reply_to_id ?? "root"}`);
			lines.push(comment.body?.trim() || "(no comment body)");
			lines.push("");
		}
	}
	return {
		toc: tocEntries.join("\n"),
		content: lines.join("\n")
	};
}

//#endregion
//#region src/formatters/strings.ts
function normalizeEscapedNewlines(text) {
	return text.replace(/\\r\\n|\\n|\\r/g, (match) => {
		if (match === "\\r\\n") return "\r\n";
		return "\n";
	});
}
function stripSurroundingQuotes(text) {
	let result = text;
	if (result.startsWith("\"")) result = result.slice(1);
	if (result.endsWith("\"")) result = result.slice(0, -1);
	return result;
}
function normalizeToolString(text) {
	return normalizeEscapedNewlines(stripSurroundingQuotes(text));
}

//#endregion
//#region src/modes/review/mcps/github.ts
const SET_PULL_REQUEST_CONTEXT_TOOL_NAME = "set-pull-request-context";
const PREPARE_PULL_REQUEST_REVIEW_TOOL_NAME = "prepare-pull-request-review";
const CREATE_PULL_REQUEST_REVIEW_TOOL_NAME = "create-pull-request-review";
const GET_PULL_REQUEST_FILE_CONTENT_TOOL_NAME = "get-pull-request-file-content";
const CREATE_PULL_REQUEST_COMMENT_TOOL_NAME = "create-pull-request-comment";
const FILE_CHUNK_DEFAULT_LIMIT = 200;
const FILE_CHUNK_MAX_LIMIT = 400;
const FILE_CHUNK_MAX_CHARS = 3e4;
const FILE_FULL_MAX_LINES = 250;
const FILE_FULL_MAX_CHARS = 2e4;
async function fetchAllPullRequestFiles() {
	const octokit = await getOctokit();
	const pullRequest = getActivePullRequestContext();
	return await octokit.paginate(octokit.rest.pulls.listFiles, {
		owner: pullRequest.owner,
		repo: pullRequest.repo,
		pull_number: pullRequest.number,
		per_page: 100
	});
}
async function fetchAllPullRequestReviews() {
	const octokit = await getOctokit();
	const pullRequest = getActivePullRequestContext();
	return await octokit.paginate(octokit.rest.pulls.listReviews, {
		owner: pullRequest.owner,
		repo: pullRequest.repo,
		pull_number: pullRequest.number,
		per_page: 100
	});
}
async function fetchAllPullRequestReviewComments() {
	const octokit = await getOctokit();
	const pullRequest = getActivePullRequestContext();
	return await octokit.paginate(octokit.rest.pulls.listReviewComments, {
		owner: pullRequest.owner,
		repo: pullRequest.repo,
		pull_number: pullRequest.number,
		per_page: 100
	});
}
function reviewGitHubMCP() {
	const mcp = new McpServer({
		name: "clank8y-review-github-mcp",
		description: "A MCP server that helps you complete pull request reviews",
		version: "1.0.0"
	}, {
		adapter: new ValibotJsonSchemaAdapter(),
		capabilities: { tools: { listChanged: true } }
	});
	const githubMcpTools = [
		defineTool({
			name: SET_PULL_REQUEST_CONTEXT_TOOL_NAME,
			description: "Set the pull request context for the current review session. Call this before any other pull request tools and provide the repository plus pull request number from the prompt context.",
			title: "Set Pull Request Context",
			schema: pipe(object({
				repository: pipe(string(), description("Repository in owner/repo format for the pull request to review.")),
				pr_number: pipe(number(), description("The pull request number to set as the active review context."))
			}), description("Arguments for selecting the active pull request before any review-specific GitHub MCP tools are used."))
		}, async ({ repository, pr_number }) => {
			try {
				const pullRequest = await setPullRequestContext({
					repository,
					prNumber: pr_number
				});
				return tool.structured({
					success: true,
					context: {
						repository: `${pullRequest.owner}/${pullRequest.repo}`,
						pullRequestNumber: pullRequest.number,
						baseRef: pullRequest.baseRef,
						headRef: pullRequest.headRef
					},
					pullRequest: {
						number: pullRequest.number,
						owner: pullRequest.owner,
						repo: pullRequest.repo,
						headRef: pullRequest.headRef,
						headSha: pullRequest.headSha,
						baseRef: pullRequest.baseRef,
						baseSha: pullRequest.baseSha
					}
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return tool.error(`Failed to set pull request context: ${message}`);
			}
		}),
		defineTool({
			name: PREPARE_PULL_REQUEST_REVIEW_TOOL_NAME,
			description: "Single entrypoint for review setup: PR metadata, file summary, and diff TOC with chunk-read instructions",
			title: "Prepare Pull Request Review"
		}, async () => {
			try {
				const octokit = await getOctokit();
				const pullRequest = getActivePullRequestContext();
				const [{ data: pr }, files, reviews, reviewComments] = await Promise.all([
					octokit.rest.pulls.get({
						owner: pullRequest.owner,
						repo: pullRequest.repo,
						pull_number: pullRequest.number
					}),
					fetchAllPullRequestFiles(),
					fetchAllPullRequestReviews(),
					fetchAllPullRequestReviewComments()
				]);
				const artifactPaths = getReviewArtifactPaths();
				await writeDiffArtifact(formatFilesWithLineNumbers(files).content);
				const previousReviewComments = formatPreviousReviewCommentsArtifact(pr.number, reviews, reviewComments);
				const reviewCommentsPath = await writeReviewCommentsArtifact(previousReviewComments.content);
				const fileSummaries = files.map((file) => ({
					path: file.filename,
					status: file.status,
					additions: file.additions,
					deletions: file.deletions,
					hasPatch: !!file.patch
				}));
				return tool.structured({
					pullRequest: {
						number: pr.number,
						title: pr.title,
						body: pr.body,
						url: pr.html_url,
						state: pr.state,
						draft: pr.draft,
						merged: pr.merged,
						author: pr.user?.login ?? null,
						base: {
							ref: pr.base.ref,
							sha: pr.base.sha
						},
						head: {
							ref: pr.head.ref,
							sha: pr.head.sha
						},
						labels: pr.labels.map((label) => typeof label === "string" ? label : label.name),
						assignees: pr.assignees?.map((assignee) => assignee.login) ?? [],
						isFork: pr.head.repo?.full_name !== pr.base.repo.full_name
					},
					files: {
						count: fileSummaries.length,
						summary: fileSummaries
					},
					diff: {
						path: artifactPaths.diffPath,
						instructions: "Read the TOC at the top first to map files to line ranges. Then work through file groups selectively. Use rg or grep on this file to search for repeated patterns."
					},
					previousReviews: {
						path: reviewCommentsPath,
						reviewCount: reviews.length,
						inlineCommentCount: reviewComments.length,
						toc: previousReviewComments.toc,
						instructions: "Read this separate artifact to see previous review bodies and inline comment history, including who wrote what and when. Use it to avoid repeating already-given feedback unless the new diff introduces a new instance of the same problem."
					}
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return tool.error(`Failed to prepare pull request review context: ${message}`);
			}
		}),
		defineTool({
			name: CREATE_PULL_REQUEST_REVIEW_TOOL_NAME,
			description: "Submit a review for the current pull request with optional inline comments",
			title: "Create Pull Request Review",
			schema: pipe(object({
				body: optional(pipe(string(), description("1-2 sentence summary for the review. Put most actionable feedback in inline comments. Do not wrap the value in quotation marks."))),
				commit_id: optional(pipe(string(), description("Optional commit SHA for the review. Defaults to current PR head SHA."))),
				comments: optional(pipe(array(pipe(object({
					path: pipe(string(), description("Path of the file to comment on, relative to repository root.")),
					line: pipe(number(), description("End line of the comment range in the diff (new file line numbering).")),
					start_line: optional(pipe(number(), description("Start line of the comment range. For single-line comments, set equal to line."))),
					side: optional(pipe(picklist(["LEFT", "RIGHT"]), description("Diff side: LEFT for old/deleted lines, RIGHT for new/unchanged lines. Defaults to RIGHT."))),
					body: optional(pipe(string(), description("Explanatory comment text. Optional if suggestion is provided."))),
					suggestion: optional(pipe(string(), description("Replacement code for [start_line, line]. Must preserve indentation.")))
				}), description("Single inline review comment payload."))), description("Inline review comments. Use these for line-level feedback in the diff.")))
			}), description("Payload for submitting a pull request review in one API call."))
		}, async ({ body, commit_id, comments }) => {
			try {
				const octokit = await getOctokit();
				const runtimeContext = getClank8yRuntimeContext();
				const pullRequest = getActivePullRequestContext();
				const reviewCommentsInput = comments ?? [];
				const reviewBody = buildClank8yCommentBody(body === void 0 ? void 0 : normalizeToolString(body), { workflowRunUrl: runtimeContext.runInfo?.url ?? null });
				let commitSha = commit_id;
				if (!commitSha) {
					const { data: pr } = await octokit.rest.pulls.get({
						owner: pullRequest.owner,
						repo: pullRequest.repo,
						pull_number: pullRequest.number
					});
					commitSha = pr.head.sha;
				}
				const apiComments = reviewCommentsInput.map((comment) => {
					const side = comment.side ?? "RIGHT";
					const startLine = comment.start_line ?? comment.line;
					let commentBody = normalizeToolString(comment.body ?? "");
					if (comment.suggestion !== void 0) {
						const suggestionBlock = `\`\`\`suggestion\n${normalizeToolString(comment.suggestion)}\n\`\`\``;
						commentBody = commentBody ? `${commentBody}\n\n${suggestionBlock}` : suggestionBlock;
					}
					return {
						path: comment.path,
						line: comment.line,
						side,
						body: commentBody,
						start_line: startLine,
						start_side: side
					};
				});
				const params = {
					owner: pullRequest.owner,
					repo: pullRequest.repo,
					pull_number: pullRequest.number,
					event: "COMMENT",
					commit_id: commitSha
				};
				params.body = reviewBody;
				if (apiComments.length > 0) params.comments = apiComments;
				const result = await octokit.rest.pulls.createReview(params);
				return tool.text(encode({
					success: true,
					review_id: result.data.id,
					state: result.data.state,
					url: result.data.html_url,
					submitted_at: result.data.submitted_at,
					comment_count: apiComments.length
				}));
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return tool.error(`Failed to create pull request review: ${message}`);
			}
		}),
		defineTool({
			name: GET_PULL_REQUEST_FILE_CONTENT_TOOL_NAME,
			description: "Get content for a changed pull request file, with chunked reads by default",
			title: "Get Pull Request File Content",
			schema: pipe(object({
				filename: pipe(string(), description("Path of a file changed in the current pull request.")),
				offset: optional(pipe(number(), description("1-based starting line number for chunked file reads. Defaults to 1."))),
				limit: optional(pipe(number(), description("Maximum number of lines to return for chunked reads. Defaults to 200 and is capped at 400."))),
				full: optional(pipe(boolean(), description("Return full file content when true. Allowed only for small files (max 250 lines and 20,000 characters).")))
			}), description("Arguments for fetching the head-version content of a changed pull request file with optional chunking."))
		}, async ({ filename, offset, limit, full }) => {
			try {
				const octokit = await getOctokit();
				const pullRequest = getActivePullRequestContext();
				if (!(await fetchAllPullRequestFiles()).find((f) => f.filename === filename)) return tool.error(`File ${filename} not found in pull request`);
				const { data: content } = await octokit.rest.repos.getContent({
					owner: pullRequest.owner,
					repo: pullRequest.repo,
					path: filename,
					ref: pullRequest.headSha
				});
				if (Array.isArray(content)) return tool.error(`Path ${filename} resolved to a directory, expected a file`);
				if (!("content" in content) || !content.content) return tool.error(`No textual content available for ${filename}`);
				const encoding = content.encoding === "base64" ? "base64" : "utf-8";
				const decodedContent = Buffer$1.from(content.content, encoding).toString("utf-8");
				const lines = decodedContent.split("\n");
				const totalLines = lines.length;
				if (full) {
					if (totalLines > FILE_FULL_MAX_LINES || decodedContent.length > FILE_FULL_MAX_CHARS) return tool.error([
						`Refusing full file read for ${filename}.`,
						`Hard limits: <= ${FILE_FULL_MAX_LINES} lines and <= ${FILE_FULL_MAX_CHARS} characters.`,
						`Actual: ${totalLines} lines, ${decodedContent.length} characters.`,
						"Use chunked reads with offset + limit instead."
					].join(" "));
					return tool.text(decodedContent);
				}
				const requestedOffset = offset ?? 1;
				const startLine = Math.max(1, requestedOffset);
				const requestedLimit = limit ?? FILE_CHUNK_DEFAULT_LIMIT;
				const normalizedLimit = Math.max(1, Math.min(FILE_CHUNK_MAX_LIMIT, requestedLimit));
				const endLine = Math.min(totalLines, startLine + normalizedLimit - 1);
				const rawChunk = lines.slice(startLine - 1, endLine).join("\n");
				const chunk = rawChunk.length > FILE_CHUNK_MAX_CHARS ? `${rawChunk.slice(0, FILE_CHUNK_MAX_CHARS)}\n\n[truncated: chunk exceeded ${FILE_CHUNK_MAX_CHARS} characters]` : rawChunk;
				return tool.text([
					`File chunk ${startLine}-${endLine} of ${totalLines} for ${filename}`,
					`Remaining lines after this chunk: ${Math.max(0, totalLines - endLine)}`,
					"",
					chunk
				].join("\n"));
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return tool.error(`Failed to load PR file content: ${message}`);
			}
		}),
		defineTool({
			name: CREATE_PULL_REQUEST_COMMENT_TOOL_NAME,
			description: `Post a simple comment on the pull request. Use this instead of ${CREATE_PULL_REQUEST_REVIEW_TOOL_NAME} when you have no inline review findings to submit — for example when the diff is clean or all issues are already covered by open review comments.`,
			title: "Create Pull Request Comment",
			schema: pipe(object({ body: pipe(string(), description("The comment body. Briefly explain why no review was submitted (e.g. no issues found, all issues already covered by open comments). Do not wrap the value in quotation marks.")) }), description("Payload for posting a simple PR comment without a formal review."))
		}, async ({ body }) => {
			try {
				const octokit = await getOctokit();
				const runtimeContext = getClank8yRuntimeContext();
				const pullRequest = getActivePullRequestContext();
				const commentBody = buildClank8yCommentBody(normalizeToolString(body), { workflowRunUrl: runtimeContext.runInfo?.url ?? null });
				const result = await octokit.rest.issues.createComment({
					owner: pullRequest.owner,
					repo: pullRequest.repo,
					issue_number: pullRequest.number,
					body: commentBody
				});
				return tool.text(encode({
					success: true,
					comment_id: result.data.id,
					url: result.data.html_url
				}));
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return tool.error(`Failed to create pull request comment: ${message}`);
			}
		})
	];
	mcp.tools(githubMcpTools);
	const transport = new HttpTransport(mcp, { path: "/mcp" });
	const server = serve({
		manual: true,
		port: 0,
		fetch: async (req) => {
			const response = await transport.respond(req);
			if (!response) return new NodeResponse("Not found", { status: 404 });
			return response;
		}
	});
	let status = { state: "stopped" };
	return {
		serverType: "http",
		allowedTools: githubMcpTools.map((tool) => tool.name),
		get status() {
			return status;
		},
		start: async () => {
			await server.serve();
			const { url } = await server.ready();
			if (!url) {
				await server.close(true);
				throw new Error("Failed to start GitHub MCP server");
			}
			const actualUrl = url.endsWith("/") ? `${url}mcp` : `${url}/mcp`;
			status = {
				state: "running",
				url: actualUrl
			};
			return {
				url: actualUrl,
				toolNames: githubMcpTools.map((tool) => tool.name)
			};
		},
		stop: async () => {
			await server.close(true);
			status = { state: "stopped" };
		}
	};
}

//#endregion
//#region src/modes/review/context.ts
let _activePullRequestContext = null;
function parseRepository(repository) {
	const normalizedRepository = repository.trim();
	if (!normalizedRepository) throw new Error("Repository is required (format: owner/repo).");
	const segments = normalizedRepository.split("/");
	const [owner, repo] = segments;
	if (segments.length !== 2 || !owner || !repo) throw new Error(`Invalid repository value '${normalizedRepository}'. Expected format: owner/repo.`);
	return {
		owner,
		repo
	};
}
function resetPullRequestContext() {
	_activePullRequestContext = null;
}
async function setPullRequestContext(params) {
	if (!Number.isFinite(params.prNumber) || params.prNumber < 1) throw new Error(`Invalid pull request number '${String(params.prNumber)}'.`);
	const repository = parseRepository(params.repository);
	const { data: pr } = await (await getOctokit()).rest.pulls.get({
		owner: repository.owner,
		repo: repository.repo,
		pull_number: params.prNumber
	});
	_activePullRequestContext = {
		owner: repository.owner,
		repo: repository.repo,
		number: pr.number,
		headSha: pr.head.sha,
		headRef: pr.head.ref,
		baseSha: pr.base.sha,
		baseRef: pr.base.ref
	};
	return _activePullRequestContext;
}
function getActivePullRequestContext() {
	if (!_activePullRequestContext) throw new Error(`Pull request context is not initialized. Call ${SET_PULL_REQUEST_CONTEXT_TOOL_NAME} first.`);
	return _activePullRequestContext;
}

//#endregion
//#region src/modes/basePrompts.ts
const PERSONA = [
	"## Persona",
	"",
	"You are **clank8y** — a precise, sharp-eyed code review bot for Cumulocity IoT frontend applications.",
	"You speak with mechanical confidence: direct, concise, no fluff.",
	"You are friendly but never waste words — every sentence carries signal.",
	"When you are unsure, you say so honestly instead of guessing.",
	"",
	"Tone guidelines:",
	"- Be constructive, not condescending. You are a teammate, not a gatekeeper.",
	"- Use dry wit sparingly — keep it professional.",
	"- Prefer concrete over vague. \"Use `AlertService` from `@c8y/ngx-components`\" beats \"consider using the platform service\".",
	"- Adapt to the repository's existing code style and conventions.",
	"- Never use emdashes (—). Rather break up sentences into shorter ones."
].join("\n");
const KNOWLEDGE_VERIFICATION = [
	"## Knowledge verification — MANDATORY",
	"",
	"Angular evolves rapidly. Your training data may be stale.",
	"Cumulocity's Web SDK has its own component library and conventions that you cannot infer from generic Angular knowledge.",
	"",
	"**You must verify framework- and platform-specific code against the MCP docs during the review.**",
	"Do not rely on memory for Angular or Cumulocity-specific claims. If you did not verify it, treat it as unverified.",
	"**For anything Cumulocity-specific, Codex MCP is the source of truth.**",
	"If the code touches Cumulocity APIs, components, hooks, widgets, CSS utilities, style classes, design tokens, extension points, or platform services, you should expect to use Codex MCP before making a judgment.",
	"",
	"### Angular MCP — targeted verification (required when Angular-specific concerns appear)",
	"- If the diff touches components, templates, signals, DI, control flow, forms, change detection, or RxJS interop, call Angular MCP.",
	"- Use `get_best_practices` to verify the pattern you are evaluating.",
	"- Use `find_examples` when template syntax, signals usage, or component structure needs a concrete reference.",
	"- Use `search_documentation` for any Angular API or syntax you are uncertain about.",
	"- If Angular MCP confirms a pattern is valid — do NOT flag it, even if it looks unfamiliar to you.",
	"",
	"### Codex MCP — targeted verification (required when Cumulocity-specific concerns appear)",
	"- Treat Codex MCP as mandatory, not optional, for Cumulocity-specific review decisions.",
	"- If a changed file imports `@c8y/*`, call Codex MCP unless the change is obviously unrelated boilerplate.",
	"- If the diff touches `@c8y/ngx-components`, extension hooks, platform services, widgets, navigator/action bar integrations, CSS utilities, or design tokens, call Codex MCP.",
	"- If the diff touches Cumulocity CSS classes, styling helpers, color tokens, spacing tokens, icon usage, or design-system conventions, call Codex MCP.",
	"- Use `get-codex-structure` when you need to orient yourself within the documentation surface.",
	"- Use `query-codex` to identify the relevant platform service, component, hook, pipe, or design-system concept.",
	"- Use `get-codex-documents` to read the FULL documentation page before deciding whether something is correct, missing, or reinvented.",
	"- Specifically check whether the platform already provides what the developer is building or importing.",
	"- Verify CSS classes, color values, spacing tokens, icons, and design tokens against the Codex design system documentation.",
	"",
	"DO NOT hallucinate APIs. If you cannot verify something exists via MCP tools, say so explicitly."
].join("\n");

//#endregion
//#region src/modes/review/prompt.ts
const BASE_REVIEW_PROMPT = [
	PERSONA,
	"",
	KNOWLEDGE_VERIFICATION,
	"",
	[
		"## Review scope",
		"",
		"You specialize in **Cumulocity IoT frontend application code** — Angular apps built with `@c8y/ngx-components`.",
		"This is your primary domain. Generic backend, infrastructure, or non-frontend code is out of scope unless it has critical issues.",
		"",
		"Primary focus (Cumulocity + Angular):",
		"- Correct usage of `@c8y/ngx-components` components, services, pipes, directives, and hooks.",
		"- Angular best practices: modern control flow (`@if`, `@for`, `@switch`), signals, standalone components, proper dependency injection, `input()`, `output()`, `model()`.",
		"- **Signals over RxJS** — this is a high-priority review axis (see dedicated section below).",
		"- Cumulocity design system compliance: CSS utility classes, design tokens, color tokens — flag hardcoded colors/spacing when platform tokens exist.",
		"- Use of platform-provided services over custom implementations (e.g. `AlertService`, `AppStateService`, `RealtimeService`, `UserPreferencesService`).",
		"- Proper usage of extension points and hooks (function `hook*` providers, widget hooks, navigator hooks, action bar hooks).",
		"- Internationalization: `translate` pipe/directive usage, missing translation keys.",
		"- Widget development patterns: `HOOK_COMPONENTS`, widget config, `OnBeforeSave` lifecycle.",
		"- Microfrontend patterns and module federation considerations.",
		"",
		"Secondary focus (always flag regardless of scope):",
		"- Critical security issues (XSS, injection, credential leaks, unsafe `innerHTML`).",
		"- Obvious performance anti-patterns (subscriptions never unsubscribed, missing `trackBy`, heavy computation in templates).",
		"- Dead code, unused imports, or copy-paste errors that clearly slipped through.",
		"- **Lodash usage** that can be replaced with native JS/TS or `es-toolkit` (see dedicated section below)."
	].join("\n"),
	"",
	[
		"## Signals over RxJS — high priority",
		"",
		"Angular signals (`signal`, `computed`, `effect`, `input`, `output`, `model`, `linkedSignal`) are the modern reactive primitive.",
		"Review RxJS usage with extra scrutiny — many patterns that previously required RxJS are now cleaner with signals.",
		"",
		"### What to flag:",
		"- **Decorator-based `@Input()` and `@Output()`** → replace with signal-based `input()`, `input.required()`, `output()`, and `model()` functions.",
		"- Overly complex RxJS chains (`.pipe(switchMap, map, tap, catchError, ...)`) that could be a simple `computed()` or `effect()`.",
		"- `BehaviorSubject` used as local component state → replace with `signal()`.",
		"- `combineLatest` + `map` just to derive a value from other observables → replace with `computed()` when inputs are signals.",
		"- Manual `.subscribe()` for side effects that could be an `effect()`.",
		"- `@Input() set ...` + manual change tracking → replace with `input()` signal + `computed()`.",
		"- `@Output() event = new EventEmitter()` → replace with `output()` or `output<Type>()`.",
		"- `async` pipe in templates chaining multiple observables → consider signal-based approach with `toSignal()`.",
		"- `takeUntil(destroy$)` / `takeUntilDestroyed()` patterns that exist only because of manual subscriptions — signals eliminate the need.",
		"",
		"### What NOT to flag:",
		"- RxJS for genuinely stream-based scenarios (WebSocket, real-time event streams, complex debounce/throttle/retry/backoff).",
		"- `HttpClient` calls — these return observables and that is fine; no need to wrap in `toSignal()` unless it simplifies the component.",
		"- Cumulocity services that return observables by design (e.g. `RealtimeService`) — these are stream-native.",
		"",
		"### How to suggest replacements:",
		"- Show a concrete before/after: the RxJS version and the equivalent signals version.",
		"- Reference Angular's interop utilities: `toSignal()`, `toObservable()`, `outputToObservable()`, `outputFromObservable()`.",
		"- Point the developer to the **Angular MCP** docs: \"Check `search_documentation` or `get_best_practices` on Angular signals and RxJS interop for migration guidance.\"",
		"- When in doubt, verify via Angular MCP that the signal utility you are recommending actually exists before suggesting it.",
		"",
		"### Severity:",
		"- **Medium** for unnecessarily complex RxJS that has a straightforward signal equivalent.",
		"- **Low** for cases where RxJS works but signals would be marginally cleaner.",
		"- Do NOT flag as **High** — working RxJS is not a bug, just a modernization opportunity."
	].join("\n"),
	"",
	[
		"## Lodash & utility libraries",
		"",
		"Lodash (`lodash`) is widely used in the Cumulocity ecosystem but is often unnecessary in modern TypeScript.",
		"",
		"### Review strategy:",
		"- For each lodash import, ask: does native JS/TS cover this?",
		"- Many lodash functions have direct native equivalents: `_.map` → `Array.map`, `_.filter` → `Array.filter`, `_.find` → `Array.find`, `_.includes` → `Array.includes` / `Set.has`, `_.keys` → `Object.keys`, `_.values` → `Object.values`, `_.assign` → spread / `Object.assign`, `_.isNil` → `== null`, `_.isEmpty` on arrays → `.length === 0`.",
		"- `_.get(obj, \"a.b.c\")` → optional chaining `obj?.a?.b?.c`.",
		"- `_.cloneDeep` → `structuredClone()` (available in all modern runtimes).",
		"- `_.uniq` → `[...new Set(arr)]`. `_.uniqBy` → slightly more involved but still doable natively.",
		"",
		"### When lodash IS justified:",
		"- Complex deep operations with no clean native equivalent (e.g. `_.merge` with deep recursive merge, `_.debounce` with specific options — though Angular has `rxjs/debounceTime` or signal-based alternatives).",
		"- Performance-critical hot paths where lodash's optimized implementation matters (rare in UI code).",
		"",
		"### When suggesting removal:",
		"- If the import is for a trivially replaceable function, suggest the native equivalent inline.",
		"- If the project uses many lodash utilities and native replacement is clean, recommend [`es-toolkit`](https://es-toolkit.dev/) as a modern, tree-shakeable, zero-dependency alternative.",
		"- `es-toolkit` provides lodash-compatible APIs with smaller bundle size and better TypeScript types.",
		"",
		"### Severity:",
		"- **Medium** for lodash usage that has a trivial native equivalent (unnecessary dependency weight).",
		"- **Low** for lodash usage that works but could be replaced with `es-toolkit` or a slightly more verbose native approach.",
		"- Do not flag lodash usage that genuinely has no clean native/es-toolkit equivalent."
	].join("\n"),
	"",
	[
		"## Required workflow",
		"",
		"You have three MCP servers available:",
		"- **GitHub MCP** — PR metadata, diffs, file content, and review submission.",
		"- **Angular MCP** — Angular documentation, best practices, and code examples.",
		"- **Codex MCP** — Cumulocity Web SDK documentation: components, services, design system, hooks, pipes, CSS utilities.",
		"",
		"### Step-by-step:",
		"",
		`1) **Set PR context** via the GitHub MCP tool \`${SET_PULL_REQUEST_CONTEXT_TOOL_NAME}\` using the \`repository\` (in \`owner/repo\` form) and \`pr_number\` from EVENT-LEVEL INSTRUCTIONS.`,
		"   - Do not call any other GitHub MCP tool before this.",
		"",
		`2) **Prepare review** via \`${PREPARE_PULL_REQUEST_REVIEW_TOOL_NAME}\` (single entrypoint).`,
		"   - This returns PR metadata, file summary, a `diff.path`, and a separate `previousReviews.path` artifact with previous review bodies and inline comment history.",
		"",
		"3) **Review iteratively** — move back and forth between diff inspection, branch context, and documentation verification.",
		"   Good review is not \"research first, then review\". It is an alternating loop: inspect change, inspect code context, verify best practice, note findings, continue.",
		"   For Angular or Cumulocity-specific code, documentation verification is not optional.",
		"   In this codebase, Cumulocity-specific review should lean on Codex MCP heavily.",
		"   If the change touches `@c8y/*` imports, Cumulocity styles, or platform concepts, Codex MCP should usually be one of your next tool calls.",
		"",
		"   a) **Start from the diff artifact:**",
		"      - Read `.clank8y/diff.txt` first and follow the TOC to inspect the changed areas selectively.",
		"      - Use the diff to decide where to spend review time. Do not blindly read full files first.",
		"      - Read `.clank8y/review-comments.md` early to understand what feedback was already given on this PR.",
		"      - Treat open (unresolved) review comments as active — do not resubmit a finding that an existing open comment already covers.",
		"",
		"   b) **Use branch file content only when the diff is not enough:**",
		`      - Call \`${GET_PULL_REQUEST_FILE_CONTENT_TOOL_NAME}\` when you need surrounding code, implementation details, or data flow that is not visible in the diff.`,
		"      - Prefer targeted reads of specific changed files over broad full-file reads.",
		"",
		"   c) **Verify best practice when something looks questionable or unfamiliar:**",
		"      - For Angular patterns, use `get_best_practices`, `find_examples`, and `search_documentation`.",
		"      - For Cumulocity APIs, components, hooks, widgets, CSS utilities, and design tokens, use `query-codex` and `get-codex-documents`.",
		"      - If both Angular and Codex could apply, start with Codex for Cumulocity-specific code and then use Angular MCP for Angular-only concerns.",
		"      - Research is part of the review loop. Do it as soon as the diff or file context raises a framework- or platform-specific question.",
		"      - If the changed code is Angular-specific or Cumulocity-specific and you did not verify it with the relevant MCP, assume your review is incomplete.",
		"      - If the changed code touches `@c8y/*` or another Cumulocity concept and you did not use Codex MCP, assume your review is incomplete.",
		"      - If the changed code touches Cumulocity styles, CSS classes, tokens, or visual components and you did not use Codex MCP, assume your review is incomplete.",
		"",
		"   d) **Expand suspected repeated mistakes from the diff artifact:**",
		"      - After spotting a plausible issue, use `rg` or `grep` against `.clank8y/diff.txt` to search for repeated occurrences of the same API, token, selector, utility, or code pattern.",
		"      - Prefer targeted searches with distinctive strings taken from the suspicious diff hunk rather than broad exploratory searches.",
		"      - Use the results to decide which additional diff sections and changed files deserve follow-up review.",
		"      - If `rg` or `grep` suggests the issue repeats, confirm each repeated case in diff context or changed-file context before including it in the review.",
		"",
		"4) **Formulate findings** with severity (high / medium / low):",
		"   - High: security issues, incorrect API usage that would cause runtime errors, broken patterns.",
		"   - Medium: missing platform utilities, non-idiomatic patterns, design system violations.",
		"   - Low: style nitpicks, minor improvements, suggestions for better alternatives.",
		"   - If you see a pattern once and it may repeat elsewhere, search for it in the diff before finalizing.",
		"",
		"5) **Cross-check against open review comments (mandatory gate)**",
		"   Before submitting, compare every finding you intend to include against the open (unresolved) comments in `.clank8y/review-comments.md`.",
		"   For each finding, ask: does an open, unresolved comment already exist that covers this exact issue on the same code location?",
		"   - **Yes, open comment exists → drop the finding.** The existing comment is still active and visible to the author. Resubmitting it creates noise.",
		"   - **Open comment exists but the new diff introduces a distinct, fresh instance in different code → keep the finding.** Reference the prior comment for context.",
		"   - **Prior comment was resolved but the underlying issue persists in the new diff → keep the finding.** It is appropriate to re-raise resolved issues when the code still has the problem.",
		"   - **No prior comment → keep the finding.**",
		"   This step is not optional. If you skip it, your review will contain duplicate noise that degrades trust.",
		"",
		"6) **Submit results:**",
		`   - **If you have inline findings** → call \`${CREATE_PULL_REQUEST_REVIEW_TOOL_NAME}\` with your comments and a short summary body.`,
		`   - **If you have zero findings** (the diff is clean, or every issue is already covered by an open review comment) → call \`${CREATE_PULL_REQUEST_COMMENT_TOOL_NAME}\` instead. Briefly explain why no review was submitted (e.g. "No new issues found — all previous feedback is still open and covers the current diff.").`,
		"   You must call exactly one of these two tools before finishing. Never finish without submitting.",
		"",
		"### Completion criteria (mandatory):",
		`- Do not finish without calling either \`${CREATE_PULL_REQUEST_REVIEW_TOOL_NAME}\` (when you have findings) or \`${CREATE_PULL_REQUEST_COMMENT_TOOL_NAME}\` (when you have none).`,
		"- If the PR contains Angular-specific or Cumulocity-specific changes, confirm you verified the relevant patterns with Angular MCP or Codex MCP before finalizing.",
		"- If the PR touches `@c8y/*`, Cumulocity hooks, widgets, services, or design tokens, confirm you queried Codex MCP before finalizing.",
		"- If there are findings, submit a review with inline comments containing concrete fixes and reference the docs where possible.",
		"- If there are no findings, post a comment. Do not submit an empty review.",
		"- Only include findings you have verified — drop speculative or unconfirmed comments.",
		"- Confirm you completed the open-comment cross-check (step 5) and dropped any findings already covered by open, unresolved review comments.",
		"- Mention the user from EVENT-LEVEL INSTRUCTIONS so they are notified.",
		"",
		"### Tooling constraints:",
		"- Use GitHub MCP tools for PR operations.",
		"- Use Angular MCP to verify Angular patterns — do not rely solely on your training data.",
		"- Use Codex MCP to verify Cumulocity patterns — the platform has a rich component/service library.",
		"- Native file tools are allowed only so you can read `.clank8y/diff.txt` and `.clank8y/review-comments.md`.",
		"- Use `rg` or `grep` as the only local search tool, and only to search `.clank8y/diff.txt` or `.clank8y/review-comments.md` for patterns you are already investigating.",
		"- Do not edit repository source files in review mode.",
		"- Avoid unrelated shell or local file exploration tools for review logic.",
		"- Do not use broad workspace search. Keep searches narrowly scoped to `.clank8y/diff.txt`, `.clank8y/review-comments.md`, and to patterns you are already investigating."
	].join("\n")
].join("\n");
function buildReviewPrompt(promptContext) {
	const normalized = promptContext.trim();
	if (!normalized) return BASE_REVIEW_PROMPT;
	return [
		BASE_REVIEW_PROMPT,
		"",
		normalized
	].join("\n");
}

//#endregion
//#region src/mcp/angular.ts
const ANGULAR_MCP_COMMAND = "npx";
const ANGULAR_MCP_ARGS = [
	"-y",
	"@angular/cli",
	"mcp"
];
/**
* Tools exposed from the Angular CLI MCP server.
* - `find_examples`       — authoritative Angular code examples (local)
* - `get_best_practices`  — Angular best practices guide (local)
* - `search_documentation`— searches angular.dev (remote)
*/
const ANGULAR_ALLOWED_TOOLS = [
	"find_examples",
	"get_best_practices",
	"search_documentation"
];
let _angularMCP = null;
function angularMCP() {
	if (!_angularMCP) _angularMCP = createAngularMCP();
	return _angularMCP;
}
function createAngularMCP() {
	let status = { state: "stopped" };
	return {
		serverType: "stdio",
		allowedTools: ANGULAR_ALLOWED_TOOLS,
		get status() {
			return status;
		},
		start: async () => {
			status = { state: "running" };
			return {
				command: ANGULAR_MCP_COMMAND,
				args: ANGULAR_MCP_ARGS,
				toolNames: ANGULAR_ALLOWED_TOOLS
			};
		},
		stop: async () => {
			status = { state: "stopped" };
		}
	};
}

//#endregion
//#region src/mcp/codex.ts
const CODEX_MCP_URL = "https://c8y-codex-mcp.schplitt.workers.dev/mcp";
let _codexMCP = null;
function codexMCP() {
	if (!_codexMCP) _codexMCP = createCodexMCP();
	return _codexMCP;
}
function createCodexMCP() {
	return {
		serverType: "http",
		allowedTools: ["*"],
		get status() {
			return { state: "running" };
		},
		start: async () => ({
			url: CODEX_MCP_URL,
			toolNames: []
		}),
		stop: async () => {}
	};
}

//#endregion
//#region src/modes/review/mcps/index.ts
function reviewMCPs() {
	return {
		github: reviewGitHubMCP(),
		codex: codexMCP(),
		angular: angularMCP()
	};
}

//#endregion
//#region src/modes/review/index.ts
function getReviewModeRuntime(promptContext) {
	resetPullRequestContext();
	return {
		prompt: buildReviewPrompt(promptContext),
		mcps: reviewMCPs()
	};
}

//#endregion
//#region src/modeSelection/constants.ts
const MODE_SELECTION_TOOL_NAME = "select-clank8y-mode";
const MODE_SELECTION_TOOL_TITLE = "Select clank8y mode";
const MODE_SELECTION_TOOL_DESCRIPTION = "Select the best clank8y execution mode for the current instructions. Call this exactly once with the chosen mode and a concise reason.";

//#endregion
//#region src/modeSelection/schema.ts
const CLANK8Y_MODES = ["Review"];
const clank8yModeSchema = pipe(picklist(CLANK8Y_MODES), description("The execution mode selected for the current clank8y run."));
const clank8yModeSelectionSchema = object({
	mode: clank8yModeSchema,
	reason: pipe(string(), minLength(1, "Mode selection reason is required."), description("A concise explanation for why this mode fits the current run."))
});

//#endregion
//#region src/modes/selectMode/prompt.ts
const BASE_MODE_SELECTION_PROMPT = [[
	"## Mode selection",
	"",
	"You are an agent for choosing the best clank8y execution mode for this run.",
	`Call \`${MODE_SELECTION_TOOL_NAME}\` exactly once with a valid mode and a concise reason.`,
	`Tool intent: ${MODE_SELECTION_TOOL_DESCRIPTION}`,
	"Choose `Review` when the instructions are about pull request review.",
	"Do not do any other work in this step."
].join("\n")].join("\n");
function buildModeSelectionPrompt(promptContext) {
	const normalized = promptContext.trim();
	if (!normalized) return BASE_MODE_SELECTION_PROMPT;
	return [
		BASE_MODE_SELECTION_PROMPT,
		"",
		"Here is the prompt context for this run:",
		normalized
	].join("\n");
}

//#endregion
//#region src/modes/selectMode/mcps/selectMode.ts
function createSelectModeMCPRuntime() {
	let selection = null;
	const mcp = new McpServer({
		name: "clank8y-select-mode-mcp",
		description: "A MCP server that selects the clank8y execution mode for the current run.",
		version: "1.0.0"
	}, {
		adapter: new ValibotJsonSchemaAdapter(),
		capabilities: { tools: { listChanged: true } }
	});
	const selectModeTool = defineTool({
		name: MODE_SELECTION_TOOL_NAME,
		description: MODE_SELECTION_TOOL_DESCRIPTION,
		title: MODE_SELECTION_TOOL_TITLE,
		schema: clank8yModeSelectionSchema
	}, async (input) => {
		selection = input;
		return tool.text(`${MODE_SELECTION_TOOL_TITLE} received: ${input.mode}.`);
	});
	mcp.tools([selectModeTool]);
	const transport = new HttpTransport(mcp, { path: "/mcp" });
	const server = serve({
		manual: true,
		port: 0,
		fetch: async (req) => {
			const response = await transport.respond(req);
			if (!response) return new NodeResponse("Not found", { status: 404 });
			return response;
		}
	});
	let status = { state: "stopped" };
	return {
		mcp: {
			serverType: "http",
			allowedTools: [MODE_SELECTION_TOOL_NAME],
			get status() {
				return status;
			},
			start: async () => {
				await server.serve();
				const { url } = await server.ready();
				if (!url) {
					await server.close(true);
					throw new Error("Failed to start select mode MCP server");
				}
				const actualUrl = url.endsWith("/") ? `${url}mcp` : `${url}/mcp`;
				status = {
					state: "running",
					url: actualUrl
				};
				return {
					url: actualUrl,
					toolNames: [MODE_SELECTION_TOOL_NAME]
				};
			},
			stop: async () => {
				await server.close(true);
				status = { state: "stopped" };
			}
		},
		getSelection: () => selection
	};
}

//#endregion
//#region src/modes/selectMode/index.ts
function getSelectModeRuntime(promptContext) {
	const runtime = createSelectModeMCPRuntime();
	return {
		prompt: buildModeSelectionPrompt(promptContext),
		...runtime
	};
}

//#endregion
//#region src/modes/index.ts
function getModeRuntime(mode, promptContext) {
	switch (mode) {
		case "Review": return getReviewModeRuntime(promptContext);
		default: throw new Error(`Unsupported clank8y mode: ${mode}`);
	}
}

//#endregion
//#region ../../node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/core.mjs
const LogLevels = {
	silent: Number.NEGATIVE_INFINITY,
	fatal: 0,
	error: 0,
	warn: 1,
	log: 2,
	info: 3,
	success: 3,
	fail: 3,
	ready: 3,
	start: 3,
	box: 3,
	debug: 4,
	trace: 5,
	verbose: Number.POSITIVE_INFINITY
};
const LogTypes = {
	silent: { level: -1 },
	fatal: { level: LogLevels.fatal },
	error: { level: LogLevels.error },
	warn: { level: LogLevels.warn },
	log: { level: LogLevels.log },
	info: { level: LogLevels.info },
	success: { level: LogLevels.success },
	fail: { level: LogLevels.fail },
	ready: { level: LogLevels.info },
	start: { level: LogLevels.info },
	box: { level: LogLevels.info },
	debug: { level: LogLevels.debug },
	trace: { level: LogLevels.trace },
	verbose: { level: LogLevels.verbose }
};
function isPlainObject$1(value) {
	if (value === null || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) return false;
	if (Symbol.iterator in value) return false;
	if (Symbol.toStringTag in value) return Object.prototype.toString.call(value) === "[object Module]";
	return true;
}
function _defu(baseObject, defaults, namespace = ".", merger) {
	if (!isPlainObject$1(defaults)) return _defu(baseObject, {}, namespace, merger);
	const object = Object.assign({}, defaults);
	for (const key in baseObject) {
		if (key === "__proto__" || key === "constructor") continue;
		const value = baseObject[key];
		if (value === null || value === void 0) continue;
		if (merger && merger(object, key, value, namespace)) continue;
		if (Array.isArray(value) && Array.isArray(object[key])) object[key] = [...value, ...object[key]];
		else if (isPlainObject$1(value) && isPlainObject$1(object[key])) object[key] = _defu(value, object[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
		else object[key] = value;
	}
	return object;
}
function createDefu(merger) {
	return (...arguments_) => arguments_.reduce((p, c) => _defu(p, c, "", merger), {});
}
const defu = createDefu();
function isPlainObject(obj) {
	return Object.prototype.toString.call(obj) === "[object Object]";
}
function isLogObj(arg) {
	if (!isPlainObject(arg)) return false;
	if (!arg.message && !arg.args) return false;
	if (arg.stack) return false;
	return true;
}
let paused = false;
const queue = [];
var Consola = class Consola {
	options;
	_lastLog;
	_mockFn;
	/**
	* Creates an instance of Consola with specified options or defaults.
	*
	* @param {Partial<ConsolaOptions>} [options={}] - Configuration options for the Consola instance.
	*/
	constructor(options = {}) {
		const types = options.types || LogTypes;
		this.options = defu({
			...options,
			defaults: { ...options.defaults },
			level: _normalizeLogLevel(options.level, types),
			reporters: [...options.reporters || []]
		}, {
			types: LogTypes,
			throttle: 1e3,
			throttleMin: 5,
			formatOptions: {
				date: true,
				colors: false,
				compact: true
			}
		});
		for (const type in types) {
			const defaults = {
				type,
				...this.options.defaults,
				...types[type]
			};
			this[type] = this._wrapLogFn(defaults);
			this[type].raw = this._wrapLogFn(defaults, true);
		}
		if (this.options.mockFn) this.mockTypes();
		this._lastLog = {};
	}
	/**
	* Gets the current log level of the Consola instance.
	*
	* @returns {number} The current log level.
	*/
	get level() {
		return this.options.level;
	}
	/**
	* Sets the minimum log level that will be output by the instance.
	*
	* @param {number} level - The new log level to set.
	*/
	set level(level) {
		this.options.level = _normalizeLogLevel(level, this.options.types, this.options.level);
	}
	/**
	* Displays a prompt to the user and returns the response.
	* Throw an error if `prompt` is not supported by the current configuration.
	*
	* @template T
	* @param {string} message - The message to display in the prompt.
	* @param {T} [opts] - Optional options for the prompt. See {@link PromptOptions}.
	* @returns {promise<T>} A promise that infer with the prompt options. See {@link PromptOptions}.
	*/
	prompt(message, opts) {
		if (!this.options.prompt) throw new Error("prompt is not supported!");
		return this.options.prompt(message, opts);
	}
	/**
	* Creates a new instance of Consola, inheriting options from the current instance, with possible overrides.
	*
	* @param {Partial<ConsolaOptions>} options - Optional overrides for the new instance. See {@link ConsolaOptions}.
	* @returns {ConsolaInstance} A new Consola instance. See {@link ConsolaInstance}.
	*/
	create(options) {
		const instance = new Consola({
			...this.options,
			...options
		});
		if (this._mockFn) instance.mockTypes(this._mockFn);
		return instance;
	}
	/**
	* Creates a new Consola instance with the specified default log object properties.
	*
	* @param {InputLogObject} defaults - Default properties to include in any log from the new instance. See {@link InputLogObject}.
	* @returns {ConsolaInstance} A new Consola instance. See {@link ConsolaInstance}.
	*/
	withDefaults(defaults) {
		return this.create({
			...this.options,
			defaults: {
				...this.options.defaults,
				...defaults
			}
		});
	}
	/**
	* Creates a new Consola instance with a specified tag, which will be included in every log.
	*
	* @param {string} tag - The tag to include in each log of the new instance.
	* @returns {ConsolaInstance} A new Consola instance. See {@link ConsolaInstance}.
	*/
	withTag(tag) {
		return this.withDefaults({ tag: this.options.defaults.tag ? this.options.defaults.tag + ":" + tag : tag });
	}
	/**
	* Adds a custom reporter to the Consola instance.
	* Reporters will be called for each log message, depending on their implementation and log level.
	*
	* @param {ConsolaReporter} reporter - The reporter to add. See {@link ConsolaReporter}.
	* @returns {Consola} The current Consola instance.
	*/
	addReporter(reporter) {
		this.options.reporters.push(reporter);
		return this;
	}
	/**
	* Removes a custom reporter from the Consola instance.
	* If no reporter is specified, all reporters will be removed.
	*
	* @param {ConsolaReporter} reporter - The reporter to remove. See {@link ConsolaReporter}.
	* @returns {Consola} The current Consola instance.
	*/
	removeReporter(reporter) {
		if (reporter) {
			const i = this.options.reporters.indexOf(reporter);
			if (i !== -1) return this.options.reporters.splice(i, 1);
		} else this.options.reporters.splice(0);
		return this;
	}
	/**
	* Replaces all reporters of the Consola instance with the specified array of reporters.
	*
	* @param {ConsolaReporter[]} reporters - The new reporters to set. See {@link ConsolaReporter}.
	* @returns {Consola} The current Consola instance.
	*/
	setReporters(reporters) {
		this.options.reporters = Array.isArray(reporters) ? reporters : [reporters];
		return this;
	}
	wrapAll() {
		this.wrapConsole();
		this.wrapStd();
	}
	restoreAll() {
		this.restoreConsole();
		this.restoreStd();
	}
	/**
	* Overrides console methods with Consola logging methods for consistent logging.
	*/
	wrapConsole() {
		for (const type in this.options.types) {
			if (!console["__" + type]) console["__" + type] = console[type];
			console[type] = this[type].raw;
		}
	}
	/**
	* Restores the original console methods, removing Consola overrides.
	*/
	restoreConsole() {
		for (const type in this.options.types) if (console["__" + type]) {
			console[type] = console["__" + type];
			delete console["__" + type];
		}
	}
	/**
	* Overrides standard output and error streams to redirect them through Consola.
	*/
	wrapStd() {
		this._wrapStream(this.options.stdout, "log");
		this._wrapStream(this.options.stderr, "log");
	}
	_wrapStream(stream, type) {
		if (!stream) return;
		if (!stream.__write) stream.__write = stream.write;
		stream.write = (data) => {
			this[type].raw(String(data).trim());
		};
	}
	/**
	* Restores the original standard output and error streams, removing the Consola redirection.
	*/
	restoreStd() {
		this._restoreStream(this.options.stdout);
		this._restoreStream(this.options.stderr);
	}
	_restoreStream(stream) {
		if (!stream) return;
		if (stream.__write) {
			stream.write = stream.__write;
			delete stream.__write;
		}
	}
	/**
	* Pauses logging, queues incoming logs until resumed.
	*/
	pauseLogs() {
		paused = true;
	}
	/**
	* Resumes logging, processing any queued logs.
	*/
	resumeLogs() {
		paused = false;
		const _queue = queue.splice(0);
		for (const item of _queue) item[0]._logFn(item[1], item[2]);
	}
	/**
	* Replaces logging methods with mocks if a mock function is provided.
	*
	* @param {ConsolaOptions["mockFn"]} mockFn - The function to use for mocking logging methods. See {@link ConsolaOptions["mockFn"]}.
	*/
	mockTypes(mockFn) {
		const _mockFn = mockFn || this.options.mockFn;
		this._mockFn = _mockFn;
		if (typeof _mockFn !== "function") return;
		for (const type in this.options.types) {
			this[type] = _mockFn(type, this.options.types[type]) || this[type];
			this[type].raw = this[type];
		}
	}
	_wrapLogFn(defaults, isRaw) {
		return (...args) => {
			if (paused) {
				queue.push([
					this,
					defaults,
					args,
					isRaw
				]);
				return;
			}
			return this._logFn(defaults, args, isRaw);
		};
	}
	_logFn(defaults, args, isRaw) {
		if ((defaults.level || 0) > this.level) return false;
		const logObj = {
			date: /* @__PURE__ */ new Date(),
			args: [],
			...defaults,
			level: _normalizeLogLevel(defaults.level, this.options.types)
		};
		if (!isRaw && args.length === 1 && isLogObj(args[0])) Object.assign(logObj, args[0]);
		else logObj.args = [...args];
		if (logObj.message) {
			logObj.args.unshift(logObj.message);
			delete logObj.message;
		}
		if (logObj.additional) {
			if (!Array.isArray(logObj.additional)) logObj.additional = logObj.additional.split("\n");
			logObj.args.push("\n" + logObj.additional.join("\n"));
			delete logObj.additional;
		}
		logObj.type = typeof logObj.type === "string" ? logObj.type.toLowerCase() : "log";
		logObj.tag = typeof logObj.tag === "string" ? logObj.tag : "";
		const resolveLog = (newLog = false) => {
			const repeated = (this._lastLog.count || 0) - this.options.throttleMin;
			if (this._lastLog.object && repeated > 0) {
				const args2 = [...this._lastLog.object.args];
				if (repeated > 1) args2.push(`(repeated ${repeated} times)`);
				this._log({
					...this._lastLog.object,
					args: args2
				});
				this._lastLog.count = 1;
			}
			if (newLog) {
				this._lastLog.object = logObj;
				this._log(logObj);
			}
		};
		clearTimeout(this._lastLog.timeout);
		const diffTime = this._lastLog.time && logObj.date ? logObj.date.getTime() - this._lastLog.time.getTime() : 0;
		this._lastLog.time = logObj.date;
		if (diffTime < this.options.throttle) try {
			const serializedLog = JSON.stringify([
				logObj.type,
				logObj.tag,
				logObj.args
			]);
			const isSameLog = this._lastLog.serialized === serializedLog;
			this._lastLog.serialized = serializedLog;
			if (isSameLog) {
				this._lastLog.count = (this._lastLog.count || 0) + 1;
				if (this._lastLog.count > this.options.throttleMin) {
					this._lastLog.timeout = setTimeout(resolveLog, this.options.throttle);
					return;
				}
			}
		} catch {}
		resolveLog(true);
	}
	_log(logObj) {
		for (const reporter of this.options.reporters) reporter.log(logObj, { options: this.options });
	}
};
function _normalizeLogLevel(input, types = {}, defaultLevel = 3) {
	if (input === void 0) return defaultLevel;
	if (typeof input === "number") return input;
	if (types[input] && types[input].level !== void 0) return types[input].level;
	return defaultLevel;
}
Consola.prototype.add = Consola.prototype.addReporter;
Consola.prototype.remove = Consola.prototype.removeReporter;
Consola.prototype.clear = Consola.prototype.removeReporter;
Consola.prototype.withScope = Consola.prototype.withTag;
Consola.prototype.mock = Consola.prototype.mockTypes;
Consola.prototype.pause = Consola.prototype.pauseLogs;
Consola.prototype.resume = Consola.prototype.resumeLogs;
function createConsola$1(options = {}) {
	return new Consola(options);
}

//#endregion
//#region ../../node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/shared/consola.DRwqZj3T.mjs
function parseStack(stack, message) {
	const cwd = process.cwd() + sep;
	return stack.split("\n").splice(message.split("\n").length).map((l) => l.trim().replace("file://", "").replace(cwd, ""));
}
function writeStream(data, stream) {
	return (stream.__write || stream.write).call(stream, data);
}
const bracket = (x) => x ? `[${x}]` : "";
var BasicReporter = class {
	formatStack(stack, message, opts) {
		const indent = "  ".repeat((opts?.errorLevel || 0) + 1);
		return indent + parseStack(stack, message).join(`
${indent}`);
	}
	formatError(err, opts) {
		const message = err.message ?? formatWithOptions(opts, err);
		const stack = err.stack ? this.formatStack(err.stack, message, opts) : "";
		const level = opts?.errorLevel || 0;
		const causedPrefix = level > 0 ? `${"  ".repeat(level)}[cause]: ` : "";
		const causedError = err.cause ? "\n\n" + this.formatError(err.cause, {
			...opts,
			errorLevel: level + 1
		}) : "";
		return causedPrefix + message + "\n" + stack + causedError;
	}
	formatArgs(args, opts) {
		return formatWithOptions(opts, ...args.map((arg) => {
			if (arg && typeof arg.stack === "string") return this.formatError(arg, opts);
			return arg;
		}));
	}
	formatDate(date, opts) {
		return opts.date ? date.toLocaleTimeString() : "";
	}
	filterAndJoin(arr) {
		return arr.filter(Boolean).join(" ");
	}
	formatLogObj(logObj, opts) {
		const message = this.formatArgs(logObj.args, opts);
		if (logObj.type === "box") return "\n" + [
			bracket(logObj.tag),
			logObj.title && logObj.title,
			...message.split("\n")
		].filter(Boolean).map((l) => " > " + l).join("\n") + "\n";
		return this.filterAndJoin([
			bracket(logObj.type),
			bracket(logObj.tag),
			message
		]);
	}
	log(logObj, ctx) {
		return writeStream(this.formatLogObj(logObj, {
			columns: ctx.options.stdout.columns || 0,
			...ctx.options.formatOptions
		}) + "\n", logObj.level < 2 ? ctx.options.stderr || process.stderr : ctx.options.stdout || process.stdout);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/chunks/prompt.mjs
var prompt_exports = /* @__PURE__ */ __exportAll({
	kCancel: () => kCancel,
	prompt: () => prompt
});
function getDefaultExportFromCjs(x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function requireSrc() {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;
	const ESC = "\x1B";
	const CSI = `${ESC}[`;
	const beep = "\x07";
	const cursor = {
		to(x, y) {
			if (!y) return `${CSI}${x + 1}G`;
			return `${CSI}${y + 1};${x + 1}H`;
		},
		move(x, y) {
			let ret = "";
			if (x < 0) ret += `${CSI}${-x}D`;
			else if (x > 0) ret += `${CSI}${x}C`;
			if (y < 0) ret += `${CSI}${-y}A`;
			else if (y > 0) ret += `${CSI}${y}B`;
			return ret;
		},
		up: (count = 1) => `${CSI}${count}A`,
		down: (count = 1) => `${CSI}${count}B`,
		forward: (count = 1) => `${CSI}${count}C`,
		backward: (count = 1) => `${CSI}${count}D`,
		nextLine: (count = 1) => `${CSI}E`.repeat(count),
		prevLine: (count = 1) => `${CSI}F`.repeat(count),
		left: `${CSI}G`,
		hide: `${CSI}?25l`,
		show: `${CSI}?25h`,
		save: `${ESC}7`,
		restore: `${ESC}8`
	};
	src = {
		cursor,
		scroll: {
			up: (count = 1) => `${CSI}S`.repeat(count),
			down: (count = 1) => `${CSI}T`.repeat(count)
		},
		erase: {
			screen: `${CSI}2J`,
			up: (count = 1) => `${CSI}1J`.repeat(count),
			down: (count = 1) => `${CSI}J`.repeat(count),
			line: `${CSI}2K`,
			lineEnd: `${CSI}K`,
			lineStart: `${CSI}1K`,
			lines(count) {
				let clear = "";
				for (let i = 0; i < count; i++) clear += this.line + (i < count - 1 ? cursor.up() : "");
				if (count) clear += cursor.left;
				return clear;
			}
		},
		beep
	};
	return src;
}
function requirePicocolors() {
	if (hasRequiredPicocolors) return picocolors.exports;
	hasRequiredPicocolors = 1;
	let p = process || {}, argv = p.argv || [], env = p.env || {};
	let isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
	let formatter = (open, close, replace = open) => (input) => {
		let string = "" + input, index = string.indexOf(close, open.length);
		return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
	};
	let replaceClose = (string, close, replace, index) => {
		let result = "", cursor = 0;
		do {
			result += string.substring(cursor, index) + replace;
			cursor = index + close.length;
			index = string.indexOf(close, cursor);
		} while (~index);
		return result + string.substring(cursor);
	};
	let createColors = (enabled = isColorSupported) => {
		let f = enabled ? formatter : () => String;
		return {
			isColorSupported: enabled,
			reset: f("\x1B[0m", "\x1B[0m"),
			bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
			dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
			italic: f("\x1B[3m", "\x1B[23m"),
			underline: f("\x1B[4m", "\x1B[24m"),
			inverse: f("\x1B[7m", "\x1B[27m"),
			hidden: f("\x1B[8m", "\x1B[28m"),
			strikethrough: f("\x1B[9m", "\x1B[29m"),
			black: f("\x1B[30m", "\x1B[39m"),
			red: f("\x1B[31m", "\x1B[39m"),
			green: f("\x1B[32m", "\x1B[39m"),
			yellow: f("\x1B[33m", "\x1B[39m"),
			blue: f("\x1B[34m", "\x1B[39m"),
			magenta: f("\x1B[35m", "\x1B[39m"),
			cyan: f("\x1B[36m", "\x1B[39m"),
			white: f("\x1B[37m", "\x1B[39m"),
			gray: f("\x1B[90m", "\x1B[39m"),
			bgBlack: f("\x1B[40m", "\x1B[49m"),
			bgRed: f("\x1B[41m", "\x1B[49m"),
			bgGreen: f("\x1B[42m", "\x1B[49m"),
			bgYellow: f("\x1B[43m", "\x1B[49m"),
			bgBlue: f("\x1B[44m", "\x1B[49m"),
			bgMagenta: f("\x1B[45m", "\x1B[49m"),
			bgCyan: f("\x1B[46m", "\x1B[49m"),
			bgWhite: f("\x1B[47m", "\x1B[49m"),
			blackBright: f("\x1B[90m", "\x1B[39m"),
			redBright: f("\x1B[91m", "\x1B[39m"),
			greenBright: f("\x1B[92m", "\x1B[39m"),
			yellowBright: f("\x1B[93m", "\x1B[39m"),
			blueBright: f("\x1B[94m", "\x1B[39m"),
			magentaBright: f("\x1B[95m", "\x1B[39m"),
			cyanBright: f("\x1B[96m", "\x1B[39m"),
			whiteBright: f("\x1B[97m", "\x1B[39m"),
			bgBlackBright: f("\x1B[100m", "\x1B[49m"),
			bgRedBright: f("\x1B[101m", "\x1B[49m"),
			bgGreenBright: f("\x1B[102m", "\x1B[49m"),
			bgYellowBright: f("\x1B[103m", "\x1B[49m"),
			bgBlueBright: f("\x1B[104m", "\x1B[49m"),
			bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
			bgCyanBright: f("\x1B[106m", "\x1B[49m"),
			bgWhiteBright: f("\x1B[107m", "\x1B[49m")
		};
	};
	picocolors.exports = createColors();
	picocolors.exports.createColors = createColors;
	return picocolors.exports;
}
function J({ onlyFirst: t = false } = {}) {
	const F = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
	return new RegExp(F, t ? void 0 : "g");
}
function T$1$1(t) {
	if (typeof t != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof t}\``);
	return t.replace(Q, "");
}
function O$2(t) {
	return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function A$1$1(t, u = {}) {
	if (typeof t != "string" || t.length === 0 || (u = {
		ambiguousIsNarrow: true,
		...u
	}, t = T$1$1(t), t.length === 0)) return 0;
	t = t.replace(FD(), "  ");
	const F = u.ambiguousIsNarrow ? 1 : 2;
	let e = 0;
	for (const s of t) {
		const i = s.codePointAt(0);
		if (i <= 31 || i >= 127 && i <= 159 || i >= 768 && i <= 879) continue;
		switch (DD.eastAsianWidth(s)) {
			case "F":
			case "W":
				e += 2;
				break;
			case "A":
				e += F;
				break;
			default: e += 1;
		}
	}
	return e;
}
function sD() {
	const t = /* @__PURE__ */ new Map();
	for (const [u, F] of Object.entries(r$1)) {
		for (const [e, s] of Object.entries(F)) r$1[e] = {
			open: `\x1B[${s[0]}m`,
			close: `\x1B[${s[1]}m`
		}, F[e] = r$1[e], t.set(s[0], s[1]);
		Object.defineProperty(r$1, u, {
			value: F,
			enumerable: false
		});
	}
	return Object.defineProperty(r$1, "codes", {
		value: t,
		enumerable: false
	}), r$1.color.close = "\x1B[39m", r$1.bgColor.close = "\x1B[49m", r$1.color.ansi = L$1(), r$1.color.ansi256 = N$2(), r$1.color.ansi16m = I$2(), r$1.bgColor.ansi = L$1(m$1), r$1.bgColor.ansi256 = N$2(m$1), r$1.bgColor.ansi16m = I$2(m$1), Object.defineProperties(r$1, {
		rgbToAnsi256: {
			value: (u, F, e) => u === F && F === e ? u < 8 ? 16 : u > 248 ? 231 : Math.round((u - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(u / 255 * 5) + 6 * Math.round(F / 255 * 5) + Math.round(e / 255 * 5),
			enumerable: false
		},
		hexToRgb: {
			value: (u) => {
				const F = /[a-f\d]{6}|[a-f\d]{3}/i.exec(u.toString(16));
				if (!F) return [
					0,
					0,
					0
				];
				let [e] = F;
				e.length === 3 && (e = [...e].map((i) => i + i).join(""));
				const s = Number.parseInt(e, 16);
				return [
					s >> 16 & 255,
					s >> 8 & 255,
					s & 255
				];
			},
			enumerable: false
		},
		hexToAnsi256: {
			value: (u) => r$1.rgbToAnsi256(...r$1.hexToRgb(u)),
			enumerable: false
		},
		ansi256ToAnsi: {
			value: (u) => {
				if (u < 8) return 30 + u;
				if (u < 16) return 90 + (u - 8);
				let F, e, s;
				if (u >= 232) F = ((u - 232) * 10 + 8) / 255, e = F, s = F;
				else {
					u -= 16;
					const C = u % 36;
					F = Math.floor(u / 36) / 5, e = Math.floor(C / 6) / 5, s = C % 6 / 5;
				}
				const i = Math.max(F, e, s) * 2;
				if (i === 0) return 30;
				let D = 30 + (Math.round(s) << 2 | Math.round(e) << 1 | Math.round(F));
				return i === 2 && (D += 60), D;
			},
			enumerable: false
		},
		rgbToAnsi: {
			value: (u, F, e) => r$1.ansi256ToAnsi(r$1.rgbToAnsi256(u, F, e)),
			enumerable: false
		},
		hexToAnsi: {
			value: (u) => r$1.ansi256ToAnsi(r$1.hexToAnsi256(u)),
			enumerable: false
		}
	}), r$1;
}
function G$2(t, u, F) {
	return String(t).normalize().replace(/\r\n/g, `
`).split(`
`).map((e) => oD(e, u, F)).join(`
`);
}
function k$1(t, u) {
	if (typeof t == "string") return c$1.aliases.get(t) === u;
	for (const F of t) if (F !== void 0 && k$1(F, u)) return true;
	return false;
}
function lD(t, u) {
	if (t === u) return;
	const F = t.split(`
`), e = u.split(`
`), s = [];
	for (let i = 0; i < Math.max(F.length, e.length); i++) F[i] !== e[i] && s.push(i);
	return s;
}
function d$1(t, u) {
	const F = t;
	F.isTTY && F.setRawMode(u);
}
function ce() {
	return process$1.platform !== "win32" ? process$1.env.TERM !== "linux" : !!process$1.env.CI || !!process$1.env.WT_SESSION || !!process$1.env.TERMINUS_SUBLIME || process$1.env.ConEmuTask === "{cmd::Cmder}" || process$1.env.TERM_PROGRAM === "Terminus-Sublime" || process$1.env.TERM_PROGRAM === "vscode" || process$1.env.TERM === "xterm-256color" || process$1.env.TERM === "alacritty" || process$1.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
async function prompt(message, opts = {}) {
	const handleCancel = (value) => {
		if (typeof value !== "symbol" || value.toString() !== "Symbol(clack:cancel)") return value;
		switch (opts.cancel) {
			case "reject": {
				const error = /* @__PURE__ */ new Error("Prompt cancelled.");
				error.name = "ConsolaPromptCancelledError";
				if (Error.captureStackTrace) Error.captureStackTrace(error, prompt);
				throw error;
			}
			case "undefined": return;
			case "null": return null;
			case "symbol": return kCancel;
			default:
			case "default": return opts.default ?? opts.initial;
		}
	};
	if (!opts.type || opts.type === "text") return await he({
		message,
		defaultValue: opts.default,
		placeholder: opts.placeholder,
		initialValue: opts.initial
	}).then(handleCancel);
	if (opts.type === "confirm") return await ye({
		message,
		initialValue: opts.initial
	}).then(handleCancel);
	if (opts.type === "select") return await ve({
		message,
		options: opts.options.map((o) => typeof o === "string" ? {
			value: o,
			label: o
		} : o),
		initialValue: opts.initial
	}).then(handleCancel);
	if (opts.type === "multiselect") return await fe({
		message,
		options: opts.options.map((o) => typeof o === "string" ? {
			value: o,
			label: o
		} : o),
		required: opts.required,
		initialValues: opts.initial
	}).then(handleCancel);
	throw new Error(`Unknown prompt type: ${opts.type}`);
}
var src, hasRequiredSrc, srcExports, picocolors, hasRequiredPicocolors, e, Q, P$1, X, DD, uD, FD, m$1, L$1, N$2, I$2, r$1, tD, eD, iD, v$1, CD, w$1, W$1, rD, R$2, y$2, V$1, z$1, ED, _$2, nD, oD, c$1, S$2, AD, pD, h$1, x$1, fD, bD, mD, Y, wD, SD, $D, q$1, jD, PD, V$2, u$2, le, L$2, W$2, C$2, o$1, d$2, k$2, P$2, A$2, T$2, F$2, w$2, B$1, he, ye, ve, fe, kCancel;
var init_prompt = __esmMin((() => {
	;
	;
	srcExports = requireSrc();
	picocolors = { exports: {} };
	;
	e = /* @__PURE__ */ getDefaultExportFromCjs(/* @__PURE__ */ requirePicocolors());
	Q = J();
	P$1 = { exports: {} };
	(function(t) {
		var u = {};
		t.exports = u, u.eastAsianWidth = function(e) {
			var s = e.charCodeAt(0), i = e.length == 2 ? e.charCodeAt(1) : 0, D = s;
			return 55296 <= s && s <= 56319 && 56320 <= i && i <= 57343 && (s &= 1023, i &= 1023, D = s << 10 | i, D += 65536), D == 12288 || 65281 <= D && D <= 65376 || 65504 <= D && D <= 65510 ? "F" : D == 8361 || 65377 <= D && D <= 65470 || 65474 <= D && D <= 65479 || 65482 <= D && D <= 65487 || 65490 <= D && D <= 65495 || 65498 <= D && D <= 65500 || 65512 <= D && D <= 65518 ? "H" : 4352 <= D && D <= 4447 || 4515 <= D && D <= 4519 || 4602 <= D && D <= 4607 || 9001 <= D && D <= 9002 || 11904 <= D && D <= 11929 || 11931 <= D && D <= 12019 || 12032 <= D && D <= 12245 || 12272 <= D && D <= 12283 || 12289 <= D && D <= 12350 || 12353 <= D && D <= 12438 || 12441 <= D && D <= 12543 || 12549 <= D && D <= 12589 || 12593 <= D && D <= 12686 || 12688 <= D && D <= 12730 || 12736 <= D && D <= 12771 || 12784 <= D && D <= 12830 || 12832 <= D && D <= 12871 || 12880 <= D && D <= 13054 || 13056 <= D && D <= 19903 || 19968 <= D && D <= 42124 || 42128 <= D && D <= 42182 || 43360 <= D && D <= 43388 || 44032 <= D && D <= 55203 || 55216 <= D && D <= 55238 || 55243 <= D && D <= 55291 || 63744 <= D && D <= 64255 || 65040 <= D && D <= 65049 || 65072 <= D && D <= 65106 || 65108 <= D && D <= 65126 || 65128 <= D && D <= 65131 || 110592 <= D && D <= 110593 || 127488 <= D && D <= 127490 || 127504 <= D && D <= 127546 || 127552 <= D && D <= 127560 || 127568 <= D && D <= 127569 || 131072 <= D && D <= 194367 || 177984 <= D && D <= 196605 || 196608 <= D && D <= 262141 ? "W" : 32 <= D && D <= 126 || 162 <= D && D <= 163 || 165 <= D && D <= 166 || D == 172 || D == 175 || 10214 <= D && D <= 10221 || 10629 <= D && D <= 10630 ? "Na" : D == 161 || D == 164 || 167 <= D && D <= 168 || D == 170 || 173 <= D && D <= 174 || 176 <= D && D <= 180 || 182 <= D && D <= 186 || 188 <= D && D <= 191 || D == 198 || D == 208 || 215 <= D && D <= 216 || 222 <= D && D <= 225 || D == 230 || 232 <= D && D <= 234 || 236 <= D && D <= 237 || D == 240 || 242 <= D && D <= 243 || 247 <= D && D <= 250 || D == 252 || D == 254 || D == 257 || D == 273 || D == 275 || D == 283 || 294 <= D && D <= 295 || D == 299 || 305 <= D && D <= 307 || D == 312 || 319 <= D && D <= 322 || D == 324 || 328 <= D && D <= 331 || D == 333 || 338 <= D && D <= 339 || 358 <= D && D <= 359 || D == 363 || D == 462 || D == 464 || D == 466 || D == 468 || D == 470 || D == 472 || D == 474 || D == 476 || D == 593 || D == 609 || D == 708 || D == 711 || 713 <= D && D <= 715 || D == 717 || D == 720 || 728 <= D && D <= 731 || D == 733 || D == 735 || 768 <= D && D <= 879 || 913 <= D && D <= 929 || 931 <= D && D <= 937 || 945 <= D && D <= 961 || 963 <= D && D <= 969 || D == 1025 || 1040 <= D && D <= 1103 || D == 1105 || D == 8208 || 8211 <= D && D <= 8214 || 8216 <= D && D <= 8217 || 8220 <= D && D <= 8221 || 8224 <= D && D <= 8226 || 8228 <= D && D <= 8231 || D == 8240 || 8242 <= D && D <= 8243 || D == 8245 || D == 8251 || D == 8254 || D == 8308 || D == 8319 || 8321 <= D && D <= 8324 || D == 8364 || D == 8451 || D == 8453 || D == 8457 || D == 8467 || D == 8470 || 8481 <= D && D <= 8482 || D == 8486 || D == 8491 || 8531 <= D && D <= 8532 || 8539 <= D && D <= 8542 || 8544 <= D && D <= 8555 || 8560 <= D && D <= 8569 || D == 8585 || 8592 <= D && D <= 8601 || 8632 <= D && D <= 8633 || D == 8658 || D == 8660 || D == 8679 || D == 8704 || 8706 <= D && D <= 8707 || 8711 <= D && D <= 8712 || D == 8715 || D == 8719 || D == 8721 || D == 8725 || D == 8730 || 8733 <= D && D <= 8736 || D == 8739 || D == 8741 || 8743 <= D && D <= 8748 || D == 8750 || 8756 <= D && D <= 8759 || 8764 <= D && D <= 8765 || D == 8776 || D == 8780 || D == 8786 || 8800 <= D && D <= 8801 || 8804 <= D && D <= 8807 || 8810 <= D && D <= 8811 || 8814 <= D && D <= 8815 || 8834 <= D && D <= 8835 || 8838 <= D && D <= 8839 || D == 8853 || D == 8857 || D == 8869 || D == 8895 || D == 8978 || 9312 <= D && D <= 9449 || 9451 <= D && D <= 9547 || 9552 <= D && D <= 9587 || 9600 <= D && D <= 9615 || 9618 <= D && D <= 9621 || 9632 <= D && D <= 9633 || 9635 <= D && D <= 9641 || 9650 <= D && D <= 9651 || 9654 <= D && D <= 9655 || 9660 <= D && D <= 9661 || 9664 <= D && D <= 9665 || 9670 <= D && D <= 9672 || D == 9675 || 9678 <= D && D <= 9681 || 9698 <= D && D <= 9701 || D == 9711 || 9733 <= D && D <= 9734 || D == 9737 || 9742 <= D && D <= 9743 || 9748 <= D && D <= 9749 || D == 9756 || D == 9758 || D == 9792 || D == 9794 || 9824 <= D && D <= 9825 || 9827 <= D && D <= 9829 || 9831 <= D && D <= 9834 || 9836 <= D && D <= 9837 || D == 9839 || 9886 <= D && D <= 9887 || 9918 <= D && D <= 9919 || 9924 <= D && D <= 9933 || 9935 <= D && D <= 9953 || D == 9955 || 9960 <= D && D <= 9983 || D == 10045 || D == 10071 || 10102 <= D && D <= 10111 || 11093 <= D && D <= 11097 || 12872 <= D && D <= 12879 || 57344 <= D && D <= 63743 || 65024 <= D && D <= 65039 || D == 65533 || 127232 <= D && D <= 127242 || 127248 <= D && D <= 127277 || 127280 <= D && D <= 127337 || 127344 <= D && D <= 127386 || 917760 <= D && D <= 917999 || 983040 <= D && D <= 1048573 || 1048576 <= D && D <= 1114109 ? "A" : "N";
		}, u.characterLength = function(e) {
			var s = this.eastAsianWidth(e);
			return s == "F" || s == "W" || s == "A" ? 2 : 1;
		};
		function F(e) {
			return e.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
		}
		u.length = function(e) {
			for (var s = F(e), i = 0, D = 0; D < s.length; D++) i = i + this.characterLength(s[D]);
			return i;
		}, u.slice = function(e, s, i) {
			textLen = u.length(e), s = s || 0, i = i || 1, s < 0 && (s = textLen + s), i < 0 && (i = textLen + i);
			for (var D = "", C = 0, o = F(e), E = 0; E < o.length; E++) {
				var a = o[E], n = u.length(a);
				if (C >= s - (n == 2 ? 1 : 0)) if (C + n <= i) D += a;
				else break;
				C += n;
			}
			return D;
		};
	})(P$1);
	X = P$1.exports;
	DD = O$2(X);
	uD = function() {
		return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
	};
	FD = O$2(uD);
	m$1 = 10, L$1 = (t = 0) => (u) => `\x1B[${u + t}m`, N$2 = (t = 0) => (u) => `\x1B[${38 + t};5;${u}m`, I$2 = (t = 0) => (u, F, e) => `\x1B[${38 + t};2;${u};${F};${e}m`, r$1 = {
		modifier: {
			reset: [0, 0],
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			overline: [53, 55],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			blackBright: [90, 39],
			gray: [90, 39],
			grey: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],
			bgBlackBright: [100, 49],
			bgGray: [100, 49],
			bgGrey: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};
	Object.keys(r$1.modifier);
	tD = Object.keys(r$1.color), eD = Object.keys(r$1.bgColor);
	[...tD, ...eD];
	iD = sD(), v$1 = new Set(["\x1B", ""]), CD = 39, w$1 = "\x07", W$1 = "[", rD = "]", R$2 = "m", y$2 = `${rD}8;;`, V$1 = (t) => `${v$1.values().next().value}${W$1}${t}${R$2}`, z$1 = (t) => `${v$1.values().next().value}${y$2}${t}${w$1}`, ED = (t) => t.split(" ").map((u) => A$1$1(u)), _$2 = (t, u, F) => {
		const e = [...u];
		let s = false, i = false, D = A$1$1(T$1$1(t[t.length - 1]));
		for (const [C, o] of e.entries()) {
			const E = A$1$1(o);
			if (D + E <= F ? t[t.length - 1] += o : (t.push(o), D = 0), v$1.has(o) && (s = true, i = e.slice(C + 1).join("").startsWith(y$2)), s) {
				i ? o === w$1 && (s = false, i = false) : o === R$2 && (s = false);
				continue;
			}
			D += E, D === F && C < e.length - 1 && (t.push(""), D = 0);
		}
		!D && t[t.length - 1].length > 0 && t.length > 1 && (t[t.length - 2] += t.pop());
	}, nD = (t) => {
		const u = t.split(" ");
		let F = u.length;
		for (; F > 0 && !(A$1$1(u[F - 1]) > 0);) F--;
		return F === u.length ? t : u.slice(0, F).join(" ") + u.slice(F).join("");
	}, oD = (t, u, F = {}) => {
		if (F.trim !== false && t.trim() === "") return "";
		let e = "", s, i;
		const D = ED(t);
		let C = [""];
		for (const [E, a] of t.split(" ").entries()) {
			F.trim !== false && (C[C.length - 1] = C[C.length - 1].trimStart());
			let n = A$1$1(C[C.length - 1]);
			if (E !== 0 && (n >= u && (F.wordWrap === false || F.trim === false) && (C.push(""), n = 0), (n > 0 || F.trim === false) && (C[C.length - 1] += " ", n++)), F.hard && D[E] > u) {
				const B = u - n, p = 1 + Math.floor((D[E] - B - 1) / u);
				Math.floor((D[E] - 1) / u) < p && C.push(""), _$2(C, a, u);
				continue;
			}
			if (n + D[E] > u && n > 0 && D[E] > 0) {
				if (F.wordWrap === false && n < u) {
					_$2(C, a, u);
					continue;
				}
				C.push("");
			}
			if (n + D[E] > u && F.wordWrap === false) {
				_$2(C, a, u);
				continue;
			}
			C[C.length - 1] += a;
		}
		F.trim !== false && (C = C.map((E) => nD(E)));
		const o = [...C.join(`
`)];
		for (const [E, a] of o.entries()) {
			if (e += a, v$1.has(a)) {
				const { groups: B } = new RegExp(`(?:\\${W$1}(?<code>\\d+)m|\\${y$2}(?<uri>.*)${w$1})`).exec(o.slice(E).join("")) || { groups: {} };
				if (B.code !== void 0) {
					const p = Number.parseFloat(B.code);
					s = p === CD ? void 0 : p;
				} else B.uri !== void 0 && (i = B.uri.length === 0 ? void 0 : B.uri);
			}
			const n = iD.codes.get(Number(s));
			o[E + 1] === `
` ? (i && (e += z$1("")), s && n && (e += V$1(n))) : a === `
` && (s && n && (e += V$1(s)), i && (e += z$1(i)));
		}
		return e;
	};
	c$1 = {
		actions: new Set([
			"up",
			"down",
			"left",
			"right",
			"space",
			"enter",
			"cancel"
		]),
		aliases: new Map([
			["k", "up"],
			["j", "down"],
			["h", "left"],
			["l", "right"],
			["", "cancel"],
			["escape", "cancel"]
		])
	};
	globalThis.process.platform.startsWith("win");
	S$2 = Symbol("clack:cancel");
	AD = Object.defineProperty, pD = (t, u, F) => u in t ? AD(t, u, {
		enumerable: true,
		configurable: true,
		writable: true,
		value: F
	}) : t[u] = F, h$1 = (t, u, F) => (pD(t, typeof u != "symbol" ? u + "" : u, F), F);
	x$1 = class {
		constructor(u, F = true) {
			h$1(this, "input"), h$1(this, "output"), h$1(this, "_abortSignal"), h$1(this, "rl"), h$1(this, "opts"), h$1(this, "_render"), h$1(this, "_track", false), h$1(this, "_prevFrame", ""), h$1(this, "_subscribers", /* @__PURE__ */ new Map()), h$1(this, "_cursor", 0), h$1(this, "state", "initial"), h$1(this, "error", ""), h$1(this, "value");
			const { input: e = stdin, output: s = stdout, render: i, signal: D, ...C } = u;
			this.opts = C, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = i.bind(this), this._track = F, this._abortSignal = D, this.input = e, this.output = s;
		}
		unsubscribe() {
			this._subscribers.clear();
		}
		setSubscriber(u, F) {
			const e = this._subscribers.get(u) ?? [];
			e.push(F), this._subscribers.set(u, e);
		}
		on(u, F) {
			this.setSubscriber(u, { cb: F });
		}
		once(u, F) {
			this.setSubscriber(u, {
				cb: F,
				once: true
			});
		}
		emit(u, ...F) {
			const e = this._subscribers.get(u) ?? [], s = [];
			for (const i of e) i.cb(...F), i.once && s.push(() => e.splice(e.indexOf(i), 1));
			for (const i of s) i();
		}
		prompt() {
			return new Promise((u, F) => {
				if (this._abortSignal) {
					if (this._abortSignal.aborted) return this.state = "cancel", this.close(), u(S$2);
					this._abortSignal.addEventListener("abort", () => {
						this.state = "cancel", this.close();
					}, { once: true });
				}
				const e = new WriteStream(0);
				e._write = (s, i, D) => {
					this._track && (this.value = this.rl?.line.replace(/\t/g, ""), this._cursor = this.rl?.cursor ?? 0, this.emit("value", this.value)), D();
				}, this.input.pipe(e), this.rl = f.createInterface({
					input: this.input,
					output: e,
					tabSize: 2,
					prompt: "",
					escapeCodeTimeout: 50
				}), f.emitKeypressEvents(this.input, this.rl), this.rl.prompt(), this.opts.initialValue !== void 0 && this._track && this.rl.write(this.opts.initialValue), this.input.on("keypress", this.onKeypress), d$1(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
					this.output.write(srcExports.cursor.show), this.output.off("resize", this.render), d$1(this.input, false), u(this.value);
				}), this.once("cancel", () => {
					this.output.write(srcExports.cursor.show), this.output.off("resize", this.render), d$1(this.input, false), u(S$2);
				});
			});
		}
		onKeypress(u, F) {
			if (this.state === "error" && (this.state = "active"), F?.name && (!this._track && c$1.aliases.has(F.name) && this.emit("cursor", c$1.aliases.get(F.name)), c$1.actions.has(F.name) && this.emit("cursor", F.name)), u && (u.toLowerCase() === "y" || u.toLowerCase() === "n") && this.emit("confirm", u.toLowerCase() === "y"), u === "	" && this.opts.placeholder && (this.value || (this.rl?.write(this.opts.placeholder), this.emit("value", this.opts.placeholder))), u && this.emit("key", u.toLowerCase()), F?.name === "return") {
				if (this.opts.validate) {
					const e = this.opts.validate(this.value);
					e && (this.error = e instanceof Error ? e.message : e, this.state = "error", this.rl?.write(this.value));
				}
				this.state !== "error" && (this.state = "submit");
			}
			k$1([
				u,
				F?.name,
				F?.sequence
			], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
		}
		close() {
			this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), d$1(this.input, false), this.rl?.close(), this.rl = void 0, this.emit(`${this.state}`, this.value), this.unsubscribe();
		}
		restoreCursor() {
			const u = G$2(this._prevFrame, process.stdout.columns, { hard: true }).split(`
`).length - 1;
			this.output.write(srcExports.cursor.move(-999, u * -1));
		}
		render() {
			const u = G$2(this._render(this) ?? "", process.stdout.columns, { hard: true });
			if (u !== this._prevFrame) {
				if (this.state === "initial") this.output.write(srcExports.cursor.hide);
				else {
					const F = lD(this._prevFrame, u);
					if (this.restoreCursor(), F && F?.length === 1) {
						const e = F[0];
						this.output.write(srcExports.cursor.move(0, e)), this.output.write(srcExports.erase.lines(1));
						const s = u.split(`
`);
						this.output.write(s[e]), this._prevFrame = u, this.output.write(srcExports.cursor.move(0, s.length - e - 1));
						return;
					}
					if (F && F?.length > 1) {
						const e = F[0];
						this.output.write(srcExports.cursor.move(0, e)), this.output.write(srcExports.erase.down());
						const s = u.split(`
`).slice(e);
						this.output.write(s.join(`
`)), this._prevFrame = u;
						return;
					}
					this.output.write(srcExports.erase.down());
				}
				this.output.write(u), this.state === "initial" && (this.state = "active"), this._prevFrame = u;
			}
		}
	};
	fD = class extends x$1 {
		get cursor() {
			return this.value ? 0 : 1;
		}
		get _value() {
			return this.cursor === 0;
		}
		constructor(u) {
			super(u, false), this.value = !!u.initialValue, this.on("value", () => {
				this.value = this._value;
			}), this.on("confirm", (F) => {
				this.output.write(srcExports.cursor.move(0, -1)), this.value = F, this.state = "submit", this.close();
			}), this.on("cursor", () => {
				this.value = !this.value;
			});
		}
	};
	bD = Object.defineProperty, mD = (t, u, F) => u in t ? bD(t, u, {
		enumerable: true,
		configurable: true,
		writable: true,
		value: F
	}) : t[u] = F, Y = (t, u, F) => (mD(t, typeof u != "symbol" ? u + "" : u, F), F);
	wD = class extends x$1 {
		constructor(u) {
			super(u, false), Y(this, "options"), Y(this, "cursor", 0), this.options = u.options, this.value = [...u.initialValues ?? []], this.cursor = Math.max(this.options.findIndex(({ value: F }) => F === u.cursorAt), 0), this.on("key", (F) => {
				F === "a" && this.toggleAll();
			}), this.on("cursor", (F) => {
				switch (F) {
					case "left":
					case "up":
						this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
						break;
					case "down":
					case "right":
						this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
						break;
					case "space":
						this.toggleValue();
						break;
				}
			});
		}
		get _value() {
			return this.options[this.cursor].value;
		}
		toggleAll() {
			this.value = this.value.length === this.options.length ? [] : this.options.map((F) => F.value);
		}
		toggleValue() {
			this.value = this.value.includes(this._value) ? this.value.filter((F) => F !== this._value) : [...this.value, this._value];
		}
	};
	SD = Object.defineProperty, $D = (t, u, F) => u in t ? SD(t, u, {
		enumerable: true,
		configurable: true,
		writable: true,
		value: F
	}) : t[u] = F, q$1 = (t, u, F) => ($D(t, typeof u != "symbol" ? u + "" : u, F), F);
	jD = class extends x$1 {
		constructor(u) {
			super(u, false), q$1(this, "options"), q$1(this, "cursor", 0), this.options = u.options, this.cursor = this.options.findIndex(({ value: F }) => F === u.initialValue), this.cursor === -1 && (this.cursor = 0), this.changeValue(), this.on("cursor", (F) => {
				switch (F) {
					case "left":
					case "up":
						this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
						break;
					case "down":
					case "right":
						this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
						break;
				}
				this.changeValue();
			});
		}
		get _value() {
			return this.options[this.cursor];
		}
		changeValue() {
			this.value = this._value.value;
		}
	};
	PD = class extends x$1 {
		get valueWithCursor() {
			if (this.state === "submit") return this.value;
			if (this.cursor >= this.value.length) return `${this.value}\u2588`;
			const u = this.value.slice(0, this.cursor), [F, ...e$1] = this.value.slice(this.cursor);
			return `${u}${e.inverse(F)}${e$1.join("")}`;
		}
		get cursor() {
			return this._cursor;
		}
		constructor(u) {
			super(u), this.on("finalize", () => {
				this.value || (this.value = u.defaultValue);
			});
		}
	};
	V$2 = ce(), u$2 = (t, n) => V$2 ? t : n, le = u$2("❯", ">"), L$2 = u$2("■", "x"), W$2 = u$2("▲", "x"), C$2 = u$2("✔", "√"), o$1 = u$2(""), d$2 = u$2(""), k$2 = u$2("●", ">"), P$2 = u$2("○", " "), A$2 = u$2("◻", "[•]"), T$2 = u$2("◼", "[+]"), F$2 = u$2("◻", "[ ]"), w$2 = (t) => {
		switch (t) {
			case "initial":
			case "active": return e.cyan(le);
			case "cancel": return e.red(L$2);
			case "error": return e.yellow(W$2);
			case "submit": return e.green(C$2);
		}
	}, B$1 = (t) => {
		const { cursor: n, options: s, style: r } = t, i = t.maxItems ?? Number.POSITIVE_INFINITY, a = Math.max(process.stdout.rows - 4, 0), c = Math.min(a, Math.max(i, 5));
		let l = 0;
		n >= l + c - 3 ? l = Math.max(Math.min(n - c + 3, s.length - c), 0) : n < l + 2 && (l = Math.max(n - 2, 0));
		const $ = c < s.length && l > 0, p = c < s.length && l + c < s.length;
		return s.slice(l, l + c).map((M, v, x) => {
			const j = v === 0 && $, E = v === x.length - 1 && p;
			return j || E ? e.dim("...") : r(M, v + l === n);
		});
	}, he = (t) => new PD({
		validate: t.validate,
		placeholder: t.placeholder,
		defaultValue: t.defaultValue,
		initialValue: t.initialValue,
		render() {
			const n = `${e.gray(o$1)}
${w$2(this.state)} ${t.message}
`, s = t.placeholder ? e.inverse(t.placeholder[0]) + e.dim(t.placeholder.slice(1)) : e.inverse(e.hidden("_")), r = this.value ? this.valueWithCursor : s;
			switch (this.state) {
				case "error": return `${n.trim()}
${e.yellow(o$1)} ${r}
${e.yellow(d$2)} ${e.yellow(this.error)}
`;
				case "submit": return `${n}${e.gray(o$1)} ${e.dim(this.value || t.placeholder)}`;
				case "cancel": return `${n}${e.gray(o$1)} ${e.strikethrough(e.dim(this.value ?? ""))}${this.value?.trim() ? `
${e.gray(o$1)}` : ""}`;
				default: return `${n}${e.cyan(o$1)} ${r}
${e.cyan(d$2)}
`;
			}
		}
	}).prompt(), ye = (t) => {
		const n = t.active ?? "Yes", s = t.inactive ?? "No";
		return new fD({
			active: n,
			inactive: s,
			initialValue: t.initialValue ?? true,
			render() {
				const r = `${e.gray(o$1)}
${w$2(this.state)} ${t.message}
`, i = this.value ? n : s;
				switch (this.state) {
					case "submit": return `${r}${e.gray(o$1)} ${e.dim(i)}`;
					case "cancel": return `${r}${e.gray(o$1)} ${e.strikethrough(e.dim(i))}
${e.gray(o$1)}`;
					default: return `${r}${e.cyan(o$1)} ${this.value ? `${e.green(k$2)} ${n}` : `${e.dim(P$2)} ${e.dim(n)}`} ${e.dim("/")} ${this.value ? `${e.dim(P$2)} ${e.dim(s)}` : `${e.green(k$2)} ${s}`}
${e.cyan(d$2)}
`;
				}
			}
		}).prompt();
	}, ve = (t) => {
		const n = (s, r) => {
			const i = s.label ?? String(s.value);
			switch (r) {
				case "selected": return `${e.dim(i)}`;
				case "active": return `${e.green(k$2)} ${i} ${s.hint ? e.dim(`(${s.hint})`) : ""}`;
				case "cancelled": return `${e.strikethrough(e.dim(i))}`;
				default: return `${e.dim(P$2)} ${e.dim(i)}`;
			}
		};
		return new jD({
			options: t.options,
			initialValue: t.initialValue,
			render() {
				const s = `${e.gray(o$1)}
${w$2(this.state)} ${t.message}
`;
				switch (this.state) {
					case "submit": return `${s}${e.gray(o$1)} ${n(this.options[this.cursor], "selected")}`;
					case "cancel": return `${s}${e.gray(o$1)} ${n(this.options[this.cursor], "cancelled")}
${e.gray(o$1)}`;
					default: return `${s}${e.cyan(o$1)} ${B$1({
						cursor: this.cursor,
						options: this.options,
						maxItems: t.maxItems,
						style: (r, i) => n(r, i ? "active" : "inactive")
					}).join(`
${e.cyan(o$1)}  `)}
${e.cyan(d$2)}
`;
				}
			}
		}).prompt();
	}, fe = (t) => {
		const n = (s, r) => {
			const i = s.label ?? String(s.value);
			return r === "active" ? `${e.cyan(A$2)} ${i} ${s.hint ? e.dim(`(${s.hint})`) : ""}` : r === "selected" ? `${e.green(T$2)} ${e.dim(i)}` : r === "cancelled" ? `${e.strikethrough(e.dim(i))}` : r === "active-selected" ? `${e.green(T$2)} ${i} ${s.hint ? e.dim(`(${s.hint})`) : ""}` : r === "submitted" ? `${e.dim(i)}` : `${e.dim(F$2)} ${e.dim(i)}`;
		};
		return new wD({
			options: t.options,
			initialValues: t.initialValues,
			required: t.required ?? true,
			cursorAt: t.cursorAt,
			validate(s) {
				if (this.required && s.length === 0) return `Please select at least one option.
${e.reset(e.dim(`Press ${e.gray(e.bgWhite(e.inverse(" space ")))} to select, ${e.gray(e.bgWhite(e.inverse(" enter ")))} to submit`))}`;
			},
			render() {
				const s = `${e.gray(o$1)}
${w$2(this.state)} ${t.message}
`, r = (i, a) => {
					const c = this.value.includes(i.value);
					return a && c ? n(i, "active-selected") : c ? n(i, "selected") : n(i, a ? "active" : "inactive");
				};
				switch (this.state) {
					case "submit": return `${s}${e.gray(o$1)} ${this.options.filter(({ value: i }) => this.value.includes(i)).map((i) => n(i, "submitted")).join(e.dim(", ")) || e.dim("none")}`;
					case "cancel": {
						const i = this.options.filter(({ value: a }) => this.value.includes(a)).map((a) => n(a, "cancelled")).join(e.dim(", "));
						return `${s}${e.gray(o$1)} ${i.trim() ? `${i}
${e.gray(o$1)}` : ""}`;
					}
					case "error": {
						const i = this.error.split(`
`).map((a, c) => c === 0 ? `${e.yellow(d$2)} ${e.yellow(a)}` : `   ${a}`).join(`
`);
						return `${s + e.yellow(o$1)} ${B$1({
							options: this.options,
							cursor: this.cursor,
							maxItems: t.maxItems,
							style: r
						}).join(`
${e.yellow(o$1)}  `)}
${i}
`;
					}
					default: return `${s}${e.cyan(o$1)} ${B$1({
						options: this.options,
						cursor: this.cursor,
						maxItems: t.maxItems,
						style: r
					}).join(`
${e.cyan(o$1)}  `)}
${e.cyan(d$2)}
`;
				}
			}
		}).prompt();
	};
	`${e.gray(o$1)}`;
	kCancel = Symbol.for("cancel");
}));

//#endregion
//#region ../../node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs
const r = Object.create(null), i = (e) => globalThis.process?.env || import.meta.env || globalThis.Deno?.env.toObject() || globalThis.__env__ || (e ? r : globalThis), o = new Proxy(r, {
	get(e, s) {
		return i()[s] ?? r[s];
	},
	has(e, s) {
		return s in i() || s in r;
	},
	set(e, s, E) {
		const B = i(true);
		return B[s] = E, true;
	},
	deleteProperty(e, s) {
		if (!s) return false;
		const E = i(true);
		return delete E[s], true;
	},
	ownKeys() {
		const e = i(true);
		return Object.keys(e);
	}
}), t = typeof process < "u" && process.env && process.env.NODE_ENV || "", f$2 = [
	["APPVEYOR"],
	[
		"AWS_AMPLIFY",
		"AWS_APP_ID",
		{ ci: true }
	],
	["AZURE_PIPELINES", "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],
	["AZURE_STATIC", "INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],
	["APPCIRCLE", "AC_APPCIRCLE"],
	["BAMBOO", "bamboo_planKey"],
	["BITBUCKET", "BITBUCKET_COMMIT"],
	["BITRISE", "BITRISE_IO"],
	["BUDDY", "BUDDY_WORKSPACE_ID"],
	["BUILDKITE"],
	["CIRCLE", "CIRCLECI"],
	["CIRRUS", "CIRRUS_CI"],
	[
		"CLOUDFLARE_PAGES",
		"CF_PAGES",
		{ ci: true }
	],
	["CODEBUILD", "CODEBUILD_BUILD_ARN"],
	["CODEFRESH", "CF_BUILD_ID"],
	["DRONE"],
	["DRONE", "DRONE_BUILD_EVENT"],
	["DSARI"],
	["GITHUB_ACTIONS"],
	["GITLAB", "GITLAB_CI"],
	["GITLAB", "CI_MERGE_REQUEST_ID"],
	["GOCD", "GO_PIPELINE_LABEL"],
	["LAYERCI"],
	["HUDSON", "HUDSON_URL"],
	["JENKINS", "JENKINS_URL"],
	["MAGNUM"],
	["NETLIFY"],
	[
		"NETLIFY",
		"NETLIFY_LOCAL",
		{ ci: false }
	],
	["NEVERCODE"],
	["RENDER"],
	["SAIL", "SAILCI"],
	["SEMAPHORE"],
	["SCREWDRIVER"],
	["SHIPPABLE"],
	["SOLANO", "TDDIUM"],
	["STRIDER"],
	["TEAMCITY", "TEAMCITY_VERSION"],
	["TRAVIS"],
	["VERCEL", "NOW_BUILDER"],
	[
		"VERCEL",
		"VERCEL",
		{ ci: false }
	],
	[
		"VERCEL",
		"VERCEL_ENV",
		{ ci: false }
	],
	["APPCENTER", "APPCENTER_BUILD_ID"],
	[
		"CODESANDBOX",
		"CODESANDBOX_SSE",
		{ ci: false }
	],
	[
		"CODESANDBOX",
		"CODESANDBOX_HOST",
		{ ci: false }
	],
	["STACKBLITZ"],
	["STORMKIT"],
	["CLEAVR"],
	["ZEABUR"],
	[
		"CODESPHERE",
		"CODESPHERE_APP_ID",
		{ ci: true }
	],
	["RAILWAY", "RAILWAY_PROJECT_ID"],
	["RAILWAY", "RAILWAY_SERVICE_ID"],
	["DENO-DEPLOY", "DENO_DEPLOYMENT_ID"],
	[
		"FIREBASE_APP_HOSTING",
		"FIREBASE_APP_HOSTING",
		{ ci: true }
	]
];
function b$1() {
	if (globalThis.process?.env) for (const e of f$2) {
		const s = e[1] || e[0];
		if (globalThis.process?.env[s]) return {
			name: e[0].toLowerCase(),
			...e[2]
		};
	}
	return globalThis.process?.env?.SHELL === "/bin/jsh" && globalThis.process?.versions?.webcontainer ? {
		name: "stackblitz",
		ci: false
	} : {
		name: "",
		ci: false
	};
}
const l$1 = b$1();
l$1.name;
function n(e) {
	return e ? e !== "false" : false;
}
const I$1 = globalThis.process?.platform || "", T$1 = n(o.CI) || l$1.ci !== false, a = n(globalThis.process?.stdout && globalThis.process?.stdout.isTTY), g$1 = n(o.DEBUG), R$1 = t === "test" || n(o.TEST);
n(o.MINIMAL);
const A$1 = /^win/i.test(I$1);
!n(o.NO_COLOR) && (n(o.FORCE_COLOR) || (a || A$1) && o.TERM);
const C$1 = (globalThis.process?.versions?.node || "").replace(/^v/, "") || null;
Number(C$1?.split(".")[0]);
const y$1 = globalThis.process || Object.create(null), _$1 = { versions: {} };
new Proxy(y$1, { get(e, s) {
	if (s === "env") return o;
	if (s in e) return e[s];
	if (s in _$1) return _$1[s];
} });
const c = globalThis.process?.release?.name === "node", O$1 = !!globalThis.Bun || !!globalThis.process?.versions?.bun, D$1 = !!globalThis.Deno, L = !!globalThis.fastly, S$1 = !!globalThis.Netlify, u$1 = !!globalThis.EdgeRuntime, N$1 = globalThis.navigator?.userAgent === "Cloudflare-Workers", F$1 = [
	[S$1, "netlify"],
	[u$1, "edge-light"],
	[N$1, "workerd"],
	[L, "fastly"],
	[D$1, "deno"],
	[O$1, "bun"],
	[c, "node"]
];
function G$1() {
	const e = F$1.find((s) => s[0]);
	if (e) return { name: e[1] };
}
G$1()?.name;
function ansiRegex({ onlyFirst = false } = {}) {
	const pattern = [`[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))`, "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
	return new RegExp(pattern, onlyFirst ? void 0 : "g");
}
const regex = ansiRegex();
function stripAnsi(string) {
	if (typeof string !== "string") throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
	return string.replace(regex, "");
}
function isAmbiguous(x) {
	return x === 161 || x === 164 || x === 167 || x === 168 || x === 170 || x === 173 || x === 174 || x >= 176 && x <= 180 || x >= 182 && x <= 186 || x >= 188 && x <= 191 || x === 198 || x === 208 || x === 215 || x === 216 || x >= 222 && x <= 225 || x === 230 || x >= 232 && x <= 234 || x === 236 || x === 237 || x === 240 || x === 242 || x === 243 || x >= 247 && x <= 250 || x === 252 || x === 254 || x === 257 || x === 273 || x === 275 || x === 283 || x === 294 || x === 295 || x === 299 || x >= 305 && x <= 307 || x === 312 || x >= 319 && x <= 322 || x === 324 || x >= 328 && x <= 331 || x === 333 || x === 338 || x === 339 || x === 358 || x === 359 || x === 363 || x === 462 || x === 464 || x === 466 || x === 468 || x === 470 || x === 472 || x === 474 || x === 476 || x === 593 || x === 609 || x === 708 || x === 711 || x >= 713 && x <= 715 || x === 717 || x === 720 || x >= 728 && x <= 731 || x === 733 || x === 735 || x >= 768 && x <= 879 || x >= 913 && x <= 929 || x >= 931 && x <= 937 || x >= 945 && x <= 961 || x >= 963 && x <= 969 || x === 1025 || x >= 1040 && x <= 1103 || x === 1105 || x === 8208 || x >= 8211 && x <= 8214 || x === 8216 || x === 8217 || x === 8220 || x === 8221 || x >= 8224 && x <= 8226 || x >= 8228 && x <= 8231 || x === 8240 || x === 8242 || x === 8243 || x === 8245 || x === 8251 || x === 8254 || x === 8308 || x === 8319 || x >= 8321 && x <= 8324 || x === 8364 || x === 8451 || x === 8453 || x === 8457 || x === 8467 || x === 8470 || x === 8481 || x === 8482 || x === 8486 || x === 8491 || x === 8531 || x === 8532 || x >= 8539 && x <= 8542 || x >= 8544 && x <= 8555 || x >= 8560 && x <= 8569 || x === 8585 || x >= 8592 && x <= 8601 || x === 8632 || x === 8633 || x === 8658 || x === 8660 || x === 8679 || x === 8704 || x === 8706 || x === 8707 || x === 8711 || x === 8712 || x === 8715 || x === 8719 || x === 8721 || x === 8725 || x === 8730 || x >= 8733 && x <= 8736 || x === 8739 || x === 8741 || x >= 8743 && x <= 8748 || x === 8750 || x >= 8756 && x <= 8759 || x === 8764 || x === 8765 || x === 8776 || x === 8780 || x === 8786 || x === 8800 || x === 8801 || x >= 8804 && x <= 8807 || x === 8810 || x === 8811 || x === 8814 || x === 8815 || x === 8834 || x === 8835 || x === 8838 || x === 8839 || x === 8853 || x === 8857 || x === 8869 || x === 8895 || x === 8978 || x >= 9312 && x <= 9449 || x >= 9451 && x <= 9547 || x >= 9552 && x <= 9587 || x >= 9600 && x <= 9615 || x >= 9618 && x <= 9621 || x === 9632 || x === 9633 || x >= 9635 && x <= 9641 || x === 9650 || x === 9651 || x === 9654 || x === 9655 || x === 9660 || x === 9661 || x === 9664 || x === 9665 || x >= 9670 && x <= 9672 || x === 9675 || x >= 9678 && x <= 9681 || x >= 9698 && x <= 9701 || x === 9711 || x === 9733 || x === 9734 || x === 9737 || x === 9742 || x === 9743 || x === 9756 || x === 9758 || x === 9792 || x === 9794 || x === 9824 || x === 9825 || x >= 9827 && x <= 9829 || x >= 9831 && x <= 9834 || x === 9836 || x === 9837 || x === 9839 || x === 9886 || x === 9887 || x === 9919 || x >= 9926 && x <= 9933 || x >= 9935 && x <= 9939 || x >= 9941 && x <= 9953 || x === 9955 || x === 9960 || x === 9961 || x >= 9963 && x <= 9969 || x === 9972 || x >= 9974 && x <= 9977 || x === 9979 || x === 9980 || x === 9982 || x === 9983 || x === 10045 || x >= 10102 && x <= 10111 || x >= 11094 && x <= 11097 || x >= 12872 && x <= 12879 || x >= 57344 && x <= 63743 || x >= 65024 && x <= 65039 || x === 65533 || x >= 127232 && x <= 127242 || x >= 127248 && x <= 127277 || x >= 127280 && x <= 127337 || x >= 127344 && x <= 127373 || x === 127375 || x === 127376 || x >= 127387 && x <= 127404 || x >= 917760 && x <= 917999 || x >= 983040 && x <= 1048573 || x >= 1048576 && x <= 1114109;
}
function isFullWidth(x) {
	return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
}
function isWide(x) {
	return x >= 4352 && x <= 4447 || x === 8986 || x === 8987 || x === 9001 || x === 9002 || x >= 9193 && x <= 9196 || x === 9200 || x === 9203 || x === 9725 || x === 9726 || x === 9748 || x === 9749 || x >= 9776 && x <= 9783 || x >= 9800 && x <= 9811 || x === 9855 || x >= 9866 && x <= 9871 || x === 9875 || x === 9889 || x === 9898 || x === 9899 || x === 9917 || x === 9918 || x === 9924 || x === 9925 || x === 9934 || x === 9940 || x === 9962 || x === 9970 || x === 9971 || x === 9973 || x === 9978 || x === 9981 || x === 9989 || x === 9994 || x === 9995 || x === 10024 || x === 10060 || x === 10062 || x >= 10067 && x <= 10069 || x === 10071 || x >= 10133 && x <= 10135 || x === 10160 || x === 10175 || x === 11035 || x === 11036 || x === 11088 || x === 11093 || x >= 11904 && x <= 11929 || x >= 11931 && x <= 12019 || x >= 12032 && x <= 12245 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12353 && x <= 12438 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12773 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 42124 || x >= 42128 && x <= 42182 || x >= 43360 && x <= 43388 || x >= 44032 && x <= 55203 || x >= 63744 && x <= 64255 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 94176 && x <= 94180 || x === 94192 || x === 94193 || x >= 94208 && x <= 100343 || x >= 100352 && x <= 101589 || x >= 101631 && x <= 101640 || x >= 110576 && x <= 110579 || x >= 110581 && x <= 110587 || x === 110589 || x === 110590 || x >= 110592 && x <= 110882 || x === 110898 || x >= 110928 && x <= 110930 || x === 110933 || x >= 110948 && x <= 110951 || x >= 110960 && x <= 111355 || x >= 119552 && x <= 119638 || x >= 119648 && x <= 119670 || x === 126980 || x === 127183 || x === 127374 || x >= 127377 && x <= 127386 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x === 127568 || x === 127569 || x >= 127584 && x <= 127589 || x >= 127744 && x <= 127776 || x >= 127789 && x <= 127797 || x >= 127799 && x <= 127868 || x >= 127870 && x <= 127891 || x >= 127904 && x <= 127946 || x >= 127951 && x <= 127955 || x >= 127968 && x <= 127984 || x === 127988 || x >= 127992 && x <= 128062 || x === 128064 || x >= 128066 && x <= 128252 || x >= 128255 && x <= 128317 || x >= 128331 && x <= 128334 || x >= 128336 && x <= 128359 || x === 128378 || x === 128405 || x === 128406 || x === 128420 || x >= 128507 && x <= 128591 || x >= 128640 && x <= 128709 || x === 128716 || x >= 128720 && x <= 128722 || x >= 128725 && x <= 128727 || x >= 128732 && x <= 128735 || x === 128747 || x === 128748 || x >= 128756 && x <= 128764 || x >= 128992 && x <= 129003 || x === 129008 || x >= 129292 && x <= 129338 || x >= 129340 && x <= 129349 || x >= 129351 && x <= 129535 || x >= 129648 && x <= 129660 || x >= 129664 && x <= 129673 || x >= 129679 && x <= 129734 || x >= 129742 && x <= 129756 || x >= 129759 && x <= 129769 || x >= 129776 && x <= 129784 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
}
function validate(codePoint) {
	if (!Number.isSafeInteger(codePoint)) throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
}
function eastAsianWidth(codePoint, { ambiguousAsWide = false } = {}) {
	validate(codePoint);
	if (isFullWidth(codePoint) || isWide(codePoint) || ambiguousAsWide && isAmbiguous(codePoint)) return 2;
	return 1;
}
const emojiRegex = () => {
	return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE89\uDE8F-\uDEC2\uDEC6\uDECE-\uDEDC\uDEDF-\uDEE9]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
};
const segmenter = globalThis.Intl?.Segmenter ? new Intl.Segmenter() : { segment: (str) => str.split("") };
const defaultIgnorableCodePointRegex = /^\p{Default_Ignorable_Code_Point}$/u;
function stringWidth$1(string, options = {}) {
	if (typeof string !== "string" || string.length === 0) return 0;
	const { ambiguousIsNarrow = true, countAnsiEscapeCodes = false } = options;
	if (!countAnsiEscapeCodes) string = stripAnsi(string);
	if (string.length === 0) return 0;
	let width = 0;
	const eastAsianWidthOptions = { ambiguousAsWide: !ambiguousIsNarrow };
	for (const { segment: character } of segmenter.segment(string)) {
		const codePoint = character.codePointAt(0);
		if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159) continue;
		if (codePoint >= 8203 && codePoint <= 8207 || codePoint === 65279) continue;
		if (codePoint >= 768 && codePoint <= 879 || codePoint >= 6832 && codePoint <= 6911 || codePoint >= 7616 && codePoint <= 7679 || codePoint >= 8400 && codePoint <= 8447 || codePoint >= 65056 && codePoint <= 65071) continue;
		if (codePoint >= 55296 && codePoint <= 57343) continue;
		if (codePoint >= 65024 && codePoint <= 65039) continue;
		if (defaultIgnorableCodePointRegex.test(character)) continue;
		if (emojiRegex().test(character)) {
			width += 2;
			continue;
		}
		width += eastAsianWidth(codePoint, eastAsianWidthOptions);
	}
	return width;
}
function isUnicodeSupported() {
	const { env } = process$1;
	const { TERM, TERM_PROGRAM } = env;
	if (process$1.platform !== "win32") return TERM !== "linux";
	return Boolean(env.WT_SESSION) || Boolean(env.TERMINUS_SUBLIME) || env.ConEmuTask === "{cmd::Cmder}" || TERM_PROGRAM === "Terminus-Sublime" || TERM_PROGRAM === "vscode" || TERM === "xterm-256color" || TERM === "alacritty" || TERM === "rxvt-unicode" || TERM === "rxvt-unicode-256color" || env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
const TYPE_COLOR_MAP = {
	info: "cyan",
	fail: "red",
	success: "green",
	ready: "green",
	start: "magenta"
};
const LEVEL_COLOR_MAP = {
	0: "red",
	1: "yellow"
};
const unicode = isUnicodeSupported();
const s = (c, fallback) => unicode ? c : fallback;
const TYPE_ICONS = {
	error: s("✖", "×"),
	fatal: s("✖", "×"),
	ready: s("✔", "√"),
	warn: s("⚠", "‼"),
	info: s("ℹ", "i"),
	success: s("✔", "√"),
	debug: s("⚙", "D"),
	trace: s("→", "→"),
	fail: s("✖", "×"),
	start: s("◐", "o"),
	log: ""
};
function stringWidth(str) {
	if (!(typeof Intl === "object") || !Intl.Segmenter) return stripAnsi$1(str).length;
	return stringWidth$1(str);
}
var FancyReporter = class extends BasicReporter {
	formatStack(stack, message, opts) {
		const indent = "  ".repeat((opts?.errorLevel || 0) + 1);
		return `
${indent}` + parseStack(stack, message).map((line) => "  " + line.replace(/^at +/, (m) => colors.gray(m)).replace(/\((.+)\)/, (_, m) => `(${colors.cyan(m)})`)).join(`
${indent}`);
	}
	formatType(logObj, isBadge, opts) {
		const typeColor = TYPE_COLOR_MAP[logObj.type] || LEVEL_COLOR_MAP[logObj.level] || "gray";
		if (isBadge) return getBgColor(typeColor)(colors.black(` ${logObj.type.toUpperCase()} `));
		const _type = typeof TYPE_ICONS[logObj.type] === "string" ? TYPE_ICONS[logObj.type] : logObj.icon || logObj.type;
		return _type ? getColor(typeColor)(_type) : "";
	}
	formatLogObj(logObj, opts) {
		const [message, ...additional] = this.formatArgs(logObj.args, opts).split("\n");
		if (logObj.type === "box") return box(characterFormat(message + (additional.length > 0 ? "\n" + additional.join("\n") : "")), {
			title: logObj.title ? characterFormat(logObj.title) : void 0,
			style: logObj.style
		});
		const date = this.formatDate(logObj.date, opts);
		const coloredDate = date && colors.gray(date);
		const isBadge = logObj.badge ?? logObj.level < 2;
		const type = this.formatType(logObj, isBadge, opts);
		const tag = logObj.tag ? colors.gray(logObj.tag) : "";
		let line;
		const left = this.filterAndJoin([type, characterFormat(message)]);
		const right = this.filterAndJoin(opts.columns ? [tag, coloredDate] : [tag]);
		const space = (opts.columns || 0) - stringWidth(left) - stringWidth(right) - 2;
		line = space > 0 && (opts.columns || 0) >= 80 ? left + " ".repeat(space) + right : (right ? `${colors.gray(`[${right}]`)} ` : "") + left;
		line += characterFormat(additional.length > 0 ? "\n" + additional.join("\n") : "");
		if (logObj.type === "trace") {
			const _err = /* @__PURE__ */ new Error("Trace: " + logObj.message);
			line += this.formatStack(_err.stack || "", _err.message);
		}
		return isBadge ? "\n" + line + "\n" : line;
	}
};
function characterFormat(str) {
	return str.replace(/`([^`]+)`/gm, (_, m) => colors.cyan(m)).replace(/\s+_([^_]+)_\s+/gm, (_, m) => ` ${colors.underline(m)} `);
}
function getColor(color = "white") {
	return colors[color] || colors.white;
}
function getBgColor(color = "bgWhite") {
	return colors[`bg${color[0].toUpperCase()}${color.slice(1)}`] || colors.bgWhite;
}
function createConsola(options = {}) {
	let level = _getDefaultLogLevel();
	if (process.env.CONSOLA_LEVEL) level = Number.parseInt(process.env.CONSOLA_LEVEL) ?? level;
	return createConsola$1({
		level,
		defaults: { level },
		stdout: process.stdout,
		stderr: process.stderr,
		prompt: (...args) => Promise.resolve().then(() => (init_prompt(), prompt_exports)).then((m) => m.prompt(...args)),
		reporters: options.reporters || [options.fancy ?? !(T$1 || R$1) ? new FancyReporter() : new BasicReporter()],
		...options
	});
}
function _getDefaultLogLevel() {
	if (g$1) return LogLevels.debug;
	if (R$1) return LogLevels.warn;
	return LogLevels.info;
}
const consola = createConsola();

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/is.js
var require_is = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
	function boolean(value) {
		return value === true || value === false;
	}
	exports.boolean = boolean;
	function string(value) {
		return typeof value === "string" || value instanceof String;
	}
	exports.string = string;
	function number(value) {
		return typeof value === "number" || value instanceof Number;
	}
	exports.number = number;
	function error(value) {
		return value instanceof Error;
	}
	exports.error = error;
	function func(value) {
		return typeof value === "function";
	}
	exports.func = func;
	function array(value) {
		return Array.isArray(value);
	}
	exports.array = array;
	function stringArray(value) {
		return array(value) && value.every((elem) => string(elem));
	}
	exports.stringArray = stringArray;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messages.js
var require_messages = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Message = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType = exports.RequestType0 = exports.AbstractMessageSignature = exports.ParameterStructures = exports.ResponseError = exports.ErrorCodes = void 0;
	const is = require_is();
	/**
	* Predefined error codes.
	*/
	var ErrorCodes;
	(function(ErrorCodes) {
		ErrorCodes.ParseError = -32700;
		ErrorCodes.InvalidRequest = -32600;
		ErrorCodes.MethodNotFound = -32601;
		ErrorCodes.InvalidParams = -32602;
		ErrorCodes.InternalError = -32603;
		/**
		* This is the start range of JSON RPC reserved error codes.
		* It doesn't denote a real error code. No application error codes should
		* be defined between the start and end range. For backwards
		* compatibility the `ServerNotInitialized` and the `UnknownErrorCode`
		* are left in the range.
		*
		* @since 3.16.0
		*/
		ErrorCodes.jsonrpcReservedErrorRangeStart = -32099;
		/** @deprecated use  jsonrpcReservedErrorRangeStart */
		ErrorCodes.serverErrorStart = -32099;
		/**
		* An error occurred when write a message to the transport layer.
		*/
		ErrorCodes.MessageWriteError = -32099;
		/**
		* An error occurred when reading a message from the transport layer.
		*/
		ErrorCodes.MessageReadError = -32098;
		/**
		* The connection got disposed or lost and all pending responses got
		* rejected.
		*/
		ErrorCodes.PendingResponseRejected = -32097;
		/**
		* The connection is inactive and a use of it failed.
		*/
		ErrorCodes.ConnectionInactive = -32096;
		/**
		* Error code indicating that a server received a notification or
		* request before the server has received the `initialize` request.
		*/
		ErrorCodes.ServerNotInitialized = -32002;
		ErrorCodes.UnknownErrorCode = -32001;
		/**
		* This is the end range of JSON RPC reserved error codes.
		* It doesn't denote a real error code.
		*
		* @since 3.16.0
		*/
		ErrorCodes.jsonrpcReservedErrorRangeEnd = -32e3;
		/** @deprecated use  jsonrpcReservedErrorRangeEnd */
		ErrorCodes.serverErrorEnd = -32e3;
	})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
	/**
	* An error object return in a response in case a request
	* has failed.
	*/
	var ResponseError = class ResponseError extends Error {
		constructor(code, message, data) {
			super(message);
			this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
			this.data = data;
			Object.setPrototypeOf(this, ResponseError.prototype);
		}
		toJson() {
			const result = {
				code: this.code,
				message: this.message
			};
			if (this.data !== void 0) result.data = this.data;
			return result;
		}
	};
	exports.ResponseError = ResponseError;
	var ParameterStructures = class ParameterStructures {
		constructor(kind) {
			this.kind = kind;
		}
		static is(value) {
			return value === ParameterStructures.auto || value === ParameterStructures.byName || value === ParameterStructures.byPosition;
		}
		toString() {
			return this.kind;
		}
	};
	exports.ParameterStructures = ParameterStructures;
	/**
	* The parameter structure is automatically inferred on the number of parameters
	* and the parameter type in case of a single param.
	*/
	ParameterStructures.auto = new ParameterStructures("auto");
	/**
	* Forces `byPosition` parameter structure. This is useful if you have a single
	* parameter which has a literal type.
	*/
	ParameterStructures.byPosition = new ParameterStructures("byPosition");
	/**
	* Forces `byName` parameter structure. This is only useful when having a single
	* parameter. The library will report errors if used with a different number of
	* parameters.
	*/
	ParameterStructures.byName = new ParameterStructures("byName");
	/**
	* An abstract implementation of a MessageType.
	*/
	var AbstractMessageSignature = class {
		constructor(method, numberOfParams) {
			this.method = method;
			this.numberOfParams = numberOfParams;
		}
		get parameterStructures() {
			return ParameterStructures.auto;
		}
	};
	exports.AbstractMessageSignature = AbstractMessageSignature;
	/**
	* Classes to type request response pairs
	*/
	var RequestType0 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 0);
		}
	};
	exports.RequestType0 = RequestType0;
	var RequestType = class extends AbstractMessageSignature {
		constructor(method, _parameterStructures = ParameterStructures.auto) {
			super(method, 1);
			this._parameterStructures = _parameterStructures;
		}
		get parameterStructures() {
			return this._parameterStructures;
		}
	};
	exports.RequestType = RequestType;
	var RequestType1 = class extends AbstractMessageSignature {
		constructor(method, _parameterStructures = ParameterStructures.auto) {
			super(method, 1);
			this._parameterStructures = _parameterStructures;
		}
		get parameterStructures() {
			return this._parameterStructures;
		}
	};
	exports.RequestType1 = RequestType1;
	var RequestType2 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 2);
		}
	};
	exports.RequestType2 = RequestType2;
	var RequestType3 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 3);
		}
	};
	exports.RequestType3 = RequestType3;
	var RequestType4 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 4);
		}
	};
	exports.RequestType4 = RequestType4;
	var RequestType5 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 5);
		}
	};
	exports.RequestType5 = RequestType5;
	var RequestType6 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 6);
		}
	};
	exports.RequestType6 = RequestType6;
	var RequestType7 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 7);
		}
	};
	exports.RequestType7 = RequestType7;
	var RequestType8 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 8);
		}
	};
	exports.RequestType8 = RequestType8;
	var RequestType9 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 9);
		}
	};
	exports.RequestType9 = RequestType9;
	var NotificationType = class extends AbstractMessageSignature {
		constructor(method, _parameterStructures = ParameterStructures.auto) {
			super(method, 1);
			this._parameterStructures = _parameterStructures;
		}
		get parameterStructures() {
			return this._parameterStructures;
		}
	};
	exports.NotificationType = NotificationType;
	var NotificationType0 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 0);
		}
	};
	exports.NotificationType0 = NotificationType0;
	var NotificationType1 = class extends AbstractMessageSignature {
		constructor(method, _parameterStructures = ParameterStructures.auto) {
			super(method, 1);
			this._parameterStructures = _parameterStructures;
		}
		get parameterStructures() {
			return this._parameterStructures;
		}
	};
	exports.NotificationType1 = NotificationType1;
	var NotificationType2 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 2);
		}
	};
	exports.NotificationType2 = NotificationType2;
	var NotificationType3 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 3);
		}
	};
	exports.NotificationType3 = NotificationType3;
	var NotificationType4 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 4);
		}
	};
	exports.NotificationType4 = NotificationType4;
	var NotificationType5 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 5);
		}
	};
	exports.NotificationType5 = NotificationType5;
	var NotificationType6 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 6);
		}
	};
	exports.NotificationType6 = NotificationType6;
	var NotificationType7 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 7);
		}
	};
	exports.NotificationType7 = NotificationType7;
	var NotificationType8 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 8);
		}
	};
	exports.NotificationType8 = NotificationType8;
	var NotificationType9 = class extends AbstractMessageSignature {
		constructor(method) {
			super(method, 9);
		}
	};
	exports.NotificationType9 = NotificationType9;
	var Message;
	(function(Message) {
		/**
		* Tests if the given message is a request message
		*/
		function isRequest(message) {
			const candidate = message;
			return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
		}
		Message.isRequest = isRequest;
		/**
		* Tests if the given message is a notification message
		*/
		function isNotification(message) {
			const candidate = message;
			return candidate && is.string(candidate.method) && message.id === void 0;
		}
		Message.isNotification = isNotification;
		/**
		* Tests if the given message is a response message
		*/
		function isResponse(message) {
			const candidate = message;
			return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
		}
		Message.isResponse = isResponse;
	})(Message || (exports.Message = Message = {}));
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/linkedMap.js
var require_linkedMap = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LRUCache = exports.LinkedMap = exports.Touch = void 0;
	var Touch;
	(function(Touch) {
		Touch.None = 0;
		Touch.First = 1;
		Touch.AsOld = Touch.First;
		Touch.Last = 2;
		Touch.AsNew = Touch.Last;
	})(Touch || (exports.Touch = Touch = {}));
	var LinkedMap = class {
		constructor() {
			this[_a] = "LinkedMap";
			this._map = /* @__PURE__ */ new Map();
			this._head = void 0;
			this._tail = void 0;
			this._size = 0;
			this._state = 0;
		}
		clear() {
			this._map.clear();
			this._head = void 0;
			this._tail = void 0;
			this._size = 0;
			this._state++;
		}
		isEmpty() {
			return !this._head && !this._tail;
		}
		get size() {
			return this._size;
		}
		get first() {
			return this._head?.value;
		}
		get last() {
			return this._tail?.value;
		}
		has(key) {
			return this._map.has(key);
		}
		get(key, touch = Touch.None) {
			const item = this._map.get(key);
			if (!item) return;
			if (touch !== Touch.None) this.touch(item, touch);
			return item.value;
		}
		set(key, value, touch = Touch.None) {
			let item = this._map.get(key);
			if (item) {
				item.value = value;
				if (touch !== Touch.None) this.touch(item, touch);
			} else {
				item = {
					key,
					value,
					next: void 0,
					previous: void 0
				};
				switch (touch) {
					case Touch.None:
						this.addItemLast(item);
						break;
					case Touch.First:
						this.addItemFirst(item);
						break;
					case Touch.Last:
						this.addItemLast(item);
						break;
					default:
						this.addItemLast(item);
						break;
				}
				this._map.set(key, item);
				this._size++;
			}
			return this;
		}
		delete(key) {
			return !!this.remove(key);
		}
		remove(key) {
			const item = this._map.get(key);
			if (!item) return;
			this._map.delete(key);
			this.removeItem(item);
			this._size--;
			return item.value;
		}
		shift() {
			if (!this._head && !this._tail) return;
			if (!this._head || !this._tail) throw new Error("Invalid list");
			const item = this._head;
			this._map.delete(item.key);
			this.removeItem(item);
			this._size--;
			return item.value;
		}
		forEach(callbackfn, thisArg) {
			const state = this._state;
			let current = this._head;
			while (current) {
				if (thisArg) callbackfn.bind(thisArg)(current.value, current.key, this);
				else callbackfn(current.value, current.key, this);
				if (this._state !== state) throw new Error(`LinkedMap got modified during iteration.`);
				current = current.next;
			}
		}
		keys() {
			const state = this._state;
			let current = this._head;
			const iterator = {
				[Symbol.iterator]: () => {
					return iterator;
				},
				next: () => {
					if (this._state !== state) throw new Error(`LinkedMap got modified during iteration.`);
					if (current) {
						const result = {
							value: current.key,
							done: false
						};
						current = current.next;
						return result;
					} else return {
						value: void 0,
						done: true
					};
				}
			};
			return iterator;
		}
		values() {
			const state = this._state;
			let current = this._head;
			const iterator = {
				[Symbol.iterator]: () => {
					return iterator;
				},
				next: () => {
					if (this._state !== state) throw new Error(`LinkedMap got modified during iteration.`);
					if (current) {
						const result = {
							value: current.value,
							done: false
						};
						current = current.next;
						return result;
					} else return {
						value: void 0,
						done: true
					};
				}
			};
			return iterator;
		}
		entries() {
			const state = this._state;
			let current = this._head;
			const iterator = {
				[Symbol.iterator]: () => {
					return iterator;
				},
				next: () => {
					if (this._state !== state) throw new Error(`LinkedMap got modified during iteration.`);
					if (current) {
						const result = {
							value: [current.key, current.value],
							done: false
						};
						current = current.next;
						return result;
					} else return {
						value: void 0,
						done: true
					};
				}
			};
			return iterator;
		}
		[(_a = Symbol.toStringTag, Symbol.iterator)]() {
			return this.entries();
		}
		trimOld(newSize) {
			if (newSize >= this.size) return;
			if (newSize === 0) {
				this.clear();
				return;
			}
			let current = this._head;
			let currentSize = this.size;
			while (current && currentSize > newSize) {
				this._map.delete(current.key);
				current = current.next;
				currentSize--;
			}
			this._head = current;
			this._size = currentSize;
			if (current) current.previous = void 0;
			this._state++;
		}
		addItemFirst(item) {
			if (!this._head && !this._tail) this._tail = item;
			else if (!this._head) throw new Error("Invalid list");
			else {
				item.next = this._head;
				this._head.previous = item;
			}
			this._head = item;
			this._state++;
		}
		addItemLast(item) {
			if (!this._head && !this._tail) this._head = item;
			else if (!this._tail) throw new Error("Invalid list");
			else {
				item.previous = this._tail;
				this._tail.next = item;
			}
			this._tail = item;
			this._state++;
		}
		removeItem(item) {
			if (item === this._head && item === this._tail) {
				this._head = void 0;
				this._tail = void 0;
			} else if (item === this._head) {
				if (!item.next) throw new Error("Invalid list");
				item.next.previous = void 0;
				this._head = item.next;
			} else if (item === this._tail) {
				if (!item.previous) throw new Error("Invalid list");
				item.previous.next = void 0;
				this._tail = item.previous;
			} else {
				const next = item.next;
				const previous = item.previous;
				if (!next || !previous) throw new Error("Invalid list");
				next.previous = previous;
				previous.next = next;
			}
			item.next = void 0;
			item.previous = void 0;
			this._state++;
		}
		touch(item, touch) {
			if (!this._head || !this._tail) throw new Error("Invalid list");
			if (touch !== Touch.First && touch !== Touch.Last) return;
			if (touch === Touch.First) {
				if (item === this._head) return;
				const next = item.next;
				const previous = item.previous;
				if (item === this._tail) {
					previous.next = void 0;
					this._tail = previous;
				} else {
					next.previous = previous;
					previous.next = next;
				}
				item.previous = void 0;
				item.next = this._head;
				this._head.previous = item;
				this._head = item;
				this._state++;
			} else if (touch === Touch.Last) {
				if (item === this._tail) return;
				const next = item.next;
				const previous = item.previous;
				if (item === this._head) {
					next.previous = void 0;
					this._head = next;
				} else {
					next.previous = previous;
					previous.next = next;
				}
				item.next = void 0;
				item.previous = this._tail;
				this._tail.next = item;
				this._tail = item;
				this._state++;
			}
		}
		toJSON() {
			const data = [];
			this.forEach((value, key) => {
				data.push([key, value]);
			});
			return data;
		}
		fromJSON(data) {
			this.clear();
			for (const [key, value] of data) this.set(key, value);
		}
	};
	exports.LinkedMap = LinkedMap;
	var LRUCache = class extends LinkedMap {
		constructor(limit, ratio = 1) {
			super();
			this._limit = limit;
			this._ratio = Math.min(Math.max(0, ratio), 1);
		}
		get limit() {
			return this._limit;
		}
		set limit(limit) {
			this._limit = limit;
			this.checkTrim();
		}
		get ratio() {
			return this._ratio;
		}
		set ratio(ratio) {
			this._ratio = Math.min(Math.max(0, ratio), 1);
			this.checkTrim();
		}
		get(key, touch = Touch.AsNew) {
			return super.get(key, touch);
		}
		peek(key) {
			return super.get(key, Touch.None);
		}
		set(key, value) {
			super.set(key, value, Touch.Last);
			this.checkTrim();
			return this;
		}
		checkTrim() {
			if (this.size > this._limit) this.trimOld(Math.round(this._limit * this._ratio));
		}
	};
	exports.LRUCache = LRUCache;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/disposable.js
var require_disposable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Disposable = void 0;
	var Disposable;
	(function(Disposable) {
		function create(func) {
			return { dispose: func };
		}
		Disposable.create = create;
	})(Disposable || (exports.Disposable = Disposable = {}));
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/ral.js
var require_ral = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	let _ral;
	function RAL() {
		if (_ral === void 0) throw new Error(`No runtime abstraction layer installed`);
		return _ral;
	}
	(function(RAL) {
		function install(ral) {
			if (ral === void 0) throw new Error(`No runtime abstraction layer provided`);
			_ral = ral;
		}
		RAL.install = install;
	})(RAL || (RAL = {}));
	exports.default = RAL;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/events.js
var require_events = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Emitter = exports.Event = void 0;
	const ral_1 = require_ral();
	var Event;
	(function(Event) {
		const _disposable = { dispose() {} };
		Event.None = function() {
			return _disposable;
		};
	})(Event || (exports.Event = Event = {}));
	var CallbackList = class {
		add(callback, context = null, bucket) {
			if (!this._callbacks) {
				this._callbacks = [];
				this._contexts = [];
			}
			this._callbacks.push(callback);
			this._contexts.push(context);
			if (Array.isArray(bucket)) bucket.push({ dispose: () => this.remove(callback, context) });
		}
		remove(callback, context = null) {
			if (!this._callbacks) return;
			let foundCallbackWithDifferentContext = false;
			for (let i = 0, len = this._callbacks.length; i < len; i++) if (this._callbacks[i] === callback) if (this._contexts[i] === context) {
				this._callbacks.splice(i, 1);
				this._contexts.splice(i, 1);
				return;
			} else foundCallbackWithDifferentContext = true;
			if (foundCallbackWithDifferentContext) throw new Error("When adding a listener with a context, you should remove it with the same context");
		}
		invoke(...args) {
			if (!this._callbacks) return [];
			const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
			for (let i = 0, len = callbacks.length; i < len; i++) try {
				ret.push(callbacks[i].apply(contexts[i], args));
			} catch (e) {
				(0, ral_1.default)().console.error(e);
			}
			return ret;
		}
		isEmpty() {
			return !this._callbacks || this._callbacks.length === 0;
		}
		dispose() {
			this._callbacks = void 0;
			this._contexts = void 0;
		}
	};
	var Emitter = class Emitter {
		constructor(_options) {
			this._options = _options;
		}
		/**
		* For the public to allow to subscribe
		* to events from this Emitter
		*/
		get event() {
			if (!this._event) this._event = (listener, thisArgs, disposables) => {
				if (!this._callbacks) this._callbacks = new CallbackList();
				if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) this._options.onFirstListenerAdd(this);
				this._callbacks.add(listener, thisArgs);
				const result = { dispose: () => {
					if (!this._callbacks) return;
					this._callbacks.remove(listener, thisArgs);
					result.dispose = Emitter._noop;
					if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) this._options.onLastListenerRemove(this);
				} };
				if (Array.isArray(disposables)) disposables.push(result);
				return result;
			};
			return this._event;
		}
		/**
		* To be kept private to fire an event to
		* subscribers
		*/
		fire(event) {
			if (this._callbacks) this._callbacks.invoke.call(this._callbacks, event);
		}
		dispose() {
			if (this._callbacks) {
				this._callbacks.dispose();
				this._callbacks = void 0;
			}
		}
	};
	exports.Emitter = Emitter;
	Emitter._noop = function() {};
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/cancellation.js
var require_cancellation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CancellationTokenSource = exports.CancellationToken = void 0;
	const ral_1 = require_ral();
	const Is = require_is();
	const events_1 = require_events();
	var CancellationToken;
	(function(CancellationToken) {
		CancellationToken.None = Object.freeze({
			isCancellationRequested: false,
			onCancellationRequested: events_1.Event.None
		});
		CancellationToken.Cancelled = Object.freeze({
			isCancellationRequested: true,
			onCancellationRequested: events_1.Event.None
		});
		function is(value) {
			const candidate = value;
			return candidate && (candidate === CancellationToken.None || candidate === CancellationToken.Cancelled || Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
		}
		CancellationToken.is = is;
	})(CancellationToken || (exports.CancellationToken = CancellationToken = {}));
	const shortcutEvent = Object.freeze(function(callback, context) {
		const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
		return { dispose() {
			handle.dispose();
		} };
	});
	var MutableToken = class {
		constructor() {
			this._isCancelled = false;
		}
		cancel() {
			if (!this._isCancelled) {
				this._isCancelled = true;
				if (this._emitter) {
					this._emitter.fire(void 0);
					this.dispose();
				}
			}
		}
		get isCancellationRequested() {
			return this._isCancelled;
		}
		get onCancellationRequested() {
			if (this._isCancelled) return shortcutEvent;
			if (!this._emitter) this._emitter = new events_1.Emitter();
			return this._emitter.event;
		}
		dispose() {
			if (this._emitter) {
				this._emitter.dispose();
				this._emitter = void 0;
			}
		}
	};
	var CancellationTokenSource = class {
		get token() {
			if (!this._token) this._token = new MutableToken();
			return this._token;
		}
		cancel() {
			if (!this._token) this._token = CancellationToken.Cancelled;
			else this._token.cancel();
		}
		dispose() {
			if (!this._token) this._token = CancellationToken.None;
			else if (this._token instanceof MutableToken) this._token.dispose();
		}
	};
	exports.CancellationTokenSource = CancellationTokenSource;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js
var require_sharedArrayCancellation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = void 0;
	const cancellation_1 = require_cancellation();
	var CancellationState;
	(function(CancellationState) {
		CancellationState.Continue = 0;
		CancellationState.Cancelled = 1;
	})(CancellationState || (CancellationState = {}));
	var SharedArraySenderStrategy = class {
		constructor() {
			this.buffers = /* @__PURE__ */ new Map();
		}
		enableCancellation(request) {
			if (request.id === null) return;
			const buffer = new SharedArrayBuffer(4);
			const data = new Int32Array(buffer, 0, 1);
			data[0] = CancellationState.Continue;
			this.buffers.set(request.id, buffer);
			request.$cancellationData = buffer;
		}
		async sendCancellation(_conn, id) {
			const buffer = this.buffers.get(id);
			if (buffer === void 0) return;
			const data = new Int32Array(buffer, 0, 1);
			Atomics.store(data, 0, CancellationState.Cancelled);
		}
		cleanup(id) {
			this.buffers.delete(id);
		}
		dispose() {
			this.buffers.clear();
		}
	};
	exports.SharedArraySenderStrategy = SharedArraySenderStrategy;
	var SharedArrayBufferCancellationToken = class {
		constructor(buffer) {
			this.data = new Int32Array(buffer, 0, 1);
		}
		get isCancellationRequested() {
			return Atomics.load(this.data, 0) === CancellationState.Cancelled;
		}
		get onCancellationRequested() {
			throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
		}
	};
	var SharedArrayBufferCancellationTokenSource = class {
		constructor(buffer) {
			this.token = new SharedArrayBufferCancellationToken(buffer);
		}
		cancel() {}
		dispose() {}
	};
	var SharedArrayReceiverStrategy = class {
		constructor() {
			this.kind = "request";
		}
		createCancellationTokenSource(request) {
			const buffer = request.$cancellationData;
			if (buffer === void 0) return new cancellation_1.CancellationTokenSource();
			return new SharedArrayBufferCancellationTokenSource(buffer);
		}
	};
	exports.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/semaphore.js
var require_semaphore = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Semaphore = void 0;
	const ral_1 = require_ral();
	var Semaphore = class {
		constructor(capacity = 1) {
			if (capacity <= 0) throw new Error("Capacity must be greater than 0");
			this._capacity = capacity;
			this._active = 0;
			this._waiting = [];
		}
		lock(thunk) {
			return new Promise((resolve, reject) => {
				this._waiting.push({
					thunk,
					resolve,
					reject
				});
				this.runNext();
			});
		}
		get active() {
			return this._active;
		}
		runNext() {
			if (this._waiting.length === 0 || this._active === this._capacity) return;
			(0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
		}
		doRunNext() {
			if (this._waiting.length === 0 || this._active === this._capacity) return;
			const next = this._waiting.shift();
			this._active++;
			if (this._active > this._capacity) throw new Error(`To many thunks active`);
			try {
				const result = next.thunk();
				if (result instanceof Promise) result.then((value) => {
					this._active--;
					next.resolve(value);
					this.runNext();
				}, (err) => {
					this._active--;
					next.reject(err);
					this.runNext();
				});
				else {
					this._active--;
					next.resolve(result);
					this.runNext();
				}
			} catch (err) {
				this._active--;
				next.reject(err);
				this.runNext();
			}
		}
	};
	exports.Semaphore = Semaphore;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageReader.js
var require_messageReader = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = void 0;
	const ral_1 = require_ral();
	const Is = require_is();
	const events_1 = require_events();
	const semaphore_1 = require_semaphore();
	var MessageReader;
	(function(MessageReader) {
		function is(value) {
			let candidate = value;
			return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) && Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
		}
		MessageReader.is = is;
	})(MessageReader || (exports.MessageReader = MessageReader = {}));
	var AbstractMessageReader = class {
		constructor() {
			this.errorEmitter = new events_1.Emitter();
			this.closeEmitter = new events_1.Emitter();
			this.partialMessageEmitter = new events_1.Emitter();
		}
		dispose() {
			this.errorEmitter.dispose();
			this.closeEmitter.dispose();
		}
		get onError() {
			return this.errorEmitter.event;
		}
		fireError(error) {
			this.errorEmitter.fire(this.asError(error));
		}
		get onClose() {
			return this.closeEmitter.event;
		}
		fireClose() {
			this.closeEmitter.fire(void 0);
		}
		get onPartialMessage() {
			return this.partialMessageEmitter.event;
		}
		firePartialMessage(info) {
			this.partialMessageEmitter.fire(info);
		}
		asError(error) {
			if (error instanceof Error) return error;
			else return /* @__PURE__ */ new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
		}
	};
	exports.AbstractMessageReader = AbstractMessageReader;
	var ResolvedMessageReaderOptions;
	(function(ResolvedMessageReaderOptions) {
		function fromOptions(options) {
			let charset;
			let contentDecoder;
			const contentDecoders = /* @__PURE__ */ new Map();
			let contentTypeDecoder;
			const contentTypeDecoders = /* @__PURE__ */ new Map();
			if (options === void 0 || typeof options === "string") charset = options ?? "utf-8";
			else {
				charset = options.charset ?? "utf-8";
				if (options.contentDecoder !== void 0) {
					contentDecoder = options.contentDecoder;
					contentDecoders.set(contentDecoder.name, contentDecoder);
				}
				if (options.contentDecoders !== void 0) for (const decoder of options.contentDecoders) contentDecoders.set(decoder.name, decoder);
				if (options.contentTypeDecoder !== void 0) {
					contentTypeDecoder = options.contentTypeDecoder;
					contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
				}
				if (options.contentTypeDecoders !== void 0) for (const decoder of options.contentTypeDecoders) contentTypeDecoders.set(decoder.name, decoder);
			}
			if (contentTypeDecoder === void 0) {
				contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
				contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
			}
			return {
				charset,
				contentDecoder,
				contentDecoders,
				contentTypeDecoder,
				contentTypeDecoders
			};
		}
		ResolvedMessageReaderOptions.fromOptions = fromOptions;
	})(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
	var ReadableStreamMessageReader = class extends AbstractMessageReader {
		constructor(readable, options) {
			super();
			this.readable = readable;
			this.options = ResolvedMessageReaderOptions.fromOptions(options);
			this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
			this._partialMessageTimeout = 1e4;
			this.nextMessageLength = -1;
			this.messageToken = 0;
			this.readSemaphore = new semaphore_1.Semaphore(1);
		}
		set partialMessageTimeout(timeout) {
			this._partialMessageTimeout = timeout;
		}
		get partialMessageTimeout() {
			return this._partialMessageTimeout;
		}
		listen(callback) {
			this.nextMessageLength = -1;
			this.messageToken = 0;
			this.partialMessageTimer = void 0;
			this.callback = callback;
			const result = this.readable.onData((data) => {
				this.onData(data);
			});
			this.readable.onError((error) => this.fireError(error));
			this.readable.onClose(() => this.fireClose());
			return result;
		}
		onData(data) {
			try {
				this.buffer.append(data);
				while (true) {
					if (this.nextMessageLength === -1) {
						const headers = this.buffer.tryReadHeaders(true);
						if (!headers) return;
						const contentLength = headers.get("content-length");
						if (!contentLength) {
							this.fireError(/* @__PURE__ */ new Error(`Header must provide a Content-Length property.\n${JSON.stringify(Object.fromEntries(headers))}`));
							return;
						}
						const length = parseInt(contentLength);
						if (isNaN(length)) {
							this.fireError(/* @__PURE__ */ new Error(`Content-Length value must be a number. Got ${contentLength}`));
							return;
						}
						this.nextMessageLength = length;
					}
					const body = this.buffer.tryReadBody(this.nextMessageLength);
					if (body === void 0) {
						/** We haven't received the full message yet. */
						this.setPartialMessageTimer();
						return;
					}
					this.clearPartialMessageTimer();
					this.nextMessageLength = -1;
					this.readSemaphore.lock(async () => {
						const bytes = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(body) : body;
						const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
						this.callback(message);
					}).catch((error) => {
						this.fireError(error);
					});
				}
			} catch (error) {
				this.fireError(error);
			}
		}
		clearPartialMessageTimer() {
			if (this.partialMessageTimer) {
				this.partialMessageTimer.dispose();
				this.partialMessageTimer = void 0;
			}
		}
		setPartialMessageTimer() {
			this.clearPartialMessageTimer();
			if (this._partialMessageTimeout <= 0) return;
			this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
				this.partialMessageTimer = void 0;
				if (token === this.messageToken) {
					this.firePartialMessage({
						messageToken: token,
						waitingTime: timeout
					});
					this.setPartialMessageTimer();
				}
			}, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
		}
	};
	exports.ReadableStreamMessageReader = ReadableStreamMessageReader;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageWriter.js
var require_messageWriter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = void 0;
	const ral_1 = require_ral();
	const Is = require_is();
	const semaphore_1 = require_semaphore();
	const events_1 = require_events();
	const ContentLength = "Content-Length: ";
	const CRLF = "\r\n";
	var MessageWriter;
	(function(MessageWriter) {
		function is(value) {
			let candidate = value;
			return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
		}
		MessageWriter.is = is;
	})(MessageWriter || (exports.MessageWriter = MessageWriter = {}));
	var AbstractMessageWriter = class {
		constructor() {
			this.errorEmitter = new events_1.Emitter();
			this.closeEmitter = new events_1.Emitter();
		}
		dispose() {
			this.errorEmitter.dispose();
			this.closeEmitter.dispose();
		}
		get onError() {
			return this.errorEmitter.event;
		}
		fireError(error, message, count) {
			this.errorEmitter.fire([
				this.asError(error),
				message,
				count
			]);
		}
		get onClose() {
			return this.closeEmitter.event;
		}
		fireClose() {
			this.closeEmitter.fire(void 0);
		}
		asError(error) {
			if (error instanceof Error) return error;
			else return /* @__PURE__ */ new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
		}
	};
	exports.AbstractMessageWriter = AbstractMessageWriter;
	var ResolvedMessageWriterOptions;
	(function(ResolvedMessageWriterOptions) {
		function fromOptions(options) {
			if (options === void 0 || typeof options === "string") return {
				charset: options ?? "utf-8",
				contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder
			};
			else return {
				charset: options.charset ?? "utf-8",
				contentEncoder: options.contentEncoder,
				contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder
			};
		}
		ResolvedMessageWriterOptions.fromOptions = fromOptions;
	})(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
	var WriteableStreamMessageWriter = class extends AbstractMessageWriter {
		constructor(writable, options) {
			super();
			this.writable = writable;
			this.options = ResolvedMessageWriterOptions.fromOptions(options);
			this.errorCount = 0;
			this.writeSemaphore = new semaphore_1.Semaphore(1);
			this.writable.onError((error) => this.fireError(error));
			this.writable.onClose(() => this.fireClose());
		}
		async write(msg) {
			return this.writeSemaphore.lock(async () => {
				return this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
					if (this.options.contentEncoder !== void 0) return this.options.contentEncoder.encode(buffer);
					else return buffer;
				}).then((buffer) => {
					const headers = [];
					headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
					headers.push(CRLF);
					return this.doWrite(msg, headers, buffer);
				}, (error) => {
					this.fireError(error);
					throw error;
				});
			});
		}
		async doWrite(msg, headers, data) {
			try {
				await this.writable.write(headers.join(""), "ascii");
				return this.writable.write(data);
			} catch (error) {
				this.handleError(error, msg);
				return Promise.reject(error);
			}
		}
		handleError(error, msg) {
			this.errorCount++;
			this.fireError(error, msg, this.errorCount);
		}
		end() {
			this.writable.end();
		}
	};
	exports.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageBuffer.js
var require_messageBuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AbstractMessageBuffer = void 0;
	const CR = 13;
	const LF = 10;
	const CRLF = "\r\n";
	var AbstractMessageBuffer = class {
		constructor(encoding = "utf-8") {
			this._encoding = encoding;
			this._chunks = [];
			this._totalLength = 0;
		}
		get encoding() {
			return this._encoding;
		}
		append(chunk) {
			const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
			this._chunks.push(toAppend);
			this._totalLength += toAppend.byteLength;
		}
		tryReadHeaders(lowerCaseKeys = false) {
			if (this._chunks.length === 0) return;
			let state = 0;
			let chunkIndex = 0;
			let offset = 0;
			let chunkBytesRead = 0;
			row: while (chunkIndex < this._chunks.length) {
				const chunk = this._chunks[chunkIndex];
				offset = 0;
				column: while (offset < chunk.length) {
					switch (chunk[offset]) {
						case CR:
							switch (state) {
								case 0:
									state = 1;
									break;
								case 2:
									state = 3;
									break;
								default: state = 0;
							}
							break;
						case LF:
							switch (state) {
								case 1:
									state = 2;
									break;
								case 3:
									state = 4;
									offset++;
									break row;
								default: state = 0;
							}
							break;
						default: state = 0;
					}
					offset++;
				}
				chunkBytesRead += chunk.byteLength;
				chunkIndex++;
			}
			if (state !== 4) return;
			const buffer = this._read(chunkBytesRead + offset);
			const result = /* @__PURE__ */ new Map();
			const headers = this.toString(buffer, "ascii").split(CRLF);
			if (headers.length < 2) return result;
			for (let i = 0; i < headers.length - 2; i++) {
				const header = headers[i];
				const index = header.indexOf(":");
				if (index === -1) throw new Error(`Message header must separate key and value using ':'\n${header}`);
				const key = header.substr(0, index);
				const value = header.substr(index + 1).trim();
				result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
			}
			return result;
		}
		tryReadBody(length) {
			if (this._totalLength < length) return;
			return this._read(length);
		}
		get numberOfBytes() {
			return this._totalLength;
		}
		_read(byteCount) {
			if (byteCount === 0) return this.emptyBuffer();
			if (byteCount > this._totalLength) throw new Error(`Cannot read so many bytes!`);
			if (this._chunks[0].byteLength === byteCount) {
				const chunk = this._chunks[0];
				this._chunks.shift();
				this._totalLength -= byteCount;
				return this.asNative(chunk);
			}
			if (this._chunks[0].byteLength > byteCount) {
				const chunk = this._chunks[0];
				const result = this.asNative(chunk, byteCount);
				this._chunks[0] = chunk.slice(byteCount);
				this._totalLength -= byteCount;
				return result;
			}
			const result = this.allocNative(byteCount);
			let resultOffset = 0;
			let chunkIndex = 0;
			while (byteCount > 0) {
				const chunk = this._chunks[chunkIndex];
				if (chunk.byteLength > byteCount) {
					const chunkPart = chunk.slice(0, byteCount);
					result.set(chunkPart, resultOffset);
					resultOffset += byteCount;
					this._chunks[chunkIndex] = chunk.slice(byteCount);
					this._totalLength -= byteCount;
					byteCount -= byteCount;
				} else {
					result.set(chunk, resultOffset);
					resultOffset += chunk.byteLength;
					this._chunks.shift();
					this._totalLength -= chunk.byteLength;
					byteCount -= chunk.byteLength;
				}
			}
			return result;
		}
	};
	exports.AbstractMessageBuffer = AbstractMessageBuffer;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/connection.js
var require_connection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createMessageConnection = exports.ConnectionOptions = exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.RequestCancellationReceiverStrategy = exports.IdCancellationReceiverStrategy = exports.ConnectionStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = exports.NullLogger = exports.ProgressType = exports.ProgressToken = void 0;
	const ral_1 = require_ral();
	const Is = require_is();
	const messages_1 = require_messages();
	const linkedMap_1 = require_linkedMap();
	const events_1 = require_events();
	const cancellation_1 = require_cancellation();
	var CancelNotification;
	(function(CancelNotification) {
		CancelNotification.type = new messages_1.NotificationType("$/cancelRequest");
	})(CancelNotification || (CancelNotification = {}));
	var ProgressToken;
	(function(ProgressToken) {
		function is(value) {
			return typeof value === "string" || typeof value === "number";
		}
		ProgressToken.is = is;
	})(ProgressToken || (exports.ProgressToken = ProgressToken = {}));
	var ProgressNotification;
	(function(ProgressNotification) {
		ProgressNotification.type = new messages_1.NotificationType("$/progress");
	})(ProgressNotification || (ProgressNotification = {}));
	var ProgressType = class {
		constructor() {}
	};
	exports.ProgressType = ProgressType;
	var StarRequestHandler;
	(function(StarRequestHandler) {
		function is(value) {
			return Is.func(value);
		}
		StarRequestHandler.is = is;
	})(StarRequestHandler || (StarRequestHandler = {}));
	exports.NullLogger = Object.freeze({
		error: () => {},
		warn: () => {},
		info: () => {},
		log: () => {}
	});
	var Trace;
	(function(Trace) {
		Trace[Trace["Off"] = 0] = "Off";
		Trace[Trace["Messages"] = 1] = "Messages";
		Trace[Trace["Compact"] = 2] = "Compact";
		Trace[Trace["Verbose"] = 3] = "Verbose";
	})(Trace || (exports.Trace = Trace = {}));
	var TraceValues;
	(function(TraceValues) {
		/**
		* Turn tracing off.
		*/
		TraceValues.Off = "off";
		/**
		* Trace messages only.
		*/
		TraceValues.Messages = "messages";
		/**
		* Compact message tracing.
		*/
		TraceValues.Compact = "compact";
		/**
		* Verbose message tracing.
		*/
		TraceValues.Verbose = "verbose";
	})(TraceValues || (exports.TraceValues = TraceValues = {}));
	(function(Trace) {
		function fromString(value) {
			if (!Is.string(value)) return Trace.Off;
			value = value.toLowerCase();
			switch (value) {
				case "off": return Trace.Off;
				case "messages": return Trace.Messages;
				case "compact": return Trace.Compact;
				case "verbose": return Trace.Verbose;
				default: return Trace.Off;
			}
		}
		Trace.fromString = fromString;
		function toString(value) {
			switch (value) {
				case Trace.Off: return "off";
				case Trace.Messages: return "messages";
				case Trace.Compact: return "compact";
				case Trace.Verbose: return "verbose";
				default: return "off";
			}
		}
		Trace.toString = toString;
	})(Trace || (exports.Trace = Trace = {}));
	var TraceFormat;
	(function(TraceFormat) {
		TraceFormat["Text"] = "text";
		TraceFormat["JSON"] = "json";
	})(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
	(function(TraceFormat) {
		function fromString(value) {
			if (!Is.string(value)) return TraceFormat.Text;
			value = value.toLowerCase();
			if (value === "json") return TraceFormat.JSON;
			else return TraceFormat.Text;
		}
		TraceFormat.fromString = fromString;
	})(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
	var SetTraceNotification;
	(function(SetTraceNotification) {
		SetTraceNotification.type = new messages_1.NotificationType("$/setTrace");
	})(SetTraceNotification || (exports.SetTraceNotification = SetTraceNotification = {}));
	var LogTraceNotification;
	(function(LogTraceNotification) {
		LogTraceNotification.type = new messages_1.NotificationType("$/logTrace");
	})(LogTraceNotification || (exports.LogTraceNotification = LogTraceNotification = {}));
	var ConnectionErrors;
	(function(ConnectionErrors) {
		/**
		* The connection is closed.
		*/
		ConnectionErrors[ConnectionErrors["Closed"] = 1] = "Closed";
		/**
		* The connection got disposed.
		*/
		ConnectionErrors[ConnectionErrors["Disposed"] = 2] = "Disposed";
		/**
		* The connection is already in listening mode.
		*/
		ConnectionErrors[ConnectionErrors["AlreadyListening"] = 3] = "AlreadyListening";
	})(ConnectionErrors || (exports.ConnectionErrors = ConnectionErrors = {}));
	var ConnectionError = class ConnectionError extends Error {
		constructor(code, message) {
			super(message);
			this.code = code;
			Object.setPrototypeOf(this, ConnectionError.prototype);
		}
	};
	exports.ConnectionError = ConnectionError;
	var ConnectionStrategy;
	(function(ConnectionStrategy) {
		function is(value) {
			const candidate = value;
			return candidate && Is.func(candidate.cancelUndispatched);
		}
		ConnectionStrategy.is = is;
	})(ConnectionStrategy || (exports.ConnectionStrategy = ConnectionStrategy = {}));
	var IdCancellationReceiverStrategy;
	(function(IdCancellationReceiverStrategy) {
		function is(value) {
			const candidate = value;
			return candidate && (candidate.kind === void 0 || candidate.kind === "id") && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
		}
		IdCancellationReceiverStrategy.is = is;
	})(IdCancellationReceiverStrategy || (exports.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
	var RequestCancellationReceiverStrategy;
	(function(RequestCancellationReceiverStrategy) {
		function is(value) {
			const candidate = value;
			return candidate && candidate.kind === "request" && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
		}
		RequestCancellationReceiverStrategy.is = is;
	})(RequestCancellationReceiverStrategy || (exports.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
	var CancellationReceiverStrategy;
	(function(CancellationReceiverStrategy) {
		CancellationReceiverStrategy.Message = Object.freeze({ createCancellationTokenSource(_) {
			return new cancellation_1.CancellationTokenSource();
		} });
		function is(value) {
			return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
		}
		CancellationReceiverStrategy.is = is;
	})(CancellationReceiverStrategy || (exports.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
	var CancellationSenderStrategy;
	(function(CancellationSenderStrategy) {
		CancellationSenderStrategy.Message = Object.freeze({
			sendCancellation(conn, id) {
				return conn.sendNotification(CancelNotification.type, { id });
			},
			cleanup(_) {}
		});
		function is(value) {
			const candidate = value;
			return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
		}
		CancellationSenderStrategy.is = is;
	})(CancellationSenderStrategy || (exports.CancellationSenderStrategy = CancellationSenderStrategy = {}));
	var CancellationStrategy;
	(function(CancellationStrategy) {
		CancellationStrategy.Message = Object.freeze({
			receiver: CancellationReceiverStrategy.Message,
			sender: CancellationSenderStrategy.Message
		});
		function is(value) {
			const candidate = value;
			return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
		}
		CancellationStrategy.is = is;
	})(CancellationStrategy || (exports.CancellationStrategy = CancellationStrategy = {}));
	var MessageStrategy;
	(function(MessageStrategy) {
		function is(value) {
			const candidate = value;
			return candidate && Is.func(candidate.handleMessage);
		}
		MessageStrategy.is = is;
	})(MessageStrategy || (exports.MessageStrategy = MessageStrategy = {}));
	var ConnectionOptions;
	(function(ConnectionOptions) {
		function is(value) {
			const candidate = value;
			return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
		}
		ConnectionOptions.is = is;
	})(ConnectionOptions || (exports.ConnectionOptions = ConnectionOptions = {}));
	var ConnectionState;
	(function(ConnectionState) {
		ConnectionState[ConnectionState["New"] = 1] = "New";
		ConnectionState[ConnectionState["Listening"] = 2] = "Listening";
		ConnectionState[ConnectionState["Closed"] = 3] = "Closed";
		ConnectionState[ConnectionState["Disposed"] = 4] = "Disposed";
	})(ConnectionState || (ConnectionState = {}));
	function createMessageConnection(messageReader, messageWriter, _logger, options) {
		const logger = _logger !== void 0 ? _logger : exports.NullLogger;
		let sequenceNumber = 0;
		let notificationSequenceNumber = 0;
		let unknownResponseSequenceNumber = 0;
		const version = "2.0";
		let starRequestHandler = void 0;
		const requestHandlers = /* @__PURE__ */ new Map();
		let starNotificationHandler = void 0;
		const notificationHandlers = /* @__PURE__ */ new Map();
		const progressHandlers = /* @__PURE__ */ new Map();
		let timer;
		let messageQueue = new linkedMap_1.LinkedMap();
		let responsePromises = /* @__PURE__ */ new Map();
		let knownCanceledRequests = /* @__PURE__ */ new Set();
		let requestTokens = /* @__PURE__ */ new Map();
		let trace = Trace.Off;
		let traceFormat = TraceFormat.Text;
		let tracer;
		let state = ConnectionState.New;
		const errorEmitter = new events_1.Emitter();
		const closeEmitter = new events_1.Emitter();
		const unhandledNotificationEmitter = new events_1.Emitter();
		const unhandledProgressEmitter = new events_1.Emitter();
		const disposeEmitter = new events_1.Emitter();
		const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
		function createRequestQueueKey(id) {
			if (id === null) throw new Error(`Can't send requests with id null since the response can't be correlated.`);
			return "req-" + id.toString();
		}
		function createResponseQueueKey(id) {
			if (id === null) return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
			else return "res-" + id.toString();
		}
		function createNotificationQueueKey() {
			return "not-" + (++notificationSequenceNumber).toString();
		}
		function addMessageToQueue(queue, message) {
			if (messages_1.Message.isRequest(message)) queue.set(createRequestQueueKey(message.id), message);
			else if (messages_1.Message.isResponse(message)) queue.set(createResponseQueueKey(message.id), message);
			else queue.set(createNotificationQueueKey(), message);
		}
		function cancelUndispatched(_message) {}
		function isListening() {
			return state === ConnectionState.Listening;
		}
		function isClosed() {
			return state === ConnectionState.Closed;
		}
		function isDisposed() {
			return state === ConnectionState.Disposed;
		}
		function closeHandler() {
			if (state === ConnectionState.New || state === ConnectionState.Listening) {
				state = ConnectionState.Closed;
				closeEmitter.fire(void 0);
			}
		}
		function readErrorHandler(error) {
			errorEmitter.fire([
				error,
				void 0,
				void 0
			]);
		}
		function writeErrorHandler(data) {
			errorEmitter.fire(data);
		}
		messageReader.onClose(closeHandler);
		messageReader.onError(readErrorHandler);
		messageWriter.onClose(closeHandler);
		messageWriter.onError(writeErrorHandler);
		function triggerMessageQueue() {
			if (timer || messageQueue.size === 0) return;
			timer = (0, ral_1.default)().timer.setImmediate(() => {
				timer = void 0;
				processMessageQueue();
			});
		}
		function handleMessage(message) {
			if (messages_1.Message.isRequest(message)) handleRequest(message);
			else if (messages_1.Message.isNotification(message)) handleNotification(message);
			else if (messages_1.Message.isResponse(message)) handleResponse(message);
			else handleInvalidMessage(message);
		}
		function processMessageQueue() {
			if (messageQueue.size === 0) return;
			const message = messageQueue.shift();
			try {
				const messageStrategy = options?.messageStrategy;
				if (MessageStrategy.is(messageStrategy)) messageStrategy.handleMessage(message, handleMessage);
				else handleMessage(message);
			} finally {
				triggerMessageQueue();
			}
		}
		const callback = (message) => {
			try {
				if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
					const cancelId = message.params.id;
					const key = createRequestQueueKey(cancelId);
					const toCancel = messageQueue.get(key);
					if (messages_1.Message.isRequest(toCancel)) {
						const strategy = options?.connectionStrategy;
						const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
						if (response && (response.error !== void 0 || response.result !== void 0)) {
							messageQueue.delete(key);
							requestTokens.delete(cancelId);
							response.id = toCancel.id;
							traceSendingResponse(response, message.method, Date.now());
							messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
							return;
						}
					}
					const cancellationToken = requestTokens.get(cancelId);
					if (cancellationToken !== void 0) {
						cancellationToken.cancel();
						traceReceivedNotification(message);
						return;
					} else knownCanceledRequests.add(cancelId);
				}
				addMessageToQueue(messageQueue, message);
			} finally {
				triggerMessageQueue();
			}
		};
		function handleRequest(requestMessage) {
			if (isDisposed()) return;
			function reply(resultOrError, method, startTime) {
				const message = {
					jsonrpc: version,
					id: requestMessage.id
				};
				if (resultOrError instanceof messages_1.ResponseError) message.error = resultOrError.toJson();
				else message.result = resultOrError === void 0 ? null : resultOrError;
				traceSendingResponse(message, method, startTime);
				messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
			}
			function replyError(error, method, startTime) {
				const message = {
					jsonrpc: version,
					id: requestMessage.id,
					error: error.toJson()
				};
				traceSendingResponse(message, method, startTime);
				messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
			}
			function replySuccess(result, method, startTime) {
				if (result === void 0) result = null;
				const message = {
					jsonrpc: version,
					id: requestMessage.id,
					result
				};
				traceSendingResponse(message, method, startTime);
				messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
			}
			traceReceivedRequest(requestMessage);
			const element = requestHandlers.get(requestMessage.method);
			let type;
			let requestHandler;
			if (element) {
				type = element.type;
				requestHandler = element.handler;
			}
			const startTime = Date.now();
			if (requestHandler || starRequestHandler) {
				const tokenKey = requestMessage.id ?? String(Date.now());
				const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
				if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) cancellationSource.cancel();
				if (requestMessage.id !== null) requestTokens.set(tokenKey, cancellationSource);
				try {
					let handlerResult;
					if (requestHandler) if (requestMessage.params === void 0) {
						if (type !== void 0 && type.numberOfParams !== 0) {
							replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
							return;
						}
						handlerResult = requestHandler(cancellationSource.token);
					} else if (Array.isArray(requestMessage.params)) {
						if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
							replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
							return;
						}
						handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
					} else {
						if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
							replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
							return;
						}
						handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
					}
					else if (starRequestHandler) handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
					const promise = handlerResult;
					if (!handlerResult) {
						requestTokens.delete(tokenKey);
						replySuccess(handlerResult, requestMessage.method, startTime);
					} else if (promise.then) promise.then((resultOrError) => {
						requestTokens.delete(tokenKey);
						reply(resultOrError, requestMessage.method, startTime);
					}, (error) => {
						requestTokens.delete(tokenKey);
						if (error instanceof messages_1.ResponseError) replyError(error, requestMessage.method, startTime);
						else if (error && Is.string(error.message)) replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
						else replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
					});
					else {
						requestTokens.delete(tokenKey);
						reply(handlerResult, requestMessage.method, startTime);
					}
				} catch (error) {
					requestTokens.delete(tokenKey);
					if (error instanceof messages_1.ResponseError) reply(error, requestMessage.method, startTime);
					else if (error && Is.string(error.message)) replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
					else replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
				}
			} else replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
		}
		function handleResponse(responseMessage) {
			if (isDisposed()) return;
			if (responseMessage.id === null) if (responseMessage.error) logger.error(`Received response message without id: Error is: \n${JSON.stringify(responseMessage.error, void 0, 4)}`);
			else logger.error(`Received response message without id. No further error information provided.`);
			else {
				const key = responseMessage.id;
				const responsePromise = responsePromises.get(key);
				traceReceivedResponse(responseMessage, responsePromise);
				if (responsePromise !== void 0) {
					responsePromises.delete(key);
					try {
						if (responseMessage.error) {
							const error = responseMessage.error;
							responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
						} else if (responseMessage.result !== void 0) responsePromise.resolve(responseMessage.result);
						else throw new Error("Should never happen.");
					} catch (error) {
						if (error.message) logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
						else logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
					}
				}
			}
		}
		function handleNotification(message) {
			if (isDisposed()) return;
			let type = void 0;
			let notificationHandler;
			if (message.method === CancelNotification.type.method) {
				const cancelId = message.params.id;
				knownCanceledRequests.delete(cancelId);
				traceReceivedNotification(message);
				return;
			} else {
				const element = notificationHandlers.get(message.method);
				if (element) {
					notificationHandler = element.handler;
					type = element.type;
				}
			}
			if (notificationHandler || starNotificationHandler) try {
				traceReceivedNotification(message);
				if (notificationHandler) if (message.params === void 0) {
					if (type !== void 0) {
						if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
					}
					notificationHandler();
				} else if (Array.isArray(message.params)) {
					const params = message.params;
					if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) notificationHandler({
						token: params[0],
						value: params[1]
					});
					else {
						if (type !== void 0) {
							if (type.parameterStructures === messages_1.ParameterStructures.byName) logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
							if (type.numberOfParams !== message.params.length) logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
						}
						notificationHandler(...params);
					}
				} else {
					if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
					notificationHandler(message.params);
				}
				else if (starNotificationHandler) starNotificationHandler(message.method, message.params);
			} catch (error) {
				if (error.message) logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
				else logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
			}
			else unhandledNotificationEmitter.fire(message);
		}
		function handleInvalidMessage(message) {
			if (!message) {
				logger.error("Received empty message.");
				return;
			}
			logger.error(`Received message which is neither a response nor a notification message:\n${JSON.stringify(message, null, 4)}`);
			const responseMessage = message;
			if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
				const key = responseMessage.id;
				const responseHandler = responsePromises.get(key);
				if (responseHandler) responseHandler.reject(/* @__PURE__ */ new Error("The received response has neither a result nor an error property."));
			}
		}
		function stringifyTrace(params) {
			if (params === void 0 || params === null) return;
			switch (trace) {
				case Trace.Verbose: return JSON.stringify(params, null, 4);
				case Trace.Compact: return JSON.stringify(params);
				default: return;
			}
		}
		function traceSendingRequest(message) {
			if (trace === Trace.Off || !tracer) return;
			if (traceFormat === TraceFormat.Text) {
				let data = void 0;
				if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) data = `Params: ${stringifyTrace(message.params)}\n\n`;
				tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
			} else logLSPMessage("send-request", message);
		}
		function traceSendingNotification(message) {
			if (trace === Trace.Off || !tracer) return;
			if (traceFormat === TraceFormat.Text) {
				let data = void 0;
				if (trace === Trace.Verbose || trace === Trace.Compact) if (message.params) data = `Params: ${stringifyTrace(message.params)}\n\n`;
				else data = "No parameters provided.\n\n";
				tracer.log(`Sending notification '${message.method}'.`, data);
			} else logLSPMessage("send-notification", message);
		}
		function traceSendingResponse(message, method, startTime) {
			if (trace === Trace.Off || !tracer) return;
			if (traceFormat === TraceFormat.Text) {
				let data = void 0;
				if (trace === Trace.Verbose || trace === Trace.Compact) {
					if (message.error && message.error.data) data = `Error data: ${stringifyTrace(message.error.data)}\n\n`;
					else if (message.result) data = `Result: ${stringifyTrace(message.result)}\n\n`;
					else if (message.error === void 0) data = "No result returned.\n\n";
				}
				tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
			} else logLSPMessage("send-response", message);
		}
		function traceReceivedRequest(message) {
			if (trace === Trace.Off || !tracer) return;
			if (traceFormat === TraceFormat.Text) {
				let data = void 0;
				if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) data = `Params: ${stringifyTrace(message.params)}\n\n`;
				tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
			} else logLSPMessage("receive-request", message);
		}
		function traceReceivedNotification(message) {
			if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) return;
			if (traceFormat === TraceFormat.Text) {
				let data = void 0;
				if (trace === Trace.Verbose || trace === Trace.Compact) if (message.params) data = `Params: ${stringifyTrace(message.params)}\n\n`;
				else data = "No parameters provided.\n\n";
				tracer.log(`Received notification '${message.method}'.`, data);
			} else logLSPMessage("receive-notification", message);
		}
		function traceReceivedResponse(message, responsePromise) {
			if (trace === Trace.Off || !tracer) return;
			if (traceFormat === TraceFormat.Text) {
				let data = void 0;
				if (trace === Trace.Verbose || trace === Trace.Compact) {
					if (message.error && message.error.data) data = `Error data: ${stringifyTrace(message.error.data)}\n\n`;
					else if (message.result) data = `Result: ${stringifyTrace(message.result)}\n\n`;
					else if (message.error === void 0) data = "No result returned.\n\n";
				}
				if (responsePromise) {
					const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
					tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
				} else tracer.log(`Received response ${message.id} without active response promise.`, data);
			} else logLSPMessage("receive-response", message);
		}
		function logLSPMessage(type, message) {
			if (!tracer || trace === Trace.Off) return;
			const lspMessage = {
				isLSPMessage: true,
				type,
				message,
				timestamp: Date.now()
			};
			tracer.log(lspMessage);
		}
		function throwIfClosedOrDisposed() {
			if (isClosed()) throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
			if (isDisposed()) throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
		}
		function throwIfListening() {
			if (isListening()) throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
		}
		function throwIfNotListening() {
			if (!isListening()) throw new Error("Call listen() first.");
		}
		function undefinedToNull(param) {
			if (param === void 0) return null;
			else return param;
		}
		function nullToUndefined(param) {
			if (param === null) return;
			else return param;
		}
		function isNamedParam(param) {
			return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
		}
		function computeSingleParam(parameterStructures, param) {
			switch (parameterStructures) {
				case messages_1.ParameterStructures.auto: if (isNamedParam(param)) return nullToUndefined(param);
				else return [undefinedToNull(param)];
				case messages_1.ParameterStructures.byName:
					if (!isNamedParam(param)) throw new Error(`Received parameters by name but param is not an object literal.`);
					return nullToUndefined(param);
				case messages_1.ParameterStructures.byPosition: return [undefinedToNull(param)];
				default: throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
			}
		}
		function computeMessageParams(type, params) {
			let result;
			const numberOfParams = type.numberOfParams;
			switch (numberOfParams) {
				case 0:
					result = void 0;
					break;
				case 1:
					result = computeSingleParam(type.parameterStructures, params[0]);
					break;
				default:
					result = [];
					for (let i = 0; i < params.length && i < numberOfParams; i++) result.push(undefinedToNull(params[i]));
					if (params.length < numberOfParams) for (let i = params.length; i < numberOfParams; i++) result.push(null);
					break;
			}
			return result;
		}
		const connection = {
			sendNotification: (type, ...args) => {
				throwIfClosedOrDisposed();
				let method;
				let messageParams;
				if (Is.string(type)) {
					method = type;
					const first = args[0];
					let paramStart = 0;
					let parameterStructures = messages_1.ParameterStructures.auto;
					if (messages_1.ParameterStructures.is(first)) {
						paramStart = 1;
						parameterStructures = first;
					}
					let paramEnd = args.length;
					const numberOfParams = paramEnd - paramStart;
					switch (numberOfParams) {
						case 0:
							messageParams = void 0;
							break;
						case 1:
							messageParams = computeSingleParam(parameterStructures, args[paramStart]);
							break;
						default:
							if (parameterStructures === messages_1.ParameterStructures.byName) throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
							messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
							break;
					}
				} else {
					const params = args;
					method = type.method;
					messageParams = computeMessageParams(type, params);
				}
				const notificationMessage = {
					jsonrpc: version,
					method,
					params: messageParams
				};
				traceSendingNotification(notificationMessage);
				return messageWriter.write(notificationMessage).catch((error) => {
					logger.error(`Sending notification failed.`);
					throw error;
				});
			},
			onNotification: (type, handler) => {
				throwIfClosedOrDisposed();
				let method;
				if (Is.func(type)) starNotificationHandler = type;
				else if (handler) if (Is.string(type)) {
					method = type;
					notificationHandlers.set(type, {
						type: void 0,
						handler
					});
				} else {
					method = type.method;
					notificationHandlers.set(type.method, {
						type,
						handler
					});
				}
				return { dispose: () => {
					if (method !== void 0) notificationHandlers.delete(method);
					else starNotificationHandler = void 0;
				} };
			},
			onProgress: (_type, token, handler) => {
				if (progressHandlers.has(token)) throw new Error(`Progress handler for token ${token} already registered`);
				progressHandlers.set(token, handler);
				return { dispose: () => {
					progressHandlers.delete(token);
				} };
			},
			sendProgress: (_type, token, value) => {
				return connection.sendNotification(ProgressNotification.type, {
					token,
					value
				});
			},
			onUnhandledProgress: unhandledProgressEmitter.event,
			sendRequest: (type, ...args) => {
				throwIfClosedOrDisposed();
				throwIfNotListening();
				let method;
				let messageParams;
				let token = void 0;
				if (Is.string(type)) {
					method = type;
					const first = args[0];
					const last = args[args.length - 1];
					let paramStart = 0;
					let parameterStructures = messages_1.ParameterStructures.auto;
					if (messages_1.ParameterStructures.is(first)) {
						paramStart = 1;
						parameterStructures = first;
					}
					let paramEnd = args.length;
					if (cancellation_1.CancellationToken.is(last)) {
						paramEnd = paramEnd - 1;
						token = last;
					}
					const numberOfParams = paramEnd - paramStart;
					switch (numberOfParams) {
						case 0:
							messageParams = void 0;
							break;
						case 1:
							messageParams = computeSingleParam(parameterStructures, args[paramStart]);
							break;
						default:
							if (parameterStructures === messages_1.ParameterStructures.byName) throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
							messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
							break;
					}
				} else {
					const params = args;
					method = type.method;
					messageParams = computeMessageParams(type, params);
					const numberOfParams = type.numberOfParams;
					token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
				}
				const id = sequenceNumber++;
				let disposable;
				if (token) disposable = token.onCancellationRequested(() => {
					const p = cancellationStrategy.sender.sendCancellation(connection, id);
					if (p === void 0) {
						logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
						return Promise.resolve();
					} else return p.catch(() => {
						logger.log(`Sending cancellation messages for id ${id} failed`);
					});
				});
				const requestMessage = {
					jsonrpc: version,
					id,
					method,
					params: messageParams
				};
				traceSendingRequest(requestMessage);
				if (typeof cancellationStrategy.sender.enableCancellation === "function") cancellationStrategy.sender.enableCancellation(requestMessage);
				return new Promise(async (resolve, reject) => {
					const resolveWithCleanup = (r) => {
						resolve(r);
						cancellationStrategy.sender.cleanup(id);
						disposable?.dispose();
					};
					const rejectWithCleanup = (r) => {
						reject(r);
						cancellationStrategy.sender.cleanup(id);
						disposable?.dispose();
					};
					const responsePromise = {
						method,
						timerStart: Date.now(),
						resolve: resolveWithCleanup,
						reject: rejectWithCleanup
					};
					try {
						responsePromises.set(id, responsePromise);
						await messageWriter.write(requestMessage);
					} catch (error) {
						responsePromises.delete(id);
						responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : "Unknown reason"));
						logger.error(`Sending request failed.`);
						throw error;
					}
				});
			},
			onRequest: (type, handler) => {
				throwIfClosedOrDisposed();
				let method = null;
				if (StarRequestHandler.is(type)) {
					method = void 0;
					starRequestHandler = type;
				} else if (Is.string(type)) {
					method = null;
					if (handler !== void 0) {
						method = type;
						requestHandlers.set(type, {
							handler,
							type: void 0
						});
					}
				} else if (handler !== void 0) {
					method = type.method;
					requestHandlers.set(type.method, {
						type,
						handler
					});
				}
				return { dispose: () => {
					if (method === null) return;
					if (method !== void 0) requestHandlers.delete(method);
					else starRequestHandler = void 0;
				} };
			},
			hasPendingResponse: () => {
				return responsePromises.size > 0;
			},
			trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
				let _sendNotification = false;
				let _traceFormat = TraceFormat.Text;
				if (sendNotificationOrTraceOptions !== void 0) if (Is.boolean(sendNotificationOrTraceOptions)) _sendNotification = sendNotificationOrTraceOptions;
				else {
					_sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
					_traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
				}
				trace = _value;
				traceFormat = _traceFormat;
				if (trace === Trace.Off) tracer = void 0;
				else tracer = _tracer;
				if (_sendNotification && !isClosed() && !isDisposed()) await connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
			},
			onError: errorEmitter.event,
			onClose: closeEmitter.event,
			onUnhandledNotification: unhandledNotificationEmitter.event,
			onDispose: disposeEmitter.event,
			end: () => {
				messageWriter.end();
			},
			dispose: () => {
				if (isDisposed()) return;
				state = ConnectionState.Disposed;
				disposeEmitter.fire(void 0);
				const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
				for (const promise of responsePromises.values()) promise.reject(error);
				responsePromises = /* @__PURE__ */ new Map();
				requestTokens = /* @__PURE__ */ new Map();
				knownCanceledRequests = /* @__PURE__ */ new Set();
				messageQueue = new linkedMap_1.LinkedMap();
				if (Is.func(messageWriter.dispose)) messageWriter.dispose();
				if (Is.func(messageReader.dispose)) messageReader.dispose();
			},
			listen: () => {
				throwIfClosedOrDisposed();
				throwIfListening();
				state = ConnectionState.Listening;
				messageReader.listen(callback);
			},
			inspect: () => {
				(0, ral_1.default)().console.log("inspect");
			}
		};
		connection.onNotification(LogTraceNotification.type, (params) => {
			if (trace === Trace.Off || !tracer) return;
			const verbose = trace === Trace.Verbose || trace === Trace.Compact;
			tracer.log(params.message, verbose ? params.verbose : void 0);
		});
		connection.onNotification(ProgressNotification.type, (params) => {
			const handler = progressHandlers.get(params.token);
			if (handler) handler(params.value);
			else unhandledProgressEmitter.fire(params);
		});
		return connection;
	}
	exports.createMessageConnection = createMessageConnection;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/api.js
var require_api = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ProgressType = exports.ProgressToken = exports.createMessageConnection = exports.NullLogger = exports.ConnectionOptions = exports.ConnectionStrategy = exports.AbstractMessageBuffer = exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = exports.CancellationToken = exports.CancellationTokenSource = exports.Emitter = exports.Event = exports.Disposable = exports.LRUCache = exports.Touch = exports.LinkedMap = exports.ParameterStructures = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.ErrorCodes = exports.ResponseError = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType0 = exports.RequestType = exports.Message = exports.RAL = void 0;
	exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = void 0;
	const messages_1 = require_messages();
	Object.defineProperty(exports, "Message", {
		enumerable: true,
		get: function() {
			return messages_1.Message;
		}
	});
	Object.defineProperty(exports, "RequestType", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType;
		}
	});
	Object.defineProperty(exports, "RequestType0", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType0;
		}
	});
	Object.defineProperty(exports, "RequestType1", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType1;
		}
	});
	Object.defineProperty(exports, "RequestType2", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType2;
		}
	});
	Object.defineProperty(exports, "RequestType3", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType3;
		}
	});
	Object.defineProperty(exports, "RequestType4", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType4;
		}
	});
	Object.defineProperty(exports, "RequestType5", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType5;
		}
	});
	Object.defineProperty(exports, "RequestType6", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType6;
		}
	});
	Object.defineProperty(exports, "RequestType7", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType7;
		}
	});
	Object.defineProperty(exports, "RequestType8", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType8;
		}
	});
	Object.defineProperty(exports, "RequestType9", {
		enumerable: true,
		get: function() {
			return messages_1.RequestType9;
		}
	});
	Object.defineProperty(exports, "ResponseError", {
		enumerable: true,
		get: function() {
			return messages_1.ResponseError;
		}
	});
	Object.defineProperty(exports, "ErrorCodes", {
		enumerable: true,
		get: function() {
			return messages_1.ErrorCodes;
		}
	});
	Object.defineProperty(exports, "NotificationType", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType;
		}
	});
	Object.defineProperty(exports, "NotificationType0", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType0;
		}
	});
	Object.defineProperty(exports, "NotificationType1", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType1;
		}
	});
	Object.defineProperty(exports, "NotificationType2", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType2;
		}
	});
	Object.defineProperty(exports, "NotificationType3", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType3;
		}
	});
	Object.defineProperty(exports, "NotificationType4", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType4;
		}
	});
	Object.defineProperty(exports, "NotificationType5", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType5;
		}
	});
	Object.defineProperty(exports, "NotificationType6", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType6;
		}
	});
	Object.defineProperty(exports, "NotificationType7", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType7;
		}
	});
	Object.defineProperty(exports, "NotificationType8", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType8;
		}
	});
	Object.defineProperty(exports, "NotificationType9", {
		enumerable: true,
		get: function() {
			return messages_1.NotificationType9;
		}
	});
	Object.defineProperty(exports, "ParameterStructures", {
		enumerable: true,
		get: function() {
			return messages_1.ParameterStructures;
		}
	});
	const linkedMap_1 = require_linkedMap();
	Object.defineProperty(exports, "LinkedMap", {
		enumerable: true,
		get: function() {
			return linkedMap_1.LinkedMap;
		}
	});
	Object.defineProperty(exports, "LRUCache", {
		enumerable: true,
		get: function() {
			return linkedMap_1.LRUCache;
		}
	});
	Object.defineProperty(exports, "Touch", {
		enumerable: true,
		get: function() {
			return linkedMap_1.Touch;
		}
	});
	const disposable_1 = require_disposable();
	Object.defineProperty(exports, "Disposable", {
		enumerable: true,
		get: function() {
			return disposable_1.Disposable;
		}
	});
	const events_1 = require_events();
	Object.defineProperty(exports, "Event", {
		enumerable: true,
		get: function() {
			return events_1.Event;
		}
	});
	Object.defineProperty(exports, "Emitter", {
		enumerable: true,
		get: function() {
			return events_1.Emitter;
		}
	});
	const cancellation_1 = require_cancellation();
	Object.defineProperty(exports, "CancellationTokenSource", {
		enumerable: true,
		get: function() {
			return cancellation_1.CancellationTokenSource;
		}
	});
	Object.defineProperty(exports, "CancellationToken", {
		enumerable: true,
		get: function() {
			return cancellation_1.CancellationToken;
		}
	});
	const sharedArrayCancellation_1 = require_sharedArrayCancellation();
	Object.defineProperty(exports, "SharedArraySenderStrategy", {
		enumerable: true,
		get: function() {
			return sharedArrayCancellation_1.SharedArraySenderStrategy;
		}
	});
	Object.defineProperty(exports, "SharedArrayReceiverStrategy", {
		enumerable: true,
		get: function() {
			return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
		}
	});
	const messageReader_1 = require_messageReader();
	Object.defineProperty(exports, "MessageReader", {
		enumerable: true,
		get: function() {
			return messageReader_1.MessageReader;
		}
	});
	Object.defineProperty(exports, "AbstractMessageReader", {
		enumerable: true,
		get: function() {
			return messageReader_1.AbstractMessageReader;
		}
	});
	Object.defineProperty(exports, "ReadableStreamMessageReader", {
		enumerable: true,
		get: function() {
			return messageReader_1.ReadableStreamMessageReader;
		}
	});
	const messageWriter_1 = require_messageWriter();
	Object.defineProperty(exports, "MessageWriter", {
		enumerable: true,
		get: function() {
			return messageWriter_1.MessageWriter;
		}
	});
	Object.defineProperty(exports, "AbstractMessageWriter", {
		enumerable: true,
		get: function() {
			return messageWriter_1.AbstractMessageWriter;
		}
	});
	Object.defineProperty(exports, "WriteableStreamMessageWriter", {
		enumerable: true,
		get: function() {
			return messageWriter_1.WriteableStreamMessageWriter;
		}
	});
	const messageBuffer_1 = require_messageBuffer();
	Object.defineProperty(exports, "AbstractMessageBuffer", {
		enumerable: true,
		get: function() {
			return messageBuffer_1.AbstractMessageBuffer;
		}
	});
	const connection_1 = require_connection();
	Object.defineProperty(exports, "ConnectionStrategy", {
		enumerable: true,
		get: function() {
			return connection_1.ConnectionStrategy;
		}
	});
	Object.defineProperty(exports, "ConnectionOptions", {
		enumerable: true,
		get: function() {
			return connection_1.ConnectionOptions;
		}
	});
	Object.defineProperty(exports, "NullLogger", {
		enumerable: true,
		get: function() {
			return connection_1.NullLogger;
		}
	});
	Object.defineProperty(exports, "createMessageConnection", {
		enumerable: true,
		get: function() {
			return connection_1.createMessageConnection;
		}
	});
	Object.defineProperty(exports, "ProgressToken", {
		enumerable: true,
		get: function() {
			return connection_1.ProgressToken;
		}
	});
	Object.defineProperty(exports, "ProgressType", {
		enumerable: true,
		get: function() {
			return connection_1.ProgressType;
		}
	});
	Object.defineProperty(exports, "Trace", {
		enumerable: true,
		get: function() {
			return connection_1.Trace;
		}
	});
	Object.defineProperty(exports, "TraceValues", {
		enumerable: true,
		get: function() {
			return connection_1.TraceValues;
		}
	});
	Object.defineProperty(exports, "TraceFormat", {
		enumerable: true,
		get: function() {
			return connection_1.TraceFormat;
		}
	});
	Object.defineProperty(exports, "SetTraceNotification", {
		enumerable: true,
		get: function() {
			return connection_1.SetTraceNotification;
		}
	});
	Object.defineProperty(exports, "LogTraceNotification", {
		enumerable: true,
		get: function() {
			return connection_1.LogTraceNotification;
		}
	});
	Object.defineProperty(exports, "ConnectionErrors", {
		enumerable: true,
		get: function() {
			return connection_1.ConnectionErrors;
		}
	});
	Object.defineProperty(exports, "ConnectionError", {
		enumerable: true,
		get: function() {
			return connection_1.ConnectionError;
		}
	});
	Object.defineProperty(exports, "CancellationReceiverStrategy", {
		enumerable: true,
		get: function() {
			return connection_1.CancellationReceiverStrategy;
		}
	});
	Object.defineProperty(exports, "CancellationSenderStrategy", {
		enumerable: true,
		get: function() {
			return connection_1.CancellationSenderStrategy;
		}
	});
	Object.defineProperty(exports, "CancellationStrategy", {
		enumerable: true,
		get: function() {
			return connection_1.CancellationStrategy;
		}
	});
	Object.defineProperty(exports, "MessageStrategy", {
		enumerable: true,
		get: function() {
			return connection_1.MessageStrategy;
		}
	});
	const ral_1 = require_ral();
	exports.RAL = ral_1.default;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/node/ril.js
var require_ril = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util_1 = __require("util");
	const api_1 = require_api();
	var MessageBuffer = class MessageBuffer extends api_1.AbstractMessageBuffer {
		constructor(encoding = "utf-8") {
			super(encoding);
		}
		emptyBuffer() {
			return MessageBuffer.emptyBuffer;
		}
		fromString(value, encoding) {
			return Buffer.from(value, encoding);
		}
		toString(value, encoding) {
			if (value instanceof Buffer) return value.toString(encoding);
			else return new util_1.TextDecoder(encoding).decode(value);
		}
		asNative(buffer, length) {
			if (length === void 0) return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
			else return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
		}
		allocNative(length) {
			return Buffer.allocUnsafe(length);
		}
	};
	MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);
	var ReadableStreamWrapper = class {
		constructor(stream) {
			this.stream = stream;
		}
		onClose(listener) {
			this.stream.on("close", listener);
			return api_1.Disposable.create(() => this.stream.off("close", listener));
		}
		onError(listener) {
			this.stream.on("error", listener);
			return api_1.Disposable.create(() => this.stream.off("error", listener));
		}
		onEnd(listener) {
			this.stream.on("end", listener);
			return api_1.Disposable.create(() => this.stream.off("end", listener));
		}
		onData(listener) {
			this.stream.on("data", listener);
			return api_1.Disposable.create(() => this.stream.off("data", listener));
		}
	};
	var WritableStreamWrapper = class {
		constructor(stream) {
			this.stream = stream;
		}
		onClose(listener) {
			this.stream.on("close", listener);
			return api_1.Disposable.create(() => this.stream.off("close", listener));
		}
		onError(listener) {
			this.stream.on("error", listener);
			return api_1.Disposable.create(() => this.stream.off("error", listener));
		}
		onEnd(listener) {
			this.stream.on("end", listener);
			return api_1.Disposable.create(() => this.stream.off("end", listener));
		}
		write(data, encoding) {
			return new Promise((resolve, reject) => {
				const callback = (error) => {
					if (error === void 0 || error === null) resolve();
					else reject(error);
				};
				if (typeof data === "string") this.stream.write(data, encoding, callback);
				else this.stream.write(data, callback);
			});
		}
		end() {
			this.stream.end();
		}
	};
	const _ril = Object.freeze({
		messageBuffer: Object.freeze({ create: (encoding) => new MessageBuffer(encoding) }),
		applicationJson: Object.freeze({
			encoder: Object.freeze({
				name: "application/json",
				encode: (msg, options) => {
					try {
						return Promise.resolve(Buffer.from(JSON.stringify(msg, void 0, 0), options.charset));
					} catch (err) {
						return Promise.reject(err);
					}
				}
			}),
			decoder: Object.freeze({
				name: "application/json",
				decode: (buffer, options) => {
					try {
						if (buffer instanceof Buffer) return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
						else return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
					} catch (err) {
						return Promise.reject(err);
					}
				}
			})
		}),
		stream: Object.freeze({
			asReadableStream: (stream) => new ReadableStreamWrapper(stream),
			asWritableStream: (stream) => new WritableStreamWrapper(stream)
		}),
		console,
		timer: Object.freeze({
			setTimeout(callback, ms, ...args) {
				const handle = setTimeout(callback, ms, ...args);
				return { dispose: () => clearTimeout(handle) };
			},
			setImmediate(callback, ...args) {
				const handle = setImmediate(callback, ...args);
				return { dispose: () => clearImmediate(handle) };
			},
			setInterval(callback, ms, ...args) {
				const handle = setInterval(callback, ms, ...args);
				return { dispose: () => clearInterval(handle) };
			}
		})
	});
	function RIL() {
		return _ril;
	}
	(function(RIL) {
		function install() {
			api_1.RAL.install(_ril);
		}
		RIL.install = install;
	})(RIL || (RIL = {}));
	exports.default = RIL;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/node/main.js
var require_main = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createMessageConnection = exports.createServerSocketTransport = exports.createClientSocketTransport = exports.createServerPipeTransport = exports.createClientPipeTransport = exports.generateRandomPipeName = exports.StreamMessageWriter = exports.StreamMessageReader = exports.SocketMessageWriter = exports.SocketMessageReader = exports.PortMessageWriter = exports.PortMessageReader = exports.IPCMessageWriter = exports.IPCMessageReader = void 0;
	const ril_1 = require_ril();
	ril_1.default.install();
	const path$1 = __require("path");
	const os = __require("os");
	const crypto_1 = __require("crypto");
	const net_1 = __require("net");
	const api_1 = require_api();
	__exportStar(require_api(), exports);
	var IPCMessageReader = class extends api_1.AbstractMessageReader {
		constructor(process) {
			super();
			this.process = process;
			let eventEmitter = this.process;
			eventEmitter.on("error", (error) => this.fireError(error));
			eventEmitter.on("close", () => this.fireClose());
		}
		listen(callback) {
			this.process.on("message", callback);
			return api_1.Disposable.create(() => this.process.off("message", callback));
		}
	};
	exports.IPCMessageReader = IPCMessageReader;
	var IPCMessageWriter = class extends api_1.AbstractMessageWriter {
		constructor(process) {
			super();
			this.process = process;
			this.errorCount = 0;
			const eventEmitter = this.process;
			eventEmitter.on("error", (error) => this.fireError(error));
			eventEmitter.on("close", () => this.fireClose);
		}
		write(msg) {
			try {
				if (typeof this.process.send === "function") this.process.send(msg, void 0, void 0, (error) => {
					if (error) {
						this.errorCount++;
						this.handleError(error, msg);
					} else this.errorCount = 0;
				});
				return Promise.resolve();
			} catch (error) {
				this.handleError(error, msg);
				return Promise.reject(error);
			}
		}
		handleError(error, msg) {
			this.errorCount++;
			this.fireError(error, msg, this.errorCount);
		}
		end() {}
	};
	exports.IPCMessageWriter = IPCMessageWriter;
	var PortMessageReader = class extends api_1.AbstractMessageReader {
		constructor(port) {
			super();
			this.onData = new api_1.Emitter();
			port.on("close", () => this.fireClose);
			port.on("error", (error) => this.fireError(error));
			port.on("message", (message) => {
				this.onData.fire(message);
			});
		}
		listen(callback) {
			return this.onData.event(callback);
		}
	};
	exports.PortMessageReader = PortMessageReader;
	var PortMessageWriter = class extends api_1.AbstractMessageWriter {
		constructor(port) {
			super();
			this.port = port;
			this.errorCount = 0;
			port.on("close", () => this.fireClose());
			port.on("error", (error) => this.fireError(error));
		}
		write(msg) {
			try {
				this.port.postMessage(msg);
				return Promise.resolve();
			} catch (error) {
				this.handleError(error, msg);
				return Promise.reject(error);
			}
		}
		handleError(error, msg) {
			this.errorCount++;
			this.fireError(error, msg, this.errorCount);
		}
		end() {}
	};
	exports.PortMessageWriter = PortMessageWriter;
	var SocketMessageReader = class extends api_1.ReadableStreamMessageReader {
		constructor(socket, encoding = "utf-8") {
			super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
		}
	};
	exports.SocketMessageReader = SocketMessageReader;
	var SocketMessageWriter = class extends api_1.WriteableStreamMessageWriter {
		constructor(socket, options) {
			super((0, ril_1.default)().stream.asWritableStream(socket), options);
			this.socket = socket;
		}
		dispose() {
			super.dispose();
			this.socket.destroy();
		}
	};
	exports.SocketMessageWriter = SocketMessageWriter;
	var StreamMessageReader = class extends api_1.ReadableStreamMessageReader {
		constructor(readable, encoding) {
			super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
		}
	};
	exports.StreamMessageReader = StreamMessageReader;
	var StreamMessageWriter = class extends api_1.WriteableStreamMessageWriter {
		constructor(writable, options) {
			super((0, ril_1.default)().stream.asWritableStream(writable), options);
		}
	};
	exports.StreamMessageWriter = StreamMessageWriter;
	const XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
	const safeIpcPathLengths = new Map([["linux", 107], ["darwin", 103]]);
	function generateRandomPipeName() {
		const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
		if (process.platform === "win32") return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
		let result;
		if (XDG_RUNTIME_DIR) result = path$1.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
		else result = path$1.join(os.tmpdir(), `vscode-${randomSuffix}.sock`);
		const limit = safeIpcPathLengths.get(process.platform);
		if (limit !== void 0 && result.length > limit) (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
		return result;
	}
	exports.generateRandomPipeName = generateRandomPipeName;
	function createClientPipeTransport(pipeName, encoding = "utf-8") {
		let connectResolve;
		const connected = new Promise((resolve, _reject) => {
			connectResolve = resolve;
		});
		return new Promise((resolve, reject) => {
			let server = (0, net_1.createServer)((socket) => {
				server.close();
				connectResolve([new SocketMessageReader(socket, encoding), new SocketMessageWriter(socket, encoding)]);
			});
			server.on("error", reject);
			server.listen(pipeName, () => {
				server.removeListener("error", reject);
				resolve({ onConnected: () => {
					return connected;
				} });
			});
		});
	}
	exports.createClientPipeTransport = createClientPipeTransport;
	function createServerPipeTransport(pipeName, encoding = "utf-8") {
		const socket = (0, net_1.createConnection)(pipeName);
		return [new SocketMessageReader(socket, encoding), new SocketMessageWriter(socket, encoding)];
	}
	exports.createServerPipeTransport = createServerPipeTransport;
	function createClientSocketTransport(port, encoding = "utf-8") {
		let connectResolve;
		const connected = new Promise((resolve, _reject) => {
			connectResolve = resolve;
		});
		return new Promise((resolve, reject) => {
			const server = (0, net_1.createServer)((socket) => {
				server.close();
				connectResolve([new SocketMessageReader(socket, encoding), new SocketMessageWriter(socket, encoding)]);
			});
			server.on("error", reject);
			server.listen(port, "127.0.0.1", () => {
				server.removeListener("error", reject);
				resolve({ onConnected: () => {
					return connected;
				} });
			});
		});
	}
	exports.createClientSocketTransport = createClientSocketTransport;
	function createServerSocketTransport(port, encoding = "utf-8") {
		const socket = (0, net_1.createConnection)(port, "127.0.0.1");
		return [new SocketMessageReader(socket, encoding), new SocketMessageWriter(socket, encoding)];
	}
	exports.createServerSocketTransport = createServerSocketTransport;
	function isReadableStream(value) {
		const candidate = value;
		return candidate.read !== void 0 && candidate.addListener !== void 0;
	}
	function isWritableStream(value) {
		const candidate = value;
		return candidate.write !== void 0 && candidate.addListener !== void 0;
	}
	function createMessageConnection(input, output, logger, options) {
		if (!logger) logger = api_1.NullLogger;
		const reader = isReadableStream(input) ? new StreamMessageReader(input) : input;
		const writer = isWritableStream(output) ? new StreamMessageWriter(output) : output;
		if (api_1.ConnectionStrategy.is(options)) options = { connectionStrategy: options };
		return (0, api_1.createMessageConnection)(reader, writer, logger, options);
	}
	exports.createMessageConnection = createMessageConnection;
}));

//#endregion
//#region ../../node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_main();
}));

//#endregion
//#region ../../node_modules/.pnpm/@github+copilot-sdk@0.1.32/node_modules/@github/copilot-sdk/dist/generated/rpc.js
var import_node = require_node();
function createServerRpc(connection) {
	return {
		ping: async (params) => connection.sendRequest("ping", params),
		models: { list: async () => connection.sendRequest("models.list", {}) },
		tools: { list: async (params) => connection.sendRequest("tools.list", params) },
		account: { getQuota: async () => connection.sendRequest("account.getQuota", {}) }
	};
}
function createSessionRpc(connection, sessionId) {
	return {
		model: {
			getCurrent: async () => connection.sendRequest("session.model.getCurrent", { sessionId }),
			switchTo: async (params) => connection.sendRequest("session.model.switchTo", {
				sessionId,
				...params
			})
		},
		mode: {
			get: async () => connection.sendRequest("session.mode.get", { sessionId }),
			set: async (params) => connection.sendRequest("session.mode.set", {
				sessionId,
				...params
			})
		},
		plan: {
			read: async () => connection.sendRequest("session.plan.read", { sessionId }),
			update: async (params) => connection.sendRequest("session.plan.update", {
				sessionId,
				...params
			}),
			delete: async () => connection.sendRequest("session.plan.delete", { sessionId })
		},
		workspace: {
			listFiles: async () => connection.sendRequest("session.workspace.listFiles", { sessionId }),
			readFile: async (params) => connection.sendRequest("session.workspace.readFile", {
				sessionId,
				...params
			}),
			createFile: async (params) => connection.sendRequest("session.workspace.createFile", {
				sessionId,
				...params
			})
		},
		fleet: { start: async (params) => connection.sendRequest("session.fleet.start", {
			sessionId,
			...params
		}) },
		agent: {
			list: async () => connection.sendRequest("session.agent.list", { sessionId }),
			getCurrent: async () => connection.sendRequest("session.agent.getCurrent", { sessionId }),
			select: async (params) => connection.sendRequest("session.agent.select", {
				sessionId,
				...params
			}),
			deselect: async () => connection.sendRequest("session.agent.deselect", { sessionId })
		},
		compaction: { compact: async () => connection.sendRequest("session.compaction.compact", { sessionId }) },
		tools: { handlePendingToolCall: async (params) => connection.sendRequest("session.tools.handlePendingToolCall", {
			sessionId,
			...params
		}) },
		permissions: { handlePendingPermissionRequest: async (params) => connection.sendRequest("session.permissions.handlePendingPermissionRequest", {
			sessionId,
			...params
		}) }
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@github+copilot-sdk@0.1.32/node_modules/@github/copilot-sdk/dist/sdkProtocolVersion.js
const SDK_PROTOCOL_VERSION = 3;
function getSdkProtocolVersion() {
	return SDK_PROTOCOL_VERSION;
}

//#endregion
//#region ../../node_modules/.pnpm/@github+copilot-sdk@0.1.32/node_modules/@github/copilot-sdk/dist/session.js
var CopilotSession = class {
	/**
	* Creates a new CopilotSession instance.
	*
	* @param sessionId - The unique identifier for this session
	* @param connection - The JSON-RPC message connection to the Copilot CLI
	* @param workspacePath - Path to the session workspace directory (when infinite sessions enabled)
	* @internal This constructor is internal. Use {@link CopilotClient.createSession} to create sessions.
	*/
	constructor(sessionId, connection, _workspacePath) {
		this.sessionId = sessionId;
		this.connection = connection;
		this._workspacePath = _workspacePath;
	}
	eventHandlers = /* @__PURE__ */ new Set();
	typedEventHandlers = /* @__PURE__ */ new Map();
	toolHandlers = /* @__PURE__ */ new Map();
	permissionHandler;
	userInputHandler;
	hooks;
	_rpc = null;
	/**
	* Typed session-scoped RPC methods.
	*/
	get rpc() {
		if (!this._rpc) this._rpc = createSessionRpc(this.connection, this.sessionId);
		return this._rpc;
	}
	/**
	* Path to the session workspace directory when infinite sessions are enabled.
	* Contains checkpoints/, plan.md, and files/ subdirectories.
	* Undefined if infinite sessions are disabled.
	*/
	get workspacePath() {
		return this._workspacePath;
	}
	/**
	* Sends a message to this session and waits for the response.
	*
	* The message is processed asynchronously. Subscribe to events via {@link on}
	* to receive streaming responses and other session events.
	*
	* @param options - The message options including the prompt and optional attachments
	* @returns A promise that resolves with the message ID of the response
	* @throws Error if the session has been disconnected or the connection fails
	*
	* @example
	* ```typescript
	* const messageId = await session.send({
	*   prompt: "Explain this code",
	*   attachments: [{ type: "file", path: "./src/index.ts" }]
	* });
	* ```
	*/
	async send(options) {
		return (await this.connection.sendRequest("session.send", {
			sessionId: this.sessionId,
			prompt: options.prompt,
			attachments: options.attachments,
			mode: options.mode
		})).messageId;
	}
	/**
	* Sends a message to this session and waits until the session becomes idle.
	*
	* This is a convenience method that combines {@link send} with waiting for
	* the `session.idle` event. Use this when you want to block until the
	* assistant has finished processing the message.
	*
	* Events are still delivered to handlers registered via {@link on} while waiting.
	*
	* @param options - The message options including the prompt and optional attachments
	* @param timeout - Timeout in milliseconds (default: 60000). Controls how long to wait; does not abort in-flight agent work.
	* @returns A promise that resolves with the final assistant message when the session becomes idle,
	*          or undefined if no assistant message was received
	* @throws Error if the timeout is reached before the session becomes idle
	* @throws Error if the session has been disconnected or the connection fails
	*
	* @example
	* ```typescript
	* // Send and wait for completion with default 60s timeout
	* const response = await session.sendAndWait({ prompt: "What is 2+2?" });
	* console.log(response?.data.content); // "4"
	* ```
	*/
	async sendAndWait(options, timeout) {
		const effectiveTimeout = timeout ?? 6e4;
		let resolveIdle;
		let rejectWithError;
		const idlePromise = new Promise((resolve, reject) => {
			resolveIdle = resolve;
			rejectWithError = reject;
		});
		let lastAssistantMessage;
		const unsubscribe = this.on((event) => {
			if (event.type === "assistant.message") lastAssistantMessage = event;
			else if (event.type === "session.idle") resolveIdle();
			else if (event.type === "session.error") {
				const error = new Error(event.data.message);
				error.stack = event.data.stack;
				rejectWithError(error);
			}
		});
		let timeoutId;
		try {
			await this.send(options);
			const timeoutPromise = new Promise((_, reject) => {
				timeoutId = setTimeout(() => reject(/* @__PURE__ */ new Error(`Timeout after ${effectiveTimeout}ms waiting for session.idle`)), effectiveTimeout);
			});
			await Promise.race([idlePromise, timeoutPromise]);
			return lastAssistantMessage;
		} finally {
			if (timeoutId !== void 0) clearTimeout(timeoutId);
			unsubscribe();
		}
	}
	on(eventTypeOrHandler, handler) {
		if (typeof eventTypeOrHandler === "string" && handler) {
			const eventType = eventTypeOrHandler;
			if (!this.typedEventHandlers.has(eventType)) this.typedEventHandlers.set(eventType, /* @__PURE__ */ new Set());
			const storedHandler = handler;
			this.typedEventHandlers.get(eventType).add(storedHandler);
			return () => {
				const handlers = this.typedEventHandlers.get(eventType);
				if (handlers) handlers.delete(storedHandler);
			};
		}
		const wildcardHandler = eventTypeOrHandler;
		this.eventHandlers.add(wildcardHandler);
		return () => {
			this.eventHandlers.delete(wildcardHandler);
		};
	}
	/**
	* Dispatches an event to all registered handlers.
	* Also handles broadcast request events internally (external tool calls, permissions).
	*
	* @param event - The session event to dispatch
	* @internal This method is for internal use by the SDK.
	*/
	_dispatchEvent(event) {
		this._handleBroadcastEvent(event);
		const typedHandlers = this.typedEventHandlers.get(event.type);
		if (typedHandlers) for (const handler of typedHandlers) try {
			handler(event);
		} catch (_error) {}
		for (const handler of this.eventHandlers) try {
			handler(event);
		} catch (_error) {}
	}
	/**
	* Handles broadcast request events by executing local handlers and responding via RPC.
	* Handlers are dispatched as fire-and-forget — rejections propagate as unhandled promise
	* rejections, consistent with standard EventEmitter / event handler semantics.
	* @internal
	*/
	_handleBroadcastEvent(event) {
		if (event.type === "external_tool.requested") {
			const { requestId, toolName } = event.data;
			const args = event.data.arguments;
			const toolCallId = event.data.toolCallId;
			const handler = this.toolHandlers.get(toolName);
			if (handler) this._executeToolAndRespond(requestId, toolName, toolCallId, args, handler);
		} else if (event.type === "permission.requested") {
			const { requestId, permissionRequest } = event.data;
			if (this.permissionHandler) this._executePermissionAndRespond(requestId, permissionRequest);
		}
	}
	/**
	* Executes a tool handler and sends the result back via RPC.
	* @internal
	*/
	async _executeToolAndRespond(requestId, toolName, toolCallId, args, handler) {
		try {
			const rawResult = await handler(args, {
				sessionId: this.sessionId,
				toolCallId,
				toolName,
				arguments: args
			});
			let result;
			if (rawResult == null) result = "";
			else if (typeof rawResult === "string") result = rawResult;
			else result = JSON.stringify(rawResult);
			await this.rpc.tools.handlePendingToolCall({
				requestId,
				result
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			try {
				await this.rpc.tools.handlePendingToolCall({
					requestId,
					error: message
				});
			} catch (rpcError) {
				if (!(rpcError instanceof import_node.ConnectionError || rpcError instanceof import_node.ResponseError)) throw rpcError;
			}
		}
	}
	/**
	* Executes a permission handler and sends the result back via RPC.
	* @internal
	*/
	async _executePermissionAndRespond(requestId, permissionRequest) {
		try {
			const result = await this.permissionHandler(permissionRequest, { sessionId: this.sessionId });
			await this.rpc.permissions.handlePendingPermissionRequest({
				requestId,
				result
			});
		} catch (_error) {
			try {
				await this.rpc.permissions.handlePendingPermissionRequest({
					requestId,
					result: { kind: "denied-no-approval-rule-and-could-not-request-from-user" }
				});
			} catch (rpcError) {
				if (!(rpcError instanceof import_node.ConnectionError || rpcError instanceof import_node.ResponseError)) throw rpcError;
			}
		}
	}
	/**
	* Registers custom tool handlers for this session.
	*
	* Tools allow the assistant to execute custom functions. When the assistant
	* invokes a tool, the corresponding handler is called with the tool arguments.
	*
	* @param tools - An array of tool definitions with their handlers, or undefined to clear all tools
	* @internal This method is typically called internally when creating a session with tools.
	*/
	registerTools(tools) {
		this.toolHandlers.clear();
		if (!tools) return;
		for (const tool of tools) this.toolHandlers.set(tool.name, tool.handler);
	}
	/**
	* Retrieves a registered tool handler by name.
	*
	* @param name - The name of the tool to retrieve
	* @returns The tool handler if found, or undefined
	* @internal This method is for internal use by the SDK.
	*/
	getToolHandler(name) {
		return this.toolHandlers.get(name);
	}
	/**
	* Registers a handler for permission requests.
	*
	* When the assistant needs permission to perform certain actions (e.g., file operations),
	* this handler is called to approve or deny the request.
	*
	* @param handler - The permission handler function, or undefined to remove the handler
	* @internal This method is typically called internally when creating a session.
	*/
	registerPermissionHandler(handler) {
		this.permissionHandler = handler;
	}
	/**
	* Registers a user input handler for ask_user requests.
	*
	* When the agent needs input from the user (via ask_user tool),
	* this handler is called to provide the response.
	*
	* @param handler - The user input handler function, or undefined to remove the handler
	* @internal This method is typically called internally when creating a session.
	*/
	registerUserInputHandler(handler) {
		this.userInputHandler = handler;
	}
	/**
	* Registers hook handlers for session lifecycle events.
	*
	* Hooks allow custom logic to be executed at various points during
	* the session lifecycle (before/after tool use, session start/end, etc.).
	*
	* @param hooks - The hook handlers object, or undefined to remove all hooks
	* @internal This method is typically called internally when creating a session.
	*/
	registerHooks(hooks) {
		this.hooks = hooks;
	}
	/**
	* Handles a permission request in the v2 protocol format (synchronous RPC).
	* Used as a back-compat adapter when connected to a v2 server.
	*
	* @param request - The permission request data from the CLI
	* @returns A promise that resolves with the permission decision
	* @internal This method is for internal use by the SDK.
	*/
	async _handlePermissionRequestV2(request) {
		if (!this.permissionHandler) return { kind: "denied-no-approval-rule-and-could-not-request-from-user" };
		try {
			return await this.permissionHandler(request, { sessionId: this.sessionId });
		} catch (_error) {
			return { kind: "denied-no-approval-rule-and-could-not-request-from-user" };
		}
	}
	/**
	* Handles a user input request from the Copilot CLI.
	*
	* @param request - The user input request data from the CLI
	* @returns A promise that resolves with the user's response
	* @internal This method is for internal use by the SDK.
	*/
	async _handleUserInputRequest(request) {
		if (!this.userInputHandler) throw new Error("User input requested but no handler registered");
		try {
			return await this.userInputHandler(request, { sessionId: this.sessionId });
		} catch (error) {
			throw error;
		}
	}
	/**
	* Handles a hooks invocation from the Copilot CLI.
	*
	* @param hookType - The type of hook being invoked
	* @param input - The input data for the hook
	* @returns A promise that resolves with the hook output, or undefined
	* @internal This method is for internal use by the SDK.
	*/
	async _handleHooksInvoke(hookType, input) {
		if (!this.hooks) return;
		const handler = {
			preToolUse: this.hooks.onPreToolUse,
			postToolUse: this.hooks.onPostToolUse,
			userPromptSubmitted: this.hooks.onUserPromptSubmitted,
			sessionStart: this.hooks.onSessionStart,
			sessionEnd: this.hooks.onSessionEnd,
			errorOccurred: this.hooks.onErrorOccurred
		}[hookType];
		if (!handler) return;
		try {
			return await handler(input, { sessionId: this.sessionId });
		} catch (_error) {
			return;
		}
	}
	/**
	* Retrieves all events and messages from this session's history.
	*
	* This returns the complete conversation history including user messages,
	* assistant responses, tool executions, and other session events.
	*
	* @returns A promise that resolves with an array of all session events
	* @throws Error if the session has been disconnected or the connection fails
	*
	* @example
	* ```typescript
	* const events = await session.getMessages();
	* for (const event of events) {
	*   if (event.type === "assistant.message") {
	*     console.log("Assistant:", event.data.content);
	*   }
	* }
	* ```
	*/
	async getMessages() {
		return (await this.connection.sendRequest("session.getMessages", { sessionId: this.sessionId })).events;
	}
	/**
	* Disconnects this session and releases all in-memory resources (event handlers,
	* tool handlers, permission handlers).
	*
	* Session state on disk (conversation history, planning state, artifacts) is
	* preserved, so the conversation can be resumed later by calling
	* {@link CopilotClient.resumeSession} with the session ID. To permanently
	* remove all session data including files on disk, use
	* {@link CopilotClient.deleteSession} instead.
	*
	* After calling this method, the session object can no longer be used.
	*
	* @returns A promise that resolves when the session is disconnected
	* @throws Error if the connection fails
	*
	* @example
	* ```typescript
	* // Clean up when done — session can still be resumed later
	* await session.disconnect();
	* ```
	*/
	async disconnect() {
		await this.connection.sendRequest("session.destroy", { sessionId: this.sessionId });
		this.eventHandlers.clear();
		this.typedEventHandlers.clear();
		this.toolHandlers.clear();
		this.permissionHandler = void 0;
	}
	/**
	* @deprecated Use {@link disconnect} instead. This method will be removed in a future release.
	*
	* Disconnects this session and releases all in-memory resources.
	* Session data on disk is preserved for later resumption.
	*
	* @returns A promise that resolves when the session is disconnected
	* @throws Error if the connection fails
	*/
	async destroy() {
		return this.disconnect();
	}
	/** Enables `await using session = ...` syntax for automatic cleanup. */
	async [Symbol.asyncDispose]() {
		return this.disconnect();
	}
	/**
	* Aborts the currently processing message in this session.
	*
	* Use this to cancel a long-running request. The session remains valid
	* and can continue to be used for new messages.
	*
	* @returns A promise that resolves when the abort request is acknowledged
	* @throws Error if the session has been disconnected or the connection fails
	*
	* @example
	* ```typescript
	* // Start a long-running request
	* const messagePromise = session.send({ prompt: "Write a very long story..." });
	*
	* // Abort after 5 seconds
	* setTimeout(async () => {
	*   await session.abort();
	* }, 5000);
	* ```
	*/
	async abort() {
		await this.connection.sendRequest("session.abort", { sessionId: this.sessionId });
	}
	/**
	* Change the model for this session.
	* The new model takes effect for the next message. Conversation history is preserved.
	*
	* @param model - Model ID to switch to
	*
	* @example
	* ```typescript
	* await session.setModel("gpt-4.1");
	* ```
	*/
	async setModel(model) {
		await this.rpc.model.switchTo({ modelId: model });
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@github+copilot-sdk@0.1.32/node_modules/@github/copilot-sdk/dist/client.js
const MIN_PROTOCOL_VERSION = 2;
function isZodSchema(value) {
	return value != null && typeof value === "object" && "toJSONSchema" in value && typeof value.toJSONSchema === "function";
}
function toJsonSchema(parameters) {
	if (!parameters) return void 0;
	if (isZodSchema(parameters)) return parameters.toJSONSchema();
	return parameters;
}
function getNodeExecPath() {
	if (process.versions.bun) return "node";
	return process.execPath;
}
function getBundledCliPath() {
	return join(dirname(dirname(fileURLToPath(import.meta.resolve("@github/copilot/sdk")))), "index.js");
}
var CopilotClient = class {
	cliProcess = null;
	connection = null;
	socket = null;
	actualPort = null;
	actualHost = "localhost";
	state = "disconnected";
	sessions = /* @__PURE__ */ new Map();
	stderrBuffer = "";
	options;
	isExternalServer = false;
	forceStopping = false;
	modelsCache = null;
	modelsCacheLock = Promise.resolve();
	sessionLifecycleHandlers = /* @__PURE__ */ new Set();
	typedLifecycleHandlers = /* @__PURE__ */ new Map();
	_rpc = null;
	processExitPromise = null;
	negotiatedProtocolVersion = null;
	/**
	* Typed server-scoped RPC methods.
	* @throws Error if the client is not connected
	*/
	get rpc() {
		if (!this.connection) throw new Error("Client is not connected. Call start() first.");
		if (!this._rpc) this._rpc = createServerRpc(this.connection);
		return this._rpc;
	}
	/**
	* Creates a new CopilotClient instance.
	*
	* @param options - Configuration options for the client
	* @throws Error if mutually exclusive options are provided (e.g., cliUrl with useStdio or cliPath)
	*
	* @example
	* ```typescript
	* // Default options - spawns CLI server using stdio
	* const client = new CopilotClient();
	*
	* // Connect to an existing server
	* const client = new CopilotClient({ cliUrl: "localhost:3000" });
	*
	* // Custom CLI path with specific log level
	* const client = new CopilotClient({
	*   cliPath: "/usr/local/bin/copilot",
	*   logLevel: "debug"
	* });
	* ```
	*/
	constructor(options = {}) {
		if (options.cliUrl && (options.useStdio === true || options.cliPath)) throw new Error("cliUrl is mutually exclusive with useStdio and cliPath");
		if (options.isChildProcess && (options.cliUrl || options.useStdio === false)) throw new Error("isChildProcess must be used in conjunction with useStdio and not with cliUrl");
		if (options.cliUrl && (options.githubToken || options.useLoggedInUser !== void 0)) throw new Error("githubToken and useLoggedInUser cannot be used with cliUrl (external server manages its own auth)");
		if (options.cliUrl) {
			const { host, port } = this.parseCliUrl(options.cliUrl);
			this.actualHost = host;
			this.actualPort = port;
			this.isExternalServer = true;
		}
		if (options.isChildProcess) this.isExternalServer = true;
		this.options = {
			cliPath: options.cliPath || getBundledCliPath(),
			cliArgs: options.cliArgs ?? [],
			cwd: options.cwd ?? process.cwd(),
			port: options.port || 0,
			useStdio: options.cliUrl ? false : options.useStdio ?? true,
			isChildProcess: options.isChildProcess ?? false,
			cliUrl: options.cliUrl,
			logLevel: options.logLevel || "debug",
			autoStart: options.autoStart ?? true,
			autoRestart: options.autoRestart ?? true,
			env: options.env ?? process.env,
			githubToken: options.githubToken,
			useLoggedInUser: options.useLoggedInUser ?? (options.githubToken ? false : true)
		};
	}
	/**
	* Parse CLI URL into host and port
	* Supports formats: "host:port", "http://host:port", "https://host:port", or just "port"
	*/
	parseCliUrl(url) {
		let cleanUrl = url.replace(/^https?:\/\//, "");
		if (/^\d+$/.test(cleanUrl)) return {
			host: "localhost",
			port: parseInt(cleanUrl, 10)
		};
		const parts = cleanUrl.split(":");
		if (parts.length !== 2) throw new Error(`Invalid cliUrl format: ${url}. Expected "host:port", "http://host:port", or "port"`);
		const host = parts[0] || "localhost";
		const port = parseInt(parts[1], 10);
		if (isNaN(port) || port <= 0 || port > 65535) throw new Error(`Invalid port in cliUrl: ${url}`);
		return {
			host,
			port
		};
	}
	/**
	* Starts the CLI server and establishes a connection.
	*
	* If connecting to an external server (via cliUrl), only establishes the connection.
	* Otherwise, spawns the CLI server process and then connects.
	*
	* This method is called automatically when creating a session if `autoStart` is true (default).
	*
	* @returns A promise that resolves when the connection is established
	* @throws Error if the server fails to start or the connection fails
	*
	* @example
	* ```typescript
	* const client = new CopilotClient({ autoStart: false });
	* await client.start();
	* // Now ready to create sessions
	* ```
	*/
	async start() {
		if (this.state === "connected") return;
		this.state = "connecting";
		try {
			if (!this.isExternalServer) await this.startCLIServer();
			await this.connectToServer();
			await this.verifyProtocolVersion();
			this.state = "connected";
		} catch (error) {
			this.state = "error";
			throw error;
		}
	}
	/**
	* Stops the CLI server and closes all active sessions.
	*
	* This method performs graceful cleanup:
	* 1. Closes all active sessions (releases in-memory resources)
	* 2. Closes the JSON-RPC connection
	* 3. Terminates the CLI server process (if spawned by this client)
	*
	* Note: session data on disk is preserved, so sessions can be resumed later.
	* To permanently remove session data before stopping, call
	* {@link deleteSession} for each session first.
	*
	* @returns A promise that resolves with an array of errors encountered during cleanup.
	*          An empty array indicates all cleanup succeeded.
	*
	* @example
	* ```typescript
	* const errors = await client.stop();
	* if (errors.length > 0) {
	*   console.error("Cleanup errors:", errors);
	* }
	* ```
	*/
	async stop() {
		const errors = [];
		for (const session of this.sessions.values()) {
			const sessionId = session.sessionId;
			let lastError = null;
			for (let attempt = 1; attempt <= 3; attempt++) try {
				await session.disconnect();
				lastError = null;
				break;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				if (attempt < 3) {
					const delay = 100 * Math.pow(2, attempt - 1);
					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
			if (lastError) errors.push(/* @__PURE__ */ new Error(`Failed to disconnect session ${sessionId} after 3 attempts: ${lastError.message}`));
		}
		this.sessions.clear();
		if (this.connection) {
			try {
				this.connection.dispose();
			} catch (error) {
				errors.push(/* @__PURE__ */ new Error(`Failed to dispose connection: ${error instanceof Error ? error.message : String(error)}`));
			}
			this.connection = null;
			this._rpc = null;
		}
		this.modelsCache = null;
		if (this.socket) {
			try {
				this.socket.end();
			} catch (error) {
				errors.push(/* @__PURE__ */ new Error(`Failed to close socket: ${error instanceof Error ? error.message : String(error)}`));
			}
			this.socket = null;
		}
		if (this.cliProcess && !this.isExternalServer) {
			try {
				this.cliProcess.kill();
			} catch (error) {
				errors.push(/* @__PURE__ */ new Error(`Failed to kill CLI process: ${error instanceof Error ? error.message : String(error)}`));
			}
			this.cliProcess = null;
		}
		this.state = "disconnected";
		this.actualPort = null;
		this.stderrBuffer = "";
		this.processExitPromise = null;
		return errors;
	}
	/**
	* Forcefully stops the CLI server without graceful cleanup.
	*
	* Use this when {@link stop} fails or takes too long. This method:
	* - Clears all sessions immediately without destroying them
	* - Force closes the connection
	* - Sends SIGKILL to the CLI process (if spawned by this client)
	*
	* @returns A promise that resolves when the force stop is complete
	*
	* @example
	* ```typescript
	* // If normal stop hangs, force stop
	* const stopPromise = client.stop();
	* const timeout = new Promise((_, reject) =>
	*   setTimeout(() => reject(new Error("Timeout")), 5000)
	* );
	*
	* try {
	*   await Promise.race([stopPromise, timeout]);
	* } catch {
	*   await client.forceStop();
	* }
	* ```
	*/
	async forceStop() {
		this.forceStopping = true;
		this.sessions.clear();
		if (this.connection) {
			try {
				this.connection.dispose();
			} catch {}
			this.connection = null;
			this._rpc = null;
		}
		this.modelsCache = null;
		if (this.socket) {
			try {
				this.socket.destroy();
			} catch {}
			this.socket = null;
		}
		if (this.cliProcess && !this.isExternalServer) {
			try {
				this.cliProcess.kill("SIGKILL");
			} catch {}
			this.cliProcess = null;
		}
		this.state = "disconnected";
		this.actualPort = null;
		this.stderrBuffer = "";
		this.processExitPromise = null;
	}
	/**
	* Creates a new conversation session with the Copilot CLI.
	*
	* Sessions maintain conversation state, handle events, and manage tool execution.
	* If the client is not connected and `autoStart` is enabled, this will automatically
	* start the connection.
	*
	* @param config - Optional configuration for the session
	* @returns A promise that resolves with the created session
	* @throws Error if the client is not connected and autoStart is disabled
	*
	* @example
	* ```typescript
	* // Basic session
	* const session = await client.createSession({ onPermissionRequest: approveAll });
	*
	* // Session with model and tools
	* const session = await client.createSession({
	*   onPermissionRequest: approveAll,
	*   model: "gpt-4",
	*   tools: [{
	*     name: "get_weather",
	*     description: "Get weather for a location",
	*     parameters: { type: "object", properties: { location: { type: "string" } } },
	*     handler: async (args) => ({ temperature: 72 })
	*   }]
	* });
	* ```
	*/
	async createSession(config) {
		if (!config?.onPermissionRequest) throw new Error("An onPermissionRequest handler is required when creating a session. For example, to allow all permissions, use { onPermissionRequest: approveAll }.");
		if (!this.connection) if (this.options.autoStart) await this.start();
		else throw new Error("Client not connected. Call start() first.");
		const { sessionId, workspacePath } = await this.connection.sendRequest("session.create", {
			model: config.model,
			sessionId: config.sessionId,
			clientName: config.clientName,
			reasoningEffort: config.reasoningEffort,
			tools: config.tools?.map((tool) => ({
				name: tool.name,
				description: tool.description,
				parameters: toJsonSchema(tool.parameters),
				overridesBuiltInTool: tool.overridesBuiltInTool
			})),
			systemMessage: config.systemMessage,
			availableTools: config.availableTools,
			excludedTools: config.excludedTools,
			provider: config.provider,
			requestPermission: true,
			requestUserInput: !!config.onUserInputRequest,
			hooks: !!(config.hooks && Object.values(config.hooks).some(Boolean)),
			workingDirectory: config.workingDirectory,
			streaming: config.streaming,
			mcpServers: config.mcpServers,
			envValueMode: "direct",
			customAgents: config.customAgents,
			configDir: config.configDir,
			skillDirectories: config.skillDirectories,
			disabledSkills: config.disabledSkills,
			infiniteSessions: config.infiniteSessions
		});
		const session = new CopilotSession(sessionId, this.connection, workspacePath);
		session.registerTools(config.tools);
		session.registerPermissionHandler(config.onPermissionRequest);
		if (config.onUserInputRequest) session.registerUserInputHandler(config.onUserInputRequest);
		if (config.hooks) session.registerHooks(config.hooks);
		this.sessions.set(sessionId, session);
		return session;
	}
	/**
	* Resumes an existing conversation session by its ID.
	*
	* This allows you to continue a previous conversation, maintaining all
	* conversation history. The session must have been previously created
	* and not deleted.
	*
	* @param sessionId - The ID of the session to resume
	* @param config - Optional configuration for the resumed session
	* @returns A promise that resolves with the resumed session
	* @throws Error if the session does not exist or the client is not connected
	*
	* @example
	* ```typescript
	* // Resume a previous session
	* const session = await client.resumeSession("session-123", { onPermissionRequest: approveAll });
	*
	* // Resume with new tools
	* const session = await client.resumeSession("session-123", {
	*   onPermissionRequest: approveAll,
	*   tools: [myNewTool]
	* });
	* ```
	*/
	async resumeSession(sessionId, config) {
		if (!config?.onPermissionRequest) throw new Error("An onPermissionRequest handler is required when resuming a session. For example, to allow all permissions, use { onPermissionRequest: approveAll }.");
		if (!this.connection) if (this.options.autoStart) await this.start();
		else throw new Error("Client not connected. Call start() first.");
		const { sessionId: resumedSessionId, workspacePath } = await this.connection.sendRequest("session.resume", {
			sessionId,
			clientName: config.clientName,
			model: config.model,
			reasoningEffort: config.reasoningEffort,
			systemMessage: config.systemMessage,
			availableTools: config.availableTools,
			excludedTools: config.excludedTools,
			tools: config.tools?.map((tool) => ({
				name: tool.name,
				description: tool.description,
				parameters: toJsonSchema(tool.parameters),
				overridesBuiltInTool: tool.overridesBuiltInTool
			})),
			provider: config.provider,
			requestPermission: true,
			requestUserInput: !!config.onUserInputRequest,
			hooks: !!(config.hooks && Object.values(config.hooks).some(Boolean)),
			workingDirectory: config.workingDirectory,
			configDir: config.configDir,
			streaming: config.streaming,
			mcpServers: config.mcpServers,
			envValueMode: "direct",
			customAgents: config.customAgents,
			skillDirectories: config.skillDirectories,
			disabledSkills: config.disabledSkills,
			infiniteSessions: config.infiniteSessions,
			disableResume: config.disableResume
		});
		const session = new CopilotSession(resumedSessionId, this.connection, workspacePath);
		session.registerTools(config.tools);
		session.registerPermissionHandler(config.onPermissionRequest);
		if (config.onUserInputRequest) session.registerUserInputHandler(config.onUserInputRequest);
		if (config.hooks) session.registerHooks(config.hooks);
		this.sessions.set(resumedSessionId, session);
		return session;
	}
	/**
	* Gets the current connection state of the client.
	*
	* @returns The current connection state: "disconnected", "connecting", "connected", or "error"
	*
	* @example
	* ```typescript
	* if (client.getState() === "connected") {
	*   const session = await client.createSession({ onPermissionRequest: approveAll });
	* }
	* ```
	*/
	getState() {
		return this.state;
	}
	/**
	* Sends a ping request to the server to verify connectivity.
	*
	* @param message - Optional message to include in the ping
	* @returns A promise that resolves with the ping response containing the message and timestamp
	* @throws Error if the client is not connected
	*
	* @example
	* ```typescript
	* const response = await client.ping("health check");
	* console.log(`Server responded at ${new Date(response.timestamp)}`);
	* ```
	*/
	async ping(message) {
		if (!this.connection) throw new Error("Client not connected");
		return await this.connection.sendRequest("ping", { message });
	}
	/**
	* Get CLI status including version and protocol information
	*/
	async getStatus() {
		if (!this.connection) throw new Error("Client not connected");
		return await this.connection.sendRequest("status.get", {});
	}
	/**
	* Get current authentication status
	*/
	async getAuthStatus() {
		if (!this.connection) throw new Error("Client not connected");
		return await this.connection.sendRequest("auth.getStatus", {});
	}
	/**
	* List available models with their metadata.
	*
	* Results are cached after the first successful call to avoid rate limiting.
	* The cache is cleared when the client disconnects.
	*
	* @throws Error if not authenticated
	*/
	async listModels() {
		if (!this.connection) throw new Error("Client not connected");
		await this.modelsCacheLock;
		let resolveLock;
		this.modelsCacheLock = new Promise((resolve) => {
			resolveLock = resolve;
		});
		try {
			if (this.modelsCache !== null) return [...this.modelsCache];
			const models = (await this.connection.sendRequest("models.list", {})).models;
			this.modelsCache = models;
			return [...models];
		} finally {
			resolveLock();
		}
	}
	/**
	* Verify that the server's protocol version is within the supported range
	* and store the negotiated version.
	*/
	async verifyProtocolVersion() {
		const maxVersion = getSdkProtocolVersion();
		let pingResult;
		if (this.processExitPromise) pingResult = await Promise.race([this.ping(), this.processExitPromise]);
		else pingResult = await this.ping();
		const serverVersion = pingResult.protocolVersion;
		if (serverVersion === void 0) throw new Error(`SDK protocol version mismatch: SDK supports versions ${MIN_PROTOCOL_VERSION}-${maxVersion}, but server does not report a protocol version. Please update your server to ensure compatibility.`);
		if (serverVersion < MIN_PROTOCOL_VERSION || serverVersion > maxVersion) throw new Error(`SDK protocol version mismatch: SDK supports versions ${MIN_PROTOCOL_VERSION}-${maxVersion}, but server reports version ${serverVersion}. Please update your SDK or server to ensure compatibility.`);
		this.negotiatedProtocolVersion = serverVersion;
	}
	/**
	* Gets the ID of the most recently updated session.
	*
	* This is useful for resuming the last conversation when the session ID
	* was not stored.
	*
	* @returns A promise that resolves with the session ID, or undefined if no sessions exist
	* @throws Error if the client is not connected
	*
	* @example
	* ```typescript
	* const lastId = await client.getLastSessionId();
	* if (lastId) {
	*   const session = await client.resumeSession(lastId, { onPermissionRequest: approveAll });
	* }
	* ```
	*/
	async getLastSessionId() {
		if (!this.connection) throw new Error("Client not connected");
		return (await this.connection.sendRequest("session.getLastId", {})).sessionId;
	}
	/**
	* Permanently deletes a session and all its data from disk, including
	* conversation history, planning state, and artifacts.
	*
	* Unlike {@link CopilotSession.disconnect}, which only releases in-memory
	* resources and preserves session data for later resumption, this method
	* is irreversible. The session cannot be resumed after deletion.
	*
	* @param sessionId - The ID of the session to delete
	* @returns A promise that resolves when the session is deleted
	* @throws Error if the session does not exist or deletion fails
	*
	* @example
	* ```typescript
	* await client.deleteSession("session-123");
	* ```
	*/
	async deleteSession(sessionId) {
		if (!this.connection) throw new Error("Client not connected");
		const { success, error } = await this.connection.sendRequest("session.delete", { sessionId });
		if (!success) throw new Error(`Failed to delete session ${sessionId}: ${error || "Unknown error"}`);
		this.sessions.delete(sessionId);
	}
	/**
	* List all available sessions.
	*
	* @param filter - Optional filter to limit returned sessions by context fields
	*
	* @example
	* // List all sessions
	* const sessions = await client.listSessions();
	*
	* @example
	* // List sessions for a specific repository
	* const sessions = await client.listSessions({ repository: "owner/repo" });
	*/
	async listSessions(filter) {
		if (!this.connection) throw new Error("Client not connected");
		const { sessions } = await this.connection.sendRequest("session.list", { filter });
		return sessions.map((s) => ({
			sessionId: s.sessionId,
			startTime: new Date(s.startTime),
			modifiedTime: new Date(s.modifiedTime),
			summary: s.summary,
			isRemote: s.isRemote,
			context: s.context
		}));
	}
	/**
	* Gets the foreground session ID in TUI+server mode.
	*
	* This returns the ID of the session currently displayed in the TUI.
	* Only available when connecting to a server running in TUI+server mode (--ui-server).
	*
	* @returns A promise that resolves with the foreground session ID, or undefined if none
	* @throws Error if the client is not connected
	*
	* @example
	* ```typescript
	* const sessionId = await client.getForegroundSessionId();
	* if (sessionId) {
	*   console.log(`TUI is displaying session: ${sessionId}`);
	* }
	* ```
	*/
	async getForegroundSessionId() {
		if (!this.connection) throw new Error("Client not connected");
		return (await this.connection.sendRequest("session.getForeground", {})).sessionId;
	}
	/**
	* Sets the foreground session in TUI+server mode.
	*
	* This requests the TUI to switch to displaying the specified session.
	* Only available when connecting to a server running in TUI+server mode (--ui-server).
	*
	* @param sessionId - The ID of the session to display in the TUI
	* @returns A promise that resolves when the session is switched
	* @throws Error if the client is not connected or if the operation fails
	*
	* @example
	* ```typescript
	* // Switch the TUI to display a specific session
	* await client.setForegroundSessionId("session-123");
	* ```
	*/
	async setForegroundSessionId(sessionId) {
		if (!this.connection) throw new Error("Client not connected");
		const result = await this.connection.sendRequest("session.setForeground", { sessionId });
		if (!result.success) throw new Error(result.error || "Failed to set foreground session");
	}
	on(eventTypeOrHandler, handler) {
		if (typeof eventTypeOrHandler === "string" && handler) {
			const eventType = eventTypeOrHandler;
			if (!this.typedLifecycleHandlers.has(eventType)) this.typedLifecycleHandlers.set(eventType, /* @__PURE__ */ new Set());
			const storedHandler = handler;
			this.typedLifecycleHandlers.get(eventType).add(storedHandler);
			return () => {
				const handlers = this.typedLifecycleHandlers.get(eventType);
				if (handlers) handlers.delete(storedHandler);
			};
		}
		const wildcardHandler = eventTypeOrHandler;
		this.sessionLifecycleHandlers.add(wildcardHandler);
		return () => {
			this.sessionLifecycleHandlers.delete(wildcardHandler);
		};
	}
	/**
	* Start the CLI server process
	*/
	async startCLIServer() {
		return new Promise((resolve, reject) => {
			this.stderrBuffer = "";
			const args = [
				...this.options.cliArgs,
				"--headless",
				"--no-auto-update",
				"--log-level",
				this.options.logLevel
			];
			if (this.options.useStdio) args.push("--stdio");
			else if (this.options.port > 0) args.push("--port", this.options.port.toString());
			if (this.options.githubToken) args.push("--auth-token-env", "COPILOT_SDK_AUTH_TOKEN");
			if (!this.options.useLoggedInUser) args.push("--no-auto-login");
			const envWithoutNodeDebug = { ...this.options.env };
			delete envWithoutNodeDebug.NODE_DEBUG;
			if (this.options.githubToken) envWithoutNodeDebug.COPILOT_SDK_AUTH_TOKEN = this.options.githubToken;
			if (!existsSync(this.options.cliPath)) throw new Error(`Copilot CLI not found at ${this.options.cliPath}. Ensure @github/copilot is installed.`);
			const stdioConfig = this.options.useStdio ? [
				"pipe",
				"pipe",
				"pipe"
			] : [
				"ignore",
				"pipe",
				"pipe"
			];
			if (this.options.cliPath.endsWith(".js")) this.cliProcess = spawn(getNodeExecPath(), [this.options.cliPath, ...args], {
				stdio: stdioConfig,
				cwd: this.options.cwd,
				env: envWithoutNodeDebug,
				windowsHide: true
			});
			else this.cliProcess = spawn(this.options.cliPath, args, {
				stdio: stdioConfig,
				cwd: this.options.cwd,
				env: envWithoutNodeDebug,
				windowsHide: true
			});
			let stdout = "";
			let resolved = false;
			if (this.options.useStdio) {
				resolved = true;
				resolve();
			} else this.cliProcess.stdout?.on("data", (data) => {
				stdout += data.toString();
				const match = stdout.match(/listening on port (\d+)/i);
				if (match && !resolved) {
					this.actualPort = parseInt(match[1], 10);
					resolved = true;
					resolve();
				}
			});
			this.cliProcess.stderr?.on("data", (data) => {
				this.stderrBuffer += data.toString();
				const lines = data.toString().split("\n");
				for (const line of lines) if (line.trim()) process.stderr.write(`[CLI subprocess] ${line}
`);
			});
			this.cliProcess.on("error", (error) => {
				if (!resolved) {
					resolved = true;
					const stderrOutput = this.stderrBuffer.trim();
					if (stderrOutput) reject(/* @__PURE__ */ new Error(`Failed to start CLI server: ${error.message}
stderr: ${stderrOutput}`));
					else reject(/* @__PURE__ */ new Error(`Failed to start CLI server: ${error.message}`));
				}
			});
			this.processExitPromise = new Promise((_, rejectProcessExit) => {
				this.cliProcess.on("exit", (code) => {
					setTimeout(() => {
						const stderrOutput = this.stderrBuffer.trim();
						if (stderrOutput) rejectProcessExit(/* @__PURE__ */ new Error(`CLI server exited with code ${code}
stderr: ${stderrOutput}`));
						else rejectProcessExit(/* @__PURE__ */ new Error(`CLI server exited unexpectedly with code ${code}`));
					}, 50);
				});
			});
			this.processExitPromise.catch(() => {});
			this.cliProcess.on("exit", (code) => {
				if (!resolved) {
					resolved = true;
					const stderrOutput = this.stderrBuffer.trim();
					if (stderrOutput) reject(/* @__PURE__ */ new Error(`CLI server exited with code ${code}
stderr: ${stderrOutput}`));
					else reject(/* @__PURE__ */ new Error(`CLI server exited with code ${code}`));
				} else if (this.options.autoRestart && this.state === "connected") this.reconnect();
			});
			setTimeout(() => {
				if (!resolved) {
					resolved = true;
					reject(/* @__PURE__ */ new Error("Timeout waiting for CLI server to start"));
				}
			}, 1e4);
		});
	}
	/**
	* Connect to the CLI server (via socket or stdio)
	*/
	async connectToServer() {
		if (this.options.isChildProcess) return this.connectToParentProcessViaStdio();
		else if (this.options.useStdio) return this.connectToChildProcessViaStdio();
		else return this.connectViaTcp();
	}
	/**
	* Connect to child via stdio pipes
	*/
	async connectToChildProcessViaStdio() {
		if (!this.cliProcess) throw new Error("CLI process not started");
		this.cliProcess.stdin?.on("error", (err) => {
			if (!this.forceStopping) throw err;
		});
		this.connection = (0, import_node.createMessageConnection)(new import_node.StreamMessageReader(this.cliProcess.stdout), new import_node.StreamMessageWriter(this.cliProcess.stdin));
		this.attachConnectionHandlers();
		this.connection.listen();
	}
	/**
	* Connect to parent via stdio pipes
	*/
	async connectToParentProcessViaStdio() {
		if (this.cliProcess) throw new Error("CLI child process was unexpectedly started in parent process mode");
		this.connection = (0, import_node.createMessageConnection)(new import_node.StreamMessageReader(process.stdin), new import_node.StreamMessageWriter(process.stdout));
		this.attachConnectionHandlers();
		this.connection.listen();
	}
	/**
	* Connect to the CLI server via TCP socket
	*/
	async connectViaTcp() {
		if (!this.actualPort) throw new Error("Server port not available");
		return new Promise((resolve, reject) => {
			this.socket = new Socket();
			this.socket.connect(this.actualPort, this.actualHost, () => {
				this.connection = (0, import_node.createMessageConnection)(new import_node.StreamMessageReader(this.socket), new import_node.StreamMessageWriter(this.socket));
				this.attachConnectionHandlers();
				this.connection.listen();
				resolve();
			});
			this.socket.on("error", (error) => {
				reject(/* @__PURE__ */ new Error(`Failed to connect to CLI server: ${error.message}`));
			});
		});
	}
	attachConnectionHandlers() {
		if (!this.connection) return;
		this.connection.onNotification("session.event", (notification) => {
			this.handleSessionEventNotification(notification);
		});
		this.connection.onNotification("session.lifecycle", (notification) => {
			this.handleSessionLifecycleNotification(notification);
		});
		this.connection.onRequest("tool.call", async (params) => await this.handleToolCallRequestV2(params));
		this.connection.onRequest("permission.request", async (params) => await this.handlePermissionRequestV2(params));
		this.connection.onRequest("userInput.request", async (params) => await this.handleUserInputRequest(params));
		this.connection.onRequest("hooks.invoke", async (params) => await this.handleHooksInvoke(params));
		this.connection.onClose(() => {
			if (this.state === "connected" && this.options.autoRestart) this.reconnect();
		});
		this.connection.onError((_error) => {});
	}
	handleSessionEventNotification(notification) {
		if (typeof notification !== "object" || !notification || !("sessionId" in notification) || typeof notification.sessionId !== "string" || !("event" in notification)) return;
		const session = this.sessions.get(notification.sessionId);
		if (session) session._dispatchEvent(notification.event);
	}
	handleSessionLifecycleNotification(notification) {
		if (typeof notification !== "object" || !notification || !("type" in notification) || typeof notification.type !== "string" || !("sessionId" in notification) || typeof notification.sessionId !== "string") return;
		const event = notification;
		const typedHandlers = this.typedLifecycleHandlers.get(event.type);
		if (typedHandlers) for (const handler of typedHandlers) try {
			handler(event);
		} catch {}
		for (const handler of this.sessionLifecycleHandlers) try {
			handler(event);
		} catch {}
	}
	async handleUserInputRequest(params) {
		if (!params || typeof params.sessionId !== "string" || typeof params.question !== "string") throw new Error("Invalid user input request payload");
		const session = this.sessions.get(params.sessionId);
		if (!session) throw new Error(`Session not found: ${params.sessionId}`);
		return await session._handleUserInputRequest({
			question: params.question,
			choices: params.choices,
			allowFreeform: params.allowFreeform
		});
	}
	async handleHooksInvoke(params) {
		if (!params || typeof params.sessionId !== "string" || typeof params.hookType !== "string") throw new Error("Invalid hooks invoke payload");
		const session = this.sessions.get(params.sessionId);
		if (!session) throw new Error(`Session not found: ${params.sessionId}`);
		return { output: await session._handleHooksInvoke(params.hookType, params.input) };
	}
	/**
	* Handles a v2-style tool.call RPC request from the server.
	* Looks up the session and tool handler, executes it, and returns the result
	* in the v2 response format.
	*/
	async handleToolCallRequestV2(params) {
		if (!params || typeof params.sessionId !== "string" || typeof params.toolCallId !== "string" || typeof params.toolName !== "string") throw new Error("Invalid tool call payload");
		const session = this.sessions.get(params.sessionId);
		if (!session) throw new Error(`Unknown session ${params.sessionId}`);
		const handler = session.getToolHandler(params.toolName);
		if (!handler) return { result: {
			textResultForLlm: `Tool '${params.toolName}' is not supported by this client instance.`,
			resultType: "failure",
			error: `tool '${params.toolName}' not supported`,
			toolTelemetry: {}
		} };
		try {
			const invocation = {
				sessionId: params.sessionId,
				toolCallId: params.toolCallId,
				toolName: params.toolName,
				arguments: params.arguments
			};
			const result = await handler(params.arguments, invocation);
			return { result: this.normalizeToolResultV2(result) };
		} catch (error) {
			return { result: {
				textResultForLlm: "Invoking this tool produced an error. Detailed information is not available.",
				resultType: "failure",
				error: error instanceof Error ? error.message : String(error),
				toolTelemetry: {}
			} };
		}
	}
	/**
	* Handles a v2-style permission.request RPC request from the server.
	*/
	async handlePermissionRequestV2(params) {
		if (!params || typeof params.sessionId !== "string" || !params.permissionRequest) throw new Error("Invalid permission request payload");
		const session = this.sessions.get(params.sessionId);
		if (!session) throw new Error(`Session not found: ${params.sessionId}`);
		try {
			return { result: await session._handlePermissionRequestV2(params.permissionRequest) };
		} catch (_error) {
			return { result: { kind: "denied-no-approval-rule-and-could-not-request-from-user" } };
		}
	}
	normalizeToolResultV2(result) {
		if (result === void 0 || result === null) return {
			textResultForLlm: "Tool returned no result",
			resultType: "failure",
			error: "tool returned no result",
			toolTelemetry: {}
		};
		if (this.isToolResultObject(result)) return result;
		return {
			textResultForLlm: typeof result === "string" ? result : JSON.stringify(result),
			resultType: "success",
			toolTelemetry: {}
		};
	}
	isToolResultObject(value) {
		return typeof value === "object" && value !== null && "textResultForLlm" in value && typeof value.textResultForLlm === "string" && "resultType" in value;
	}
	/**
	* Attempt to reconnect to the server
	*/
	async reconnect() {
		this.state = "disconnected";
		try {
			await this.stop();
			await this.start();
		} catch (_error) {}
	}
};

//#endregion
//#region ../../node_modules/.pnpm/tinyexec@1.0.2/node_modules/tinyexec/dist/main.js
var l = Object.create;
var u = Object.defineProperty;
var d = Object.getOwnPropertyDescriptor;
var f$1 = Object.getOwnPropertyNames;
var p = Object.getPrototypeOf;
var m = Object.prototype.hasOwnProperty;
var h = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var g = (e, t, n, r) => {
	if (t && typeof t === "object" || typeof t === "function") for (var i = f$1(t), a = 0, o = i.length, s; a < o; a++) {
		s = i[a];
		if (!m.call(e, s) && s !== n) u(e, s, {
			get: ((e) => t[e]).bind(null, s),
			enumerable: !(r = d(t, s)) || r.enumerable
		});
	}
	return e;
};
var _ = (e, t, n) => (n = e != null ? l(p(e)) : {}, g(t || !e || !e.__esModule ? u(n, "default", {
	value: e,
	enumerable: true
}) : n, e));
var v = /* @__PURE__ */ createRequire$1(import.meta.url);
const y = /^path$/i;
const b = {
	key: "PATH",
	value: ""
};
function x(e) {
	for (const t in e) {
		if (!Object.prototype.hasOwnProperty.call(e, t) || !y.test(t)) continue;
		const n = e[t];
		if (!n) return b;
		return {
			key: t,
			value: n
		};
	}
	return b;
}
function S(e, t) {
	const i = t.value.split(delimiter);
	let o = e;
	let s;
	do {
		i.push(resolve(o, "node_modules", ".bin"));
		s = o;
		o = dirname(o);
	} while (o !== s);
	return {
		key: t.key,
		value: i.join(delimiter)
	};
}
function C(e, t) {
	const n = {
		...process.env,
		...t
	};
	const r = S(e, x(n));
	n[r.key] = r.value;
	return n;
}
const w = (e) => {
	let t = e.length;
	const n = new PassThrough();
	const r = () => {
		if (--t === 0) n.emit("end");
	};
	for (const t of e) {
		t.pipe(n, { end: false });
		t.on("end", r);
	}
	return n;
};
var T = h((exports, t) => {
	t.exports = a;
	a.sync = o;
	var n = v("fs");
	function r(e, t) {
		var n = t.pathExt !== void 0 ? t.pathExt : process.env.PATHEXT;
		if (!n) return true;
		n = n.split(";");
		if (n.indexOf("") !== -1) return true;
		for (var r = 0; r < n.length; r++) {
			var i = n[r].toLowerCase();
			if (i && e.substr(-i.length).toLowerCase() === i) return true;
		}
		return false;
	}
	function i(e, t, n) {
		if (!e.isSymbolicLink() && !e.isFile()) return false;
		return r(t, n);
	}
	function a(e, t, r) {
		n.stat(e, function(n, a) {
			r(n, n ? false : i(a, e, t));
		});
	}
	function o(e, t) {
		return i(n.statSync(e), e, t);
	}
});
var E = h((exports, t) => {
	t.exports = r;
	r.sync = i;
	var n = v("fs");
	function r(e, t, r) {
		n.stat(e, function(e, n) {
			r(e, e ? false : a(n, t));
		});
	}
	function i(e, t) {
		return a(n.statSync(e), t);
	}
	function a(e, t) {
		return e.isFile() && o(e, t);
	}
	function o(e, t) {
		var n = e.mode;
		var r = e.uid;
		var i = e.gid;
		var a = t.uid !== void 0 ? t.uid : process.getuid && process.getuid();
		var o = t.gid !== void 0 ? t.gid : process.getgid && process.getgid();
		var s = parseInt("100", 8);
		var c = parseInt("010", 8);
		var l = parseInt("001", 8);
		var u = s | c;
		return n & l || n & c && i === o || n & s && r === a || n & u && a === 0;
	}
});
var D = h((exports, t) => {
	v("fs");
	var r;
	if (process.platform === "win32" || global.TESTING_WINDOWS) r = T();
	else r = E();
	t.exports = i;
	i.sync = a;
	function i(e, t, n) {
		if (typeof t === "function") {
			n = t;
			t = {};
		}
		if (!n) {
			if (typeof Promise !== "function") throw new TypeError("callback not provided");
			return new Promise(function(n, r) {
				i(e, t || {}, function(e, t) {
					if (e) r(e);
					else n(t);
				});
			});
		}
		r(e, t || {}, function(e, r) {
			if (e) {
				if (e.code === "EACCES" || t && t.ignoreErrors) {
					e = null;
					r = false;
				}
			}
			n(e, r);
		});
	}
	function a(e, t) {
		try {
			return r.sync(e, t || {});
		} catch (e) {
			if (t && t.ignoreErrors || e.code === "EACCES") return false;
			else throw e;
		}
	}
});
var O = h((exports, t) => {
	const n = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
	const r = v("path");
	const i = n ? ";" : ":";
	const a = D();
	const o = (e) => Object.assign(/* @__PURE__ */ new Error(`not found: ${e}`), { code: "ENOENT" });
	const s = (e, t) => {
		const r = t.colon || i;
		const a = e.match(/\//) || n && e.match(/\\/) ? [""] : [...n ? [process.cwd()] : [], ...(t.path || process.env.PATH || "").split(r)];
		const o = n ? t.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
		const s = n ? o.split(r) : [""];
		if (n) {
			if (e.indexOf(".") !== -1 && s[0] !== "") s.unshift("");
		}
		return {
			pathEnv: a,
			pathExt: s,
			pathExtExe: o
		};
	};
	const c = (e, t, n) => {
		if (typeof t === "function") {
			n = t;
			t = {};
		}
		if (!t) t = {};
		const { pathEnv: i, pathExt: c, pathExtExe: l } = s(e, t);
		const u = [];
		const d = (n) => new Promise((a, s) => {
			if (n === i.length) return t.all && u.length ? a(u) : s(o(e));
			const c = i[n];
			const l = /^".*"$/.test(c) ? c.slice(1, -1) : c;
			const d = r.join(l, e);
			a(f(!l && /^\.[\\\/]/.test(e) ? e.slice(0, 2) + d : d, n, 0));
		});
		const f = (e, n, r) => new Promise((i, o) => {
			if (r === c.length) return i(d(n + 1));
			const s = c[r];
			a(e + s, { pathExt: l }, (a, o) => {
				if (!a && o) if (t.all) u.push(e + s);
				else return i(e + s);
				return i(f(e, n, r + 1));
			});
		});
		return n ? d(0).then((e) => n(null, e), n) : d(0);
	};
	const l = (e, t) => {
		t = t || {};
		const { pathEnv: n, pathExt: i, pathExtExe: c } = s(e, t);
		const l = [];
		for (let o = 0; o < n.length; o++) {
			const s = n[o];
			const u = /^".*"$/.test(s) ? s.slice(1, -1) : s;
			const d = r.join(u, e);
			const f = !u && /^\.[\\\/]/.test(e) ? e.slice(0, 2) + d : d;
			for (let e = 0; e < i.length; e++) {
				const n = f + i[e];
				try {
					if (a.sync(n, { pathExt: c })) if (t.all) l.push(n);
					else return n;
				} catch (e) {}
			}
		}
		if (t.all && l.length) return l;
		if (t.nothrow) return null;
		throw o(e);
	};
	t.exports = c;
	c.sync = l;
});
var k = h((exports, t) => {
	const n = (e = {}) => {
		const t = e.env || process.env;
		if ((e.platform || process.platform) !== "win32") return "PATH";
		return Object.keys(t).reverse().find((e) => e.toUpperCase() === "PATH") || "Path";
	};
	t.exports = n;
	t.exports.default = n;
});
var A = h((exports, t) => {
	const n = v("path");
	const r = O();
	const i = k();
	function a(e, t) {
		const a = e.options.env || process.env;
		const o = process.cwd();
		const s = e.options.cwd != null;
		const c = s && process.chdir !== void 0 && !process.chdir.disabled;
		if (c) try {
			process.chdir(e.options.cwd);
		} catch (e) {}
		let l;
		try {
			l = r.sync(e.command, {
				path: a[i({ env: a })],
				pathExt: t ? n.delimiter : void 0
			});
		} catch (e) {} finally {
			if (c) process.chdir(o);
		}
		if (l) l = n.resolve(s ? e.options.cwd : "", l);
		return l;
	}
	function o(e) {
		return a(e) || a(e, true);
	}
	t.exports = o;
});
var j = h((exports, t) => {
	const n = /([()\][%!^"`<>&|;, *?])/g;
	function r(e) {
		e = e.replace(n, "^$1");
		return e;
	}
	function i(e, t) {
		e = `${e}`;
		e = e.replace(/(\\*)"/g, "$1$1\\\"");
		e = e.replace(/(\\*)$/, "$1$1");
		e = `"${e}"`;
		e = e.replace(n, "^$1");
		if (t) e = e.replace(n, "^$1");
		return e;
	}
	t.exports.command = r;
	t.exports.argument = i;
});
var M = h((exports, t) => {
	t.exports = /^#!(.*)/;
});
var N = h((exports, t) => {
	const n = M();
	t.exports = (e = "") => {
		const t = e.match(n);
		if (!t) return null;
		const [r, i] = t[0].replace(/#! ?/, "").split(" ");
		const a = r.split("/").pop();
		if (a === "env") return i;
		return i ? `${a} ${i}` : a;
	};
});
var P = h((exports, t) => {
	const n = v("fs");
	const r = N();
	function i(e) {
		const t = 150;
		const i = Buffer.alloc(t);
		let a;
		try {
			a = n.openSync(e, "r");
			n.readSync(a, i, 0, t, 0);
			n.closeSync(a);
		} catch (e) {}
		return r(i.toString());
	}
	t.exports = i;
});
var F = h((exports, t) => {
	const n = v("path");
	const r = A();
	const i = j();
	const a = P();
	const o = process.platform === "win32";
	const s = /\.(?:com|exe)$/i;
	const c = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
	function l(e) {
		e.file = r(e);
		const t = e.file && a(e.file);
		if (t) {
			e.args.unshift(e.file);
			e.command = t;
			return r(e);
		}
		return e.file;
	}
	function u(e) {
		if (!o) return e;
		const t = l(e);
		const r = !s.test(t);
		if (e.options.forceShell || r) {
			const r = c.test(t);
			e.command = n.normalize(e.command);
			e.command = i.command(e.command);
			e.args = e.args.map((e) => i.argument(e, r));
			e.args = [
				"/d",
				"/s",
				"/c",
				`"${[e.command].concat(e.args).join(" ")}"`
			];
			e.command = process.env.comspec || "cmd.exe";
			e.options.windowsVerbatimArguments = true;
		}
		return e;
	}
	function d(e, t, n) {
		if (t && !Array.isArray(t)) {
			n = t;
			t = null;
		}
		t = t ? t.slice(0) : [];
		n = Object.assign({}, n);
		const r = {
			command: e,
			args: t,
			options: n,
			file: void 0,
			original: {
				command: e,
				args: t
			}
		};
		return n.shell ? r : u(r);
	}
	t.exports = d;
});
var I = h((exports, t) => {
	const n = process.platform === "win32";
	function r(e, t) {
		return Object.assign(/* @__PURE__ */ new Error(`${t} ${e.command} ENOENT`), {
			code: "ENOENT",
			errno: "ENOENT",
			syscall: `${t} ${e.command}`,
			path: e.command,
			spawnargs: e.args
		});
	}
	function i(e, t) {
		if (!n) return;
		const r = e.emit;
		e.emit = function(n, i) {
			if (n === "exit") {
				const n = a(i, t, "spawn");
				if (n) return r.call(e, "error", n);
			}
			return r.apply(e, arguments);
		};
	}
	function a(e, t) {
		if (n && e === 1 && !t.file) return r(t.original, "spawn");
		return null;
	}
	function o(e, t) {
		if (n && e === 1 && !t.file) return r(t.original, "spawnSync");
		return null;
	}
	t.exports = {
		hookChildProcess: i,
		verifyENOENT: a,
		verifyENOENTSync: o,
		notFoundError: r
	};
});
var R = _(h((exports, t) => {
	const n = v("child_process");
	const r = F();
	const i = I();
	function a(e, t, a) {
		const o = r(e, t, a);
		const s = n.spawn(o.command, o.args, o.options);
		i.hookChildProcess(s, o);
		return s;
	}
	function o(e, t, a) {
		const o = r(e, t, a);
		const s = n.spawnSync(o.command, o.args, o.options);
		s.error = s.error || i.verifyENOENTSync(s.status, o);
		return s;
	}
	t.exports = a;
	t.exports.spawn = a;
	t.exports.sync = o;
	t.exports._parse = r;
	t.exports._enoent = i;
})(), 1);
var z = class extends Error {
	result;
	output;
	get exitCode() {
		if (this.result.exitCode !== null) return this.result.exitCode;
	}
	constructor(e, t) {
		super(`Process exited with non-zero status (${e.exitCode})`);
		this.result = e;
		this.output = t;
	}
};
const B = {
	timeout: void 0,
	persist: false
};
const V = { windowsHide: true };
function H(e, t) {
	return {
		command: normalize(e),
		args: t ?? []
	};
}
function U(e) {
	const t = new AbortController();
	for (const n of e) {
		if (n.aborted) {
			t.abort();
			return n;
		}
		const e = () => {
			t.abort(n.reason);
		};
		n.addEventListener("abort", e, { signal: t.signal });
	}
	return t.signal;
}
async function W(e) {
	let t = "";
	for await (const n of e) t += n.toString();
	return t;
}
var G = class {
	_process;
	_aborted = false;
	_options;
	_command;
	_args;
	_resolveClose;
	_processClosed;
	_thrownError;
	get process() {
		return this._process;
	}
	get pid() {
		return this._process?.pid;
	}
	get exitCode() {
		if (this._process && this._process.exitCode !== null) return this._process.exitCode;
	}
	constructor(e, t, n) {
		this._options = {
			...B,
			...n
		};
		this._command = e;
		this._args = t ?? [];
		this._processClosed = new Promise((e) => {
			this._resolveClose = e;
		});
	}
	kill(e) {
		return this._process?.kill(e) === true;
	}
	get aborted() {
		return this._aborted;
	}
	get killed() {
		return this._process?.killed === true;
	}
	pipe(e, t, n) {
		return q(e, t, {
			...n,
			stdin: this
		});
	}
	async *[Symbol.asyncIterator]() {
		const e = this._process;
		if (!e) return;
		const t = [];
		if (this._streamErr) t.push(this._streamErr);
		if (this._streamOut) t.push(this._streamOut);
		const n = w(t);
		const r = f.createInterface({ input: n });
		for await (const e of r) yield e.toString();
		await this._processClosed;
		e.removeAllListeners();
		if (this._thrownError) throw this._thrownError;
		if (this._options?.throwOnError && this.exitCode !== 0 && this.exitCode !== void 0) throw new z(this);
	}
	async _waitForOutput() {
		const e = this._process;
		if (!e) throw new Error("No process was started");
		const [t, n] = await Promise.all([this._streamOut ? W(this._streamOut) : "", this._streamErr ? W(this._streamErr) : ""]);
		await this._processClosed;
		if (this._options?.stdin) await this._options.stdin;
		e.removeAllListeners();
		if (this._thrownError) throw this._thrownError;
		const r = {
			stderr: n,
			stdout: t,
			exitCode: this.exitCode
		};
		if (this._options.throwOnError && this.exitCode !== 0 && this.exitCode !== void 0) throw new z(this, r);
		return r;
	}
	then(e, t) {
		return this._waitForOutput().then(e, t);
	}
	_streamOut;
	_streamErr;
	spawn() {
		const e = cwd();
		const n = this._options;
		const r = {
			...V,
			...n.nodeOptions
		};
		const i = [];
		this._resetState();
		if (n.timeout !== void 0) i.push(AbortSignal.timeout(n.timeout));
		if (n.signal !== void 0) i.push(n.signal);
		if (n.persist === true) r.detached = true;
		if (i.length > 0) r.signal = U(i);
		r.env = C(e, r.env);
		const { command: a, args: s } = H(this._command, this._args);
		const c = (0, R._parse)(a, s, r);
		const l = spawn(c.command, c.args, c.options);
		if (l.stderr) this._streamErr = l.stderr;
		if (l.stdout) this._streamOut = l.stdout;
		this._process = l;
		l.once("error", this._onError);
		l.once("close", this._onClose);
		if (n.stdin !== void 0 && l.stdin && n.stdin.process) {
			const { stdout: e } = n.stdin.process;
			if (e) e.pipe(l.stdin);
		}
	}
	_resetState() {
		this._aborted = false;
		this._processClosed = new Promise((e) => {
			this._resolveClose = e;
		});
		this._thrownError = void 0;
	}
	_onError = (e) => {
		if (e.name === "AbortError" && (!(e.cause instanceof Error) || e.cause.name !== "TimeoutError")) {
			this._aborted = true;
			return;
		}
		this._thrownError = e;
	};
	_onClose = () => {
		if (this._resolveClose) this._resolveClose();
	};
};
const K = (e, t, n) => {
	const r = new G(e, t, n);
	r.spawn();
	return r;
};
const q = K;

//#endregion
//#region src/agents/copilot/client.ts
const COPILOT_CLI_PACKAGE = "@github/copilot";
const COPILOT_CLI_VERSION = "1.0.2";
function prependPath(entries) {
	const current = process$1.env.PATH ?? "";
	return [...entries, current].filter(Boolean).join(path.delimiter);
}
async function getNpmGlobalBin() {
	const result = await K("npm", ["prefix", "-g"], { throwOnError: true });
	return path.join(result.stdout.trim(), "bin");
}
function getCopilotExecutableName() {
	return process$1.platform === "win32" ? "copilot.cmd" : "copilot";
}
async function isCopilotCliAvailable(command = "copilot") {
	try {
		return (await K(command, ["--version"], { throwOnError: false })).exitCode === 0;
	} catch {
		return false;
	}
}
async function resolveCopilotCliPath() {
	const npmGlobalBin = await getNpmGlobalBin();
	const npmInstalledCliPath = path.join(npmGlobalBin, getCopilotExecutableName());
	if (existsSync(npmInstalledCliPath) && await isCopilotCliAvailable(npmInstalledCliPath)) return npmInstalledCliPath;
	const whichResult = await K("which", ["copilot"], { throwOnError: false });
	if (whichResult.exitCode === 0) {
		const resolvedPath = whichResult.stdout.trim();
		if (resolvedPath && await isCopilotCliAvailable(resolvedPath)) return resolvedPath;
	}
	if (await isCopilotCliAvailable("copilot")) return "copilot";
	return null;
}
async function ensureCopilotCliInstalled() {
	consola.info("Resolving GitHub Copilot CLI path...");
	let cliPath = await resolveCopilotCliPath();
	if (cliPath) {
		consola.info(`Using GitHub Copilot CLI at: ${cliPath}`);
		return cliPath;
	}
	consola.info(`GitHub Copilot CLI ${COPILOT_CLI_VERSION} not found. Installing ${COPILOT_CLI_PACKAGE}@${COPILOT_CLI_VERSION} globally...`);
	await K("npm", [
		"install",
		"-g",
		`${COPILOT_CLI_PACKAGE}@${COPILOT_CLI_VERSION}`
	], {
		throwOnError: true,
		nodeOptions: { env: {
			...process$1.env,
			npm_config_ignore_scripts: "false"
		} }
	});
	const npmGlobalBin = await getNpmGlobalBin();
	process$1.env.PATH = prependPath([npmGlobalBin]);
	consola.info(`Prepended npm global bin to PATH: ${npmGlobalBin}`);
	cliPath = await resolveCopilotCliPath();
	if (!cliPath) throw new Error(`GitHub Copilot CLI ${COPILOT_CLI_VERSION} is required but was not found after installation attempt.`);
	consola.info(`GitHub Copilot CLI installed and resolved at: ${cliPath}`);
	return cliPath;
}
function resolveCopilotAgentToken() {
	return getClank8yRuntimeContext().auth.copilotToken;
}
function resolveRequestPath(rawPath) {
	return rawPath ? path.resolve(process$1.cwd(), rawPath) : void 0;
}
const copilotPermissionHandler = (request) => {
	if (request.kind === "mcp" || request.kind === "custom-tool") return { kind: "approved" };
	if (request.kind === "read") {
		const targetPath = resolveRequestPath("path" in request && typeof request.path === "string" ? request.path : void 0);
		if (targetPath && isWithinClank8yArtifacts(targetPath)) return { kind: "approved" };
		return {
			kind: "denied-by-rules",
			rules: ["Native file reads are only allowed inside .clank8y."]
		};
	}
	if (request.kind === "write") {
		const targetPath = resolveRequestPath("fileName" in request && typeof request.fileName === "string" ? request.fileName : void 0);
		if (targetPath && isWithinClank8yArtifacts(targetPath)) return { kind: "approved" };
		return {
			kind: "denied-by-rules",
			rules: ["Native file writes are only allowed inside .clank8y."]
		};
	}
	if (request.kind === "shell") return {
		kind: "denied-by-rules",
		rules: ["Shell is currently disabled. When enabled for a mode later, commands must stay scoped to .clank8y."]
	};
	if (request.kind === "url") return {
		kind: "denied-by-rules",
		rules: ["URL access is disabled."]
	};
	return {
		kind: "denied-by-rules",
		rules: ["Only MCP, mode selection, and native file access inside .clank8y are allowed."]
	};
};
let _client = null;
async function getCopilotClient() {
	if (_client) return _client;
	consola.info("Preparing GitHub Copilot agent");
	const cliPath = await ensureCopilotCliInstalled();
	const copilotAgentToken = resolveCopilotAgentToken();
	consola.info("Using explicit GitHub token for Copilot SDK authentication");
	const client = new CopilotClient({
		cliPath,
		githubToken: copilotAgentToken,
		useLoggedInUser: false
	});
	await client.start();
	if (!(await client.getAuthStatus()).isAuthenticated) throw new Error("Copilot SDK is not authenticated. Ensure the token is a Copilot-entitled user token (github_pat_/gho_/ghu_) and provided via COPILOT_GITHUB_TOKEN.");
	_client = client;
	return client;
}
async function getCopilotModelIds() {
	const modelIds = (await (await getCopilotClient()).listModels()).map((model) => model.id);
	if (!getClank8yRuntimeContext().options?.suppressModelListing) consola.log(`Available models:\n${modelIds.map((modelId) => `  • ${modelId}`).join("\n")}`);
	return modelIds;
}
async function ensureCopilotModelAvailable(model) {
	const modelIds = await getCopilotModelIds();
	if (!modelIds.includes(model)) throw new Error(`Configured model '${model}' is not available for this token/account in the GitHub Copilot CLI. Available models: ${modelIds.join(", ")}.`);
}

//#endregion
//#region src/mcp/index.ts
async function startAll(servers) {
	const results = {};
	for (const [name, server] of Object.entries(servers)) if (server.serverType === "http") {
		const { url, toolNames } = await server.start();
		results[name] = {
			type: "http",
			url,
			toolNames
		};
	} else {
		const { command, args, toolNames } = await server.start();
		results[name] = {
			type: "stdio",
			command,
			args,
			toolNames
		};
	}
	return results;
}
async function stopAll(servers) {
	await Promise.all(Object.values(servers).map((s) => s.stop()));
}

//#endregion
//#region src/mcp/adapters/copilot.ts
/**
* Translates a map of started MCP servers into the session config format
* expected by the Copilot SDK's `createSession({ mcpServers })`.
*
* - HTTP servers  → `{ type: 'http', url, tools, timeout }`
* - Stdio servers → `{ type: 'stdio', command, args, tools, timeout }`
*
* Servers with an empty `allowedTools` list are skipped with a warning.
* Each server's `allowedTools` is forwarded directly as the SDK-level tool allowlist.
*
* @param servers - Map of MCP server instances (for allowedTools access)
* @param startResults - Start results returned by `startAll(servers)`
* @param options - Adapter options (e.g. per-tool timeout)
*/
function toCopilotMCPServersConfig(servers, startResults, options) {
	const config = {};
	for (const [name, server] of Object.entries(servers)) {
		const { allowedTools } = server;
		if (allowedTools.length === 0) {
			consola.warn(`MCP server "${name}" has an empty allowedTools list — skipping.`);
			continue;
		}
		if (allowedTools[0] !== "*") consola.info(`MCP server "${name}" restricted to tools: [${allowedTools.join(", ")}]`);
		const result = startResults[name];
		if (!result) continue;
		if (result.type === "http") {
			const { url } = result;
			config[name] = {
				type: "http",
				url,
				tools: allowedTools,
				timeout: options.timeout
			};
		} else {
			const { command, args } = result;
			config[name] = {
				type: "stdio",
				command,
				args,
				tools: allowedTools,
				timeout: options.timeout
			};
		}
	}
	return config;
}

//#endregion
//#region src/agents/copilot/review.ts
const COPILOT_REVIEW_EXCLUDED_TOOLS = [
	"bash",
	"create",
	"github-say-hello",
	"glob",
	"list_agents",
	"list_bash",
	"read_agent",
	"read_bash",
	"sql",
	"stop_bash",
	"task",
	"web_fetch",
	"write_bash"
];
async function runCopilotReview(prompt, profile, mcps) {
	const client = await getCopilotClient();
	const thoughtStarts = /* @__PURE__ */ new Map();
	const totals = {
		inputTokens: 0,
		outputTokens: 0,
		cacheReadTokens: 0,
		cacheWriteTokens: 0,
		cost: 0
	};
	const servers = mcps;
	const startResults = await startAll(servers);
	try {
		const session = await client.createSession({
			excludedTools: COPILOT_REVIEW_EXCLUDED_TOOLS,
			model: profile.model,
			onPermissionRequest: copilotPermissionHandler,
			mcpServers: toCopilotMCPServersConfig(servers, startResults, { timeout: profile.timeOutMs })
		});
		session.on("assistant.turn_start", (event) => {
			thoughtStarts.set(event.data.turnId, Date.now());
		});
		session.on("assistant.turn_end", (event) => {
			const thoughtStart = thoughtStarts.get(event.data.turnId);
			thoughtStarts.delete(event.data.turnId);
			if (thoughtStart) consola.info(`thought for ${((Date.now() - thoughtStart) / 1e3).toFixed(1)}s`);
		});
		session.on("tool.execution_start", (event) => {
			const { toolName, mcpServerName, mcpToolName, arguments: args } = event.data;
			const label = mcpServerName ? `${mcpServerName}/${mcpToolName ?? toolName}` : toolName;
			if (label === "report_intent") {
				const intent = args?.intent;
				if (!intent) return;
				consola.info(`🤖 clanking next... ${intent}`);
				return;
			}
			consola.info(`→ tool: ${label}${args !== void 0 ? ` ${JSON.stringify(args)}` : ""}`);
		});
		session.on("assistant.message", (event) => {
			if (event.data.reasoningText) logAgentMessage({
				agent: COPILOT_AGENT_NAME,
				model: profile.model
			}, event.data.reasoningText);
		});
		session.on("assistant.usage", (usage) => {
			totals.inputTokens += usage.data.inputTokens ?? 0;
			totals.outputTokens += usage.data.outputTokens ?? 0;
			totals.cacheReadTokens += usage.data.cacheReadTokens ?? 0;
			totals.cacheWriteTokens += usage.data.cacheWriteTokens ?? 0;
			totals.cost += usage.data.cost ?? 0;
		});
		try {
			consola.info("clank8y getting to work...");
			const response = await session.sendAndWait({ prompt }, profile.timeOutMs);
			if (response?.data.content) logAgentMessage({
				agent: COPILOT_AGENT_NAME,
				model: profile.model
			}, response.data.content);
			else consola.warn("No response received");
		} finally {
			await client.deleteSession(session.sessionId);
		}
	} finally {
		logUsageSummary(totals);
		await stopAll(servers);
	}
}

//#endregion
//#region src/agents/copilot/selectMode.ts
const COPILOT_SELECT_MODE_EXCLUDED_TOOLS = [
	...COPILOT_REVIEW_EXCLUDED_TOOLS,
	"rg",
	"create",
	"edit",
	"view"
];
async function selectCopilotMode(options) {
	if (options.mcp.status.state !== "running") throw new Error("Select mode MCP server must be started before mode selection.");
	const client = await getCopilotClient();
	const session = await client.createSession({
		model: options.model,
		availableTools: options.mcp.allowedTools.map((n) => `selectMode-${n}`),
		onPermissionRequest: (request) => {
			if (request.kind === "mcp") return { kind: "approved" };
			return {
				kind: "denied-by-rules",
				rules: ["Only the select mode MCP tool may be used during mode selection."]
			};
		},
		mcpServers: { selectMode: {
			type: "http",
			url: options.mcp.status.url,
			tools: options.mcp.allowedTools,
			timeout: options.timeoutMs ?? 6e4
		} }
	});
	await session.sendAndWait({ prompt: options.prompt });
	await client.deleteSession(session.sessionId);
}

//#endregion
//#region src/agents/copilot/index.ts
const COPILOT_AGENT_NAME = "github-copilot";
const githubCopilotAgent = async (profile) => {
	const agentName = COPILOT_AGENT_NAME;
	await ensureCopilotModelAvailable(profile.model);
	return {
		name: agentName,
		selectMode: (selectModeOptions) => selectCopilotMode({
			model: profile.model,
			prompt: selectModeOptions.prompt,
			mcp: selectModeOptions.mcp,
			timeoutMs: profile.tools.maxRuntimeMs
		}),
		run: async ({ mode, prompt, mcps }) => {
			switch (mode) {
				case "Review":
					await runCopilotReview(prompt, profile, mcps);
					break;
				default: throw new Error(`Unsupported mode for GitHub Copilot agent: ${mode}`);
			}
		},
		cleanup: async () => {
			const client = await getCopilotClient();
			const stopPromise = client.stop();
			const timeout = new Promise((_, reject) => {
				setTimeout(() => reject(/* @__PURE__ */ new Error("Timeout")), 5e3);
			});
			try {
				await Promise.race([stopPromise, timeout]);
			} catch {
				consola.warn("Normal stop timed out, forcing stop...");
				await client.forceStop();
			}
		}
	};
};

//#endregion
//#region src/agents/index.ts
const DEFAULT_CONFIGURATION = {
	model: "claude-sonnet-4.6",
	timeOutMs: 12e5,
	tools: {
		maxCalls: 60,
		maxRuntimeMs: 6e4
	},
	agent: "github-copilot"
};
async function getClank8y(options) {
	const { agent: agentName, ...profile } = defu$1(options, DEFAULT_CONFIGURATION);
	let agent;
	switch (agentName) {
		case "github-copilot":
			agent = githubCopilotAgent(profile);
			break;
		default: throw new Error(`Unsupported agent: ${agentName}`);
	}
	agent = await agent;
	return {
		agent,
		profile
	};
}
async function executeClank8yAgent(options) {
	const { agent, profile } = await getClank8y(options);
	await resetClank8yArtifacts();
	consola.success("Reset .clank8y artifacts directory.");
	const { mcp, getSelection, prompt: selectModePrompt } = getSelectModeRuntime(options.promptContext);
	await mcp.start();
	await agent.selectMode({
		prompt: selectModePrompt,
		mcp
	});
	await mcp.stop();
	const selection = getSelection();
	if (!selection) throw new Error("Mode selection failed: the model did not provide a valid clank8y mode selection.");
	const { prompt, mcps } = getModeRuntime(selection.mode, options.promptContext);
	logAgentMessage({
		agent: agent.name,
		model: profile.model
	}, `Selected mode: ${selection.mode}\nMode selection reason: ${selection.reason}`);
	logAgentMessage({
		agent: agent.name,
		model: profile.model
	}, [
		`mode: ${selection.mode}`,
		"",
		options.promptContext
	]);
	await agent.run({
		mode: selection.mode,
		prompt,
		mcps
	});
	await agent.cleanup?.();
	return selection;
}

//#endregion
//#region src/clank8y.ts
async function runClank8y(options) {
	setClank8yRuntimeContext({
		promptContext: options.promptContext,
		auth: options.auth,
		runInfo: options.runInfo,
		options: options.options
	});
	const selection = await executeClank8yAgent({
		promptContext: getClank8yRuntimeContext().promptContext,
		model: options.model,
		timeOutMs: options.timeOutMs,
		tools: options.tools
	});
	return {
		status: "completed",
		mode: selection.mode,
		summary: `clank8y completed in mode '${selection.mode}'.`
	};
}

//#endregion
export { runClank8y };