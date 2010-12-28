/*
 * audiOwl
 * Global JS include
 * Requires: jQuery
 */

$(function() {
	$.reject({
		reject: { msie: true },
		close: false,
		closeESC: false
	});

	// Handle form submissions
	$('form').submit(function(e) {
		$.get('/post', $(this).serialize(), function(data) {
			console.log(data);

			// Check for error
			if (data.error) {
				alert('Error: '+data.error);
			}
		}, 'json');

		return false;
	});
});
