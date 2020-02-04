/**
 * Created by Administrator on 2019/12/04.
 */
var newbornList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        $('#newborn').summernote({height: 300,lang:'zh-CN', maximumImageFileSize: 1024000});
        NewbornTable.init();
        NewbornEdit.init();
    });
}

var NewbornTable = function () {
    var initTable = function () {
        var table = $('#newborn_table');
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
                newbornDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "newbornid", visible: false },
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

var NewbornEdit = function() {
    var handleNewborn = function() {
        var validator = $('.newborn-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                title: {
                    required: true,
                },
                newborn: {
                    required: true,
                }
            },

            messages: {
                title: {
                    required: "标题必须输入"
                },
                newborn: {
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

        $('#newborn_modify').click(function() {
            btnDisable($('#newborn_modify'));
            if ($('.newborn-form').validate().form()) {
                var newborn = $('.newborn-form').getFormData();
                newborn.content = $("#newborn").summernote("code");
                if ($("input[name=edittype]").val() == NEWBORNADD) {
                    newbornAdd(newborn);
                } else {
                    newbornEdit(newborn);
                }
            }
        });
        //新增新人专区
        $('#op_add').click(function() {
            validator.resetForm();
            $(".newborn-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增新人专区");
            $(":input",".newborn-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("#newborn").summernote("code", "");
            $("input[name=edittype]").val(NEWBORNADD);
            $('#edit_newborn').modal('show');
        });
        //编辑新人专区
        $("#newborn_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".newborn-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑新人专区");
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var newbornid = $("#newborn_table").dataTable().fnGetData(row).newbornid;
            var newborn = new Object();
            for(var i=0; i < newbornList.length; i++){
                if(newbornid == newbornList[i].newbornid){
                    newborn = newbornList[i];
                }
            }
            //获取该文章的内容
            var data = {newbornid: newbornid};
            getNewbornContent(data, newborn);
        });
        $("#newborn_table").on('click', '#op_pre', function (e) {
            var host = window.location.protocol + "//" + window.location.host;
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var newbornid = $("#newborn_table").dataTable().fnGetData(row).newbornid;
            window.open(host + "/template?newbornid=" + newbornid);

        });
    };

    return {
        init: function() {
            handleNewborn();
        }
    };
}();

var NewbornDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", NewbornDelete.deleteNewborn, para)
        }
    });
    return{
        deleteNewborn: function(){
            var newbornlist = {newbornidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var newbornid = $("#newborn_table").dataTable().fnGetData(row).newbornid;
                newbornlist.newbornidlist.push(newbornid);
            });
            newbornDelete(newbornlist);
        }
    }
}();

function getNewbornDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            newbornList = res.newbornlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.newbornlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("新人专区内容获取失败！");
    }
}

function newbornInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case NEWBORNADD:
            text = "新增";
            break;
        case NEWBORNDELETE:
            text = "删除";
            break;
        case NEWBORNEDIT:
            text = "编辑";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            NewbornTable.init();
            $('#edit_newborn').modal('hide');
        }
    }
    if(alert == "") alert = text + "新人专区信息" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#newborn_inquiry").on("click", function(){
    //用户查询
    NewbornTable.init();
});

function getNewbornContentEnd(flg, result, temp){
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var newborn = result.response;
            newborn.newbornid = temp.newbornid;
            var exclude = ["newborn"];
            var options = { jsonValue: newborn, exclude:exclude, isDebug: false};
            $(".newborn-form").initForm(options);
            $("#newborn").summernote("code", newborn.content);
            $("input[name=edittype]").val(NEWBORNEDIT);
            $('#edit_newborn').modal('show');
        }else{
            alertDialog("获取新人专区内容失败！");
        }
    }else{
        alertDialog("获取新人专区内容失败！");
    }
}
