/**
 * 返回包含id、class、innerTextde字符串的标签
 * @param target html节点
 */
export function html_element_to_string(target: HTMLElement): string {
    const _tagName = target.tagName.toLowerCase();
    if (_tagName === 'body') {
        return null;
    }
    let _classNames = target.classList.value;
    _classNames = _classNames !== '' ? ` class="${_classNames}"` : '';
    const _id = target.id ? ` id="${target.id}"` : '';
    const _innerText = target.innerText;
    return `<${_tagName}${_id}${_classNames !== '' ? _classNames : ''}>${_innerText}</${_tagName}>`;
}
