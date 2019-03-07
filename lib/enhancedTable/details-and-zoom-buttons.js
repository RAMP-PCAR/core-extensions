"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates and manages the details and and zoom buttons for all the rows of one panel instance.
 *
 * This class contains a custom angular controller to enable the opening of the details panel, and the zoom functionality.
 */
var DetailsAndZoomButtons = /** @class */ (function () {
    function DetailsAndZoomButtons(panelManager) {
        this.panelManager = panelManager;
        this.mapApi = panelManager.mapApi;
        this.legendBlock = panelManager.legendBlock;
        this.currentTableLayer = panelManager.currentTableLayer;
        this.setDetailsAndZoomButtons();
    }
    // registers the DetailsAndZoomCtrl
    DetailsAndZoomButtons.prototype.setDetailsAndZoomButtons = function () {
        var that = this;
        this.mapApi.agControllerRegister('DetailsAndZoomCtrl', function () {
            var proxy = that.legendBlock.proxyWrapper.proxy;
            // opens the details panel corresponding to the row where the details button is found
            this.openDetails = function (oid) {
                var data = proxy.attribs.then(function (attribs) {
                    var attributes = attribs.features.find(function (attrib) {
                        if (attrib.attributes.OBJECTID === oid) {
                            return attrib.attributes;
                        }
                    }).attributes;
                    var symbology = attributes['rvSymbol'];
                    var dataObj = [];
                    var map = that.mapApi.mapI;
                    // fake the array of objects containing attribute name, domain, type and alias
                    // this array - 'dataObj' is consumed by attributesToDetails
                    for (var key in attributes) {
                        var attribObj = {
                            alias: that.currentTableLayer.attributeHeaders[key] ? that.currentTableLayer.attributeHeaders[key]['name'] : '',
                            name: key,
                            domain: null,
                            type: null
                        };
                        // set the esriFieldType depending on the type of the value
                        if (key === proxy.oidField) {
                            attribObj.type = 'esriFieldTypeOID';
                        }
                        else if (typeof attributes[key] === 'string') {
                            attribObj.type = 'esriFieldTypeString';
                        }
                        else if (typeof attributes[key] === 'number') {
                            attribObj.type = 'esriFieldTypeDouble';
                        }
                        dataObj.push(attribObj);
                    }
                    // fake the details object that is used by identify, so that the details panel is opened
                    var detailsObj = {
                        isLoading: false,
                        data: [{
                                name: proxy.getFeatureName(oid, attributes),
                                data: proxy.attributesToDetails(attributes, dataObj),
                                oid: attributes[proxy.oidField],
                                symbology: [{ svgcode: symbology }]
                            }],
                        requestId: -1,
                        requester: {
                            proxy: proxy
                        }
                    };
                    var details = {
                        data: [detailsObj]
                    };
                    // set offset for point in case zoom is accessed from details panel
                    var offset = (that.panelManager.maximized || that.panelManager.isMobile()) ? { x: 0, y: 0 } : { x: 0.10416666666666667, y: 0.24464094319399785 };
                    map.externalOffset(offset);
                    map.toggleDetailsPanel(details);
                });
            };
            // determine if any column filters are present
            this.zoomToFeature = function (oid) {
                var map = that.mapApi.mapI;
                //set appropriate offset for point before zooming
                (that.panelManager.maximized || that.panelManager.isMobile()) ? that.mapApi.mapI.externalPanel($('#enhancedTable')) : that.mapApi.mapI.externalPanel(undefined);
                var offset = (that.panelManager.maximized || that.panelManager.isMobile()) ? { x: 0, y: 0 } : { x: 0.10416666666666667, y: 0.24464094319399785 };
                map.zoomToFeature(proxy, oid, offset);
            };
        });
    };
    return DetailsAndZoomButtons;
}());
exports.DetailsAndZoomButtons = DetailsAndZoomButtons;