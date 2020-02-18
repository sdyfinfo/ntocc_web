/**
 * Created by haiyang on 2020/2/13.
 */

var billStateList,payStateList,goodsTypeList,unitList,verificationList,dictTrue = [];   //字典
var projectList,driverList,consignorList,consigneeList = [];
var wayBillList = [];
var goodsList = [];  //货物名称

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //fun_power();
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //获取项目信息
        projectDataGet();
        //运单操作和查看
        //WayBillEdit.init();
        //运单新增
        WayBillAdd.init();
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
            $("input[name='orderMaking_time']").datepicker("setDate",date);
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();

//运单表格
var WayBillTable = function () {
    var initTable = function () {
        var table = $('#bill_table');
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
                var start_subtime = "";
                var end_subtime = "";
                var loading_start_subtime ="";
                var loading_end_subtime = "";
                if(formData.start_subtime != ""){
                    start_subtime = formData.start_subtime.replace(/(\/)/g,'')+"000000";
                }
                if(formData.end_subtime != ""){
                    end_subtime = formData.end_subtime.replace(/(\/)/g,'')+"000000";
                }
                if(formData.loading_start_subtime != ""){
                    loading_start_subtime = formData.loading_start_subtime.replace(/(\/)/g,'')+"000000";
                }
                if(formData.loading_end_subtime != ""){
                    loading_end_subtime = formData.loading_end_subtime.replace(/(\/)/g,'')+"000000";
                }
                var lid = $("#lineList").val();
                var da = {
                    start_subtime:start_subtime,
                    end_subtime:end_subtime,
                    loading_start_subtime:loading_start_subtime,
                    loading_end_subtime:loading_end_subtime,
                    project_id:formData.project_id,
                    lid:lid,
                    consignor:formData.consignor,
                    platenumber:formData.platenumber,
                    driver_name:formData.driver_name,
                    state:formData.state,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                billDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "wid",visible: false },
                { "data": "project_name"},     //项目
                { "data": "linename" },    //线路
                { "data": "wid" },    //运单描述
                { "data": "name" },    //司机
                { "data": "plate_number"},     //车牌号
                { "data": "planTime"},
                { "data": "disburden_time"},
                { "data": "freight"},
                { "data": "addTime"},
                { "data": "state"},
                { "data": "verification_status"},
                { "data": "tips"},
                { "data": "state"}
            ],
            columnDefs: [
                {
                    "targets": [0],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1;  //行号
                    }
                },
                {
                    "targets": [1],
                    "render": function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },
                {
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        //显示运单号，发货到卸货地址
                        for(var i in wayBillList){
                            if(data == wayBillList[i].wid){
                                return '<a href="javascript:;" id="bill_detail">'+wayBillList[i].wabill_numbers+'<br>'+
                                    wayBillList[i].loading_place+'  到  '+wayBillList[i].unloading_place+'</a>';
                            }
                        }
                    }
                },
                {
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [10],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },
                {
                    "targets": [11],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        //运单状态
                        var value = "";
                        for(var i in billStateList){
                            if(data == billStateList[i].code){
                                value =  billStateList[i].value;
                            }
                        }
                        return value;
                    }
                },
                {
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        //审验状态
                        var value = "";
                        for(var i in verificationList){
                            if(data == verificationList[i].code){
                                value =  verificationList[i].value;
                            }
                        }
                        return value;
                    }
                },
                {
                    "targets": [15],
                    "render": function (data, type, row, meta) {
                        var edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        if(window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit") && data == "01"){
//                            edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        }else{
//                            edit = '-';
//                        }
                        return edit;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(11),td:eq(15)', nRow).attr('style', 'text-align: center;');
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
            var checklength = $("#bill_table").find(".checkboxes:checked").length;
            if(checklength == wayBillList.length){
                $("#bill_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#bill_table").find(".group-checkable").prop("checked",false);
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

//运单查询
$("#bill_inquiry").click(function(){
   WayBillTable.init();
});

//运单新增
var WayBillAdd = function() {
    var handleRegister = function() {
        var validator = $('.add-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                lineHave: {
                    required: true
                },
                orderMaking_time: {
                    required: true
                },
                project_id:{
                    required: true
                },
                consignor:{
                    required: true
                },
                consignee:{
                    required: true
                },
                loading_address:{
                    required: true,
                    address:true
                },
                unloading_address:{
                    required: true,
                    address:true
                },
                goods_type:{
                    required: true
                },
                goods:{
                    required: true
                },
                number:{
                    required: true
                },
                consignorTel:{
                    required: true
                },
                consigneeTel:{
                    required: true
                },
                unit:{
                    required: true
                },
                univalence:{
                    required: true
                },
                name:{
                    required: true
                },
                plate_number:{
                    required: true
                },
                load:{
                    required: true
                },
                freight:{
                    required: true
                },
                planTime:{
                    required: true
                }
            },

            messages: {
                lineHave: {
                    required: "有无线路信息必须选择"
                },
                orderMaking_time: {
                    required: "制单日期必须选择"
                },
                project_id:{
                    required: "项目必须输入"
                },
                consignor:{
                    required: "发货人必须输入"
                },
                consignee:{
                    required: "收货人必须输入"
                },
                loading_address:{
                    required: "发货地址必须输入"
                },
                unloading_address:{
                    required: "卸货地址必须输入"
                },
                goods_type:{
                    required: "请选择货物类型"
                },
                goods:{
                    required: "请选择货物名称"
                },
                number:{
                    required: "请输入总发运数量"
                },
                consignorTel:{
                    required: "请输入发货人电话"
                },
                consigneeTel:{
                    required: "请输入收货人电话"
                },
                unit:{
                    required: "请选择货运单位"
                },
                univalence:{
                    required: "请输入货物单价"
                },
                name:{
                    required: "请输入司机信息"
                },
                plate_number:{
                    required: "请输入车辆信息"
                },
                load:{
                    required: "请输入车辆载重"
                },
                freight:{
                    required: "请输入运费"
                },
                planTime:{
                    required: "请输入计划发车时间"
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
        }, "请正确填写您的手机号码");

        //省市区格式验证
        jQuery.validator.addMethod("address", function(value, element) {
            return this.optional(element) || (addressCheck(value));
        }, "请正确填写您的地址");

        //新增框项目联动线路
        $("#project_add").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<projectList.length;i++){
                list.push(projectList[i].proname);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
                $("#lineList_add").empty();
                $("#lineList_add").append("<option value=''>请选择</option>");
                $("#lineList_add").attr("readonly","readonly");
                if($("#lineHave").val() == "0"){
                    $(".line-display").find("input").val("");
                    $(".line-display").find("select").val("");
                    $("#goods").empty();
                }
            }
        });
        $("#project_add").change(function(e){
            var value = $(this).val();
            $("#lineList_add").empty();
            $("#lineList_add").append("<option value=''>请选择</option>");
            if($("#lineHave").val() == "0"){
                $(".line-display").find("input").val("");
            }
            if(value != ""){
                if($("#lineHave").val() == "0"){   //有线路信息则给线路赋值
                    var id = $("#proList_add").find("option[value='"+value+"']").attr("data-proid");
                    for(var i in projectList){
                        if(id == projectList[i].proid){
                            var linelist = projectList[i].linelist;
                            for(var j in linelist){
                                $("#lineList_add").append("<option value='"+linelist[j].lineid+"'>"+linelist[j].line+"</option>");
                            }
                        }
                    }
                    $("#lineList_add").removeAttr("readonly");
                }
            }else{
                $("#lineList_add").attr("readonly","readonly");
            }
        });

        //线路联动相关信息
        $("#lineList_add").change(function(){
            var value = $(this).val();
            if(value != ""){
                var data = {lid:value};
                lineDataGet(data);
            }else{
                $(".line-display").find("input").val("");
                $(".line-display").find("select").val("");
                $(".add-form").find("input[name=freight]").val("");
                $("#goods").empty();
            }
        });

        //司机信息联动车辆信息
        $("#driver_add").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<driverList.length;i++){
                list.push(driverList[i].name+driverList[i].id_number);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
                $("input[name=plate_number],input[name=vehicle_id],input[name=load],input[name=name],input[name=driver_id]").val("");
            }
        });
        $("#driver_add").change(function(e){
            var value = $(this).val();
            $("input[name=plate_number]").val("");
            $("input[name=load]").val("");
            if(value != ""){
                var id = $("#driverList").find("option[value='"+value+"']").attr("data-did");
                for(var i in driverList){
                    if(id == driverList[i].did){
                        $("input[name=name]").val(driverList[i].name);
                        $("input[name=driver_id]").val(driverList[i].did);
                        $("input[name=plate_number]").val(driverList[i].plate_number);
                        $("input[name=vehicle_id]").val(driverList[i].vehicle_id);
                    }
                }
                //请求车辆查询载重
                if($("input[name=plate_number]").val()!=""){
                    var data = {platenumber:$("input[name=plate_number]").val()};
                    vehiceDataGet(data);
                }
            }else{
                $("input[name=plate_number],input[name=vehicle_id],input[name=load],input[name=name],input[name=driver_id]").val("");
            }
        });

        //选择发货人或收货人显示联系方式
        $("#consignor").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<consignorList.length;i++){
                list.push(consignorList[i].consignor);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
                $("input[name=consignorTel]").val("");
            }
        });
        $("#consignor").change(function(){
            var value = $(this).val();
            var id = $("#consignorList").find("option[value='"+value+"']").attr("data-conid");
            if(id != ""){
                for(var i in consignorList){
                    if(id == consignorList[i].conid){
                        $("input[name=consignorTel]").val(consignorList[i].mobile);
                    }
                }
            }else{
                $("input[name=consignorTel]").val("");
            }
        });
        $("#consignee").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<consigneeList.length;i++){
                list.push(consigneeList[i].consignee);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
                $("input[name=consigneeTel]").val("");
            }
        });
        $("#consignee").change(function(){
            var value = $(this).val();
            var id = $("#consigneeList").find("option[value='"+value+"']").attr("data-conid");
            if(id != ""){
                for(var i in consigneeList){
                    if(id == consigneeList[i].conid){
                        $("input[name=consigneeTel]").val(consigneeList[i].mobile);
                    }
                }
            }else{
                $("input[name=consigneeTel]").val("");
            }
        });

        //货物单位联动
        $("#unit").change(function(){
            var value = $(this).val();
            if(value != ""){
                var text = $(this).find("option:selected").text();
                $("#unit_text").html(text);
            }else{
                $("#unit_text").html("吨");
            }
        });
        //货物名称回车键监听
        $("#goodsname").keypress(function (e) {
            if (e.which == 13) {
                //重复的不添加
                var value = $(this).val();
                for(var i in goodsList){
                    if(value == goodsList[i]){
                        alertDialog("货物名称不可重复");
                        return;
                    }
                }
                //将输入内容添加到右方div中
                goodsList.push(value);
                var div = "<div class='goods_div'><span>×</span>"+value+"</div>";
                $("#goods").append(div);
                $("#goodsname").val("");
            }
        });

        //点击删除货物名称
        $("#goods").on('click','.goods_div',function(){
            var value = $(this).text().replace('×','');
            var index = goodsList.indexOf(value);
            if (index > -1) {
                goodsList.splice(index, 1);
            }
            $(this).remove();
        });

        //货物单价和总发运数量联动运费
        $("input[name=number]").on("input propertychange",function(){
            $(this).val($(this).val().replace(/[^\d.]/g, ""));  //清除“数字”和“.”以外的字符
            $(this).val($(this).val().replace(/\.{2,}/g, ".")); //只保留第一个. 清除多余的
            $(this).val($(this).val().replace(".", "$#$").replace(/\./g, "").replace("$#$", "."));
            $(this).val($(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'));//只能输入两个小数
            if ($(this).val().indexOf(".") < 0 && $(this).val() != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
                $(this).val(parseFloat($(this).val()));
            }
            if($(this).val() != ""){
                var number = $(this).val();
                var univalence = $("input[name=univalence]").val();
                if(univalence!=""){
                    $("input[name=freight]").val(number*univalence);
                }
            }else{
                $("input[name=freight]").val("");
            }

        });
        $("input[name=univalence]").on("input propertychange",function(){
            $(this).val($(this).val().replace(/[^\d.]/g, ""));  //清除“数字”和“.”以外的字符
            $(this).val($(this).val().replace(/\.{2,}/g, ".")); //只保留第一个. 清除多余的
            $(this).val($(this).val().replace(".", "$#$").replace(/\./g, "").replace("$#$", "."));
            $(this).val($(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'));//只能输入两个小数
            if ($(this).val().indexOf(".") < 0 && $(this).val() != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
                $(this).val(parseFloat($(this).val()));
            }
            if($(this).val() != ""){
                var univalence = $(this).val();
                var number = $("input[name=number]").val();
                if(number!=""){
                    $("input[name=freight]").val(number*univalence);
                }
            }else{
                $("input[name=freight]").val("");
            }

        });

        //选择有无线路，显示相关信息
        $("#lineHave").change(function(){
            var value = $(this).val();
            switch (value){
                case "0":  //有
                    $("#line-display,#lineList_add").show();
                    $(".line-display").find("input").attr("readonly","readonly");
                    //总运发重量可修改
                    $("#goodsname,input[name=number]").removeAttr("readonly");
                    $(".line-display").find("select").attr("disabled", true);
                    validator.resetForm();
                    clearFormInfo();
                    break;
                case "1": //无
                    $("#line-display").show();
                    $(".line-display").find("input").removeAttr("readonly");
                    $("#lineList_add").hide();
                    $("input[name=consigneeTel],input[name=consignorTel]").attr("readonly","readonly");
                    $(".line-display").find("select").attr("disabled", false);
                    validator.resetForm();
                    clearFormInfo();
                    break;
                default:
                    $("#line-display").hide();
                    validator.resetForm();
                    clearFormInfo();
                    break;
            }
        });

        //点击确定按钮
        $('#add-btn').click(function() {
            btnDisable($('#add-btn'));
            if ($('.add-form').validate().form()) {
                if($("#lineHave").val() == "0"){
                    if($("#lineList_add").val() == ""){
                        alertDialog("线路信息必须选择!");
                        return;
                    }
                }
                if(goodsList.length == 0){
                    alertDialog("获取名称必须输入！");
                    return;
                }
                //货物重量不能大于车载重量
                if(Number($("input[name=number]").val()) > Number($("input[name=load]").val())){
                    alertDialog("总发运重量不能大于车载重量！");
                    return;
                }
                var bill = $('.add-form').getFormData();
                bill.orderMaking_time = $("input[name=orderMaking_time]").val().replace(/-/g,"");
                bill.project_id = $("#proList_add").find("option[value='"+bill.project_name+"']").attr("data-proid");
                bill.consignor_id = $("#consignorList").find("option[value='"+bill.consignor+"']").attr("data-conid");
                bill.consignee_id = $("#consigneeList").find("option[value='"+bill.consignee+"']").attr("data-conid");
                bill.linename = $("#lineList_add").find("option:selected").text();
                bill.goods_type = $("#goods_type").val();
                bill.unit = $("#unit").val();
                bill.goods = goodsList.toString();
                if($("input[name=edittype]").val() == BILLADD){
                    wayBillAdd(bill);
                }else{
                    bill.line_id = $("#lineList_add").val();
                    wayBillEdit(bill);
                }

            }
        });

        //查看运单
        $('#bill_table').on('click','#bill_detail',function(e){
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".add-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("查看运单");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var wid = $("#bill_table").dataTable().fnGetData(row).wid;
            var bill = new Object();
            for(var i=0; i < wayBillList.length; i++){
                if(wid == wayBillList[i].wid){
                    bill = wayBillList[i];
                }
            }
            if(bill.line_id != ""){  //有线路信息
                //根据项目找线路
                for(var i in projectList){
                    if(bill.project_id == projectList[i].proid){
                        var linelist = projectList[i].linelist;
                        for(var j in linelist){
                            $("#lineList_add").append("<option value='"+linelist[j].lineid+"'>"+linelist[j].line+"</option>");
                        }
                    }
                }

            }
            $("#goods").empty();
            var options = { jsonValue: bill, exclude:exclude,isDebug: false};
            $(".add-form").initForm(options);
            //显示货物名称
            goodsList = bill.goods.split(",");
            for(var i in goodsList){
                var div = "<div class='goods_check'><span>×</span>"+goodsList[i]+"</div>";
                $("#goods").append(div);
            }
            $("#driver_add").val(bill.name+bill.id_number);
            $("input[name=orderMaking_time]").datepicker("setDate",dateFormat(bill.orderMaking_time, "-"));
            $("input[name=planTime]").datepicker("setDate",dateFormat(bill.planTime, "-"));
            $('.add-form').find("input,textarea,select").attr("disabled", true);
            $("#lineInfo").hide();
            $("#line-display").show();
            $(".modal-footer").hide();
            $('#add_bill').modal('show');
        });

        //运单编辑
        $('#bill_table').on('click','#op_edit',function(e){
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".add-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑运单");
            $("#goods").empty();
            $('.add-form').find("input,textarea,select").attr("disabled", false);
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var wid = $("#bill_table").dataTable().fnGetData(row).wid;
            var state =  $("#bill_table").dataTable().fnGetData(row).state;
            if(state != "01"){
                alertDialog("只有新建的运单可编辑！");
                return;
            }
            var bill = new Object();
            for(var i=0; i < wayBillList.length; i++){
                if(wid == wayBillList[i].wid){
                    bill = wayBillList[i];
                }
            }
            if(bill.line_id != ""){  //有线路信息
                //根据项目找线路
                for(var i in projectList){
                    if(bill.project_id == projectList[i].proid){
                        var linelist = projectList[i].linelist;
                        for(var j in linelist){
                            $("#lineList_add").append("<option value='"+linelist[j].lineid+"'>"+linelist[j].line+"</option>");
                        }
                    }
                }
                $("#lineList_add").show();
            }else{  //隐藏线路输入框
                $("#lineList_add").hide();
            }
            var options = { jsonValue: bill, exclude:exclude,isDebug: false};
            $(".add-form").initForm(options);
            //显示货物名称
            goodsList = bill.goods.split(",");
            for(var i in goodsList){
                var div = "<div class='goods_div'><span>×</span>"+goodsList[i]+"</div>";
                $("#goods").append(div);
            }
            $("#driver_add").val(bill.name+bill.id_number);
            $("input[name=orderMaking_time]").datepicker("setDate",dateFormat(bill.orderMaking_time, "-"));
            $("input[name=planTime]").datepicker("setDate",dateFormat(bill.planTime, "-"));

            //根据是否有线路信息，判断哪些不可编辑
            if(bill.line_id != ""){   //有线路
                $("#lineHave").val("0");
                $("#lineList_add").show();
                $("#project_add").attr("readonly","readonly");
                $("#lineList_add,input[name=orderMaking_time]").attr("disabled",true);
                $(".line-display").find("input").attr("readonly","readonly");
                $(".line-display").find("select").attr("disabled", true);
                //总发运数量和货物名称可编辑
                $("#goodsname,input[name=number]").removeAttr("readonly");
            }else{
                $("#lineHave").val("1");
                $("#project_add,input[name=orderMaking_time],#goods_type").attr("disabled",true);
                $(".line-display").find("input").removeAttr("readonly");
                $("#lineList_add").hide();
                $("input[name=consigneeTel],input[name=consignorTel]").attr("readonly","readonly");
            }

            $("#lineInfo").hide();
            $("#line-display").show();
            $(".modal-footer").show();
            $("input[name=edittype]").val(BILLEDIT);
            $('#add_bill').modal('show');

        });

        //新增运单
        $('#op_add').click(function() {
            //清除校验错误信息
            clearFormInfo();
            $("#line-display").hide();
            validator.resetForm();
            $("#lineInfo").show();
            $("#lineHave").val("");
            $("#project_add").removeAttr("readonly");
            $('.add-form').find("input,textarea,select").attr("disabled", false);
            goodsList = [];
            $("input[name=edittype]").val(BILLADD);
            $(".modal-title").text("新增运单");
            $('#add_bill').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//查询框项目联动线路
$("#project_id").blur(function(){
    var value = $(this).val();
    var list = [];
    for(var i = 0;i<projectList.length;i++){
        list.push(projectList[i].proname);
    }
    if(list.indexOf(value) == -1){  //不存在
        $(this).val("");
        $("#lineList").empty();
        $("#lineList").append("<option value=''>请选择</option>");
        $("#lineList").attr("disabled",true);
    }
});
$("#project_id").change(function(e){
    var value = $(this).val();
    if(value != ""){
        var id = $("#proList").find("option[value='"+value+"']").attr("data-proid");
        for(var i in projectList){
            if(id == projectList[i].proid){
                var linelist = projectList[i].linelist;
                for(var j in linelist){
                    $("#lineList").append("<option value='"+linelist[j].lineid+"'>"+linelist[j].line+"</option>");
                }
            }
        }
        $("#lineList").attr("disabled",false);
    }else{
        $("#lineList").empty();
        $("#lineList").append("<option value=''>请选择</option>");
        $("#lineList").attr("disabled",true);
    }
});

//运单删除
var WayBillDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", WayBillDelete.deletePro)
        }
    });
    return{
        deletePro: function(){
            var bill = {waybillidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                //只有新建和装货中的运单可删除
                var state = $("#bill_table").dataTable().fnGetData(row).state;
                if(state == "01" || state == "02"){
                    bill.waybillidlist.push($("#bill_table").dataTable().fnGetData(row).wid);
                }else{
                    alertDialog("只有新建和装货中的运单可删除");
                    return;
                }
            });
            wayBillDelete(bill);
        }
    }
}();


//导入车辆
$("#bill_import").on("click",function(){
    $("#bill_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#bill_upload").modal('show');
});

//运单文件点击上传
$("#bill_file").change(function(){
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
        billUpload(formData);
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
            billUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};

//提交审验运单
var WayBillSubimt = function() {
    $('#bill_submit').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("您确定要提交审验吗？", WayBillSubimt.deletePro)
        }
    });
    return{
        deletePro: function(){
            var bill = {waybillidlist:[],verification_status:"01"};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                var state = $("#bill_table").dataTable().fnGetData(row).state;
                bill.waybillidlist.push($("#bill_table").dataTable().fnGetData(row).wid);
            });
            wayBillVerification(bill,'提交审验');
        }
    }
}();

//运单发车
var WayBillDepart = function() {
    $('#bill_depart').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("您确定要发车吗？", WayBillDepart.deletePro)
        }
    });
    return{
        deletePro: function(){
            var bill = {waybillidlist:[],state:"02","date":getNowDateTime()};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                //只有新建和装货中的运单可删除
                var verification_status = $("#bill_table").dataTable().fnGetData(row).verification_status;
                if(verification_status == "03"){
                    bill.waybillidlist.push($("#bill_table").dataTable().fnGetData(row).wid);
                }else{
                    alertDialog("只有通过审验的运单可发车");
                    throw new Error("breakForEach");
                    return;
                }
            });
            wayBillStateChange(bill,'发车');
        }
    }
}();

//运单完成
var WayBillDone = function() {
    $('#bill_done').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("您确定要完成运单吗？", WayBillDone.deletePro)
        }
    });
    return{
        deletePro: function(){
            var bill = {waybillidlist:[],state:"03","date":getNowDateTime()};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                //只有新建和装货中的运单可删除
                var state = $("#bill_table").dataTable().fnGetData(row).state;
                if(state == "02"){
                    bill.waybillidlist.push($("#bill_table").dataTable().fnGetData(row).wid);
                }else{
                    alertDialog("只有已发车的运单可完成");
                    throw new Error("breakForEach");
                    return;
                }
            });
            wayBillStateChange(bill,'完成');
        }
    }
}();

//运单操作返回结果
function billEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case BILLADD:
            text = "新增";
            break;
        case BILLDELETE:
            text = "删除";
            break;
        case BILLEDIT:
            text = "编辑";
            break;
        case BILLUPLOAD:
            text = "导入";
            break;
        default :
            text = type;
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            WayBillTable.init();
            $('#add_bill').modal('hide');
        }
    }
    if(alert == "") alert = text + "运单" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//运单查询返回结果
function getBillDataEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            wayBillList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, wayBillList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("运单信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("运单信息获取失败！");
    }
}

//项目查询结果返回
function getProjectDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            projectList = res.projectlist;
            for(var i in projectList){
                if(projectList[i].state == "0"){
                    $("#proList").append("<option data-proid='"+projectList[i].proid+"' value='"+projectList[i].proname+"'></option>");
                    $("#proList_add").append("<option data-proid='"+projectList[i].proid+"' value='"+projectList[i].proname+"'></option>");
                    $("#proList_add1").append("<option data-proid='"+projectList[i].proid+"' value='"+projectList[i].proname+"'></option>");
                }
            }
            //获取司机信息
            driverDataGet();
        }else{
            //获取司机信息
            driverDataGet();
        }
    }else{
        //获取司机信息
        driverDataGet();
    }
}

//线路信息返回
function getlineDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            var line = res.list[0];
            var exclude = [];
            var options = { jsonValue: line, exclude:exclude,isDebug: false};
            $(".add-form").find(".line-display").initForm(options);
            //显示货物名称
            goodsList = line.goods.split(",");
            for(var i in goodsList){
                var div = "<div class='goods_div'><span>×</span>"+goodsList[i]+"</div>";
                $("#goods").append(div);
            }
            //计算运费：单价x总发运数
            $(".add-form").find("input[name=freight]").val(line.univalence*line.number);
        }else{
            alertDialog("线路信息获取失败");
        }
    }else{
        alertDialog("线路信息获取失败");
    }
}

//司机信息结果返回
function getDriverDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            driverList = res.list;
            for(var i in driverList){
                var value = driverList[i].name+driverList[i].id_number;
                $("#driverList").append("<option data-did='"+driverList[i].did+"' value='"+value+"'></option>");
            }
            //获取发货人信息
            consignorDataGet();
        }else{
            //获取发货人信息
            consignorDataGet();
        }
    }else{
        //获取发货人信息
        consignorDataGet()
    }
}

//发货人信息货物结果
function getConsignorDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            consignorList = res.conlist;
            for(var i in consignorList){
                $("#consignorList").append("<option data-conid='"+consignorList[i].conid+"' value='"+consignorList[i].consignor+"'></option>");
            }
            //收货人信息获取
            consigneeidDateGet();
        }else{
            //收货人信息获取
            consigneeidDateGet();
        }
    }else{
        //收货人信息获取
        consigneeidDateGet();
    }
}

//收货人信息获取结果返回
function getconsigneeidDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            consigneeList = res.conlist;
            for(var i = 0; i < consigneeList.length; i++){
                $("#consigneeList").append("<option data-conid='"+consigneeList[i].conid+"' value='"+ consigneeList[i].consignee+"'></option>");
            }
            //获取字典相关信息
            var data = {};
            var list = ["10005","10006","10009","10010","10011"];
            for(var i in list){
                data.lx = list[i];
                dictQuery(data);
            }
        }else{
            //获取字典相关信息
            var data = {};
            var list = ["10005","10006","10009","10010","10011"];
            for(var i in list){
                data.lx = list[i];
                dictQuery(data);
            }
        }
    }else{
        //获取字典相关信息
        var data = {};
        var list = ["10005","10006","10009","10010","10011"];
        for(var i in list){
            data.lx = list[i];
            dictQuery(data);
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
                    case "10005":
                        goodsTypeList = dictlist;
                        $("#goods_type").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10006":
                        unitList = dictlist;
                        $("#unit").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10009":
                        payStateList = dictlist;
                        $("#conductor").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10010":
                        billStateList = dictlist;
                        $("#state").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10011":
                        verificationList = dictlist;
                        break;
                }
            }
            billInfoRequest();
        }else{
            dictTrue.push("0");
            billInfoRequest();
        }
    }else{
        dictTrue.push("0");
        billInfoRequest();
    }
}

//车辆查询结果返回
function getVehiceDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            $("input[name=load]").val(res.vehicleList[0].load);
        }else{
            alertDialog("车辆信息获取失败！");
        }
    }else{
        alertDialog("车辆信息获取失败！");
    }
}

//判断是否可以请求运单信息
function billInfoRequest(){
    if(dictTrue.length ==  5){
        //运单表格
        WayBillTable.init();
    }
}

//清除表单信息
function clearFormInfo(){
    $("#goods").empty();
    $(".modal-footer").show();
    $(".add-form").find(".has-error").removeClass("has-error");
    $(":input",".add-form").not(":button,:reset,:submit,:radio,#evaluationneed,[name=orderMaking_time],[name=edittype],#lineHave").val("")
        .removeAttr("checked")
        .removeAttr("selected");
}