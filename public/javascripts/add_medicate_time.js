(function(){
    var addMedicateTime = {
        'timeListTemp': '{{~it.time:v:i}}'+
                            '<li class="mod-medicate-time-time" data-time="{{=v.time}}">' +
                                '<label>提醒{{=v.index + 1}}：</label>' +
                                '<div class="mod-list-3-right">' +
                                    '<div class="box-flex1">' +
                                        '<span class="w55">{{=v.hour}}</span>' +
                                        '<span class="m-rpx5">时</span>' +
                                        '<span class="w55">{{=v.min}}</span>' +
                                        '<span>分</span>' +
                                    '</div>' +
                                    '<div class="btn3 del-medicate-time" data-order="{{=v.index}}">删除</div>' +
                                '</div>' +
                            '</li>'+
                        '{{~}}',

        'addTimeTemp':  '<li id="addmedicateTime" class="m-tpx-10">' +
                            '<label>提醒：</label>' +
                            '<div class="mod-list-3-right">' +
                                '<div class="box-flex1">' +
                                    '<select class="mod-select mod-select-hour">' +
                                        '{{~it.hourList:v:i}}'+
                                            '<option value="{{=v}}">{{=v}}</option>'+
                                        '{{~}}'+
                                    '</select>' +
                                    '<span class="m-rpx5">时</span>' +
                                    '<select class="mod-select mod-select-min">' +
                                        '{{~it.minList:v:i}}'+
                                            '<option value="{{=v}}">{{=v}}</option>'+
                                        '{{~}}'+
                                    '</select>' +
                                    '<span class="m-lfpx10">分</span>' +
                                '</div>' +
                                '<div class="btn2 add-medicate-time">保存</div>' +
                            '</div>' +
                        '</li>',
        init: function () {
            this._validateInit();
            this.setEvent();
            this.selectTime = window.medicateTimeArray || [];
            if (this.selectTime.length > 0){
                this.drawTimeListDom();
            }
        },

        drawAddTimeDom: function (){
            if (!this.initStatus) {
                var hourArr = [];
                var minArr = [];
                for (var i = 0; i < 60; i++){
                    var j = i < 10 ? ('0' + i) : i;
                    if (i < 24) {
                        hourArr.push(j);
                    }
                    minArr.push(j)
                };
                var html = doT.template(this.addTimeTemp)({
                    hourList: hourArr,
                    minList: minArr,
                });
                this.initStatus = true;
                $("#medicateTimeWapper").append(html)
            }
            // var order = $('[data-time]').size() + 1;
            $("#addmedicateTime label").html('提醒' + (this.selectTime.length + 1) + '：');
            $(".mod-select-hour").val('00');
            $(".mod-select-min").val('00');
            $("#addmedicateTime").show();
        },

        setTime : function(type, time){
            if (type === 'add') {
                this.selectTime.push(time);
            } else if (type === 'del') {
                this.selectTime.splice(time, 1)
            }
            this.sortTIme();
        },

        sortTIme: function(){
            this.selectTime = this.selectTime.sort(function(a, b){
                var time1 = a.split(":")[0] * 24 + a.split(":")[1];
                var time2 = b.split(":")[0] * 24 + b.split(":")[1];
                return time1 - time2
            });
            this.drawTimeListDom();
        },

        drawTimeListDom: function(time){
            $('[data-time]').remove();
            var timeArr = [];
            for (var i = 0, len = this.selectTime.length; i < len; i++) {
                var d = this.selectTime[i];
                timeArr.push({
                    time: d,
                    hour: d.split(":")[0],
                    min: d.split(":")[1],
                    index: i
                })
            }
            var html = doT.template(this.timeListTemp)({
                time: timeArr
            });
            $("#medicateTime").after(html);
        },

        addTime: function () {
            var time = $(".mod-select-hour").val() + ':' + $(".mod-select-min").val();
            var index = $.inArray(time, this.selectTime);
            if (index > -1) {
                alert('你选择的时间与第' + (index+1) + '条相同');
            } else {
                this.setTime('add', time);
                $("#addmedicateTime").hide();
            }
        },

        delTime: function (index){
            var me = this;
            this.delTimeIndex = index;
            if (!me.toastTip) {
                me.toastTip = new Toast({
                    'msg' : '请确认需要删除这条提醒吗?',
                    'buttons': {
                        'sure' : {
                            'callback' : function(){
                                me.setTime('del', me.delTimeIndex)
                                me.toastTip.hide();
                            }
                        }
                    }
                })
            }
            me.toastTip.show();
        },

        _validateInit : function(){
            var me = this,
                validateRules = {
                    'medicateAddUsername': {
                        rules: ['required'],
                        desc: '用户'
                    },
                    'medicateAddDrug': {
                        rules: ['required'],
                        desc: '药品'
                    },
                    'medicateAddDosage': {
                        rules: ['required'],
                        desc: '用量'
                    },
                    'medicateAddMobile': {
                        rules: ['required','phone'],
                        desc: '手机'
                    }
                };
            this.validator = new Validator({
                successCallback : me.validateSuccess,
                errorCallback : me.validateError
            });
            this.validator.init(validateRules);
            this.validator.addRule();
        },
        validateSuccess : function(info,opt){

        },
        validateError : function(info,opt){
            var me = this,
                ele = $("#formValidateMsg");
            if(ele.size() > 0){
                ele.show().html(info.msg)
            }
            opt && opt.callback && callback();
        },
        submit: function(){
            var me = this;
            var data = {
                'username' : $('#medicateAddUsername').val(),
                'drug': $('#medicateAddDrug').val(),  
                'dose':  $('#medicateAddDosage').val(),
                'id': window.id || '',
                'notify_time': this.selectTime.join(';')
            };
            $.post('/medicate/doadd', data, function(data){
                if (data.errno == 0) {
                    location.href = data.data.url
                } else {
                    me.validateError({
                        msg: data.errmsg
                    })
                }
            });
        },
        setEvent: function(){
            var me = this;
            $(".mod-list-3").on('tap', function(evt){
                var self = $(evt.target);
                if (self.hasClass('mod-add-medicateTime')){
                    if (me.selectTime.length >= 3) {
                        alert('最多只能添加三条');
                    } else {
                        me.drawAddTimeDom();
                    }
                } else if(self.hasClass('add-medicate-time')){
                    me.addTime();
                } else if (self.hasClass('del-medicate-time')){
                    me.delTime(self.attr('data-order'))
                }
            });
            $(".mod-form-input").on('focus', function(){
                $("#formValidateMsg").hide();
            });

            $(".btn1").on('tap', function(evt){
                me.validator.validateAll({
                    success : function(){
                        if (me.selectTime.length == 0) {
                            return me.validateError({
                                msg: '请填加用药时间'
                            })
                        }
                        me.submit();
                    },
                    error : function(result){
                                        
                    }
                }, true)
            })
        }

    }

    addMedicateTime.init();


})()
