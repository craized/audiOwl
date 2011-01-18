GLOBAL.in_array = function (needle, haystack, argStrict) {
   // Checks if the given value exists in the array  
   // 
   // version: 1009.2513
   // discuss at: http://phpjs.org/functions/in_array
   // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
   // +   improved by: vlado houba
   // +   input by: Billy
   // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
   // *     example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
   // *     returns 1: true
   // *     example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
   // *     returns 2: false
   // *     example 3: in_array(1, ['1', '2', '3']);
   // *     returns 3: true
   // *     example 3: in_array(1, ['1', '2', '3'], false);
   // *     returns 3: true
   // *     example 4: in_array(1, ['1', '2', '3'], true);
   // *     returns 4: false
    var key = '', strict = !!argStrict;
 
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }
 
    return false;
};


// http://kevin.vanzonneveld.netV// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// +   improved by: mdsjack (http://www.mdsjack.bo.it)
// +   improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
// +      input by: Erkekjetter
// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// +      input by: DxGx
// +   improved by: Steven Levithan (http://blog.stevenlevithan.com)
// +    tweaked by: Jack
// +   bugfixed by: Onno Marsman
// *     example 1: trim('    Kevin van Zonneveld    ');
// *     returns 1: 'Kevin van Zonneveld'
// *     example 2: trim('Hello World', 'Hdle');
// *     returns 2: 'o Wor'
// *     example 3: trim(16, 1);
// *     returns 3: 6
GLOBAL.trim = function(str, charlist) {
	var whitespace, l = 0, i = 0;
	str += '';
			
	if (!charlist) {
		// default list
		whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
	}
	else {
		// preg_quote custom list
		charlist += '';
		whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
	}

	l = str.length;
	for (i = 0; i < l; i++) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(i);
			break;
		}
	}

	l = str.length;
	for (i = l - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(0, i + 1);
			break;
		}
	}

	return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}
