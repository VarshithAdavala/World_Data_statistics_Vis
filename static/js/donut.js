
   $(function() {

       var donutData = genData();
       console.log(donutData)

       var donuts = new DonutCharts();
       donuts.create(donutData);

       $('#refresh-btn').on('click', function refresh() {
           donuts.update(genData);
       });
   

   });
    

     function DonutCharts(data) {
        
console.log("In donut "+data)
        var charts = d3.select('#bubble-scatterplot');

        var chart_m,
            chart_r,
            color = d3.scaleOrdinal(d3.schemeBlues[6]);

        var getCatNames = function(dataset) {
            var catNames = new Array();

            for (var i = 0; i < dataset[0].data.length; i++) {
                catNames.push(dataset[0].data[i].cat);
            }

            return catNames;
        }


        var createCenter = function(pie) {

           

            var donuts = d3.selectAll('.donut');

            // The circle displaying total data.
            donuts.append("svg:circle")
                .attr( "r", chart_r * 0.6)
                .attr("id", "donut_center")
                .style("fill", "#E7E7E7")

                .on( "mouseover",function(d, i) {
                    d3.select(this)
                        .transition()
                        .attr( "r", chart_r * 0.65);
                })
                .on( "mouseout",function(d, i) { d3.select(this)
                     .transition()
                     .duration(500)
                     .ease(d3.easeBounce)
                     .attr( "r", chart_r * 0.6);
             })
             .on( "click",function(d, i) {
                var paths = charts.selectAll('.clicked');
                pathAnim(paths, 0);
                paths.classed('clicked', false);
                resetAllCenterText();
            });

            donuts.append('text')
                    .attr('class', 'center-txt type')
                    .attr('y', chart_r * -0.16)
                    .attr('text-anchor', 'middle')
                    .style('font-weight', 'bold')
                 
                    .text(function(d, i) {
                        return d.type;
                    });
            // donuts.append('text')
            //         .attr('class', 'center-txt value')
            //         .attr('text-anchor', 'middle');
            donuts.append('text')
                    .attr('class', 'center-txt value')
                    .attr('y', chart_r * 0.16)
                    .attr('text-anchor', 'middle')
                    .attr('font-size','12px')
                    .style('font-weight', 'bold')
                    .text("GDP");
                  
        }

        var setCenterText = function(thisDonut) {
        console.log("in center text");
            var sum = d3.sum(thisDonut.selectAll('.clicked').data(), function(d) {
                return d.data.val;
            });
            if(thisDonut.selectAll('.clicked')._groups[0][0]!=null)
            {
                let selectedAttr =thisDonut.selectAll('.clicked')._groups[0][0].__data__.data.cat;
            thisDonut.selectAll('.value')
                .text(selectedAttr);
                }
                else
                {
                thisDonut.selectAll('.value')
                    .text("GDP");
                }
           
                  
        }
        
        var diapatchEvent = function(thisDonut) {
            var selectedAttr =thisDonut.selectAll('.clicked')._groups[0][0].__data__.data.cat;
                if (1 === thisDonut.selectAll('.clicked')._groups[0].length){
                let event = new CustomEvent("change", {
                    detail: {
                      "data": selectedAttr,
                    }
                  });
                  document.dispatchEvent(event);
                }
                  
        }

         function resetAllCenterText() {
            charts.selectAll('.value')
                .text(function(d) {
                    return d.data.cat==null? "GDP" : d.data.cat ;
                });
        }

        var pathAnim = function(path, dir) {
            switch(dir) {
                case 0:
                    path.transition()
                        .duration(500)
                        .ease(d3.easeBounce)
                        .attr('d', d3.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(chart_r)
                        );
                    break;

                case 1:
                    path.transition()
                        .attr('d', d3.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(chart_r * 1.08)
                        );
                    break;
            }
        }

        var updateDonut = function() {


            var pie = d3.pie()
                            .sort(null)
                            .value(function(d) {
                                return d.val;
                            });

            var arc = d3.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(function() {
                                return (d3.select(this).classed('clicked'))? chart_r * 1.08
                                                                           : chart_r;
                            });

            // Start joining data with paths
            var paths = charts.selectAll('.donut')
                            .selectAll('path')
                            .data(function(d, i) {
                                return pie(d.data);
                            });

            paths
                .transition()
                .duration(1000)
                .attr('d', arc);

            paths.enter()
                .append('svg:path')
                    .attr('d', arc)
                    .style('fill', function(d, i) {
                        return color(i);
                    })
                    .style('stroke', '#FFFFFF')
                  .on("mouseover", function(d, i, j) {
                    pathAnim(d3.select(this), 1);

                    var thisDonut = d3.selectAll('.type0');
                    thisDonut.select('.value').text(function(donut_d) {
                        return d.data.cat;
                    });
                })
                .on("mouseout", function(d, i, j) {
                    var thisPath = d3.select(this);
                    if (!thisPath.classed('clicked')) {
                        pathAnim(thisPath, 0);
                    }
                    var thisDonut = d3.selectAll('.type0');
                    setCenterText(thisDonut);
                    //resetAllCenterText()
                })
                .on("click",function(d, i, j) {
                    var thisDonut = d3.selectAll('.type0');

                    console.log("Akhila");


                  //  if (0 === thisDonut.selectAll('.clicked')._groups[0].length) {
                        thisDonut.select('circle').on('click')();
                    //}

                    var thisPath = d3.select(this);
                    var clicked = thisPath.classed('clicked');
                    pathAnim(thisPath, ~~(!clicked));
                    thisPath.classed('clicked', !clicked);

                    setCenterText(thisDonut);
                    diapatchEvent(thisDonut);
                });

            paths.exit().remove();

            resetAllCenterText();
        }

        this.create = function(dataset) {
        let $charts = d3.select('#bubble-scatterplot')

         chart_m = $charts.node().getBoundingClientRect().width/2;
         chart_r = $charts.node().getBoundingClientRect().height/2;
        console.log(chart_m)
                console.log(chart_r)
        
          //  var $charts = $('#bubble-scatterplot');
            //chart_m = $charts.innerWidth() / dataset.length / 2 * 0.14;
           // chart_r = $charts.innerWidth() / dataset.length / 2 * 0.85;

            // charts.append('svg')
            //     .attr('class', 'legend')
            //     .attr('width', '100%')
            //     .attr('height', 50)
            //     .attr('transform', 'translate(0, -100)');

            var donut = charts.selectAll('.donut')
                            .data(dataset)
                        .enter().append('svg:svg')
                            .attr('width', (chart_r + chart_m) * 2)
                            .attr('height', (chart_r + chart_m) * 2)
                        .append('svg:g')
                            .attr('class', function(d, i) {
                                return 'donut type' + i;
                            })
                            .attr('transform', 'translate(170.42999999999998,135.42999999999998)');

          //  createLegend(getCatNames(dataset));
            createCenter();

            updateDonut();
        }
    
        this.update = function(dataset) {
            // Assume no new categ of data enter
            var donut = charts.selectAll(".donut")
                        .data(dataset);

            updateDonut();
        }
    }


    /*
     * Returns a json-like object.
     */
    function genData() {
        var type = ['Attributes'];
      //  var unit = ['M', 'GB', ''];
        var cat = ['Population', 'Annual_CO2_emissions', 'Life_Expectancy', 'GDP' , 'Mortality_Rate' , 'Tourism' , 'Terrorism' , 'Homicide_Rate' , 'Depression_percent'];

        var dataset = new Array();

        for (var i = 0; i < type.length; i++) {
            var data = new Array();
            var total = 0;

            for (var j = 0; j < cat.length; j++) {
                var value = 11.1;
                total += value;
                data.push({
                    "cat": cat[j],
                    "val": value
                });
            }

            dataset.push({
                "type": type[i],
                "data": data,
                "total": total
            });
        }
        return dataset;
    }
