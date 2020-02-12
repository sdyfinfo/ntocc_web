/**
 * Created by Lenovo on 2020/2/7.
 */

var lineList = [];
var projectList,dictList = [];
if(App.isAngularJsApp() == false){
    jQuery(document).ready(function(){
        //线路列表
        LineTable.init();
        //线路表
        LineEdit.init();
        //获取项目名称列表，用来做成项目选择框
        //proDataGet();
        //项目名称
        projectDataGet();
        //多控件初始化
        //LineSelect2.init();
        //goodsDateGet();
        //发货人
        consignorDataGet();
        //收货人
        consigneeidDateGet();
        //货物类型
        didDateGet();
    });
}


//项目列表
var LineTable = function(){
    var initTable = function(){
        var table = $('#line_table');
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
                    projectname: formData.project_name,
                    linename: formData.linename,
                    loading_address:formData.loading_address,
                    unloading_address:formData.unloading_address,
                    goods:formData.goods,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                lineDataGet(da, callback);
            },
            columns:[ //返回的json 数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                {"data":null},
                {"data":null},
                {"data":"lid", visible: false},
                {"data":"project_name"},
                {"data":"linename"},
                {"data":"loading_address"},
                {"data":"unloading_address"},
                {"data":"consignor"},
                {"data":"consignee"},
                {"data":"goods_type"},
                {"data":"goods"},
                {"data":"unit"},
                {"data":"univalence"},
                {"data":"state"},
                {"data":"addTime"},
                {"data":"updateTime"},
                {"data":"number"},
                {"data":null}
            ],
            columnDefs:[
                {
                    "targets":[0],
                    "data":null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1; //行号
                    }
                },
                {
                    "targets":[1],
                    "render":function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },{
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" id="vehice_detail">'+data+'</a>';
                    }
                },
                {
                    "targets":[13],
                    "render":function (data, type, row, meta) {
                        var state = '启动';
                        if (data == "1") {
                            state = '禁用'
                        }
                        return state;
                    }
                },
                {
                    "targets":[14],
                    "render": function (data, type, row ,meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets":[15],
                    "render": function (data, type, row ,meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets":[17],
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
                $('td:eq(0),td:eq(1),td:eq(4),td:eq(5),td:eq(6),td:eq(7)', nRow).attr('style', 'text-align: center;');
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

//返回线路查询结果
function getlineDataEnd(flg, result, callback){
    App.unblockUI("#lay-out");
    if(flg){
        if(result && result.retcode == SUCCESS){
            var res = result.response;
            lineList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.list, callback);
        }else {
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("线路信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("线路信息获取失败！");
    }
}

$("#pro_inquiry").on("click",function(){
    //线路查询
    LineTable.init();
});

//线路表
var LineEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                project_name: {
                    required: true
                },
                loading_place:{
                    required: true
                },
                unloading_name:{
                    required: true
                },
                loading_address:{
                    required: true
                },
                unloading_place:{
                    required: true
                },
                consignor:{
                    required: true
                },
                consignee:{
                    required: true
                },
                contacts:{
                    required: true
                },
                phone:{
                    required: true
                },
                goods_type:{
                    required: true
                },
                goods:{
                    required: true
                },
                numbers:{
                    required: true
                },
                consignorTel:{
                    required: true
                },
                consigneeTel:{
                    required: true
                }

            },

            messages: {
                project_name: {
                    required: "请输入项目名称"
                },
                loading_place:{
                    required: "请输入装货地名称"
                },
                unloading_name:{
                    required: "请输入卸货地名称"
                },
                loading_address:{
                    required: "请选择装货地址"
                },
                unloading_place:{
                    required: "请选择卸货地址"
                },
                consignor:{
                    required: "请选择发货人"
                },
                consignee:{
                    required: "请选择收货人"
                },
                contacts:{
                    required: "请输入线路联系人"
                },
                phone:{
                    required: "请输入联系电话"
                },
                goods_type:{
                    required: "请选择货物类型"
                },
                goods:{
                    required: "请选择货物名称"
                },
                numbers:{
                    required: "请输入总发运数量"
                },
                consignorTel:{
                    required: "请输入发货人电话"
                },
                consigneeTel:{
                    required: "请输入收货人电话"
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
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的联系电话");

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var line = $('.register-form').getFormData();
               /* var data;
                for(var i = 0; i <lineList.length; i++){
                    if(line.lid == lineList[i].lid ){
                        data = lineList;
                    }
                }*/
                //装货
                var loading_province = $("#loading_provincecode").find("option:selected").text();
                var loading_city = $("#loading_citycode").find("option:selected").text();
                var loading_county = $("#loading_countycode").find("option:selected").text();
                //卸货
                var unloading_province = $("#unloading_provincecode").find("option:selected").text();
                var unloading_city = $("#unloading_citycode").find("option:selected").text();
                var unloading_county = $("#unloading_countycode").find("option:selected").text();
                line.project_name = $("#project_name").val();
                line.loading_place = $("#loading_place").val();
                line.unloading_name = $('#unloading_name').val();
                line.loading_address = $('#loading_address').val();
                line.unloading_place = $('#unloading_place').val();
                line.consignor = $('#consignorid').val();
                line.consignee = $('#consigneeid').val();
                line.goods_type = $('#goods_type').val();
                line.goods = $('#goods').val();
            }
            if($("input[name=edittype]").val() == LINEADD){
                lineAdd(line);
            }else {
                var data;
                for(var i = 0; i < lineList.length; i++) {
                    if(line.lid == lineList[i].lid){
                        data = lineList[i];
                    }
                }
                /*if(equar(line.project_name, (data.project_id || "").split(","))){
                    line.project_name = [];
                }*/
                lineEdit(line,LINEEDIT);
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
            $(".register-form").find("input[name=pid]").attr("readonly", false);
            $("input[name=edittype]").val(LINEADD);
            $('#edit_lin').modal('show');
        });
        //查看
        $('#line_table').on('click', '#vehice_detail', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var lid = $("#line_table").dataTable().fnGetData(row).lid;
            var line = new Object();
            for(var i=0; i < lineList.length; i++){
                if(lid == lineList[i].lid){
                    line = lineList[i];
                }
            }
            var options = { jsonValue: line, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            //项目名称赋值
            $("#project_name").find("option:selected").text();
            $("#loading_place").val(line.loading_place);
            $("#unloading_name").val(line.unloading_address);
            $("#loadingadd").val(line.unloading_place);
            /* var project_name = $("#line_table").dataTable().fnGetData(row).project_name;
             var loading_place = $("#line_table").dataTable().fnGetData(row).loading_place;
             var unloading_address = $("#line_table").dataTable().fnGetData(row).unloading_address;
             var unloading_place = $("#line_table").dataTable().fnGetData(row).unloading_place;*/
            fileUploadAllowed(0);
            $("input[name=edittype]").val(LINEEDIT);
            $('#edit_lin').modal('show');
        });

        //编辑项目
        $('#line_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var lid = $("#line_table").dataTable().fnGetData(row).lid;
            var line = new Object();
            for(var i=0; i < lineList.length; i++){
                if(lid == lineList[i].lid){
                    line = lineList[i];
                }
            }
            var options = { jsonValue: line, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            //项目名称赋值
            $("#project_name").find("option:selected").text();
            $("#loading_place").val(line.loading_place);
            $("#unloading_name").val(line.unloading_address);
            $("#loadingadd").val(line.unloading_place);
           /* var project_name = $("#line_table").dataTable().fnGetData(row).project_name;
            var loading_place = $("#line_table").dataTable().fnGetData(row).loading_place;
            var unloading_address = $("#line_table").dataTable().fnGetData(row).unloading_address;
            var unloading_place = $("#line_table").dataTable().fnGetData(row).unloading_place;*/
            fileUploadAllowed(1);
            $("input[name=edittype]").val(LINEEDIT);
            $('#edit_lin').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//线路操作返回结果
function lineEditEnd (flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case LINEADD:
            text = "新增";
            break;
        case LINEEDIT:
            text = "编辑";
            break;
        case LINEDELETE:
            text = "删除";
            break;
        case LINESTATUS:
            text = "状态设置";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            LineTable.init();
            $('#edit_lin').modal('hide');
        }
    }
    if(alert == ""){
        if(type == LINESTATUS){
            alert ="线路"+ text + res + "！";
        }else{
            alert = text + "线路" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}


//获取项目名称
function proDataGetEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var projectList = result.response.project_name;
            procjectNameSelectBuild(projectList);
        }
    }
}


//删除
var LineDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", LineDelete.deleteline)
        }
    });
    return{
        deleteline: function(){
            var linelist = {lineidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                linelist.lineidlist.push($(this).siblings().eq(1).text());
            });
            lineDelete(linelist);
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
            for(var i = 0; i < projectList.length; i++){
                $("#project_name").append("<option>"+ projectList[i].proname +"</option>");
            }
        }else{
            alertDialog("项目名称获取失败！");
        }
    }else{
        alertDialog("项目名称获取失败！");
    }
}

//发货人
function getConsignorDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            conList = res.conlist;
            for(var i = 0; i < conList.length; i++){
                $("#consignor").append("<option>"+ conList[i].consignor +"</option>");
            }
        }else{
            alertDialog("发货人名称获取失败！");
        }
    }else{
        alertDialog("发货人名称获取失败！");
    }
}


//发货人
function getconsigneeidDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {

            var res = result.response;
            conList = res.conlist;
            for(var i = 0; i < conList.length; i++){
                $("#consignee").append("<option>"+ conList[i].consignee +"</option>");
            }
        }else{
            alertDialog("收货人名称获取失败！");
        }
    }else{
        alertDialog("收货人名称获取失败！");
    }
}

//货物类型
function getdidDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {

            var res = result.response;
            dictList = res.dictlist;
            for(var i = 0; i < dictList.length; i++){
                $("#goods_type").append("<option>"+ dictList[i].value +"</option>");
            }
        }else{
            alertDialog("货物类型获取失败！");
        }
    }else{
        alertDialog("货物类型获取失败！");
    }
}

function fileUploadAllowed(id){
    var list = $(".edit-form").find("input[type=file]");
    for(var i = 0; i<list.length;i++){
        var lid = "#"+list[i].id;
        if(id == 0){ //不允许
            $(lid).attr("disabled",true);
            //全部只读
            $(".edit-form").find("select").attr("disabled", true);
            $(".edit-form").find("input").attr("disabled", true);
        }else{
            $(lid).attr("disabled",false);
            $(".edit-form").find("select").attr("disabled", false);
            $(".edit-form").find("input").attr("disabled", false);
        }
    }
}