(function(window, undefined) {
	var doc = window.document,
		docW = (doc.documentElement || doc.body).clientWidth,
		docH = (doc.documentElement || doc.body).clientHeight,
		body = doc.body;

	//计算手机的屏幕大小	
	body.style.width = docW + "px";
	body.style.height = docH + "px";

	var _hasOwn = Object.prototype.hasOwnProperty,
		_toString =	Object.prototype.toString,
		_slice = Array.prototype.slice;

	// 方法extend将参数defaults和参数opt合并，并且支持多个参数合并。如果最后一个参数为布尔true，支持深度拷贝。参数defaults为默认对象, 参数opt是被合并对象。
	function extend(defaults, opt, extra) { 			
		var args = _slice.call(arguments), k,
			argsL = args.length,
			deep = args[argsL - 1], 					// 获取最后一个参数, 赋值给deep
			isObject = _toString.call(deep) === '[object Object]',  		// 判断deep是不是布尔型
			opts, optsL;

		if(!opt) { 				// 如果参数opt不存在, 返回参数defaults 				
			return defaults;	
		} 	

		optsL = isObject ? argsL - 1 : argsL - 2;		// 如果deep为布尔值, 则参数opts的个数为argsL - 2; 否则为argsL - 1。

		if(optsL > 1) { 								// 2个或者2个以上
			for(var i = 1; i <= optsL; i++) { 			// 不算参数defaults，从第二个参数开始计算起。
				extend(defaults, args[i], isObject ? undefined : deep);		// 调用extend(defaults, opt, deep)方法;
			}
		}else {
			for(k in opt) { 							// 遍历参数opt
				if(_hasOwn.call(opt, k)) {			
					if(deep === true && _toString.call(opt[k]) === '[object Object]') { 				// 如果是支持深度拷贝，并且参数opt的键值指向的是对象
						extend(defaults, opt[k], true); 		// 再次调用extend(defaults, opt, deep)方法;
					}else if(!(typeof defaults[k] === 'function' && opt[k] === false)) { 		// 如果默认目标选项属性是函数，源选项属性为false，则忽略。
						defaults[k] = opt[k];					// 深拷贝属性
					}	
				}
			}
		}
		return defaults; 				
	}
	
	function empty() {}

	// 移动端预加载图片动画
	var preLoadingFn = {

		init: function (options) {
			this.handleOptions(options);
			return this;
		},

		defaultOptions: { 							// 默认选项
			preLoadingImgs: false, 					
			pageImgs: false,
			loadedCallBack: empty,
			stayHere: false,
			loadingCallBack: function (options) { 	// 如果选项没有loadingCallBack, 则默认为每加载完一张图，计算加载的百分比，再显示出来 	
				var imgCount = options.pageCount,
					l = options.pageLength,
					percent = Math.ceil((imgCount / l) * 100);

				doc.querySelector(".loading-data").innerHTML = percent + "%";
			}
		},

		checkSrc: function (options) {
			var imgs = options.preLoadingImgs; 		// 首先获取预加载页面的img元素集合，无法获取会返回null

			return imgs && imgs.length ? 			// 如果预加载页面有img元素, 返回true, 没有返回false
				true : false;			
		},

		handleOptions: function (options) {
			var imgs, preImg;
			if(this.checkSrc(options)) { 			// 如果预加载页面有img元素, 要首先加载
				this.options = options = extend(this.defaultOptions, options); 		// 自定义选项合并到默认选项上，得到最终的选项, 存储在preLoadingFn.options上
				imgs = options.preLoadingImgs;
				preImg = true; 						// preImg为true表示是否加载预加载页面的img元素，为false表示加载页面的img元素
			}else {
				imgs = options.pageImgs; 			// 否则加载页面的img元素
			}
			this.loadSrc.call(options, imgs, preImg); 		// 调用preLoadingFn.loadSrc(paths)方法加载
		},

		loadSrc: function (imgs, preImg) {
			var i = j = 0,
				l = imgs.length,
				src,
				nImg,
				elem,
				imgCount = 0,
				options = this; 					// 表示已完成加载的img数目。完成加载一个img元素就会加1

			preImg = preImg ? 'preLoading' : 'page';    // 如果preImg，表示现在加载预加载页面图片，重新设置为'preLoading',否则为'page'
			options[ preImg + 'Length' ] = l; 		// 存储图片的数目，预加载页面的就存储在options.preLoadingLength，否则存储在options.pageLength上

			if(preImg === 'page') { 					// 记录加载普通页面图片的开始时间
				options.startTime = preLoadingFn.timestamp(); 		
			}

			for(; i < l; i++) { 					// 遍历img元素集合
				elem = imgs[i]; 					// 取当前img元素
				if(elem.nodeType === 1 && elem.tagName.toLowerCase() === 'img') { 		// 判断是否img元素

					nImg = new Image(); 				// 新创建img元素

					src = elem.src || elem.getAttribute('data-src');
					
					// 如果在pcat下预览，并且用的是相对地址，则要转成绝对地址
					if(this.pcat && !/^http:\/\//.test(src)) {
						src += location.host;
					} 
		
					nImg.src = src;	 					// 设置src路径

					nImg.onload = function () {
						imgCount++; 			 							// 计算已加载的img数量
						options[ preImg + 'Count' ] = imgCount;  			// 存储当前加载图片的数目，预加载页面的就存储在options.preLoadingCount，否则存储在options.pageCount上
						
						if(preImg === 'page') {
							preLoadingFn.loadingCallBack(options)  				// 每次加载完一张图片, 调用loadingCallBack方法
						}

						if(imgCount === l){ 								// 如果全部加载完,调用loadedCallBack方法。
							preLoadingFn.loadedCallBack(options);
						}
					}
				}
			}
		},

		// 每次加载完一张图片执行回调函数
		loadingCallBack: function (options) { 		
			return preLoadingFn.options.loadingCallBack(options);
		},

		// 加载完所有图片执行回调函数
		loadedCallBack: function (options) { 		
			if(options.preLoadingImgs) { 			// 如果有预加载页面的img元素集合
				options.copyPreLoadingImg = options.preLoadingImgs; 			// 先临时保存到copyPreLoadingImg
				options.preLoadingImgs = false;		// 再设置为false。图片已加载完毕，临时设置为false。
				this.handleOptions(options); 	// 再次调用.preLoadingImgSrc(options)方法
			}else {
				options.preLoadingImgs = options.copyPreLoadingImg; 		// 恢复preLoadingImgs选项
				options.endTime = this.timestamp();							// 记录加载完普通页面的时间 

				if(!options.stayHere) {
					setTimeout(function () { 								// 	
						preLoadingFn.hidePreLoadingPage();					
					}, preLoadingFn.compareTime(options));
				}
			}
		},

		hidePreLoadingPage: function () {
			doc.querySelector("#Jpreload").classList.add("hide"); 
			doc.querySelector(".wraper").classList.remove("hide");	

			preLoadingFn.end = true;
		},

		// 生成时间戳
		timestamp: function () {
			return new Date().getTime(); 			
		},

		// 加载图片一共时间与设置的时间比较，返回最长的
		compareTime: function (options) {
			return Math.max(options.startTime - options.endTime, options.forceTime || 0) || 0;	 		
		},

		then: function (next) {
			var timer = null;

			timer = setInterval(function () {
				if(preLoadingFn.end) {
					clearInterval(timer);
					next();
				}
			}, 50);
		}
	}
	
	// 音乐
	var musicFn = {

		init: function (options) {
			this.handleOptions(options);		
		},

		defaultOptions: {
			src: 'music.mp3',
			bg: 'images/music.png',
			gif: false,
			autoplay: true,
			loop: true,
			controls: false
		},

		// 处理参数
		handleOptions: function (options) {  				
			var audio = doc.querySelector("audio"),
				play_audio = doc.querySelector(".play_audio"),
				play_yinfu = doc.querySelector('.play_yinfu');

			// 自定义选项合并到默认选项上，得到最终的选项, 存储在MusicFn.options上
			this.options = options = extend( 				
				this.defaultOptions, 
				options, 
				{ 
					audio: audio, 
					play_audio: play_audio, 
					play_yinfu: play_yinfu
				}
			); 			

			audio.src = options.src;
			play_audio.style.backgroundImage = options.bg;
			play_yinfu.style.backgroundImage = options.gif;

			audio.loop = options.loop;
			audio.autoplay = options.autoplay;

			if(!options.controls) { 					 		// 移除控制器
				audio.removeAttribute('controls');
			}
			if(audio.autoplay) { 								// 设置自动播放
				this.autoplay(options);
			}
		},

		autoplay: function (options) {
			var ua = navigator.userAgent,
				play_audio = options.play_audio,
				evt = ~ua.indexOf('MicroMessenger') ?  			
				'WeixinJSBridgeReady' : 
				'touchstart';

			// 如果是微信浏览器监听'WeixinJSBridgeReady'事件，非微信浏览器监听'touchstart'事件
			document.addEventListener(evt, function() {

				musicFn.click(options);
				play_audio.onclick = function() {
					musicFn.click(options);
				}
				document.removeEventListener(
					evt, 
					arguments.callee, 
					false
				);
			}, false);
		},

		click: function (options) {
			var audio = options.audio,
				play_audio = options.play_audio,
				play_yinfu = options.play_yinfu,
				paused = this.paused, mapClick;

			// 如果是暂停的就执行play()开启音乐，运行动画。否则关闭执行pause()方法关闭音乐，停止动画。
			mapClick = !paused ? {
				fn: 'play',
				classFn: 'add'
			}: {
				fn: 'pause',
				classFn: 'remove'
			}

			audio[mapClick.fn]();
			play_audio.classList[mapClick.classFn]('playMusic');

			this.paused = !paused; 							// 修正musicFn.paused属性
		}
	};

	// 调用
	window.mobilePage = function (options) {
		this.init(options);
	}

	mobilePage.prototype = {
		constructor: mobilePage,

		init: function (options) {
			this.handleOptions(options);
		},

		handleOptions: function (options) {
			var preLoading = options.preLoading,
				music = options.music,
				swiper = options.swiper,
				weixin = options.weixin,
				callback = options.callback;

			if(preLoading) {
				preLoadingFn.init(preLoading).then(function () {

					music && musicFn.init(music);
					swiper && swiper();
					weixin && weixin();
					callback && callback();
				});
			}else{
				preLoadingFn.hidePreLoadingPage();
				callback && callback();
			}
		}
	}

})(this);