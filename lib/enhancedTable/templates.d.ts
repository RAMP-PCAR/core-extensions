export declare const SEARCH_TEMPLATE = "\n<div ng-controller=\"SearchCtrl as ctrl\" class=\"rv-table-search table-control\">\n    <md-input-container md-no-float class=\"rv-table-search table-control\">\n        <input\n            ng-model=\"ctrl.searchText\"\n            ng-keyup=\"ctrl.updatedSearchText()\"\n            placeholder=\"{{ 'plugins.enhancedTable.search.placeholder' | translate }}\"/>\n    </md-input-container>\n    <md-icon ng-if=\"ctrl.searchText.length > 2\" ng-click=\"ctrl.clearSearch()\" md-svg-src=\"navigation:close\"></md-icon>\n    <md-icon ng-if=\"ctrl.searchText.length <= 2\" md-svg-src=\"action:search\">\n        <md-tooltip>{{ 'plugins.enhancedTable.search.placeholder' | translate }}</md-tooltip>\n    </md-icon>\n    <span class=\"rv-button-divider\"></span>\n</div>\n";
export declare const CLEAR_FILTERS_TEMPLATE = "\n<div class=\"table-control\">\n    <md-button\n        ng-controller=\"ClearFiltersCtrl as ctrl\"\n        aria-label=\"{{ 'plugins.enhancedTable.table.filter.clear' | translate }}\"\n        class=\"md-icon-button black\"\n        rv-help=\"table-clear-button\"\n        ng-click=\"ctrl.clearFilters()\"\n        ng-disabled=\"ctrl.noActiveFilters()\">\n        <md-tooltip>{{ 'plugins.enhancedTable.table.filter.clear' | translate }}</md-tooltip>\n        <md-icon md-svg-src=\"community:filter-remove\"></md-icon>\n    </md-button>\n</div>\n";
export declare const APPLY_TO_MAP_TEMPLATE = "\n<div class=\"table-control\">\n    <md-button\n        ng-controller=\"ApplyToMapCtrl as ctrl\"\n        aria-label=\"{{ 'plugins.enhancedTable.table.filter.apply' | translate }}\"\n        class=\"md-icon-button black\"\n        ng-click=\"ctrl.applyToMap()\"\n        ng-disabled=\"!ctrl.filtersChanged()\">\n        <md-tooltip>{{ 'plugins.enhancedTable.table.filter.apply' | translate }}</md-tooltip>\n        <md-icon md-svg-src=\"action:map-refresh\"></md-icon>\n    </md-button>\n</div>\n";
export declare const COLUMN_VISIBILITY_MENU_TEMPLATE = "\n<md-menu-bar class=\"table-control\" ng-controller=\"ColumnVisibilityMenuCtrl as ctrl\">\n    <md-menu md-position-mode=\"target-right target\">\n        <md-button\n            aria-label=\"Menu\"\n            class=\"md-icon-button black\"\n            ng-click=\"$mdOpenMenu($event)\">\n            <md-tooltip>{{ 'plugins.enhancedTable.table.hideColumns' | translate }}</md-tooltip>\n            <md-icon md-svg-src=\"community:format-list-checks\"></md-icon>\n        </md-button>\n        <md-menu-content class=\"rv-menu rv-dense\">\n            <md-menu-item ng-repeat=\"col in ctrl.columnVisibilities\">\n                <md-button ng-click=\"ctrl.toggleColumn(col)\" aria-label=\"{{ col.title }}\" md-prevent-menu-close=\"md-prevent-menu-close\">\n                    <span style='overflow-wrap:normal'>{{col.title}}</span>\n                    <md-icon md-svg-icon=\"action:done\" ng-if=\"col.visibility\"></md-icon>\n                </md-button>\n            </md-menu-item>\n        </md-menu-content>\n    </md-menu>\n</md-menu-bar>\n";
export declare const MENU_TEMPLATE = "\n<md-menu-bar class=\"table-control\" ng-controller=\"MenuCtrl as ctrl\">\n    <md-menu md-position-mode=\"target-right target\">\n        <md-button\n            aria-label=\"Menu\"\n            class=\"md-icon-button black\"\n            ng-click=\"$mdOpenMenu($event)\">\n            <md-icon md-svg-src=\"navigation:more_vert\"></md-icon>\n        </md-button>\n        <md-menu-content class=\"rv-menu rv-dense\">\n            <md-menu-item type=\"radio\" ng-model=\"ctrl.maximized\" value=\"false\" ng-click=\"ctrl.setSize(ctrl.maximized)\" ng-if=\"!sizeDisabled\" rv-right-icon=\"none\">\n                {{ 'plugins.enhancedTable.menu.split' | translate }}\n            </md-menu-item>\n            <md-menu-item type=\"radio\" ng-model=\"ctrl.maximized\" value=\"true\" ng-click=\"ctrl.setSize(ctrl.maximized)\"  ng-if=\"!sizeDisabled\" rv-right-icon=\"none\">\n                {{ 'plugins.enhancedTable.menu.max' | translate }}\n            </md-menu-item>\n            <md-menu-divider class=\"rv-lg\"></md-menu-divider>\n            <md-menu-item type=\"checkbox\" ng-model=\"ctrl.filterByExtent\" ng-click=\"ctrl.filterExtentToggled()\" rv-right-icon=\"community:filter\">\n                {{ 'plugins.enhancedTable.menu.filter.extent' | translate }}\n            </md-menu-item>\n            <md-menu-item type=\"checkbox\" ng-model=\"ctrl.showFilter\" ng-click=\"ctrl.toggleFilters()\" rv-right-icon=\"community:filter\">\n                {{ 'plugins.enhancedTable.menu.filter.show' | translate }}\n            </md-menu-item>\n            <md-menu-divider></md-menu-divider>\n            <md-menu-item ng-if='ctrl.printEnabled'>\n                <md-button ng-click=\"ctrl.print()\">\n                    <md-icon md-svg-icon=\"action:print\"></md-icon>\n                    {{ 'plugins.enhancedTable.menu.print' | translate }}\n                </md-button>\n            </md-menu-item>\n            <md-menu-item>\n                <md-button ng-click=\"ctrl.export()\">\n                    <md-icon md-svg-icon=\"editor:insert_drive_file\"></md-icon>\n                    {{ 'plugins.enhancedTable.menu.export' | translate }}\n                </md-button>\n            </md-menu-item>\n        </md-menu-content>\n    </md-menu>\n</md-menu-bar>";
export declare const MOBILE_MENU_BTN_TEMPLATE = "\n<div class=\"mobile-table-control\">\n    <md-button\n        ng-controller=\"MobileMenuCtrl as ctrl\"\n        class=\"md-icon-button black\"\n        ng-click=\"ctrl.toggleMenu()\">\n        <md-icon md-svg-src=\"navigation:more_vert\"></md-icon>\n    </md-button>\n</div>";
export declare const MOBILE_MENU_TEMPLATE: string;
export declare const RECORD_COUNT_TEMPLATE = "\n<p class=\"rv-record-count\">\n    <span class=\"scrollRecords\">{{ scrollRecords }}</span> of\n    <span class=\"filterRecords\">{{ filterRecords }}</span>\n</p>";
export declare const DETAILS_TEMPLATE: (oid: any) => string;
export declare const ZOOM_TEMPLATE: (oid: any) => string;
export declare const NUMBER_FILTER_TEMPLATE: (value: any, isStatic: any) => string;
export declare const DATE_FILTER_TEMPLATE: (value: any, isStatic: any) => "<span>\n                 <md-datepicker md-placeholder=\"{{ 'plugins.enhancedTable.columnFilters.date.min' | translate }}\" ng-model='min' ng-change=\"minChanged()\" ng-disabled='true' style='opacity: 0.4'></md-datepicker>\n                 <md-datepicker md-placeholder=\"{{ 'plugins.enhancedTable.columnFilters.date.max' | translate }}\" ng-model='max' ng-change=\"maxChanged()\" ng-disabled='true' style='opacity: 0.4'></md-datepicker>\n             </span>" | "<span>\n                 <md-datepicker md-placeholder=\"{{ 'plugins.enhancedTable.columnFilters.date.min' | translate }}\" ng-model='min' ng-change=\"minChanged()\"></md-datepicker>\n                 <md-datepicker md-placeholder=\"{{ 'plugins.enhancedTable.columnFilters.date.max' | translate }}\" ng-model='max' ng-change=\"maxChanged()\"></md-datepicker>\n             </span>";
export declare const TEXT_FILTER_TEMPLATE: (value: any, isStatic: any) => string;
export declare const CUSTOM_HEADER_TEMPLATE: (displayName: string) => string;
export declare const SELECTOR_FILTER_TEMPLATE: (value: any, isStatic: any) => "<md-select placeholder=\"{{ 'plugins.enhancedTable.columnFilters.selector' | translate }}\" multiple=\"{{true}}\" md-on-close='selectionChanged() style='height: 20px; opacity: 0.4; color: lightgrey' ng-model=\"selectedOptions\" ng-disabled='true'>\n                         <md-option ng-value=\"option\" ng-repeat=\"option in options\">{{ option }}</md-option>\n                     </md-select>" | "<md-select placeholder=\"{{ 'plugins.enhancedTable.columnFilters.selector' | translate }}\" multiple=\"{{true}}\" style='height: 20px' md-on-close='selectionChanged()' ng-model=\"selectedOptions\">\n                         <md-option ng-value=\"option\" ng-repeat=\"option in options\">{{ option }}</md-option>\n                     </md-select>";
export declare const PRINT_TABLE: (title: any, cols: any, rws: any) => string;
export declare const TABLE_UPDATE_TEMPLATE = "<md-toast class=\"table-toast\">\n        <span class=\"md-toast-text flex\">{{ 'filter.default.label.outOfDate' | translate }}</span>\n        <md-button class=\"md-highlight\" ng-click=\"reloadTable()\">{{ 'filter.default.action.outOfDate' | translate }}</md-button>\n        <md-button ng-click=\"closeToast()\">{{ 'filter.default.action.close' | translate }}</md-button>\n    </md-toast>";
