/**
 * Created by Administrator on 2020/2/10 0010.
 */

var driverList = [];
var vehicleList = [];
var payeeList = [];
var dictlist = [];
var imgInit = "/public/img/img_upload.png";

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //获取车辆信息
        vehiceDataGet();
        //获取字典信息
        var data = {"lx":"10007"};
        dictQuery(data);
        //获取收款人信息
        payeeDataGet();
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //司机编辑和查看
        DriverEdit.init();
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
            $("input[name='driving_license_starttime']").datepicker("setDate",date);
            $("input[name='driving_license_endtime']").datepicker("setDate",date);
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();

//司机表格
var DriverTable = function () {
    var initTable = function () {
        var table = $('#driver_table');
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
                    name: formData.name,
                    id_number:formData.id_number,
                    plate_number:formData.platenumber,
                    payee_name:formData.payeename,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                deiverDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "did",visible: false },
                { "data": "name"},
                { "data": "id_number" },
                { "data": "phone" },
                { "data": "quasi_driving" },
                { "data": "qualification"},
                { "data": "id_front"},
                { "data": "driving_license"},
                { "data": "payee_name"},
                { "data": "plate_number"},
                { "data": "state"},
                { "data": "updateTime"},
                { "data": "bank",visible: false},
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
                        return '<a href="javascript:;" id="driver_detail">'+data+'</a>';
                    }
                },
                {
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        //准驾车型
                        return quasiDisplay(data);
                    }
                },
                {
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        if(data == ""){
                            return "暂无图片";
                        }else{
                            return '<a href="javascript:;" class="imgCheck">查看图片<span hidden="hidden">'+data+'</span></a>';
                        }
                    }
                },{
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        if(data == ""){
                            return "暂无图片";
                        }else{
                            return '<a href="javascript:;" class="imgCheck">查看图片<span hidden="hidden">'+data+'</span></a>';
                        }
                    }
                },
                {
                    "targets": [10],
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" class="receivables_click">'+data+'</a>';
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        return statusFormat(data);
                    }
                },
                {
                    "targets": [15],
                    "render": function (data, type, row, meta) {
                        var edit = "";
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

//司机查询
$("#driver_inquiry").on("click", function(){
    DriverTable.init();
});

//司机操作
var DriverEdit = function() {
    var handleRegister = function() {
        var validator = $('.edit-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                id_number: {
                    required: true,
                    idcard:true
                },
                name: {
                    required: true
                },
                quasi_driving:{
                    required: true
                },
                qualification:{
                    required: true
                },
                phone:{
                    required: true,
                    phone:true
                }
//                id_front:{
//                    required: true
//                },
//                id_back:{
//                    required: true
//                },
//                driving_license: {
//                    required: true
//                }
            },

            messages: {
                id_number: {
                    required: "身份证号必须输入"
                },
                name: {
                    required: "司机姓名必须输入"
                },
                quasi_driving:{
                    required: "准驾车型必须选择"
                },
                qualification:{
                    required: "从业资格证号必须输入"
                },
                phone:{
                    required: "手机号必须输入"
                }
//                id_front:{
//                    required: "身份证正面照必须上传"
//                },
//                id_back:{
//                    required: "身份证反面照必须上传"
//                },
//                driving_license: {
//                    required: "行驶证必须上传"
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

        //身份证号验证
        jQuery.validator.addMethod("idcard",function(value,element) {
            var idCard = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;            ;
            return this.optional(element) || (idCard.test(value));
        },"请正确填写您的身份证号");

        // 手机号码验证
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的手机号码");

        //关联车辆判断
        $("input[name=plate_number],input[name=platenumber]").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<vehicleList.length;i++){
                list.push(vehicleList[i].platenumber);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
            }
        });
        //关联收款人判断
        $("input[name=payeename],input[name=payee_name]").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<payeeList.length;i++){
                list.push(payeeList[i].payname);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
            }
        });
        //点击确定按钮
        $('#edit-btn').click(function() {
            btnDisable($('#edit-btn'));
            if ($('.edit-form').validate().form()) {
                var driver = $('.edit-form').getFormData();
                driver.driving_license_starttime = driver.driving_license_starttime.replace(/-/g,'');
                driver.driving_license_endtime = driver.driving_license_endtime.replace(/-/g,'');
                driver.vehicle_id = "";
                driver.payid = "";
                for(var i in vehicleList){
                    if(driver.plate_number == vehicleList[i].platenumber){
                        driver.vehicle_id = vehicleList[i].vehid;
                    }
                }
                for(var i in payeeList){
                    if(driver.payee_name == payeeList[i].payname){
                        driver.payid = payeeList[i].payid;
                    }
                }
                var formData = new FormData();
                var list = ["driving_license","id_front","id_back","qualification_img"];
                for(var i in list){
                    formData.append(list[i],null);
                }
                var data = sendMessageEdit(DEFAULT,driver);
                formData.append("body",new Blob([data],{type:"application/json"}));
                //判断是否上传文件
                for(var i in list){
                    if($("#"+list[i]).get(0).files[0]){
                        formData.set(list[i],$("#"+list[i]).get(0).files[0]);
                    }
                }
                if($("input[name=edittype]").val() == DRIVERADD){
                    driverAdd(formData);
                }else{
                    driverEdit(formData);
                }
            }
        });
        //查看司机信息
        $('#driver_table').on('click', '#driver_detail', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("查看司机");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var did = $("#driver_table").dataTable().fnGetData(row).did;
            var driver = new Object();
            for(var i=0; i < driverList.length; i++){
                if(did == driverList[i].did){
                    driver = driverList[i];
                }
            }
            var options = { jsonValue: driver, exclude:exclude,isDebug: false};
            $(".edit-form").initForm(options);
            //日期框赋值
            $("input[name=driving_license_starttime]").datepicker("setDate",dateFormat(driver.driving_license_starttime, "-"));
            $("input[name=driving_license_endtime]").datepicker("setDate",dateFormat(driver.driving_license_endtime, "-"));
            //清空文件
            clearFile();
            //显示图片
            $("#id_front").siblings("label").find("img").attr("src",driver.id_front || imgInit);
            $("#id_back").siblings("label").find("img").attr("src",driver.id_back || imgInit);
            $("#driving_license").siblings("label").find("img").attr("src",driver.driving_license || imgInit);
            $("#qualification_img").siblings("label").find("img").attr("src",driver.qualification_img || imgInit);
            //是否允许上传图片
            fileUploadAllowed(0);
            $(".modal-footer").hide();
            $('#edit_driver').modal('show');
        });
        //编辑司机信息
        $('#driver_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑司机");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var did = $("#driver_table").dataTable().fnGetData(row).did;
            var driver = new Object();
            for(var i=0; i < driverList.length; i++){
                if(did == driverList[i].did){
                    driver = driverList[i];
                }
            }
            var options = { jsonValue: driver, exclude:exclude,isDebug: false};
            $(".edit-form").initForm(options);
            //日期框赋值
            $("input[name=driving_license_starttime]").datepicker("setDate",dateFormat(driver.driving_license_starttime, "-"));
            $("input[name=driving_license_endtime]").datepicker("setDate",dateFormat(driver.driving_license_endtime, "-"));
            //清空文件
            clearFile();
            //显示图片
            $("#id_front").siblings("label").find("img").attr("src",driver.id_front || imgInit);
            $("#id_back").siblings("label").find("img").attr("src",driver.id_back || imgInit);
            $("#driving_license").siblings("label").find("img").attr("src",driver.driving_license || imgInit);
            $("#qualification_img").siblings("label").find("img").attr("src",driver.qualification_img || imgInit);
            //是否允许上传图片
            fileUploadAllowed(1);
            //只读
            $("#id_front,#id_back").attr("disabled",true);
            $(".edit-form").find("input[name=name]").attr("readonly","readonly");
            $(".edit-form").find("input[name=id_number]").attr("readonly","readonly");
            $("input[name=edittype]").val(VEHICEEDIT);
            $(".modal-footer").show();
            $('#edit_driver').modal('show');
        });
        //新增司机
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增司机");
            $(":input",".edit-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //清空文件
            clearFile();
            //是否允许上传图片
            fileUploadAllowed(1);
            $(".modal-footer").show();
            $("input[name=edittype]").val(DRIVERADD);
            $('#edit_driver').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//查看图片
$("#driver_table").on('click',".imgCheck",function(e){
    var src = $(this).children("span")[0].innerText;
    $("#img_check").find("img").attr('src',src);
    $(".modal-title").text("图片查看");
    $("#img_check").modal('show');
});

//收款人跳转界面
$("#driver_table").on('click','.receivables_click',function(){
    var row = $(this).parents('tr')[0];
    var receivables_id = $("#driver_table").dataTable().fnGetData(row).receivables_id;
    var receivables = $(this)[0].innerText;
    var bank = $("#driver_table").dataTable().fnGetData(row).bank;
    location.href = 'receivables?username='+loginSucc.userid+"&receivables="+receivables+"&bank="+bank;
});

//项目状态显示
function statusFormat(data){
    var content;
    switch (data){
        case "0":  //启用
            content =
                "<div class='switch'>"+
                "<div class='onoffswitch'>"+
                "<input type='checkbox' checked='' class='onoffswitch-checkbox'>"+
                "<label class='onoffswitch-label' data-status='1' id='statusChange'>"+
                "<span class='inner on_inner' style='float: left'>启用</span>"+
                "<span class='switch' style='float: right'></span>"+
                "</label>"+
                "</div>"+
                "</div>";
            break;
        case "1":  //启用
            content =
                "<div class='switch'>"+
                "<div class='onoffswitch'>"+
                "<input type='checkbox' checked='' class='onoffswitch-checkbox'>"+
                "<label class='onoffswitch-label' style='border: 2px solid #ff0000;' data-status='0' id='statusChange'>"+
                "<span class='inner off_inner' style='float: right'>停用</span>"+
                "<span class='switch' style='float: left'></span>"+
                "</label>"+
                "</div>"+
                "</div>";
            break;
    }
    return content;
}

//项目状态更改
var StatusChange = function(){
    var driver = {};
    $("#driver_table").on('click','#statusChange',function(){
        //获取id和status
        var row = $(this).parents('tr')[0];
        var did = $("#driver_table").dataTable().fnGetData(row).did;
        driver.did = did;
        driver.state = $(this).data('status');
        //先提示
        confirmDialog("您确定要更改该项目状态吗？", StatusChange.changeStatus);
    });
    return{
        changeStatus: function(){
            driverState(driver);
        }
    }
}();

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

//司机删除
var DriverDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", DriverDelete.deletePro)
        }
    });
    return{
        deletePro: function(){
            var driver = {driveridlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                driver.driveridlist.push($("#driver_table").dataTable().fnGetData(row).did);
            });
            driverDelete(driver);
        }
    }
}();


//导入司机
$("#driver_import").on("click",function(){
    $(".driver_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#driver_upload").modal('show');
});

//车辆文件点击上传
$("#driver_file").change(function(){
    var img = $(this).siblings("label").find("img");
    if(this.files[0]){
        //显示上传文件名
        $("#upload_name").show();
        $("#upload_name").html("文件名："+this.files[0].name+"   文件大小："+((Number(this.files[0].size))/1024).toFixed(1)+"KB");
        var formData = new FormData();
        formData.append("file",this.files[0]);
        var userid = {
            "userid":loginSucc.userid
        }
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        driverUpload(formData);
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
                "userid":loginSucc.userid
            };
            var data = sendMessageEdit(DEFAULT,userid);
            formData.append("body",new Blob([data],{type:"application/json"}));
            driverUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};

//司机操作结果返回
function driverEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case DRIVERADD:
            text = "新增";
            break;
        case DRIVEREDIT:
            text = "编辑";
            break;
        case DRIVERDELETE:
            text = "删除";
            break;
        case DRIVERUPLOAD:
            text = "导入";
            break;
        case DRIVERSTATUS:
            text = "状态设置";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            DriverTable.init();
            $('#edit_driver').modal('hide');
            $('#driver_upload').modal('hide');
        }
    }
    if(alert == ""){
        if(type == DRIVERSTATUS){
            alert ="司机信息"+ text + res + "！";
        }else{
            alert = text + "司机信息" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//清空文件
function clearFile(){
    $(".edit-form").find("input[type=file]").val("") ;
    $("#driving_license").siblings("label").find("img").attr('src',imgInit);
    $("#id_front").siblings("label").find("img").attr('src',imgInit);
    $("#id_back").siblings("label").find("img").attr('src',imgInit);
    $("#qualification_img").siblings("label").find("img").attr('src',imgInit);
}

//司机信息结果返回
function getDriverDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            driverList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, driverList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("司机信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("司机信息获取失败！");
    }
}

//车辆信息结果返回
function getVehiceDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            vehicleList = res.vehicleList;
            //给关联车辆datalist赋值
            for(var i = 0;i<vehicleList.length;i++){
                $("#vehiceList").append("<option>"+vehicleList[i].platenumber+"</option>");
                $("#vehiceList_edit").append("<option>"+vehicleList[i].platenumber+"</option>");
            }
        }else{
            alertDialog("车辆信息获取失败！");
        }
    }else{
        alertDialog("车辆信息获取失败！");
    }
}

//收款人信息返回
function getPayeeDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            payeeList = res.payeelist;
            //给关联车辆datalist赋值
            for(var i = 0;i<payeeList.length;i++){
                $("#payeeList").append("<option>"+payeeList[i].payname+"</option>");
                $("#payeeList_edit").append("<option>"+payeeList[i].payname+"</option>");
            }
        }else{
            alertDialog("收款人信息获取失败！");
        }
    }else{
        alertDialog("收款人信息获取失败！");
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

//准驾车型显示
function quasiDisplay(data){
    var value = "";
    for(var i in dictlist){
        if(data == dictlist[i].code){
            value = dictlist[i].value;
        }
    }
    return value;
}

//获取字典信息返回
function getDictDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            dictlist = res.dictlist;
            //给准驾车型赋值
            for(var i = 0;i<dictlist.length;i++){
                $("#quasi_driving").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
            }
            //司机表格
            DriverTable.init();
        }else{
            alertDialog("准驾车型信息获取失败！");
            //司机表格
            DriverTable.init();
        }
    }else{
        alertDialog("准驾车型信息获取失败！");
        //司机表格
        DriverTable.init();
    }
}