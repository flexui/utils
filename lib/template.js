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
  // 解析模板
  var code =
    "try {\n" +
    "this.output += '" +
    view
    .replace(/<%/g, '\x11')
    .replace(/%>/g, '\x13')
    .replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27')
    .replace(/^\s*|\s*$/g, '')
    .replace(RE_LINE_SPLIT, function() {
      return "';\nthis.line = " + (++line) + ";\nthis.output += '\\n";
    })
    .replace(/\x11==\s*(.+?)\s*\x13/g, "' + ($1) + '")
    .replace(/\x11=\s*(.+?)\s*\x13/g, "' + this.escapeHTML($1) + '")
    .replace(/(^|[^\w\u00c0-\uFFFF_])@(?=\w)/g, '$1this.data.')
    .replace(/(^|[^\w\u00c0-\uFFFF_])@(?=\[)/g, '$1this.data')
    .replace(/\x11\s*(.+?)\s*\x13/g, "';\n$1\nthis.output += '") +
    "';\n\nreturn this.output;\n} catch (e) {\n" +
    "throw 'TemplateError: ' + e + ' (at ' + ' line ' + this.line + ')';\n}";

  // 模板函数引擎
  var stringify = new Function(code.replace(/\nthis\.output \+= '';\n/g, '\n'));

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
