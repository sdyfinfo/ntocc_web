/**
 * Created by Administrator on 2019/2/22.
 */
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //获取参数信息
        grammarianParaGet({});
        //参数form初始化
        GrammarianEdit.init();
    });
}

var GrammarianEdit = function() {
    var handleGrammarian = function() {
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
                }
            },

            messages: {
                uname: {
                    required: "用户名必须输入"
                },
                password: {
                    required: "密码必须输入"
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
                grammarianParaModify(data);
            }
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            handleGrammarian();
        }
    };
}();

/**
 * 参数编辑完成.
 */
function grammarianParaModifyEnd(flg, result){
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
    if(alert == "") alert = "grammarly参数修改" + res;
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

/**
 * 获取参数信息完成.
 */
function getGrammarianParaEnd(flg, result){
    var exclude = [""];
    var para = result.response;
    var options = { jsonValue: para, exclude:exclude,isDebug: false};
    $(".turnitin-form").initForm(options);
}