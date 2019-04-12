    // add svg element to body, make it scalable
    var svg = d3.select("#map")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1000 600")
        .classed("map-content", true);
    
    // set imports        
    var infile1 = "data/kantone_topo.json";
    var infile2 = "data/flusstemperaturen.json";
    var infile3 = "data/weatherstations.json";
    
    
    
    //read in files
    d3.queue()
        .defer(d3.json, infile1)
        .defer(d3.json, infile2)
        .defer(d3.json, infile3)
        .await(ready);
    
    // create projection and center it
    var projection = d3.geoMercator()
        //centering the map on screen (do not fuck with these values!)
        .translate([-940, 9555])
        .scale(10000);
    
    // create path (geoPath) using the projection
    var path = d3.geo.path().projection(projection);
    
    
    
    // load geometries, add to svg
    function ready (error, data, infile2, infile3) {
        
    //loading data for infile1
    var kantone = topojson.feature(data, data.objects.kantone).features;
        console.log("kantone", kantone)

        svg.selectAll(".kantone")
            .data(kantone)
            .enter().append("path")
            .attr("class", "kantone")
            .attr("d", path)
        
            //add hover-over mechanic
            .on('mouseover', function(d){
                d3.select(this).classed("selected", true)
            })
            .on('mouseout', function(d){
                d3.select(this).classed("selected", false)
            });
           
        
    //loading data for infile2
    var flussMess = topojson.feature(infile2, infile2.objects.flusstemperaturen).features;
    console.log("flussMess", flussMess)
        
        
        svg.selectAll(".flussMess")
            .data(flussMess)
            .enter().append("circle")
            .attr("r", 3)
            .attr("fill", "blue")
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
            .attr("r", 3)
            .attr("fill", "white")
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
        
        
            
    }