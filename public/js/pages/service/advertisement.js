/**
 * Created by Administrator on 2019/12/4.
 */
var adList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        $('#article').summernote({height: 300,lang:'zh-CN', maximumImageFileSize: 1024000});
        AdTable.init();
        AdEdit.init();
    });
}

var AdTable = function () {
    var initTable = function () {
        var table = $('#ad_table');
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
                adDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "adid", visible: false },
                { "data": "title" },
                { "data": "adimage" },
                { "data": "adtype" },
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
                        return "<img src='" + data + "' style='width: 72px; height:20px'>";
                    }
                },
                {
                    "targets":[5],
                    "render": function(data, type, row, meta) {
                        var adType = "外部链接";
                        if(data == "1"){
                            adType = "原创文章";
                        }
                        return adType;
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
                $('td:eq(0), td:eq(1), td:eq(3), td:eq(4), td:eq(6), td:eq(8)', nRow).attr('style', 'text-align: center; vertical-align: middle;');
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

var AdEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                title: {
                    required: true
                },
                innerurl: {
                    urlrequired:true,
                    url: true
                },
                article: {
                    artrequired:true
                },
                sort: {
                    required: true,
                    digits: true
                },
                adimage: {
                    required: true
                }
            },

            messages: {
                title: {
                    required: "图片必须输入"
                },
                innerurl: {
                    urlrequired: "图片链接必须输入",
                },
                sort: {
                    required: "排序号必须输入",
                },
                adimage: {
                    required: "广告图片必须上传",
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
            if($("#adtype").val() == "0"){
                return value.replace(/\s+/g, "") != "";
            }else{
                return true;
            }
        },"该字段必须输入");

        jQuery.validator.addMethod("artrequired", function(value, element) {
            var content = $("#article").summernote("code");
            if($("#adtype").val() == "1"){
                return content.replace(/\s+/g, "") != "";
            }else{
                return true;
            }
        },"该字段必须输入");

        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                //先上传LOGO
                var ad = $('.register-form').getFormData();
                ad.content = $("#article").summernote("code");
                //如果头像发生了变化，先上传头像
                //获取原来的头像
                var oldimage = $("input[name=oldimage]").val();
                if(ad.adimage != oldimage) {
                    var formData = new FormData();
                    var fileInfo = $("#adurl").get(0).files[0];
                    formData.append('image', fileInfo);
                    $.ajax({
                        type: 'POST',
                        url: webUrl + "advert/upload/image",
                        data: formData,
                        dataType: 'json',
                        contentType: false,
                        processData: false,
                        success: function (result) {
                            if (result.ret == "0000") {
                                ad.adurl = result.url;
                                if($("input[name=edittype]").val() == ADADD){
                                    adAdd(ad);
                                }else{
                                    adEdit(ad);
                                }
                            } else {
                                alertDialog("上传广告图片失败！" + result.msg);
                            }
                        },
                        error: function () {
                            alertDialog("上传广告图片失败！");
                        }
                    });
                }else {
                    if ($("input[name=edittype]").val() == ADADD) {
                        adAdd(ad);
                    } else {
                        adEdit(ad);
                    }
                }
            }
        });
        //新增角色
        $('#op_add').click(function() {
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增广告图片");
            $(":input",".register-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //select设定选择
            $("#adtype").val("0");
            $("#img-url").show();
            $("#img-article").hide();
            $("#article").summernote("code", "");
            //清空图片显示
            $("#adurl").siblings("img").attr("src", "/public/manager/assets/pages/img/default.jpg");
            $("#adurl").siblings("input[name=adimage], input[name=oldimage]").val("");
            $("input[name=edittype]").val(ADADD);
            $('#edit_ad').modal('show');
        });
        //编辑广告图片
        $("#ad_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑广告图片");
            var exclude = [""];
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var adid = $("#ad_table").dataTable().fnGetData(row).adid;
            var ad = new Object();
            for(var i=0; i < adList.length; i++){
                if(adid == adList[i].adid){
                    ad = adList[i];
                }
            }
            if(ad.adtype == 0){
                var options = { jsonValue: ad, exclude:exclude, isDebug: false};
                $(".register-form").initForm(options);
                $("#img-url").show();
                $("#img-article").hide();
                //LOGO框赋值
                $("#adurl").siblings("img").attr("src", ad.adimage);
                $("#adurl").siblings("input[name=adimage], input[name=oldimage]").val(ad.adimage);
                $("input[name=edittype]").val(ADEDIT);
                $('#edit_ad').modal('show');
            }else{
                //获取该文章的内容
                var data = {adid: adid};
                getAdContent(data, ad)
            }
        });
        $("#ad_table").on('click', '#op_pre', function (e) {
            var host = window.location.protocol + "//" + window.location.host;
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var adid = $("#ad_table").dataTable().fnGetData(row).adid;
            var ad = new Object();
            for(var i=0; i < adList.length; i++){
                if(adid == adList[i].adid){
                    ad = adList[i];
                }
            }
            if(ad.adtype == 0){
                window.open(ad.innerurl);
            }else{
                window.open(host + "/template?adid=" + adid);
            }
        });
    };

    return {
        init: function() {
            handleRegister();
        }
    };
}();

var AdDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", AdDelete.deleteAd, para)
        }
    });
    return{
        deleteAd: function(){
            var adlist = {adidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var adid = $("#ad_table").dataTable().fnGetData(row).adid;
                adlist.adidlist.push(adid);
            });
            adDelete(adlist);
        }
    }
}();

function getAdDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            adList = res.adlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.adlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        /*adList = [
            {adid:"1", adimage:"http://www.gramtu.com/group1/M00/00/00/rBBVI136KKKAQSSPAABaO2gQgo0198.png",time:"20191220111111",editor:"11",
                title:"test1", sort:1, adtype:0, innerurl:"http://www.gramtu.com/group1/M00/00/00/rBBVI136KKKAQSSPAABaO2gQgo0198.png"},
            {adid:"2", adimage:"http://www.gramtu.com/group1/M00/00/00/rBBVI136KKKAQSSPAABaO2gQgo0198.png",
                title:"test1", sort:1, adtype:1, innerurl:"",time:"20191220111111",editor:"11",}
        ];*/
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("广告图片获取失败！");
    }
}

function adInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case ADADD:
            text = "新增";
            break;
        case ADEDIT:
            text = "编辑";
            break;
        case ADDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            AdTable.init();
            $('#edit_ad').modal('hide');
        }
    }
    if(alert == "") alert = text + "广告图片" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#ad_inquiry").on("click", function(){
    //用户查询
    AdTable.init();
});


$("#adurl").change(function(){
    var file = $(this).get(0).files[0];
    var inputObj = $(this).siblings("input[name=adimage]");
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
        if(img.width === 720 && img.height === 250){
            imgObj.attr("src", myimg);
        }else{
            imgObj.attr("src", "/public/manager/assets/pages/img/default.jpg");
            inputObj.val("");
            $("#adurl").val("");
            alertDialog("只能上传尺寸为720x250的图片！");
        }
    };
});

$("#adtype").change(function(){
    if($(this).val() == 0){
        $("#img-url").show();
        $("#img-article").hide();
        $("#article").summernote("code", "");
    }else{
        $("#img-url").hide();
        $("#img-article").show();
        $("#img-url input[name=innerurl]").val("");
    }
});

function getAdContentEnd(flg, result, temp){
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var ad = result.response;
            ad.adid = temp.adid;
            var exclude = ["article"];
            var options = { jsonValue: ad, exclude:exclude, isDebug: false};
            $(".register-form").initForm(options);
            $("#img-url").hide();
            $("#img-article").show();
            //LOGO框赋值
            $("#adurl").siblings("img").attr("src", temp.adimage);
            $("#adurl").siblings("input[name=adimage], input[name=oldimage]").val(temp.adimage);
            $("#article").summernote("code", ad.content);
            $("input[name=edittype]").val(ADEDIT);
            $('#edit_ad').modal('show');
        }else{
            alertDialog("获取广告内容失败！");
        }
    }else{
        alertDialog("获取广告内容失败！");
    }
}
