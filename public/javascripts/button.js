(function($, ns){
    "use strict";
    function Button(conf){
        this.config = $.extend(conf, {});
        this.button = this.config.handler;
        this._validations = [];
        this._errno = 0;
        this._time = this.config.sTime || 60;
        this._init();
    }

    Button.prototype._init = function(){
        var me = this;
        this.addValidation(this.config.validations);
        this.button.on("tap", function(){
            me.clickCallBack();
            if(me.config.tapcallback){
               me.config.tapcallback()
            }
        });
        if(this.config.initStatus == 'disabled'){
            this._timing();
        }
    }

    Button.prototype.clickCallBack = function(){
        if(this.button.get(0).disabled) return;
        this._validate();
        if(this.getErrno() !== 0) return;
        this._send();
    }

    Button.prototype._timing = function(){
        var me = this,
            ele = me.button,
            counter = me._time,
            timmer;
        ele.addClass('mod-button-disabled');
        function countdown(){
            if(--counter == 0) {
                ele.val(me.config.sendText);
                ele.removeClass('mod-button-disabled');
                ele.get(0).disabled = false;
                return;
            };
            ele.val(me.config.reSend+'('+counter+')')
            timmer = setTimeout(function(){
                countdown();
            }, 1000);
        }
        countdown();
    };

    Button.prototype._send = function(){
        var me = this,
            getUrl,getData;
        if(me.config.beforeSend){
            me.config.beforeSend()
        };
        if(Object.prototype.toString.call(me.config.url).toLowerCase() == '[object function]'){
            getUrl = me.config.url()
        }else{
            getUrl = me.config.url
        };
        if(Object.prototype.toString.call(me.config.data).toLowerCase() == '[object function]'){
            getData = me.config.data();
        }else{
            getData = me.config.data;
        };
        //me.button.focus();
        me.button.get(0).disabled = true;
        me.button.get(0).value = me.config.loadingText;
        if(me.config.beforeSend){
            me.config.beforeSend()
        }
        var time = new Date();
        $.ajax({
            url: getUrl,
            data: getData,
            type: me.config.type || 'POST',
            dataType: me.config.dataType || 'json',
            success:function(rsp){
                var time1 = new Date().getTime() - time;
                if(rsp.errno == 0){
                    me._timing();
                    me.config.success(rsp);
                }else{
                    me.button.get(0).value = me.config.sendText;
                    me.button.get(0).disabled = false;
                    me.config.error(rsp)
                }
                if(me.sendTimer){
                    clearTimeout(me.sendTimer);
                }
            }
        })

        if(me.config.timmerText){
            me.sendTimer = setTimeout(function(){
                me.button.get(0).disabled = false;
                me.button.get(0).value = me.config.sendText;
                me.config.error({errmsg:me.config.timmerText})
            },me.config.timmer||15000)
        }


    };


    Button.prototype.addValidation = function(func){      
        if(Object.prototype.toString.call(func) == '[object Function]'){
            this._validations.push(func);
        }
    };

    Button.prototype._validate = function(){
        var len = this._validations.length;
        while(len--){
            var status = this._validations[len].call(this, this._value)
            this.setErrno(status['errNo'])
            if(status['errNo']){
                break;
            }      
        }        
    };

    Button.prototype.getErrno = function(){
        return this._errno;
    };

    Button.prototype.setErrno = function(n){
        this._errno = n;
    };

    ns.Button = Button;
    

})($, window);