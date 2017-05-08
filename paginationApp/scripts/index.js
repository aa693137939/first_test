var app=angular.module('paginationApp',['page']);

app.controller('pageCtrl',  function ($scope) {
	$scope.keyWords="1";
	//分页条件
	$scope.paginationCond={
		ajaxMethod:'post',
		// getTotalUrl:'http://rapapi.org/mockjsdata/7528/getList',
		getTotalUrl:'tableData.json',
		// getListUrl:'http://rapapi.org/mockjsdata/7528/getList',
		getListUrl:'tableData.json',
		headers:{
			"Content-Type": "application/json;charset=UTF-8"
		},
		timeout:8000,
		condition:{
			keyWords : $scope.keyWords
		},
		pagination:{
			page : 1,
			pageNum : 10
		},
		okFun:function(res){
			// console.log(res.data);
			if($scope.paginationConf.list.length>0){
				$scope.hasData=true;
				$scope.tableList=$scope.paginationConf.list;
			}else{
				$scope.hasData=false;
			}
		},
		errFun:function(res){
			// console.log(res);
			alert('配置错误!');
		}
	};
	$scope.tableList=[];
	//分页配置
	$scope.paginationConf={
		indexTxt:"首页",
		lastTxt:"尾页",
		list:[],
		displayLength:5,
		hasLoading:true,
		hasSel:true,
		selNumList:[10,15,20,25,30,50]
	};

	$scope.jump=function(){
		$scope.paginationCond.condition.keyWords=$scope.keyWords;
		// console.log($scope.paginationCond.conditions);
		// pagination.setDefault();
	}
	$scope.jump1=function(){
		$scope.paginationCond.pagination.page=Number($scope.paginationCond.pagination.page)+1;
		console.log('1' instanceof  Object);
		// pagination.setDefault();
	}
});