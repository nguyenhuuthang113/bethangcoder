import VPatch from './vpatch';

var linkState = function (scope, type) {
	var state = scope.state || {};
	return function (value) {
		state[type] = value.target ? value.target[type] : value[type];
		return scope.setState(state);
	}
}

var Component = function (props) {
    this.props = props;
	this.innerScope = false;
};
var p = Component.prototype;
p.shouldComponentUpdate = function (state) {
    return !!state && JSON.stringify(this.state) !== JSON.stringify(state);
};
p.setState = function (state) {
    if (this.shouldComponentUpdate(state)) {
        if (state && this.state) {
            for (var p in state) {
                this.state[p] = state[p];
            }
        }
        this.redraw();
    }
    return this;
};
p.redraw = function (el) {
    if (!this.rendered) {
        Object.defineProperty(this, 'rendered', {
            value: el,
            enumerable: false
        });
    }
    var render = this.render();
    if (!render) {
        if (this.rendered.remove) {
            this.rendered.remove();
        }
        if (this.componentDidUnmount) {
            this.componentDidUnmount();
        }
    } else {
        VPatch(this.rendered, render, this.innerScope);
        render = null;
    }
    return this;
};
p.constructor = Component;

function isComponent(_class) {
    return !!_class && (((_class instanceof Component) || _class.redraw || _class.render) || (_class.prototype && (_class.prototype.redraw || _class.prototype.render)));
}

function DOM(el, _class, innerScope) {
    if (isComponent(_class)) {
        if (_class.componentDidMount) {
            _class.componentDidMount(el);
        }
        _class.redraw(el);
    } else if (typeof _class === 'object') {
        VPatch(el, _class, innerScope);
    }
    return _class;
}

export {
    isComponent,
    Component,
	linkState,
    DOM
};
