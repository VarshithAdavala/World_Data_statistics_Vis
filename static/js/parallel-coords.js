var svg;
var plotLine;
var height, width, x, scales;
var dimensions = [
    "Annual_CO2_emissions",
    "Growth_rate",
    "Midyear_population",
    "Life_expectancy",
    "Mortality_Rate",
    "Tourism",
    "Terrorism",
    "Homicide_Rate",
    "Depression_percent"
]

let selectedBrushExtents = {};


export function createParallelCoordsPlot(selector, demographicData) {

//console.log("In parallel coordinates");
//console.log(demographicData);
    dimensions.forEach(d => {
        selectedBrushExtents[d] = [];
    })
    let formatValue = d3.format(".2s");

    let svgContainer = d3.select(selector)
    if (svgContainer) svgContainer.selectAll("*").remove();

    svg = svgContainer.append('svg')

    let optWidth = svgContainer.node().getBoundingClientRect().width;
    let optHeight = svgContainer.node().getBoundingClientRect().height;

    d3.select(".d3-tip-parallel").remove();

    let tip = d3.tip()
        .attr('class', 'd3-tip d3-tip-parallel')
        .attr("pointer-events", "none")

        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("padding", "5px")
        .style("text-align", "center")
        .style("font-size", "8px")

        .html(function (d) {
            return ("<h3 style=\"margin:0\">" + d.country_name + "</h3>" +
                "<p style=\"margin:0\">CO2 Emissions : " + formatValue(d.Annual_CO2_emissions) + "</p>" +
                "<p style=\"margin:0\">Growth rate : " + formatValue(d.Growth_rate) + "</p>" +
                "<p style=\"margin:0\">Midyear population : " +formatValue( d.Midyear_population) + "</p>" +
                "<p style=\"margin:0\">Life expectancy : " + formatValue(d.Life_expectancy) + "</p>" +
                "<p style=\"margin:0\">Mortality_Rate : " +formatValue( d.Mortality_Rate) + "</p>" +
                "<p style=\"margin:0\">Tourism : " +formatValue( d.Tourism) + "</p>" +
                "<p style=\"margin:0\">Terrorism : " + formatValue(d.Terrorism) + "</p>" +
                "<p style=\"margin:0\">Homicide_Rate : " + formatValue(d.Homicide_Rate) + "</p>" +
                "<p style=\"margin:0\">Depression_percent : " + formatValue(d.Depression_percent) + "</p>"
                
                
            )
        })

    // set the dimensions and margins of the graph
    let margin = 30;
    width = optWidth - margin - margin;
    height = optHeight - margin - margin;
    svg.attr("width", optWidth)
        .attr("height", optHeight);

    svg = svg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + (margin-70) + "," + (margin+10) + ")");


    svg.call(tip);

    scales = [];

    let data = getParallelCoordData(demographicData)
    //console.log("filtered data");
   // console.log(data);

    dimensions.forEach(dimension => {

        let max = d3.max(data.map(d => d[dimension]));
        let min = d3.min(data.map(d => d[dimension]));
        let margin = (max - min) * 0.1;
        scales.push({
            "dimension": dimension,
            "scale": d3.scaleLinear()
                .domain([min - margin, max + margin])
                .range([height, 0])
        })
    })

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width+180])
        .padding(1)
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(scales.map((scaleArray) => {
            let dimension = scaleArray.dimension;
            let scale = scaleArray.scale;
            return [x(dimension), scale(d[dimension])];
        }));
    }

    // Draw the lines
    plotLine = svg
        .selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "#a4d9f5")
        .style("opacity", 0.5)
        .style("stroke-width", 0.7)


    plotLine
        .on("mouseenter.tooltip", function (d) {
          //  console.log(d);
            if (!d.isHidden) {
                tip.show(d);
              //  console.log(d.isHidden)

                d3.select(this).style("opacity", 1)
                    .style("stroke-width", 1.5)
                    .style("stroke", "white")
                tip.style("top", d3.event.pageY + 10 + "px")
                    .style("left", d3.event.pageX + 10 + "px")
            }
        })
        .on("mouseleave.tooltip", function (d) {
            d3.select(".d3-tip-parallel")
                .style("opacity", 0)
            if (!d.isHidden) {
                d3.select(this).style("opacity", 0.5)
                    .style("stroke-width", 0.7)
                    .style("stroke", "#a4d9f5")
            }

        })



    // Draw the axis:
    
    let axis = svg.selectAll(".myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "parallel-axis")
    // Add a brush for each axis
    axis.
        each(function (d) {
            d3.select(this).append("g", "path.domain")
                .attr("class", "brush")
                .attr("z-index", 1000)
                .call(d3.brushY().extent([[- 10, 0], [10, height]]).on("brush end", brush));
        })


    // translate this element to its right position on the x axis
    axis.attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(scales.find(el => el.dimension === d).scale).tickFormat(function(d){return formatValue(d) })); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .attr("y", function (d, i) {
            if (i % 2 == 0) {
                return -9
            } else {
                return height + 9
            }
        })
        .text(function (d) {
            let words = d.split('_')
            words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
            return words.join(' ');
        })
     svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 400)
        .attr("y", -27)
        .style("font-size", "16px")
        .style("fill", "white")
        .text("PCP ");

    // .selectAll("rect")
    // .attr("x", -8)
    // .attr("width", 16)

    svg.selectAll('g.tick text')
        // .style('fill', "white")
        .style('fill', "rgb(237, 237, 237)")
        .style('font-size', "8px");
    svg.selectAll('g.tick line')
        // .style('fill', "white")
        .style('stroke', "#6f6f6f")
        .style('stroke-width', 0.3);
    svg.selectAll('g.parallel-axis path')
        // .style('fill', "white")
        .style('stroke', "#6f6f6f")
        .style('stroke-width', 0.3);
}


function getParallelCoordData(demographicData) {
    let data = [];
    demographicData.forEach(countryData => {
        let growth_rate = 0
        let life_expectancy = 0
        let midyear_population = 0
        let total_fertility_rate = 0
        let Annual_CO2_emissions = 0
        let Mortality_Rate = 0
        let Tourism = 0
        let Terrorism = 0
        let Homicide_Rate = 0
        let Depression_percent = 0
        countryData.yearwiseData.forEach(yearlyData => {
            growth_rate = growth_rate + parseFloat(yearlyData.data.GDP);
            life_expectancy = life_expectancy + parseFloat(yearlyData.data.Life_Expectancy);
            midyear_population = midyear_population + parseFloat(yearlyData.data.Population);
            Annual_CO2_emissions = Annual_CO2_emissions + parseFloat(yearlyData.data.Annual_CO2_emissions)
            Mortality_Rate = Mortality_Rate + parseFloat(yearlyData.data.Mortality_Rate)
            Tourism = Tourism + parseFloat(yearlyData.data.Tourism)
            Terrorism = Terrorism + parseFloat(yearlyData.data.Terrorism)
            Homicide_Rate = Homicide_Rate + parseFloat(yearlyData.data.Homicide_Rate)
            Depression_percent = Depression_percent + parseFloat(yearlyData.data.Depression_percent)
        });
        let count = countryData.yearwiseData.length
        data.push({
            "country_name": countryData.country_name,
            "Growth_rate": (growth_rate / count),
            "Life_expectancy": (life_expectancy / count),
            "Midyear_population": (midyear_population / count),
            "Annual_CO2_emissions": (Annual_CO2_emissions / count),
            "Mortality_Rate": (Mortality_Rate / count),
            "Tourism": (Tourism / count),
             "Terrorism": (Terrorism / count),
             "Homicide_Rate": (Homicide_Rate / count),
             "Depression_percent": (Depression_percent / count),     
            "isHidden": false,
        })
    })
    return data;
}

function brush(d) {
    let brushArray = d3.event.selection;
   // console.log(brushArray);
    if (brushArray) {
        selectedBrushExtents[d] = brushArray;
        plotLine.style("stroke-opacity", function (line) {
            let lineOpacity;
            let _isHidden;
            for (const [key, value] of Object.entries(selectedBrushExtents)) {
                if (value.length !== 0) {
                    let countryVal = scales.find(el => el.dimension === key).scale(line[key])
                    if ((countryVal >= value[0]) && (countryVal <= value[1])) {
                        lineOpacity = 0.8;
                        _isHidden = false;
                    } else {
                        lineOpacity = 0;
                        _isHidden = true;
                        break;
                    }
                }
            }
            line.isHidden = _isHidden;
            d3.select(this).style("opacity", lineOpacity)
            return lineOpacity;
        })
    } else {
        selectedBrushExtents[d] = []
        plotLine.style("stroke-opacity", function (line) {
            let lineOpacity;
            let _isHidden;
            for (const [key, value] of Object.entries(selectedBrushExtents)) {
                if (value.length !== 0) {
                    let countryVal = scales.find(el => el.dimension === key).scale(line[key])
                    if ((countryVal >= value[0]) && (countryVal <= value[1])) {
                        lineOpacity = 0.8;
                        _isHidden = false;
                    } else {
                        lineOpacity = 0;
                        _isHidden = true;
                        break;
                    }
                }
            }
            line.isHidden = _isHidden;
            d3.select(this).style("opacity", lineOpacity)
            return lineOpacity;
        })
    }
}
