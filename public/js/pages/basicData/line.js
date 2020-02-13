/**
 * Created by Lenovo on 2020/2/7.
 */

var lineList = [];
var projectList,dictList,consigneeList,consignorList,goodsTypeList,unitList = [];
var goodsList = [];   //货物名称列表
var dictTrue = [];   //获取字典结果
if(App.isAngularJsApp() == false){
    jQuery(document).ready(function(){
        //省市区三级联动
        addressDispaly("#loading_provincecode");
        addressDispaly("#unloading_provincecode");
        //线路表操作
        LineEdit.init();
        //项目名称获取
        projectDataGet();
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
                    project_id: formData.projec_tname,
                    linename: formData.linename,
                    loading_place:formData.loading_place,
                    unloading_place:formData.unloading_place,
                    goods:formData.goods,
                    state:formData.state,
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
                {"data":"loading_place"},
                {"data":"unloading_place"},
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
                    "targets":[9],
                    "render":function (data, type, row, meta) {
                        //显示货物类型
                        return typeDisplay(data);
                    }
                },{
                    "targets":[11],
                    "render":function (data, type, row, meta) {
                        //显示单位
                        return unitDisplay(data);
                    }
                },
                {
                    "targets":[13],
                    "render":function (data, type, row, meta) {
                        return statusFormat(data);
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

//线路操作表
var LineEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                project_id: {
                    required: true
                },
                loading_countycode:{
                    required: true
                },
                unloading_countycode:{
                    required: true
                },
                loading_name:{
                    required: true
                },
                unloading_name:{
                    required: true
                },
                consignorid:{
                    required: true
                },
                consigneeid:{
                    required: true
                },
                contacts:{
                    required: true
                },
                phone:{
                    required: true,
                    phone:true
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
                },
                unit:{
                    required: true
                },
                univalence:{
                    required: true
                },
                loading_address:{
                    required: true
                },
                unloading_address:{
                    required: true
                }

            },

            messages: {
                project_id: {
                    required: "请输入项目名称"
                },
                loading_countycode:{
                    required: "请选择完整装货地地址"
                },
                unloading_countycode:{
                    required: "请选择完整卸货地地址"
                },
                loading_name:{
                    required: "请选择装货名称"
                },
                unloading_name:{
                    required: "请选择卸货名称"
                },
                consignorid:{
                    required: "请选择发货人"
                },
                consigneeid:{
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
                },
                unit:{
                    required: "请选择货运单位"
                },
                univalence:{
                    required: "请输入货物单价"
                },
                loading_address:{
                    required: "请输入发货详细地址"
                },
                unloading_address:{
                    required: "请输入卸货详细地址"
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

        //选择发货人或收货人显示联系方式
        $("#consignor").change(function(){
            var id = $(this).val();
            for(var i in consignorList){
                if(id == consignorList[i].conid){
                    $("input[name=consignorTel]").val(consignorList[i].mobile);
                }
            }
        });
        $("#consignee").change(function(){
            var id = $(this).val();
            for(var i in consigneeList){
                if(id == consigneeList[i].conid){
                    $("input[name=consigneeTel]").val(consigneeList[i].mobile);
                }
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

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                if(goodsList.length == 0){
                    alertDialog("货物名称必须输入！");
                    return;
                }
                var line = $('.register-form').getFormData();
                //装货省市区
                line.loading_province = $("#loading_provincecode").find("option:selected").text();
                line.loading_city = $("#loading_citycode").find("option:selected").text();
                line.loading_county = $("#loading_countycode").find("option:selected").text();
                //卸货省市区
                line.unloading_province = $("#unloading_provincecode").find("option:selected").text();
                line.unloading_city = $("#unloading_citycode").find("option:selected").text();
                line.unloading_county = $("#unloading_countycode").find("option:selected").text();
                //收货人，发货人
                line.goods_type = "10005,"+line.goods_type;
                line.unit = "10006,"+line.unit;
                line.goods = goodsList.toString();
                if($("input[name=edittype]").val() == LINEADD){
                    lineAdd(line);
                }else {
                    lineEdit(line);
                }
            }
        });
        //新增线路
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增线路");
            $(":input",".register-form").not(":button,:reset,:submit,:radio,:input[name=birthday],#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("input[name=edittype]").val(LINEADD);
            fileUploadAllowed(1);
            $('#edit_lin').modal('show');
        });
        //查看
        $('#line_table').on('click', '#vehice_detail', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("查看线路");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var lid = $("#line_table").dataTable().fnGetData(row).lid;
            var line = new Object();
            for(var i=0; i < lineList.length; i++){
                if(lid == lineList[i].lid){
                    line = lineList[i];
                }
            }
            //省市区显示
            areaNameDisplay(line);
            var options = { jsonValue: line, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            //显示货物名称
            goodsList = line.goods.split(",");
            for(var i in goodsList){
                var div = "<div class='goods_div'><span>×</span>"+goodsList[i]+"</div>";
                $("#goods").append(div);
            }
            //项目名称赋值
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
            $(".modal-title").text("编辑线路");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var lid = $("#line_table").dataTable().fnGetData(row).lid;
            var line = new Object();
            for(var i=0; i < lineList.length; i++){
                if(lid == lineList[i].lid){
                    line = lineList[i];
                }
            }
            //省市区显示
            areaNameDisplay(line);
            var options = { jsonValue: line, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            //显示货物名称
            goodsList = line.goods.split(",");
            for(var i in goodsList){
                var div = "<div class='goods_div'><span>×</span>"+goodsList[i]+"</div>";
                $("#goods").append(div);
            }
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

//线路状态更改
var StatusChange = function(){
    var line = {};
    $("#line_table").on('click','#statusChange',function(){
        //获取id和status
        var row = $(this).parents('tr')[0];
        var lid = $("#line_table").dataTable().fnGetData(row).lid;
        line.lid = lid;
        line.state = $(this).data('status');
        line.userid = loginSucc.userid;
        //先提示
        confirmDialog("您确定要更改该线路状态吗？", StatusChange.changeStatus);
    });
    return{
        changeStatus: function(){
            lineState(line);
        }
    }
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
            goodsList = [];
            $("#goods").empty();
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
                var row = $(this).parents('tr')[0];
                linelist.lineidlist.push($("#line_table").dataTable().fnGetData(row).lid);
            });
            lineDelete(linelist);
        }
    }
}();

//项目查询返回结果
function getProjectDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {

            var res = result.response;
            projectList = res.projectlist;
            for(var i = 0; i < projectList.length; i++){
                $("#project_name").append("<option value='"+projectList[i].proid+"'>"+ projectList[i].proname +"</option>");
                $("#projectname").append("<option value='"+projectList[i].proid+"'>"+ projectList[i].proname +"</option>");
            }
            //发货人信息获取
            consignorDataGet();
        }else{
            alertDialog("项目名称获取失败！");
            //发货人信息获取
            consignorDataGet();
        }
    }else{
        alertDialog("项目名称获取失败！");
        //发货人信息获取
        consignorDataGet();
    }
}

//发货人
function getConsignorDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            consignorList = res.conlist;
            for(var i = 0; i < consignorList.length; i++){
                $("#consignor").append("<option value='"+consignorList[i].conid+"'>"+ consignorList[i].consignor +"</option>");
            }
            //收货人信息获取
            consigneeidDateGet();
        }else{
            alertDialog("发货人名称获取失败！");
            //收货人信息获取
            consigneeidDateGet();
        }
    }else{
        alertDialog("发货人名称获取失败！");
        //收货人信息获取
        consigneeidDateGet();
    }
}


//收货人
function getconsigneeidDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            consigneeList = res.conlist;
            for(var i = 0; i < consigneeList.length; i++){
                $("#consignee").append("<option value='"+consigneeList[i].conid+"'>"+ consigneeList[i].consignee +"</option>");
            }
            //货物类型获取
            var list = ["10005","10006"];
            for(var i in list){
                var data = {lx:list[i]};
                dictQuery(data);
            }
        }else{
            //货物类型获取
            var list = ["10005","10006"];
            for(var i in list){
                var data = {lx:list[i]};
                dictQuery(data);
            }
            alertDialog("收货人名称获取失败！");
        }
    }else{
        //货物类型获取
        var list = ["10005","10006"];
        for(var i in list){
            var data = {lx:list[i]};
            dictQuery(data);
        }
        alertDialog("收货人名称获取失败！");
    }
}

//字典获取
function getDictDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            dictList = res.dictlist;
            dictTrue.push("1");
            for(var i = 0; i < dictList.length; i++){
                switch (dictList[i].lx){
                    case "10005":
                        goodsTypeList = dictList;
                        $("#goods_type").append("<option value='"+dictList[i].code+"'>"+ dictList[i].value +"</option>");
                        break;
                    case "10006":
                        unitList = dictList;
                        $("#unit").append("<option value='"+dictList[i].code+"'>"+ dictList[i].value +"</option>");
                        break;
                }
            }
            LineInfoRequest();
        }else{
            dictTrue.push("0");
            alertDialog("获取字典信息获取失败！");
            LineInfoRequest();
        }
    }else{
        dictTrue.push("0");
        alertDialog("获取字典信息获取失败！");
        LineInfoRequest();
    }
}

function fileUploadAllowed(id){
    if(id == 0){ //不允许
        //全部只读
        $(".register-form").find("select").attr("disabled", true);
        $(".register-form").find("input").attr("disabled", true);
        $("#goods").attr("disabled", true);
    }else{
        $(".register-form").find("select").attr("disabled", false);
        $(".register-form").find("input").attr("disabled", false);
        $("#goods").attr("disabled", false);
    }
}

//获取线路信息
function LineInfoRequest(){
    if(dictTrue.length ==  2){
        //线路列表
        LineTable.init();
    }
}

//显示货物类型
function typeDisplay(data){
    var value = "";
    for(var i in goodsTypeList){
        if(data == goodsTypeList[i].code){
            value =  goodsTypeList[i].value;
        }
    }
    return value;
}

//显示单位
function unitDisplay(data){
    var value = "";
    for(var i in unitList){
        if(data == unitList[i].code){
            value =  unitList[i].value;
        }
    }
    return value;
}

//省市区显示
function areaNameDisplay(data){
    //装货
    for(var i in areaCode){
        if(data.loading_provincecode == areaCode[i].code){
            var city = areaCode[i].city;
            for(var j in city){
                $("#loading_citycode").append('<option value="'+city[j].code+'">'+city[j].name+'</option>');
            }
            //显示县
            loadCountyNameDisplay(city,data.loading_citycode);
        }
    }
    //卸货
    for(var i in areaCode){
        if(data.unloading_provincecode == areaCode[i].code){
            var city = areaCode[i].city;
            for(var j in city){
                $("#unloading_citycode").append('<option value="'+city[j].code+'">'+city[j].name+'</option>');
            }
            //显示县
            unloadCountyNameDisplay(city,data.unloading_citycode);
        }
    }
}
function loadCountyNameDisplay(city,code){
    for(var i in city){
        if(code == city[i].code){
            var county = city[i].county;
            for(var j in county){
                $("#loading_countycode").append('<option value="'+county[j].code+'">'+county[j].name+'</option>');
            }
        }
    }
}
function unloadCountyNameDisplay(city,code){
    for(var i in city){
        if(code == city[i].code){
            var county = city[i].county;
            for(var j in county){
                $("#unloading_countycode").append('<option value="'+county[j].code+'">'+county[j].name+'</option>');
            }
        }
    }
}