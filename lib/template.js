// HTML 转码映射表
var HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\x22': '&#x22;',
  '\x27': '&#x27;'
};

// 分行正则
export var RE_LINE_SPLIT = /\n|\r\n/g;

/**
 * escapeHTML
 *
 * @export
 * @param {String} html
 */
export function escapeHTML(html) {
  return String(html).replace(/[&<>\'\"]/g, function(char) {
    return HTML_ESCAPE_MAP[char];
  });
}

/**
 * template
 *
 * @export
 * @param {String} view
 * @param {Object|Array} [data]
 * @see  https://github.com/cho45/micro-template.js
 * @license (c) cho45 http://cho45.github.com/mit-license
 */
export function template(view, data) {
  // 行数
  var line = 1;
  // 保存 this 变量
  var context = '__CONTEXT' + Date.now() + '__';
  // 解析模板
  var code =
    "try {\n" +
    'var ' + context + ' = this;\n\n' +
    context + ".output += '" + view
    // 左分界符
    .replace(/<%/g, '\x11')
    // 右分界符
    .replace(/%>/g, '\x13')
    // 单引号转码
    .replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27')
    // 空格去除过滤
    .replace(/^\s*|\s*$/g, '')
    // 拆行
    .replace(RE_LINE_SPLIT, function() {
      return "';\n" + context + ".line = " + (++line) + ";\n" + context + ".output += '\\n";
    })
    // 非转码输出
    .replace(/\x11==\s*(.+?)\s*\x13/g, "' + ($1) + '")
    // 转码输出
    .replace(/\x11=\s*(.+?)\s*\x13/g, "' + " + context + ".escapeHTML($1) + '")
    // 静态属性读取逻辑处理
    .replace(/(^|[^\w\u00c0-\uFFFF_])@(?=\w)/g, '$1' + context + '.data.')
    // 动态属性读取逻辑处理
    .replace(/(^|[^\w\u00c0-\uFFFF_])@(?=\[)/g, '$1' + context + '.data')
    // 抽取模板逻辑
    .replace(/\x11\s*(.+?)\s*\x13/g, "';\n$1\n" + context + ".output += '") +
    "';\n\nreturn " + context + ".output;\n} catch (e) {\n" +
    "throw 'TemplateError: ' + e + ' (at ' + ' line ' + " + context + ".line + ')';\n}";

  // 模板函数引擎
  var stringify = new Function(code.replace(new RegExp("\n" + context + "\.output \+= '';\n", 'g'), '\n'));

  /**
   * render
   *
   * @param {Object|Array} data
   * @returns {String}
   */
  function render(data) {
    return stringify.call({
      line: 1,
      output: '',
      data: data,
      escapeHTML: escapeHTML
    });
  };

  // 返回渲染函数或者渲染结果
  return data ? render(data) : render;
}
