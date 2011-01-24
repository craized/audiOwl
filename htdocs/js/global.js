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


	// Handle page turns
	$('a[rel="page"]').live('click',function() {
		// Determine page
		var self = $(this);
		var page = self.attr('href').replace(/#/,'');
		
		// Request page data
		$.get(page+'.html', function(data) {
			// Hide current section
			$('section.page').hide();

			// Check if page is already loaded
			var sect = $('#p_'+page);
			if (sect.length == 0) {
				sect = $('<section id="p_'+page+'" class="page hidden"></section>');
			}

			// Insert file html
			sect.html(data);

			// Add to DOM + Hide existing
			$('section.page:visible').fadeOut('fast');
			sect.appendTo('#wrapper').fadeIn('fast');

			// Handle nav changes
			$('a[rel="page"].active').removeClass('active');
			self.addClass('active');
			
			// Start keynav plugin
			$('.key').keynav('key_focus','key');
		});
	});

	// Check hash tag on load
	var hash = location.hash || '';
	
	// Call event on link to this hash
	if (hash !== '') {
		$('a[href="'+hash+'"]').click();
	}

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
		var self = $(this);

		$.get('/post.node.js', $(this).serialize(), function(raw) {
			console.log(raw);
			var data = $.parseJSON(raw);
			
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

			// Handle requests for information
			if (data.req) {
				var html = '<label for="inforeq">'+data.req+'</label><br />'
						+'<input type="text" name="custom" id="inforeq" style="width:300px;" value="/<artist>/<album>/<track>.<title>" />';
				self.append($('<div>'+html+'</div>'));
			}

			// Handle debug data
			if (data.debug) {
				console.log(data.debug);

				var fmt = raw.replace(/\{/g,'{'+"\n\t")
							.replace(/\}/g,"\n"+'}')
							.replace(/\:/g,' : ');
				$('.debug').text(fmt);
			}
		});

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
