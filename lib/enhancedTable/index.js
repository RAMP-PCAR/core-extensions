"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var take_1 = require("rxjs/internal/operators/take");
var panel_manager_1 = require("./panel-manager");
var templates_1 = require("./templates");
var config_manager_1 = require("./config-manager");
var custom_floating_filters_1 = require("./custom-floating-filters");
var custom_header_1 = require("./custom-header");
var panel_state_manager_1 = require("./panel-state-manager");
var NUMBER_TYPES = ['esriFieldTypeOID', 'esriFieldTypeDouble', 'esriFieldTypeInteger'];
var DATE_TYPE = 'esriFieldTypeDate';
var TEXT_TYPE = 'esriFieldTypeString';
var TableBuilder = /** @class */ (function () {
    function TableBuilder() {
        this.feature = 'table';
    }
    TableBuilder.prototype.init = function (mapApi) {
        var _this = this;
        this.mapApi = mapApi;
        this.panel = new panel_manager_1.PanelManager(mapApi);
        this.panel.reload = this.reloadTable.bind(this);
        this.mapApi.layers.reload.subscribe(function (baseLayer, interval) {
            if (!interval && baseLayer === _this.panel.currentTableLayer) {
                _this.reloadTable(baseLayer);
            }
        });
        // toggle the enhancedTable if toggleDataTable is called from Legend API
        this.mapApi.ui.configLegend._legendStructure._root._tableToggled.subscribe(function (legendBlock) {
            if (legendBlock.blockType === 'node') {
                // make sure the item clicked is a node, and not group or other
                var layer = void 0;
                if (legendBlock.parentLayerType === 'esriDynamic') {
                    layer = _this.mapApi.layers.allLayers.find(function (l) {
                        return l.id === legendBlock.layerRecordId && l.layerIndex === parseInt(legendBlock.itemIndex);
                    });
                }
                else {
                    layer = _this.mapApi.layers.getLayersById(legendBlock.layerRecordId)[0];
                }
                if (layer) {
                    _this.legendBlock = legendBlock;
                    _this.panel.setLegendBlock(legendBlock);
                    _this.openTable(layer);
                }
            }
        });
    };
    TableBuilder.prototype.openTable = function (baseLayer) {
        var _this = this;
        if (baseLayer.panelStateManager === undefined) {
            // if no PanelStateManager exists for this BaseLayer, create a new one
            baseLayer.panelStateManager = new panel_state_manager_1.PanelStateManager(baseLayer);
        }
        this.panel.panelStateManager = baseLayer.panelStateManager;
        var attrs = baseLayer.getAttributes();
        this.attributeHeaders = baseLayer.attributeHeaders;
        if (attrs.length === 0) {
            // make sure all attributes are added before creating the table (otherwise table displays without SVGs)
            this.mapApi.layers.attributesAdded.pipe(take_1.take(1)).subscribe(function (attrs) {
                if (attrs.attributes[0]) {
                    _this.configManager = new config_manager_1.ConfigManager(baseLayer, _this.panel);
                    _this.panel.configManager = _this.configManager;
                    _this.createTable(attrs);
                }
            });
        }
        else {
            this.configManager = new config_manager_1.ConfigManager(baseLayer, this.panel);
            this.panel.configManager = this.configManager;
            this.createTable({
                attributes: attrs,
                layer: baseLayer
            });
        }
    };
    TableBuilder.prototype.createTable = function (attrBundle) {
        var _this = this;
        var cols = [];
        attrBundle.layer._layerProxy.formattedAttributes.then(function (a) {
            Object.keys(a.rows[0]).forEach(function (columnName) {
                if (columnName === 'rvSymbol' ||
                    columnName === 'rvInteractive' ||
                    _this.configManager.filteredAttributes.length === 0 ||
                    _this.configManager.filteredAttributes.indexOf(columnName) > -1) {
                    // only create column if it is valid according to config, or a symbol/interactive column
                    // set up the column according to the specifications from ColumnConfigManger
                    var column = _this.configManager.columnConfigs[columnName];
                    // If the column has no config, create a default config for it
                    if (column === undefined) {
                        column = new config_manager_1.ColumnConfigManager(_this.configManager, undefined);
                        _this.configManager.columnConfigs[columnName] = column;
                    }
                    var colDef = {
                        width: column.width || 100,
                        minWidth: column.width,
                        headerName: _this.attributeHeaders[columnName] ? _this.attributeHeaders[columnName]['name'] : '',
                        headerTooltip: _this.attributeHeaders[columnName] ? _this.attributeHeaders[columnName]['name'] : '',
                        field: columnName,
                        filterParams: {},
                        filter: 'agTextColumnFilter',
                        floatingFilterComponentParams: { suppressFilterButton: true, mapApi: _this.mapApi },
                        floatingFilterComponent: undefined,
                        suppressSorting: false,
                        suppressFilter: column.searchDisabled,
                        sort: column.sort,
                        hide: _this.configManager.filteredAttributes.length === 0 || column.value !== undefined ? false : column.column ? !column.column.visible : undefined
                    };
                    _this.panel.notVisible[colDef.field] = _this.configManager.filteredAttributes.length === 0 ?
                        false : column.column ?
                        !column.column.visible : undefined;
                    // set up floating filters and column header
                    var fieldInfo = a.fields.find(function (field) { return field.name === columnName; });
                    if (fieldInfo) {
                        var isSelector = column.isSelector;
                        var isStatic = column.isFilterStatic;
                        if (!column.searchDisabled || column.searchDisabled === undefined) {
                            // only set up floating filters if search isn't disabled
                            // floating filters of type number, date, text
                            // text can be of type text or selector
                            if (NUMBER_TYPES.indexOf(fieldInfo.type) > -1) {
                                custom_floating_filters_1.setUpNumberFilter(colDef, isStatic, column.value, _this.tableOptions, _this.panel.panelStateManager);
                            }
                            else if (fieldInfo.type === DATE_TYPE) {
                                custom_floating_filters_1.setUpDateFilter(colDef, isStatic, _this.mapApi, column.value, _this.panel.panelStateManager);
                            }
                            else if (fieldInfo.type === TEXT_TYPE && attrBundle.layer.table !== undefined) {
                                if (isSelector) {
                                    custom_floating_filters_1.setUpSelectorFilter(colDef, isStatic, column.value, _this.tableOptions, _this.mapApi, _this.panel.panelStateManager);
                                }
                                else {
                                    custom_floating_filters_1.setUpTextFilter(colDef, isStatic, _this.configManager.lazyFilterEnabled, _this.configManager.searchStrictMatchEnabled, column.value, _this.mapApi, _this.panel.panelStateManager);
                                }
                            }
                        }
                        setUpHeaderComponent(colDef, _this.mapApi);
                    }
                    // symbols and interactive columns are set up for every table
                    setUpSymbolsAndInteractive(columnName, colDef, cols, _this.mapApi);
                }
            });
            Object.assign(_this.tableOptions, {
                columnDefs: cols,
                rowData: attrBundle.attributes
            });
            // Show toast on layer refresh is refresh interval is set
            var refreshInterval = _this.legendBlock.proxyWrapper.layerConfig.refreshInterval;
            if (refreshInterval) {
                _this.panel.toastInterval = setInterval(function () {
                    _this.panel.showToast();
                }, refreshInterval * 60000);
            }
            _this.panel.open(_this.tableOptions, attrBundle.layer);
            _this.tableApi = _this.tableOptions.api;
        });
    };
    TableBuilder.prototype.reloadTable = function (baseLayer) {
        this.panel.close();
        this.openTable(baseLayer);
    };
    return TableBuilder;
}());
exports.default = TableBuilder;
/* Helper function to set up symbols and interactive columns*/
function setUpSymbolsAndInteractive(columnName, colDef, cols, mapApi) {
    if (columnName === 'rvSymbol' || columnName === 'rvInteractive') {
        // symbols and interactive columns don't have options for sort, filter and have default widths
        colDef.suppressSorting = true;
        colDef.suppressFilter = true;
        colDef.lockPosition = true;
        if (columnName === 'rvSymbol') {
            colDef.maxWidth = 82;
            // set svg symbol for the symbol column
            colDef.cellRenderer = function (cell) {
                return cell.value;
            };
            colDef.cellStyle = function (cell) {
                return {
                    paddingTop: '7px'
                };
            };
        }
        else if (columnName === 'rvInteractive') {
            colDef.maxWidth = 40;
            // sets details and zoom buttons for the row
            var zoomDef = Object.assign({}, colDef);
            zoomDef.field = 'zoom';
            zoomDef.cellRenderer = function (params) {
                var eSpan = $(templates_1.ZOOM_TEMPLATE(params.data.OBJECTID));
                mapApi.$compile(eSpan);
                params.eGridCell.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        eSpan.click();
                    }
                });
                params.eGridCell.style.padding = 0;
                return eSpan[0];
            };
            cols.splice(0, 0, zoomDef);
            colDef.cellRenderer = function (params) {
                var eSpan = $(templates_1.DETAILS_TEMPLATE(params.data.OBJECTID));
                mapApi.$compile(eSpan);
                params.eGridCell.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        eSpan.click();
                    }
                });
                params.eGridCell.style.padding = 0;
                return eSpan[0];
            };
        }
        cols.splice(0, 0, colDef);
    }
    else {
        cols.push(colDef);
    }
}
/*Helper function to set up column headers*/
function setUpHeaderComponent(colDef, mApi) {
    colDef.headerComponent = custom_header_1.CustomHeader;
    colDef.headerComponentParams = {
        mapApi: mApi
    };
}
TableBuilder.prototype.tableOptions = {
    enableSorting: true,
    floatingFilter: true,
    autoSizePadding: 75,
    suppressColumnVirtualisation: true,
    ensureDomOrder: true,
    defaultColDef: {
        width: 100
    }
};
TableBuilder.prototype.id = 'fancyTable';
TableBuilder.prototype.translations = {
    'en-CA': {
        search: {
            placeholder: 'Search table'
        },
        table: {
            filter: {
                clear: 'Clear filters',
                apply: 'Apply filters to map'
            },
            hideColumns: 'Hide columns'
        },
        menu: {
            split: 'Split View',
            max: 'Maximize',
            print: 'Print',
            export: 'Export',
            filter: {
                extent: 'Filter by extent',
                show: 'Show filters'
            }
        },
        detailsAndZoom: {
            details: 'Details',
            zoom: 'Zoom To Feature'
        },
        columnFilters: {
            selector: 'selection',
            date: {
                min: 'date min',
                max: 'date max'
            },
            text: 'text'
        }
    },
    'fr-CA': {
        search: {
            placeholder: 'Texte à rechercher'
        },
        table: {
            filter: {
                clear: 'Effacer les filtres',
                apply: 'Appliquer des filtres à la carte' // TODO: Add official French translation
            },
            hideColumns: 'Masquer les colonnes' // TODO: Add Official French translation
        },
        menu: {
            split: 'Diviser la vue',
            max: 'Agrandir',
            print: 'Imprimer',
            export: 'Exporter',
            filter: {
                extent: 'Filtrer par étendue',
                show: 'Afficher les filtres'
            }
        },
        detailsAndZoom: {
            details: 'Détails',
            zoom: "Zoom à l'élément"
        },
        columnFilters: {
            selector: 'sélection',
            date: {
                min: 'date min',
                max: 'date max'
            },
            text: 'texte'
        }
    }
};
window.enhancedTable = TableBuilder;
