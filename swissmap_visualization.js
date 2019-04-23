// add svg element to body, make it scalable
var svg = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 600")
    .classed("map-content", true);
    
// set layer imports        
var infile1 = "data/kantone_topo.json";
var infile2 = "data/flusstemperaturen.json";
var infile3 = "data/weatherstations.json";
var infile4 = "data/swissLakes_topo.json";
    
    
    
//read in files
d3.queue()
    .defer(d3.json, infile1)
    .defer(d3.json, infile2)
    .defer(d3.json, infile3)
    .defer(d3.json, infile4)
    .await(ready);
    
// create projection and center it
var projection = d3.geoMercator()
    //centering the map on screen (do not fuck with these values!)
    .translate([-940, 9555])
    .scale(10000);
    
// create path (geoPath) using the projection
var path = d3.geo.path().projection(projection);
    
    
// load geometries, add to svg, add tooltip mechanic and slider bars etc.
function ready (error, data, infile2, infile3, infile4) {
    
    // add Tooltip (Popup)
    // create a tooltip
    var Tooltip = d3.select("#map")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "1px")
      .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        
        var cx = d3.mouse(this)[0]+10 
        var cy = d3.mouse(this)[1] 
        
        
        
        Tooltip
            .style("left", cx + "px")
            .style("top", cy + "px")
            .html("<h6>" + d.properties.name + "</h6>" + "<br>")
    }
    var mousemove = function(d) {
        
        Tooltip.style("opacity", 1)
        
        

    }
    var mouseleave = function(d) {
      Tooltip.style("opacity", 0)
    }
        
    //loading data for infile1
    var kantone = topojson.feature(data, data.objects.kantone).features;
        console.log("kantone", kantone)

        svg.selectAll(".kantone")
            .data(kantone)
            .enter().append("path")
            .attr("class", "kantone")
            .attr("d", path);
    
    // loading data for infile4
    var lakes = topojson.feature(infile4, infile4.objects.swissLakes).features;
    console.log("swissLakes", lakes);
        
            svg.selectAll(".lakes")
            .data(lakes)
            .enter().append("path")
            .attr("class", "lakes")
            .attr("d", path);
           
        
    //loading data for infile2
    var flussMess = topojson.feature(infile2, infile2.objects.flusstemperaturen).features;
    console.log("flussMess", flussMess)
        
        
        svg.selectAll(".flussMess")
            .data(flussMess)
            .enter().append("circle")
            .attr("class", "flussMess")
            .attr("r", 3)
            .attr("fill-opacity", "0.7")
            .attr("fill", "blue")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .attr("cx", function(d){
                // get longitude from data (coordinates [long/lat])
                var coords = projection(d.geometry.coordinates)
                //console.log("long", coords)
                return coords[0];
            })
        
            .attr("cy",  function(d){
                // get latitude from data
                var coords = projection(d.geometry.coordinates)
                //console.log("lat", coords)
                return coords[1];
            })
        
    // loading data for infile3
    var wetter = topojson.feature(infile3, infile3.objects.weatherstation).features;
    console.log("wetter", wetter)
        
            svg.selectAll(".wetter")
            .data(wetter)
            .enter().append("circle")
            .attr("class", "wetter")
            .attr("r", 3)
            .attr("fill-opacity", "0.7")
            .attr("fill", "white")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .attr("cx", function(d){
                // get longitude from data (coordinates [long/lat])
                var coords = projection(d.geometry.coordinates)
                return coords[0];
            })
        
            .attr("cy",  function(d){
                // get latitude from data
                var coords = projection(d.geometry.coordinates)
                return coords[1];
            })
        
    
     
    
    
    // adding event listener for slider to allow for user defined visualization
    d3.select("#BufferSlider").on("change", function(d){
        var buff = this.value
        d3.select("#svg")
        svg.selectAll("circle").transition().duration(1000).attr("r", buff)
        });
    
    // enable/disable Wettermesstationen
    d3.select("#CheckLayer1").on("change",function(d){
        checked = d3.select("#CheckLayer1").property("checked")
        
        if (checked) {
            svg.selectAll(".wetter").transition().duration(1000).attr("display", "block")
            
        } else {
            svg.selectAll(".wetter").transition().duration(1000).attr("display", "none")
        }
        });
    
    // enable/disable Flusstemperaturmesstationen
    d3.select("#CheckLayer2").on("change",function(d){
        checked = d3.select("#CheckLayer2").property("checked")
        
        if (checked) {
            svg.selectAll(".flussMess").transition().duration(1000).attr("display", "block")
            
        } else {
            svg.selectAll(".flussMess").transition().duration(1000).attr("display", "none")
        }
        });
    
    
    
    }



