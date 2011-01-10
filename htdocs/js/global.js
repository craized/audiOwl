/*
 * audiOwl
 * Global JS include
 * Requires: jQuery
 */

$(function() {
	// Reject IE
	$.reject({
		reject: { msie: true },
		close: false,
		closeESC: false
	});

	// Start keynav plugin
	$('.key').keynav('key_focus','key');
	
	// Handle label hover properly
	$('label').live('mouseover',function() {
		$(this).addClass('hover');
	}).live('mouseout',function() {
		$(this).removeClass('hover');
	});

	// Handle input+label focus
	$('input').live('focus blur',function(e) {
		var self = $(this);
		var id = self.attr('id') || '';

		if (id != '') {
			$('label[for="'+id+'"]')
				.trigger(e.type == 'focus' ? 'mouseover' : 'mouseout');
		}
	});

	// Handle form submissions
	$('form').live('submit',function(e) {
		$.get('/post.node.js', $(this).serialize(), function(data) {
			console.log(data);

			// Check for error
			if (data.error) {
				alert('Error: '+data.error);
			}

			// Update HTML if sent
			if (data.html) {
				for (var x in data.html) {
					$('#'+x).html(data.html[x]);
				}
			}
		}, 'json');

		e.preventDefault();
	});

	// Confirm button
	$('button.confirm').live('click',function(e) {
		var self = $(this);
		var c = confirm('Are you sure you want to '+self.attr('name').replace(/_/,' ')+'? Can not be un-done.');

		// If confirmation sucessful
		if (c) {
			var form = self.parents('form');
			self.parents('li').remove();

			// Save Changes
			form.trigger('submit');
		}

		e.preventDefault();
	});
	
	// SETTINGS PAGE
	// Handle adding directory to list
	$('#l_dir').keydown(function(e) {
		var key = e.which;

		// Enter : 13
		if (key == '13') {
			$('#l_add').click();
			e.preventDefault();
		}
	});

	$('#l_add').live('click',function(e) {
		var list = $('#dirlist');
		var dir = $('#l_dir');
		var val = dir.val();

		// Skip if empty value
		if (val == '') {
			e.preventDefault();
			return;
		}
		
		// Add entry to list
		var html = '<li>';
		html += '<input type="hidden" name="dir" value="'+val+'" />';
		html += '<button name="del_dir" class="confirm key">'+val+'</button></li>';
		list.append(html);

		// Empty text field
		dir.val('');
		
		// Submit form
		list.parents('form').trigger('submit');
		e.preventDefault();
	});
});
