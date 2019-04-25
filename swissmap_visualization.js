// add svg element to body, make it scalable
var svg = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 600")
    .classed("map-content", true);
    
// set layer imports        
var infile1 = "data/kantone_lines_topo.json";
var infile2 = "data/flussdaten.json";
var infile3 = "data/weatherstations.json";
var infile4 = "data/swissLakes_topo.json";
var infile5 = "data/eierhals/hotel_eierhals.json";
var infile6 = "data/badeindex_vectorized_topo.json";
    
    
    
//read in files
d3.queue()
    .defer(d3.json, infile1)
    .defer(d3.json, infile2)
    .defer(d3.json, infile3)
    .defer(d3.json, infile4)
    .defer(d3.json, infile5)
    .defer(d3.json, infile6)
    .await(ready);


    
// create projection and center it
var projection = d3.geoMercator()
    //centering the map on screen (do not fuck with these values!)
    .translate([-940, 9555])
    .scale(10000);
    
// create path (geoPath) using the projection
var path = d3.geo.path().projection(projection);

// load geometries, add to svg, add tooltip mechanic and slider bars etc.
function ready (error, data, infile2, infile3, infile4, infile5, infile6) {
    
    // add Tooltip (Popup)
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
            .style("border-color", d3.select(this).attr("fill"))
            .style("left", cx + "px")
            .style("top", cy + "px")
            
        // if mouse hovers over wetter, read in metadata from weather
        if (d3.select(this).attr("class") == "wetter"){
            Tooltip.html("<strong>"+d.properties.Name+"</strong>" + " (" + d.properties.Station + ")" + "<br>" + "Höhe (m.ü.M): " + d.properties.Höhe + "<br>" + "Temperatur (°C): " + d.properties["Temperatur (°C)"] + "<br>" + "Luftfeuchtigkeit (%): " + d.properties["Luftfeuchte (%)"] + "<br>" + "Niederschlag (mm): " + d.properties["Niederschlag (mm)"])
            
        // if mouse hovers over flussMess, read in metadata from flussMess    
        } else if (d3.select(this).attr("class")== "flussMess"){
            Tooltip.html("<strong>" + d.properties.name.substr(0, d.properties.name.length - 7) + "</strong>" + "<br>" + "Wassertemperaturklasse: " + d.properties["temp-class"] + "<br>")
            
        } else {
            Tooltip.html(d.properties)}
        
    }
            
    var mousemove = function(d) {
        Tooltip.style("opacity", 1)
    }
    var mouseleave = function(d) {
        Tooltip.style("opacity", 0)
    }
    
    //loading data for infile6
    var b_index = topojson.feature(infile6, infile6.objects.badeindex_vectorized).features;

        svg.selectAll(".b_index")
            .data(b_index)
            .enter().append("path")
            .attr("class", "b_index")
            .attr("border-style", "solid")
            .attr("fill", function(d,i){
                var DN = b_index[i].properties.DN;
                var DN2 = DN/100;
                var DN3 = 1-DN2;
                return d3.interpolateRdYlBu(DN3)
        })
            .attr("border-width", "1px")
            .attr("d", path);
    
    
    //loading data for infile1
    var kantone = topojson.feature(data, data.objects.kantone_lines).features;
        //console.log("kantone", kantone)

        svg.selectAll(".kantone")
            .data(kantone)
            .enter().append("path")
            .attr("class", "kantone")
            .attr("fill", "white")
            .attr("fill-opacity", "0")
            .attr("d", path);
    
    //loading data for infile6
    var b_index_2 = topojson.feature(infile6, infile6.objects.badeindex_vectorized).features;

        svg.selectAll(".b_index_2")
            .data(b_index)
            .enter().append("path")
            .attr("class", "b_index_2")
            .attr("fill-opacity", "0")
            .attr("d", path)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
    
    
    // loading data for infile4
    var lakes = topojson.feature(infile4, infile4.objects.swissLakes).features;
    //console.log("swissLakes", lakes);
    
    //Actually Appending lakes
    
            svg.selectAll(".lakes")
            .data(lakes)
            .enter().append("path")
            .attr("class", "lakes")
            .attr("d", path)
    
            

    
    
    
    //loading data for infile2
    var flussMess = topojson.feature(infile2, infile2.objects.flussdaten).features;
    //console.log("flussMess", flussMess)
        
        
        svg.selectAll(".flussMess")
            .data(flussMess)
            .enter().append("circle")
            .attr("class", "flussMess")
            .attr("r", 5)
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
    //console.log("wetter", wetter)
        
            svg.selectAll(".wetter")
            .data(wetter)
            .enter().append("circle")
            .attr("class", "wetter")
            .attr("r", 5)
            .attr("fill-opacity", "0.7")
            .attr("fill", "black")
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
        svg.selectAll("circle")
            .transition()
            .duration(200)
            .attr("r", buff)
        });
    
    // enable/disable Wettermesstationen
    d3.select("#CheckLayer1").on("change",function(d){
        checked = d3.select("#CheckLayer1").property("checked")
        
        if (checked) {
            svg.selectAll(".wetter")
                .transition()
                .duration(1000)
                .attr("display", "block")
            
        } else {
            svg.selectAll(".wetter")
                .transition()
                .duration(1000)
                .attr("display", "none")
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
    
    //loading data for infile5
    var hotel_eierhals = topojson.feature(infile5, infile5.objects.hotel_eierhals).features;
    //console.log("EIERHALS", hotel_eierhals)
        
        
    svg.selectAll(".hotel_eierhals")
        .data(hotel_eierhals)
        .enter().append("circle")
        .attr("class", "hotel_eierhals")
        .attr("r", 4)
        .attr("fill-opacity", "0.0000001")

        // Move this part to the layer that should be affected by eierhals shenanigans
        .on("mouseover", function(d){
            if (eiercheck){
                svg.selectAll(".eierhals")
                    .attr("display", "block")
                    console.log("Hotel Eierhals: http://www.hotel-eierhals.ch/")
                    }
            else {svg.selectAll(".eierhals")
                    .attr("display", "none")}
        })
        .on("mousemove", function(d){
                svg.selectAll(".eierhals")
        })
        .on("mouseleave", function(d){
                    svg.selectAll(".eierhals")
                    .attr("display", "none")})
        //----------------------------------------------------------------------------

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
    
    //Eiercheck
    var eiercheck = d3.select("#Eiercheck").property("checked")
    var eier = svg.selectAll("image").data([0]);
        eier.enter()
        .append("svg:image")
        .attr("xlink:href", "data/eierhals/eierhals3.jpeg")
        .attr("x", "300")
        .attr("y", "100")
        .attr("class", "eierhals")
        .attr("display", "none")
                     
    d3.select("#Eiercheck").on("change",function(d){
        eiercheck = d3.select("#Eiercheck").property("checked")
        console.log("Eiercheckd ", eiercheck)
        });
           
        
    
    }