export function createLineChart(selector, demographicData , attr) {
    let svgContainer = d3.select(selector)
    if (svgContainer) svgContainer.selectAll("*").remove();
    let svg = svgContainer.append('svg');

    let optwidth = svgContainer.node().getBoundingClientRect().width;
    let optheight = svgContainer.node().getBoundingClientRect().height;

    let yearwiseData = getYearWiseData(demographicData , attr)

console.log("In time js");
console.log(attr);
console.log(yearwiseData , attr);
    /*
    * ========================================================================
    *  Prepare data
    * ========================================================================
    */

    // Combine the years and count array to make "data"
    let dataset = [];

    yearwiseData.forEach(yearlyData => {
        dataset.push({
            'year': yearlyData.year,
            "average_life_expectency": yearlyData.average_life_expectency
        })
    })



    // sort dataset by year
    dataset.sort(function (x, y) {
        return d3.ascending(x.year, y.year);
    });

console.log(dataset);
    /*
    * ========================================================================
    *  sizing
    * ========================================================================
    */
    /* === Focus chart === */

    let marginVal = optwidth * 0.05;
    let margin = { top: marginVal, right: marginVal, bottom: marginVal, left: marginVal };
    let width = optwidth - margin.left - margin.right-100;
    let height = optheight - margin.top - margin.bottom;
    let height_Focus = height * 0.70;

    /* === Context chart === */

    let height_context = height * 0.20;

    //console.log(optheight, height, height_Focus, height_context);

    /*
    * ========================================================================
    *  x and y coordinates
    * ========================================================================
    */
    // the date range of available data:
    
    const formatCash = n => {
   if (n < 1e3) return n;
   if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
   if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
   if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
   if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
 };

  const formatText = n => {
   if (n >= 1e6 && n < 1e9) return +(n / 1e9).toFixed(1);
   else if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1);
   else if (n >= 1e12) return +(n / 1e9).toFixed(1);
   
   else
     return n;
 };

    let dataXrange = d3.extent(dataset.map(yearlyData => Date.parse(yearlyData.year)));
    let dataYrange = [d3.min(dataset.map(yearlyData => parseFloat(yearlyData.average_life_expectency))) , d3.max(dataset.map(yearlyData => parseFloat(yearlyData.average_life_expectency)))];

    console.log(dataYrange);
    console.log(d3.min(dataset.map(yearlyData =>  parseFloat(yearlyData.average_life_expectency))));
    console.log(dataset.map(yearlyData => parseFloat(yearlyData.average_life_expectency)));
    // max and min date range allowed to display
    let mindate = dataXrange[0];
    let maxdate = dataXrange[1];

    let DateFormat = d3.timeFormat("%Y");

    /* === Focus Chart === */

    let x = d3.scaleTime()
        .range([0, (width)])
        .domain(dataXrange);

    let x_original = d3.scaleTime()
        .range([0, (width)])
        .domain(dataXrange);

    let y = d3.scaleLinear()
        .range([height_Focus, 0])
        .domain(dataYrange);


    let xAxis = d3.axisBottom(x)
        .ticks(10)
        .tickFormat(d => d.getFullYear());

    let yAxis = d3.axisRight(y);


    /* === Context Chart === */

    let x2 = d3.scaleTime()
        .range([0, width])
        .domain(dataXrange);

    let y2 = d3.scaleLinear()
        .range([height_context, 0])
        .domain(y.domain());

    let xAxis_context = d3.axisBottom(x2)

    /*
    * ========================================================================
    *  Plotted line and area variables
    * ========================================================================
    */

    /* === Focus Chart === */

    let line = d3.line()
        .x(function (d) { return x(Date.parse(d.year)); })
        .y(function (d) { return y(d.average_life_expectency); });

    let area = d3.area()
        .x(function (d) { return x(Date.parse(d.year)); })
        .y0((height_Focus))
        .y1(function (d) { return y(d.average_life_expectency); });

    /* === Context Chart === */

    let area_context = d3.area()
        .x(function (d) { return x2(Date.parse(d.year)); })
        .y0((height_context))
        .y1(function (d) { return y2(d.average_life_expectency); });

    let line_context = d3.line()
        .x(function (d) { return x2(Date.parse(d.year)); })
        .y(function (d) { return y2(d.average_life_expectency); });


    /*
    * ========================================================================
    *  Variables for brushing and zooming behaviour
    * ========================================================================
    */
    let brushExtent = [[0, 0], [width, height_context]];
    let brush = d3.brushX()
        .extent(brushExtent)
        .on("brush end", brushend);
    /*
    * ========================================================================
    *  Define the SVG area ("svg") and append all the layers
    * ========================================================================
    */

    // === the main components === //

    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        .attr("class", "metric-chart") // CB -- "line-chart" -- CB //
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");

    var areaGrsadient = svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    // clipPath is used to keep line and area from moving outside of plot area when user zooms/scrolls/brushes

    let context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + (height - height_context) + ")");

    let focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")");
        let formatValue = d3.format(".2s");

    /* === focus chart === */

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis.tickFormat(function(d){return formatValue(d) }))
        .attr("transform", "translate(" + (width) + ", 0)");

    focus
        .append("path")
        .datum(dataset)
        .attr("class", "area")
        .attr("clip-path", "url(#clip)")
        .attr("d", area)
        .attr("fill", "#a4d9f5")
        .attr("stroke", "#a4d9f5")
        .attr("fill-opacity", 0.5);

    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height_Focus) + ")")
        .call(xAxis);

    focus.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#a4d9f5")



    /* === context chart === */

    context.append("path")
        .datum(dataset)
        .attr("class", "area")
        .attr("d", area_context)
        .attr("fill", "#a4d9f5")
        .attr("stroke", "#a4d9f5")
        .attr("fill-opacity", 0.5);

    context.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", line_context)
        .attr("fill", "none")
        .attr("stroke", "#a4d9f5");

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_context + ")")
        .call(xAxis_context);

    /* === brush (part of context chart)  === */

    let brushg = context.append("g")
        .attr("class", "x brush")
        .call(brush);

    brushg.selectAll(".extent")
        .attr("y", -6)
        .attr("height", height_context + 8);
    // .extent is the actual window/rectangle showing what's in focus

    brushg.selectAll(".resize")
        .append("rect")
        .attr("class", "handle")
        .attr("transform", "translate(0," + -3 + ")")
        .attr('rx', 2)
        .attr('ry', 2)
        .attr("height", height_context + 6)
        .attr("width", 3);

    brushg.selectAll(".resize")
        .append("rect")
        .attr("class", "handle-mini")
        .attr("transform", "translate(-2,8)")
        .attr('rx', 3)
        .attr('ry', 3)
        .attr("height", (height_context / 2))
        .attr("width", 7);

    //6f6f6f
    svg.selectAll('g.tick text')
        // .style('fill', "white")
        .style('fill', "white")
        .style('font-size', "8px");
    svg.selectAll('g.tick line')
        // .style('fill', "white")
        .style('stroke', "white")
        .style('stroke-width', 0.3);
    svg.selectAll('path.domain')
        // .style('fill', "white")
        .style('stroke', "white")
        .style('stroke-width', 0.3);


    svg.append("text")
        .attr("class", "x axis title")
        .text("Year")
        .attr("x", width + 10)
        .attr("y", height + 5)
        .attr("dy", "2em")
        // .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "10px");
    svg.append("text")
        .attr("class", "y axis title")
        .text(attr)
        .attr("transform", "rotate(90)")
        .attr("x",90)
        .attr("y", -550)
        .attr("dy", "2em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "10px");
        
          svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 400)
        .attr("y", -0)
        .style("font-size", "16px")
        .style("fill", "white")
        .text("Year vs "+attr);




    /* === y axis title === */

    // svg.append("text")
    //     .attr("class", "y axis title")
    //     .text("Monthly " + this.metricName)
    //     .attr("x", (-(height / 2)))
    //     .attr("y", 0)
    //     .attr("dy", "1em")
    //     .attr("transform", "rotate(-90)")
    //     .style("text-anchor", "middle");

    // allows zooming before any brush action
    // zoom.x(x);

    // === brush and zoom functions ===


    function brushend() {
        // when brush stops moving:


        // check whether chart was scrolled out of bounds and fix,
        if (d3.event.selection != null) {
            let b = d3.event.selection;

            // x.domain(brush.empty() ? x2.domain() : brush.extent());
            x.domain([x_original.invert(b[0]), x_original.invert(b[1])]);

            focus.select(".area").attr("d", area);
            focus.select(".line").attr("d", line);
            focus.select(".x.axis").call(xAxis);

            let event = new CustomEvent("timePlotBrushed", { detail: { "timeRange": x.domain() } });
            document.dispatchEvent(event);
        } else {
            x.domain(x_original.domain());
            focus.select(".area").attr("d", area);
            focus.select(".line").attr("d", line);
            focus.select(".x.axis").call(xAxis);

            let event = new CustomEvent("timePlotBrushed", { detail: { "timeRange": x.domain() } });
            document.dispatchEvent(event);
        }

        svg.selectAll('g.tick text')
            // .style('fill', "white")
            .style('fill', "white")
            .style('font-size', "8px");
        svg.selectAll('g.tick line')
            // .style('fill', "white")
            .style('stroke', "white")
            .style('stroke-width', 0.3);
        svg.selectAll('path.domain')
            // .style('fill', "white")
            .style('stroke', "white")
            .style('stroke-width', 0.3);


        // setYdomain();

        // focus.select(".area").attr("d", area);
        // focus.select(".line").attr("d", line);
        // focus.select(".x.axis").call(xAxis);


        // Force changing brush range
        // brush.extent(x.domain());
        // svg.select(".brush").call(brush);

        // and update the text showing range of dates.
        updateDisplayDates();
    };

    function updateDisplayDates() {

        var b = brush.extent();
        // update the text that shows the range of displayed dates
        var localBrushDateStart = (d3.event?.selection === null) ? DateFormat(dataXrange[0]) : DateFormat(b[0]),
            localBrushDateEnd = (d3.event?.selection === null) ? DateFormat(dataXrange[1]) : DateFormat(b[1]);

        // Update start and end dates in upper right-hand corner
        d3.select("#displayDates")
            .text(localBrushDateStart == localBrushDateEnd ? localBrushDateStart : localBrushDateStart + " - " + localBrushDateEnd);
    };

}

function getYearWiseData(demographicData , attr) {
    let yearwiseData = [];
    demographicData.forEach(countryData => {
        countryData.yearwiseData.forEach(yearlyData => {

            if (!yearwiseData.some(el => el.year === yearlyData.year)) {
                yearwiseData.push({
                    "year": yearlyData.year,
                    "data": [{
                        "country_name": countryData.country_name,
                         "Life_Expectancy": yearlyData.data.Life_Expectancy,
                        "Annual_CO2_emissions": yearlyData.data.Annual_CO2_emissions,
                        "Population": yearlyData.data.Population,
                        "GDP": yearlyData.data.GDP,
                         "Mortality_Rate":yearlyData.data.Mortality_Rate,
                         "Tourism":yearlyData.data.Tourism,
                         "Terrorism":yearlyData.data.Terrorism,
                         "Homicide_Rate":yearlyData.data.Homicide_Rate,
                         "Depression_percent":yearlyData.data.Depression_percent
                    }]
                })
            } else {

                yearwiseData.find(el => el.year === yearlyData.year).data.push({
                    "country_name": countryData.country_name,
                     "Life_Expectancy": yearlyData.data.Life_Expectancy,
                     "Annual_CO2_emissions": yearlyData.data.Annual_CO2_emissions,
                     "Population": yearlyData.data.Population,
                    "GDP": yearlyData.data.GDP,
                     "Mortality_Rate":yearlyData.data.Mortality_Rate,
                     "Tourism":yearlyData.data.Tourism,
                     "Terrorism":yearlyData.data.Terrorism,
                     "Homicide_Rate":yearlyData.data.Homicide_Rate,
                     "Depression_percent":yearlyData.data.Depression_percent
                    
                })
            }
        })
    });

    yearwiseData.forEach(yearlyData => {
        let lifeExpectancyTotal = 0
        yearlyData.data.forEach(datapoint => {
        
                //console.log("in time filter"+ attr);
           // console.log(datapoint);
       // console.log(datapoint[attr]);
            lifeExpectancyTotal = lifeExpectancyTotal + parseFloat(datapoint[attr])
        })
        yearlyData.average_life_expectency = (lifeExpectancyTotal / yearlyData.data.length).toFixed(2);
    })

    return yearwiseData;
}