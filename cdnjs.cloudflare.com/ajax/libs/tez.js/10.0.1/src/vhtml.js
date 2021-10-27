        var attrRegExp = /\" |\' /g;
        var quotesRegExp = /"|'/g;
        var tagsRegEx = /([>]+)|([<]+)/g;
        var spaceRegEx = /([\s+]+)/g;

        var textNode = '#text';
        var tagsReplacement = "$1$TAGS$2",
        tagsSplit = '$TAGS';
        var spaceReplacement = "$1$SPACE",
        spaceSplit = '$SPACE';

        function VText(text) {
            return {
                nodeName: textNode,
                nodeValue: text
            }
        }

        function str2attr(str) {
            return (str && typeof str === 'string') ? str.split(attrRegExp).map(function (item, idx) {
                if (item.indexOf("=") !== -1) {
                    item = item.split("=");
                    return {
                        name: item[0],
                        value: item[1].replace(quotesRegExp, '')
                    }
                }
                return {
                    name: item,
                    value: true
                }
            }) : str;
        }
        function VHtml(str, innerScope) {
            if (str[0] !== "<" || str.indexOf(">") === -1) {
                return VText(str.replace(tagsRegEx, ''))
            }
            var _parsed = str.replace(tagsRegEx, tagsReplacement).split(tagsSplit).filter(function (p) {
                    return p
                });
            var isChildTags = innerScope !== undefined ? innerScope : false;
            var vnode = {
                tagName: null,
                childNodes: [],
                attributes: ''
            };

            var child = vnode;

            for (var i = 0, len = _parsed.length; i < len; i++) {
                var tag = _parsed[i];
                var isTag = tag.charAt(0) === "<";
                if (isTag && tag.charAt(1) === "/") {
                    if (child.parent) {
                        child = child.parent;
                    }
                    continue;
                }
                if (!isTag) {
                    tag.replace(spaceRegEx, spaceReplacement).split(spaceSplit).filter(function (p) {
                        return p;
                    }).map(function (text) {
                        child.childNodes.push(VText(text));
                    });
                } else {
                    var tagLen = tag.length;
                    var selfClose = tag.indexOf("/>") !== -1;
                    var isOpenTag = !selfClose && isTag;
                    var tagScopeOut = isTag && tag.substr(1, tagLen - 2);
                    var parseTag = isTag && tagScopeOut.split(" ");
                    var tagName = parseTag.shift();
                    if (parseTag.length > 0) {
                        parseTag = str2attr(parseTag.join(" "));
                    }
                    if (i === 0 && !isChildTags) {
                        child.tagName = child.nodeName = tagName.toUpperCase();
                        child.attributes = parseTag;
                    } else {
                        if (selfClose) {
                            var name = tagName.substr(0, tagName.length - 1);
                            child.childNodes.push({
                                tagName: name.toUpperCase(),
                                nodeName: name,
                                attributes: parseTag,
                                parent: vnode
                            });
                        } else {
                            var childOfVNode = {
                                tagName: tagName.toUpperCase(),
                                nodeName: tagName,
                                attributes: parseTag,
                                childNodes: [],
                                parent: vnode
                            };
                            child.childNodes.push(childOfVNode);
                            child = childOfVNode;
                        }
                    }
                }
            }

            _parsed = null;
            return isChildTags ? vnode.childNodes : vnode;
        }
   export default VHtml;
