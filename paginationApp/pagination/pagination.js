/**
 * Created by ZhangYiHeng on 2017-4-19.
 *
 * 参数示例
 * //分页参数
 * $scope.paginationCond={
		ajaxMethod:'post',		//请求方法 默认为 POST
		getTotalUrl:'/getTotal',	//获取列表总数
		getListUrl:'/getList',		//获取列表
		headers:{	//请求头配置 object
			"Content-Type": "application/json;charset=UTF-8" 
		}, 
		timeout:5000,				//超时设置
		condition:{			//对应请求参数
			keyWords : ''
		},
		pagination:{		//分页信息
			page : 1,		//当前页数  默认为1
			pageNum : 10	//每页多少条 默认为10
		},
		okFun:function(res){	//请求成功时进行 当且仅当hasSel为true时 生效
			if($scope.paginationConf.list.length>0){
				$scope.hasData=true;
				$scope.tableList=$scope.paginationConf.list;
			}else{
				$scope.hasData=false;
			}
		},
		errFun:function(res){	//请求失败时进行
			console.log(res);
			alert('配置错误!');
		}
	};
	$scope.tableList=[];		//对应页面列表数据初始化
	//分页配置
	$scope.paginationConf={
		indexTxt:"<<",		//首页文字显示 必须为string 默认"首页"
		lastTxt:">>",		//尾页文字显示 必须为string 默认"尾页"
		list:[],		//初始化列表存储 可不写，默认为[]
		hasLoading:true			//是否有loading层 默认为true
		hasSel:true,		//是否可选每页多少条 默认为true
		displayLength:5,		//显示多少个页码 必须为number 为0时不显示页码。默认为5
		selNumList:[10,15,20,30,50],	//选择每页多少条 必须为数组类型
	};
	对应返回请求信息示例：
	{
		"ret":{
			"ret_code":"0",
			"ret_msg":"返回应用总数！"
		},
		"data":{
			"list":[{
					"name":"张三",
					"age":19,
					"address":"广东深圳"
				},
				{
					"name":"二狗",
					"age":15,
					"address":"广东东莞"
				}],
			"pagination":{
				"page" : 1,
				"pageNum" : 10
			}
		}
	}
 */

var page=angular.module('page',[]);
page.directive('pagination', function($http,$timeout) {
	return {
		scope:{
			conf : '=',//分页配置，配置分页插件本身
			cond : '='//分页条件，向server端传参
		},
		restrict : 'AE',
		templateUrl : 'pagination/pagination.html',

		link: function(scope, iElement, iAttrs){
			var that=this;
			scope.timer=null;
			scope.toPage=function(curr){
				console.log(curr);
				curr=Number(curr);
				if(curr>scope.totalPage || curr<1){
					scope.currInput=scope.curr;
					return;
				}
				if(curr==scope.curr){//阻隔重复提交
					return;
				}
				scope.curr=curr;
				scope.currInput=scope.curr;
				scope.cond.pagination.page=scope.curr;
				scope.currList=calculateIndexes(scope.curr,scope.totalPage,scope.conf.displayLength);
				if(scope.timer==null){
					scope.timer=$timeout(function(){
						console.log(123333);
						getList();
						scope.timer=null;
					}, 500,true);
				}else{
					$timeout.cancel( scope.timer);
					scope.timer=$timeout(function(){
						console.log(123333);
						getList();
						scope.timer=null;
					}, 500,true);
				}
			};
			scope.toKeyPage=function(curr){
				if(event.keyCode==13){
					scope.toPage(curr);
				}
			};
			scope.paginationSel=function(){
				scope.onclk=!scope.onclk;
			};
			scope.selPageNum=function(selVal){
				console.log(selVal);
				scope.onclk=!scope.onclk;
				scope.cond.pagination.pageNum=selVal;
				scope.curr=1;
				scope.currInput=scope.curr;
				scope.cond.pagination.page=scope.curr;
				getList();
			};

			/**
			 *total ：信息总条数，pageNum：每页多少条    
			 *@return  总页数
			 */
			that.getPageTotalNum=function(total,pageNum){
				if(!pageNum){
					pageNum=10;
				}
				return Math.ceil(total/Number(pageNum));
			};
			
			/**
			 *current ：当前页码，length：总页码，displayLength：显示长度      
			 *@return  array[]
			 */
			that.calculateIndexes = function (current, length , displayLength) {
				if(displayLength==0){
					return [];
				}
				var indexes = [];
				var start = current - Math.floor(displayLength / 2);
				var end = current + Math.floor(displayLength / 2);
				if (start <= 1) {
					start = 1;
					end = start + displayLength - 1;
					if (end > length) {
						end = length;
					}
				}
				if (end > length-1) {
					end = length ;
					start = end - displayLength + 1;
					if (start <= 1) {
						start = 1;
					}
				}
				for (var i = start; i <= end; i++) {
					indexes.push(i);
				}
				return indexes;
			};


			that.getTotal=function(){
				if(scope.conf.hasLoading){
					scope.timer1=$timeout(function(){
						scope.showLoading=true;
						console.log(11);
					}, 500,true);
				}
				scope.conditions=scope.cond.condition;
				scope.conditions.pagination=scope.cond.pagination;
				$http({
					method : scope.cond.ajaxMethod,
					url : scope.cond.getTotalUrl,
					data : scope.conditions,
					timeout: scope.cond.timeout,
					headers : scope.cond.headers
				}).then(function successCallback(response) {
					var res=response.data;
					if( res.ret.ret_code != 0 ){
						$timeout.cancel( scope.timer1);
						scope.showLoading=false;
						scope.cond.errFun(response);
					}else{
						//TUDO
						scope.pagination.size=res.data.pagination.size;
						// scope.pagination.size=188;

						if(scope.pagination.size<=0){
							scope.hasData=false;
						}else{
							scope.cond.pagination.size=scope.pagination.size;
							getList();
						}
					}
				}, function errorCallback(response) {
					$timeout.cancel( scope.timer1);
					scope.showLoading=false;
					scope.cond.errFun(response);
				});
			};
			that.getList=function(){
				if(scope.conf.hasLoading){
					scope.timer2=$timeout(function(){
						scope.showLoading=true;
						console.log(22);
					}, 500,true);
				}
				scope.conditions=scope.cond.condition;
				scope.conditions.pagination=scope.cond.pagination;
				$http({
					method : scope.cond.ajaxMethod,
					url : scope.cond.getListUrl,
					data : scope.conditions,
					timeout: scope.cond.timeout,
					sync: false,
					headers : scope.cond.headers
				}).then(function successCallback(response) {
					var res=response.data;
					$timeout.cancel( scope.timer1);
					$timeout.cancel( scope.timer2);
					scope.showLoading=false;

					if( res.ret.ret_code != 0 ){
						scope.cond.errFun(response);
					}else{
						setPagination(res);
						scope.hasData=true;
						scope.cond.okFun(response);
					}
				}, function errorCallback(response) {
					$timeout.cancel( scope.timer1);
					$timeout.cancel( scope.timer2);
					scope.showLoading=false;
					scope.cond.errFun(response);
				});
			};
			that.setPagination=function(res){
				scope.onclk=false;
				scope.conf.list=res.data.list;//将列表信息保存，自行修改对应数据结构
				scope.pagination.pageNum=scope.cond.pagination.pageNum;//每页多少条
				scope.totalPage=getPageTotalNum(scope.pagination.size,scope.pagination.pageNum);//共有多少页
				if(scope.cond.pagination.page>scope.totalPage){
					scope.cond.pagination.page=1;
					scope.curr=scope.cond.pagination.page;
					scope.currInput=scope.curr;
				}
				scope.currList=calculateIndexes(Number(scope.curr),scope.totalPage,scope.conf.displayLength);//显示页码List
			};

			that.isObj=function(object) {
				return object && typeof (object) == 'object' && Object.prototype.toString.call(object).toLowerCase() == "[object object]";
			};
			that.isArray=function(object) {
				return object && typeof (object) == 'object' && object.constructor == Array;
			};
			that.getLength=function(object) {
				var count = 0;
				for (var i in object) count++;
				return count;
			};
			that.Compare=function(objA, objB) {
				if (!isObj(objA) || !isObj(objB)) return objA===objB; //判断类型是否正确
				if (getLength(objA) != getLength(objB)) return false; //判断长度是否一致
				return CompareObj(objA, objB, true);//默认为true
			};
			that.CompareObj=function(objA, objB, flag) {
				for (var key in objA) {
					if (!flag) //跳出整个循环
						break;
					if (!objB.hasOwnProperty(key)) { flag = false; break; }
					if (!isArray(objA[key])) { //子级不是数组时,比较属性值
						if (objB[key] != objA[key]) { flag = false; break; }
					} else {
						if (!isArray(objB[key])) { flag = false; break; }
						var oA = objA[key], oB = objB[key];
						if (oA.length != oB.length) { flag = false; break; }
						for (var k in oA) {
							if (!flag) //这里跳出循环是为了不让递归继续
								break;
							flag = CompareObj(oA[k], oB[k], flag);
						}
					}
				}
				return flag;
			};

			scope.setDefault=function(){
				if(!scope.cond.ajaxMethod || typeof(scope.cond.ajaxMethod)!="string"){
					scope.cond.ajaxMethod='post';
				}
				if(!scope.cond.pagination.page){
					scope.cond.pagination.page=1;
				}else if(scope.cond.pagination.page<0){
					scope.cond.pagination.page=1;
				}
				if(!scope.cond.timeout){
					scope.cond.timeout=-1;
				}
				if(!scope.cond.headers){
					scope.cond.headers={
						"Content-Type": "application/json;charset=UTF-8"
					};
				}
				if(!scope.conf.indexTxt && typeof(scope.conf.indexTxt)!="string"){
					scope.conf.indexTxt="首页";
				}
				if(!scope.conf.lastTxt && typeof(scope.conf.lastTxt)!="string"){
					scope.conf.lastTxt="尾页";
				}
				if(!scope.conf.list){
					scope.conf.list=[];
				}
				if(scope.conf.hasLoading != false){
					scope.conf.hasLoading=true;
				}
				if(scope.conf.hasSel != false){
					scope.conf.hasSel=true;
				}
				if(!scope.conf.displayLength || typeof(scope.conf.displayLength)!="number" ){
					if( scope.conf.displayLength!=0){
						scope.conf.displayLength=5;
					}
				}
				if(!scope.conf.selNumList){
					scope.conf.selNumList=[10,15,20,30,50];
				}
				scope.pagination=scope.cond.pagination;
				scope.curr=scope.pagination.page;
				scope.currInput=scope.curr;
				scope.onclk=false;
				scope.hasData=false;
				scope.showLoading=false;
				getTotal();
			};

			scope.watchCond=function(){	//数据监听
				scope.$watchCollection('cond.condition',function(newValue,oldValue){
					if(!Compare(newValue, oldValue)){
						console.log(Compare(newValue, oldValue));
						scope.setDefault();
					}

				});
				scope.$watch('cond.pagination.page',function(newValue,oldValue){
					if( newValue !== oldValue ){
						console.log( newValue !== oldValue );
						scope.toPage(Number(newValue) );
					}
				});
			};
			scope.setDefault();
			scope.watchCond();
		}
	};
});