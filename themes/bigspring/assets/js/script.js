(function ($) {
  'use strict';

  // Preloader js    
  $(window).on('load', function () {
    $('.preloader').fadeOut(100);
  });
  
  // Accordions
  $('.collapse').on('shown.bs.collapse', function () {
    $(this).parent().find('.ti-angle-right').removeClass('ti-angle-right').addClass('ti-angle-down');
  }).on('hidden.bs.collapse', function () {
    $(this).parent().find('.ti-angle-down').removeClass('ti-angle-down').addClass('ti-angle-right');
  });

  
	//slider
	$('.slider').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		dots: true,
		arrows: false
	});

	// banner carousel — timing read from data attributes set in the partial
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	$('.banner-carousel').each(function () {
		var $el = $(this);
		var speed = parseInt($el.attr('data-autoplay-speed'), 10) || 6000;
		var pauseOnHover = $el.attr('data-pause-on-hover') !== 'false';
		$el.slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			autoplay: !reduceMotion,
			autoplaySpeed: speed,
			pauseOnHover: pauseOnHover,
			pauseOnFocus: true,
			dots: true,
			arrows: false,
			swipe: true,
			touchMove: true,
			touchThreshold: 10,
			accessibility: true,
			fade: true,
			cssEase: 'linear'
		});
	});

})(jQuery);