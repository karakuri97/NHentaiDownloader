chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let url = tabs[0].url;
    if (url.match('https://nhentai.net/g/[0-9]*/[/0-9a-z]*')) {
        let id = url.replace("https://nhentai.net/g/", "").split('/')[0];
        let http = new XMLHttpRequest();
        http.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let json = JSON.parse(this.responseText);
                    document.getElementById('action').innerHTML = '<h3>' + json.title.pretty + '</h3><div id="center">(' + json.images.pages.length + ' pages)' +
                    '</div><br/><input type="button" id="button" value="Download"><br/><br/>Downloads/<input type="text" id="path">';
                    document.getElementById('button').addEventListener('click', function()
                    {
                        document.getElementById('action').innerHTML = chrome.extension.getBackgroundPage().download(url, document.getElementById('path').value); 
                    });
                } else {
                    document.getElementById('action').innerHTML = "An unexpected error occured (Code " + this.status + ").";
                }
            }
        };
        http.open("GET", 'https://nhentai.net/api/gallery/' + id, true);
        http.send();
    }
    else
        document.getElementById('action').innerHTML = "This extension must be used on a doujinshi page in nhentai.net.";
});