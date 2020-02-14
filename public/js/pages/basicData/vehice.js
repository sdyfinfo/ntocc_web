/**
 * Created by Administrator on 2020/2/8 0008.
 */

var vehicleList = [];
var plateColor,ve_conductor,vehicleType,energy_Type = [];
var dictTrue = [];   //获取字典结果
var imgInit = "/public/img/img_upload.png";

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //获取字典相关信息
        var data = {};
        var list = ["10001","10002","10003","10004"];
        for(var i in list){
            data.lx = list[i];
            dictQuery(data);
        }
        //车辆操作和查看
        VehiceEdit.init();
    });
}

//时间控件初始化
var ComponentsDateTimePickers = function () {

    var handleDatePickers = function () {

        if (jQuery().datepicker) {
            $('.date-picker').datepicker({
                rtl: App.isRTL(),
                orientation: "auto",
                autoclose: true,
                language:"zh-CN",
                todayBtn:true,
                format:"yyyy-mm-dd",
                //showButtonPanel:true,
                todayHighlight: true
            });
            var date = getNowFormatDate();
            $("input[name='regdate']").datepicker("setDate",date);
            $("input[name='issue_date']").datepicker("setDate",date);
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();

//车辆表格
var VehiceTable = function () {
    var initTable = function () {
        var table = $('#vehice_table');
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
            "bAutoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    platenumber: formData.platenumber,
                    platecolor:formData.platecolor,
                    vehicletype:formData.vehicletype,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                vehiceDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "vehid",visible: false },
                { "data": "platenumber"},
                { "data": "platecolor" },
                { "data": "addtime" },
                { "data": "load" },
                { "data": "vehicletype"},
                { "data": "conductor"},
                { "data": "vin"},
                { "data": "transport_number"},
                { "data": "license_key"},
                { "data": "driving_img"},
                { "data": "updatetime"},
                { "data": null}
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
                    "targets": [3],
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" id="vehice_detail">'+data+'</a>';
                    }
                },
                {
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        //车辆颜色
                        return plateColorDisplay(data);
                    }
                },
                {
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        //车长
                        return conductorDisplay(data);
                    }
                },{
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        //车型
                        return vehiceTypeDisplay(data);
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        if(data == ""){
                            return "暂无图片";
                        }else{
                            return '<a href="javascript:;" class="imgCheck">查看图片<span hidden="hidden">'+data+'</span></a>';
                        }
                    }
                },{
                    "targets": [14],
                    "render": function (data, type, row, meta) {
                        var edit = '';
                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
                            edit = '-';
                        }else{
                            edit = '<a href="javascript:;" id="op_edit">编辑</a>';
                        }
                        return edit;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(11),td:eq(13)', nRow).attr('style', 'text-align: center;');
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

//车辆查询
$("#vehice_inquiry").on("click", function(){
    VehiceTable.init();
});

//车辆信息查看和编辑
var VehiceEdit = function() {
    var handleRegister = function() {
        var validator = $('.edit-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                platenumber: {
                    required: true
                },
                platecolor: {
                    required: true
                },
                conductor:{
                    required: true
                },
                vehicletype:{
                    required: true
                },
//                vin:{
//                    required: true
//                },
                energy_type:{
                    required: true
                },
//                proprietor:{
//                    required: true
//                },
//                nature:{
//                    required: true
//                },
//                office:{
//                    required: true
//                },
//                regdate:{
//                    required: true
//                },
//                issue_date:{
//                    required: true
//                },
                load:{
                    required: true
                },
                total_mass:{
                    required: true
                },
                transport_number:{
                    required: true
                },
                licensekey:{
                    required: true
                },
                driving_img: {
                    required: true
                }
//                transport_img:{
//                    required: true
//                },
//                license_img:{
//                    required: true
//                },
//                insurance_img:{
//                    required: true
//                },
//                group_photo:{
//                    required: true
//                }
            },

            messages: {
                platenumber: {
                    required: "车牌号必须输入"
                },
                platecolor: {
                    required: "车牌颜色必须选择"
                },
                conductor:{
                    required: "车长必须选择"
                },
                vehicletype:{
                    required: "车型必须选择"
                },
//                vin:{
//                    required: "车架号必须输入"
//                },
                energy_type:{
                    required: "能源类型必须输入"
                },
//                proprietor:{
//                    required: "车辆所有人必须输入"
//                },
//                nature:{
//                    required: "使用性质必须输入"
//                },
//                office:{
//                    required: "发证机关必须输入"
//                },
//                regdate:{
//                    required: "注册日期不能为空"
//                },
//                issue_date:{
//                    required: "发证日期不能为空"
//                },
                load:{
                    required: "核定载质量必须输入"
                },
                total_mass:{
                    required: "总质量必须输入"
                },
                transport_number:{
                    required: "道路运输证号必须输入"
                },
                licensekey:{
                    required: "道路经营许可证号必须输入"
                },
                driving_img: {
                    required: "行驶证必须上传"
                }
//                transport_img:{
//                    required: "道路运输证必须上传"
//                },
//                license_img:{
//                    required: "道路运输经营许可证必须上传"
//                },
//                insurance_img:{
//                    required: "保险卡必须上传"
//                },
//                group_photo:{
//                    required: "人车合影必须上传"
//                }
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
        $('#edit-btn').click(function() {
            btnDisable($('#edit-btn'));
            if ($('.edit-form').validate().form()) {
                var vehice = $('.edit-form').getFormData();
                vehice.regdate = vehice.regdate.replace(/-/g,'');
                vehice.issue_date = vehice.issue_date.replace(/-/g,'');
                vehice.organid = loginSucc.organid;
                var formData = new FormData();
                var data = sendMessageEdit(DEFAULT,vehice);
                formData.append("body",new Blob([data],{type:"application/json"}));
                var list = ["driving_img","transport_img","license_img","insurance_img","group_photo"];
                for(var i in list){
                    formData.append(list[i],null);
                }
                //判断是否上传文件
                for(var i in list){
                    if($("#"+list[i]).get(0).files[0]){
                        formData.set(list[i],$("#"+list[i]).get(0).files[0]);
                    }
                }
                if($("input[name=edittype]").val() == VEHICEADD){
                    vehiceAdd(formData);
                }else{
                    vehiceEdit(formData);
                }
            }
        });
        //查看车辆信息
        $('#vehice_table').on('click', '#vehice_detail', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("查看车辆");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var vehid = $("#vehice_table").dataTable().fnGetData(row).vehid;
            var vehice = new Object();
            for(var i=0; i < vehicleList.length; i++){
                if(vehid == vehicleList[i].vehid){
                    vehice = vehicleList[i];
                }
            }
            var options = { jsonValue: vehice, exclude:exclude,isDebug: false};
            $(".edit-form").initForm(options);
            //日期框赋值
            $("input[name=regdate]").datepicker("setDate",dateFormat(vehice.regdate, "-"));
            $("input[name=issue_date]").datepicker("setDate",dateFormat(vehice.issue_date, "-"));
            //清空文件
            clearFile();
            //显示图片
            $("#driving_img").siblings("label").find("img").attr("src",vehice.driving_img || imgInit);
            $("#transport_img").siblings("label").find("img").attr("src",vehice.transport_img || imgInit);
            $("#license_img").siblings("label").find("img").attr("src",vehice.license_img || imgInit);
            $("#insurance_img").siblings("label").find("img").attr("src",vehice.insurance_img || imgInit);
            $("#group_photo").siblings("label").find("img").attr("src",vehice.group_photo || imgInit);
            //是否允许上传图片
            fileUploadAllowed(0);
            $(".modal-footer").hide();
            $('#edit_vehice').modal('show');
        });
        //编辑车辆信息
        $('#vehice_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑车辆");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var vehid = $("#vehice_table").dataTable().fnGetData(row).vehid;
            var vehice = new Object();
            for(var i=0; i < vehicleList.length; i++){
                if(vehid == vehicleList[i].vehid){
                    vehice = vehicleList[i];
                }
            }
            var options = { jsonValue: vehice, exclude:exclude,isDebug: false};
            $(".edit-form").initForm(options);
            //日期框赋值
            $("input[name=regdate]").datepicker("setDate",dateFormat(vehice.regdate, "-"));
            $("input[name=issue_date]").datepicker("setDate",dateFormat(vehice.issue_date, "-"));
            //清空文件
            clearFile();
            //显示图片
            $("#driving_img").siblings("label").find("img").attr("src",vehice.driving_img || imgInit);
            $("#transport_img").siblings("label").find("img").attr("src",vehice.transport_img || imgInit);
            $("#license_img").siblings("label").find("img").attr("src",vehice.license_img || imgInit);
            $("#insurance_img").siblings("label").find("img").attr("src",vehice.insurance_img || imgInit);
            $("#group_photo").siblings("label").find("img").attr("src",vehice.group_photo || imgInit);
            //是否允许上传图片
            fileUploadAllowed(1);
            //车牌号只读
            $("#platenumber_edit").attr("disabled",true);
            $("input[name=edittype]").val(VEHICEEDIT);
            $(".modal-footer").show();
            $('#edit_vehice').modal('show');
        });
        //新增车辆
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增车辆");
            $(":input",".edit-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //清空文件
            clearFile();
            fileUploadAllowed(1);
            $("input[name=edittype]").val(VEHICEADD);
            $(".modal-footer").show();
            $('#edit_vehice').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//查看图片
$("#vehice_table").on('click',".imgCheck",function(e){
    var src = $(this).children("span")[0].innerText;
    $("#img_check").find("img").attr('src',src);
    $(".modal-title").text("图片查看");
    $("#img_check").modal('show');
});

//图片上传显示
$("input[type=file]").change(function(){
    var img = $(this).siblings("label").find("img");
    if(this.files[0]){
        var path = window.URL.createObjectURL(this.files[0]);
        $(this).siblings("input[type=text]").val(path);
        img.attr('src',path);
    }else{
        $(this).siblings("input[type=text]").val("");
        img.attr('src','/public/img/img_upload.png');
    }
});

//车辆删除
var VehiceDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", VehiceDelete.deletePro)
        }
    });
    return{
        deletePro: function(){
            var vehice = {vehidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                vehice.vehidlist.push($("#vehice_table").dataTable().fnGetData(row).vehid);
            });
            vehiceDelete(vehice);
        }
    }
}();

//导入车辆
$("#vehice_import").on("click",function(){
    $(".vehice_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#vehice_upload").modal('show');
});

//车辆文件点击上传
$("#vehice_file").change(function(){
    var img = $(this).siblings("label").find("img");
    if(this.files[0]){
        //显示上传文件名
        $("#upload_name").show();
        $("#upload_name").html("文件名："+this.files[0].name+"   文件大小："+((Number(this.files[0].size))/1024).toFixed(1)+"KB");
        var formData = new FormData();
        formData.append("file",this.files[0]);
        var userid = {
            "userid":loginSucc.userid,
            "organid":loginSucc.organid
        }
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        vehiceUpload(formData);
    }else{
        $("#upload_name").html("");
    }
});

//车辆文件拖拽上传
function allowDrop(ev) {
    //阻止浏览器默认打开文件的操作
    ev.preventDefault();
};
function drop(ev) {
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    var len = files.length;
    if(len!=0){
        var filesName=files[0].name;
        var extStart=filesName.lastIndexOf(".");
        var ext=filesName.substring(extStart,filesName.length).toUpperCase();
        if(ext ==".xlsx" || ext ==".XLSX"){ //判断是否是需要的问件类型
            //显示上传文件名
            $("#upload_name").show();
            $("#upload_name").html("文件名："+filesName+"   文件大小："+((Number(files[0].size))/1024).toFixed(1)+"KB");
            var formData = new FormData();
            formData.append("file",files[0]);
            var userid = {
                "userid":loginSucc.userid,
                "organid":loginSucc.organid
            }
            var data = sendMessageEdit(DEFAULT,userid);
            formData.append("body",new Blob([data],{type:"application/json"}));
            vehiceUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};

//车辆查询结果返回
function getVehiceDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            vehicleList = res.vehicleList;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.vehicleList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("车辆信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("车辆信息获取失败！");
    }
}

//显示车辆颜色
function plateColorDisplay(data){
    var color = "";
    for(var i in plateColor){
        if(data == plateColor[i].code){
            color = plateColor[i].value;
        }
    }
    return color;
}

//显示车型
function vehiceTypeDisplay(data){
    var type = "";
    for(var i = 0; i < vehicleType.length; i++){
        if(data == vehicleType[i].code){
            type = vehicleType[i].value;
        }
    }
    return type;
}

//显示车长
function conductorDisplay(data){
    var value = "";
    for(var i = 0; i < ve_conductor.length; i++){
        if(data == ve_conductor[i].code){
            value = ve_conductor[i].value;
        }
    }
    return value;
}

//车辆信息操作返回结果
function vehiceEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case VEHICEADD:
            text = "新增";
            break;
        case VEHICEEDIT:
            text = "编辑";
            break;
        case VEHICEDELETE:
            text = "删除";
            break;
        case VEHICEUPLOAD:
            text = "导入";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            VehiceTable.init();
            $('#add_vehice').modal('hide');
            $('#edit_vehice').modal('hide');
            $('#vehice_upload').modal('hide');
        }
    }
    if(alert == "") alert = text + "车辆信息" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//清空文件
function clearFile(){
    $(".edit-form").find("input[type=file]").val("");
    var list = ["#driving_img","#transport_img","#license_img","#insurance_img","#group_photo"];
    for(var i = 0;i<list.length;i++){
        $(list[i]).siblings("label").find("img").attr('src',imgInit);
    }
}

//是否允许上传图片
function fileUploadAllowed(id){
    var list = $(".edit-form").find("input[type=file]");
    for(var i = 0; i<list.length;i++){
        var fid = "#"+list[i].id;
        if(id == 0){ //不允许
            $(fid).attr("disabled",true);
            //全部只读
            $(".edit-form").find("select").attr("disabled", true);
            $(".edit-form").find("input").attr("disabled", true);
        }else{
            $(fid).attr("disabled",false);
            $(".edit-form").find("select").attr("disabled", false);
            $(".edit-form").find("input").attr("disabled", false);
        }
    }
}

//获取字典信息返回
function getDictDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            var dictlist = res.dictlist;
            //给准驾车型赋值
            dictTrue.push("1");
            for(var i = 0;i<dictlist.length;i++){
                switch (dictlist[i].lx){
                    case "10001":
                        plateColor = dictlist;
                        $("#platecolor").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        $("#platecolor_edit").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10002":
                        ve_conductor = dictlist;
                        $("#conductor").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10003":
                        vehicleType = dictlist;
                        $("#vehicletype").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        $("#vehicletype_edit").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10004":
                        energy_Type = dictlist;
                        $("#energy_type").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                }
                vehiceInfoRequest();
            }
        }else{
            dictTrue.push("0");
            vehiceInfoRequest();
        }
    }else{
        dictTrue.push("0");
        vehiceInfoRequest();
    }
}

//判断是否可以请求车辆信息
function vehiceInfoRequest(){
    if(dictTrue.length ==  4){
        //车辆表格
        VehiceTable.init();
    }
}
