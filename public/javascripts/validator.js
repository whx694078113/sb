/**
 * @description Validator表单验证构造函数
 * @function
 * @param {Object} conf 验证配置项
 * @param {Function} successCallback 验证成功回调函数
 * @param {Function} errorCallback 验证失败回调函数
 */

function Validator(conf){
	
	this.conf = conf || {};
	this.confStorage = {};
	this._validateInfo = {};
	this.validateSuccess = this.conf.successCallback || function(){};
	this.validateError = this.conf.errorCallback || function(){};

}


Validator.prototype = {
	/**
	 * @description validator的入口，配置表单验证信息
	 * @function
	 * @param {Object} conf 验证配置项
	 */
	init: function(conf){
		this.confStorage = conf;
	},

	builtInMsg : {
		required: '请您填写%s',
		phone: '手机号码格式不正确',
		email: '邮箱格式不正确'
	},

	builtInRules : {
		// rule 可以为:  regString|regObject|function
		required: /\S+/,
		phone: /^1[34578]\d{9}$/,
		email: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
	},

	/**
	 * @description 校验单个表单域
	 * @function
	 * @private
	 * @param {String} field 要校验的表单域
	 * @param {String} callbacks 校验完成回调，可选
	 */
	_validate: function(field, callbacks, type){
		var me = this,
			ele = document.getElementById(field),
			output = {
				field: field
			},
			re = /^\s*(.+?)\s*$/;
		// skip hidden
		if(!ele || ele.offsetHeight == 0) return false;
		
		// 同步校验
		var value = ele.value.replace(re,'$1'),//去掉字符首尾空格
			conf = this.confStorage[field],
			rules = conf.rules;

		for(var i = 0, j = rules.length; i < j ; i++){
			var ruleName = rules[i],
				rule = this.builtInRules[ruleName],
				result;
			if(Object.prototype.toString.call(rule).toLowerCase() == '[object function]'){
				result = rule.call(me, ele, type);
			}else{
				result = new RegExp(rule).test(value);
			}
			if(!result){
				// 同步校验 -> 未通过
				output['error'] = true;
				me._validateInfo[field] = 0;
				output['msg'] = this.builtInMsg[ruleName].replace(/\%s/, conf.desc);
				me.validateError(output);
				callbacks.error(output);
				return;
			}
		}
		
		// 同步校验通过, 开始异步校验
		if(!conf.asyncRule){
			// 没有异步校验 -> 校验通过
			output['error'] = false;
			me._validateInfo[field] = 1;
			me.validateSuccess(output);
			callbacks.success(output);
		}else{
			// 有异步校验
			conf.asyncRule.call(me, {
				success: function(rsp){
					// 异步校验通过
					output['error'] = false;
					output['data'] = rsp.data;
					me._validateInfo[field] = 1;
					me.validateSuccess(output);
					callbacks.success(output);
				},
				error: function(rsp){
					// // 异步校验未通过
					output['error'] = true;
					me._validateInfo[field] = 0;
					output['msg'] = rsp.msg;
					me.validateError(output);
					callbacks.error(output);
				}
			},type);
		}
	},

	/**
	 * @description 校验整个表单
	 * @private
	 * @function
	 * @param {Object} callbacks 回调
	 * @param {Boolean} breakOnError 有验证项未通过，则不再往下继续验证
	 */
	_validateAll: function(callbacks, breakOnError){
		var me = this,
			all = this.confStorage,
			counter = 0,
			error = false,
			// onComplete 是否已经被调用, if true, 则不再继续验证, 用于 breakOnError
			completed = false,
			result = [],
			allLen = this._getActiveValidate(me, true);
		for(var i in all){
			if(completed) break;
			this._validate(i, {
				success: function(input){
					counter++;
					result.push(input);
					
					// 全部校验完成
					if(counter == allLen){
						onComplete();
					}
				},
				error: function(input){
					// 一项为 error, 则 validateAll 的结果为 error
					error = true;
					counter++;
					result.push(input);
					
					if(breakOnError){
						onComplete();
						return;
					}
					
					// 全部校验完成
					if(counter == allLen){
						onComplete();
					}
				}
			},'all');
		}
		
		function onComplete(){
			completed = true;
			if(error){
				callbacks && callbacks.error(result);
			}else{
				callbacks && callbacks.success(result);
			}
		}
	},	
	/**
	 * @description 获取当前可参与验证的元素。(主要用来排除配置中添加，但是在DOM树中不存在或不可见的元素)
	 * @function
	 * @private
	 * @param {Boolean} lenthOnly 是否只返回满足条件元素的数量
	 * @return {Number|Array} 满足条件元素的数量或集合
	 */
	_getActiveValidate: function(lenthOnly){
		var me = this,
			all = this.confStorage,
			result = [];
		for(var i in all){
			var ele = document.getElementById(i);
			if(!ele || ele.offsetHeight == 0) continue;
			result.push(ele);
		}
		return lenthOnly ? result.length : result;
	},
	/**
	 * @description 增加规则
	 * @function
	 * @param {String} key 规则名
	 * @param {RegExp|String|Function} rule 规则，可以是正则表达式、正则表达式字符串、返回布尔值的函数
	 */
	addRule: function(key, rule){
		var newRule = {};
		newRule[key] = rule;
		$.extend(this.builtInRules, newRule);
	},
	/**
	 * @description 增加消息
	 * @function
	 * @param {String} key 消息名
	 * @param {String} msg 消息实际内容
	 */
	addMsg: function(key, msg){
		var newMsg = {};
		newMsg[key] = msg;
		$.extend(this.builtInMsg, newMsg);
	},
	/**
	 * @description 校验单个表单域
	 * @name #validate
	 * @function
	 * @grammar #validate(field, callbacks)
	 * @param {String} field 要校验的表单域
	 * @param {String} callbacks 校验完成回调，可选
	 * @param {String} callbacks.succcess 校验通过回调，可选
	 * @param {String} callbacks.error 校验未通过回调，可选
	 */
	validate: function(field, callbacks){
		var me = this;

		me._validate(field, {
			success: function(validate){			
				callbacks && callbacks.success && callbacks.success(validate);
			},
			error: function(validate){
				callbacks && callbacks.error && callbacks.error(validate);
			}
		});
	},

	/**
	 * @description 校验整个表单
	 * @name #validateAll
	 * @function
	 * @grammar #validateAll(callbacks, breakOnError)
	 * @param {Object} callbacks 校验完成回调，可选
	 * @param {Function} callbacks.succcess 校验全部通过回调，可选
	 * @param {Function} callbacks.error 校验未通过回调，可选
	 * @param {Boolean} breakOnError 有验证项未通过，则不再往下继续验证，可选，默认 false
	 */
	validateAll: function(callbacks, breakOnError){
		var me = this;
		if(typeof callbacks == 'boolean'){
			 breakOnError = callbacks;
		}else{
			 breakOnError = breakOnError ? breakOnError : false;
		}
				
		me._validateAll({
			success: function(validates){
				callbacks && callbacks.success &&  callbacks.success(validates);
			},
			error: function(validates){
				callbacks && callbacks.error && callbacks.error(validates);
			}
		}, breakOnError);
	}

}