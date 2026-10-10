sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("hw.products.controller.Detail", {

		onInit: function () {
			// "#/products/{productId}" 주소로 들어올 때마다 _onRouteMatched 실행
			this.getOwnerComponent().getRouter().getRoute("detail")
				.attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function (oEvent) {
			var sProductId = oEvent.getParameter("arguments").productId; // URL의 {productId}
			var aProducts = this.getOwnerComponent().getModel("product").getProperty("/Products") || [];
			var iIndex = aProducts.findIndex((p) => p.ProductID === sProductId);

			if (iIndex < 0) { // 상세 화면에서 새로고침해서 데이터가 없는 경우 등
				this.onNavBack();
				return;
			}
			// 이 화면 전체가 "/Products/{iIndex}" 제품 한 건을 기준으로 표시된다
			this.getView().bindElement({ path: "/Products/" + iIndex, model: "product" });
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("list");
		},

		// [수정] → 팝업 열기
		onEdit: function () {
			var oProduct = this.getView().getBindingContext("product").getObject();
			// 원본을 복사해서 "edit" 모델로 → 팝업은 복사본을 수정한다
			this.getView().setModel(new JSONModel(Object.assign({}, oProduct)), "edit");

			if (!this._pDialog) { // 팝업 XML은 처음 한 번만 불러온다
				this._pDialog = this.loadFragment({ name: "hw.products.view.fragment.EditDialog" });
			}
			this._pDialog.then((oDialog) => oDialog.open());
		},

		// 팝업 [저장]
		onSaveEdit: function () {
			var oProductModel = this.getOwnerComponent().getModel("product");
			var sPath = this.getView().getBindingContext("product").getPath(); // 예: "/Products/0"
			var oEdit = this.getView().getModel("edit").getData();
			oEdit.Price = Number(oEdit.Price);

			// 화면 반영: 원본 위치에 복사본을 덮어쓴다 → 목록/상세 화면이 자동으로 바뀜
			var fnApply = () => {
				oProductModel.setProperty(sPath, oEdit);
				this.byId("editDialog").close();
				MessageToast.show("저장했습니다.");
			};

			// ===================== [현재] JSON 더미 데이터 =====================
			fnApply();

			// ===================== [OData] 실제 서버 연결 시 =====================
			// 위 fnApply(); 를 지우고 아래 주석을 풀면 됨. (PUT /Products('P001'))
			// this.getOwnerComponent().getModel().update("/Products('" + oEdit.ProductID + "')", oEdit, {
			// 	success: fnApply
			// });
		},

		// 팝업 [취소]
		onCancelEdit: function () {
			this.byId("editDialog").close();
		},

		// [삭제] → 확인 후 삭제하고 목록으로
		onDelete: function () {
			var oProductModel = this.getOwnerComponent().getModel("product");
			var oProduct = this.getView().getBindingContext("product").getObject();

			// 화면 반영: 배열에서 해당 제품을 빼고 통째로 다시 넣는다
			var fnApply = () => {
				var aRest = oProductModel.getProperty("/Products").filter((p) => p.ProductID !== oProduct.ProductID);
				oProductModel.setProperty("/Products", aRest);
				MessageToast.show("삭제했습니다.");
				this.onNavBack();
			};

			MessageBox.confirm("'" + oProduct.Name + "'을(를) 삭제할까요?", {
				onClose: (sAction) => {
					if (sAction !== MessageBox.Action.OK) {
						return;
					}
					// ===================== [현재] JSON 더미 데이터 =====================
					fnApply();

					// ===================== [OData] 실제 서버 연결 시 =====================
					// 위 fnApply(); 를 지우고 아래 주석을 풀면 됨. (DELETE /Products('P001'))
					// this.getOwnerComponent().getModel().remove("/Products('" + oProduct.ProductID + "')", {
					// 	success: fnApply
					// });
				}
			});
		}
	});
});
