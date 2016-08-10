(function(window, undefined) {

	var doc = window.document;

	"Width Height".split(" ").forEach(function (item ,i) {
		doc.body.style[item.toLowerCase()] = doc.documentElement["client" + item] + "px";
	});

	var config = {
		wraperImgs: document.querySelectorAll(".m-item1, .m-item2"),
		stayHere: false,
		lastTime: 0,
		process: function (options) { 				// 如果选项没有process, 则默认为每加载完一张图，计算加载的百分比，再显示出来 	
			var length = options.srcs.length,
				percent = Math.ceil((options.loadingCount / length) * 100),
				loadingData = doc.querySelector(".loading-data"),
				loadingProcess = doc.querySelector(".loading-process");

			if(loadingData) {
				loadingData.innerHTML = percent + "%";
			}

			if(loadingProcess) {
				loadingProcess.style.width = percent + "%";
			}
		},

		src: "music.mp3",
		autoplay: true,
		useReset: true,

		usePreload: true,
		useMusic: true,
		useWeixin: true,
		useOpen: true,
		useClose: true,
		useMasker: true,

		open: ".open",
		close: ".close",
		masker: ".masker",
		swiperSlide: ".m-item",

		make: false
	}

	var fn = {
		// 方法extend将参数defaults和参数opt合并，并且支持多个参数合并。如果最后一个参数为布尔true，支持深度拷贝。参数defaults为默认对象, 参数opt是被合并对象。
		extend: function (target, src) {
			var args = Array.prototype.slice.call(arguments),
				len = args.length,
				deep, applyParam = [target];

			if(len === 1) {
				return target;
			}
			// 如果最后的参数是布尔值，则从参数数组args中删除。设置为数组applyParam的第三个元素
			if(typeof (deep = args[len - 1]) === 'boolean') {
				args.pop();
				applyParam[2] = deep;			
			}	
			// 参数数组args删除目标对象，此时args中剩下只有源对象(被合并的对象)，获取源对象的个数
			args.shift();
			len = args.length;

			if(len > 1) {		// 如果源对象个数大于1, 遍历args，将源对象设置为数组applyParam的第二个元素，再次调用this.extend(target, src, deep);
				for(var i = 0; i < len; i++) { 		 	
					applyParam[1] = args[i];
					this.extend.apply(null, applyParam); 
				}
			}else {
				for(var key in src) { 			// 遍历源对象src, 检测它的自定义属性key。如果deep为true，表示支持拷贝对象最底层的属性值，并且key值为对象，调用this.extend(target, src, deep)方法。否则将源对象属性/值深度拷贝到目标对象上。
					if(src.hasOwnProperty(key)) {
						if(deep === true && Object.prototype.toString.call(src[key]) === '[object Object]') {
							this.extend(target, src[key], true);
						}else {
							target[key] = src[key];
						}
					}
				}
			}
			return target;
		},

		cacheActiveIndex: -1,

		getPage: function (index) {
			return  doc.querySelectorAll(body.config.swiperSlide).item(index);
		},

		mapPage: function () {
			var index = swiper.activeIndex,
	            resetIndex = this.cacheActiveIndex,
	            page = body.config.page;

	        this.cacheActiveIndex = index;
		    
	        page[index] && 
	        !console.log('init page' + index) && 
	        page[index].init &&
	        page[index].init();

	        if(!body.config.useReset) {
	        	return;
	        }
	        
	        page[resetIndex] &&
	        !console.log('reset page' + resetIndex) && 
	        page[resetIndex].reset &&
	        page[resetIndex].reset();
		},

	    countWidth: function (disScore, i) {
	        if(disScore >= 2) {
	            disScore -= 2;
	            i.pop().style.width = "0%";
	            fn.countWidth(disScore, i);
	        }else {
	            var percent =  ( (2 - disScore) / 2) * 100 + '%';
	            i[i.length - 1].style.width = percent;
	        }
	    },

	    countScore: function () {
	        var score = this.target.querySelectorAll('.score');

	        if(!score.length) {
	        	return;
	        }

	        for(var i = 0, l = score.length; i < l; i++) {
	            var scoreText = score[i].querySelector('.count').textContent,
	                scoreNumber = parseFloat(scoreText),
	                percent, ii = Array.prototype.slice.call(score[i].querySelectorAll('i')), disScore = 0;

	            disScore = 10 - scoreNumber;
	            fn.countWidth(disScore, ii);
	        }
	    },

	    close: function () {
	        var self = this,
	        	masker = this.target.querySelector(body.config.masker);
	        if(!masker) {
	        	return;
	        }

	        var close = masker.querySelectorAll(body.config.close);

	        if(!close) {
	        	return;
	        }

	        for(var i = 0, l = close.length; i < l; i++) {
	        	this.bind(close[i], "onclick", function (e) {
	                masker.classList.remove("cur");
	                var cur = masker.querySelector(".cur");
	                cur && cur.classList.remove("cur");
	            });
	        }
	    },

	    open: function () {
	        var self = this,
	        	masker = this.target.querySelector(body.config.masker);

	        if(!masker) {
	        	return;
	        }

	        var li = masker.querySelectorAll("li"),
	            open = this.target.querySelectorAll(body.config.open);

	        if(!open || !open.length) {
	        	return;
	        }

	        for(var i = 0, l = open.length; i < l; i++) {
	            open[i].index = i;
	            this.bind(open[i], "onclick", function (e) {    
	            	self.addClass(masker, "cur");
	            	self.addClass(li[this.index], "cur");
	            });
	        }
	    },

	    reset: function () {
	    	var cache = this.cache,
	    		type;

	    	for(var key in cache) {
	    		type = cache[key].type.split(".")[0];

    			if(type in hooks) {
    				hooks[type].call(this, cache[key]);
    			}

    			this.removeData(key);
	    	}
	    }
	}

	var expand = {

		bind: function (el, type, fn) {

	        this.data(el, type, fn, "event." + type);

	        if(~type.indexOf('on')) {
	            el[type] = fn;
	        }else {
	            el.addEventListener(type, fn, false);
	        }

	    },

	    unbind: function (el, type, fn) {

	        if(~type.indexOf('on')) {
	            el[type] = null;
	        }else {
	            el.removeEventListener(type, fn, false);
	        }
	    },

	    data: function (el, name, data, type) {
	    	var cache = this.cache,
				ec, key, initValue;

			if(!cache) {
				this.cache = cache = {};
			}

			ec = cache[this.uuid++] = {};

			ec.type = type;
			ec[name] = data;

			if(el) {
				ec.target = el;
				initValue = el[name];

				if(initValue === undefined) {
					ec.initValue = getComputedStyle(el, null)[name];
				}

				ec.initValue = el[name];
			}else {
				ec[name] = data;
			}
	    },

	    removeData: function (id) {
	    	var cache = this.cache,
	    		ec;

	    	if(!id) {
	    		return;
	    	}

	    	ec = cache[id];

	    	if(!ec) {
	    		return;
	    	}

	    	delete cache[id];
	    },

	    addClass: function (el, cla) {
	    	this.data(el, "className", cla, "className." + cla);
	    	el.classList.add(cla);
	    },

	    removeClass: function (el, cla) {
	    	this.data(el, "className", cla, "className." + cla);
	    	el.classList.remove(cla);
	    },

	    setInterval: function (fn, looper) {
	    	var timer = setInterval(function () {
	    		fn();
	    	}, looper);

	    	this.data(null, "timer", timer, "setInterval.timer");
	    },

	    uuid: 0
	}

	var hooks = {
		event: function (cache) {
			var el = cache.target,
				type = cache.type.split(".")[1],
				fn = cache[type];

			this.unbind(el ,type, fn);
		},

		className: function (cache) {
			cache.target.className = cache.initValue;
		},

		setInterval: function (cache) {
			clearInterval(cache.timer);
		}
	}

	var body = {
		init: function (options) {
			this.config = fn.extend({}, this.config, options);
			
			if(this.config.usePreload) {
				this.preload.init(this.config);
			}else {
				this.wraper.init(this.config);
			}
			if(options.useMusic) {
				this.wraper.music.init(this.config);
			}
		},

		target: doc.body,

		config: config,	

		preload: {
			target: document.querySelector("#Jpreload"),

			init: function (options) {
				this.config = options;
				this.target.classList.remove("hide");
				this.loadPreLoadImgs(options);
			},

			loadImgs: function (options, status) {
				var wrapers, imgs = [], 
					srcImgs,
					status = status === "preload" ? true : false,
					dataSrcImgs, 
					dataBackgroundImgs,
					process,
					success;

				wrapers = status ? this.target : options.wraperImgs;

				if(!wrapers.length) {
					wrapers = [wrapers];
				}

				for(var i = 0, l = wrapers.length; i < l; i++) {
					if(wrapers[i].nodeType === 1 && wrapers[i].nodeName.toLowerCase !== "img") {

						srcImgs = wrapers[i].querySelectorAll("[src]"),
						dataSrcImgs = wrapers[i].querySelectorAll("[data-src]"),
						dataBackgroundImgs = wrapers[i].querySelectorAll("[data-background]");

						if(srcImgs && srcImgs.length) {
							Array.prototype.push.apply(imgs, srcImgs);
						}

						if(dataSrcImgs && dataSrcImgs.length) {
							Array.prototype.push.apply(imgs, dataSrcImgs);
						}

						if(dataBackgroundImgs && dataBackgroundImgs.length) {
							Array.prototype.push.apply(imgs, dataBackgroundImgs);
						}
					}

				}

				options.srcs = imgs;

				success = status ? this.loadWraperImgs : this.success;

				if(status) {
					options.startTime = new Date().getTime();
				}

				if(imgs.length) {
					process = status ? null : this.process;
					this.loadSrc(options, process, success);
				}else {
					success(options);
				}
			},

			loadPreLoadImgs: function (options) {
				this.loadImgs(options, "preload");
			},

			loadWraperImgs: function (options) {
				this.loadImgs(options, "wraper");
			},
			
			success: function (options) {
				var self = this,
					endTime = options.endTime = new Date().getTime(),
					startTime = options.startTime,
					disTime = endTime - startTime,
					timer = null, lastTime;

				if(options.stayHere) {
					return;
				}

				lastTime = Math.max(disTime, options.lastTime || 0);

				clearTimeout(timer);
				timer = setTimeout(function () { 							
					body.wraper.init(options);		

					clearTimeout(timer);
					timer = null;		
				}, lastTime);
			},

			process: function (options) {
				options.process.call(this, options);
			},

			loadSrc: function (options, process, success) {
				var imgs = options.srcs;

				if(!imgs.length) {
					return;
				}

				var self = this,
					img, src, nImg, count = 0;

				for(var i = 0, l = imgs.length; i < l; i++) {
					img = imgs[i];
					src = img.src || img.getAttribute("data-src") || img.getAttribute("data-background");

					if(img.nodeName.toLowerCase() === "img") {
						if(!img.src) {
							img.src = src;
						}
					}else {
						if(!img.backgroundImage || !img.background) {
							img.backgroundImage = src;
						}
					}

					nImg = new Image();

					nImg.src = src;

					nImg.onload = function () {
						options.loadingCount = ++count;

						if(process) {
							process.call(self, options);
						}
						if(count == l) {
							success.call(self, options);
						}
					}
				}
			}
		},

		wraper: {
			target: document.querySelector(".wraper"),

			init: function (options) {
				var self = this,
					value, currying;

				this.target.classList.remove("hide");
				this.config = options;
				this.page = options.page;
				body.preload.target.classList.add("hide");

				this.swiper.init();

				if(options.make) {
					setTimeout(function () {
						swiper.unlockSwipes();
						swiper.slideTo(doc.querySelectorAll(options.swiperSlide).length - 1);
					}, 1000);
				}

				if(options.useMasker) {
					var maskers = doc.querySelectorAll(".masker");
					if(maskers.length) {

						function parents(el, dir, selector) {
							while(el[dir]) {
								if(~el[dir].className.indexOf(selector)) {
									return el[dir];
								}
							}
						}

						for(var i = 0, l = maskers.length; i < l; i++) {
							var slide = parents(maskers[i], "parentNode", "swiper-slide"),
								index = [].indexOf.call(slide.parentNode.children, slide);

							if(!this.page[index]) {
								this.page[index] = {};
							}
							this.page[index].init = function () {}
						}
					}
				}

				for(var key in this.page) {
					value = this.page[key];

					fn.extend(value, expand, {
						target: fn.getPage( parseFloat(key) ),
						key: key
					});

					if(options.useMasker) {
						currying = function (func, key) {

							return function () {
								if(!value.countScoreInited) {
									fn.countScore.call(value);
									value.countScoreInited = true;
								}

								"close open".split(" ").forEach(function (item, i) {
									fn[item].call(value);
								});

								func.call(self.page[key]);
							}
						}

						value.init = currying(value.init, key);
					}

					currying = function (func, key) {

						if(!func) {
							self.page.reset = fn.reset;
							return;
						}

						return function () {

							fn.reset.call(self.page[key]);
							
							func.call(self.page[key]);
						}
					}

					value.reset = currying(value.reset, key);
				}

				fn.mapPage();

				if(options.useWeixin) {
					setTimeout(function () {
						self.weixin.init(options);
					}, 0);
				}

				if(typeof options.next === "function") {
					setTimeout(options.next, 0);
				}
			},

			music: {
				init: function (options) {
					this.config = options;

					var audio = this.target.querySelector("audio");

					audio.src = this.config.src;
					if(options.autoplay) {
						this.autoplay();
					}
				},

				target: document.querySelector(".play_music"),

				autoplay: function () {
					var self = this,
						playAudio = this.target.querySelector(".play_audio"),
						evt = ~navigator.userAgent.indexOf('MicroMessenger') ? 
							'WeixinJSBridgeReady' :
							'touchstart';

					// 如果是微信浏览器监听'WeixinJSBridgeReady'事件，非微信浏览器监听'touchstart'事件
					document.addEventListener(evt, function(e) {

						if(e.type === 'WeixinJSBridgeReady') {
							self.click();
						}

						if(e.type === 'touchstart' && e.target !== playAudio) {
							self.click();
						}

						playAudio.onclick = function() {
							self.click();
						}

						document.removeEventListener(
							evt, 
							arguments.callee, 
							false
						);
					}, false);
				},

				click: function () {
					var target = this.target,
						audio = target.querySelector("audio"),
						playAudio = target.querySelector(".play_audio");

					if(audio.paused) {
						audio.play();
						audio.autoplay = "autoplay";
						playAudio.classList.add("playMusic");
					}else {
						audio.pause();
						audio.removeAttribute("autoplay");
						playAudio.classList.remove("playMusic");
					}
				}
			},

			swiper: {
				init: function () {
					this.swiper();
				},

				swiper: function () {
					var swiper = new Swiper('.swiper-container', {
			            // pagination: '.swiper-pagination',
			            paginationClickable: true,
			            direction: 'vertical',
			            noSwipingClass : 'stop-swiping',    // 锁屏类
			            lazyLoading : true,                 // 懒加载
			            lazyLoadingInPrevNext: true,        // 按需懒加载
			            onSlideChangeEnd: function () {
			                var index = swiper.activeIndex;
							fn.mapPage();
			            }
			        });

			        window.swiper = swiper;
				}
			},

			weixin: {
				init: function (options) {
					this.weixin(options);
				},

				weixin: function (options) {
					options.weixin && options.weixin();
				}
			},

			masker: {
				init: function () {
					this.open();
				},

				open: function () {
					var page = body.config.page;
					console.log(page);
				} 
			}
		}
	}

	var Wap = function (options) {
		this.init(options)
	}

	Wap.prototype = {
		init: function (options) {
			body.init(options);
		}
	}

	fn.extend(Wap.prototype, {
		lock: function () {
	        swiper.lockSwipes();
	    },

	    unlock: function () {
	        swiper.unlockSwipes();
	    },

	    slideTo: function (index, duration) {
	    	swiper.slideTo(index, duration);
	    },

	    slideNext: function () {
	    	swiper.slideNext();
	    },

	    slidePrev: function () {
	    	swiper.slidePrev();
	    }
	})

	window.Wap = Wap;

})(this);