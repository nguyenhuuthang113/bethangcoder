var map = {};
var _doc = document;
var litTag = "tagName", litChild = "childNodes", litNod = "nodeValue", litAttr = "attributes", litCTN = "createTextNode", litCE = "createElement";
map[litTag] = true;
map[litChild] = true;
map[litNod] = true;
map[litAttr] = true;
var udf;

export default function VPatch(renderedTree, virtualTree, noParent) {

    if (!renderedTree) {
        return null;
    } else if (!virtualTree) {
        return renderedTree;
    }
    // Quick patch for TextNode
    if (!!virtualTree.nodeName && !!renderedTree.nodeName && virtualTree[litNod] !== undefined) {
        if (virtualTree.nodeName !== renderedTree.nodeName) {
            renderedTree[litNod] = virtualTree[litNod];
        }
        return true;
    }
    if (noParent) {
        if (renderedTree.nodeType && virtualTree.length === undefined) {
            virtualTree = [virtualTree];
        }
    }
    if (Array.isArray(virtualTree)) {
        if (renderedTree.length > 0) {
            var maxLength = Math.max(renderedTree.length, virtualTree.length);
            for (var i = 0; i < maxLength; i++) {
                VPatch(renderedTree[i], virtualTree[i]);
            }
        } else {
            var renderedTreeChilds = renderedTree[litChild];
            if (renderedTreeChilds) {
                if (renderedTreeChilds.length > 0) {
                    var maxLength = Math.max(renderedTreeChilds.length, virtualTree.length);
                    for (var i = 0; i < maxLength; i++) {
                        VPatch(renderedTreeChilds[i], virtualTree[i]);
                    }
                } else {
                    for (var i = 0, len = virtualTree.length; i < len; i++) {
                        var virtualChildNode = virtualTree[i];
                        var isTextNode = virtualChildNode.nodeName === "#text";
                        var createElem = isTextNode ? _doc[litCTN](virtualChildNode[litNod]) : _doc[litCE](virtualChildNode.tagName);
                        if (isTextNode) {
                            createElem[litNod] = virtualChildNode[litNod];
                        } else {
                            VPatch(createElem, virtualChildNode);
                        }
                        renderedTree.appendChild(createElem);
                    }
                }
            }
        }
        return true;
    }

    for (var p in map) {
        var rendered = renderedTree[p],
        virtual = virtualTree[p];

        if (!virtual && !rendered) {
            continue;
        } else if (p === litNod) {
            if (rendered !== udf && virtual !== udf && rendered !== virtual) {
                renderedTree[p] = virtual;
            }
        } else if (p === litChild) {
            if ((!rendered || rendered && rendered.length === 0)) {
                if (virtual && virtual.length > 0) {
                    for (var i = 0, len = virtual.length; i < len; i++) {
                        var virtualChildNode = virtual[i];
                        if (!virtualChildNode) {
                            continue;
						}
                        var isTextNode = virtualChildNode.nodeName === "#text";
                        var createElem = isTextNode ? _doc[litCTN](virtualChildNode[litNod]) : _doc[litCE](virtualChildNode.tagName);
                        if (isTextNode) {
                            createElem[litNod] = virtualChildNode[litNod];
                        } else {
                            VPatch(createElem, virtualChildNode);
                        }
                        renderedTree.appendChild(createElem);
                    }
                }
            } else if (!virtual || virtual && virtual.length === 0) {
                if (rendered && rendered.length > 0) {
					var renderedChild, i = 0;
                    while (renderedChild = rendered[i++]) {
                        if (renderedChild === undefined) {
                            renderedChild = rendered[i++];
						}
						if (renderedChild && renderedChild.parentNode) {
                        renderedChild.parentNode.removeChild(renderedChild);
						}
						if (i >= rendered.length) {
							i = 0;
						}
                    }
                }
            } else if (virtual && rendered) {
                var maxLength = Math.max(rendered && rendered.length || 0, virtual && virtual.length || 0);
                for (var i = 0; i < maxLength; i++) {
                    var virtualChildNode = virtual[i];
					var renderedChildNode = rendered[i];
                    if (!renderedChildNode) {
                        var isTextNode = virtualChildNode.nodeName === "#text";
                        var createElem = isTextNode ? _doc[litCTN](virtualChildNode[litNod]) : _doc[litCE](virtualChildNode.tagName);
                        renderedTree.appendChild(createElem);
                        renderedChildNode = createElem;
                        VPatch(renderedChildNode, virtualChildNode);
                    } else if (!virtualChildNode) {
						if (renderedChildNode && renderedChildNode.parentNode) {
                        renderedChildNode.parentNode.removeChild(renderedChildNode);
						}
                    } else {
                        if (virtualChildNode.nodeName && virtualChildNode[litNod] !== undefined) {
                            if (renderedChildNode[litNod] !== virtualChildNode[litNod]) {
                                renderedChildNode[litNod] = virtualChildNode[litNod];
                            }
                        } else {
                            VPatch(renderedChildNode, virtualChildNode);
                        }
                    }
                }
            }
        } else if (p === litTag) {
            if ((rendered && virtual) && rendered !== virtual) {
                var createElem = _doc.createElement(virtual);
                VPatch(createElem, virtualTree);
                if (rendered && renderedTree.parentNode) {
                    renderedTree.parentNode.replaceChild(createElem, renderedTree);
                }
            }
        } else if (p === litAttr) {
            var maxLength = Math.max(rendered && rendered.length || 0, virtual && virtual.length || 0);
            for (var i = 0; i < maxLength; i++) {
                var rAttr = rendered[i];
                var vAttr = virtual && virtual[i];

                if (rAttr && !vAttr) {
                    renderedTree.removeAttribute(rAttr.name);
                } else if (!rAttr && vAttr) {
                    renderedTree.setAttribute(vAttr.name, vAttr.value);
                } else if (rAttr.value !== vAttr.value) {
                    rAttr.value = vAttr.value;
                }
            }
        }
    }
}
