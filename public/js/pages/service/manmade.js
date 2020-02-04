/**
 * Created by Administrator on 2019/12/04.
 */
var manmadeList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        $('#manmade').summernote({height: 300,lang:'zh-CN', maximumImageFileSize: 1024000});
        ManmadeTable.init();
        ManmadeEdit.init();
    });
}

var ManmadeTable = function () {
    var initTable = function () {
        var table = $('#manmade_table');
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
                manmadeDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "manmadeid", visible: false },
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

var ManmadeEdit = function() {
    var handleManmade = function() {
        var validator = $('.manmade-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                title: {
                    required: true,
                },
                manmade: {
                    required: true,
                }
            },

            messages: {
                title: {
                    required: "标题必须输入"
                },
                manmade: {
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

        $('#manmade_modify').click(function() {
            btnDisable($('#manmade_modify'));
            if ($('.manmade-form').validate().form()) {
                var manmade = $('.manmade-form').getFormData();
                manmade.content = $("#manmade").summernote("code");
                // if ($("input[name=edittype]").val() == MANMADEADD) {
                //     manmadeAdd(manmade);
                // } else {
                //     manmadeEdit(manmade);
                // }
                manmadeEdit(manmade);
            }
        });
        //新增人工服务
        /*$('#op_add').click(function() {
            validator.resetForm();
            $(".manmade-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增人工服务");
            $(":input",".manmade-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("#manmade").summernote("code", "");
            $("input[name=edittype]").val(MANMADEADD);
            $('#edit_manmade').modal('show');
        });*/
        //编辑人工服务
        $("#manmade_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".manmade-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑人工服务");
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var manmadeid = $("#manmade_table").dataTable().fnGetData(row).manmadeid;
            var manmade = new Object();
            for(var i=0; i < manmadeList.length; i++){
                if(manmadeid == manmadeList[i].manmadeid){
                    manmade = manmadeList[i];
                }
            }
            //获取该文章的内容
            var data = {manmadeid: manmadeid};
            getManmadeContent(data, manmade);
        });
        $("#manmade_table").on('click', '#op_pre', function (e) {
            var host = window.location.protocol + "//" + window.location.host;
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var manmadeid = $("#manmade_table").dataTable().fnGetData(row).manmadeid;
            window.open(host + "/template?manmadeid=" + manmadeid);

        });
    };

    return {
        init: function() {
            handleManmade();
        }
    };
}();

function getManmadeDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            manmadeList = res.manmadelist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.manmadelist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("人工服务内容获取失败！");
    }
}

function manmadeInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case MANMADEEDIT:
            text = "编辑";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ManmadeTable.init();
            $('#edit_manmade').modal('hide');
        }
    }
    if(alert == "") alert = text + "人工服务信息" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#manmade_inquiry").on("click", function(){
    //用户查询
    ManmadeTable.init();
});

function getManmadeContentEnd(flg, result, temp){
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var manmade = result.response;
            manmade.manmadeid = temp.manmadeid;
            var exclude = ["manmade"];
            var options = { jsonValue: manmade, exclude:exclude, isDebug: false};
            $(".manmade-form").initForm(options);
            $("#manmade").summernote("code", manmade.content);
            $("input[name=edittype]").val(MANMADEEDIT);
            $('#edit_manmade').modal('show');
        }else{
            alertDialog("获取人工服务内容失败！");
        }
    }else{
        alertDialog("获取人工服务内容失败！");
    }
}
