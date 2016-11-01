function ShowSuggestBox(arg){
			this.arg = arg;
			// 初始化实例
			this.init(arg); 
		};


		ShowSuggestBox.prototype = {
			// 类初始化
			init : function (arg){
				// 保存当前选中的节点
				this.selectedNode = null;
				// 保存li节点
				this.elLi = null,
				// 创建UL节点  
				this.elUl = $('<ul class="mh-ui-suggest mh-ui-suggest-none"></ul>');
				// Body节点
				this.elBody = $('body');
				// 触发sug的input
				this.triggerInput = $('.'+arg.sugInputName);
				// 保存input的值
				this.caseInputValue = this.triggerInput.val();
				// 选中class 
				this.selClass = 'mh-ui-suggest-sel';
				// 事件
				this.addEvent();
			},


			// 事件
			addEvent : function (){
				var t = this;
				// 当前表单
				var input = this.triggerInput;
				// 异步延迟ID
				var setTimeId;

				// 监听输入事件
				input.on('input propertychange', function (e){
					var el = $(this);
					
					// 清除延迟ID
					setTimeId && clearTimeout(setTimeId);
					// 延迟请求 避免覆盖
					setTimeId = setTimeout(function (){
						// Sug列表
						t.showSug(el);
					}, 0);
				});

				input.on('blur', function (e){
					e.stopPropagation();
					// 关闭其他sug列表
					t.removeSug(e);
				});

				// 监听上下箭头
				input.on('keydown', function (e){
					// 移动背景位置
					t.sugPoit(e);
				});

				// Sug划过背景
				this.elUl.on('mouseover', function (e){
					t.mouserBack(e);
				});

				// 点击Sug节点
				this.elUl.on('click', function (e){
					t.setInputValue(e);
				});

				// 关闭事件
				this.elBody.on('click', function (){
					t.removeSug();
				});
			},


			// 展现sug列表
			showSug : function (el){
				var t = this;
				// URL
				var url = this.arg.url;
				// callbackName
				var jsonpCallback = this.arg.jsonpCallback;
				// 参数
				var data = this.arg.data;
				// 输入框的Value
				var iValue = el.val();
				// 修正input BUG
				// 中文输入下 点击其他节点时触发input事件
				if(iValue==this.caseInputValue) return false;
				// 重置input的值
				this.caseInputValue = iValue;
				
				//为参数赋值
				data[t.arg.query] = iValue;

				// XHR
				var ajax = function (){
					$.ajax({
						url : url,
						type : 'POST',
						data : data,
						dataType : 'jsonp',
						jsonpCallback: jsonpCallback,
						success : function (data){
							var dataResult = data[t.arg.result];

							if(dataResult.length){
								t.joinHTML(data[t.arg.result], el);
							}else{
								t.removeSug();
							}
						}
					});
				};
				// 输入框是否有值 调用ajax || 隐藏sug
				iValue ? ajax() : t.removeSug();
			},


			// HTML
			joinHTML : function (data, el){
				if(data && data.length){
					// 拼接HTML
					// 拼html代码
					var elLi = this.createHTML(data);
					// 获取位置
					var clickClient = this.getPoin(el);
					// 修正值
					var top = 0, left = 0;
					// 获取修正值
					var correctedPosition = this.arg.correctedPosition || 0;
					
					if(correctedPosition){
						top = correctedPosition.top;
						left = correctedPosition.left;
					}

					// Sug列表位置
					// 为了防止以外Bug 此处每次都计算Sug位置
					this.elUl.removeClass('mh-ui-suggest-none').css({
						// 用offsetHeight原生方法 避免outerHeight被重写
						top : clickClient.top + el[0].offsetHeight + top + 'px',
						left : clickClient.left + left + 'px'
					});

					// 保存所有的li节点
					this.elLi = $('li', this.elUl);

					// 每次初始化sug列表时 初始化默认划过的节点
					this.selectedNode = this.elLi.eq(0);

					// 插入到页面
					this.elBody.append(elLi);
				}else{
					// 删除Sug列表
					this.removeSug();
				}
			},


			// Sug列表
			createHTML : function (data){
				var t = this;
				// html数组
				var arrHtml = [];
				// 计数 大于7退出
				var dataNum = 0;

				/* 显示的数据字段名
				   根据显示的字段数量有不同的拼接方式
				 */
				var dataName = t.arg.dataName;
				var lengthName = dataName.length;
				var dataLen = data.length;

				// 显示一个字段
				if(lengthName == 1){
					$.each(data, function (k, v){
						if(dataNum >= dataLen) return false;
						arrHtml.push('<li class="gclearfix '+( dataNum++ == 0 ? t.selClass : '')+'">'); 
						arrHtml.push('<span class="js-name">'+ v[dataName[0]]+'</span>');
						arrHtml.push('</li>');
					});
				/*
					显示>=2个字段
					这里以地铁几号线为例的，可根据实际情况改写
				*/
				}else{
					$.each(data, function (k, v){
						var name = v[dataName[0]],
							lineNums = v[dataName[1]].split(",").reverse(),
							lineLen = lineNums.length,
							spanTag = '';

						for(var j = 0; j < lineLen; j++){
							var num = lineNums[j];
							spanTag += '<span class="line-ico '+subwayIcon[num]['bg']+'">'+subwayIcon[num]['showNum']+'</span>';
						}

						// 大于7条退出
						if(i >= dataLen) return false;
						arrHtml.push('<li class="gclearfix '+(dataNum++==0?t.selClass:'')+'">');
						arrHtml.push('<span class="js-name">'+name+'</span><em>'+spanTag+'</em>');
						arrHtml.push('</li>');
					});  
				}
				return this.elUl.html(arrHtml.join(''));
			},

			// Sug划过背景
			mouserBack : function (e){
				// 当前划过节点
				var mouseNode = $(e.target);
				// 判断划过的是否是sug节点
				var ul = mouseNode.parents('.mh-ui-suggest');
				// 选中的class
				var selClass = this.selClass;
				// 标签名
				var elName = mouseNode[0].nodeName;
				var li;

				if(ul){
					if(elName == 'UL') return false;

					if(elName == 'LI'){
						li = mouseNode;
					}else if(elName=='EM' || elName=='SPAN'){
						li = mouseNode.parents('li');
					}
					// 删除缓存节点class
					this.selectedNode.removeClass(this.selClass);

					li.addClass(selClass);
					// 重新赋值保存当前选中的节点
					this.selectedNode = li;
				};
			},


			// 点击sug节点 内容输入到input框
			setInputValue : function (e){ 
				// 触发的当前节点
				var target = $(e.target);
				// 判断点击的是否是sug节点
				var isUL = target.parents('.mh-ui-suggest');
				// 获得选中的class
				var selClass = this.selClass;
				// 标签名
				var elName = target[0].nodeName;
				// 获取点击节点文本
				var text;
				// 获取包含整个icon的html
				var icoHtml;

				if(isUL){
					var targetLi = target.parent(),
						text = $('.js-name', targetLi).text(),
						icoHtml = $('em',targetLi).html();
					this.triggerInput.val(text);
					this.triggerInput.siblings('.mh-ico-wrap').append(icoHtml);
				}
				// 隐藏sug
				this.removeSug();
			},


			// 上下箭头 回车 方法
			sugPoit : function (e){
				// 键值
				var code = e.keyCode,
					sugShow =$('.mh-ui-suggest').hasClass('mh-ui-suggest-none');

				// 回车事件
				if(code==13){
					this.enter(e);

				// 上下事件
				}else if(code==38 || code==40){
					this.arrow(code, e);
				}
			},


			// 上下箭头方法
			arrow : function (code, e){
				e.stopPropagation();

				var t = this, el;
				// 上次保存的节点
				var selectedNode = t.selectedNode;
				// 选中的class
				selClass = t.selClass;
				
				if(code == 38){
					el = selectedNode.prev();
					if(el[0]){
						el.addClass(selClass)
					}else{
						(el=t.elLi.eq(t.elLi.length-1)).addClass(selClass);
					}
				}

				if(code == 40){
					el = selectedNode.next();
					if(el[0]){
						el.addClass(selClass)
					}else{
						(el=t.elLi.eq(0)).addClass(selClass);
					}
				}
				
				// 删除上一次li节点的背景
				t.elLi.length != 1 && selectedNode.removeClass(selClass);

				// 重写保存的默认li
				t.selectedNode = el;
			},


			// 回车方法
			enter : function (e){
				e.preventDefault();
				if(this.selectedNode.parent().hasClass('mh-ui-suggest-none')){
					return;
				}

				var text = $('.js-name', this.selectedNode).text(),
					icoHtml = $('em', this.selectedNode).html(),
					icoWrap = this.triggerInput.siblings('.mh-ico-wrap');

				this.triggerInput.val(text);
				if(icoWrap.html() == ''){
					icoWrap.append(icoHtml);
				}
				// 隐藏sug
				this.removeSug();
			},

			// 获取点击位置
			getPoin : function (el){
				var clickClient = el.offset();
				return {
					top : clickClient.top,
					left : clickClient.left
				}
			},

			// 删除Sug列表
			removeSug : function (e){
				// 隐藏Sug列表
				$('.mh-ui-suggest').addClass('mh-ui-suggest-none');
				$('.mh-ui-suggest li').removeClass('mh-ui-suggest-sel');
			}
		};