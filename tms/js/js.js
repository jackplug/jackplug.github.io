// @TODOS:
//     - styling
//     ~- convert bytes size value to MB/GB~ OK DONE
//     - add option to *attempt* to remove 'adult' results (DEFAULT TO REMOVE!) - PARTIALLY DONE (check '18' words)
//     - search (partial or full word) -- ??
//     - search (check for ' '/'.'/'-'/'_' separators)
//     - pagination - BASIC PAGING OK

const omdbApiKey = '#######';
const obdbApiUrl = 'http://www.omdbapi.com/'; // Usage ?s=moon knight&apikey= - see https://www.omdbapi.com/
const tmsUrl = 'http://localhost:50123/search/';
const tmsForm = document.getElementById('tmsForm');
const tmsLoadMore = document.getElementById('tmsLoadMore');
const tmsResults = document.getElementById('tmsResults');

let tmsCurrentResultsPage = 1;
// let tmsFirstResultName = null;
let tmsResultsStore = [];

let tmsSettings = {
    ageCheck: document.getElementById('tmsAgeCheckbox')
};

let tmsNoAdultResults = tmsSettings.ageCheck.checked;

function isAdult(name) {
    const filters = [
        'xxx',
        'nude',
        'porn',
        'fuck',
        'hardcore',
        'ass',
        'cock',
        'squirt',
        'milf',
        'carnage'
    ];

    for (i in filters) {
        let filterRegExp = new RegExp(filters[i], 'i');

        if (filterRegExp.test(name)) {
            return true;
        }
    }

    return false;
}

function tmsRoundSize(size) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (size === 0) {
        return 'n/a';
    }

    let i = parseInt(Math.floor(Math.log(size) / Math.log(1024)), 10);
    if (i === 0) {
        return `${size} ${units[i]})`;
    }

    return `${(size / (1024 ** i)).toFixed(1)} ${units[i]}`
}

function tmsProcessSearch(e) {
    if (e.type === 'submit') {
        e.preventDefault();
        tmsCurrentResultsPage = 1;
    }

    let searchContent = {};
    let formData = new FormData(tmsForm);
    for (let entry of formData.entries()) {
        if (entry[0].indexOf('Checkbox') > -1) {
            continue;
        }
        searchContent[entry[0]] = entry[1];
    }

    tmsFetchResults(searchContent);
}

function tmsFetchResults(search) {
    search.page = tmsCurrentResultsPage;
    let query = '?' + new URLSearchParams(search).toString() + '&page=' + tmsCurrentResultsPage;
    let req = new XMLHttpRequest();
    try {
        req.responseType = 'json';
        req.open('GET', tmsUrl + query, true);
        req.onload  = function() {
            let jsonResponse = req.response;
            tmsRenderResults(jsonResponse);

            tmsCurrentResultsPage++;
        };
        req.send(null);
    } catch (error) {
        tmsRenderResults(error, true);
    }
}

function tmsRenderResults(content, error) {
    let html = '';

    if (error) {
        html = `<div class="result-item result-error">
                    <dt>Error</dt>
                    <dd>${content}</dd>
                </div>`;
    } else {
        if (content.length) {
            content
                .filter(item => !(tmsNoAdultResults && isAdult(item.name)))
                .forEach(item => {
                    let htmlSegment = `<div class="result-item">
                                        <dt class="result-item-name">${item.name}</dt>
                                        <dd class="result-item-size">Size: ${parseInt(item.size, 10) > 1024 ? tmsRoundSize(item.size) : item.size}</dd>
                                        <dd class="result-item-magnet-url"><a href="${item.magnet_url}">Magnet</a></dd>
                                        <dd class="result-item-share-info">
                                            <span class="result-item-seeders">Seeders: ${item.seeders}</span> /
                                            <span class="result-item-leechers">Leechers: ${item.leechers}</span>
                                        </dd>
                                        <dd class="result-item-source">Source: <a href="${item.canonical_url}">${item.source}</a></dd>
                                        <dd class="results-item-uploaded-at">Uploaded: ${new Date(item.uploaded_at)}</dd>
                                    </div>`;
                    html += htmlSegment;
                });
        } else {
            html = `<div class="result-item result-empty">
                        <dt>No results</dt>
                    </div>`;
        }
    }

    tmsResults.innerHTML = html;
}

tmsForm.addEventListener('submit', tmsProcessSearch);
tmsLoadMore.addEventListener('click', tmsProcessSearch);
tmsSettings.ageCheck.addEventListener('click', function () {
    tmsNoAdultResults = tmsSettings.ageCheck.checked;
});

