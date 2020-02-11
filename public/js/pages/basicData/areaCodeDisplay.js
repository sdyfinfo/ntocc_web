/**
 * Created by haiyang on 2020/2/11.
 */

var countylist = [];
var citylist = [];

if(App.isAngularJsApp() == false){
    //省赋值
    provinceDispaly();
}

//省赋值
function provinceDispaly(){
    for(var i in areaCode){
        $("#unloading_provincecode,#loading_provincecode").append("<option value='"+areaCode[i].code+"'>"+areaCode[i].name+"</option>");
    }
}

//省联动市
$("#loading_provincecode").change(function(){
    var province = $(this).val();
    $("#loading_citycode,#loading_countycode").empty();
    $("#loading_citycode").append("<option value=''>请选择市</option>");
    $("#loading_countycode").append("<option value=''>请选择区/县</option>");
    if(province != ""){
        for(var i in areaCode){
            if(province == areaCode[i].code){
                citylist = areaCode[i].city;
                for(var j in citylist){
                    $("#loading_citycode").append("<option value='"+citylist[j].code+"'>"+citylist[j].name+"</option>");
                }
            }
        }
    }
});
$("#unloading_provincecode").change(function(){
    var province = $(this).val();
    $("#unloading_citycode,#unloading_countycode").empty();
    $("#unloading_citycode").append("<option value=''>请选择市</option>");
    $("#unloading_countycode").append("<option value=''>请选择区/县</option>");
    if(province != ""){
        for(var i in areaCode){
            if(province == areaCode[i].code){
                citylist = areaCode[i].city;
                for(var j in citylist){
                    $("#unloading_citycode").append("<option value='"+citylist[j].code+"'>"+citylist[j].name+"</option>");
                }
            }
        }
    }
});


//市联动县
$("#loading_citycode").change(function(){
    var city = $(this).val();
    $("#loading_countycode").empty();
    $("#loading_countycode").append("<option value=''>请选择区/县</option>");
    if(city!=""){
        for(var i in citylist){
            if(city == citylist[i].code){
                countylist = citylist[i].county;
                for(var j in countylist){
                    $("#loading_countycode").append("<option value='"+countylist[j].code+"'>"+countylist[j].name+"</option>");
                }
            }
        }
    }
});
$("#unloading_citycode").change(function(){
    var city = $(this).val();
    $("#unloading_countycode").empty();
    $("#unloading_countycode").append("<option value=''>请选择区/县</option>");
    if(city!=""){
        for(var i in citylist){
            if(city == citylist[i].code){
                countylist = citylist[i].county;
                for(var j in countylist){
                    $("#unloading_countycode").append("<option value='"+countylist[j].code+"'>"+countylist[j].name+"</option>");
                }
            }
        }
    }
});