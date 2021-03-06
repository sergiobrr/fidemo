"use strict";

// Data object to store Helsinki issue data
var IssueItem = function(id, latLon, status, header, description, media, address) {
    this.id = id;
    this.latLon = latLon;
    this.status = status;
    this.header = header;
    this.description = description;
    this.media = media;
    this.address = address;
};

IssueItem.prototype = {
    icon: function() {
        return IssueItem.Icons.get(this.issue_status);
    }
};

IssueItem.parse = function(jsonData) {
    var id = jsonData.service_request_id;
    var latLon = new VIZI.LatLon(jsonData.lat, jsonData.long);
    var status = jsonData.status;
    var description = jsonData.description;
    var header = description.substring(0, 32) + "...";
    var media = jsonData.media_url;
    return new IssueItem(id, latLon, status, header, description, media, "");
};


var HelsinkiIssues = function() {
};

HelsinkiIssues.RequestIndex = 0;
HelsinkiIssues.NextIndex = function() {
    if (HelsinkiIssues.RequestIndex >= 32767)
        HelsinkiIssues.RequestIndex = 0;
    
    HelsinkiIssues.RequestIndex++;
    return HelsinkiIssues.RequestIndex;
};

// Request Helsinki issues from the web service. When request is handled callback
// function is triggered. To keep what request is being responded request id is
// returned to callback, this way we can drop requests that are too old.
HelsinkiIssues.RequestIssues = function( lat, long, radius) {
    
    var requestId = HelsinkiIssues.NextIndex();
    var fullUrl = "https://asiointi.hel.fi/palautews/rest/v1/requests.json?lat=" + lat + "&long=" + long + "&radius=" + radius;
    console.log("Requesting Helsinki issues url: " + fullUrl);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", fullUrl, true);

    // Listen to state change and when request is finished store the issues
    // and trigger callback function using a signal.
    var that = this;
    var readySignal = new signals.Signal();
    readySignal.addOnce(HelsinkiIssues.Callback);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4)
        {
            if (xhr.status === 200) {
                console.log("Get Helsinki issue items succeeded!");
                var issueItems = JSON.parse(xhr.responseText);

                var issues = [];
                for(var i in issueItems)
                    issues.push(IssueItem.parse(issueItems[i]));

                readySignal.dispatch(requestId, issues);

                readySignal = null;
                that = null;
            }
            else if (xhr.status === 404) {
                console.error("Get get helsinki issue items failed: " + xhr.responseText);
                readySignal.dispatch(requestId, []);
            }
        }
    };
    
    xhr.send(null);
    return requestId;
};

HelsinkiIssues.Callback = function(id, result) {
    // if old request ignore.
    if (id != HelsinkiIssues.RequestIndex)
        return;
   
    var item = null;
    for(var i in result) {
        item = result[i];
        if (item instanceof IssueItem) {
            var type = item.status;
            
            globalData.pinView.addPin(type, globalData.lollipopMenu.owner, item.latLon, item.description, item.id, item);
        }
    }
};
