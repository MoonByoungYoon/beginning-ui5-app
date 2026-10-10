sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("hw.products.controller.List", {

		// 화면이 처음 만들어질 때 한 번 실행 ($(document).ready 와 같은 자리)
		onInit: function () {
			var oProductModel = this.getOwnerComponent().getModel("product"); // 화면용 JSON 모델
			var oODataModel = this.getOwnerComponent().getModel();            // 서버 통신용 OData 모델

			// ===================== [현재] JSON 더미 데이터 =====================
			var sUrl = sap.ui.require.toUrl("hw/products/localService/mockdata");
			Promise.all([
				fetch(sUrl + "/Products.json").then((res) => res.json()),
				fetch(sUrl + "/Categories.json").then((res) => res.json())
			]).then(([aProducts, aCategories]) => {
				oProductModel.setData({ Products: aProducts, Categories: aCategories });
			});

			// ===================== [OData] 실제 서버 연결 시 =====================
			// 위 [현재] 블록을 지우고 아래 주석을 풀면 됨. (GET /Products, GET /Categories)
			// oODataModel.read("/Products", {
			// 	success: (oData) => oProductModel.setProperty("/Products", oData.results)
			// });
			// oODataModel.read("/Categories", {
			// 	success: (oData) => oProductModel.setProperty("/Categories", oData.results)
			// });
		},

		// 필터바 [실행] 버튼
		onSearch: function () {
			var aFilters = this.byId("smartFilterBar").getFilters(); // 입력한 검색조건 → Filter 객체 배열

			// ===================== [현재] JSON 더미 데이터 =====================
			// 테이블에 연결된 데이터에 거름망을 끼운다 (브라우저 안에서 거름)
			this.byId("productTable").getBinding("items").filter(aFilters);

			// ===================== [OData] 실제 서버 연결 시 =====================
			// 위 한 줄을 지우고 아래 주석을 풀면 됨. (GET /Products?$filter=...)
			// var oProductModel = this.getOwnerComponent().getModel("product");
			// this.getOwnerComponent().getModel().read("/Products", {
			// 	filters: aFilters,
			// 	success: (oData) => oProductModel.setProperty("/Products", oData.results)
			// });
		},

		// 테이블 행 클릭 → 상세 페이지 (#/products/P001)
		onItemPress: function (oEvent) {
			var sProductId = oEvent.getSource().getBindingContext("product").getProperty("ProductID");
			this.getOwnerComponent().getRouter().navTo("detail", { productId: sProductId });
		}
	});
});
