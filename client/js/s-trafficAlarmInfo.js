var loc;
if (!!sessionStorage.getItem("loc")) {
	loc = sessionStorage.getItem("loc");
}
else {
	//没有存到session的话，默认使用服务器ip
	loc = "http://10.16.29.101:8080";
}
console.log(loc);

//分页
var ul_pager = $(".pager2");
var page_capacity = 10;
var count = 0;

$(document).ready(function () {
	getTrafficAlarmInfo(false, "", 1);

	//点击"查询"按钮
	$("#checkAlarmThresholdInfo").click(function () {
		$(".input-error").html("&nbsp;");	//清空错误信息

		var iccidVal = $.trim($("#inputSingleICCID").val());
		if (!iccidVal) {
			//未输入iccid值
			getTrafficAlarmInfo(false, "", 1);
		}
		else {
			$("#table-trafficThresholdCheckResult>tbody").html("");	//清空上次查询结果
			getTrafficAlarmInfo(true, iccidVal, 1);
		}
	});
});

//请求接口“listTrafficAlarmInfo.do”
function getTrafficAlarmInfo(isWithIccid, iccid, page) {
		// var msg = {};
		var data = {};
		var ajaxAPI = '';
		if(!!isWithIccid){
			data["iccid"] = iccid;
			ajaxAPI = "/recharge/manager/getTrafficAlarmInfoByIccid.do";
			// msg = {
			// 	"trafficAlarmValue":"80%提醒",
			// 	"CUMULATION_TOTAL":"1550336",
			// 	"number":"1064919874258",
			// 	"isTrafficAlarm":1,
			// 	"msg":0,
			// 	"CUMULATION_ALREADY":"1120614.4",
			// 	"CUMULATION_LEFT":"440320",
			// 	"operation": 1
			// };
		}
		else if(!!page){
			data["page"] = page;
			ajaxAPI = "/recharge/manager/listTrafficAlarmInfo.do";
			// msg = {
			// "count":2,
			// "trafficAlarmList":[
			// 	{"trafficAlarmValue":"80%提醒",
			// 	"CUMULATION_TOTAL":"1550336",
			// 	"iccid":"8986031540252024112",
			// 	"number":"1064919874258",
			// 	"isTrafficAlarm":1,
			// 	"CUMULATION_ALREADY":"1120614.4",
			// 	"CUMULATION_LEFT":"440320",
			// 	"operation": 1},
			// 	{"trafficAlarmValue":"40,80,100","CUMULATION_TOTAL":"1171456","iccid":"8986031540252024113","number":"1064920006999","isTrafficAlarm":1,"CUMULATION_ALREADY":"93941.76",
			// 	"CUMULATION_LEFT":"1077512",
			// 	"operation": 0}
			// ],
			// "msg":0};
		}

		zivenload.start(".wrap-container");
		$.ajax({
			url: loc + ajaxAPI,
			type: 'GET',
			data: data,
			dataType: 'JSON',
			success: function (msg) {
				switch (String(msg.msg)) {
					case "0":
						//总条数为count
						var dataList = [];
						if(page == 1 && !isWithIccid){
							count = msg.count;
						}
						if(!!isWithIccid){
							count = 1;
							msg["iccid"] = iccid;
							dataList = [msg];
							page = 1;
						}
						else{
							dataList = msg.trafficAlarmList;
						}
						listTrafficAlarmInfoSuccess(dataList, count, page, isWithIccid, iccid);
						break;
					case "1"://不存在
						$(".pager2").html("");
						$("#table-trafficThresholdCheckResult>tbody").html("");
						$("#table-trafficThresholdCheckResult>tbody").append("<tr><td class='td-no-border' colspan='6'>暂无数据</<td></tr>");
						break;
					case "2":
						x0pAjaxError(msg);
						break;
					case "10":
						//登录超时、未登录 
						x0pAjaxError(msg);
						parent.window.location.href = "login.html";
						break;
					default:
						x0pAjaxError(msg);
						break;
				}
			},
			error: function (msg) {
				x0pServerError(msg);
			},
			complete: function(){
                zivenload.end();
            }
		});
	}

	function listTrafficAlarmInfoSuccess(list, count, page, isWithIccid, iccid) {
		$("#table-trafficThresholdCheckResult>tbody").find("a").off();
		$("#table-trafficThresholdCheckResult>tbody").html("");
		var pager_capacity2 = list.length <= page_capacity? list.length : page_capacity;
		$.each(list.slice(0, pager_capacity2), function (index, item) {
			$("#table-trafficThresholdCheckResult>tbody").append("<tr><td>" + item.number + "</td><td>" + item.iccid + "</td><td>" + (parseInt(item.CUMULATION_TOTAL) / 1024).toFixed(2) + "</td><td>" + (parseInt(item.CUMULATION_ALREADY) / 1024).toFixed(2) + "</td><td>" + (parseInt(item.CUMULATION_LEFT) / 1024).toFixed(2) + "</td><td></td></tr>");
			var isSetValue;
			if (item.isTrafficAlarm) {
				//设置了预警阈值
				switch (item.trafficAlarmValue.match(/[0-9]+/g).join()) {
					case "40":
						isSetValue = "40%";
						break;
					case "80":
						isSetValue = "80%";
						break;
					case "100":
						isSetValue = "100%";
						break;
					case "40,80,100":
						isSetValue = "40%，80%，100%";
						break;
				}
			}
			else {
				//未设置预警阈值
				isSetValue = "-";
			}
			var operation1 = "";
			var operation2 = "";
			if(!item.operation){	//不可操作
				operation1 = " style='display:none;' ";
				operation2 = " style='display:inline-block;' "
			}
			else{	//可操作
				operation1 = " style='display:inline-block;' ";
				operation2 = " style='display:none;' "
			}

			var selectDom = $('#table-trafficThresholdCheckResult>tbody>tr:last-child>td:last-child');
			var htmlstr = "<div class='btn-group'"+operation1+"><button data-toggle='dropdown' class='btn btn-primary dropdown-toggle' type='button'>"
				+ isSetValue
				+ "<span class='caret'></span></button>"
				+ "<ul role=‘menu’ class='dropdown-menu'><li><a>40%</a></li><li><a>80%</a></li><li><a>100%</a></li><li><a>40%，80%，100%</a></li></ul></div>"
				+"<button class='btn-processing'"+operation2+"disabled>处理中</button>";	//需要根据后台回复的数据判断隐藏哪个按钮

			selectDom.html(htmlstr);
			selectDom.find("a").click(function () {
				var selectText = $(this).text();
				var wantSetValue = $.trim(selectText).match(/[0-9]+/g).join();
				setTrafficAlarm(item, wantSetValue, selectDom, selectText);
			});
		});

		//分页
		ul_pager.html("");
		var total_page = Math.ceil(count/page_capacity);
		var pager_html = '';
		for(var i=0;i<total_page;i++){
			var addClass= "";
			if(page == i+1){addClass= " class='selected'";}
			pager_html = pager_html + "<li  onclick='getTrafficAlarmInfo("+isWithIccid+", \""+iccid+"\", "+(i+1)+")'"+addClass +"><span>"+ (i+1) +"</span></li>";
		}
		ul_pager.html(pager_html);
	}

//将按钮置为“处理中”的的样式
function switchButtonStatus_processing(elem, switchDirection){//switchDirection    -- 1:显示“processing”; -- 0:隐藏“processing”
	switch(switchDirection){
		case 1:
			$(elem).find('.btn-group').css('display','none');
			$(elem).find('.btn-processing').css('display', 'inline-block');
			break;
		case 0:
			$(elem).find('.btn-group').css('display','inline-block');
			$(elem).find('.btn-processing').css('display', 'none');
			break;
	}
}

function setTrafficAlarm(item, wantSetValue, selectDom, selectText) {
		//var msg = {"code":"save success","msg":0};

		zivenload.start(".wrap-container");
		$.ajax({
			url: loc + '/recharge/manager/setTrafficAlarm.do',
			type: 'POST',
			data: {
				iccid: item.iccid,
				number: item.number,
				alarmValue: wantSetValue
			},
			dataType: 'JSON',
			success: function (msg) {
				switch (String(msg.msg)) {
					case "0":
						x0pSuccess("request", function(){ switchButtonStatus_processing( selectDom, 1 ) } );	//请求成功
						break;
					case "1":case "2":case "4": case "17":
						x0pAjaxError(msg);
						break;
					case "10":
						x0pAjaxError(msg);
						parent.window.location.href = "login.html";
						break;
					default:
						x0pAjaxError(msg);
						break;
				}
			},
			error: function (msg) {
				x0pServerError(msg);
			},
			complete: function(){
                zivenload.end();
            }
		});
	}