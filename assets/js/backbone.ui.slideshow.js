/* Backbone UI: Slideshow
 * Source: https://github.com/backbone-ui/slideshow
 * Copyright © Makesites.org
 *
 * Initiated by Makis Tracend (@tracend)
 * Distributed through [Makesites.org](http://makesites.org)
 * Released under the [MIT license](http://makesites.org/licenses/MIT)
 */

(function($, _, Backbone, APP) {

	// support for Backbone APP() view if available...
	var View = ( typeof APP != "undefined" && typeof APP.View != "undefined" ) ? APP.View : Backbone.View;

	var Slideshow = View.extend({
		// default options
		options: {
			width : "100%",
			height: "100%",
			num: 0,
			slides: 0,
			autoplay: false,
			autoloop: false,
			transition: true,
			timeout: 2000,
			_direction: "right"
		},

		events : {
			"click .prev" : "clickPrev",
			"click .next" : "clickNext",
			"click .nav a" : "clickBullet",
			"webkitTransitionEnd " : "_transitionEnd"
		},

		timer: false,

		initialize: function(){
			var self = this;
			window.addEventListener('resize', function(){ self.position() }, false);
			//

			return View.prototype.initialize.apply(this, arguments );
		},

		// default render - may be overriden if postRender is included
		render: function(){
			if(APP) {
				return View.prototype.render.call(this);
			} else {
				this.preRender();
				this.postRender();
			}
		},

		preRender: function(){
			// #1 find the slide number based on either the data or the markup
			this.options.slides = ( this.collection ) ? this.collection.length : $(this.el).find(".slide").length;
		},

		postRender: function(){
			var self = this;
			// render slide dimensions as a number
			this.options.width = this._getSize(this.options.width, $(this.el).width() );
			this.options.height = this._getSize(this.options.height, $(this.el).height() );
			// stop now if we only have one slide
			if( this.options.slides == 1 ) return;
			// slight delay to let the DOM rest
			setTimeout(function(){
				self.position();
				// set the first media element as active
				self.activate( 0 );
			}, 100);
		},

		clickPrev : function( e ){
			e.preventDefault();
			var prev = $(this.el).find(".slide.active").prev().index();
			if( prev > -1 ) this.activate( prev );
		},

		clickNext : function( e ){
			e.preventDefault();
			var next = $(this.el).find(".slide.active").next().index();
			if( next > -1 ) this.activate( next );
		},

		clickBullet : function( e ){
			e.preventDefault();
			var num = $(e.target).closest("li").index();
			this.activate( num );
		},

		position : function(){

			var $wrapper = $(this.el).find(".wrapper"),
				elWidth = $(this.el).width();

			$(this.el).find(".slide").css({
				width : this.options.width,
				height : this.options.height
			});
			// update values...
			/*
			if( $(this.el).find(".slide:first").length ){
				this.options.width = $(this.el).find(".slide:first").width();
				this.options.height = $(this.el).find(".slide:first").height();
			}
			*/
			// wrapper can't be smaller than the el width
			var wrapperWidth = Math.max( this.options.width * this.options.slides, elWidth );
			$wrapper.css({
				width : wrapperWidth,
				height : this.options.height
			});

			// position the wrapper
			this.options.overflow = wrapperWidth - elWidth;

			if (this.options.transition) {
				//$wrapper.removeClass("transition").css({ marginLeft : -1 * this.options.num * this.options.width }).delay("100").addClass("transition");
				$wrapper.removeClass("transition").css('-webkit-transform', 'translate3d('+ -1 * this.options.num * this.options.width +'px,0,0)').delay("100").addClass("transition");
			} else {
				//$wrapper.css({ marginLeft : -1 * this.options.num * this.options.width });
				$wrapper.css('-webkit-transform', 'translate3d('+ -1 * this.options.num * this.options.width +'px,0,0)');
			}
		},

		activate : function( num ){
			// variables
			var self = this;
			var $wrapper = $(this.el).find(".wrapper");
			// prerequisite
			if( _.isUndefined( $wrapper ) ) return;
			// set direction
			this.options._direction = ( this.options.num - num > 0 )? "left" : "right";
			// if looping make sure there's always a slide on the sides
			if( this.options.autoloop ){
				var $first = $(this.el).find(".slide:first");
				var $last = $(this.el).find(".slide:last");
				if( num == 0 ){
					$last.remove();
					$wrapper.prepend($last);
					num++;
					// offset the viewport
					if( this.options.transition ) $wrapper.removeClass("transition");
					//$wrapper.css({ marginLeft : -1 * (num+1) * this.options.width });
					$wrapper.css('-webkit-transform', 'translate3d('+ -1 * (num+1) * this.options.width +'px,0,0)');
				} else if( num == this.options.slides-1 || (( num * this.options.width) > this.options.overflow ) ){
					$first.remove();
					$wrapper.append($first);
					num--;
					// offset the viewport
					if( this.options.transition ) $wrapper.removeClass("transition");
					//
					//$wrapper.css({ marginLeft : -1 * (num-1) * this.options.width });
					$wrapper.css('-webkit-transform', 'translate3d('+ -1 * (num-1) * this.options.width +'px,0,0)');
				}
			}
			// set the active classes
			$(this.el).find(".slide:eq("+ num +")").addClass("active").siblings().removeClass("active");
			$(this.el).find(".nav li:eq("+ num +")").addClass("selected").siblings().removeClass("selected");

			// position the wrapper
			// limit the container to the right side
			var wrapperPos = Math.min( ( num * this.options.width), this.options.overflow);
			$wrapper.delay(100).queue(function(){
				// re-enable transitions
				if( self.options.transition ) $(this).addClass("transition");
				//$(this).css({ marginLeft : -1 * wrapperPos });
				$(this).css('-webkit-transform', 'translate3d('+ -1 * wrapperPos +'px,0,0)');
				$(this).dequeue();
			});

			// update the prev-next arrows - remove as needed
			if( this.options.autoloop || this.options.overflow <= 0 ){
				// hide arrows
				$(this.el).find(".prev").hide();
				$(this.el).find(".next").hide();
			} else if( num == 0 ){
				$(this.el).find(".prev").hide();
				$(this.el).find(".next").show();
			} else if( (num == this.options.slides-1) || (wrapperPos && wrapperPos == this.options.overflow) ){
				$(this.el).find(".prev").show();
				$(this.el).find(".next").hide();
			} else {
				$(this.el).find(".prev").show();
				$(this.el).find(".next").show();
			}
			// auto play next slide
			if( this.options.autoplay && ( num < this.options.slides-1 || ( this.options.slides == 2 && num <= this.options.slides-1 )) ){
				if( this.timer ) clearTimeout( this.timer );
				this.timer = setTimeout(function(){
					//
					self.activate( self.options.num+1 );
				}, this.options.timeout);
			}
			// save current slide
			this.options.num = num;

		},

		_getSize: function(value, max){
			// if a number just return the value
			if( !isNaN( value ) ) return value;
			//
			try{
				// if in pixels return the numberic value
				if( value.substr(-2) == "px") return parseInt( value );
				// if a percentage, calculate it using the max
				if( value.substr(-1) == "%") return max * ( value.substr(0, value.length-1)/ 100);
			} catch( e ){
				//console.log( e );
				// if NaN...
				return 0;
			}
		},

		_transitionEnd: function(){
			// internal logic
			//...
			// user logic
			this.transitionEnd();
		},

		transitionEnd: function(){

		}

	});

	// fallbacks
	if( _.isUndefined( Backbone.UI ) ) Backbone.UI = {};
	Backbone.UI.Slideshow = Slideshow;

	// Support module loaders
	if ( typeof module === "object" && module && typeof module.exports === "object" ) {
		// Expose as module.exports in loaders that implement CommonJS module pattern.
		module.exports = Slideshow;
	} else {
		// Register as a named AMD module, used in Require.js
		if ( typeof define === "function" && define.amd ) {
			//define( "backbone.ui.slideshow", [], function () { return Slideshow; } );
			//define( ['jquery', 'underscore', 'backbone'], function () { return Slideshow; } );
			define( [], function () { return Slideshow; } );
		}
	}
	// If there is a window object, that at least has a document property
	if ( typeof window === "object" && typeof window.document === "object" ) {
		window.Backbone = Backbone;
		// update APP namespace
		if( typeof APP != "undefined" && (_.isUndefined( APP.UI ) || _.isUndefined( APP.UI.Slideshow ) ) ){
			APP.UI = APP.UI || {};
			APP.UI.Slideshow = Backbone.UI.Slideshow;
			window.APP = APP;
		}
	}


})(this.jQuery, this._, this.Backbone, this.APP);