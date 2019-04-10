(function () {
    
    // set up margins
    var margin = { top: 100, left: 100, right: 50, bottom: 100},
        height = 1000 - margin.top - margin.bottom,
        width = 1500 - margin.left - margin.right;
    
    console.log("height, width", height, width)
    
    // add svg element to body
    var svg = d3.select("#map")
                .append("svg")
                .attr("height", height + margin.top + margin.bottom)
                .attr("width", width + margin.left + margin.right)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // set imports        
    var infile1 = "data/kantone_topo.json";
    var infile2 = "data/flusstemperaturen.json";
    
    //read in files
    d3.queue()
        .defer(d3.json, infile1)
        .defer(d3.json, infile2)
        .await(ready);
    
    // create projection and center it
    var projection = d3.geoMercator()
        //centering the map on screen
        .translate([-900, 9600])
        .scale(10000);
    
    // create path (geoPath) using the projection
    var path = d3.geo.path().projection(projection);
    
    
    
    // load geometries, add to svg
    function ready (error, data, infile2) {
        
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
            .attr("r", 5)
            .attr("cx", function(d){
                // get longitude from data (coordinates [long/lat])
                var coords = projection(d.geometry.coordinates)
                console.log("long", coords)
                return coords[0];
            })
        
            .attr("cy",  function(d){
                // get latitude from data
                var coords = projection(d.geometry.coordinates)
                console.log("lat", coords)
                return coords[1];
            })
            
    }


            

    
    
    
    
    
})();