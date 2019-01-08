import { Grid } from 'ag-grid-community';
import { SEARCH_TEMPLATE, MENU_TEMPLATE, CLEAR_FILTERS_TEMPLATE, COLUMN_VISIBILITY_MENU_TEMPLATE, MOBILE_MENU_TEMPLATE, MOBILE_MENU_BTN_TEMPLATE, RECORD_COUNT_TEMPLATE } from './templates';
import { DetailsAndZoomButtons } from './details-and-zoom-buttons';
import 'ag-grid-community/dist/styles/ag-grid.css';
import './main.scss';
import { PanelRowsManager } from './panel-rows-manager';
import { PanelStatusManager } from './panel-status-manager';
import { scrollIntoView, tabToGrid } from './grid-accessibility';
import { ConfigManager, ColumnConfigManager } from './config-manager';
import { PanelStateManager } from './panel-state-manager';

/**
 * Creates and manages one api panel instance to display the table in the ramp viewer. One panelManager is created for each map instance on the page.
 *
 * This class also contains custom angular controllers to enable searching, printing, exporting, and more from angular material panel controls.
 */
export class PanelManager {

    constructor(mapApi: any) {
        this.mapApi = mapApi;
        this.tableContent = $(`<div rv-focus-exempt></div>`);
        this.panel = this.mapApi.createPanel('enhancedTable');
        this.setSize();
        this.panel.panelBody.addClass('ag-theme-material');
        this.panel.setBody(this.tableContent);
        this.panel.element[0].setAttribute('type', 'table');
        this.panel.element[0].classList.add('default');
        this.panel.element[0].addEventListener('focus', (e: any) => scrollIntoView(e, this.panel.element[0]), true);

        // add mobile menu to the dom
        let mobileMenuTemplate = $(MOBILE_MENU_TEMPLATE)[0];
        this.mobileMenuScope = this.mapApi.$compile(mobileMenuTemplate);
        this.panel.panelControls.after(mobileMenuTemplate);

        // Add the scroll record count if it hasn't been added yet
        let recordCountTemplate = $(RECORD_COUNT_TEMPLATE);
        this.recordCountScope = this.mapApi.$compile(recordCountTemplate);
        this.panel.panelControls.after(recordCountTemplate);
    }

    // recursively find and set the legend block for the layer
    setLegendBlock(legendEntriesList: any) {
        legendEntriesList.forEach(entry => {
            if (entry.proxyWrapper !== undefined && this.currentTableLayer._layerProxy === entry.proxyWrapper.proxy) {
                this.legendBlock = entry;
            }
            else if (entry.children || entry.entries) {
                this.setLegendBlock(entry.children || entry.entries);
            }
        });
    }

    open(tableOptions: any, layer: any) {
        if (this.currentTableLayer === layer) {
            this.close();
        } else {
            this.tableOptions = tableOptions;
            this.panelStatusManager = new PanelStatusManager(this);
            this.panelStatusManager.setFilterAndScrollWatch();

            // set legend block / layer that the panel corresponds to
            this.currentTableLayer = layer;
            this.setLegendBlock(this.currentTableLayer._mapInstance.legendBlocks.entries);
            this.panelRowsManager = new PanelRowsManager(this);
            // set header / controls for panel
            let controls = this.header;
            controls = [
                `<h3 class="md-title table-title">Features: ${this.configManager.title}</h3>`,
                '<span style="flex: 1;"></span>',
                ...controls
            ];
            this.panel.setControls(controls);

            // set css for panel
            this.panel.panelBody.css('padding-top', '16px');
            this.panel.panelControls.css('display', 'flex');
            this.panel.panelControls.css('align-items', 'center');
            this.tableContent.empty();

            //create details and zoom buttons, open the panel and display proper filter values
            new DetailsAndZoomButtons(this);
            new Grid(this.tableContent[0], tableOptions);
            this.configManager.setDefaultGlobalSearchFilter();
            this.panel.open();
            this.panelStatusManager.getScrollRange();
            this.panelRowsManager.initObservers();

            this.tableOptions.onGridReady = () => {
                this.autoSizeToMaxWidth();
                this.sizeColumnsToFitIfNeeded();
                let colApi = this.tableOptions.columnApi
                let col = colApi.getDisplayedColAfter(colApi.getColumn('rvInteractive'));
                if (col !== (undefined || null) && col.sort === undefined) {
                    // set sort of first column to ascending by default if sort isn't specified
                    col.setSort("asc");
                }
            };

            // Set up grid panel accessibility
            // Link clicked legend element to the opened table
            const sourceEl = $(document).find(`[legend-block-id="${this.legendBlock.id}"] button`).filter(':visible').first();
            (<EnhancedJQuery><unknown>$(sourceEl)).link($(document).find(`#enhancedTable`));
            // Go from last filter input to grid and reverse
            let headers = this.panel.element[0].getElementsByClassName('ag-header-cell');
            let filters = headers[headers.length - 1].getElementsByTagName('INPUT');
            this.lastFilter = filters[filters.length - 1]; // final filter before grid
            this.gridBody = this.panel.element[0].getElementsByClassName('ag-body')[0];
            this.gridBody.tabIndex = 0; // make grid container tabable
            this.gridBody.addEventListener('focus', (e: any) => tabToGrid(e, this.tableOptions, this.lastFilter), false);
            this.configManager.initColumns();
        }

        this.panelStatusManager.getFilterStatus();
    }

    close() {
        this.panel.element[0].removeEventListener('focus', (e: any) => scrollIntoView(e, this.panel.element[0]), true);
        this.gridBody.removeEventListener('focus', (e: any) => tabToGrid(e, this.tableOptions, this.lastFilter), false);
        this.panel.close();
        this.currentTableLayer = undefined;
    }

    onBtnExport() {
        this.tableOptions.api.exportDataAsCsv();
    }

    onBtnPrint() {
        this.panel.panelBody.css({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: this.tableOptions.api.getPreferredWidth() + 2,
            'z-index': '5',
            height: 'auto'
        });

        this.tableOptions.api.setGridAutoHeight(true);
        this.panel.panelBody.prependTo('body');

        setTimeout(() => {
            window.print();
            this.panel.panelBody.appendTo(this.panel.panelContents);
            this.panel.panelBody.css({
                position: '',
                top: '',
                left: '',
                width: '',
                'z-index': '',
                height: 'calc(100% - 38px)'
            });
            this.setSize();
            this.tableOptions.api.setGridAutoHeight(false);
        }, 650);
    }

    setSize() {
        if (this.maximized) {
            this.panel.element[0].classList.add('full');
        } else {
            this.panel.element[0].classList.remove('full');
        }
        this.panel.panelContents.css({
            margin: 0,
            padding: '0px 16px 16px 16px'
        });
    }

    isMobile(): boolean {
        return $('.rv-small').length > 0 || $('.rv-medium').length > 0;
    }

    /**
     * Auto size all columns but check the max width
     * Note: Need a custom function here since setting maxWidth prevents
     *       `sizeColumnsToFit()` from filling the entire panel width
    */
    autoSizeToMaxWidth(columns?: Array<any>) {
        const maxWidth = 400;
        columns = columns ? columns : this.tableOptions.columnApi.getAllColumns();
        this.tableOptions.columnApi.autoSizeColumns(columns);
        columns.forEach(c => {
            if (c.actualWidth > maxWidth) {
                this.tableOptions.columnApi.setColumnWidth(c, maxWidth);
            }
        });
    };

    /**
     * Check if columns don't take up entire grid width. If not size the columns to fit.
     */
    sizeColumnsToFitIfNeeded() {
        const columns = this.tableOptions.columnApi.getAllDisplayedColumns();
        const panel = this.tableOptions.api.gridPanel;
        const availableWidth = panel.getWidthForSizeColsToFit();
        const usedWidth = panel.columnController.getWidthOfColsInList(columns);
        if (usedWidth < availableWidth) {
            const symbolCol = columns.find(c => c.colId === 'zoom');
            if (columns.length === 3) {
                symbolCol.maxWidth = undefined;
            } else {
                symbolCol.maxWidth = 40;
            }
            this.tableOptions.api.sizeColumnsToFit();
        }
    }

    get id(): string {
        this._id = this._id ? this._id : 'fancyTablePanel-' + Math.floor(Math.random() * 1000000 + 1) + Date.now();
        return this._id;
    }

    get header(): any[] {
        this.angularHeader();

        const menuBtn = new this.panel.container(MENU_TEMPLATE);

        const closeBtn = new this.panel.button('X');

        const searchBar = new this.panel.container(SEARCH_TEMPLATE);

        const clearFiltersBtn = new this.panel.container(CLEAR_FILTERS_TEMPLATE);

        const columnVisibilityMenuBtn = new this.panel.container(COLUMN_VISIBILITY_MENU_TEMPLATE);

        const mobileMenuBtn = new this.panel.container(MOBILE_MENU_BTN_TEMPLATE);

        if (this.configManager.globalSearchEnabled) {
            this.mobileMenuScope.searchEnabled = true;
            return [mobileMenuBtn, searchBar, columnVisibilityMenuBtn, clearFiltersBtn, menuBtn, closeBtn]
        }
        else {
            this.mobileMenuScope.searchEnabled = false;
            return [mobileMenuBtn, columnVisibilityMenuBtn, clearFiltersBtn, menuBtn, closeBtn];
        }
    }

    angularHeader() {
        const that = this;
        this.mapApi.agControllerRegister('SearchCtrl', function () {

            that.searchText = that.configManager.defaultGlobalSearch;
            this.searchText = that.searchText;
            this.updatedSearchText = function () {
                that.tableOptions.api.setQuickFilter(that.searchText);
                that.panelRowsManager.quickFilterText = that.searchText;
                that.tableOptions.api.selectAllFiltered();
                that.panelStatusManager.getFilterStatus();
                that.tableOptions.api.deselectAllFiltered();
            };
            this.clearSearch = function () {
                that.searchText = '';
                this.searchText = that.searchText;
                this.updatedSearchText();
                that.panelStatusManager.getFilterStatus();
            };
        });

        this.mapApi.agControllerRegister('MenuCtrl', function () {
            this.appID = that.mapApi.id;
            this.maximized = that.maximized ? 'true' : 'false';
            this.showFilter = !!that.tableOptions.floatingFilter;

            // sets the table size, either split view or full height
            // saves the set size to PanelStateManager
            this.setSize = function (value) {
                that.panelStateManager.maximized = value === 'true' ? true : false;
                !that.maximized ? that.mapApi.mapI.externalPanel(undefined) : that.mapApi.mapI.externalPanel($('#enhancedTable'));
                that.maximized = value === 'true' ? true : false;
                that.setSize();
                that.panelStatusManager.getScrollRange();
            };

            // print button has been clicked
            this.print = function () {
                that.onBtnPrint();
            };

            // export button has been clicked
            this.export = function () {
                that.onBtnExport();
            };

            // Hide filters button has been clicked
            this.toggleFilters = function () {
                that.tableOptions.floatingFilter = this.showFilter;
                that.tableOptions.api.refreshHeader();
            };
        });

        this.mapApi.agControllerRegister('ClearFiltersCtrl', function () {
            // clear all column filters
            this.clearFilters = function () {

                const columns = Object.keys(that.tableOptions.api.getFilterModel());
                let newFilterModel = {};

                // go through the columns in the current filter model
                // save columns that have static filters
                // because static filters remain intact even on clear all filters
                let preservedColumns = columns.map(column => {
                    const columnConfigManager = new ColumnConfigManager(that.configManager, column);
                    if (columnConfigManager.isFilterStatic) {
                        newFilterModel[column] = that.tableOptions.api.getFilterModel()[column];
                        return column;
                    }
                });

                newFilterModel = newFilterModel !== {} ? newFilterModel : null;

                that.tableOptions.api.setFilterModel(newFilterModel);
            };

            // determine if any column filters are present
            this.anyFilters = function () {
                return that.tableOptions.api.isAdvancedFilterPresent();
            };
        });

        this.mapApi.agControllerRegister('ColumnVisibilityMenuCtrl', function () {
            this.columns = that.tableOptions.columnDefs;
            this.columnVisibilities = this.columns
                .filter(element => element.headerName)
                .map(element => {
                    return ({ id: element.field, title: element.headerName, visibility: element.visibility })
                });

            // toggle column visibility
            this.toggleColumn = function (col) {
                col.visibility = !col.visibility;
                that.tableOptions.columnApi.setColumnVisible(col.id, col.visibility);

                // on showing a column resize to autowidth then shrink columns that are too wide
                if (col.visibility) {
                    that.autoSizeToMaxWidth();
                }

                // fit columns widths to table if there's empty space
                that.sizeColumnsToFitIfNeeded();
            };
        });

        this.mapApi.agControllerRegister('MobileMenuCtrl', function () {
            that.mobileMenuScope.visible = false;
            that.mobileMenuScope.sizeDisabled = true;

            this.toggleMenu = function () {
                that.mobileMenuScope.visible = !that.mobileMenuScope.visible;
            };
        });
    }
}

export interface PanelManager {
    panel: any;
    mapApi: any;
    tableContent: JQuery<HTMLElement>;
    _id: string;
    currentTableLayer: any;
    maximized: boolean;
    tableOptions: any;
    legendBlock: any;
    panelRowsManager: PanelRowsManager;
    panelStatusManager: PanelStatusManager;
    lastFilter: HTMLElement;
    gridBody: HTMLElement;
    configManager: any;
    mobileMenuScope: MobileMenuScope;
    recordCountScope: RecordCountScope
    panelStateManager: PanelStateManager;
    searchText: string;
}

interface EnhancedJQuery extends JQuery {
    link: any;
}

interface MobileMenuScope {
    visible: boolean;
    searchEnabled: boolean;
    sizeDisabled: boolean;
}

interface RecordCountScope {
    scrollRecords: string;
    filterRecords: string;
}

PanelManager.prototype.maximized = false;
