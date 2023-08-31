/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 93.9, "KoPercent": 6.1};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6905, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.854, 500, 1500, "Encontrar voos"], "isController": false}, {"data": [0.164, 500, 1500, "Consultar Destino"], "isController": false}, {"data": [0.862, 500, 1500, "Pagamento"], "isController": false}, {"data": [0.882, 500, 1500, "Confirmação de Pagamento"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1000, 61, 6.1, 770.4039999999995, 246, 3582, 446.5, 1825.6999999999998, 2070.5999999999995, 2582.83, 48.64286409183772, 290.9665071079385, 9.215542611148944], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Encontrar voos", 250, 0, 0.0, 468.584, 253, 1254, 409.0, 760.9, 880.9, 1182.350000000001, 98.50275807722616, 696.9262522163122, 18.565461239164698], "isController": false}, {"data": ["Consultar Destino", 250, 61, 24.4, 1732.9640000000004, 821, 3582, 1721.5, 2325.9, 2531.3999999999996, 3144.7200000000003, 64.21782686873877, 298.3244164204983, 11.978129816337015], "isController": false}, {"data": ["Pagamento", 250, 0, 0.0, 449.776, 254, 1685, 348.0, 754.2, 979.6999999999999, 1540.9900000000005, 78.1983109164842, 513.1000498514233, 14.814914372849547], "isController": false}, {"data": ["Confirmação de Pagamento", 250, 0, 0.0, 430.2920000000001, 246, 1403, 350.0, 708.0, 875.3999999999996, 1307.1200000000008, 74.56009543692215, 420.85678869668953, 14.41689345362362], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,114 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,095 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 3.278688524590164, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 2,270 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,460 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,583 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,538 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,278 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,165 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,148 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,795 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,237 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,025 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 3.278688524590164, 0.2], "isController": false}, {"data": ["The operation lasted too long: It took 3,012 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,061 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,071 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,741 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,008 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,112 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,123 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,346 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,526 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,515 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,113 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,146 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,615 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 3,582 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,103 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,207 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,359 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,166 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,299 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 3,131 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,091 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,094 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,007 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,159 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,474 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,226 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,356 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,195 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,334 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,989 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,014 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,409 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,204 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 3,125 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,328 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,465 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,518 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,015 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,031 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,042 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,152 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 3,159 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,005 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,307 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,511 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,566 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}, {"data": ["The operation lasted too long: It took 2,063 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.639344262295082, 0.1], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1000, 61, "The operation lasted too long: It took 2,095 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,025 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,114 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,270 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,460 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Consultar Destino", 250, 61, "The operation lasted too long: It took 2,095 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,025 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,114 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,270 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,460 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
