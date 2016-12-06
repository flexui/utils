var OP = Object.prototype;
var toString = OP.toString;

/**
 * 获取数据类型
 * 
 * @export
 * @param {any} value
 * @returns
 */
export function type(value) {
  return toString.call(value);
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