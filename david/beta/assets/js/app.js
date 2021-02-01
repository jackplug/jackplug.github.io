var app = {
    canRun: function () {
        return window.fetch && 'content' in document.createElement('template');
    },
    process: function (data) {
        console.log(data);
    },
    data: function (callback) {
        fetch('items.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                callback(json);
            })
            .catch(function () {
                callback({});
            });
    },
    init: function () {
        if (!app.canRun()) {
            alert('Fetch API and/or Content Template is not supported in your browser');
            return;
        }

        app.data(app.process);
    }
};

app.init();
