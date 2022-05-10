var svg;
var plotLine;
var height, width, x, scales;
var dimensions = [
    "average_Annual_CO2_emissions",
    "average_growth_rate",
    "average_midyear_population",
    "average_life_expectancy",
     "average_midyear_population",
     "average_Annual_CO2_emissions",
     "average_Mortality_Rate",
     "average_Tourism",
     "average_Terrorism",
     "average_Homicide_Rate",
     "average_Depression_percent"
]

let selectedBrushExtents = {};


export function createParallelCoordsPlot(selector, demographicData) {

console.log("In parallel coordinates");
console.log(demographicData);
    dimensions.forEach(d => {
        selectedBrushExtents[d] = [];
    })

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
                "<p style=\"margin:0\">Average CO2 Emissions : " + d.average_Annual_CO2_emissions.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average growth rate : " + d.average_growth_rate.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average midyear population : " + d.average_midyear_population.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average life expectancy : " + d.average_life_expectancy.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average Mortality_Rate : " + d.average_Mortality_Rate.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average Tourism : " + d.average_Tourism.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average Terrorism : " + d.average_Terrorism.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average Homicide_Rate : " + d.average_Homicide_Rate.toFixed(2) + "</p>" +
                "<p style=\"margin:0\">Average Depression_percent : " + d.average_Depression_percent.toFixed(2) + "</p>"
                
                
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
        .attr("transform", "translate(" + margin + "," + margin + ")");


    svg.call(tip);

    scales = [];

    let data = getParallelCoordData(demographicData)
    console.log("filtered data");
    console.log(data);

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
        .range([0, width])
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
            console.log(d);
            if (!d.isHidden) {
                tip.show(d);
                console.log(d.isHidden)

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
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(scales.find(el => el.dimension === d).scale)); })
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
            "average_growth_rate": (growth_rate / count),
            "average_life_expectancy": (life_expectancy / count),
            "average_midyear_population": (midyear_population / count),
            "average_Annual_CO2_emissions": (Annual_CO2_emissions / count),
            "average_Mortality_Rate": (Mortality_Rate / count),
            "average_Tourism": (Tourism / count),
            "average_Terrorism": (Terrorism / count),
            "average_Homicide_Rate": (Homicide_Rate / count),
            "average_Depression_percent": (Depression_percent / count),     
            "isHidden": false,
        })
    })
    return data;
}

function brush(d) {
    let brushArray = d3.event.selection;
    console.log(brushArray);
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
