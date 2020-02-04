/**
 * Created by Administrator on 2019/2/22.
 */
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //获取参数信息
        turnitinUKParaGet({});
        //参数form初始化
        TurnitinUKEdit.init();
    });
}

var TurnitinUKEdit = function() {
    var handleTurnitin = function() {
        $('.turnitin-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                uname: {
                    required: true
                },
                password: {
                    required: true,
                    minlength: 6,
                    maxlength: 30
                },
                classid: {
                    required: true
                },
                aid: {
                    required: true
                },
                subaid: {
                    required: true
                },
                thesispath: {
                    required: true
                },
                reportpath: {
                    required: true
                }
            },

            messages: {
                uname: {
                    required: "用户名必须输入"
                },
                password: {
                    required: "密码必须输入"
                },
                classid: {
                    required: "Class ID必须输入"
                },
                aid: {
                    required: "aid必须输入"
                },
                subaid: {
                    required: "sub aid必须输入"
                },
                thesispath: {
                    required: "论文路径必须输入"
                },
                reportpath: {
                    required: "报告路径必须输入"
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });


        $('#para_modify').click(function(e) {
            if ($('.turnitin-form').validate().form()) {
                e.preventDefault();
                var data = $('.turnitin-form').getFormData();
                turnitinUKParaModify(data);
            }
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            handleTurnitin();
        }
    };
}();

//参数编辑完成
function turnitinUKParaModifyEnd(flg, result){
    var res = "失败！";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            turnitinParaGet({});
            res = "成功！";
        }
    }
    if(alert == "") alert = "turnitinUK版参数修改" + res;
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//获取参数信息完成
function getTurnitinUKParaEnd(flg, result){
    var exclude = [""];
    var para = result.response;
    var options = { jsonValue: para, exclude:exclude,isDebug: false};
    $(".turnitin-form").initForm(options);
}