/**
 * Created by Lenovo on 2020/2/17.
 */
var mshList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function () {
        //fun_power();
        //我的U盾
        mshieldGet();
        mshEdit.init();
    })
}

var mshEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                unumber: {
                    required: true
                },
                passwd: {
                    required: true
                }
            },

            messages: {
                unumber: {
                    required: "请输入U盾编号"
                },
                passwd: {
                    required: "请输入6位数的动态密码"
                }
            },

            invalidHandler: function (event, validator) { //display error alert on form submit

            },

            highlight: function (element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function (label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function (error, element) {
                if (element.attr("name") == "tnc") { // insert checkbox errors after the container
                    error.insertAfter($('#register_tnc_error'));
                } else if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function (form) {
                form.submit();
            }
        });
        jQuery.validator.addMethod("passwd", function(value, element) {
            var tel = /^\d{6}$/;
            return this.optional(element) || (tel.test(value));
        }, "请输入6位数动态密码");
        var exclude = [];
        var ser = mshList;
        var options = {jsonValue: ser, exclude: exclude, isDebug: false};
        $(".register-form").initForm(options);
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();



//点击确定按钮edittype
$('#register-btn').click(function() {
    btnDisable($('#register-btn'));
    if ($('.register-form').validate().form()) {
        var ush = $('.register-form').getFormData();
        ush.shieid = $("input[name=shieid]").val();
        ush.unumber = $("#number").val();
        ush.passwd = $("#passwd").val();
        if(ush.passwd.length != 6){
            alertDialog("请输入6位数动态密码");
            return;
        }
        $("#loading_edit").modal('show');
        ushieldCheck(ush);
    }
});

//返回U盾管理结果
function getmshieldDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            mshList = result.response;
            //新增编辑用户控件初始化
            mshEdit.init();
        }else{
            alertDialog(result.retmsg);
        }
    }else{
        alertDialog("我的U盾信息获取失败！");
    }
}

function getushEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case USHCHECK:
            text = "校验";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
        }
    }
    if(alert == ""){
        alert = text + res + "！";
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}