var countries;
var selectedCountries = []

export function createWorldMap(selector, demographicData , attr) {
  {
      //console.log("in map:");
      //console.log(attr);
    selectedCountries = [];

    let svgContainer = d3.select(selector)
    if (svgContainer) svgContainer.selectAll("*").remove();
    let svg = svgContainer.append('svg');

    let optWidth = svgContainer.node().getBoundingClientRect().width;
    let optHeight = svgContainer.node().getBoundingClientRect().height;

    let width = optWidth;
    let height = optHeight;


    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("perserveAspectRatio", "xMinYMid meet");

    let projection = d3.geoMercator();

    let path = d3.geoPath()
      .projection(projection);

    d3.select(".d3-tip-world").remove();
        //console.log( demographicData);

    d3.json("/static/json/countries-50m.json", function (err, worldData) {
      createMap(demographicData, worldData);
    });

    function createMap(demographicData, worldData) {
          //console.log("in biuboiuboiu:");
          
    //console.log(demographicData);

      let worldGeoJson = topojson.feature(worldData, worldData.objects.countries);
      projection.fitExtent([[0, 0], [optWidth, optHeight]], worldGeoJson)


      // .fitExtent([[0, 0], [optWidth, 0.9 *optHeight]]
        
      let avgAttributeData = []
      demographicData.forEach(countryData => {
        let attributeTotal = 0;
        countryData.yearwiseData.forEach(yearlyData => {
          attributeTotal = attributeTotal + parseFloat(yearlyData.data[attr])
        })
        let attributeDataValue = attributeTotal / countryData.yearwiseData.length
        avgAttributeData.push({
          "country_name": countryData.country_name,
          [attr]: attributeDataValue
        })
      })
      
      const formatCash = n => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};

 const formatText = n => {
  if (n >= 1e5 && n < 1e9) return +(n / 1e6).toFixed(1);
  else if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1);
  else if (n >= 1e12) return +(n / 1e9).toFixed(1);
  else
  return parseInt(n);
};


      //console.log(avgAttributeData);
      
      let tip = d3.tip()
        .attr('class', 'd3-tip d3-tip-world')
        .attr("pointer-events", "none")

        .style("background-color", "rgba(255, 255, 255, 0.85)")
        .style("border", "1px solid #574384")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "8px")
        .style("text-align", "center")
        .html(function (d) {
        //console.log(formatCash(avgAttributeData.find(el => el.country_name === d.properties.name)[attr]));
          return "<h3 style=\"margin:0\">" + d.properties.name + "</h3>" +
            "<p style=\"margin:0\"> " +attr + " : " + formatCash(avgAttributeData.find(el => el.country_name === d.properties.name)[attr])+ "</p>";
        })
        
      // defining color scale
      let mapColorDomain = avgAttributeData.map(el => el[attr]);
      mapColorDomain = mapColorDomain.sort((a, b) => a - b);
      // getting unique values
      mapColorDomain = mapColorDomain.filter((value, index, self) => {
        return self.indexOf(value) === index;
      })
      
    //console.log(mapColorDomain)
    var thres = new Set();
    var leg = new Set();
    var temp =[]
  var c=9;
  if(mapColorDomain.length<9){
    c=1;
  }  
    for(let i=0;i<mapColorDomain.length;i+=c)
    {
     thres.add(mapColorDomain[i]);
     leg.add(formatText(mapColorDomain[i]));
  //   temp.push(formatCash(mapColorDomain[i]));
    }
    
  

     //var colors_new=["#ffffff","#ffe6f9","#ffccf2","#ffb3ec","#ff99e5","#ff80df","#ff66d9","#ff4dd2","#ff33cc","#ff1ac6","#ff00bf","#e600ac","#cc0099","#b30086","#990073"];
     // var myColor = d3.scaleOrdinal().domain(mapColorDomain).range(colors_new);
      var myColor = d3.scaleThreshold().domain(Array.from(thres)).range(d3.schemeBlues[thres.size]);
      var LegmyColor = d3.scaleQuantile().domain(Array.from(leg)).range(d3.schemeBlues[leg.size]);

      svg.call(tip);
      
      const zoom = d3.zoom()
      .on("zoom", () => g.attr("transform", d3.event.transform))
      .scaleExtent([1, 18])
      .translateExtent([[0,0], [width, height]])

      countries = svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(worldGeoJson.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function (d) {
          if (avgAttributeData.some(el => el.country_name === d.properties.name)) {
            return myColor(avgAttributeData.find(el => el.country_name === d.properties.name)[attr]);
          } else {
            return "gray"
          }
        })
        .style('stroke', 'white')
        .style("opacity", 0.8)
        .style('stroke-width', 0.3)

      countries
        .on('click', click())
        .on("mousemove", function (clickedCountry) {

          //console.log("in")
          //console.log(clickedCountry)
          d3.select(".d3-tip-world")
          tip.show(clickedCountry);
          tip.style("top", d3.event.pageY + 10 + "px")
          tip.style("left", d3.event.pageX + 10 + "px")
        })
        .on("mouseout", function (clickedCountry) {
          tip.hide()
          // d3.select(".d3-tip-world")
          //   .style("opacity", 0)
        })
        
        
        countries.call(zoom);
       const g=  countries;
       g.append("rect")
            .attr("class", "background")
            .attr("width", 100)
            .attr("height", 100)
        function zoomed() {
          g.style("stroke-width", 0.5 / d3.event.transform.k + "px");
          // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
          g.attr("transform", d3.event.transform); // updated for d3 v4
        }
        
         let colorLegend = d3.legendColor()
           .labelFormat(d3.format(".0f"))
           .scale(LegmyColor)
           .orient("horizontal")
           .shapeWidth(width / 10)
           .shapeHeight(13)
           .cells(9)
           .labelOffset(-10)

         let legend = svg.append("g")
           .attr("class", "legend")
           .call(colorLegend)

         let dx = (svg.attr("width") - legend.attr("width")) / 4
         if(leg.size<=5)
         {
           legend
           .attr("transform", "translate(" + (dx) + "," + (height) + ")")
         
         }
         else
         {
          legend
            .attr("transform", "translate(" + (-130+dx) + "," + (height) + ")")
           }
         

         legend.selectAll("g.cell text")
           .style("fill", "black")
           .style("font-size", "8px")


      



      function click() {
      //console.log("in clicked");
        return clickedCountry => {
          if (selectedCountries.includes(clickedCountry.properties.name) && selectedCountries.length === 1) {
            countries.style("fill-opacity", 1)
            selectedCountries = [];
            let event = new CustomEvent("worldMapClicked", {
              detail: {
                "selectedCountries": selectedCountries,
              }
            });
            document.dispatchEvent(event);
          } else {
            countries.style("fill-opacity", function (country) {
              if (country.properties.name === clickedCountry.properties.name) {
                if (selectedCountries.includes(clickedCountry.properties.name)) {
                  selectedCountries = selectedCountries.filter(el => el !== clickedCountry.properties.name);
                  let event = new CustomEvent("worldMapClicked", {
                    detail:
                    {
                      "selectedCountries": selectedCountries,
                    }
                  });
                  document.dispatchEvent(event);
                  return 0.3;
                } else {

                  selectedCountries.push(clickedCountry.properties.name)
                  let event = new CustomEvent("worldMapClicked", {
                    detail:
                    {
                      "selectedCountries": selectedCountries,
                    }
                  });
                  document.dispatchEvent(event);
                  return 1;
                }
              } else {
                if (selectedCountries.includes(country.properties.name)) {
                  return 1
                } else {
                  return 0.3;
                }
              }
            })
          }
        }
      }
     
    }
  }
}




export function updateWorldMap(selector, filtereddemographicData,attr) {


  selectedCountries = filtereddemographicData.map(el => el.country_name);
   
//console.log(filtereddemographicData);

  let avgAttributeData = []
  filtereddemographicData.forEach(countryData => {
    let attributeTotal = 0;
    if(countryData.yearwiseData.length > 0){
      countryData.yearwiseData.forEach(yearlyData => {
        attributeTotal = attributeTotal + parseFloat(yearlyData.data[attr])
      })
      let attributeDataValue = attributeTotal / countryData.yearwiseData.length
      avgAttributeData.push({
        "country_name": countryData.country_name,
        [attr]: attributeDataValue
      })
    }
  })
  
   const formatCash = n => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};

 const formatText = n => {
  if (n >= 1e5 && n < 1e9) return +(n / 1e6).toFixed(1);
  else if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1);
  else if (n >= 1e12) return +(n / 1e9).toFixed(1);
  else
    return parseInt(n.toFixed(1));
};
  d3.select('.d3-tip').remove();
let tip = d3.tip()
.attr('class', 'd3-tip d3-tip-world')
.attr("pointer-events", "none")

.style("background-color", "rgba(255, 255, 255, 0.85)")
.style("border", "1px solid #574384")
.style("border-radius", "5px")
.style("padding", "5px")
.style("font-size", "8px")
.style("text-align", "center")
.html(function (d) {
//console.log(formatCash(avgAttributeData.find(el => el.country_name === d.properties.name)[attr]));
  return "<h3 style=\"margin:0\">" + d.properties.name + "</h3>" +
    "<p style=\"margin:0\"> " +attr + " : " + formatCash(avgAttributeData.find(el => el.country_name === d.properties.name)[attr])+ "</p>";
})
  let mapColorDomain = avgAttributeData.map(el => el[attr]);
      mapColorDomain = mapColorDomain.sort((a, b) => a - b);
      // getting unique values
      mapColorDomain = mapColorDomain.filter((value, index, self) => {
        return self.indexOf(value) === index;
      })
      
      let svgContainer = d3.select(selector)
     let svg = svgContainer.select("svg");
     svg.call(tip);
     var thres = new Set();
     var leg = new Set();
     var temp =[]
     var c=9;
     if(mapColorDomain.length<9){
      c=1;
    }  
      for(let i=0;i<mapColorDomain.length;i+=c)
      {
      thres.add(mapColorDomain[i]);
      leg.add(formatText(mapColorDomain[i]));
   //   temp.push(formatCash(mapColorDomain[i]));
     }


     var legendsize=leg.size>=3 ? leg.size:3;;
     
        //console.log(thres);
        var myColor = d3.scaleThreshold().domain(Array.from(thres)).range(d3.schemeBlues[legendsize]);
        var LegmyColor = d3.scaleQuantile().domain(Array.from(leg)).range(d3.schemeBlues[legendsize]);
  
  let width = svgContainer.node().getBoundingClientRect().width;
  let height = svgContainer.node().getBoundingClientRect().height;


  d3.select("g.legend").remove();

  let colorLegend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .scale(LegmyColor)
    .orient("horizontal")
    .shapeWidth(width / 10)
    .shapeHeight(13)
    .cells(9)
    .labelOffset(-10)
    
if(leg.size>=3){
 let legend = svg.append("g")
   .attr("class", "legend")
   .call(colorLegend)

 let dx = (svg.attr("width") - legend.attr("width")) / 4
 if(leg.size<=5)
{
  legend
  .attr("transform", "translate(" + (dx) + "," + (-10+height) + ")")

}
else
{
 legend
   .attr("transform", "translate(" + (-130+dx) + "," + (-10+height) + ")")
}

 legend.selectAll("g.cell text")
   .style("fill", "black")
   .style("font-size", "8px")

}
  countries.style("fill-opacity", function (country) {
    if (avgAttributeData.length == 0) {
      return 1;
    }
    
    if (avgAttributeData.some(el => el.country_name === country.properties.name)) {
      d3.select(this).style("fill", myColor(avgAttributeData.find(el => el.country_name === country.properties.name)[attr]))
      return 1;

    } else {
      d3.select(this).style("fill", "gray");
      return 0.3;
    }
  });


   countries
  // .on('click', click())
  .on("mousemove", function (clickedCountry) {

    //console.log("in")
    //console.log(clickedCountry)
    d3.select(".d3-tip-world")
    tip.show(clickedCountry);
    tip.style("top", d3.event.pageY + 10 + "px")
    tip.style("left", d3.event.pageX + 10 + "px")
  })
  .on("mouseout", function (clickedCountry) {
    tip.hide()
    // d3.select(".d3-tip-world")
    //   .style("opacity", 0)
  })
  
  }