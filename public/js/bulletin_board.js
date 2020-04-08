/**
 * Created by zxm on 2020/4/7.
 */

var bulletinList = [];
var bulletinContent = {
    "title":"",
    "content":"<p>因支付系统升级，<span style='color: #dc302e;font-weight: bolder'>4月8日18点～4月9日18点</span>支付系统暂停交易，请勿在此期间进行充值、运费支付操作；</p>"+
        "<p>基础信息（车辆信息、司机信息、收发货人信息、收款人信息）、运单信息等操作可正常进行，不受影响；</p>"+
        "<p>系统升级，造成不变敬请谅解。</p>",
    "state":"0",
    "priority":"2",
    "sort":"1",
    "time":"2020-04-09 18:00:00"
};

jQuery(document).ready(function(){
   //获取公告
    getBulletinData();
});



function getBulletinData(){
    if(bulletinContent.state == "0" && bulletinContent.priority == "2" && timeCompare(bulletinContent.time)){
        //显示优先级为高的弹框
        if(bulletinContent.title != ""){
            var title = "<div style='width:100%;height:40px;margin:0;font-size:15px;font-weight:bold;text-align: center'>"+bulletinContent.title+"</div>";
            $(".modal-body").append(title);
        }
        var content = "<div style='width: 100%;font-size:17px;text-indent: 2em'>"+bulletinContent.content+"</div>";
        $(".modal-body").append(content);
        $("#edit_bulletin").modal('show');
        //倒计时
        var Timer;
        var countTime = 11;
        $("#cancel_btn").attr('disabled',true);
        Timer = setInterval(
            function(){
                if(countTime == 0){
                    $("#cancel_btn").html("我已阅读并知悉");
                    $("#cancel_btn").attr('disabled',false);
                    clearInterval(Timer);
                }else{
                    countTime --;
                    $("#cancel_btn").html("我已阅读并知悉"+countTime+"秒");
                }
            },1000
        )
    }
}


//日期比较
function timeCompare(time){
    var date = new Date(time.replace("-","/"));
    var curDate = new Date();
    if(date <= curDate){
        return false;
    }else{
        return true;
    }
}