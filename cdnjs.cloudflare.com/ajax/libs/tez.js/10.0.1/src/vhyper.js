import {
    isComponent
}
from './vcomponent';

var slice = [].slice;
var isArray = Array.isArray;

export function VAttr(attr) {
    if (!attr || isArray(attr))
        return attr;
    var attrs = [];
    for (var prop in attr) {
        attrs.push({
            name: prop,
            value: attr[prop]
        });
    }
    return attrs;
}

export function VText(text) {
    return {
        nodeName: '#text',
        nodeValue: text
    }
}

export default function VHyper() {
    var children = slice.call(arguments);
    var tag = children.shift();
    var attrs = children.shift();

    var render;
    if (isComponent(tag)) {
        render = tag.render !== undefined ? tag.render() : new tag(attrs).render();
    } else if (typeof tag === 'function') {
        render = tag(attrs);
    } else if (typeof render === 'number' || typeof render === 'string') {
        render = VText(render);
    } else {
		tag = tag.toUpperCase();
        render = {
            tagName: tag,
            nodeName: tag,
            attributes: VAttr(attrs)
        }
    }
    if (children.length > 0) {
        attrs = VAttr(attrs);
        if (!render.childNodes) {
            render.childNodes = [];
        }
        render.childNodes = render.childNodes.concat(children.map(function (item) {
                    return typeof(item) === 'number' || typeof(item) === 'string' ? VText(item) : isArray(item) ? VHyper.apply(null, item) : isComponent(item) ? VHyper(item) : item;
                }));
    }
    return render;
}
