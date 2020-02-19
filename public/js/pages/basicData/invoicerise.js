/**
 * Created by Lenovo on 2020/2/17.
 */

var invocerList = [];
var addressidList = [];
var invlist = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function () {
        //fun_power();
        //��ȡҳ����Ϣ
        invocreTable.init();
        invEdit.init();
        //��ȡ�ʼĵ�ַ
        addressDataGet();

    })
}

var invocreTable = function () {
    var initTable = function () {
        var table = $('#inv_table');
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
                    rise_name: formData.rise_name,
                    invid: formData.invid,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                invoDataGet(da, callback);
            },
            columns: [//���ص�json������������䣬ע��һ��Ҫ�������<th>������Ӧ�������Ű����Ť��
                {"data":null},
                {"data":null},
                { "data": "invid",visible: false},
                { "data": "invids "},//̧ͷ����
                { "data": "invid"},//��Ʊ�ʼ���Ϣ
                { "data": "invid"},//��Ʊ���
                { "data": "invid"} //����ʱ��
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
                        return meta.settings._iDisplayStart + meta.row + 1;  //�к�
                    }
                },
                {
                    "targets":[3],
                    "render": function (data, type, row ,meta) {
                        //��ʾ��Ʊ̧ͷ
                        for(var i in invocerList){
                            if(data == invocerList[i].invids){
                                return "<b>"+"̧ͷ����:     "+"</b>"+invocerList[i].rise_name +"<br>"+"<b>"+"��˰��ʶ���:     "+"</b>"+ invocerList[i].taxpayer +"<br>"+"<b>"+"��ַ/�绰:     "+"</b>"+invocerList[i].address_phone +"<br>"+"<b>"+"�����м��˺�:     "+"</b>"+ invocerList[i].bank_name + "<br>" +"<a href='javascript:;' id='invoice'>"+"�޸�̧ͷ��Ϣ"+"</a>";
                            }
                        }
                    }
                },
                {
                    "targets":[4],
                    "render": function (data, type, row ,meta) {
                        //�ʼĵ�ַ
                        for(var i in invocerList) {
                            if (data == invocerList[i].invid) {
                                return "<b>"+"�ʼĵ�ַ:     "+"</b>"+invocerList[i].address +"<br>"+"<b>"+"�ռ���:     "+"</b>"+ invocerList[i].addressee +"<br>"+"<b>"+"�绰:     "+"</b>"+ invocerList[i].addresseeTel +"<br>"+"<b>"+"����:     "+"</b>"+ invocerList[i].email + "<br>" +"<a href='javascript:;' id='mail'>"+"�����ʼĵ�ַ"+"</a>";
                            }
                        }
                    }
                },
                {
                    "targets":[5],
                    "render": function (data, type, row ,meta) {
                        //��Ʊ���
                        for(var i in invocerList) {
                            if (data == invocerList[i].invid) {
                                return formatCurrency(invocerList[i].invoice_amount);
                            }
                        }
                    }
                },
                {
                    "targets":[6],
                    "render": function (data, type, row ,meta) {
                        //����ʱ��
                        for(var i in invocerList) {
                            if (data == invocerList[i].invid) {
                                return dateTimeFormat(invocerList[i].updatetime);
                            }
                        }
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1)',nRow).attr('style','text-align:center');
                $('td:eq(2),td:eq(3)', nRow).attr('style', 'text-align: left;');
                $('td:eq(4)',nRow).attr('style','text-align:right');
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
            //�ж��Ƿ�ȫѡ
            var checklength = $("#inv_table").find(".checkboxes:checked").length;
            if(checklength == invocerList.length){
                $("#inv_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#inv_table").find(".group-checkable").prop("checked",false);
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


var invEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                address_phone:{
                    required: true
                },
                bank_name:{
                    required: true
                },
                bank:{
                    required: true
                }

            },

            messages: {
                address_phone:{
                    required: "�������ַ�绰"
                },
                bank_name:{
                    required: "�����뿪����"
                },
                bank:{
                    required: "���������п���"
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
        // �ֻ�������֤
        jQuery.validator.addMethod("email", function(value, element) {
            var tel = /^\w+@[a-z0-9]+\.[a-z]+$/i;
            return this.optional(element) || (tel.test(value));
        }, "����ȷ��д��������");

        jQuery.validator.addMethod("bank", function(value, element) {
            var reg = /^([1-9]{1})(\d{14}|\d{18})$/;
            return this.optional(element) || (reg.test(value));
        }, "����ȷ��д�������п���");

        //ѡ���ʼĵ�ַ����ʾ�ռ��ˡ��绰������
        $("#addrid").change(function(){
            var id = $(this).val();
            for(var i in addressidList){
                if(id == addressidList[i].aid){
                    $("input[name=addressee]").val(addressidList[i].addressee);
                    $("input[name=addresseeTel]").val(addressidList[i].addresseeTel);
                    $("input[name=email]").val(addressidList[i].email);
                }
            }
        });
        //ѡ�񷢻��˻򷢻�����ʾ
        $("#addrid").change(function(){
            var id = $(this).val();
            for(var i in addressidList){
                if(id == addressidList[i].aid){
                    $("input[name=address]").val(addressidList[i].ress);
                }
            }
        });

        //���ȷ����ť
        $('#register-update').click(function() {
            btnDisable($('#register-update'));
            if ($('.register-form').validate().form()) {
                var inv = $('.register-form').getFormData();
                var data;
                for(var i = 0; i < invocerList.length; i++) {
                    if(inv.invid == invocerList[i].invid){
                        data = invocerList[i];
                    }
                }
                $("#loading_edit").modal("show");
                invoReplaceEdit(inv);
            }
        });
        //�޸�̧ͷ��Ϣ
        $('#inv_table').on('click', '#invoice', function (e) {
            e.preventDefault();
            //���У�������Ϣ
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("�༭��Ʊ̧ͷ");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var invid = $("#inv_table").dataTable().fnGetData(row).invid;
            var inv = new Object();
            for(var i=0; i < invocerList.length; i++){
                if(invid == invocerList[i].invid){
                    inv = invocerList[i];
                }
            }
            var options = { jsonValue: inv, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(INVREPLACE);
            $('#edit_update').modal('show');
        });
        //���ȷ����ť
        $('#register-replace').click(function() {
            btnDisable($('#register-replace'));
            if ($('.register-form').validate().form()) {
                var inv = $('.register-form').getFormData();
                inv.addrid = $("input[name=addrid]").val();
                inv.address = $("#address").find("option:selected").text();
                var data;
                for(var i = 0; i < invocerList.length; i++) {
                    if(inv.invid == invocerList[i].invid){
                        data = invocerList[i];
                    }
                }
                for (var j = 0; j < invocerList.length; j++) {
                    if (inv.address == invocerList[j].addrid){
                        inv.addrid = invocerList[j].addrid;
                    }
                }
                $("#loading_edit").modal("show");
                invoReplaceEdit(inv);
            }
        });
        //�����ʼĵ�ַ
        $('#inv_table').on('click', '#mail', function (e) {
            e.preventDefault();
            //���У�������Ϣ
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("ѡ���ַ");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var invid = $("#inv_table").dataTable().fnGetData(row).invid;
            var invo = new Object();
            for(var i=0; i < invocerList.length; i++){
                if(invid == invocerList[i].invid){
                    invo = invocerList[i];
                }
            }
            var options = { jsonValue: invo, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(INVREPLACE);
            $('#edit_replace').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();



//�񷵻ؽ��
function getinvoDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            invocerList = res.invlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.invlist, callback);
        }else{

            tableDataSet(0, 0, 0, [], callback);
            alertDialog("��Ʊ̧ͷ��ȡʧ�ܣ�");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("��Ʊ̧ͷ��ȡʧ�ܣ�");
    }
}

//��ѯ
$("#inv_inquiry").on('click',function(){
    invocreTable.init();
})

function invoEditEnd(flg, result, type){
    var res = "ʧ��";
    var text = "";
    var alert = "";
    switch (type){
        case INVUPDATE:
            text = "�޸�";
            break;
        case INVREPLACE:
            text = "����";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }if (result && result.retcode == SUCCESS) {
            res = "�ɹ�";
            invocreTable.init();
            $('#edit_update').modal('hide');
            $('#edit_replace').modal('hide');
        }
    }
    if(alert == ""){
        if(type == INVUPDATE){
            alert = "�޸�" + text + res + "��";
        }else{
            alert = text + "�޸�" + res + "��";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//ɾ��
var invoDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("����ѡ��һ�");
        }else{
            confirmDialog("����ɾ���󽫲��ɻָ�����ȷ��Ҫɾ����", invoDelete.deleteivo)
        }
    });
    return{
        deleteivo: function(){
            var ush = {invidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                ush.invidlist.push($("#inv_table").dataTable().fnGetData(row).invid);
            });
            invoDeleteEdit(ush);
        }
    }
}();


//�����ʼĵ�ַ���
function getaddressDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            addressidList = res.list;
            for(var i = 0; i < addressidList.length; i++){
                $("#addrid").append("<option value='"+addressidList[i].aid+"'>" + addressidList[i].ress+"</option>");
            }
        }else{
            alertDialog("�ʼĵ�ַ��ȡʧ�ܣ�");
        }
    }else{
        alertDialog("�ʼĵ�ַ��ȡʧ�ܣ�");
    }
}
