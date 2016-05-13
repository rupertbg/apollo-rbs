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

  window.daysDimension = eventData.dimension(function(d) {return d.day;});
  window.weeksDimension = eventData.dimension(function(d) {return d.week;});
  window.monthsDimension = eventData.dimension(function(d) {return d.month;});
  var daysGroup =  daysDimension.group()
  var weeksGroup =  weeksDimension.group()
  var monthsGroup =  monthsDimension.group()
  var maxGroup = daysGroup.top(1)[0].value
  var minDate = daysDimension.bottom(1)[0].start;
  var maxDate = moment();
  var eventsPerMonth  = dc.barChart("#bookingspermonth");
  var eventsPerWeek  = dc.lineChart("#bookingsperweek");

  // Chart //

  eventsPerMonth
    .width(650)
    .height(300)
    .transitionDuration(1000)
    .dimension(monthsDimension)
    .group(monthsGroup)
    .mouseZoomable(false)
    .x(d3.time.scale().domain([new Date(minDate), new Date(maxDate)]))
    .round(d3.time.month.round)
    .xUnits(d3.time.months)
    .elasticY(true)

  eventsPerWeek
    .width(650)
    .height(300)
    .transitionDuration(1000)
    .dimension(weeksDimension)
    .group(weeksGroup)
    .mouseZoomable(false)
    .x(d3.time.scale().domain([new Date(moment().add(-1, 'year')), new Date(moment())]))
    .round(d3.time.week.round)
    .xUnits(d3.time.weeks)
    .elasticY(true)

  window.resourceDimension = eventData.dimension(function(d) {return d.resourceId})
  var resourceGroup = resourceDimension.group()
  var resourcePie  = dc.pieChart('#bookingspiechart');
  resourcePie
    .width(650)
    .height(450)
    .dimension(resourceDimension)
    .group(resourceGroup)
    .on('renderlet', function (chart) {
      chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");
    });

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
    .width(650)
    .height(450)
    .dimension(resourceTypeDimension)
    .group(resourceTypeGroup)
    .legend(dc.legend().x(0).y(250).itemHeight(15).gap(5))
    .on('renderlet', function (chart) {
      chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");
    });

  //// Hours /////

  window.hoursMonthsDimension = eventData.dimension(function(d) {return d.month;});
  window.hoursWeeksDimension = eventData.dimension(function(d) {return d.week;});
  var hoursMonthsGroup =  hoursMonthsDimension.group().reduceSum(function(d) {return d.duration})
  var hoursWeeksGroup =  hoursWeeksDimension.group().reduceSum(function(d) {return d.duration})
  var maxGroup = hoursMonthsGroup.top(1)[0].value
  var minDate = hoursMonthsDimension.bottom(1)[0].start;
  var maxDate = moment();
  var bookingHoursMonth  = dc.barChart("#usagebymonth");
  var bookingHoursWeek  = dc.lineChart("#usagebyweek");
  bookingHoursMonth
    .width(650)
    .height(300)
    .dimension(hoursMonthsDimension)
    .group(hoursMonthsGroup)
    .turnOnControls(true)
    .elasticY(true)
    .y(d3.scale.linear().domain([0, maxGroup]))
    .x(d3.time.scale().domain([new Date(minDate), new Date(maxDate)]))
    .round(d3.time.month.round)
    .xUnits(d3.time.months)
    .elasticY(true)

  bookingHoursWeek
    .width(650)
    .height(300)
    .dimension(hoursWeeksDimension)
    .group(hoursWeeksGroup)
    .turnOnControls(true)
    .elasticY(true)
    .y(d3.scale.linear().domain([0, maxGroup]))
    .x(d3.time.scale().domain([new Date(moment().add(-1, 'year')), new Date(moment())]))

  window.resourceHoursDimension = eventData.dimension(function(d) {return d.resourceId})
  var resourceHoursGroup = resourceHoursDimension.group().reduceSum(function(d) {return d.duration})
  var resourceHoursPie  = dc.pieChart('#hourpiechart');

  // Chart //

  resourceHoursPie
    .width(650)
    .height(450)
    .dimension(resourceHoursDimension)
    .group(resourceHoursGroup)
    .on('renderlet', function (chart) {
      chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");
    });

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
    .width(650)
    .height(450)
    .dimension(resourceHoursTypeDimension)
    .group(resourceHoursTypeGroup)
    .legend(dc.legend().x(0).y(250).itemHeight(15).gap(5))
    .on('renderlet', function (chart) {
      chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");
    });

  //// Data Table ////

  var dynatable = $('#datatable').dynatable({
    features: {
      pushState: false
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

  for (var i = 0; i < dc.chartRegistry.list().length; i++) {
    var chartI = dc.chartRegistry.list()[i];
    chartI.on("filtered", refreshTable);
  }
  refreshTable();

  dc.renderAll();

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
