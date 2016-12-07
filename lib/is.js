export var OP = Object.prototype;
export var AP = Array.prototype;
export var SP = String.prototype;
export var FP = Function.prototype;

// toString
var OPToString = OP.toString;
var FPToString = FP.toString;

/**
 * 获取数据类型
 *
 * @export
 * @param {any} value
 * @returns
 */
export function type(value) {
  return OPToString.call(value);
}

/**
 * 函数判定
 *
 * @export
 * @param {any} value
 * @returns
 */
export function fn(value) {
  return type(value) === '[object Function]';
}

/**
 * 字符串判定
 *
 * @export
 * @param {any} value
 * @returns
 */
export function string(value) {
  return type(value) === '[object String]';
}

/**
 * 数字判定
 *
 * @export
 * @param {any} value
 * @returns
 */
export function number(value) {
  return type(value) === '[object Number]';
}

/**
 * NaN判定
 *
 * @export
 * @param {any} value
 * @returns
 */
export function nan(value) {
  return number(value) && value !== value;
}

// Native function RegExp
var NATIVERE = '';

// Use a native function as a template...
NATIVERE += FPToString.call(Function);
// Escape special RegExp characters...
NATIVERE = NATIVERE.replace(/([.*+?^=!:$(){}|[\]\/\\])/g, '\\$1');
// Replace any mentions of `Function` to make template generic.
// Replace `for ...` and additional info provided in other environments, such as Rhino (see lodash).
NATIVERE = NATIVERE.replace(/Function|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?');
// Bracket the regex:
NATIVERE = '^' + NATIVERE + '$';

// Get RegExp
NATIVERE = new RegExp(NATIVERE);

/**
 * 是否是原生方法
 *
 * @export
 * @param {any} value
 * @returns
 */
export function isNative(value) {
  if (!fn(value)) {
    return false;
  }

  return NATIVERE.test(fn.toString());
}
