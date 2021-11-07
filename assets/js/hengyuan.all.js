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
            var str = url.substr(1);
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
    }
};
hyRequest.init();

var hyDialog = {
    close: function () {
        $("button[data-dismiss='modal']").trigger("click");
    }
};

var hyDataGrid = {
    where: {},
    page: 1,
    limit: 15,
    cols: {},
    load: function (url, id) {
    },
    getCols: function () {
        var tables = $("table[data-grid='1']");
        var
    }
};