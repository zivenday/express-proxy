var loc;
if (!!sessionStorage.getItem("loc")) {
	loc = sessionStorage.getItem("loc");
}
else {
	//没有存到session的话，默认使用服务器ip
	loc = "http://10.16.29.10"
}

//分页
var ul_pager_DomString = ".pager2";
var page_capacity = 10;

var count = 0;

var ajaxAPI = ["/recharge/manager/listWarningInfoByIccid.do","/recharge/manager/listWarningInfoByMid.do"];
var tableDomString = "#table-trafficInfoCheckResult>tbody";
var tableNoDataHtml = "<tr><td class='td-no-border' colspan='5'>暂无数据</<td></tr>";
var iccidVal = "";

$(document).ready(function () {

	ajaxListWarningInfo(page_capacity, 1, $.trim($("#inputIccidForCheckAlarmInfo").val()));

	//点击"查询"按钮
	$("#btn-checkAlarmInfoByIccid").click(function () {

		iccidVal = $.trim($("#inputIccidForCheckAlarmInfo").val());
		ajaxListWarningInfo(page_capacity, 1, iccidVal);
	});
	
});

function writeToWarningInfoTable( dataList){
	$(tableDomString).html("");
	
	$.each(dataList, function (index, item) {
		$(tableDomString).append("<tr><td>" + item.number + "</td><td>" + item.iccid + "</td><td>" + item.type + "</td><td>" + item.time + "</td><td>" + item.content + "</td></tr>");
	});
}


function writePager(page, num, count){	//当前请求页page，当前请求的消息条数num，第一次请求or上一次请求获得得到的消息条数count，
	//分页
	$(ul_pager_DomString).html("");
	var total_page = Math.ceil(count/num);
	var pager_html = '';
	
	for(var i=0;i<total_page;i++){
			var addClass= "";
			if(page == i+1){addClass= "class='selected' ";}
			$(ul_pager_DomString).append("<li "+addClass+ "onclick='ajaxListWarningInfo("+ num + "," + page + "," + iccidVal +")'" +"><span>"+ (i+1) +"</span></li>");
		}
}
	function ajaxListWarningInfo(num, page, iccid){
		
		if(!!iccid){iccid = String(iccid);}

		zivenload.start(".wrap-container");
		$.ajax({
			url: (!!iccid) ? loc+ajaxAPI[0]: loc+ajaxAPI[1],
			type: 'GET',
			data: (!!iccid) ? {num:num, page:page, iccid: iccid} : {num:num, page:page},
			dataType: '',
			success:function(msg){
				switch(String(msg.msg)){
					case "0":
						count = (page == 1)&& !!msg.count ? msg.count : count ;	//不会为0
						writeToWarningInfoTable(msg.warningList);	//表格内容
						writePager(page, num, count);	//分页
						break;
					case "1":
						count = 0;
						$(tableDomString).html("");
						$(tableDomString).append(tableNoDataHtml);
						$(ul_pager_DomString).html("");
						break;
					//case 10: 未登录or登录超时，不确定是否“重新登录”
					default:
						x0pAjaxError(msg);
						break;
				}
			},
			error:function(msg){
				x0pServerError(msg);
			},
			complete: function(){
				zivenload.end();
			}
		});
	}
