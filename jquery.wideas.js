/*
 * WideAs v0.2 - jQuery varying width image slider
 * Copyright (c) 2012 Daniel Angel Bradford
 *
 * Dual licensed under the MIT and GPL licenses:
 * 	http://www.opensource.org/licenses/mit-license.php
 * 	http://www.gnu.org/licenses/gpl.html
 */

!(function($){
 
	$.wideAs = function(element, options) {
	
		var slider = this;
		slider.element = element;
		slider.element.data('wideAsSlider', slider);

		slider.init = function() {		

			slider.options = o = $.extend({}, $.wideAs.defaults, options);
			slider.$navigation = $('<ul class="nnNavigation" />'); //$nnNavigation
			slider.$prevNext = $('<ul class="nnPrevNext"><li class="nnPrev"><a href="#" data-pn="prev">' + o.prevText + '</a></li><li class="nnNext"><a href="#" data-pn="next">' + o.nextText + '</a></li></ul>');
			slider.$slides = slider.element.children('li');
			slider.scrollerWidth = 0;
			slider.slideComplete = true;
	
			slider.$slides.wrapAll('<div class="nnScroller" />');
	
			slider.$scroller = $('.nnScroller', slider.element);

			slider.newLeft = parseInt(slider.$scroller.css('left'));

			slider.$slides.each(function(x) {

				if(o.height) {
					var originalWidth = $(this).children('img').attr('width'),
						imgProportion = originalWidth/900,
						newWidth = Math.round(o.height*imgProportion);

					$(this).children('img').attr({'height' : o.height, 'width' : newWidth});
				}

				var slideWidth = $(this).outerWidth(true);

				$(this).attr('data-width', slideWidth);
	
				slider.scrollerWidth += slideWidth;
	
				if(o.navigation == 'thumbnails') {
					slider.$navigation.append('<li class="slide' + x + ( (x==0) ? ' current' : '' ) + '"><img src="' + $('img', this).attr('src').replace('photo-set', 'photo-set-nav') + '" ' + ((o.thumbWidth) ? 'width="' + o.thumbWidth + '" ' : '') + ((o.thumbHeight) ? ' height="' + o.thumbHeight + '" ' : '') + 'alt="a thumbnail for image" /></li>');
				} else if(o.navigation) {
					slider.$navigation.append('<li class="slide' + x + ( (x==0) ? ' current' : '' ) + '">' + (x+1) + '</li>');
				}
	
			});
	
			slider.$scroller.css({'width' : slider.scrollerWidth + 'px'});
	
	
			slider.$navSlides = $('li', slider.$navigation);
			slider.$currentSlide = $('li:first', slider.$scroller).addClass('current');
	
			switch(o.navigation) {
				case 'dots':
					slider.$navigation.addClass('dots').insertAfter(slider.element);
					break;
	
				case 'thumbnails':
					slider.$navigation.addClass('thumbnails').insertAfter(slider.element);
					break;
			}
			
			if(o.prevNext) {
				slider.$prevNext.insertBefore(slider.$navigation);
			}
			
			if(o.startAt && parseInt(o.startAt, 10) <= slider.$slides.length) {
				slider.goTo(parseInt(o.startAt, 10));
			}


			$('li', slider.$navigation).click(function() {
				var toTarget = $(this).index();
				slider.goTo(toTarget);
				return false;
			});

			$('li a', slider.$prevNext).click(function() {
				var direction = $(this).attr('data-pn');
				if(direction == 'prev') {
					slider.prev();
				} else {
					slider.next();					
				}
				return false;
			});

			
			$(document).keydown(function(e) {
				var code = (e.keyCode ? e.keyCode : e.which);
				switch(code) {
					case 39:
						slider.next();
						break;
					case 37:
						slider.prev();
						break;
				}
				
			});

			$('#mainContainer').css({'background-image' : 'none' }); //remove this

		}

		slider.next = function() {

			var next = (slider.$currentSlide.index() >= (slider.$slides.length-1) ) ? ((o.autoRewind) ? 0 : slider.$slides.length-1) : slider.$currentSlide.index() + 1;
			slider.goTo(next);
		
		}


		slider.prev = function() {

			var prev = (slider.$currentSlide.index() > 0) ? slider.$currentSlide.index() - 1 : ((o.autoRewind) ? slider.$slides.length-1 : 0);
			slider.goTo(prev);
	
		}
		
		slider.goTo = function(to) {
		
			to = parseInt(to, 10);
			
			if(isNaN(to)) { return false; }

			if(slider.slideComplete) {

				var from = slider.$currentSlide.index();
				var distance = slider.getDistance(from, to);

				o.onBeforeSlide.apply(slider);

				slider.$scroller.animate({ left : (slider.newLeft + distance) + 'px' }, o.animSpeed, o.easing , function() {
					slider.newLeft += distance;
					slider.slideComplete = true;
					o.onSlide.apply(slider);
				});
	
				slider.$slides.removeClass('current');
				slider.$navSlides.removeClass('current');
	
				slider.$currentSlide = slider.$slides.eq(to).addClass('current');
				slider.$navSlides.eq(to).addClass('current');
			}
			slider.slideComplete = false;

		}

		slider.getDistance = function(from, to) {

			var distance = 0;

			if(from == to) {
				return 0;
			}

			if(from < to) { //moving forward
				for(var i = from; i <= (to-1); i++) {
					distance -= parseInt($('li', slider.element).eq(i).attr('data-width'));
				}

			} else if(from > to) {
				for(var i = to; i <= (from-1); i++) {
					distance += parseInt($('li', slider.element).eq(i).attr('data-width'));
				}					
			}

			return distance;
		}
		
		slider.init();

	};
	



	$.wideAs.defaults = {
		animSpeed : 500,
		autoPlay : true,
		autoRewind : true,
		easing : 'swing',
		height : null,
		navigation : 'dots',
		nextText : 'Next &raquo;',
		prevNext : false,
		prevText : '&laquo; Prev',
		onBeforeSlide : function() {},
		onInit : function() {},
		onSlide : function() {},
		startAt : null,
		thumbWidth : null,
		thumbHeight : null
	};



	$.fn.wideAs = function(settings, param) {

		return this.each(function() {

			var element = $(this);
			var wideAsSlider = element.data('wideAsSlider');

			if ((typeof(settings)).match('object|undefined')) {

				if (!wideAsSlider) {
					(new $.wideAs(element, settings));
				}

			} else if(typeof settings =='string') {

				var fn = wideAsSlider[settings];

				if(!param) {

					if(typeof fn == 'function') {
						fn();
					}
				} else {
				
					if(typeof fn == 'function') {
						fn(param);
					}

				}
			}	
		});
	};



})(jQuery);



