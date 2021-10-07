var app = {
    content: document.getElementById('mainContent'),
    template: document.getElementById('flashItem'),
    canRun: function () {
        return window.fetch && 'content' in document.createElement('template');
    },
    process: function (data) {
        console.log(data);
        var content = !!app.content ? app.content : document.getElementById('mainContent'),
            template = !!app.template ? app.template : document.getElementById('flashItem');

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
