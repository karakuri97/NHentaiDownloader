import AParsing from "../parsing/AParsing";
import * as utils from "../utils";
import * as message from "./message"

// Update progress bar on the preview popup
export function updateProgress(progress: number, doujinshiName: string, isZipping: boolean) {
    if (isZipping && progress == -1) { // File is being downloaded
        document.getElementById('action')!.innerHTML = message.downloadDone();
    } else { // Download done
        document.getElementById('action')!.innerHTML = message.downloadProgress(isZipping ? "Zipping" : "Downloading", doujinshiName, progress);
    }

    document.getElementById('buttonBack')!.addEventListener('click', function()
    {
        chrome.extension.getBackgroundPage()!.goBack();
        updatePreview(currUrl);
    });
}

// Display popup for a doujinshi
export async function doujinshiPreviewAsync(id: string, parsing: AParsing) {
    const resp = await fetch(parsing.GetUrl(id));
    if (resp.status == 403) {
        document.getElementById('action')!.innerHTML = message.invalidPage();
    } else if (!resp.ok) {
        document.getElementById('action')!.innerHTML = message.errorOther(resp.status, resp.statusText);
    } else {
        let json = await parsing.GetJsonAsync(resp);
        chrome.storage.sync.get({
            useZip: "zip",
            downloadName: "{pretty}",
            replaceSpaces: true
        }, function(elems) {
            let extension = "";
            if (elems.useZip == "zip")
                extension = ".zip";
            else if (elems.useZip == "cbz")
                extension = ".cbz";

            let title = utils.getDownloadName(elems.downloadName, json.title.pretty === "" ?
                json.title.english.replace(/\[[^\]]+\]/g, '').replace(/\([^\)]+\)/g, '') : json.title.pretty,
                json.title.english, json.title.japanese, id, json.tags);
            document.getElementById('action')!.innerHTML = message.downloadInfo(title, json.images.pages.length, extension);
            (document.getElementById('path') as HTMLInputElement).value = utils.cleanName(title, elems.replaceSpaces);
            document.getElementById('button')!.addEventListener('click', function()
            {
                chrome.extension.getBackgroundPage()!.downloadDoujinshi(json, (document.getElementById('path') as HTMLInputElement).value, function(error: string) {
                    document.getElementById('action')!.innerHTML = message.errorDownload(error);
                }, updateProgress, title);
                    updateProgress(0, title, false);
                });
            });
    }
}