import $ from 'jquery';
// 类型判定接口
import * as Is from './lib/is';

// 公开接口
export * from './lib/is';

// jquery 对象
export var win = $(window);
export var doc = $(document);

/**
 * 属性拷贝
 *
 * @export
 * @param {Object} target 目标对象
 * @param {Object} seed 继承对象
 * @param {Array} list 名单
 * @param {Boolean} isWhite 是否是白名单
 */
export function mix(target, seed, list, isWhite) {
  if (!Array.isArray(list)) {
    list = false;
  }

  var index;

  // Copy "all" properties including inherited ones.
  for (var prop in seed) {
    if (seed.hasOwnProperty(prop)) {
      // 检测白名单
      if (list) {
        index = list.indexOf(prop);

        // 区分黑白名单
        if (isWhite ? index === -1 : index !== -1) {
          continue;
        }
      }

      // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
      if (prop !== 'prototype') {
        target[prop] = seed[prop];
      }
    }
  }

  return target;
}

// 为了节省内存，使用一个共享的构造器
function TClass() {
  // 空白中转类，可以减少内存占用
}

// Object setPrototypeOf
var setPrototypeOf = Object.setPrototypeOf;

// not suport setPrototypeOf
if (!Is.native(setPrototypeOf)) {
  setPrototypeOf = false;
}

// Object create
var objectCreate = Object.create;

// not suport create
if (!Is.native(objectCreate)) {
  objectCreate = false;
}

/**
 * 继承
 *
 * @export
 * @param {Class} subClass
 * @param {Class} superClass
 * @param {Object} properties
 * @returns {subClass}
 */
export function inherits(subClass, superClass, properties) {
  var superPrototype = superClass.prototype;

  if (setPrototypeOf) {
    setPrototypeOf(subClass.prototype, superPrototype);
  } else if (objectCreate) {
    subClass.prototype = objectCreate(superPrototype);
  } else {
    // 原型属性继承
    TClass.prototype = superPrototype;
    // 初始化实例
    subClass.prototype = new TClass();
    // 不要保持一个 superClass 的杂散引用
    TClass.prototype = null;
  }

  // 混合属性
  properties && mix(subClass.prototype, properties);

  // 设置构造函数
  subClass.prototype.constructor = subClass;

  return subClass;
}

/**
 * 高性能 apply
 *
 * @param  {Function} func
 * @param  {any} context
 * @param  {Array} args
 * call is faster than apply, optimize less than 6 args
 * https://github.com/micro-js/apply
 * http://blog.csdn.net/zhengyinhui100/article/details/7837127
 */
export function apply(func, context, args) {
  switch (args.length) {
    // faster
    case 0:
      return func.call(context);
    case 1:
      return func.call(context, args[0]);
    case 2:
      return func.call(context, args[0], args[1]);
    case 3:
      return func.call(context, args[0], args[1], args[2]);
    default:
      // slower
      return func.apply(context, args);
  }
}

// original getComputedStyle
var originalGetComputedStyle = window.getComputedStyle;

/**
 * getComputedStyle
 * @export
 * @param {HTMLElement} element
 * @param {String} prop
 * @returns {Object}
 * @see https://github.com/the-simian/ie8-getcomputedstyle/blob/master/index.js
 * @see https://github.com/twolfson/computedStyle/blob/master/lib/computedStyle.js
 * @see http://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle
 */
export function getComputedStyle(element, prop) {
  var style =
    // If we have getComputedStyle
    originalGetComputedStyle ?
    // Query it
    // From CSS-Query notes, we might need (node, null) for FF
    originalGetComputedStyle(element, null) :
    // Otherwise, we are in IE and use currentStyle
    element.currentStyle;

  // 返回 getPropertyValue 方法
  return {
    /**
     * getPropertyValue
     * @param {String} prop
     */
    getPropertyValue: function(prop) {
      if (style) {
        // Original support
        if (style.getPropertyValue) {
          return style.getPropertyValue(prop);
        }

        // Switch to camelCase for CSSOM
        // DEV: Grabbed from jQuery
        // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
        // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
        prop = prop.replace(/-(\w)/gi, function(word, letter) {
          return letter.toUpperCase();
        });

        // Old IE
        if (style.getAttribute) {
          return style.getAttribute(prop);
        }

        // Read property directly
        return style[prop];
      }
    }
  };
}

// 模板匹配正则
var TEMPLATE_RE = /{{([a-z]*)}}/gi;

/**
 * template
 *
 * @export
 * @param {String} format
 * @param {Object} data
 * @returns {String}
 * ```
 * var tpl = '{{name}}/{{version}}';
 * template(tpl, {name:'base', version: '1.0.0'});
 * ```
 */
export function template(format, data) {
  if (!Is.string(format)) return '';

  if (!data) return format;

  return format.replace(TEMPLATE_RE, function(all, name) {
    return data.hasOwnProperty(name) ? data[name] : name;
  });
}
