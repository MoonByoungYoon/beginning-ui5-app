sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/util/MockServer"
], function (UIComponent, MockServer) {
	"use strict";

	// ===================== [현재] 가짜 OData 서버 =====================
	// SmartFilterBar는 OData $metadata가 있어야 동작하므로, 브라우저 안에서 SAP 서버 흉내를 낸다.
	// [OData] 실제 서버 연결 시 이 블록(4줄)을 지우면 됨.
	var sLocal = sap.ui.require.toUrl("hw/products/localService");
	var oMockServer = new MockServer({ rootUri: "/sap/opu/odata/sap/ZHW_PRODUCT_SRV/" });
	oMockServer.simulate(sLocal + "/metadata.xml", sLocal + "/mockdata");
	oMockServer.start();

	return UIComponent.extend("hw.products.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments); // manifest.json 대로 모델 생성
			this.getRouter().initialize();                     // URL 보고 첫 화면 표시
		}
	});
});
