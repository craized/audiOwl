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
	})
	
	// Start keynav plugin
	$('.key').keynav('key_focus','key');

	// Handle keycodes
	// TAB : 9
	// Arrows: left: 37, up: 38
	// right: 39, down: 40
	$('body').keydown(function(e) {
	});
});
