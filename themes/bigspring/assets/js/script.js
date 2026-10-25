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

		// pause/play control; starts paused when the visitor prefers reduced motion
		var $toggle = $el.siblings('.carousel-toggle');
		var setToggle = function (playing) {
			$toggle.attr('aria-label', playing ? 'Pause announcements' : 'Play announcements');
			$toggle.find('.fas').toggleClass('fa-pause', playing).toggleClass('fa-play', !playing);
		};
		var playing = !reduceMotion;
		setToggle(playing);
		$toggle.prop('hidden', false).on('click', function () {
			playing = !playing;
			$el.slick(playing ? 'slickPlay' : 'slickPause');
			setToggle(playing);
		});
	});

	// autoplaying value-prop videos: pause/play control, paused under reduced motion
	$('.video-toggle').each(function () {
		var $toggle = $(this);
		var video = $toggle.siblings('video').get(0);
		var label = $toggle.attr('data-label');
		var setToggle = function (playing) {
			$toggle.attr('aria-label', (playing ? 'Pause animation: ' : 'Play animation: ') + label);
			$toggle.find('.fas').toggleClass('fa-pause', playing).toggleClass('fa-play', !playing);
		};
		if (reduceMotion) {
			video.removeAttribute('autoplay');
			video.pause();
		}
		// follow the video's real state, so a blocked autoplay still reads "Play"
		video.addEventListener('play', function () { setToggle(true); });
		video.addEventListener('pause', function () { setToggle(false); });
		setToggle(!video.paused);
		$toggle.prop('hidden', false).on('click', function () {
			if (video.paused) {
				var started = video.play();
				if (started && started.catch) { started.catch(function () {}); }
			} else {
				video.pause();
			}
		});
	});

})(jQuery);