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

$('.input-section:not(.last) .text-field').on('keypress', function(e) {
	if($(this).val() || $(this).parent().hasClass('optional')) {
		if(e.which == 13 || e.which == 9) {
			email = $('.input-section .text-field.email').val();
			
			if($(this).hasClass('question') && $(this).val().substr(-1) !== "?") {
				$('.input-section .text-field.question').val($('.input-section .text-field.question').val()+"?");
			}
			$(this).closest('.input-section').addClass("fold-up");
			$(this).closest('.input-section').next('.input-section').removeClass("folded").find('.text-field').focus();
		}
    }
});

$('.input-section.last .next-button').click(function() {
	submitForm();
});

$('.redo').click(function() {
	startOver();	
});

$(window).on('load', function() {
	$('.registration-form').fadeIn();
	$('.input-section .text-field').first().focus();
});

$('.input-section.last .text-field').on('keypress', function(e) {
    if($(this).val()) {
		if(e.which == 13) {
			submitForm();
		}
    }
});

$(document).keydown(function (e) {
    var keypressed = (e.keyCode ? e.keyCode : e.which);
    if (keypressed == 0 || keypressed == 9) {
        e.preventDefault();
    }
	if (keypressed == 13 && $("#completed").val() == 1) {
		startOver();
	}
});

function startOver() {
	$('.input-section.fold-up').addClass("folded").removeClass("fold-up");
	$('.input-section').first().removeClass("folded").addClass("fold-up").next('.input-section').removeClass("folded").find(".text-field").focus();
	$('.success-section').removeClass("fold-down");
	$('.input-section:not(.optional) .icon').removeClass("next");
	$("#completed").val(0);
	$('.input-section .text-field.email').val(email);
}

var form_submit_opts = { 
	beforeSubmit:	prepareSubmit,			// pre-submit callback
	success:		submitSuccess,			// post-submit callback
	url:			'submit.php',
	type:			'POST'
};

$('.registration-form form').ajaxForm(form_submit_opts);

function submitForm() {
	$('.registration-form form').submit();
}

function prepareSubmit() {
	$('.registration-form header').addClass("sending");
	$('.input-section.last').addClass("fold-up");
}

function submitSuccess() {
	$('.registration-form header').removeClass("sending");
	$('.success-section').addClass("fold-down");
	$(".registration-form form").trigger("reset");
	$("#completed").val(1);
}

