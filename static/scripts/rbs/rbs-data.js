$(document).ready(function(){
  window.debugger('[ANALYSISDATA] - Calling server for all data');
  socket.emit('getAnalysisData');
})

function generateResourceInfo(eventArray) {
  for (var i = 0; i < eventArray.length; i++) {
    var d = eventArray[i]
    d.day = d3.time.day(new Date(d.day))
    d.week = d3.time.week(new Date(d.week))
    d.month = d3.time.month(new Date(d.month))
  }
  var eventData = crossfilter(eventArray)

  //// Bookings /////

  window.daysDimension = eventData.dimension(function(d) {return d.week;});
  var daysGroup =  daysDimension.group()
  var maxGroup = daysGroup.top(1)[0].value
  var minDate = daysDimension.bottom(1)[0].start;
  var maxDate = daysDimension.top(1)[0].start;
  var eventsPerDay  = dc.lineChart("#bookingsperday");

  // Chart //

  eventsPerDay
    .width(550)
    .height(200)
    .transitionDuration(1000)
    .margins({top: 10, right: 50, bottom: 25, left: 40})
    .dimension(daysDimension)
    .group(daysGroup)
    .mouseZoomable(false)
    .x(d3.time.scale().domain([new Date(minDate), new Date(maxDate)]))
    .round(d3.time.month.round)
    .xUnits(d3.time.months)
    .elasticY(true)

  window.resourceDimension = eventData.dimension(function(d) {return d.resourceId})
  var resourceGroup = resourceDimension.group()
  var resourcePie  = dc.pieChart('#bookingspiechart');
  resourcePie
    .width(200)
    .height(200)
    .dimension(resourceDimension)
    .group(resourceGroup)
    .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
    .renderlet(function (chart) {chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");})

  window.resourceTypeDimension = eventData.dimension(function(d) {
    for (var i = 0; i < window.allresources.length; i++) {
      r = window.allresources[i]
      if (d.resourceId == r.id) {
        d.resourceType = r.type
        break
      }
    }
    return d.resourceType})
  var resourceTypeGroup = resourceTypeDimension.group()
  var resourceTypePie  = dc.pieChart('#bookingstypepiechart');

  // Chart //

  resourceTypePie
    .width(200)
    .height(200)
    .dimension(resourceTypeDimension)
    .group(resourceTypeGroup)
    .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
    .renderlet(function (chart) {chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");})

  //// Hours /////

  window.hoursDimension = eventData.dimension(function(d) {return d.week;});
  var hoursGroup =  hoursDimension.group().reduceSum(function(d) {return d.duration})
  var maxGroup = hoursGroup.top(1)[0].value
  var minDate = hoursDimension.bottom(1)[0].start;
  var maxDate = hoursDimension.top(1)[0].start;
  var bookingHours  = dc.lineChart("#usagebyhour");
  bookingHours
    .width(550)
    .height(200)
    .dimension(hoursDimension)
    .group(hoursGroup)
    .turnOnControls(true)
    .elasticY(true)
    .elasticX(true)
    .y(d3.scale.linear().domain([0, maxGroup]))
    .x(d3.time.scale().domain([new Date(minDate), new Date(maxDate)]))

  window.resourceHoursDimension = eventData.dimension(function(d) {return d.resourceId})
  var resourceHoursGroup = resourceHoursDimension.group().reduceSum(function(d) {return d.duration})
  var resourceHoursPie  = dc.pieChart('#hourpiechart');

  // Chart //

  resourceHoursPie
    .width(200)
    .height(200)
    .dimension(resourceHoursDimension)
    .group(resourceHoursGroup)
    .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
    .renderlet(function (chart) {chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");})

  window.resourceHoursTypeDimension = eventData.dimension(function(d) {
    for (var i = 0; i < window.allresources.length; i++) {
      r = window.allresources[i]
      if (d.resourceId == r.id) {
        d.resourceType = r.type
        break
      }
    }
    return d.resourceType})
  var resourceHoursTypeGroup = resourceHoursTypeDimension.group().reduceSum(function(d) {return d.duration})
  var resourceHoursTypePie  = dc.pieChart('#hourtypepiechart');

  // Chart //

  resourceHoursTypePie
    .width(200)
    .height(200)
    .dimension(resourceHoursTypeDimension)
    .group(resourceHoursTypeGroup)
    .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
    .renderlet(function (chart) {chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");})

  //// Data Table ////

  var dynatable = $('#datatable').dynatable({
    features: {
      pushState: true
    },
    dataset: {
      records: daysDimension.top(Infinity),
      perPageDefault: 10,
      perPageOptions: [10, 25, 50, 100]
    }
  }).data('dynatable');

  function refreshTable() {
    dc.events.trigger(function () {
      dynatable.settings.dataset.originalRecords = daysDimension.top(Infinity);
      dynatable.process();
    });
  };

  $(window).resize(function() {
    refreshTable()
  });

  for (var i = 0; i < dc.chartRegistry.list().length; i++) {
    var chartI = dc.chartRegistry.list()[i];
    chartI.on("filtered", refreshTable);
  }
  refreshTable();

  dc.renderAll();

  loading(false)

  $('.csvexport').off('click').on('click', function(){
    function download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    var currentRecords = daysDimension.top(2500);
    if(currentRecords == '') {
      return;
    }
    var dateStamp = 'RBS_' + moment.utc()
    download(dateStamp, Papa.unparse(currentRecords))
  })
}
