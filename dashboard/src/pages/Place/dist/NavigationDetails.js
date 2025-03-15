"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var react_feather_1 = require("react-feather");
var material_1 = require("@mui/material");
var LoadingButton_1 = require("@mui/lab/LoadingButton");
var Select_1 = require("@mui/material/Select");
var Dialog_1 = require("@mui/material/Dialog");
var client_1 = require("@apollo/client");
var components_1 = require("theme/components");
var UploadFile_1 = require("components/UploadFile");
var QQMap_1 = require("components/QQMap");
var Loading_1 = require("components/Loading");
var DeleteConfirmModal_1 = require("components/Modal/DeleteConfirmModal");
var hooks_1 = require("state/application/hooks");
var styled_1 = require("pages/styled");
var GET_SCENERYSPOT = client_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  query GetSceneryspot($id: String!) {\n    sceneryspot(id: $id) {\n      id\n      name\n    }\n  }\n"], ["\n  query GetSceneryspot($id: String!) {\n    sceneryspot(id: $id) {\n      id\n      name\n    }\n  }\n"])));
var GET_CATEGORIES = client_1.gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  query GetCategories($parentId: String!) {\n    categoriesByParentID(id: $parentId) {\n      id\n      name\n      parent_id\n      has_subclass\n      status\n      sort\n    }\n  }\n"], ["\n  query GetCategories($parentId: String!) {\n    categoriesByParentID(id: $parentId) {\n      id\n      name\n      parent_id\n      has_subclass\n      status\n      sort\n    }\n  }\n"])));
var GET_SERVICE_ITEMS = client_1.gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  query GetServiceItems($sceneryspotId: String!) {\n    serviceItems(sceneryspot_id: $sceneryspotId) {\n      id\n      sceneryspot_id\n      name\n      category_id\n      address\n      images\n      coordinate\n      wxappid\n      introduction\n      expense_instruction\n      status\n    }\n  }\n"], ["\n  query GetServiceItems($sceneryspotId: String!) {\n    serviceItems(sceneryspot_id: $sceneryspotId) {\n      id\n      sceneryspot_id\n      name\n      category_id\n      address\n      images\n      coordinate\n      wxappid\n      introduction\n      expense_instruction\n      status\n    }\n  }\n"])));
var ADD_SERVICE_ITEM = client_1.gql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  mutation AddServiceItem($input: NewServiceItem!) {\n    createServiceItem(input: $input) {\n      id\n    }\n  }\n"], ["\n  mutation AddServiceItem($input: NewServiceItem!) {\n    createServiceItem(input: $input) {\n      id\n    }\n  }\n"])));
var UPDATE_SERVICE_ITEM = client_1.gql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  mutation UpdateServiceItem($input: UpdateServiceItem!) {\n    updateServiceItem(input: $input) {\n      succed\n      message\n    }\n  }\n"], ["\n  mutation UpdateServiceItem($input: UpdateServiceItem!) {\n    updateServiceItem(input: $input) {\n      succed\n      message\n    }\n  }\n"])));
var DELETE_SERVICE_ITEM = client_1.gql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  mutation UpdateServiceItem($id: ID!) {\n    updateServiceItem(input: {id: $id, status: 4}) {\n      succed\n      message\n    }\n  }\n"], ["\n  mutation UpdateServiceItem($id: ID!) {\n    updateServiceItem(input: {id: $id, status: 4}) {\n      succed\n      message\n    }\n  }\n"])));
var initialServiceItem = {
    id: undefined,
    sceneryspot_id: "",
    name: "",
    category_id: "",
    address: "",
    images: "",
    coordinate: "",
    wxappid: "",
    introduction: "",
    expense_instruction: "",
    status: 1
};
var PRINTER_CATETORY = 'fdc82fda-c76d-49b9-902e-6c86ebfa90e6';
function useSceneryspot(id) {
    var _a = react_1.useState(undefined), result = _a[0], setResult = _a[1];
    var data = client_1.useQuery(GET_SCENERYSPOT, { variables: { id: id }, fetchPolicy: "no-cache" }).data;
    react_1.useEffect(function () {
        if (data) {
            setResult(data.sceneryspot);
        }
    }, [data]);
    return result;
}
function useServiceItems(sceneryspotId) {
    var _a = react_1.useState(undefined), serviceItems = _a[0], setServiceItems = _a[1];
    var _b = client_1.useQuery(GET_SERVICE_ITEMS, { variables: { sceneryspotId: sceneryspotId }, fetchPolicy: "no-cache" }), data = _b.data, loading = _b.loading;
    react_1.useEffect(function () {
        if (data) {
            setServiceItems(data.serviceItems);
        }
    }, [data]);
    return { serviceItems: serviceItems, loading: loading };
}
function useSave(_a) {
    var value = _a.value, sceneryspotId = _a.sceneryspotId, onCompleted = _a.onCompleted;
    var add = client_1.useMutation(ADD_SERVICE_ITEM, {
        onCompleted: function () {
            onCompleted && add[1].data && onCompleted(add[1].data.createServiceItem);
        },
        refetchQueries: [
            { query: GET_SERVICE_ITEMS, variables: { sceneryspotId: sceneryspotId } },
            "GetServiceItems",
        ]
    });
    var update = client_1.useMutation(UPDATE_SERVICE_ITEM, {
        onCompleted: function () {
            onCompleted && update[1].data && onCompleted(update[1].data.updateServiceItem);
        },
        refetchQueries: [
            { query: GET_SERVICE_ITEMS, variables: { sceneryspotId: sceneryspotId } },
            "GetServiceItems",
        ]
    });
    return (value === null || value === void 0 ? void 0 : value.id) ? update : add;
}
function ServiceItemModal(_a) {
    var _b;
    var value = _a.value, categories = _a.categories, sceneryspotId = _a.sceneryspotId, defaultCategory = _a.defaultCategory, props = __rest(_a, ["value", "categories", "sceneryspotId", "defaultCategory"]);
    var onClose = props.onClose, open = props.open;
    var alert = hooks_1.useAlert();
    var _c = react_1.useState(__assign(__assign({}, initialServiceItem), { sceneryspot_id: sceneryspotId, category_id: (_b = defaultCategory === null || defaultCategory === void 0 ? void 0 : defaultCategory.id) !== null && _b !== void 0 ? _b : '' })), values = _c[0], setValues = _c[1];
    var isValid = values.name.length > 0;
    var _d = useSave({
        value: values,
        sceneryspotId: sceneryspotId,
        onCompleted: function (data) {
            if (data && onClose) {
                var succed = data.succed, message = data.message;
                if (succed && succed === false) {
                    alert({ severity: "error", text: message });
                    return;
                }
                onClose(data, "escapeKeyDown");
            }
        }
    }), save = _d[0], loading = _d[1].loading;
    react_1.useEffect(function () {
        var _a;
        if (open) {
            if (value) {
                setValues(__assign({}, value));
            }
            else {
                setValues(__assign(__assign({}, initialServiceItem), { sceneryspot_id: sceneryspotId, category_id: (_a = defaultCategory === null || defaultCategory === void 0 ? void 0 : defaultCategory.id) !== null && _a !== void 0 ? _a : '' }));
            }
        }
    }, [open, value]);
    var handleClose = function (event) { return function () {
        onClose && onClose(event, "escapeKeyDown");
    }; };
    var handleChange = function (prop) { return function (event) {
        var _a;
        setValues(__assign(__assign({}, values), (_a = {}, _a[prop] = event.target.value, _a)));
    }; };
    var handleUpload = function (prop) { return function (value) {
        var _a;
        setValues(__assign(__assign({}, values), (_a = {}, _a[prop] = value, _a)));
    }; };
    var handleCategory = function (event) {
        setValues(__assign(__assign({}, values), { category_id: event.target.value }));
    };
    var handleOK = function () {
        var id = values.id, sceneryspot_id = values.sceneryspot_id, name = values.name, category_id = values.category_id, address = values.address, images = values.images, coordinate = values.coordinate, introduction = values.introduction, expense_instruction = values.expense_instruction, status = values.status;
        var input = values.id ? {
            id: id,
            name: name,
            category_id: category_id,
            address: address,
            images: images !== null && images !== void 0 ? images : "",
            coordinate: coordinate,
            introduction: introduction,
            expense_instruction: expense_instruction,
            status: status
        } : {
            sceneryspot_id: sceneryspot_id,
            name: name,
            category_id: category_id,
            address: address,
            images: images !== null && images !== void 0 ? images : "",
            coordinate: coordinate,
            introduction: introduction,
            expense_instruction: expense_instruction,
            status: status
        };
        save({ variables: { input: input } })["catch"](function (e) { return alert({ severity: "error", text: e.message }); });
    };
    var lat, lng;
    if (values.coordinate && values.coordinate.length > 0) {
        var coordinate = values.coordinate.split(',');
        lat = coordinate[0];
        lng = coordinate[1];
    }
    return (react_1["default"].createElement(Dialog_1["default"], __assign({ fullWidth: true, maxWidth: "md" }, props),
        react_1["default"].createElement(material_1.DialogTitle, null, value ? "修改导航" : "添加导航"),
        react_1["default"].createElement(material_1.DialogContent, { sx: {
                "& .MuiFormControl-root": {
                    width: "100%",
                    ":not(:first-of-type)": {
                        mt: 2
                    },
                    "& .MuiTypography-root": {
                        mb: 1
                    }
                }
            } },
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "名称"),
                react_1["default"].createElement(styled_1.FormInput, { fullWidth: true, id: "name-input", value: values.name, onChange: handleChange("name") })),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "分类"),
                react_1["default"].createElement(Select_1["default"], { labelId: "category-select-label", id: "category-select", value: values.category_id, size: "small", variant: "outlined", notched: true, onChange: handleCategory, sx: {
                        "& .MuiOutlinedInput-notchedOutline": {
                            top: 0,
                            "& > legend": {
                                float: "left !important"
                            }
                        }
                    } }, categories.map(function (v) { return (react_1["default"].createElement(material_1.MenuItem, { key: v.id, value: v.id }, v.name)); }))),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "地址"),
                react_1["default"].createElement(styled_1.FormInput, { fullWidth: true, id: "address-input", value: values.address, onChange: handleChange("address") })),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "商家小程序 ID"),
                react_1["default"].createElement(styled_1.FormInput, { fullWidth: true, id: "wxappid-input", value: values.wxappid, onChange: handleChange("wxappid") })),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, values.category_id === PRINTER_CATETORY ? "盖章机号" : "费用"),
                react_1["default"].createElement(styled_1.FormInput, { fullWidth: true, id: "expense-instruction-input", value: values.expense_instruction, onChange: handleChange("expense_instruction") })),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "照片"),
                react_1["default"].createElement(UploadFile_1["default"], { preview: true, value: values.images, onChange: handleUpload("images") })),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "坐标"),
                react_1["default"].createElement(styled_1.FormInput, { fullWidth: true, id: "coordinate-input", value: values.coordinate, sx: { mb: 2 }, onChange: handleChange("coordinate") }),
                react_1["default"].createElement(QQMap_1["default"], { lat: lat, lng: lng, overlay: 'marker', onChange: function (coordinate) { return setValues(__assign(__assign({}, values), { coordinate: coordinate })); } })),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "排序"),
                react_1["default"].createElement(styled_1.FormInput, { fullWidth: true, id: "sort-input", value: 1 }),
                react_1["default"].createElement(material_1.FormHelperText, { id: "display-order-text" }, "请填写整数，数值越大越靠前。默认值为1")),
            react_1["default"].createElement(material_1.FormControl, { variant: "standard" },
                react_1["default"].createElement(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 } }, "介绍"),
                react_1["default"].createElement(styled_1.FormInput, { fullWidth: true, multiline: true, rows: 4, id: "introduction-input", value: values.introduction, onChange: handleChange('introduction') }))),
        react_1["default"].createElement(material_1.DialogActions, null,
            react_1["default"].createElement(material_1.Button, { onClick: handleClose({}) }, "取消"),
            react_1["default"].createElement(LoadingButton_1["default"], { disableElevation: true, variant: "contained", disabled: !isValid, loading: loading, onClick: handleOK }, "确定"))));
}
function PlaceNavigationDetails(_a) {
    var id = _a.match.params.id;
    var alert = hooks_1.useAlert();
    var _b = client_1.useQuery(GET_CATEGORIES, { variables: { parentId: "7aa5306e-c091-434a-a6d8-ce6bb672300d" }, fetchPolicy: "no-cache" }), data = _b.data, loading = _b.loading;
    var sceneryspot = useSceneryspot(id);
    var serviceItems = useServiceItems(id).serviceItems;
    var categories = react_1.useMemo(function () {
        if (data) {
            return data.categoriesByParentID
                .map(function (v) { return (__assign({}, v)); })
                .sort(function (a, b) { return a.sort - b.sort; });
        }
        return [];
    }, [data]);
    var categoryNames = react_1.useMemo(function () {
        return Object.assign.apply(Object, __spreadArrays([{}], categories.map(function (v) {
            var _a;
            return (_a = {}, _a[v.id] = v.name, _a);
        })));
    }, [categories]);
    var _c = react_1.useState({
        category: undefined,
        value: undefined,
        open: false
    }), values = _c[0], setValues = _c[1];
    var handleChange = function (category) { return function () {
        setValues(__assign(__assign({}, values), { category: values.category && values.category.id === category.id ? undefined : category }));
    }; };
    var handleAdd = function () {
        setValues(__assign(__assign({}, values), { value: undefined, open: true }));
    };
    var handleUpdate = function (value) { return function () {
        setValues(__assign(__assign({}, values), { value: value, open: true }));
    }; };
    var handleClose = function (event) {
        setValues(__assign(__assign({}, values), { value: undefined, open: false }));
    };
    var _d = react_1.useState({ open: false }), deleteValues = _d[0], setDeleteValues = _d[1];
    var deleteServiceItem = client_1.useMutation(DELETE_SERVICE_ITEM, {
        refetchQueries: [
            { query: GET_SERVICE_ITEMS, variables: { sceneryspotId: id } },
            "GetServiceItems",
        ]
    })[0];
    var handleDelete = function (value) { return function () {
        var id = value.id, name = value.name;
        if (id) {
            setDeleteValues({ value: { id: id, name: name }, open: true });
        }
    }; };
    var handleDeleteClose = function (event) {
        setDeleteValues({ value: undefined, open: false });
    };
    var handleDeleteConfirm = function (value) {
        if (value) {
            var id_1 = value.id;
            deleteServiceItem({ variables: { id: id_1 } })
                .then(function (_a) {
                var data = _a.data;
                if (data) {
                    var _b = data.updateServiceItem, succed = _b.succed, message = _b.message;
                    if (succed) {
                        alert({ severity: "success", text: '已成功删除数据！' });
                        return;
                    }
                    alert({ severity: "error", text: message });
                }
            })["catch"](function (e) { return alert({ severity: "error", text: e.message }); })["finally"](function () { return setDeleteValues({ value: undefined, open: false }); });
        }
        else {
            setDeleteValues({ value: undefined, open: false });
        }
    };
    return (react_1["default"].createElement(components_1.PageWrapper, null,
        react_1["default"].createElement(styled_1.PageHeader, { container: true },
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 4 },
                react_1["default"].createElement(material_1.Breadcrumbs, { "aria-label": "breadcrumb" },
                    react_1["default"].createElement(material_1.Typography, { color: "text.primary" }, "景区管理"),
                    react_1["default"].createElement(material_1.Link, { underline: "hover", color: "inherit", href: "#/place-navigation" }, "景区导航")),
                sceneryspot && (react_1["default"].createElement(styled_1.Title, { variant: 'h1' }, sceneryspot.name))),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 8, sx: { display: "flex", gap: "0.5rem", alignItems: "flex-end", justifyContent: "end" } },
                react_1["default"].createElement(material_1.Button, { disableElevation: true, variant: "contained", startIcon: react_1["default"].createElement(react_feather_1.Plus, null), onClick: handleAdd }, "添加导航"))),
        react_1["default"].createElement(ServiceItemModal, __assign({}, values, { categories: categories, sceneryspotId: id, defaultCategory: values.category, onClose: handleClose })),
        react_1["default"].createElement(DeleteConfirmModal_1["default"], __assign({}, deleteValues, { onClose: handleDeleteClose, onConfirm: handleDeleteConfirm })),
        categories && categories.length > 0 && (react_1["default"].createElement(material_1.Grid, { container: true, sx: {
                boxSizing: 'border-box',
                display: 'flex',
                flexFlow: 'row wrap',
                width: '100%',
                padding: '16px'
            } },
            react_1["default"].createElement(material_1.Stack, { direction: "row", spacing: 2 }, categories.map(function (v) { return (react_1["default"].createElement(material_1.Chip, { key: v.id, label: v.name, color: values.category && values.category.id === v.id ? 'primary' : undefined, onClick: handleChange(v) })); })))),
        !loading ? (react_1["default"].createElement(material_1.Card, { sx: {
                backgroundColor: "rgb(255, 255, 255)",
                color: "rgba(0, 0, 0, 0.87)",
                transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                overflow: "hidden",
                borderRadius: "20px",
                margin: "15px",
                boxShadow: "rgb(90 114 123 / 11%) 0px 7px 30px 0px",
                padding: "24px"
            } },
            react_1["default"].createElement(material_1.TableContainer, { component: material_1.Paper, sx: { boxShadow: 'none' } },
                react_1["default"].createElement(material_1.Table, null,
                    react_1["default"].createElement(material_1.TableHead, null,
                        react_1["default"].createElement(material_1.TableRow, null,
                            react_1["default"].createElement(material_1.TableCell, null, "名称"),
                            react_1["default"].createElement(material_1.TableCell, null, "分类"),
                            react_1["default"].createElement(material_1.TableCell, null, "坐标"),
                            react_1["default"].createElement(material_1.TableCell, null, "图片"),
                            react_1["default"].createElement(material_1.TableCell, null, ""))),
                    react_1["default"].createElement(material_1.TableBody, null, serviceItems && serviceItems.filter(function (v) { return !values.category || v.category_id === values.category.id; }).map(function (row) { return (react_1["default"].createElement(material_1.TableRow, { key: row.id, sx: { '&:last-child td, &:last-child th': { border: 0 } } },
                        react_1["default"].createElement(material_1.TableCell, { scope: "row", component: "th" },
                            react_1["default"].createElement(material_1.Typography, { variant: 'subtitle2' }, row.name)),
                        react_1["default"].createElement(material_1.TableCell, { scope: "row", component: "th" },
                            react_1["default"].createElement(material_1.Typography, { variant: 'subtitle2' }, categoryNames[row.category_id])),
                        react_1["default"].createElement(material_1.TableCell, { scope: "row", component: "th" },
                            react_1["default"].createElement(material_1.Typography, { variant: 'subtitle2' }, row.coordinate)),
                        react_1["default"].createElement(material_1.TableCell, { scope: "row", component: "th" },
                            react_1["default"].createElement(material_1.CardMedia, { sx: { width: 96 }, image: row.images, title: row.name })),
                        react_1["default"].createElement(material_1.TableCell, { scope: "row", sx: { textAlign: "right" } },
                            react_1["default"].createElement(material_1.IconButton, { onClick: handleUpdate(row) },
                                react_1["default"].createElement(react_feather_1.Edit, { size: 20 })),
                            react_1["default"].createElement(material_1.IconButton, { onClick: handleDelete(row) },
                                react_1["default"].createElement(react_feather_1.Trash2, { size: 20 }))))); })))))) : (react_1["default"].createElement(Loading_1["default"], null))));
}
exports["default"] = PlaceNavigationDetails;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
