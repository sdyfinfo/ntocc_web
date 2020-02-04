/**
 * Created by Administrator on 2019/12/04.
 */
var abroadList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        $('#abroad').summernote({height: 300,lang:'zh-CN', maximumImageFileSize: 1024000});
        AbroadTable.init();
        AbroadEdit.init();
    });
}

var AbroadTable = function () {
    var initTable = function () {
        var table = $('#abroad_table');
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
                abroadDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "abroadid", visible: false },
                { "data": "title" },
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
                        return dateTimeFormat(data);
                    }
                },{
                    "targets":[6],
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
                $('td:eq(0), td:eq(1), td:eq(3), td:eq(5)', nRow).attr('style', 'text-align: center; vertical-align: middle;');
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

var AbroadEdit = function() {
    var handleAbroad = function() {
        var validator = $('.abroad-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                title: {
                    required: true,
                },
                abroad: {
                    required: true,
                }
            },

            messages: {
                title: {
                    required: "标题必须输入"
                },
                abroad: {
                    required: "内容必须输入",
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

        $('#abroad_modify').click(function() {
            btnDisable($('#abroad_modify'));
            if ($('.abroad-form').validate().form()) {
                var abroad = $('.abroad-form').getFormData();
                abroad.content = $("#abroad").summernote("code");
                if ($("input[name=edittype]").val() == ABROADADD) {
                    abroadAdd(abroad);
                } else {
                    abroadEdit(abroad);
                }
            }
        });
        //新增海外招募
        $('#op_add').click(function() {
            validator.resetForm();
            $(".abroad-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增海外招募");
            $(":input",".abroad-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("#abroad").summernote("code", "");
            $("input[name=edittype]").val(ABROADADD);
            $('#edit_abroad').modal('show');
        });
        //编辑海外招募
        $("#abroad_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".abroad-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑海外招募");
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var abroadid = $("#abroad_table").dataTable().fnGetData(row).abroadid;
            var abroad = new Object();
            for(var i=0; i < abroadList.length; i++){
                if(abroadid == abroadList[i].abroadid){
                    abroad = abroadList[i];
                }
            }
            //获取该文章的内容
            var data = {abroadid: abroadid};
            getAbroadContent(data, abroad);
        });
        $("#abroad_table").on('click', '#op_pre', function (e) {
            var host = window.location.protocol + "//" + window.location.host;
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var abroadid = $("#abroad_table").dataTable().fnGetData(row).abroadid;
            window.open(host + "/template?abroadid=" + abroadid);

        });
    };

    return {
        init: function() {
            handleAbroad();
        }
    };
}();

var AbroadDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", AbroadDelete.deleteAbroad, para)
        }
    });
    return{
        deleteAbroad: function(){
            var abroadlist = {abroadidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var abroadid = $("#abroad_table").dataTable().fnGetData(row).abroadid;
                abroadlist.abroadidlist.push(abroadid);
            });
            abroadDelete(abroadlist);
        }
    }
}();

function getAbroadDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            abroadList = res.abroadlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.abroadlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("海外招募内容获取失败！");
    }
}

function abroadInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case ABROADADD:
            text = "新增";
            break;
        case ABROADDELETE:
            text = "删除";
            break;
        case ABROADEDIT:
            text = "编辑";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            AbroadTable.init();
            $('#edit_abroad').modal('hide');
        }
    }
    if(alert == "") alert = text + "海外招募信息" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#abroad_inquiry").on("click", function(){
    //用户查询
    AbroadTable.init();
});

function getAbroadContentEnd(flg, result, temp){
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var abroad = result.response;
            abroad.abroadid = temp.abroadid;
            var exclude = ["abroad"];
            var options = { jsonValue: abroad, exclude:exclude, isDebug: false};
            $(".abroad-form").initForm(options);
            $("#abroad").summernote("code", abroad.content);
            $("input[name=edittype]").val(ABROADEDIT);
            $('#edit_abroad').modal('show');
        }else{
            alertDialog("获取海外招募内容失败！");
        }
    }else{
        alertDialog("获取海外招募内容失败！");
    }
}
