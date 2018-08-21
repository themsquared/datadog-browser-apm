// Set DD_POST_URL to proxy back to the Datadog Agent. You'll need to use nginx, apache, etc to reverse proxy to
// the Datadog agent APM API.
var DD_POST_URL = "/dd_stats_proxy";

// Starting time in nanoseconds
var scriptStart = (new Date().getTime()) * 1000000;

// Build top-level traces
var traceID = Math.floor(Math.random()*100000000);
var pageSpanID = Math.floor(Math.random()*100000000);

// Trace dict for all of the spans.
var trace = [];

// Set up a performance observer to capture loads and build spans.
function perf_observer(list, observer) { 
   console.log(list);
   processTimes(list.getEntriesByType("resource"));
} 
var observer2 = new PerformanceObserver(perf_observer); 
observer2.observe({entryTypes: ["resource"]});

// Process 
function processTimes(resources) {
  // Check performance support
  if (performance === undefined) {
    console.log("= Calculate Load Times: performance NOT supported");
    return;
  }

  // Get a list of "resource" performance entries
  if (resources === undefined || resources.length <= 0) {
    console.log("= Calculate Load Times: there are NO `resource` performance records");
    return;
  }

  console.log("= Calculate Load Times");
  for (var i=0; i < resources.length; i++) {
    var spanID = Math.floor(Math.random()*10000000)

    console.log("== Resource[" + i + "] - " + resources[i].name);
    // Resource Info
    console.log(resources[i]);

    // Resource Name
    var resourceName = resources[i].name;

    // Resource Meta
    var dataType = resources[i].entryType;
    var resourceType = resources[i].initiatorType;
    var protocol = resources[i].nextHopProtocol;

    ///// GET TIMING DATA //////
    // Start Time
    var start = Math.floor((resources[i].startTime * 1000000) + scriptStart);
    // Duration
    var duration = Math.floor(resources[i].duration * 1000000);

    var networkProtocol = resources[i].nextHopProtocol;

    ///// GET SIZING DATA //////
    if ("decodedBodySize" in resources[i])
      var decodedBodySize = resources[i].decodedBodySize;
    else
      var decodedBodySize = 0;
      console.log("... decodedBodySize[" + i + "] = NOT supported");

    if ("encodedBodySize" in resources[i])
      var encodedBodySize = resources[i].encodedBodySize;
    else
      var encodedBodySize = 0;
      console.log("... encodedBodySize[" + i + "] = NOT supported");

    if ("transferSize" in resources[i])
      var transferSize = resources[i].transferSize;
    else
   	  var transferSize = 0;
      console.log("... transferSize[" + i + "] = NOT supported");
  
  	var span = {
  		start: start,
  		duration: duration,
  		resource: window.location.pathname,
  		service: "myAwesomeWebService",
  		name: resourceType,
  		type: "web",
  		meta: {
  			resource_name: resourceName,
  			decodedSize: decodedBodySize.toString(),
  			encodedSize: encodedBodySize.toString(),
  			transferSize: transferSize.toString(),
  			protocol: networkProtocol
  		},
  		parent_id: pageSpanID,
  		trace_id: traceID,
  		span_id: spanID 
  	};
  	trace.push(span);
  }
}

// Send request to APM proxy.
function postDDTraces(traces) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
               console.log(xmlhttp.responseText);
           }
           else if (xmlhttp.status == 400) {
           		console.log("There was a 400 error.");
           }
           else {
               console.log('Something else other than 200 was returned');
           }
        }
    };
    xmlhttp.open("PUT", DD_POST_URL, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(traces));
}

// Once page finishes load, build the top-level span and submit  to Datadog.
window.onload = function() {
	setTimeout(function(){
	 	var perfData = window.performance.timing; 
	 	var pageLoadTime = Math.ceil((perfData.loadEventEnd - perfData.navigationStart)*1000000);
	 	var span = {
			start: scriptStart,
			duration: pageLoadTime,
			resource: window.location.pathname,
			service: "myAwesomeWebService",
			name: "html",
			type: "web",
			meta: {
				browser: navigator.appName,
				browser_version: navigator.appVersion,
				useragent: navigator.userAgent,
				platform: navigator.platform,
				language: navigator.language
			},
			trace_id: traceID,
			span_id: pageSpanID 
	  	};
  		trace.push(span);
	 	console.log(JSON.stringify([trace]));
	 	postDDTraces([trace]);
	 }, 0);
};
