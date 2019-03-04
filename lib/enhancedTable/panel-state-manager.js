"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Saves relevant enhancedTable states so that it can be reset on reload/reopen. A PanelStateManager is linked to a BaseLayer.
 * setters are called each time enhancedTable states are updated, getters are called each time enhancedTable is reloaded/reopened.
 * States to save and reset:
 *      - displayed rows (on symbology and layer visibility updates)
 *      - column filters
 *      - whether table maximized is in maximized or split view
 */
var PanelStateManager = /** @class */ (function () {
    function PanelStateManager(baseLayer) {
        this.baseLayer = baseLayer;
        this.isMaximized = baseLayer.table.maximize || false;
        this.filterByExtent = false;
        this.columnFilters = {};
    }
    PanelStateManager.prototype.getColumnFilter = function (colDefField) {
        return this.columnFilters[colDefField];
    };
    PanelStateManager.prototype.setColumnFilter = function (colDefField, filterValue) {
        this.columnFilters[colDefField] = filterValue;
    };
    Object.defineProperty(PanelStateManager.prototype, "maximized", {
        get: function () {
            return this.isMaximized;
        },
        set: function (maximized) {
            this.isMaximized = maximized;
        },
        enumerable: true,
        configurable: true
    });
    return PanelStateManager;
}());
exports.PanelStateManager = PanelStateManager;
