var email = "";

$('.input-section:not(.optional) .text-field').on('change keyup paste', function() {
	if($(this).val()) {
		$(this).next('.animated-button').find('.icon').addClass('next');
	} else {
		$(this).next('.animated-button').find('.icon').removeClass('next');
	}
});

$('.input-section:not(.last) .next-button').click(function() {
	email = $('.input-section .text-field.email').val();
	
	if($('.input-section .text-field.question').val() && $('.input-section .text-field.question').hasClass('question') && $('.input-section .text-field.question').val().substr(-1) !== "?") {
		$('.input-section .text-field.question').val($('.input-section .text-field.question').val()+"?");
	}
	
	$(this).closest('.input-section').addClass("fold-up");
	$(this).closest('.input-section').next('.input-section').removeClass("folded").find('.text-field').focus();
});

$('.input-section:not(.last)').on('keypress', '.text-field', function(e) {console.log($(this).parent().attr('class'));
	if($(this).val() || $(this).parent().hasClass('optional')) {
		if(e.which == 13 || e.which == 9) {console.log('here');
			email = $('.input-section .text-field.email').val();
		
			if($(this).hasClass('question') && $(this).val().substr(-1) !== "?") {
				$('.input-section .text-field.question').val($('.input-section .text-field.question').val()+"?");
			}
			$(this).closest('.input-section').addClass("fold-up");
			$(this).closest('.input-section').next('.input-section').removeClass("folded").find('.text-field').focus();
		}
	}
});

$('.input-section.last').on('keypress', '.text-field', function(e) {
    if($(this).val()) {
		if(e.which == 13) {
			submitForm();
		}
    }
});

$('.input-section.last .next-button').click(function() {
	submitForm();
});

$('.redo-button').click(function() {
	startOver();	
});

$(window).on('load', function() {
	$('.registration-form').fadeIn();
	$('.input-section .text-field').first().focus();
});

$(document).keydown(function (e) {
    var keypressed = (e.keyCode ? e.keyCode : e.which);
    if (keypressed == 0 || keypressed == 9) {
        e.preventDefault();
    }
	if (keypressed == 13) {
		if($('.response-section').hasClass("error") || $('.response-section').hasClass("success")) {
			startOver();
			e.preventDefault();
		}
	}
});

function startOver() {
	$('.input-section.fold-up').addClass("folded").removeClass("fold-up");
	if($('.response-section').hasClass("success")) {
		$('.input-section').first().removeClass("folded").addClass("fold-up").next('.input-section').removeClass("folded").find(".text-field").focus();
		$(".registration-form form").trigger("reset");
		$('.input-section .text-field.email').val(email);
		$('.input-section:not(.optional) .icon').removeClass("next");
	}
	else {
		$('.input-section').first().removeClass("folded").find(".text-field").val('').focus();
		$('.input-section:not(.optional)').first().find(".icon").removeClass("next");
	}
	$('.response-section').removeClass("fold-down error success");
	$("#submitted").val('');
	$('.response-section .message').empty();
}

var form_submit_opts = { 
	beforeSubmit:	prepareSubmit,			// pre-submit callback
	success:		handleResponse,			// post-submit callback
	url:			'draft.php',
	method:			'POST',
	delegation: 	true
};

$('.registration-form form').ajaxForm(form_submit_opts);

function submitForm() {
	$('.input-section .text-field').blur(); // remove focus from all fields
	$('.registration-form form').submit();
}

function prepareSubmit() {
	$('.registration-form header').addClass("sending"); // add rounded corners to header
	$('.input-section.last').addClass("fold-up");
}

function handleResponse(data) {
	if(data.errors) {
		$('.response-section').addClass("error");
		$('.response-section .message').html("<strong>"+data.errors[0].title+"</strong><br />"+data.errors[0].detail);
		$('.response-section .redo-button').attr("title", "Try again.");
	}
	else {
		$('.response-section').addClass("success");
		$('.response-section .message').html("<strong>"+data.success[0].title+"</strong><br />"+data.success[0].detail);
		$('.response-section .redo-button').attr("title", "Submit another question.");
	}
	$('.response-section').addClass("fold-down");
	$('.registration-form header').removeClass("sending"); // remove rounded corners from header
}

