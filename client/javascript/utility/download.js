
// From: http://stackoverflow.com/questions/3749231/download-file-using-javascript-jquery
function download(url) {
    var hiddenIFrameID = '__hiddenDownloader',
        iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}

module.exports = download;