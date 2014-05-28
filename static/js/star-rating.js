/*!
 * @copyright &copy; Kartik Visweswaran, Krajee.com, 2014
 * @version 2.0.0
 *
 * A simple yet powerful JQuery star rating plugin that allows rendering
 * fractional star ratings and supports Right to Left (RTL) input.
 * 
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
(function ($) {
    var DEFAULT_MIN = 0;
    var DEFAULT_MAX = 5;
    var DEFAULT_STEP = 0.5;

    var isNumberInputSupported = function () {
        var i = document.createElement("input");
        i.setAttribute("type", "number");
        return i.type !== "text";
    }

    var isEmpty = function (value, trim) {
        return typeof value === 'undefined' || value === null || value === undefined || value == []
            || value === '' || trim && $.trim(value) === '';
    };

    var validateAttr = function ($input, vattr, options) {
        var chk = isEmpty($input.data(vattr)) ? $input.attr(vattr) : $input.data(vattr);
        if (chk) {
            return chk;
        }
        return options[vattr];
    };

    // Rating public class definition
    var Rating = function (element, options) {
        this.$element = $(element);
        this.init(options);
    };

    Rating.prototype = {
        constructor: Rating,
        _parseAttr: function (vattr, options) {
            var self = this, $input = self.$element;
            if ($input.attr('type') === 'range' || $input.attr('type') === 'number') {
                var val = validateAttr($input, vattr, options);
                var chk = DEFAULT_STEP;
                if (vattr === 'min') {
                    chk = DEFAULT_MIN;
                }
                else if (vattr === 'max') {
                    chk = DEFAULT_MAX;
                }
                else if (vattr === 'step') {
                    chk = DEFAULT_STEP;
                }
                var final = isEmpty(val) ? chk : val;
                return parseFloat(final);
            }
            return parseFloat(options[vattr]);
        },
        /**
         * Listens to events
         */
        listen: function () {
            var self = this;
            self.$rating.on("click", function (e) {
                if (!self.inactive) {
                    w = e.pageX - self.$rating.offset().left;
                    self.setStars(w);
                    self.$element.trigger('rating.change', [self.$element.val(), self.$caption.html()]);
                }
            });
            self.$clear.on("click", function (e) {
                if (!self.inactive) {
                    self.clear();
                }
            });
            $(self.$element[0].form).on("reset", function (e) {
                if (!self.inactive) {
                    self.reset();
                }
            });
        },
        initSlider: function (options) {
            var self = this;
            if (isEmpty(self.$element.val())) {
                self.$element.val(0);
            }
            self.initialValue = self.$element.val();
            self.min = (typeof options.min !== 'undefined') ? options.min : self._parseAttr('min', options);
            self.max = (typeof options.max !== 'undefined') ? options.max : self._parseAttr('max', options);
            self.step = (typeof options.step !== 'undefined') ? options.step : self._parseAttr('step', options);
            if (isNaN(self.min) || isEmpty(self.min)) {
                self.min = DEFAULT_MIN;
            }
            if (isNaN(self.max) || isEmpty(self.max)) {
                self.max = DEFAULT_MAX;
            }
            if (isNaN(self.step) || isEmpty(self.step) || self.step == 0) {
                self.step = DEFAULT_STEP;
            }
            self.diff = self.max - self.min;
        },
        /**
         * Initializes the plugin
         */
        init: function (options) {
            this.options = options;
            this.initSlider(options);
            this.checkDisabled();
            $element = this.$element;
            this.containerClass = options.containerClass;
            this.glyphicon = options.glyphicon;
            var defaultStar = (this.glyphicon) ? '\ue006' : '\u2605';
            this.symbol = isEmpty(options.symbol) ? defaultStar : options.symbol;
            this.rtl = options.rtl || this.$element.attr('dir');
            if (this.rtl) {
                this.$element.attr('dir', 'rtl');
            }
            this.showClear = options.showClear;
            this.showCaption = options.showCaption;
            this.size = options.size;
            this.stars = options.stars;
            this.defaultCaption = options.defaultCaption;
            this.starCaptions = options.starCaptions;
            this.starCaptionClasses = options.starCaptionClasses;
            this.clearButton = options.clearButton;
            this.clearButtonTitle = options.clearButtonTitle;
            this.clearButtonBaseClass = !isEmpty(options.clearButtonBaseClass) ? options.clearButtonBaseClass : 'clear-rating';
            this.clearButtonActiveClass = !isEmpty(options.clearButtonActiveClass) ? options.clearButtonActiveClass : 'clear-rating-active';
            this.clearCaption = options.clearCaption;
            this.clearCaptionClass = options.clearCaptionClass;
            this.clearValue = options.clearValue;
            this.$clearElement = options.clearElement;
            this.$captionElement = options.captionElement;
            this.$element.removeClass('form-control').addClass('form-control');
            if (typeof this.$rating == 'undefined' && typeof this.$container == 'undefined') {
                this.$rating = $(document.createElement("div")).html('<div class="rating-stars"></div>');
                this.$container = $(document.createElement("div"));
                this.$container.before(this.$rating);
                this.$container.append(this.$rating);
                this.$element.before(this.$container).appendTo(this.$rating);
            }
            this.$stars = this.$rating.find('.rating-stars');
            this.generateRating();
            this.$clear = !isEmpty(this.$clearElement) ? this.$clearElement : this.$container.find('.' + this.clearButtonBaseClass);
            this.$caption = !isEmpty(this.$captionElement) ? this.$captionElement : this.$container.find(".caption");
            this.setStars();
            this.$element.hide();
            this.listen();
            if (this.showClear) {
                this.$clear.attr({"class": this.getClearClass()});
            }
        },
        checkDisabled: function () {
            var self = this;
            self.disabled = validateAttr(self.$element, 'disabled', self.options);
            self.readonly = validateAttr(self.$element, 'readonly', self.options);
            self.inactive = (self.disabled || self.readonly);
        },
        getClearClass: function () {
            return this.clearButtonBaseClass + ' ' + ((this.inactive) ? '' : this.clearButtonActiveClass);
        },
        generateRating: function () {
            var self = this, clear = self.renderClear(), caption = self.renderCaption(),
                css = (self.rtl) ? 'rating-container-rtl' : 'rating-container',
                stars = self.getStars();
            css += (self.glyphicon) ? ((self.symbol == '\ue006') ? ' rating-gly-star' : ' rating-gly') : ' rating-uni';
            self.$rating.attr('class', css);
            self.$rating.attr('data-content', stars);
            self.$stars.attr('data-content', stars);
            var css = self.rtl ? 'star-rating-rtl' : 'star-rating';
            self.$container.attr('class', css + ' rating-' + self.size);

            if (self.inactive) {
                self.$container.removeClass('rating-active').addClass('rating-disabled');
            }
            else {
                self.$container.removeClass('rating-disabled').addClass('rating-active');
            }

            if (typeof self.$caption == 'undefined' && typeof self.$clear == 'undefined') {
                if (self.rtl) {
                    self.$container.prepend(caption).append(clear);
                }
                else {
                    self.$container.prepend(clear).append(caption);
                }
            }
            if (!isEmpty(self.containerClass)) {
                self.$container.removeClass(self.containerClass).addClass(self.containerClass);
            }
        },
        getStars: function () {
            var self = this, numStars = self.stars, stars = '';
            for (var i = 1; i <= numStars; i++) {
                stars += self.symbol;
            }
            return stars;
        },
        renderClear: function () {
            var self = this;
            if (!self.showClear) {
                return '';
            }
            var css = self.getClearClass();
            if (!isEmpty(self.$clearElement)) {
                self.$clearElement.removeClass(css).addClass(css).attr({"title": self.clearButtonTitle});
                self.$clearElement.html(self.clearButton);
                return '';
            }
            return '<div class="' + css + '" title="' + self.clearButtonTitle + '">' + self.clearButton + '</div>';
        },
        renderCaption: function () {
            var self = this, val = self.$element.val();
            if (!self.showCaption) {
                return '';
            }
            var html = self.fetchCaption(val);
            if (!isEmpty(self.$captionElement)) {
                self.$captionElement.removeClass('caption').addClass('caption').attr({"title": self.clearCaption});
                self.$captionElement.html(html);
                return '';
            }
            return '<div class="caption">' + html + '</div>';
        },
        fetchCaption: function (rating) {
            var self = this;
            var val = parseFloat(rating);
            var css = isEmpty(self.starCaptionClasses[val]) ? self.clearCaptionClass : self.starCaptionClasses[val];
            var cap = !isEmpty(self.starCaptions[val]) ? self.starCaptions[val] : self.defaultCaption.replace(/\{rating\}/g, val);
            var caption = (val == self.clearValue) ? self.clearCaption : cap;
            return '<span class="' + css + '">' + caption + '</span>';
        },
        getDecimalPlaces: function (num) {
            var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
            if (!match) {
                return 0;
            }
            return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
        },
        applyPrecision: function (val) {
            var self = this, precision = self.getDecimalPlaces(self.step),
                truncatedNum = val.toFixed(precision);
            return parseFloat(truncatedNum);
        },
        getValueFromPosition: function (pos) {
            var self = this, percentage, val, maxWidth = self.$rating.width();
            percentage = (pos / maxWidth);
            val = (this.min + Math.round(self.diff * percentage / this.step) * this.step);
            if (val < this.min) {
                val = this.min;
            }
            else if (val > this.max) {
                val = this.max;
            }
            val = this.applyPrecision(parseFloat(val));
            if (self.rtl) {
                val = self.max - val;
            }
            return val;
        },
        setStars: function (pos) {
            var self = this, min = self.min, max = self.max, step = self.step,
                val = arguments.length ? self.getValueFromPosition(pos) : (isEmpty(self.$element.val()) ? 0 : self.$element.val()),
                width = 0, maxWidth = self.$rating.width(), caption = self.fetchCaption(val);
            width = (val - min) / max * 100;
            if (self.rtl) {
                width = 100 - width;
            }
            self.$element.val(val);
            width += '%';
            self.$stars.css('width', width);
            self.$caption.html(caption);
        },
        clear: function () {
            var self = this;
            var title = '<span class="' + self.clearCaptionClass + '">' + self.clearCaption + '</span>';
            self.$stars.removeClass('rated');
            if (!self.inactive) {
                self.$caption.html(title);
            }
            self.$element.val(self.clearValue);
            self.setStars();
            self.$element.trigger('rating.clear');
        },
        reset: function () {
            var self = this;
            self.$element.val(self.initialValue);
            self.setStars();
            self.$element.trigger('rating.reset');
        },
        update: function (val) {
            if (arguments.length > 0) {
                var self = this;
                self.$element.val(val);
                self.setStars();
            }
        },
        refresh: function (options) {
            var self = this;
            if (arguments.length) {
                var cap = '';
                self.init($.extend(self.options, options));
                if (self.showClear) {
                    self.$clear.show();
                }
                else {
                    self.$clear.hide();
                }
                if (self.showCaption) {
                    self.$caption.show();
                }
                else {
                    self.$caption.hide();
                }
            }
        }
    };

    //Star rating plugin definition
    $.fn.rating = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function () {
            var $this = $(this),
                data = $this.data('rating'),
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data('rating', (data = new Rating(this, $.extend({}, $.fn.rating.defaults, options, $(this).data()))));
            }

            if (typeof option === 'string') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.rating.defaults = {
        stars: 5,
        glyphicon: true,
        symbol: null,
        disabled: false,
        readonly: false,
        rtl: false,
        size: 'md',
        showClear: true,
        showCaption: true,
        defaultCaption: '{rating} Stars',
        starCaptions: {
            0.5: 'Half Star',
            1: 'One Star',
            1.5: 'One & Half Star',
            2: 'Two Stars',
            2.5: 'Two & Half Stars',
            3: 'Three Stars',
            3.5: 'Three & Half Stars',
            4: 'Four Stars',
            4.5: 'Four & Half Stars',
            5: 'Five Stars'
        },
        starCaptionClasses: {
            0.5: 'label label-danger',
            1: 'label label-danger',
            1.5: 'label label-warning',
            2: 'label label-warning',
            2.5: 'label label-info',
            3: 'label label-info',
            3.5: 'label label-primary',
            4: 'label label-primary',
            4.5: 'label label-success',
            5: 'label label-success'
        },
        clearButton: '<i class="glyphicon glyphicon-minus-sign"></i>',
        clearButtonTitle: 'Clear',
        clearButtonBaseClass: 'clear-rating',
        clearButtonActiveClass: 'clear-rating-active',
        clearCaption: 'Not Rated',
        clearCaptionClass: 'label label-default',
        clearValue: 0,
        captionElement: null,
        clearElement: null,
        containerClass: null
    };

    /**
     * Convert automatically number inputs with class 'rating'
     * into the star rating control.
     */
    $(function () {
        var $input = isNumberInputSupported() ? $('input.rating[type=number]') : $('input.rating[type=text]');
        if ($input.length > 0) {
            $input.rating();
        }
    });
}(jQuery));