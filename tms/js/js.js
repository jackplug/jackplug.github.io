// @TODOS:
//     - styling
//     - convert bytes size value to MB/GB
//     - add option to *attempt* to remove 'adult' results

const tmsUrl = 'http://localhost:50123/search/';
const tmsForm = document.getElementById('tmsForm');
const tmsResults = document.getElementById('tmsResults');

let tmsCurrentResultsPage = 1;

function tmsProcessSearch(e) {
    e.preventDefault();

    let searchContent = {};
    let formData = new FormData(tmsForm);
    for (var entry of formData.entries()) {
        searchContent[entry[0]] = entry[1];
    }
    tmsFetchResults(searchContent);
}

function tmsFetchResults(search) {
    let query = '?' + new URLSearchParams(search).toString();
    let req = new XMLHttpRequest();
    try {
        req.responseType = 'json';
        req.open('GET', tmsUrl + query, true);
        req.onload  = function() {
            var jsonResponse = req.response;
            tmsRenderResults(jsonResponse);
        };
        req.send(null);
    } catch (error) {
        tmsRenderResults(error, true);
    }
}

function tmsRenderResults(content, error) {
    let html = '';

    if (error) {
        html = `<li class="result-item result-error">
                    ${content}
                </li>`;
    } else {
        // console.log(content);
        console.log(content.length);
        for (i in content) {
            console.log(content[i]);
            let theDate = new Date(content[i].uploaded_at);
            let htmlSegment = `<li class="result-item">
                                <strong class="result-item-name">${content[i].name}</strong>
                                <span class="result-item-size">Size: ${content[i].size}</span><br>
                                <span class="result-item-seeders">Seeders: ${content[i].seeders}</span> / <span class="result-item-leechers">Leechers: ${content[i].leechers}</span><br>
                                <span class="result-item-source">Source: <a href="${content[i].canonical_url}">${content[i].source}</a></span><br>
                                <span class="results-item-uploaded-at">Uploaded: ${theDate}</span>
                            </li>`;
            html += htmlSegment
        }
    }

    tmsResults.innerHTML = html;
}

tmsForm.addEventListener('submit', tmsProcessSearch);

