/**
 * Created by Administrator on 2020/2/6 0006.
 */

var projectList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {

        //项目表格
        ProjectTable.init();
        //项目表操作
        ProjectEdit.init();
    });
}

//项目表格
var ProjectTable = function () {
    var initTable = function () {
        var table = $('#pro_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false,
            "lengthMenu": TableLengthMenu,
            "destroy": true,
            "pageLength": PageLength,
            //"pagingType": "numbers",
            "serverSide": true,
            "processing": true,
            "searching": false,
            "ordering": false,
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    proname: formData.projectname,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                projectDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "proid",visible: false },
                { "data": "proname" },
                { "data": "routelist" },
                { "data": "create_time" },
                { "data": "update_time" },
                { "data": null }
            ],
            columnDefs: [
                {
                    "targets": [1],
                    "render": function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },
                {
                    "targets": [0],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1;  //行号
                    }
                },{
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        //做成可收缩格式
                        return formatRoute(data);
                    }
                },
                {
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        return conferenceDateFormat(data);
                    }
                },{
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        return conferenceDateFormat(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        var edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
//                            edit = '-';
//                        }else{
//                            edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        }
                        return edit;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0)', nRow).attr('style', 'text-align: center;');
                $('td:eq(1)', nRow).attr('style', 'text-align: center;');
                $('td:eq(4)', nRow).attr('style', 'text-align: center;');
                $('td:eq(5)', nRow).attr('style', 'text-align: center;');
                $('td:eq(6)', nRow).attr('style', 'text-align: center;');
            }
        });
        //table.draw( false );
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


$("#pro_inquiry").on("click", function(){
    //项目查询
    ProjectTable.init();
});

//将路线做成可收缩样式
function formatRoute(data){
    //如果线路不为空，显示data
    if(data.length != 0){
        var content = "";
        for(var i = 0; i<data.length;i++){
            content += "<div data-routeid='"+data[i].routeid+"'><a href='javascript:;' id='route_detail'>"+data[i].route+"</a></div>";
        }
        var main =
            "<div style='width: 100px;'>"+
            "<div id='routeOpen'><i class='iconfont icon-jianhao'>点击收回</i></div>"+
            "<div id='routeContent'>"+content+"</div>"+
            "</div>";
        return main;
    }else{
        return '';
    }
}

//线路展开/收回
$("#pro_table").on('click','#routeOpen',function(){
    if($(this).find(".icon-jianhao").length != 0){ //已展开
        $(this).siblings("#routeContent").hide();
        $(this).find("i").removeClass('icon-jianhao');
        $(this).find("i").addClass('icon-jiahao');
        $(this).find("i").html("点击展开");
    }else{
        $(this).siblings("#routeContent").show();
        $(this).find("i").removeClass('icon-jiahao');
        $(this).find("i").addClass('icon-jianhao');
        $(this).find("i").html("点击收回");
    }
});

//项目表操作
var ProjectEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                proname: {
                    required: true
                }
            },

            messages: {
                proname: {
                    required: "项目名称必须输入"
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

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var project = $('.register-form').getFormData();
            }
            if($("input[name=edittype]").val() == PROJECTADD){
                projectAdd(project);
            }else {
                var data;
                for (var i = 0; i < projectList.length; i++) {
                    if (project.proid == projectList[i].proid) {
                        data = projectList[i];
                    }
                }
                projectEdit(project);
            }
        });
        //新增项目
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增项目");
            $(":input",".register-form").not(":button,:reset,:submit,:radio,:input[name=birthday],#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("input[name=edittype]").val(PROJECTADD);
            $('#edit_pro').modal('show');
        });
        //编辑项目
        $('#pro_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var proid = $("#pro_table").dataTable().fnGetData(row).proid;
            var project = new Object();
            for(var i=0; i < projectList.length; i++){
                if(proid == projectList[i].proid){
                    project = projectList[i];
                }
            }
            var options = { jsonValue: project, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(PROJECTEDIT);
            $('#edit_pro').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//项目删除
var ProjectDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", ProjectDelete.deletePro)
        }
    });
    return{
        deletePro: function(){
            var prolist = {proidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                prolist.proidlist.push($(this).siblings().eq(1).text());
            });
            userDelete(prolist);
        }
    }
}();

//项目查询返回结果
function getProjectDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {

            var res = result.response;
            projectList = res.projectlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.projectlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("项目信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("项目信息获取失败！");
    }
}

//项目操作返回结果
function projectEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case PROJECTADD:
            text = "新增";
            break;
        case PROJECTEDIT:
            text = "编辑";
            break;
        case PROJECTDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ProjectTable.init();
            $('#edit_pro').modal('hide');
        }
    }
    if(alert == "") alert = text + "项目" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}