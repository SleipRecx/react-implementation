// import React from "react"

const flatten = nestedArray => [].concat(...nestedArray)

const setAttribute = (dom, key, value) => {
    if (typeof value == 'function' && key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
        dom.removeEventListener(eventType, value);
        dom.addEventListener(eventType, value);
    } else if (key === 'checked' || key === 'value' || key === 'className') {
        dom[key] = value;
    } else if (key === 'style' && typeof value == 'object') {
        Object.assign(dom.style, value);
    } else if (key === 'ref' && typeof value == 'function') {
        value(dom);
    } else if (key === 'key') {
        dom.__gooactKey = value;
    } else if (typeof value != 'object' && typeof value != 'function') {
        dom.setAttribute(key, value);
    }
};

let logVDOM
const _render = (vdom, parent=null) => {
    if (vdom){
        if (vdom.hasOwnProperty("props")){
            if (vdom.props.hasOwnProperty("className")){
                if (vdom.props.className === "extract-vdom")
                logVDOM = vdom
            }
        }
    }
    const mount = element => {
        if (parent) {
            return parent.appendChild(element)
        } 
        return element
    }

    if (typeof vdom == 'string' || typeof vdom == 'number') {
        mount(document.createTextNode(vdom))
    } else if (typeof vdom == 'boolean' || vdom === null) {
        return mount(document.createTextNode(''));
    } else if (typeof vdom == 'object' && typeof vdom.type == 'function') {
        return Component.render(vdom, parent);
    } else if (typeof vdom == 'object' && typeof vdom.type == 'string') {
        const dom = mount(document.createElement(vdom.type));
        flatten(vdom.props.children).forEach(child => _render(child, dom))
        if (vdom.key) {
            dom.setAttribute("key", vdom.key)
        }
        for (const prop in vdom.props) {
            setAttribute(dom, prop, vdom.props[prop]);
        }
        return dom;
    } else {
        throw new Error(`Invalid VDOM: ${vdom}.`);
    }
};


/** @jsx createElement */
const createElement = (type, props={}, ...children) => {
    props = props ? props: {}
    delete props["__source"]
    delete props["__self"]
    props["children"] = children
    const key = props.hasOwnProperty("key") ? props.key : null
    delete props["key"]
    return { type, key, props }
}

const _patch = (dom, vdom, parent=dom.parentNode) => {
    const root = document.getElementById("root")
    root.removeChild(root.childNodes[0])
    document.getElementById("root").appendChild(_render(vdom))   
    //const replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el);
    //return replace(_render(vdom, parent))
}


class Component {
    constructor(props){
        this.props = props || {}
        this.state = {}
    }

setState(next) {
    this.state = {...this.state, ...next}
    _patch(this.base, this.render());    

}_

static render(vdom, parent = null) {
    const props = Object.assign({}, vdom.props, {children: vdom.children});
    if (Component.isPrototypeOf(vdom.type)) { 
        const instance = new (vdom.type)(props);
        instance.componentWillMount()
        instance.base = _render(instance.render(props), parent)
        instance.componentDidMount()
        return instance.base
    }
    return _render(vdom.type(props), parent)
}

shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || nextState !== this.state;
}

componentWillReceiveProps(nextProps) {
    return undefined;
}

componentWillUpdate(nextProps, nextState) {
    return undefined;
}

componentDidUpdate(prevProps, prevState) {
    return undefined;
}

componentWillMount() {
    return undefined;
}

componentDidMount() {
    return undefined;
}

componentWillUnmount() {
    return undefined;
}

}

const render = (element, container) => {
    container.appendChild(_render(element))   
}

 
export default { createElement, render, Component, logVDOM: () => logVDOM };

