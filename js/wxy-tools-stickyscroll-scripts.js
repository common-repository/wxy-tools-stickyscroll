// ALL CODE ©2020-Present Clarence "exoboy" Bowman and WXY Tools, http://www.wxytools.com
// this code may not be distributed or copied without prior written consent of the author.

// create a global init flag...
var wxy_tools_stickyscroll_inited = false;

// begin encapsulation
(function($){

	// ********************************************************************
	// because we are altering the DOM, it will fire multiple times!
	// be sure to refer to jQuery as jQuery instead of $ ?
	// ********************************************************************
	jQuery( document ).on("DOMContentLoaded", function(){
		
		if( wxy_tools_stickyscroll_inited )
		{
			return;
		} else {
			wxy_tools_stickyscroll_inited = true;
			wxy_tools_stickyscroll_startup();
		}
	});
	
	
	// ********************************************************************
	// FUNCTION GLOBALS
	// ********************************************************************
	// set our cookie prefix here and then add the session ID below...
	var STICKYSCROLL_COOKIE = "wxy_tools_stickyscroll_";
	var STICKYSCROLL_TIMER;
	var STICKYSCROLL_SAVE_DELAY = 100;
	var DATA_FROM_WP_PHP;
	var STARTING_UP = true;

	// ********************************************************************
	// PAGE ONREADY (STARTUP)
	// ********************************************************************
	function wxy_tools_stickyscroll_startup()
	{
		// ------------------------------------------------------------------------
		// capture our vars from wordpress
		// ------------------------------------------------------------------------
		var wp_admin_vars = wxy_sticky_scroll_admin_vars;

		try {
			
			DATA_FROM_WP_PHP = wp_admin_vars["admin_panel_info"];
			
		} catch(e) {
			// do nothing for now
		}
		
		// ------------------------------------------------------------------------
		// LOAD COOKIE: see if there is a past scrollTop to restore
		// ------------------------------------------------------------------------
		var scrolltop = cookie_handler( "load", STICKYSCROLL_COOKIE );
		
		STICKYSCROLL_TIMER = setTimeout( function() {
			restore_saved_scrolltops( scrolltop );
		}, 500 );
		
		// ------------------------------------------------------------------------
		// SHORTCUT:(TOP OF PAGE SNAP) listen for 3 quick, up wheel events and pop to the top
		// ------------------------------------------------------------------------
		var wxy_sticksyscroll_counter = 0;
		var wxy_sticksyscroll_timer;

		$( "body" ).on( "wheel mousewheel DOMMouseScroll", function( evt )
		{
			var original_evt = evt[ "originalEvent" ];	
			var target = original_evt[ "target" ];
			var deltaY = original_evt.wheelDelta || original_evt.detail || 0;

			// always clear our previous timer(s)
			clearTimeout( wxy_sticksyscroll_timer );
				
			// if we are not scrolling the body or the body content holder in wp admin, ignore this!
			if( $( target ).get(0) == $( "#wpbody-content" ).get(0) || $( target ).get(0) == $( "body" ).get(0) )
			{
				// only count if we are scfrolling the document

				// count it only if they are going in the right direction (up)
				if( deltaY > 0 )
				{
					// 3 scroll taps to jump...
					wxy_sticksyscroll_counter += 1;
				}

				// jump to the top if they have tapped 3+ times quickly enough
				if( wxy_sticksyscroll_counter >= 3 )
				{
					// clear our counter
					wxy_sticksyscroll_counter = 0;

					// only jump to the top of the taget and previous target are the same
					$( target ).scrollTop(0);
					$( "body, html" ).scrollTop(0);
				}

				// reset our counter after a pause in scrolling
				wxy_sticksyscroll_timer = setTimeout( function() {

					// reset our scroll jump counter
					wxy_sticksyscroll_counter = 0;
				}, 400 );
				
			}

		});

	};
	
 	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************
	// FUNCTION DEFS BELOW
	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************
	
	// ****************************************************************************
	// SCROLL EVENT: listeners for window and other scrollable elements
	// ****************************************************************************
	function add_scroll_listeners()
	{
		// ------------------------------------------------------------------------
		// SCROLL EVENT: listen for scroll events on the DOCUMENT only
		// ------------------------------------------------------------------------
		$( window ).on( "scroll", function( evt )
		{
			var self = evt[ "originalEvent" ][ "target" ];

			// clear our timer so it does not fire more than once
			clearTimeout( STICKYSCROLL_TIMER );
			
			// set a delay so we do not save the current scroll position too many times and take up too many resources
			STICKYSCROLL_TIMER = setTimeout( function(){ save_scrolltop( self, "window" ) }, STICKYSCROLL_SAVE_DELAY );
		});

		// ------------------------------------------------------------------------
		// SCROLL EVENT: listen for scroll event on DIV elements
		// ------------------------------------------------------------------------
		$( "div" ).on( "scroll", function( evt )
		{
			var self = evt[ "originalEvent" ][ "target" ];
		
			// clear our timer so it does not fire more than once
			clearTimeout( STICKYSCROLL_TIMER );
			
			// set a delay so we do not save the current scroll position too many times and take up too many resources
			STICKYSCROLL_TIMER = setTimeout( function(){ save_scrolltop( self, "other" ) }, STICKYSCROLL_SAVE_DELAY );

		});
	};
	
	// ****************************************************************************
	// take our saved cookie and process it to restore saved scrolltop(s)
	// ****************************************************************************	
	function restore_saved_scrolltops( scrolltops )
	{
		var this_title = document.title;
		var val, id_item, class_item, target;
		
		// take our scrolltops object and run through its properties
		for( var prop in scrolltops )
		{
			var next_top = scrolltops[ prop ];
			
			// if our next_top has a title that matches, then process it!
			if( String( next_top[ "title" ] ) != "undefined" && String( next_top[ "title" ] ).length > 0 && this_title == next_top[ "title" ] )
			{
				// our title matched, so we are on the right page...
				
				// now see if we can find an element to update
				id_item = $( "#" + next_top[ "css_id" ] );
				class_item = $( "." + next_top[ "css_class" ] );
					
				switch (true )
				{
					case next_top[ "type" ] ==  "window":
						target = $( window );
						break;
						
					case next_top[ "css_id" ] && $( id_item ).length > 0:	
						target = id_item;
						break;
							
					case next_top[ "css_class" ] && $( class_item ).length > 0:	
						target = class_item;
						break;
				}
				
				val = next_top[ "scrolltop" ];
				$( target ).scrollTop( val );
			}
			
			
		}
		
		// ---------------------------------------------
		// now, add the listeners for scrolling events...
		// we wanted to wait until the page was completely loaded,
		// so we don't bump the mouse or scrollbar and save over our saved position(s)
		// ---------------------------------------------
		add_scroll_listeners();

	};
	
	
	// ****************************************************************************
	// read and write a cookie using the contents of the shopping cart...
	// ****************************************************************************
	function save_scrolltop( self, type )
	{
		if( !STARTING_UP )
		{
			var css_id = $( self ).attr("id") || "";
			var css_class = $( self ).attr( "class" ) || "";
			var handle = "";
			var scrolltop = {};
			var val = $( self ).scrollTop() || 0;
			var type = type || "div";
			var title = document.title;
			var data = {};

			// use the title of the document if it is the window element
			if( type == "window" )
			{
				css_class = create_scroll_handle( document.title );
				css_id = "";
			}

			if( String( css_id ).length <= 0 )
			{
				// there is no id, so try to use the class...
				if( String( css_class ).length > 0 )
				{
					// convert the class to a handle we can use
					handle = create_scroll_handle( css_class ); 
				} else {
					// simply quit and don't save this value, since it is an element with no classes or id!
					return;
				}

			} else {
				// okay, we have an ID, use it!
				handle = create_scroll_handle( css_class );
			}

			// build our entry
			data[ "handle" ] = handle;
			data[ "css_id" ] = css_id;
			data[ "css_class" ] = css_class;
			data[ "scrolltop" ] = val;
			data[ "type" ] = type;
			data[ "title" ] = title;

			// now save it to our cookie!
			cookie_handler( "append", STICKYSCROLL_COOKIE, data );
		}
		
		STARTING_UP = false;
	};
	
	// ****************************************************************************
	// filter strings to use as object handles
	// ****************************************************************************
	function create_scroll_handle( raw )
	{
		var raw = raw || "";
		
		// convert to all lowercase
		raw = String( raw ).toLowerCase();
		
		// filter out any illegal object property name characters...
		var handle = String( raw ).replace(/[^a-z0-9_-]*/g, "");

		return handle;
	};
	
	
	// ****************************************************************************
	// read and write a cookie with scroll top positions
	// ****************************************************************************
	function cookie_handler( action, cookie_name, scrolltop )
	{
		var action;
		var cookie_name = cookie_name || "shortbread_cookie";
		var data = data || {};
		var scrolltop = scrolltop || {};
		var currentTime = new Date().getTime();
		var maxTime = 4320000;
		var time, date, cookie_data;
		
		
		// ------------------------------
		// APPEND new content to existing cookie
		// ------------------------------
		if( action == "append" )
		{
			// load any old data
			cookie_data = window.localStorage.getItem( cookie_name );
			
			// see if there is any data stored..
			if( cookie_data )
			{
				// if there is data, try to format it back into a JS object
				data = {};
				
				try {
					data = JSON.parse( cookie_data );
				} catch (e) {
					// if there is an error, just send back a blank object	
					data = {"time_created":"0" };
				}
				
			} else {
				// if not, return a blank cookie
				data = {"time_created":"0" };
			}
			
			// now add our new entry to the old cookie
			data[ scrolltop[ "handle" ] ] = scrolltop;

			// convert our object to a string and the save it to the cookie_data
			cookie_data = JSON.stringify( data );
			
			// now save it!
			window.localStorage.setItem(cookie_name,cookie_data);
		}
		
		// ------------------------------
		// SAVE our cookie content
		// ------------------------------
		if( action == "save" )
		{	
			// be sure to clean out the old cookie value
			window.localStorage.removeItem( cookie_name );
		
			// add a timstamp to our cookie data object
			time = String( parseFloat( currentTime ) + maxTime );
			data["time_created"] = String( time );
			
			// convert our object to a string and the save it to the cookie_data
			cookie_data = JSON.stringify( data );
			
			// now save it!
			window.localStorage.setItem(cookie_name,cookie_data);
		}
	
		// ------------------------------
		// LOAD our cookie content
		// ------------------------------
		if( action == 'load' )
		{
			cookie_data = window.localStorage.getItem( cookie_name );
			
			// see if there is any data stored..
			if( cookie_data )
			{
				// if there is data, try to format it back into a JS object
				data = {};
				
				try {
					data = JSON.parse( cookie_data );
				} catch (e) {
					// if there is an error, just send back a blank object	
					data = {"time_created":"0" };
				}
				
			} else {
				// if not, return a blank cookie
				data = {"time_created":"0" };
			}
			
			// send back our contents
			return data;
		}
	
		// ------------------------------
		// CLEAR our saved data
		// ------------------------------
		if( action == "clear" )
		{
			// just wipe out the entire cookie
			window.localStorage.removeItem( cookie_name );
		}

	};
	
	
	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************
	// PLUGIN DEFS BELOW
	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************
	// ****************************************************************************************************************************************

/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

// end encapsulation
})(jQuery);