/**
 * Created by Administrator on 2019/2/21.
 */
/**
 * Created by Administrator on 2019/2/19.
 */
var servList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        $('#article').summernote({height: 300,lang:'zh-CN', maximumImageFileSize: 1024000});
        ServTable.init();
        ServEdit.init();
    });
}

var ServTable = function () {
    var initTable = function () {
        var table = $('#serv_table');
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
                    servname: formData.servname,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                servDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "servid", visible: false },
                { "data": "servname" },
                { "data": "servimage" },
                { "data": "servtype" },
                { "data": "sort" },
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
                        var servType = "外部链接";
                        if(data == "1"){
                            servType = "原创文章";
                        }
                        return servType;
                    }
                },
                {
                    "targets":[7],
                    "render": function(data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets":[9],
                    "render": function(data, type, row, meta) {
                        var text = '<a href="javascript:;" id="op_pre">预览</a>';
                        if(makeEdit(menu,loginSucc.functionlist,"#op_edit")){
                            text += ' | <a href="javascript:;" id="op_edit">编辑</a>'
                        }
                        return text;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td', nRow).attr('style', 'vertical-align: middle; padding-left: 20px');
                $('td:eq(0), td:eq(1), td:eq(3), td:eq(6), td:eq(8)', nRow).attr('style', 'text-align: center; vertical-align: middle;');
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

var ServEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                servname: {
                    required: true
                },
                servlink: {
                    urlrequired:true,
                    url:true
                },
                sort: {
                    required: true
                },
                servimage: {
                    required: true
                },
                article: {
                    artrequired:true
                }
            },

            messages: {
                servname: {
                    required: "服务名必须输入"
                },
                servlink: {
                    urlrequired: "链接地址必须输入"
                },
                sort: {
                    required: "排序号必须输入"
                },
                servimage: {
                    required: "服务LOGO必须上传"
                },
                article: {
                    artrequired:"文章内容必须输入"
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
        jQuery.validator.addMethod("urlrequired", function(value, element) {
            if($("#servtype").val() == "0"){
                return value.replace(/\s+/g, "") != "";
            }else{
                return true;
            }
        },"该字段必须输入");

        jQuery.validator.addMethod("artrequired", function(value, element) {
            var content = $("#article").summernote("code");
            if($("#servtype").val() == "1"){
                return content.replace(/\s+/g, "") != "";
            }else{
                return true;
            }
        },"该字段必须输入");


        $('#serv-add-confirm').click(function() {
            btnDisable($('#serv-add-confirm'));
            if ($('.register-form').validate().form()) {
                //先上传LOGO
                var serv = $('.register-form').getFormData();
                serv.content = $("#article").summernote("code");
                //如果头像发生了变化，先上传头像
                //获取原来的头像
                var oldimage = $("input[name=oldimage]").val();
                if(serv.servimage != oldimage) {
                    var formData = new FormData();
                    var fileInfo = $("#servlogo").get(0).files[0];
                    formData.append('image', fileInfo);
                    $.ajax({
                        type: 'POST',
                        url: webUrl + "feature/upload/image",
                        data: formData,
                        dataType: 'json',
                        contentType: false,
                        processData: false,
                        success: function (result) {
                            if (result.ret) {
                                serv.servimage = result.url;
                                if($("input[name=edittype]").val() == SERVADD){
                                    servAdd(serv);
                                }else{
                                    servEdit(serv);
                                }
                            } else {
                                alertDialog("上传LOGO失败！" + result.msg);
                            }
                        },
                        error: function () {
                            alertDialog("上传LOGO失败！");
                        }
                    });
                }else {
                    if ($("input[name=edittype]").val() == SERVADD) {
                        servAdd(serv);
                    } else {
                        servEdit(serv);
                    }
                }
            }
        });
        //新增角色
        $('#op_add').click(function() {
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增特色服务");
            $(":input",".register-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //select设定选择
            $("#servtype").val("0");
            $("#img-url").show();
            $("#img-article").hide();
            $("#article").summernote("code", "");
            //清空LOGO显示
            $("#servlogo").siblings("img").attr("src", "/public/manager/assets/pages/img/default.jpg");
            $("#servlogo").siblings("input[name=servimage], input[name=oldimage]").val("");
            $("input[name=edittype]").val(SERVADD);
            $('#edit_serv').modal('show');
        });
        //编辑特色服务
        $("#serv_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑特色服务");
            var exclude = [""];
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var servid = $("#serv_table").dataTable().fnGetData(row).servid;
            var serv = new Object();
            for(var i=0; i < servList.length; i++){
                if(servid == servList[i].servid){
                    serv = servList[i];
                }
            }
            if(serv.servtype == 0){
                var options = { jsonValue: serv, exclude:exclude, isDebug: false};
                $(".register-form").initForm(options);
                $("#img-url").show();
                $("#img-article").hide();
                //LOGO框赋值
                $("#servlogo").siblings("img").attr("src", serv.servimage);
                $("#servlogo").siblings("input[name=servimage], input[name=oldimage]").val(serv.servimage);
                $("input[name=edittype]").val(SERVEDIT);
                $('#edit_serv').modal('show');
            }else{
                //获取该文章的内容
                var data = {servid: servid};
                getServContent(data, serv)
            }
        });
        $("#serv_table").on('click', '#op_pre', function (e) {
            var host = window.location.protocol + "//" + window.location.host;
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var servid = $("#serv_table").dataTable().fnGetData(row).servid;
            var serv = new Object();
            for(var i=0; i < servList.length; i++){
                if(servid == servList[i].servid){
                    serv = servList[i];
                }
            }
            if(serv.servtype == 0){
                window.open(serv.servlink);
            }else{
                window.open(host + "/template?servid=" + servid);
            }

        });
    };

    return {
        init: function() {
            handleRegister();
        }
    };
}();

var ServDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", ServDelete.deleteServ, para)
        }
    });
    return{
        deleteServ: function(){
            var servlist = {servidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var servid = $("#serv_table").dataTable().fnGetData(row).servid;
                servlist.servidlist.push(servid);
            });
            servDelete(servlist);
        }
    }
}();

function getServDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            servList = res.servlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.servlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("特色服务信息获取失败！");
    }
}

function servInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case SERVADD:
            text = "新增";
            break;
        case SERVEDIT:
            text = "编辑";
            break;
        case SERVDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ServTable.init();
            $('#edit_serv').modal('hide');
        }
    }
    if(alert == "") alert = text + "特色服务" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#serv_inquiry").on("click", function(){
    //用户查询
    ServTable.init();
});

$("#servlogo").change(function(){
    var file = $(this).get(0).files[0];
    var inputObj = $(this).siblings("input[name=servimage]");
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
        if(img.width === 100 && img.height === 100){
            imgObj.attr("src", myimg);
        }else{
            imgObj.attr("src", "/public/manager/assets/pages/img/default.jpg");
            inputObj.val("");
            $("#servlogo").val("");
            alertDialog("只能上传尺寸为100x100的图片！");
        }
    };
});


$("#servtype").change(function(){
    if($(this).val() == 0){
        $("#img-url").show();
        $("#img-article").hide();
        $("#article").summernote("code", "");
    }else{
        $("#img-url").hide();
        $("#img-article").show();
        $("#img-url input[name=servlink]").val("");
    }
});


function getServContentEnd(flg, result, temp){
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var serv = result.response;
            serv.servid = temp.servid;
            var exclude = ["article"];
            var options = { jsonValue: serv, exclude:exclude, isDebug: false};
            $(".register-form").initForm(options);
            $("#img-url").hide();
            $("#img-article").show();
            //LOGO框赋值
            $("#servlogo").siblings("img").attr("src", temp.servimage);
            $("#servlogo").siblings("input[name=servimage], input[name=oldimage]").val(temp.servimage);
            $("#article").summernote("code", serv.content);
            $("input[name=edittype]").val(SERVEDIT);
            $('#edit_serv').modal('show');
        }else{
            alertDialog("获取特色服务内容失败！");
        }
    }else{
        alertDialog("获取特色服务内容失败！");
    }
}
