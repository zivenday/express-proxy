var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
	loc = "http://10.16.29.101:8080";
}

var loginAccount = sessionStorage.getItem("useraccount");
//var loginAccount = {account:'123456',password:'123456'};
$(document).ready(function(){

		var basicInfo = {
			userAccount: loginAccount,	//不可二次修改
			mname: "",	//不可二次修改
			maddress: "",
			mcontacts: "",
			mcontactsPhone: ""
		};
		var financeInfo = {
			bankCardAccount: "",
			bankName:"",
			bankCardName: ""	//不可二次修改
		};
		var selfManagementInfo = {
			account: "",
			password: "",
			key: "",
			discount: "",
			iccid:"",
		};
		//获取个人信息
		$.ajax({
			url:loc+'/recharge/manager/getManufacturerInfoByLogin.do',
			type:'GET',
			data:{},
			dataType:'JSON',
			success:function(msg){
				switch(String(msg.msg)){
				case "0":
					//将信息添加更新到页面上
					$("#manufacturer-basic-info>dd").html(function(index,oldvalue){
						switch(index){
						case 0://账号
							basicInfo.userAccount = loginAccount;
							return loginAccount;
							break;
						case 1://厂商名称
							basicInfo.mname = msg.name;
							return msg.name;
							break;
						case 2://厂商地址
							basicInfo.maddress = msg.address;
							return msg.address;
							break;
						case 3://联系人
							basicInfo.mcontacts = msg.contacts;
							return msg.contacts;
							break;
						case 4://联系电话
							basicInfo.mcontactsPhone = msg.contactsPhone;
							return msg.contactsPhone;
							break;
						}
					});

					if(!!msg.bankCardAccount){
						//已经填写过财务账号信息
						$("#manufacturer-finance-info>dd").html(function(index,oldvalue){
							switch(index){
							case 0://银行卡号
								financeInfo.bankCardAccount = msg.bankCardAccount; 
								return msg.bankCardAccount;
								break;
							case 1://开户行
								financeInfo.bankName = msg.bankName; 
								return msg.bankName;
								break;
							case 2://银行卡账户名
								financeInfo.bankCardName = msg.bankCardName;
								$(this).addClass("prohibit-re-editable");
								return msg.bankCardName;
								break;
							}
						});
					}
					if(!!msg.account){
						//已经填写过自管理平台信息
						$("#manufacturer-self-management-info>dd").html(function(index,oldvalue){
							switch(index){
							case 0://账户
								selfManagementInfo.account = msg.account;
								return msg.account;
								break;
							case 1://密码
								selfManagementInfo.password = msg.password;
								return msg.password;
								break;
							case 2://电信API接口密钥
								selfManagementInfo.key = msg.key;
								return msg.key;
								break;
							case 3://折扣
								selfManagementInfo.discount = String(msg.discount);
								return String(msg.discount);
							}
						});
					}
					
					//将“编辑”button设置为enabled
					$("#button-edit-basic-info").removeAttr("disabled");
					$("#button-edit-finance-info").removeAttr("disabled");
					$("#button-edit-manufacturer-self-management-info").removeAttr("disabled");
					break;
				case "1": //查询失败
					$(".well.profile>.p-error").text("出错："+msg.code);
					break;
				case "10": //未登录
					$(".well.profile>.p-error").text("出错："+msg.code);
					break;
				default:
					$(".well.profile>.p-error").text("出错：未知因素");
					break;
				}
			},
			error:function(msg){
				$(".well.profile>.p-error").text("出错："+msg);
			}
		});

		function setValueToInput(dom, objjson, isAddInput){
			var valueArray = new Array();
			for( var i in objjson ){
				valueArray.push(objjson[i]);
			}
			var str1 = "";
			var str2 = "";	//返回“不能编辑”状态
			if(isAddInput){	//进入“编辑状态”
				str1 = '<input type="text" value="';
				str2 = '" class="info-update-input"/>';
			}
			dom.html(function(index, oldvalue){
				if($(this).hasClass("prohibit-re-editable")){
					return valueArray[index];
				}
				else{
					return str1+valueArray[index]+str2;
				}
			});
		}

		//------------------------  厂商基本信息  ----------------------------------
		//点击“编辑”厂商基本信息
		$("#button-edit-basic-info").click(function(){
			setValueToInput($("#manufacturer-basic-info>dd"), basicInfo, 1);

			$(this).toggleClass("hidebutton");
			$("#button-cancel-basic-info").toggleClass("hidebutton");
			$("#button-update-basic-info").toggleClass("hidebutton");
		});
		//点击“取消”厂商基本信息
		$("#button-cancel-basic-info").click(function(){
			$("#button-edit-basic-info").toggleClass("hidebutton");
			$(this).toggleClass("hidebutton");
			$("#button-update-basic-info").toggleClass("hidebutton");

			setValueToInput($("#manufacturer-basic-info>dd"),basicInfo,0);
			$("#manufacturer-basic-info>p.p-error").text("");
		});
		//点击“确定”厂商基本信息
		$("#button-update-basic-info").click(function(){
			var isnull = false;
			var valueArray = new Array(basicInfo.userAccount,basicInfo.mname);
			$("#manufacturer-basic-info>dd>input").val(function(index,oldvalue){
				if(!oldvalue){
					//某input输入不完整
					isnull = true;
				}
				valueArray.push(oldvalue);
				return oldvalue;
			});
			if(isnull){
				//输出“表单填写出错”信息
				$("#manufacturer-basic-info>p.p-error").text("请将信息填写完整！");
			}
			else{//提交数据
				$("#manufacturer-basic-info>p.p-error").text("");
				var data = {address: valueArray[0], contactsName:valueArray[1], contactsPhone:valueArray[2]};
				$.ajax({
					url:loc+'/recharge/manager/updateManufacturerInfo.do',
					data:data,
					type:'POST',
					dataType:'JSON',
					success: function(msg){
						switch(String(msg.msg)){
						case "0":
							$("#button-edit-basic-info").toggleClass("hidebutton");
							$("#button-cancel-basic-info").toggleClass('hidebutton');
							$("#button-update-basic-info").toggleClass("hidebutton");
							for(var i in basicInfo){
								basicInfo[i] = valueArray[i-2];
							}
							setValueToInput($("manufacturer-basic-info>dd"), financeInfo, 0);
							break;
						case "1":
							$("#manufacturer-basic-info>.p-error").text("出错："+msg.code);
							break;
						case "2":
							$("#manufacturer-basic-info>.p-error").text("出错："+msg.code);
							break;
						case "10":
							$("#manufacturer-basic-info>.p-error").text("出错："+msg.code);
							break;
						default:
							$("#manufacturer-basic-info>.p-error").text("出错：未知因素");
							break;
						}
					},
					error: function(msg){
						$("#manufacturer-basic-info>.p-error").text("网络出错，请稍后重试");
					}
				});
			}
		});

		//------------------------  财务账号信息  ----------------------------------

		//点击“编辑”财务账户信息
		$("#button-edit-finance-info").click(function(){

			setValueToInput($("#manufacturer-finance-info>dd"), financeInfo, 1);

			$(this).toggleClass('hidebutton');
			$('#button-cancel-finance-info').toggleClass("hidebutton");
			$("#button-update-finance-info").toggleClass("hidebutton");
		});

		//点击“取消”财务账户信息
		$("#button-cancel-finance-info").click(function(){
			$("#button-edit-finance-info").toggleClass("hidebutton");
			$(this).toggleClass('hidebutton');
			$("#button-update-finance-info").toggleClass("hidebutton");

			var valueArray = new Array();
			for(var i in financeInfo){
				valueArray.push(financeInfo[i]);
			}
			setValueToInput($("#manufacturer-finance-info>dd"), financeInfo, 0);
			$("#manufacturer-finance-info>p.p-error").text("");
		});	

		//点击“确定”财务账户信息
		$("#button-update-finance-info").click(function(){
			var isnull = false;
			var valueArray = new Array();
			$("#manufacturer-finance-info>dd>input").val(function(index, oldvalue){
				if(!oldvalue){
					isnull = true;
				}
				valueArray.push(oldvalue);
				return oldvalue;
			});
			if(isnull){
				$("#manufacturer-finance-info>p.p-error").text("请将信息填写完整！");
			}
			else{
				var data = {account:valueArray[0],bank:valueArray[1]};
				if(!!valueArray[2]){
					data['name'] = valueArray[2];
				}
				$("#manufacturer-finance-info>p.p-error").text("");
				$.ajax({
					url:loc+'/recharge/manager/saveBankCardInfo.do',
					data:data,
					type:'POST',
					dataType:'JSON',
					success:function(msg){
						switch(String(msg.msg)){
						case "0":
							$("#button-edit-finance-info").toggleClass("hidebutton");
							$("#button-cancel-finance-info").toggleClass('hidebutton');
							$("#button-update-finance-info").toggleClass("hidebutton");
							for(var i in financeInfo){
								if(!!valueArray[2]){
									financeInfo[i] = valueArray[i];
								}
								else{
									if(i!=2){financeInfo[i] = valueArray[i];}
								}
							}
							setValueToInput($("manufacturer-finance-info>dd"), financeInfo, 0);
							if(! $("#manufacturer-finance-info>dd#dd-bankCardName").hasClass("prohibit-re-editable")){
								$("#manufacturer-finance-info>dd#dd-bankCardName").addClass("prohibit-re-editable");
							}
							break;
						case "1": case "2": case "10": 
							("#manufacturer-finance-info>p.p-error").text("出错"+msg.code);
							break;
						default:
							("#manufacturer-finance-info>p.p-error").text("出错：未知因素");
						}
					},
					error:function(msg){
						console.log("修改失败");
						$("#manufacturer-finance-info>p.p-error").text("网络出错，请稍后重试");
					}
				});
			}
		});
	
		//------------------------  自管理平台信息  ----------------------------------
		//点击“编辑”自管理平台信息
		$("#button-edit-manufacturer-self-management-info").click(function(){

			setValueToInput($("#manufacturer-self-management-info>dd"), selfManagementInfo, 1);
			$("#manufacturer-self-management-info>span").toggleClass("hide");	//出现iccid的输入项

			$(this).toggleClass('hidebutton');
			$('#button-cancel-manufacturer-self-management-info').toggleClass("hidebutton");
			$("#button-update-manufacturer-self-management-info").toggleClass("hidebutton");
		});

		//点击“取消”自管理平台信息
		$("#button-cancel-manufacturer-self-management-info").click(function(){
			$("#button-edit-manufacturer-self-management-info").toggleClass("hidebutton");
			$(this).toggleClass('hidebutton');
			$("#button-update-manufacturer-self-management-info").toggleClass("hidebutton");
			$("#manufacturer-self-management-info>span").toggleClass("hide");	//隐藏iccid的输入项


			var valueArray = new Array();
			for(var i in financeInfo){
				valueArray.push(selfManagementInfo[i]);
			}
			$("#manufacturer-self-management-info>p.p-error").text("");
			setValueToInput($("#manufacturer-self-management-info>dd"), selfManagementInfo, 0);
		});	

		//点击“确定”自管理平台信息
		$("#button-update-manufacturer-self-management-info").click(function(){
			var isnull = false;
			var valueArray = new Array();
			$("#manufacturer-self-management-info dd>input").val(function(index, oldvalue){
				if(!oldvalue){
					isnull = true;
				}
				valueArray.push(oldvalue);
				return oldvalue;
			});
			if(isnull){
				$("#manufacturer-self-management-info>p.p-error").text("请将信息填写完整！");
			}
			else{
				$("#manufacturer-self-management-info>p.p-error").text("");
				$.ajax({
					url:loc+'/recharge/manager/updateManufacturerKey.do',
					data:{account:valueArray[0],password:valueArray[1],key:valueArray[2],discount:valueArray[3],iccid:valueArray[4]},
					type:'POST',
					dataType:'JSON',
					success:function(msg){
						switch(String(msg.msg)){
						case "0":
							$("#button-edit-manufacturer-self-management-info").toggleClass("hidebutton");
							$("#button-cancel-manufacturer-self-management-info").toggleClass('hidebutton');
							$("#button-update-manufacturer-self-management-info").toggleClass("hidebutton");
							for(var i in selfManagementInfo){
								selfManagementInfo[i] = valueArray[i];
							}
							setValueToInput($("#manufacturer-self-management-info>dd"), selfManagementInfo, 0);
							$("#manufacturer-self-management-info>span dd>input").val("");
							$("#manufacturer-self-management-info>span").toggleClass("hide");
							break;
						case "1": case "2": case "10": default:
							$("#manufacturer-self-management-info>p.p-error").text("出错"+msg.code);
							break;
						}
						console.log("修改成功");
					},
					error:function(msg){
						console.log("修改失败");
						$("#manufacturer-self-management-info>p.p-error").text("网络出错，请稍后重试");
					}
				});
			}
		});
});