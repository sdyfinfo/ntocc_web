/**
 * Created by Lenovo on 2020/2/11.
 */

var countylist = [];
var citylist = [];

//省赋值
function addressDispaly(province){
    for(var i in areaCode){
        $(province).append("<option value='"+areaCode[i].code+"'>"+areaCode[i].name+"</option>");
    }
}

//省
$("#loading_provincecode").change(function(){
    var province = $(this).val();
    cityDisplay(province,"#loading_citycode","#loading_countycode");
});
$("#unloading_provincecode").change(function(){
    var province = $(this).val();
    cityDisplay(province,"#unloading_citycode","#unloading_countycode");
});
$("#provincecode").change(function(){
    var province = $(this).val();
    cityDisplay(province,"#citycode","#countycode");
});


//市
$("#loading_citycode").change(function(){
    var city = $(this).val();
    countyDisplay(city,"#loading_countycode");
});
$("#unloading_citycode").change(function(){
    var city = $(this).val();
    countyDisplay(city,"#unloading_countycode");
});
$("#citycode").change(function(){
    var city = $(this).val();
    countyDisplay(city,"#countycode");
});



//省联动市
function cityDisplay(province,city,county){
    $(city).empty();
    $(county).empty();
    $(city).append("<option value=''>请选择市</option>");
    $(county).append("<option value=''>请选择区/县</option>");
    if(province != ""){
        for(var i in areaCode){
            if(province == areaCode[i].code){
                citylist = areaCode[i].city;
                for(var j in citylist){
                    $(city).append("<option value='"+citylist[j].code+"'>"+citylist[j].name+"</option>");
                }
            }
        }
    }
}

//市联动县
function countyDisplay(city,county){
    $(county).empty();
    $(county).append("<option value=''>请选择区/县</option>");
    if(city!=""){
        for(var i in citylist){
            if(city == citylist[i].code){
                countylist = citylist[i].county;
                for(var j in countylist){
                    $(county).append("<option value='"+countylist[j].code+"'>"+countylist[j].name+"</option>");
                }
            }
        }
    }
}