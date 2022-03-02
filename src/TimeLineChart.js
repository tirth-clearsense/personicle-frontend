import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import sample_events from "../sample_data/sample_events"

function TimelineChart ({google}) {
  
  const [chart, setChart] = useState(null);
  const [dimensions, setDimensions] = useState({ 
    height: 0,
    width: 0
  })

  useEffect(() => {

    if (google && !chart) {

    function endDateInMilliseconds(startDate, duration) {
        var formattedDate = dateToStandardFormat(startDate)
        var startDateInMS = formattedDate.getTime(); 
        var endDateInMS = startDateInMS + duration
        return endDateInMS;
     }

     // convert date to standard format to be compatible with different browsers
     function dateToStandardFormat(date){
        var values = date.split(/[^0-9]/),
        year = parseInt(values[0]),
        month = parseInt(values[1]) - 1,
        day = parseInt(values[2]),
        hours = parseInt(values[3]),
        minutes = parseInt(values[4]),
        seconds = parseInt(values[5])

        var formattedDate = new Date(year, month, day, hours, minutes, seconds);
        return formattedDate
     }
     
     let events = sample_events["sample_events"];
  
     function GFG_Fun(endDateInMS) {
            var endDate = new Date(endDateInMS);
            return endDate;
      }

      // Create the data table.
      const data = new google.visualization.DataTable();
  
      data.addColumn({ type: 'string', id: 'Events' });
      data.addColumn({ type: 'string', id: 'Task ID' });
      data.addColumn({ type: 'date', id: 'Start Date' });
      data.addColumn({ type: 'date', id: 'End Date' });
        events.forEach(event => 
        {
          data.addRow([event.activityName, event.logId.toString(), dateToStandardFormat(event.startTime), GFG_Fun(endDateInMilliseconds(event.startTime, event.duration))]);
        });
  
      // Set chart options
      var options = {'title':'Gantt Chart Timeline Visualization',
                    'width':' 100%',
                    'height': '100%',
                    timeline: { groupByRowLabel: true}, 
                    displayAnnotations: true};

      // Create a dashboard.
      var dashboard = new google.visualization.Dashboard(
        document.getElementById('dashboard_div'));

      // Create a range slider, passing some options
      var dateRangeSlider = new google.visualization.ControlWrapper({
        'controlType': 'DateRangeFilter',
        'containerId': 'filter_div',
        'options': {
          'filterColumnIndex': 2
        }
      });

      // Create a timeline chart, passing some options
      var timelineOptions = {
        width: 1000,
        height: 240, //window.innerHeight,        
    };

      var timelineChart = new google.visualization.ChartWrapper({
        'chartType': 'Timeline',
        'containerId': 'timeline',
        'options': timelineOptions
      });

      // Instantiate and draw our dashboard and chart, passing in some options.
      var dashboard = new google.visualization.Dashboard(
        document.getElementById('dashboard_div'));
     
        dashboard.bind(dateRangeSlider, timelineChart);
        dashboard.draw(data, options);
        
      function resize () {
        const chart = new google.visualization.Timeline(document.getElementById('timeline'));

        timelineOptions.width = .7 * window.innerWidth;
        timelineOptions.height = .5 * window.innerHeight;
  
        dashboard.draw(data, options);
      }

      window.onload = resize;
      window.onresize = resize;
    }
    
    //Re-Render Chart on Window Resize
    // return _ => {
    //   window.removeEventListener('resize', handleResize)}  

  }, [google, chart]);



  return (
    <>
    <div>
    </div>
      {!google && <Spinner />}
      <div id="dashboard_div">
        <div id="filter_div"></div>
        <div id="timeline" className={!google ? 'd-none' : ''}/>
      </div>
      
    </>
  )
}

export default TimelineChart;