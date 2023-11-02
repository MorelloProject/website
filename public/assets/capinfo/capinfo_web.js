
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;

            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_18(arg0, arg1) {
    wasm._dyn_core__ops__function__Fn_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hade5ed888047fd98(arg0, arg1);
}

/**
*/
export function main() {
    wasm.main();
}

/**
* @returns {string}
*/
export function version() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.version(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @returns {string}
*/
export function capinfo_version() {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.capinfo_version(retptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {HTMLElement} container
* @param {string} id_base
*/
export function append_capinfo_to(container, id_base) {
    var ptr0 = passStringToWasm0(id_base, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.append_capinfo_to(addHeapObject(container), ptr0, len0);
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('capinfo_web_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_instanceof_Window_fa4595281eb5ba83 = function(arg0) {
        var ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__wbg_document_d8cce4c1031c64eb = function(arg0) {
        var ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_location_f8de588551329bf4 = function(arg0) {
        var ret = getObject(arg0).location;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_history_ea580f62f8cb1285 = handleError(function(arg0) {
        var ret = getObject(arg0).history;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_createElement_695120dd76150487 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_createElementNS_9e443d140d5b4a33 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        var ret = getObject(arg0).createElementNS(arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_length_e32cebef0345366d = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_item_b3492f817bb752d6 = function(arg0, arg1) {
        var ret = getObject(arg0).item(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_removeNamedItem_06b93c98357c9883 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).removeNamedItem(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_instanceof_SvgGraphicsElement_62071c0b5016d615 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGGraphicsElement;
        return ret;
    };
    imports.wbg.__wbg_transform_0fd5fca75b91840c = function(arg0) {
        var ret = getObject(arg0).transform;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getBBox_f04d4764949a677b = handleError(function(arg0) {
        var ret = getObject(arg0).getBBox();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_x_176a68f97fd6112d = function(arg0) {
        var ret = getObject(arg0).x;
        return ret;
    };
    imports.wbg.__wbg_y_6bbf5b063a983bfc = function(arg0) {
        var ret = getObject(arg0).y;
        return ret;
    };
    imports.wbg.__wbg_width_7b18bb7e981b92f1 = function(arg0) {
        var ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_height_a7df0e48c352a33c = function(arg0) {
        var ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_name_553f423ee418cbe0 = function(arg0, arg1) {
        var ret = getObject(arg1).name;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_item_74246db814f56562 = function(arg0, arg1) {
        var ret = getObject(arg0).item(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_SvgPathElement_00de3a1056e020e4 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGPathElement;
        return ret;
    };
    imports.wbg.__wbg_instanceof_SvgPatternElement_952ece788242f9d3 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGPatternElement;
        return ret;
    };
    imports.wbg.__wbg_addEventListener_9b66d58c2a9ba39a = handleError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    });
    imports.wbg.__wbg_newwithstr_ab2efa9245d0fdf5 = handleError(function(arg0, arg1) {
        var ret = new URLSearchParams(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_get_0995fde866d8d6cf = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg1).get(getStringFromWasm0(arg2, arg3));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setRotate_fee6b4dcc6ed7be8 = handleError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setRotate(arg1, arg2, arg3);
    });
    imports.wbg.__wbg_setTranslate_741a8521ea21802c = handleError(function(arg0, arg1, arg2) {
        getObject(arg0).setTranslate(arg1, arg2);
    });
    imports.wbg.__wbg_length_ea5ea6ba35d76abd = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_item_a169fbd0137a0bee = function(arg0, arg1) {
        var ret = getObject(arg0).item(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_SvgLineElement_875ab2d67d694a51 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGLineElement;
        return ret;
    };
    imports.wbg.__wbg_instanceof_SvgtSpanElement_2c939f0ef7c74b81 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGTSpanElement;
        return ret;
    };
    imports.wbg.__wbg_baseVal_9a565c0eb5dacb5f = function(arg0) {
        var ret = getObject(arg0).baseVal;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_SvgDefsElement_95dc511abb9e6628 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGDefsElement;
        return ret;
    };
    imports.wbg.__wbg_instanceof_SvgMaskElement_82b1f9f7f0fd937f = function(arg0) {
        var ret = getObject(arg0) instanceof SVGMaskElement;
        return ret;
    };
    imports.wbg.__wbg_instanceof_SvgRectElement_0cbfd3c3aa905e4c = function(arg0) {
        var ret = getObject(arg0) instanceof SVGRectElement;
        return ret;
    };
    imports.wbg.__wbg_instanceof_SvgTextElement_5fc88a9a4e0d813c = function(arg0) {
        var ret = getObject(arg0) instanceof SVGTextElement;
        return ret;
    };
    imports.wbg.__wbg_numberOfItems_f95cc4139802dd99 = function(arg0) {
        var ret = getObject(arg0).numberOfItems;
        return ret;
    };
    imports.wbg.__wbg_appendItem_8b579bef07e72336 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).appendItem(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_clear_de2f54645247c15c = handleError(function(arg0) {
        getObject(arg0).clear();
    });
    imports.wbg.__wbg_instanceof_SvggElement_82971b363fba00d3 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGGElement;
        return ret;
    };
    imports.wbg.__wbg_localName_96f35cad603f3c0c = function(arg0, arg1) {
        var ret = getObject(arg1).localName;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_attributes_541f4b4185a86167 = function(arg0) {
        var ret = getObject(arg0).attributes;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_children_da35ea877e475af9 = function(arg0) {
        var ret = getObject(arg0).children;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_childElementCount_ba3600ddf4e81174 = function(arg0) {
        var ret = getObject(arg0).childElementCount;
        return ret;
    };
    imports.wbg.__wbg_removeAttribute_4bc290dbe2b7214f = handleError(function(arg0, arg1, arg2) {
        getObject(arg0).removeAttribute(getStringFromWasm0(arg1, arg2));
    });
    imports.wbg.__wbg_setAttribute_fb8737b4573a65f8 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    });
    imports.wbg.__wbg_debug_733679f61d937b18 = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_c81c8d172df3cb18 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_groupCollapsed_a813fcdf2114bbb5 = function(arg0) {
        console.groupCollapsed(getObject(arg0));
    };
    imports.wbg.__wbg_groupEnd_a71c96d8e0c681b1 = typeof console.groupEnd == 'function' ? console.groupEnd : notDefined('console.groupEnd');
    imports.wbg.__wbg_log_8485ead621ceded9 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_eb158fa0859088bf = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_instanceof_SvgElement_737845d03f7bc454 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGElement;
        return ret;
    };
    imports.wbg.__wbg_instanceof_HtmlInputElement_bcbf72cd9188bbf5 = function(arg0) {
        var ret = getObject(arg0) instanceof HTMLInputElement;
        return ret;
    };
    imports.wbg.__wbg_value_9c8f7cca5ded6671 = function(arg0, arg1) {
        var ret = getObject(arg1).value;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setvalue_44d4bd0ac437904f = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_pushState_10c51a6fb23b182f = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).pushState(getObject(arg1), getStringFromWasm0(arg2, arg3), arg4 === 0 ? undefined : getStringFromWasm0(arg4, arg5));
    });
    imports.wbg.__wbg_instanceof_SvgsvgElement_084da335bc239a93 = function(arg0) {
        var ret = getObject(arg0) instanceof SVGSVGElement;
        return ret;
    };
    imports.wbg.__wbg_createSVGTransform_748bf4922dfda4b3 = function(arg0) {
        var ret = getObject(arg0).createSVGTransform();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Node_ddb79e680ddc3e56 = function(arg0) {
        var ret = getObject(arg0) instanceof Node;
        return ret;
    };
    imports.wbg.__wbg_nodeType_4f9e1589e687efd3 = function(arg0) {
        var ret = getObject(arg0).nodeType;
        return ret;
    };
    imports.wbg.__wbg_childNodes_66f8f91fb4fa09d2 = function(arg0) {
        var ret = getObject(arg0).childNodes;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_settextContent_00a0c562129ed7b9 = function(arg0, arg1, arg2) {
        getObject(arg0).textContent = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_appendChild_9ba4c99688714f13 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_insertBefore_9ddb982d7f5d6824 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).insertBefore(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_removeChild_e02df31f6d70392a = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).removeChild(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_search_63bdf6fe2b15d1d4 = handleError(function(arg0, arg1) {
        var ret = getObject(arg1).search;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_call_8487a9f580e47219 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newnoargs_179d393e4626fcf7 = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_eeabd9085c04fc17 = handleError(function() {
        var ret = self.self;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_window_f110c13310da2c8f = handleError(function() {
        var ret = window.window;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_globalThis_a2669bee93faee43 = handleError(function() {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_global_a5584d717f4d6761 = handleError(function() {
        var ret = global.global;
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_closure_wrapper257 = function(arg0, arg1, arg2) {
        var ret = makeClosure(arg0, arg1, 72, __wbg_adapter_18);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

