var hyRequest = {
    post: function (url, data, callback) {
        $.ajax({
            type: "POST",
            url: url,
            dataType: "json",
            async: false,
            data: data,
            success: callback
        })
    },
    get: function (url, data, callback) {
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            async: false,
            data: data,
            success: callback
        })
    },
    params: {},
    getParams: function () {
        var url = location.search; //获取url中"?"符后的字串  
        var params = new Object();
        if (url.indexOf("?") !== -1) {
            var str = url.substring(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                var tmp = strs[i].split("=");
                params[tmp[0]] = unescape(tmp[1]);
            }
        }

        return params;
    },
    init: function () {
        this.params = this.getParams();
        return this;
    }
};

var hyDialog = {
    close: function () {
        $("button[data-dismiss='modal']").trigger("click");
    }
};

var hyDatagrid = {
    where: {},
    page: 1,
    limit: 15,
    fields: [],
    eleId: ".hy-datagrid",
    datagridId: "1",
    url: null,
    init: function (datagridId = "1") {
        if (datagridId) {
            this.datagridId = datagridId;
        }

        var eleId = this.eleId + "[datagrid-id='" + this.datagridId + "']";
        this.url = $(eleId).attr("data-url") ? $(eleId).attr("data-url") : this.url;
        this.limit = $(eleId).attr("data-page-limit") ? $(eleId).attr("data-page-limit") : this.limit;
        this.fields = this.getFields();//console.log(this);
        return this;
    },
    setDatagridId: function (datagridId) {
        this.dataGridId = datagridId;
        return this;
    },
    getFields: function () {
        var eleId = this.eleId + "[datagrid-id='" + this.datagridId + "']";
        var result = [];
        var fields = $(eleId + " thead th");
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var item = {};
            var attrs = field.attributes;
            for (var j = 0; j < attrs.length; j++) {
                var attrName = attrs[j].name;
                var attrValue = attrs[j].value;
                if (attrName.indexOf("data-") === 0) {
                    item[attrName.substring(5)] = attrValue;
                }
            }
            result.push(item);
        }
        return result;
    },
    load: function (url = null, data = {}) {
        var eleId = this.eleId + "[datagrid-id='" + this.datagridId + "']";
        if (url === null) {
            url = this.url;
        }
        data.page = (typeof (data.page) === "undefined") ? this.page : data.page;
        data.limit = (typeof (data.limit) === "undefined") ? this.limit : data.limit;
        var that = this;
        hyRequest.post(url, data, function (res) {
            var data = res.data;
            var rows = data.rows;
            var html = '';
            for (var i = 0; i < rows.length; i++) {
                var shtml = '<tr>';
                for (var j = 0; j < that.fields.length; j++) {
                    var shtml2 = '<td>';
                    var field = that.fields[j];
                    var type = field.type;
                    var name = field.name;
                    var text = rows[i][field.name];
                    // console.log(rows[i]);
                    // console.log(field.name);
                    // console.log(rows[i][field.name]);
                    // return;
                    switch (field.type) {
                        case "func":
                            var onload = field.onload;
                            shtml2 += eval(onload + "(rows[i], i)") + "";
                            break;
                        case "checkbox":
                            shtml2 += '<input type="checkbox" class="id" name="' + field.name + '" value="' + text + '" />';
                            break;
                        case "switch":
                            var onchange = typeof (field.onchange) === "undefined" ? false : field.onchange;
                            shtml2 += '<div class="switch"><input type="checkbox"';
                            if (parseInt(text)) {
                                shtml2 += ' checked';
                            }
                            if (onchange) {
                                shtml2 += ' onchange="' + onchange + '"';
                            } else {
                                shtml2 += ' readonly';
                            }
                            shtml2 += '></div>';
                            break;
                        case "normal":
                        default:
                            shtml2 += text;
                            break;
                    }
                    shtml2 += '</td>';
                    shtml += shtml2;
                }

                shtml += '</tr>';

                html += shtml;
            }

            // console.log(html);
            $(eleId + " tbody").html(html);

            hyPagination.setDatagrid(that).render(parseInt(data.total), parseInt(data.page), parseInt(data.limit));
        });
    },
};

var hyPagination = {
    eleId: ".pager",
    datagridId: "1",
    // url: "",
    setDatagrid: function (datagrid) {
        console.log(datagrid);
        this.datagridId = datagrid.datagridId;
        // this.url = datagrid.url;
        return this;
    },
    render: function (total, curPage, limit) {
        var eleId = this.eleId + "[for-datagrid-id='" + this.datagridId + "']";
        var html = prevPage = nextPage = "";
        var totalPages = parseInt((total + limit - 1) / limit);
        if (totalPages === 1) { // 就一页，那还渲染个P
            return html;
        }
        if (curPage === 1) {
            prevPage = '<li class="disabled"><span>&laquo;</span></li>';
        } else {
            prevPage = '<li><a href="javascript:hy.datagrid.load({page:' + (curPage - 1) + '});">&laquo;</a></li>';
        }

        if (curPage === totalPages) {
            nextPage = '<li class="disabled"><span>&raquo;</span></li>';
        } else {
            nextPage = '<li><a href="javascript:hyDatagrid.load({page:' + (curPage + 1) + '});">&laquo;</a></li>';
        }

        for (var i = 1; i <= totalPages; i++) {
            html += '<li';
            if (i === curPage) {
                html += ' class="active"';
            }
            html += '><a href="javascript:hyPagination.toPage(' + i + ',' + limit + ');">' + i + '</a></li>';
        }

        // console.log(html);
        $(eleId).html(html);
    },
    toPage: function (toPage, limit) {
        hyDatagrid.init(this.datagridId).load(null, { "page": toPage, "limit": limit });
    }
};


$(function () {
    var hy = {
        request: hyRequest,
        dialog: hyDialog,
        datagrid: hyDatagrid,
        pagination: hyPagination,
    };

    hy.request.init();
    hy.datagrid.init();
    hy.datagrid.load();
});