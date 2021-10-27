var id = 0, slice = [].slice;

export default function VNode(params, key) {
	if (Array.isArray(params)) {
		return params.map(function(param){
			return VNode(param);
		});
	}
	var self = {};
    if (params.id) {
        self.id = params.id;
    }
    if (params.tagName) {
        self.tagName = params.tagName.toUpperCase();
    }
    self.nodeName = params.nodeName;
    self.childNodes = slice.call(params.childNodes || []).map(function (node, index) {
        return VNode(node, index);
    }) || [];
    if (params.attributes) {
        self.attributes = slice.call(params.attributes);
    }
    self.key = key || id++;
    self.nodeValue = params.nodeValue || null;
    self.value = params.value;
    self.textContent = params.tagName === "BR" ? "" : self.childNodes.length ? undefined : params.textContent;
    self.name = params.name || "VNode_" + self.nodeName;
    self.nodeType = params.nodeType || (self.nodeName && self.nodeName.indexOf('text')) !== -1 ? 3 : 1;
    self.selectorText = self.nodeName;
	return self;
}