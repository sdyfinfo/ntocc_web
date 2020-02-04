/**
 * Created by Administrator on 2019/12/04.
 */
var artList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        $('#article').summernote({height: 300,lang:'zh-CN', maximumImageFileSize: 1024000});
        ArtTable.init();
        ArtEdit.init();
    });
}

var ArtTable = function () {
    var initTable = function () {
        var table = $('#art_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false, // save datatable state(pagination, sort, etc) in cookie.
            "lengthMenu": TableLengthMenu,
            "destroy": true,
            "pageLength": PageLength,
            "serverSide": true,
            "pagingType": "bootstrap_extended",
            "processing": true,
            "searching": false,
            "ordering": false,
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    title: formData.title,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                artDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "artid", visible: false },
                { "data": "title" },
                { "data": "coverimage" },
                { "data": "time" },
                { "data": "editor" },
                { "data": null }
            ],
            columnDefs: [
                {
                    "targets":[1],
                    "render":function(data, type, row, meta){
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },
                {
                    "targets": [0],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1;  //行号
                    }
                },
                {
                    "targets":[4],
                    "render": function(data, type, row, meta) {
                        return "<img src='" + data + "' style='width: 40px; height:40px'>";
                    }
                },
                {
                    "targets":[5],
                    "render": function(data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets":[7],
                    "render": function(data, type, row, meta) {
                        var text = '<a href=\"javascript:;\" id=\"op_pre\">预览</a>';
                        if(makeEdit(menu,loginSucc.functionlist,"#op_edit")){
                            text += ' | <a href="javascript:;" id="op_edit">编辑</a>'
                        }
                        return text;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td', nRow).attr('style', 'vertical-align: middle; padding-left: 20px');
                $('td:eq(0), td:eq(1), td:eq(3), td:eq(4), td:eq(6)', nRow).attr('style', 'text-align: center; vertical-align: middle;');
            }
        });
        table.find('.group-checkable').change(function () {
            var set = jQuery(this).attr("data-set");
            var checked = jQuery(this).is(":checked");
            jQuery(set).each(function () {
                if (checked) {
                    $(this).prop("checked", true);
                    $(this).parents('tr').addClass("active");
                } else {
                    $(this).prop("checked", false);
                    $(this).parents('tr').removeClass("active");
                }
            });
        });

        table.on('change', 'tbody tr .checkboxes', function () {
            $(this).parents('tr').toggleClass("active");
        });


    };
    return {
        init: function (data) {
            if (!jQuery().dataTable) {
                return;
            }
            initTable(data);
        }
    };
}();

var ArtEdit = function() {
    var handleArticle = function() {
        var validator = $('.article-form').validate({
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
                var oldimage = $("input[name=oldimage]").val();
                if(article.coverimage != oldimage) {
                    //先上传封面图，再增加文章
                    var formData = new FormData();
                    var fileInfo = $("#cover").get(0).files[0];
                    fileInfo.floder = article.title + "coverimage";
                    formData.append('image', fileInfo);
                    $.ajax({
                        type: 'POST',
                        url: webUrl + "article/upload/image",
                        data: formData,
                        dataType: 'json',
                        contentType: false,
                        processData: false,
                        success: function (result) {
                            if (result.ret == '0000') {
                                article.coverimage = result.url;
                                if($("input[name=edittype]").val() == ARTICLEADD){
                                    articleAdd(article);
                                }else{
                                    articleEdit(article);
                                }
                            } else {
                                alertDialog("上传封面图片失败！" + result.msg);
                            }
                        },
                        error: function (ex) {
                            alertDialog("上传封面图片失败！");
                        }
                    });
                }else{
                    if($("input[name=edittype]").val() === ARTICLEADD){
                        articleAdd(article);
                    }else{
                        articleEdit(article);
                    }
                }
            }
        });

        $("#art_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".article-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑文章");
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var artid = $("#art_table").dataTable().fnGetData(row).artid;
            var art = new Object();
            for(var i=0; i < artList.length; i++){
                if(artid == artList[i].artid){
                    art = artList[i];
                }
            }
            //获取该文章的内容
            var data = {artid: artid};
            getArticleContent(data, art);
        });

        $("#art_table").on('click', '#op_pre', function (e) {
            var host = window.location.protocol + "//" + window.location.host;
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var artid = $("#art_table").dataTable().fnGetData(row).artid;
            window.open(host + "/template?artid=" + artid);
        });

        //新增文章
        $('#op_add').click(function() {
            validator.resetForm();
            $(".article-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增文章");
            $(":input",".article-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("#article").summernote("code", "");
            $("input[name=edittype]").val(ARTICLEADD);
            $("#cover").siblings("img").attr("src", "/public/manager/assets/pages/img/default.jpg");
            $("#cover").siblings("input[name=image], input[name=oldimage]").val("/public/manager/assets/pages/img/default.jpg");
            $('#edit_art').modal('show');
        });
    };

    return {
        init: function() {
            handleArticle();
        }
    };
}();

var ArtDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", ArtDelete.deleteArt, para)
        }
    });
    return{
        deleteArt: function(){
            var artlist = {artidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var artid = $("#art_table").dataTable().fnGetData(row).artid;
                artlist.artidlist.push(artid);
            });
            artDelete(artlist);
        }
    }
}();

function getArtDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            artList = res.artlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.artlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("文章获取失败！");
    }
}

function artInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case ARTICLEADD:
            text = "新增";
            break;
        case ARTDELETE:
            text = "删除";
            break;
        case ARTEDIT:
            text = "编辑";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ArtTable.init();
            $('#edit_art').modal('hide');
        }
    }
    if(alert == "") alert = text + "文章" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#art_inquiry").on("click", function(){
    //用户查询
    ArtTable.init();
});


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
    var myimg = URL.createObjectURL(file);
    var img = new Image();
    img.src = myimg;
    img.onload = function(){
        if(img.width === 170 && img.height === 170){
            imgObj.attr("src", myimg);
        }else{
            imgObj.attr("src", "/public/manager/assets/pages/img/default.jpg");
            inputObj.val("");
            $("#cover").val("");
            alertDialog("只能上传尺寸为170x170的图片！");
        }

    };
});


function getArticleContentEnd(flg, result, temp){
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var art = result.response;
            art.artid = temp.artid;
            var exclude = ["article"];
            var options = { jsonValue: art, exclude:exclude, isDebug: false};
            $(".article-form").initForm(options);
            //LOGO框赋值
            $("#cover").siblings("img").attr("src", temp.coverimage);
            $("#cover").siblings("input[name=coverimage], input[name=oldimage]").val(temp.coverimage);
            $("#article").summernote("code", art.content);
            $("input[name=edittype]").val(ARTEDIT);
            $('#edit_art').modal('show');
        }else{
            alertDialog("获取文章内容失败！");
        }
    }else{
        alertDialog("获取文章内容失败！");
    }
}