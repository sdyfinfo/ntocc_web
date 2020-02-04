/**
 * Created by Administrator on 2019/2/22.
 */
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //控制图片大小为1000K
        $('#article').summernote({height: 300,lang:'zh-CN', maximumImageFileSize: 1024000});
        Article.init();
    });
}
var tmpdata = "";
var Article = function() {
    var handleArticle = function() {
        $('.article-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                title: {
                    required: true,
                },
                coverimage: {
                    required: true,
                },
                article: {
                    required: true,
                }
            },

            messages: {
                title: {
                    required: "文章标题必须输入"
                },
                coverimage: {
                    required: "封面图必须上传"
                },
                article: {
                    required: "文章内容必须输入",
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

        $('#article_modify').click(function() {
            btnDisable($('#article_modify'));
            if ($('.article-form').validate().form()) {
                var article = $('.article-form').getFormData();
                article.content = $("#article").summernote("code");
                //先上传封面图，再增加文章
                var formData = new FormData();
                var fileInfo = $("#cover").get(0).files[0];
                fileInfo.floder = article.title + "coverimage";
                formData.append('photo', fileInfo);
                formData.append('cover', article.title + "coverimage");
                $.ajax({
                    type: 'POST',
                    url: '/upload/image',
                    data: formData,
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    success: function (result) {
                        if (result.ret) {
                            article.coverimage = result.url;
                            articleAdd(article);
                        } else {
                            alertDialog("上传封面图片失败！" + result.msg);
                        }
                    },
                    error: function () {
                        alertDialog("上传封面图片失败！");
                    }
                });
            }
        });

        $('#article_pre').click(function() {
            btnDisable($('#article_pre'));
            if ($('.article-form').validate().form()) {
                var host = window.location.protocol + "//" + window.location.host;
                tmpdata = $('.article-form').getFormData();
                tmpdata.content = $("#article").summernote("code");
                window.open(host + "/template?artid=pre")
            }
        });
    };

    return {
        init: function() {
            handleArticle();
        }
    };
}();

function articleInfoEditEnd(flg, result){
    var res = "失败！";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功！";
        }
    }
    if(alert == "") alert = "图文消息增加" + res;
    App.unblockUI('#lay-out');
    alertDialog(alert);
}


$("#cover").change(function(){
    var file = $(this).get(0).files[0];
    var inputObj = $(this).siblings("input[name=coverimage]");
    var imgObj = $(this).siblings("img");
    inputObj.val(file);
    if(file == undefined){
        imgObj.attr("src", "/public/manager/assets/pages/img/default.jpg");
        inputObj.val("");
        return;
    }
    var render = new FileReader();
    render.readAsDataURL(file);
    render.onload = function(e) {
        imgObj.attr("src", e.target.result);
    }
});