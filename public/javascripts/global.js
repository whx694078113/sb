(function($, win){

	window.gid = 0;
    
    $('[data-url]').on('tap', function(){
        var url = $(this).attr('data-url');
        location.href = url
    });

    $(".mod-header-goback").on('tap', function(){
        history.go(-1);
    });

    // win.tip = {

    // 	create: function (msg) {
    // 		if ($("#modTip").size() == 0) {
    // 			$('body').append($('<div class="mod-tip" id="modTip">' + msg + '</div>'))
    // 		} else {
    // 			$("#modTip").html(msg);
    // 		}
    // 	},

    // 	show: function (msg, time) {
    // 		this.create(msg);
    // 		$("#modTip").show();
    // 		this.hide(time);
    // 	},

    // 	hide: function (time) {

    // 	}
    // } 


})($, window);


function Toast (config) {
	this.gid = ++window.gid;
	this.config = config;
	this.type = config.type;
	this.mask = config.mask === false ? false : true;
	this.msg = config.msg || '';
	this.buttons = config.buttons || {};
	this.buttons.sure = this.buttons.sure || {
		'text' : '确定'
	};
	this.buttons.cancel = this.buttons.cancel || {
		'text' : '取消'
	};
	this.init();
}

Toast.prototype = {
	init: function (){
		if (this.mask) {
			this.createDialog();
		}
		this.createContent();
		this.setEvent();
	},
	show: function () {
		if (this.mask) {
			this.dialogShow();
		}
		this.contentShow();	
	},

	hide: function () {
		this.dialogHide();
		this.contentHide();
	},

	dialogShow: function () {
		this.dialogContainer.show();
	},

	dialogHide: function () {
		this.dialogContainer.hide();
	},

	contentShow: function () {
		this.container.show();
	},

	contentHide: function () {
		this.container.hide();
	},

	createDialog: function (){
		this.dialogContainer = $('<div class="mod-dialog" id="dialogGid' + gid + '"></div>');
		$('body').append(this.dialogContainer);
	},

	setContent: function (msg) {
		if (msg) {
			this.msgDom.html(msg);
		}
	},

	createContent: function () {
		this.container = $('<div class="mod-toast" id="toastGid' + gid + '"></div>');
		this.msgDom = $('<div class="mod-toast-content" >' + this.msg + '</div>');
		this.container.append(this.msgDom);
		this.btnWrapper = $('<div class="mod-toast-btn' + (this.type === 'alert' ? ' mod-toast-type-alert' : '') + ' clearfix"></div>');
		this.btnWrapper.append('<a class="mod-dialog-btn-sure">' + (this.buttons.sure.text ? this.buttons.sure.text :'确定') + '</a>');
		if (this.config.type !== 'alert') {
			this.btnWrapper.append('<a class="mod-dialog-btn-cancel">' + (this.buttons.cancel.text ? this.buttons.cancel.text :'取消') + '</a>');
		}
		this.container.append(this.btnWrapper);
		this.createStatus = true;
		$('body').append(this.container);
	},

	setEvent: function () {
		var that = this;
		this.container.on('tap', function(evt){
			var $self = $(evt.target);
			if ($self.hasClass('mod-dialog-btn-sure')) {
				that.buttons.sure.callback && that.buttons.sure.callback(evt);
				if (that.config.type === 'alert') {
					that.hide();
				}
			} else if ($self.hasClass('mod-dialog-btn-cancel')) {
				that.buttons.cancel.callback && that.buttons.cancel.callback(evt);
				that.hide();
			}
		})
	}
}
