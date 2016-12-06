// 导出类型判定接口
export * from './lib/is';

/**
 * 属性拷贝
 * 
 * @export
 * @param {Object} target 目标对象
 * @param {Object} seed 继承对象
 * @param {Array} whiteList 白名单
 */
export function mix(target, seed, whiteList) {
  if (!Array.isArray(whiteList)) {
    whiteList = false;
  }

  // Copy "all" properties including inherited ones.
  for (var prop in seed) {
    if (seed.hasOwnProperty(prop)) {
      // 检测白名单
      if (whiteList && whiteList.indexOf(prop) === -1) continue;

      // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
      if (prop !== 'prototype') {
        target[prop] = seed[prop];
      }
    }
  }
}

/**
 * 继承
 * 
 * @export
 * @param {Class} ctor
 * @param {Class} superCtor
 * @param {Object} properties
 * @returns {ctor}
 */
export function inherits(ctor, superCtor, properties) {
  if (ctor.setPrototypeOf) {
    ctor.setPrototypeOf(superCtor.prototype);
  } else if (ctor.__proto__) {
    ctor.__proto__ = superCtor.prototype;
  } else {
    // constructor    
    function Ctor() {}

    // prototype
    Ctor.prototype = superCtor.prototype;
    ctor.prototype = new Ctor();
  }

  ctor.prototype.constructor = ctor;

  // 混合属性
  mix(ctor, properties);

  return ctor;
}
