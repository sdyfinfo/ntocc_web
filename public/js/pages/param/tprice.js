/**
 * Created by Administrator on 2019/2/22.
 */
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //获取参数信息
        tPriceParaGet({});
        //参数form初始化
        TPriceEdit.init();
    });
}

var TPriceEdit = function() {
    var handleTPrice = function() {
        $('.turnitin-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                price: {
                    required: true,
                    number: true,
                    pointlength: 2
                },
                wordnum: {
                    required: true,
                    number: true,
                    nopoint:true,
                },
                discount: {
                    number: true,
                    range: [0, 10],
                    pointlength: 1
                }
            },

            messages: {
                price: {
                    required: "价格必须输入",
                    pointlength: "小数点后最多为2位！"
                },
                wordnum: {
                    required: "字数必须输入",
                },
                discount: {
                    pointlength: "小数点后最多为1位！"
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

        jQuery.validator.addMethod("pointlength",function(value, element, param){
            var returnVal = true;
            var ArrMen= value.split(".");    //截取字符串
            if(ArrMen.length == 2){
                if(ArrMen[1].length > param){    //判断小数点后面的字符串长度
                    returnVal = false;
                    return false;
                }
            }
            return returnVal;
        },"");         //验证错误信息

        jQuery.validator.addMethod("nopoint",function(value, element, param){
            var returnVal = true;
            var ArrMen= value.split(".");    //截取字符串
            if(ArrMen.length > 1){
                return false
            }
            return returnVal;
        },"该字段必须输入整数！");         //验证错误信息

        $('#para_modify').click(function(e) {
            e.preventDefault();
            if ($('.turnitin-form').validate().form()) {
                var data = $('.turnitin-form').getFormData();
                if(data.discount == "") data.discount = 1;
                tPriceParaModify(data);
            }
        });
        $('#para_pre').click(function(e) {
            e.preventDefault();
            if ($('.turnitin-form').validate().form()) {
                var data = $('.turnitin-form').getFormData();
                var disPrice = Number((data.price * discountNumber(data.discount)).toFixed(2));
                $("#price").html(data.price + "元/" + data.wordnum + "字");
                $("#discount").html(discountNumberChange(data.discount));
                $("#disprice").html(disPrice + "元/" + data.wordnum + "字");
                $('#price-pre').modal('show');
            }
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            handleTPrice();
        }
    };
}();

/**
 * 参数编辑完成.
 */
function tPriceParaModifyEnd(flg, result, type){
    var res = "失败！";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            tPriceParaGet({});
            res = "成功！";
        }
    }
    if(alert == "") alert = "查重价格参数修改" + res;
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

/**
 * 获取参数信息完成.
 */
function getTPriceParaEnd(flg, result){
    var exclude = [""];
    var para = result.response;
    var options = { jsonValue: para, exclude:exclude,isDebug: false};
    $(".turnitin-form").initForm(options);
}