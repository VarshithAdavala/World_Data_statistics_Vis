
var bubble;

var x, y, z;

var width, height;

export function createRadarChart(selector, demographicData) {

    let svgContainer = d3.select(selector)
    if (svgContainer) svgContainer.selectAll("*").remove();


 let optWidth = svgContainer.node().getBoundingClientRect().width;
 let optHeight = svgContainer.node().getBoundingClientRect().height;

	var cfg = {
	    w: optWidth,
		h: optHeight,
		margin: {top: 10, right: 20, bottom: 20, left: 20},
		legendPosition: {x: 20, y: 20},
		maxValue: 0.5,
		wrapWidth: 60,
	   opacityArea: 0.35, 
	   	 dotRadius: 4,
		levels: 5,
		opacityCircles: 0.1, 
		strokeWidth: 2, 
		roundStrokes: false,		//Color function
   	 axisName: "axis",
   	 areaName:"areaName",
   	 color: d3.scaleOrdinal(d3.schemeCategory10),		//Color function
   	 value: "value",
   	 sortAreas: true,
		};


 let data = [];
 console.log("in scatrer plot")
 demographicData.forEach(countryData => {
 console.log(countryData)
     let growth_rate = 0
     let life_expectancy = 0
     let midyear_population = 0
     let co2=0
     countryData.yearwiseData.forEach(yearlyData => {
         growth_rate = growth_rate + parseFloat(yearlyData.data.GDP);
         life_expectancy = life_expectancy + parseFloat(yearlyData.data.Life_Expectancy);
         midyear_population = midyear_population + parseFloat(yearlyData.data.Population);
         co2 = co2 + parseFloat(yearlyData.data.Annual_CO2_emissions);
     });
     let count = countryData.yearwiseData.length
     data.push({
         "country_name": countryData.country_name,
         "average_growth_rate": (growth_rate / count).toFixed(2),
         "average_life_expectancy": (life_expectancy / count).toFixed(2),
         "average_midyear_population": (midyear_population / count).toFixed(2),
         "average_co2": (co2 / count).toFixed(2),
     })
 })


console.log(data);

    data = data.sort(function(a, b){
		var a = a["average_growth_rate"],
				b = b["average_growth_rate"];
		return b - a;
	})
	
	const formatText = n => {
     if (n >= 1e6 && n < 1e9) return +(n / 1e9).toFixed(1);
     else if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1);
     else if (n >= 1e12) return +(n / 1e9).toFixed(1);
     else
       return n;
   };
	
	var  new_data = []
     data.forEach(function(item){
         var newSeries = {}
         newSeries.key = item.country_name;
         newSeries.values = [];
         newSeries.values.push({"reason":"GDP","device":item.country_name,"value":parseFloat(item.average_growth_rate)});
         newSeries.values.push({"reason":"Life_Expectancy","device":item.country_name,"value":parseFloat(item.average_life_expectancy)});
         newSeries.values.push({"reason":"Population","device":item.country_name,"value":parseFloat(item.average_midyear_population)});
         newSeries.values.push({"reason":"Average_CO2_Emissions","device":item.country_name,"value":parseFloat(item.average_co2)});
         new_data.push(newSeries);
     })

	
console.log(new_data);


data = new_data.map(function(d) { return d.values })


console.log(data);


    var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){
		return d3.max(i.map(
			function(o){ console.log(o); return o.value; }
		))
	}));


    var minValue = Math.max(0, d3.min(data, function(i){
		return d3.min(i.map(
			function(o){ console.log(o); return o.value; }
		))
	}));
console.log(maxValue);
console.log(minValue);



     cfg.w = 300
     cfg.h = 300
     cfg.margin.left = 200
     cfg.margin.right = 60
     cfg.margin.top = 60
     cfg.margin.bottom = 30
     cfg.legendPosition.x = 50
     cfg.legendPosition.y = 20
     cfg.labelFactor = 1.25
 	var allAxis = (data[0].map(function(d, i){ return d["reason"] })),	//Names of each axis
 		total = allAxis.length,					//The number of different axes
 		radius = Math.min(cfg.w/2, cfg.h/2), 			//Radius of the outermost circle
 		Format = d3.format('%'),			 	//Percentage formatting
 		angleSlice = Math.PI * 2 / total;			//The width in radians of each "slice"
console.log(radius)
 	//Scale for the radius
 	var rScale = d3.scaleLinear()
 	 	.domain([0, maxValue])
 		.range([0, radius]);
 		
 		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(selector).select("svg").remove();

	//Initiate the radar chart SVG

	var svg = svgContainer.append('svg');
            svg
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
//			.attr("width",  500)
//			.attr("height", 500)
			.attr("class", "radar"+selector);
	//Append a g element
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
			
      /////////////////////////////////////////////////////////
  	////////// Glow filter for some extra pizzazz ///////////
  	/////////////////////////////////////////////////////////

  	//Filter for the outside glow
  	var filter = g.append('defs').append('filter').attr('id','glow'),
  		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
  		feMerge = filter.append('feMerge'),
  		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
  		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
  		
  		
  		/////////////////////////////////////////////////////////
      	/////////////// Draw the Circular grid //////////////////
      	/////////////////////////////////////////////////////////

      	//Wrapper for the grid & axes
      	var axisGrid = g.append("g").attr("class", "axisWrapper");

      	//Draw the background circles
      	axisGrid.selectAll(".levels")
      	   .data(d3.range(1,(cfg.levels+1)).reverse())
      	   .enter()
      		.append("circle")
      		.attr("class", "gridCircle")
      		.attr("r", function(d, i){return radius/cfg.levels*d;})
      		.style("fill", "#CDCDCD")
      		.style("stroke", "#CDCDCD")
      		.style("fill-opacity", cfg.opacityCircles)
      		.style("filter" , "url(#glow)");

      	//Text indicating at what % each level is
      	axisGrid.selectAll(".axisLabel")
      	   .data(d3.range(1,(cfg.levels+1)).reverse())
      	   .enter().append("text")
      	   .attr("class", "axisLabel")
      	   .attr("x", 4)
      	   .attr("y", function(d){return -d*radius/cfg.levels;})
      	   .attr("dy", "0.4em")
      	   .style("font-size", "10px")
      	   .attr("fill", "#737373")
      	   .text(function(d,i) { return Format(maxValue * d/(cfg.levels*100)); });
      	   
      	   
      	   
      	   //Create the straight lines radiating outward from the center
         	var axis = axisGrid.selectAll(".axis")
         		.data(allAxis)
         		.enter()
         		.append("g")
         		.attr("class", "axis");
         	//Append the lines
         	axis.append("line")
         		.attr("x1", 0)
         		.attr("y1", 0)
         		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
         		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
         		.attr("class", "line")
         		.style("stroke", "white")
         		.style("stroke-width", "4px");

         	//Append the labels at each axis
         	axis.append("text")
         		.attr("class", "legend")
         		.style("font-size", "11px")
         		.attr("text-anchor", "middle")
         		.attr("dy", "0.35em")
         		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
         		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
         		.text(function(d){return d})
         		.call(wrap, cfg.wrapWidth);
         		
         	/////////////////////////////////////////////////////////
         	///////////// Draw the radar chart blobs ////////////////
         	/////////////////////////////////////////////////////////

         	//The radial line function
         	var radarLine = d3.lineRadial()
			    .curve(d3.curveLinearClosed)
         		.radius(function(d) { return rScale(d.value); })
         		.angle(function(d,i) {	return i*angleSlice; })
 		        ;

         	if(cfg.roundStrokes) {
         		radarLine.curve(d3.curveCardinalClosed);
         	}

         	//Create a wrapper for the blobs
         	var blobWrapper = g.selectAll(".radarWrapper")
         		.data(data)
         		.enter().append("g")
         		.attr("class", "radarWrapper");

         	//Append the backgrounds
         	blobWrapper
         		.append("path")
         		.attr("class", function(d) {
         			return "radarArea" + " " + d[0]["device"].replace(/\s+/g, '') //Remove spaces from the areaName string to make one valid class name
         		})
         		.attr("d", function(d,i) { return radarLine(d); })
         		.style("fill", function(d,i) { return cfg.color(i); })
         		.style("fill-opacity", cfg.opacityArea)
         		.on('mouseover', function (d,i){
         //			console.log("d", d);
         //			console.log("this", this);
         			//Dim all blobs
         			d3.selectAll(".radarArea")
         				.transition().duration(200)
         				.style("fill-opacity", 0.1);
         			//Bring back the hovered over blob
         			d3.select(this)
         				.transition().duration(200)
         				.style("fill-opacity", 0.7);
         		})
         		.on('mouseout', function(){
         			//Bring back all blobs
         			d3.selectAll(".radarArea")
         				.transition().duration(200)
         				.style("fill-opacity", cfg.opacityArea);
         		});

         	//Create the outlines
         	blobWrapper.append("path")
         		.attr("class", "radarStroke")
         		.attr("d", function(d,i) { return radarLine(d); })
         		.style("stroke-width", cfg.strokeWidth + "px")
         		.style("stroke", function(d,i) { return cfg.color(i); })
         		.style("fill", "none")
         		.style("filter" , "url(#glow)");

         	//Append the circles
         	blobWrapper.selectAll(".radarCircle")
         		.data(function(d,i) { return d; })
         		.enter().append("circle")
         		.attr("class", "radarCircle")
         		.attr("r", cfg.dotRadius)
         		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
         		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
         		.style("fill", function(d,i,j) { return cfg.color(j); })
         		.style("fill-opacity", 0.8);
         		
         		
         		/////////////////////////////////////////////////////////
             	//////// Append invisible circles for tooltip ///////////
             	/////////////////////////////////////////////////////////

             	//Wrapper for the invisible circles on top
             	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
             		.data(data)
             		.enter().append("g")
             		.attr("class", "radarCircleWrapper");

             	//Append a set of invisible circles on top for the mouseover pop-up
             	blobCircleWrapper.selectAll(".radarInvisibleCircle")
             		.data(function(d,i) { return d; })
             		.enter().append("circle")
             		.attr("class", "radarInvisibleCircle")
             		.attr("r", cfg.dotRadius*1.5)
             		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
             		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
             		.style("fill", "none")
             		.style("pointer-events", "all")
             		.on("mouseover", function(d,i) {
             			var newX =  parseFloat(d3.select(this).attr('cx')) - 10;
             			var newY =  parseFloat(d3.select(this).attr('cy')) - 10;

             			tooltip
             				.attr('x', newX)
             				.attr('y', newY)
             				.text(Format(d.value))
             				.transition().duration(200)
             				.style('opacity', 1);
             		})
             		.on("mouseout", function(){
             			tooltip.transition().duration(200)
             				.style("opacity", 0);
             		});

             	//Set up the small tooltip for when you hover over a circle
             	var tooltip = g.append("text")
             		.attr("class", "tooltip")
             		.style("opacity", 0);

      	   
      	   


    function wrap(text, width) {
	  text.on(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}
	
	
	// on mouseover for the legend symbol
	function cellover(d) {
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1);
			//Bring back the hovered over blob
			d3.select("." + data[d][0]["device"].replace(/\s+/g, ''))
				.transition().duration(200)
				.style("fill-opacity", 0.7);
	}

	// on mouseout for the legend symbol
	function cellout() {
		//Bring back all blobs
		d3.selectAll(".radarArea")
			.transition().duration(200)
			.style("fill-opacity", cfg.opacityArea);
	}

}
