/**
 * Created by Administrator on 2020/2/10 0010.
 */

var driverList = [];
var vehicleList = [];
var payeeList = [];
var dictlist = [];
var imgInit = "/public/img/img_upload.png";
var payeeMenuId = "";
var getData = false;
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //获取收款人菜单id，点击收款人一栏能用到
        payeeMenuIdGet();
        //获取车辆信息
        vehiceDataGet();
        //获取字典信息
        var data = {"lx":"10007"};
        dictQuery(data);
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
            $("input[name='driving_license_starttime']").datepicker("setDate","");
            $("input[name='driving_license_endtime']").datepicker("setDate","");
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
        $(".group-checkable").prop("checked", false);
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
                var payid = $("#payeeList").find("option[value='"+formData.payeename+"']").attr('data-payid') || "";
                var payee_name = "";
                for(var i in payeeList){
                    if(payid == payeeList[i].payid){
                        payee_name = payeeList[i].payname;
                    }
                }
                var vehicle_id = "";
                for(var i in vehicleList){
                    if(formData.platenumber == vehicleList[i].platenumber){
                        vehicle_id = vehicleList[i].vehid;
                    }
                }
                var da = {
                    name: formData.name,
                    id_number:formData.id_number,
                    vehicle_id:vehicle_id,
                    payid:payid,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                driverDataGet(da, callback);
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
                { "data": "did"},
                { "data": "driving_license"},
                { "data": "did"},
                { "data": "plate_number"},
                { "data": null},
                { "data": "state"},
                { "data": "updateTime"},
                { "data": "bank",visible: false}
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
                    "targets": [14],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        for(var i in driverList){
                            if(data == driverList[i].did){
                                var id_front = "<span>正面</span>"
                                var id_back = "<span>反面</span>";
                                if(driverList[i].id_front != ""){
                                    id_front = '<a href="javascript:;" class="imgCheck">正面<span hidden="hidden">'+driverList[i].id_front+'</span></a>';
                                }
                                if(driverList[i].id_back != ""){
                                    id_back =  '<a href="javascript:;" class="imgCheck">反面<span hidden="hidden">'+driverList[i].id_back+'</span></a>';
                                }
                                return id_front+'<span>|</span>'+id_back;
                            }
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
                        for(var i in driverList){
                            if(data == driverList[i].did){
                                var href = 'payee?username='+loginSucc.userid+"&payname="+encodeURI(driverList[i].payee_name)+"&banknumber="+driverList[i].bank;
                                var target = 'iframe'+payeeMenuId;
                                return "<a href='"+href+"' class='payeeClick' data-index='"+payeeMenuId+"' data-text='收款人管理' target='"+target+"'>"+driverList[i].payee_name+"</a>";
                            }
                        }

                    }
                },{
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        return statusFormat(data);
                    }
                },
                {
                    "targets": [12],
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
                $('td:eq(0),td:eq(1),td:eq(3),td:eq(4),td:eq(5),td:eq(7),td:eq(8),td:eq(10),td:eq(11),td:eq(12),td:eq(13)', nRow).attr('style', 'text-align: center;');
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
            //判断是否全选
            var checklength = $("#driver_table").find(".checkboxes:checked").length;
            if(checklength == driverList.length){
                $("#driver_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#driver_table").find(".group-checkable").prop("checked",false);
            }
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

$("#driver_table").on('click',".payeeClick",function(){
    menuItem("",this);
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
                //qualification:{
                //    required: true
                //},
                phone:{
                    required: true,
                    phone:true
                },
                id_front:{
                    required: true
                },
                id_back:{
                    required: true
                },
                driving_license: {
                    required: true
                },
                driving_license_starttime:{
                    required: true
                },
                driving_license_endtime:{
                    required: true
                }
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
                //qualification:{
                //    required: "从业资格证号必须输入"
                //},
                phone:{
                    required: "手机号必须输入"
                },
                id_front:{
                    required: "身份证正面照必须上传"
                },
                id_back:{
                    required: "身份证反面照必须上传"
                },
                driving_license: {
                    required: "行驶证必须上传"
                },
                driving_license_starttime:{
                    required: "驾驶证有效日期(起始)必须选择"
                },
                driving_license_endtime:{
                    required: "驾驶证有效日期(终止)必须选择"
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
                list.push(payeeList[i].payname+payeeList[i].payphone);
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
                driver.payid = $("#payeeList_edit").find("option[value='"+driver.payee_name+"']").attr('data-payid') || "";
                for(var i in payeeList){
                    if(driver.payid == payeeList[i].payid){
                        driver.payee_name = payeeList[i].payname;
                    }
                }
                delete driver.id_front;
                delete driver.id_back;
                delete driver.driving_license;
                delete driver.qualification_img;
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
                    $("#loading_edit").modal("show");
                    driverAdd(formData);
                }else{
                    $("#loading_edit").modal("show");
                    driverEdit(formData);
                }
            }
        });
        //查看司机信息
        $('#driver_table').on('click', '#driver_detail', function (e) {
            var that = this;
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $("#edit_driver").find(".modal-title").text("查看司机");
            //获取车辆收款人信息
            getData = false;
            var Timer;
            vehiceDataGet();
            Timer = setInterval(
                function(){
                    if(getData){
                        clearInterval(Timer);
                        var exclude = [];
                        var row = $(that).parents('tr')[0];
                        var did = $("#driver_table").dataTable().fnGetData(row).did;
                        var driver = new Object();
                        for(var i=0; i < driverList.length; i++){
                            if(did == driverList[i].did){
                                driver = driverList[i];
                            }
                        }
                        for(var i in payeeList){
                            if(driver.payid == payeeList[i].payid){
                                driver.payee_name = payeeList[i].payname+payeeList[i].payphone;
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
                        //显示所属机构
                        $("input[name=organname]").parents(".row").show();
                        $(".modal-footer").hide();
                        $('#edit_driver').modal('show');
                    }
                },500
            );
        });
        //编辑司机信息
        $('#driver_table').on('click', '#op_edit', function (e) {
            var that = this;
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $("#edit_driver").find(".modal-title").text("编辑司机");
            //获取车辆收款人信息
            getData = false;
            var Timer;
            vehiceDataGet();
            Timer = setInterval(
                function(){
                    if(getData){
                        clearInterval(Timer);
                        var exclude = [];
                        var row = $(that).parents('tr')[0];
                        var did = $("#driver_table").dataTable().fnGetData(row).did;
                        var driver = new Object();
                        for(var i=0; i < driverList.length; i++){
                            if(did == driverList[i].did){
                                driver = driverList[i];
                            }
                        }
                        for(var i in payeeList){
                            if(driver.payid == payeeList[i].payid){
                                driver.payee_name = payeeList[i].payname+payeeList[i].payphone;
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
                        $(".edit-form").find("input[name=name]").attr("readonly","readonly");
                        $(".edit-form").find("input[name=id_number]").attr("readonly","readonly");
                        //不显示所属机构
                        $("input[name=organname]").parents(".row").hide();
                        $("input[name=edittype]").val(VEHICEEDIT);
                        $(".modal-footer").show();
                        $('#edit_driver').modal('show');
                    }
                }
            );
        });
        //新增司机
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $("#edit_driver").find(".modal-title").text("新增司机");
            $(":input",".edit-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            ComponentsDateTimePickers.init();
            //获取车辆收款人信息
            vehiceDataGet();
            //清空文件
            clearFile();
            //是否允许上传图片
            fileUploadAllowed(1);
            $(".edit-form").find("input[name=name]").removeAttr("readonly");
            $(".edit-form").find("input[name=id_number]").removeAttr("readonly");
            //不显示所属机构
            $("input[name=organname]").parents(".row").hide();
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
//    $("#driver_table").find(".modal-title").text("图片查看");
//    $("#img_check").modal('show');
    $("#img_check img").trigger('click');
});

$("#img_check img").viewer({
    navbar: false,
    button: true,
    toolbar: true,
    title: false
});

//司机状态显示
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
        case "1":  //停用
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

//司机状态更改
var StatusChange = function(){
    var driver = {};
    $("#driver_table").on('click','#statusChange',function(){
        //获取id和status
        var row = $(this).parents('tr')[0];
        var did = $("#driver_table").dataTable().fnGetData(row).did;
        driver.did = did;
        driver.state = $(this).data('status');
        //先提示
        confirmDialog("您确定要更改该司机状态吗？", StatusChange.changeStatus);
    });
    return{
        changeStatus: function(){
            $("#loading_edit").modal("show");
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
            $("#loading_edit").modal("show");
            driverDelete(driver);
        }
    }
}();


//导入司机
$("#driver_import").on("click",function(){
    $("#driver_file").value = "";
    $("#upload_name").hide();
    $("#driver_upload").modal('show');
});

//司机文件点击上传
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
        $("#loading_edit").modal("show");
        driverUpload(formData);
    }else{
        $("#upload_name").html("");
    }
});

//司机文件拖拽上传
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
            $("#loading_edit").modal("show");
            driverUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};

//导入司机证照
$("#driverImg_import").on("click",function(){
    $("#driverImg_file").value = "";
    $("#driverImg_upload").modal('show');
});

//司机证照点击上传
$("#driverImg_file").change(function(){
    var filelist = this.files;
    if(filelist.length!=0){
        if(filelist.length > 200){
            alertDialog("单次最多可选200张图片！");
            $("#driverImg_file").value = "";
            return;
        }
        var formData = new FormData();
        for(var i = 0; i < filelist.length;i++){
            //判断图片文件命名格式
            if(!imgNameCheck(this.files[i].name)){
                alertDialog("图片文件命名格式不正确！"+this.files[i].name);
                $("#driverImg_file").value = "";
                return false;
            }
            if((Number(this.files[i].size)/1024/1024)>20){
                alertDialog("单张照片大小不可超过20M！"+this.files[i].name);
                $("#driverImg_file").value = "";
                return false;
            }
            formData.append("files",this.files[i]);
        }
        var userid = {
            "userid":loginSucc.userid,
            "organid":loginSucc.organid
        }
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        $("#loading_edit").modal('show');
        driverImgUpload(formData);
        $("#driverImg_file").value = "";
    }else{
        $("#driverImg_file").value = "";
    }
});

//司机证照拖拽上传
function allowDrop(ev) {
    //阻止浏览器默认打开文件的操作
    ev.preventDefault();
};
function imgDrop(ev) {
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    var len = files.length;
    if(len!=0){
        if(len > 200){
            alertDialog("单次最多可选200张图片！");
            return;
        }
        var formData = new FormData();
        for(var i = 0;i<len;i++){
            var filesName=files[i].name;
            var extStart=filesName.lastIndexOf(".");
            var ext=filesName.substring(extStart,filesName.length).toUpperCase();
            if(ext ==".jpg" || ext ==".JPG" || ext ==".png" || ext ==".PNG" || ext ==".gif" || ext ==".GIF"){ //判断是否是需要的问件类型
                //判断图片文件命名格式
                if(!imgNameCheck(filesName)){
                    alertDialog("图片文件命名格式不正确！"+filesName);
                    return false;
                }
                if((Number(files[i].size)/1024/1024)>20){
                    alertDialog("单张照片大小不可超过20M！"+files[i].name);
                    return false;
                }
                formData.append("files",files[i]);
            }else{
                alertDialog("请选择.jpg .png .gif类型的文件上传！"+filesName);
                return false;
            }
        }
        var userid = {
            "userid":loginSucc.userid,
            "organid":loginSucc.organid
        };
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        $("#loading_edit").modal('show');
        console.log("files:"+formData.getAll('files'));
        driverImgUpload(formData);
    }
};

//司机操作结果返回
function driverEditEnd(flg, result, type){
    $("#loading_edit").modal("hide");
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
        case DRIVERIMGUPLOAD:
            text = "证照导入";
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
        }else if(type == DRIVERIMGUPLOAD){
            alert ="司机"+ text + res + "！";
        }
        else{
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
            $("#vehiceList,#vehiceList_edit").empty();
            //给关联车辆datalist赋值
            for(var i = 0;i<vehicleList.length;i++){
                $("#vehiceList").append("<option>"+vehicleList[i].platenumber+"</option>");
                $("#vehiceList_edit").append("<option>"+vehicleList[i].platenumber+"</option>");
            }
            //获取收款人信息
            payeeDataGet();
        }else{
            //获取收款人信息
            payeeDataGet();
        }
    }else{
        //获取收款人信息
        payeeDataGet();
    }
}

//收款人信息返回
function getPayeeDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            payeeList = res.payeelist;
            $("#payeeList,#payeeList_edit").empty();
            //给关联车辆datalist赋值
            for(var i = 0;i<payeeList.length;i++){
                if(payeeList[i].state == "0"){  //启用
                    $("#payeeList").append("<option data-payid='"+payeeList[i].payid+"' value='"+payeeList[i].payname+payeeList[i].payphone+"'></option>");
                    $("#payeeList_edit").append("<option data-payid='"+payeeList[i].payid+"' value='"+payeeList[i].payname+payeeList[i].payphone+"'></option>");
                }
            }
            getData = true;
        }else{
            getData = true;
        }
    }else{
        getData = true;
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
            //司机表格
            DriverTable.init();
        }
    }else{
        //司机表格
        DriverTable.init();
    }
}

//获取收款人菜单id，点击收款人一栏能用到
function payeeMenuIdGet(){
    var menuList = loginSucc.menulist;
    for(var i in menuList){
        if(menuList[i].url == "basicdata"){  //找到其父菜单：基础管理信息
            var menulist = menuList[i].menulist;
            for(var j in menulist){
                if(menulist[j].url == "payee"){  //找到收款人菜单
                    payeeMenuId = menulist[j].menuid;
                }
            }
        }
    }
}

//判断司机证照文件命名格式
function imgNameCheck(name){
    //先判断有没有-
    if(name.indexOf('-') == -1){
        return false;
    }
    var namelist = name.split("-");
    //判断身份证格式
    var plate = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
    if(!(plate.test(namelist[0]))){
        return false;
    }
    //判断-后只能是不大于4的数字
    var num=/^([1-4]|4)$/;
    var index = namelist[1].lastIndexOf('.');
    var number = namelist[1].substring(0,index);
    if(!(num.test(number))){
        return false;
    }
    return true;
}