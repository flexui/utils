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

// setPrototypeOf
var setPrototypeOf = Is.isNative(Object.setPrototypeOf) ? Object.setPrototypeOf : false;

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
  } else {
    // 中转空白类，可以减少内存占用
    function T() {
      // Empty constructor
    }

    // 原型属性继承
    T.prototype = superPrototype;
    // 初始化实例
    subClass.prototype = new T();
  }

  // 混合属性
  mix(subClass.prototype, properties);

  // 设置构造函数
  subClass.prototype.constructor = subClass;

  return subClass;
}

/**
 * 高性能 apply
 *
 * @param  {Function} fn
 * @param  {Any} context
 * @param  {Array} args
 * call is faster than apply, optimize less than 6 args
 * https://github.com/micro-js/apply
 * http://blog.csdn.net/zhengyinhui100/article/details/7837127
 */
export function apply(fn, context, args) {
  switch (args.length) {
    // faster
    case 0:
      return fn.call(context);
    case 1:
      return fn.call(context, args[0]);
    case 2:
      return fn.call(context, args[0], args[1]);
    case 3:
      return fn.call(context, args[0], args[1], args[2]);
    default:
      // slower
      return fn.apply(context, args);
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
