/**
 * Port of jQuery's Template Engine to Nodejs.
 * 
 * 
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * @credits http://github.com/jquery/jquery-tmpl 
 * @author Oleg Slobodskoi
 */

// export print method, to let other commonjs systems
// without "util", mock it
exports.print = function() {
    require( "util" ).print.apply( this, arguments );    
};

exports.each = function( obj, callback ) {
    var key;
    
    if ( obj instanceof Array ) {
        for ( key=0; key<obj.length; ++key ) {
            callback.call( obj[key], key, obj[key] );
        }
    } else {
        for ( key in obj ) {
            callback.call( obj[key], key, obj[key] );
        }
    }
};

exports.escape = function( str ) {
    return String(str)
        .replace(/&(?!\w+;)/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&#39")
        .replace(/"/g, "&quot;");        
};
    
exports.tag = {
    "tmpl": {
        _default: { $2: "null" },
        open: "if($notnull_1){_=_.concat($item.nest($1,$2));}"
        // tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
        // This means that {{tmpl foo}} treats foo as a template (which IS a function).
        // Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
    },
    "wrap": {
        _default: { $2: "null" },
        open: "$item.calls(_,$1,$2);_=[];",
        close: "call=$item.calls();_=call._.concat($item.wrap(call,_));"
    },
    "each": {
        _default: { $2: "$index, $value" },
        open: "if($notnull_1){$.each($1a,function($2){with(this){",
        close: "}});}"
    },
    "if": {
        open: "if(($notnull_1) && $1a){",
        close: "}"
    },
    "else": {
        _default: { $1: "true" },
        open: "}else if(($notnull_1) && $1a){"
    },
    "html": {
        // Unecoded expression evaluation.
        open: "if($notnull_1){_.push($1a);}"
    },
    "=": {
        // Encoded expression evaluation. Abbreviated form is ${}.
        _default: { $1: "$data" },
        open: "if($notnull_1){_.push($.escape($1a));}"
    },
    "!": {
        // Comment tag. Skipped by parser
        open: ""
    }
};


/**
 * Support Express render method
 * 
 * Options:
 *
 * - `locals` Local variables object
 * - `cache` Compiled functions are cached, requires `filename`
 * - `filename` Used by `cache` to key caches
 * - `scope` Function execution context
 * - `debug` Output generated function body
 * 
 * @param {Object} str
 * @param {Object} options
 * @return {String}
 * @api public
 */
exports.render = function( str, options ) {
    var name = options.filename || str,
        tpl;

    // precompile the template and cache it using filename    
    exports.template( name, str );

    tpl = exports.tmpl( name, options.locals, options );
    
    if ( options.debug ) {
        exports.print( exports.template[name] );    
    }
    
    if ( !options.cache ) {
        delete exports.template[name];
    }
    
    return tpl;
};


/**
 * Render template
 * @param {String} markup html markup or precompiled markup name
 * @param {Object|Array|String} data
 * @param {Object} data
 * @return {String} ret
 * @api public
 */ 
exports.tmpl = function( markup, data, options ) {
    var fn = exports.template( null, markup ),
        dataType,
        ret;
    
    data = data || {};
    options = options || {};
    options.data = data;
    options.nest = tiNest; 
    
    if ( data instanceof Array ) {
        ret = "";
        data.forEach( function( data ){
            options.data = data;
            ret += fn.call( options.scope,  exports, options );    
        });
    } else {
        ret = fn.call( options.scope, exports, options );
    }
    
    return ret; 
};

/**
 * Generate reusable function and cache it using name or markup as a key
 * 
 * @param {String|Null} name
 * @param {String} markup
 * @return {Function|Undefined}
 * @api public
 */
exports.template = function template( name, markup ) {
    if ( typeof markup !== "string" ) {
        throw new Error( "Bad template passed." );
    }        
        
    if ( !name ) {
        name = markup;        
    }

    var fn = template[name];
    
    if ( !fn ) {
        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        fn = template[name] = buildTmplFn( markup );
    }        
    
    return fn;
};

/**
 * Clear cache
 * @api public
 */
exports.clearCache = function() {
    var cache = exports.template,
        name;
    for ( name in cache ) {
        if ( cache.hasOwnProperty(name) ) {
            delete cache[name];
        }
    }
};

/**
 * Build reusable function for template generation
 * 
 * @param {String} markup
 * @return {Function}
 * @api private
 */
function buildTmplFn( markup ) {
    return  new Function( "$", "$item",
        "var call,_=[],$data=$item.data;" +
        
        // Introduce the data as local variables using with(){}
        "with($data){_.push('" +
    
            // Convert the template into pure JavaScript
            markup
                .trim()
                .replace( /([\\'])/g, "\\$1" )
                .replace( /[\r\t\n]/g, " " )
                .replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
                .replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
                    function( all, slash, type, fnargs, target, parens, args ) {
                        var tag = exports.tag[ type ], def, expr, exprAutoFnDetect;
                        
                        if ( !tag ) {
                            throw "Template command not found: " + type;
                        }

                        def = tag._default || [];
                        
                        if ( parens && !/\w$/.test(target)) {
                            target += parens;
                            parens = "";
                        }
                        
                        if ( target ) {
                            args = args ? ("," + args + ")") : (parens ? ")" : "");
                            // Support for target being things like a.toLowerCase();
                            // In that case don't call with template item as 'this' pointer. Just evaluate...
                            expr = parens ? (target.indexOf(".") > -1 ? target + parens : ("(" + target + ").call($item" + args)) : target;
                            exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
                        } else {
                            exprAutoFnDetect = expr = def.$1 || "null";
                        }

                        return "');" +
                            tag[ slash ? "close" : "open" ]
                                .split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
                                .split( "$1a" ).join( exprAutoFnDetect )
                                .split( "$1" ).join( expr )
                                .split( "$2" ).join( fnargs ?
                                    fnargs.replace( /\s*([^\(]+)\s*(\((.*?)\))?/g, function( all, name, parens, params ) {
                                        params = params ? ("," + params + ")") : (parens ? ")" : "");
                                        return params ? ("(" + name + ").call($item" + params) : all;
                                    })
                                    : (def.$2||"")
                                    ) +
                            "_.push('";
                    }
                ) +
        "');}return _.join('');" 
    );    
}

/**
 * Nested template, using {{tmpl}} tag
 * 
 * @param {String} tmpl
 * @param {Object} data
 * @param {Object} options
 * @api private
 */
function tiNest( tmpl, data ) {
    return exports.render( tmpl, {locals: data} );    
}