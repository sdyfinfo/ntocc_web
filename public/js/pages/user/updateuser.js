/**
 * Created by Jianggy on 2019/2/19.
 */

var userList = [];
var responseComplete = [0, 0];   //用户信息和机构全部返回
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //获取机构列表，用来做成机构选择框
        organDataGet();
    });
}

var ComponentsDateTimePickers = function () {

    var handleDatePickers = function () {

        if (jQuery().datepicker) {
            var data = {
                rtl: App.isRTL(),
                orientation: "auto",
                autoclose: true,
                //language:"zh-CN",
                todayBtn:true,
                format:"yyyy-mm-dd",
                //showButtonPanel:true,
                todayHighlight: true
            };
            $("#birthday").datepicker(data);
            var date = getNowFormatDate();
            $("input[name='birthday']").datepicker("setDate","");
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();


var UserEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                userid: {
                    required: true
                },
                username: {
                    required: true
                },
                sex: {
                    required: true
                },
                mobile: {
                    mobile: true
                },
                phone: {
                    phone: true
                },
                organid: {
                    required: true
                },
                mail: {
                    email: true
                },
                image: {
                    required: true
                },
                evaluationneed: {
                    required: true
                },
                storeyid: {
                    required: true
                },
                areaid: {
                    required: true
                }
            },

            messages: {
                userid: {
                    required: "登录名必须输入"
                },

                username: {
                    required: "姓名必须输入"
                },
                sex: {
                    required: "性别必须输入"
                },
                organid: {
                    required: "所属机构必须输入"
                },
                image: {
                    required: "用户头像必须上传"
                },
                evaluationneed: {
                    required: "是否需要评价必须选择"
                },
                storeyid: {
                    required: "楼层必须输入"
                },
                areaid: {
                    required: "分区必须输入"
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
                if (element.attr("name") == "tnc") { // insert checkbox errors after the container
                    error.insertAfter($('#register_tnc_error'));
                } else if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });

        // 手机号码验证
        jQuery.validator.addMethod("mobile", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的手机号码");
        // 固定电话码验证
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的固定电话");
        var exclude = ["organid"];
        var ser = userList;
        var options = {jsonValue : ser, exclude: exclude, isDebug:false};
        $(".register-form").initForm(options);
        //出生日期框
        $("input[name=birthday]").datepicker("setDate",dateFormat(ser.birthday, "-"));
        //头像显示
        $(".img-upload").find("img").attr("src",userList.img_head || "/public/images/head_img.png");
        //清空机构输入框
        clearSelectCheck($("#organtree"));
        //机构框赋值
        $('#organtree').bind('ready.jstree',function(obj,e){
            $('#organtree').jstree('select_node',ser.organid);
        });
        $('#organtree').jstree(true).select_node(ser.organid);
        //机构只读
        $('#organ').attr("disabled",true);
        //用户代码不可以输入
        $(".register-form").find("input[name=userid]").attr("readonly", true);
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//点击确定按钮
$('#register-btn').click(function() {
    btnDisable($('#register-btn'));
    if ($('.register-form').validate().form()) {
        var user = $('.register-form').getFormData();
        user.birthday = user.birthday.replace(/-/g, '');
        if(($('#organtree').jstree(true).get_selected(true)).length != 0){
            user.organid = ($('#organtree').jstree(true).get_selected(true))[0].id;
        }else{
            user.organid = "";
        }
        var rolelist = [];
        rolelist.push(userList.roleid);
        user.rolelist = rolelist;
        var formData = new FormData();
        formData.append("img_head",null);
        if($("#img_head").get(0).files[0]){
            formData.set("img_head",$("#img_head").get(0).files[0]);
        }
        var data = sendMessageEdit(DEFAULT, user);
        formData.append("body",new Blob([data],{type:"application/json"}));
        $("#loading_edit").modal('show');
        userEdit(formData);
    }
});

function equar(a,b){
    return (a.sort().toString() === b.sort().toString())
}

var UserDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", UserDelete.deleteUser)
        }
    });
    return{
        deleteUser: function(){
            var userlist = {useridlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                userlist.useridlist.push($(this).siblings().eq(1).text());
            });
            userDelete(userlist);
        }
    }
}();

var PasswordRest = function() {
    jQuery('#password_reset').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("您确定要重置密码吗？", PasswordRest.passwordRest)
        }
    });
    return{
        passwordRest: function(){
            var password = hex_md5("123456");
            var userlist = {useridlist:[], password:password};
            $(".checkboxes:checked").parents("td").each(function () {
                userlist.useridlist.push($(this).siblings().eq(0).text());
            });
            passwordReset(userlist);
        },
        passwordRestResult: function(flg){
            var result = "密码重置成功！";
            if(!flg) result = "密码重置失败！";
            alertDialog(result);
        }
    }
}();

function getUserInformationEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
             userList = result.response;
            //新增编辑用户控件初始化
            UserEdit.init();

        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("用户信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("用户信息获取失败！");
    }
}

function getOrganDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var organList = result.response.list;
            organNameSelectBuild(organList, $("#organtree"));
            //发送个人信息请求
            slefDataGet();
        }
    }
}

function userInfoEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            slefDataGet();
        }
    }
    if(alert == "") alert = text + "个人信息修改" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

function passwordResetEnd(flg, result){
    App.unblockUI('#lay-out');
    PasswordRest.passwordRestResult(flg);
}

//选中所属机构
$('#organtree').on('select_node.jstree', function(e,data) {
    console.info("select_node");
    var ref = $(this).jstree(true);
    var nodes = ref.get_checked();  //使用get_checked方法
    $.each(nodes, function(i, nd) {
        if (nd != data.node.id)
            ref.uncheck_node(nd);
    });
    $(this).siblings("input").val(data.node.text);
    $(this).hide();
});

//取消选中所属机构
$('#organtree').on('deselect_node.jstree', function(e,data) {
    console.info("deselect_node");
    $(this).siblings("input").val("");
    $(this).hide();
});

//按下input之外的地方，所属机构输入框不显示
$(document).click(function(e){
    if ($(e.target)[0] != $("#organquery")[0]){
        $("#organtreequery").hide();
    }
    if ($(e.target)[0] != $("#organ")[0]){
        $("#organtree").hide();
    }
});

$("#photo").change(function(){
    var file = $(this).get(0).files[0];
    var inputObj = $(this).siblings("input[name=image]");
    var imgObj = $(this).siblings("img");
    inputObj.val(file);
    if(file == undefined){
        imgObj.attr("src", "");
        inputObj.val("");
        return;
    }
    var render = new FileReader();
    render.readAsDataURL(file);
    render.onload = function(e) {
        imgObj.attr("src", e.target.result);
    }
});


//判断用户和机构是否获取完毕
function changeButtonStatus(){
    if(responseComplete.indexOf(0) == -1 ){
        $("#op_edit").trigger('click');
    }
}


//头像上传后显示
$("input[type=file]").change(function(){
    var img = $(".img-upload").find("img");
    if(this.files[0]){
        var path = window.URL.createObjectURL(this.files[0]);
        $(this).siblings("input[type=text]").val(path);
        img.attr('src',path);
    }else{
        img.attr('src',"../../../public/manager/assets/pages/img/head_img.png");
    }
});

function slefDataGet(){
    var date = { userid : loginSucc.userid };
    userInformationGet(date);
}