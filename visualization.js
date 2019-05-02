//--------------------------- SETUP -----------------------------------
// add svg element to body, make it scalable
var svg = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 600")
    .classed("map-content", true);

// set up grouping
var gIndex = svg.append("g");
var gKantone = svg.append("g");
var gIndex2 = svg.append("g");
var gLakes = svg.append("g");
var gHauptorte = svg.append("g");
var gflussMess = svg.append("g");
var gWetter = svg.append("g");
var gEierhals = svg.append("g");


// set layer imports        
var infile1 = "data/kantone_lines_topo.json";
var infile2 = "data/flussdaten.json";
var infile3 = "data/weatherstations.json";
var infile4 = "data/swissLakes_topo.json";
var infile5 = "data/eierhals/hotel_eierhals.json";
var infile6 = "data/GIS/badeindex_vect32.json";
var infile7 = "data/hauptorte.json";


// set threshold for badeindex
var thresh = 30;

// set parameters for visualization
var point_radius = 4;
var color_fluss = "lightblue";
var color_wetter = "grey";
     
//read in files
d3.queue()
    .defer(d3.json, infile1)
    .defer(d3.json, infile2)
    .defer(d3.json, infile3)
    .defer(d3.json, infile4)
    .defer(d3.json, infile5)
    .defer(d3.json, infile6)
    .defer(d3.json, infile7)
    .await(ready);

 
// create projection and center it
var projection = d3.geoMercator()
    //centering the map on screen (do not fuck with these values!)
    .translate([-940, 9555])
    .scale(10000);
    
// create path (geoPath) using the projection
var path = d3.geo.path().projection(projection);

//--------------------------- SETUP -----------------------------------

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
    
    
    // Three functions that change the tooltip when user hovers / moves / leaves a cell
    var mouseover = function(d) {
        
        var featureClass = d3.select(this).attr("class");
        var cx = d3.event.pageX + 10
        var cy = d3.event.pageY - 39
        
        Tooltip
            .style("border-color", d3.select(this).attr("fill"))
            .style("left", cx + "px")
            .style("top", cy + "px")
            
        // if mouse hovers over wetter, read in metadata from weather
        if (d3.select(this).attr("class") == "wetter"){
            Tooltip.html("<strong>"+d.properties.Name+"</strong>" + " (" + d.properties.Station + ")" + "<br>" + "Höhe (m.ü.M): " + d.properties.Höhe + "<br>" + "Lufttemperatur (°C): " + d.properties["Temperatur (°C)"] + "<br>" + "Luftfeuchtigkeit (%): " + d.properties["Luftfeuchte (%)"] + "<br>" + "Niederschlag (mm): " + d.properties["Niederschlag (mm)"])
            
        // if mouse hovers over flussMess, read in metadata from flussMess    
        } else if (d3.select(this).attr("class")== "flussMess"){
            Tooltip.html("<strong>" + d.properties.name.substr(0, d.properties.name.length - 7) + "</strong>" + "<br>" + "Wassertemperaturklasse: " + d.properties["temp-class"] + "<br>")
            
        // if mouse hovers over hauptort
        } else if (d3.select(this).attr("class")== "hauptorte"){
            Tooltip.html("<strong>" + d.properties.ID1.substr(5) + "<strong>" )
            
        } else {
            
                var yesNo;
                if(d.properties.DN > thresh){
                    yesNo = "JA!"
                } else {yesNo = "NEIN :-("}
                Tooltip.html("<strong>Badeindex: </strong>" + d.properties.DN +"<br>" + "Würdest du hier baden?: " + yesNo)
            
                }
        
        // Fill-Interaction
        if(featureClass != "b_index_2"){
        var color = d3.select(this).attr("stroke");
        //console.log(color);
        d3.select(this).attr("fill", color);
        }
    }
            
    var mousemove = function(d) {
        Tooltip.style("opacity", 1)
    }
    
    var mouseleave = function(d) {
        var featureClass = d3.select(this).attr("class");
        Tooltip.style("opacity", 0)
        // Fill-Interaction
        var color = d3.select(this).attr
        if(featureClass == "flussMess"){
            d3.select(this).style("fill", "lightblue");
        } else if (featureClass == "wetter"){
            d3.select(this).style("fill", "grey");
        } else {
            d3.select(this).style("fill", "black");
        }
        
    }



// load geometries, add to svg, add tooltip mechanic and slider bars etc.
function ready (error, infile1, infile2, infile3, infile4, infile5, infile6, infile7) {
    
    
    
    //loading data for infile6
    var b_index = topojson.feature(infile6, infile6.objects.badeindex_vect32).features;

        gIndex.selectAll(".b_index")
            .data(b_index)
            .enter().append("path")
            .attr("class", "b_index")
            .attr("border-style", "solid")
            .attr("z-index", 1)
            .attr("fill", function(d,i){
                var DN = b_index[i].properties.DN;
                var DN2 = DN/100;
                var DN3 = 1-DN2;
                return d3.interpolateRdYlBu(DN3)
        })
            .attr("border-width", "1px")
            .attr("d", path);
    
    
    //loading data for infile1
    var kantone = topojson.feature(infile1, infile1.objects.kantone_lines).features;
        //console.log("kantone", kantone)

        gKantone.selectAll(".kantone")
            .data(kantone)
            .enter().append("path")
            .attr("class", "kantone")
            .attr("fill", "white")
            .attr("fill-opacity", "0")
            .attr("d", path)
            .attr("z-index", 100);
    
    //loading data for infile6
    var b_index_2 = topojson.feature(infile6, infile6.objects.badeindex_vect32).features;

        gIndex2.selectAll(".b_index_2")
            .data(b_index)
            .enter().append("path")
            .attr("class", "b_index_2")
            .attr("fill-opacity", "0")
            .attr("d", path)
            .attr("z-index", 2)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    

    // loading data for infile4
    var lakes = topojson.feature(infile4, infile4.objects.swissLakes).features;
    //console.log("swissLakes", lakes)
    
            gLakes.selectAll(".lakes")
            .data(lakes)
            .enter().append("path")
            .attr("class", "lakes")
            .attr("d", path)
            .attr("z-index", 101);

    
    //loading data for infile7
    var hauptorte = topojson.feature(infile7, infile7.objects.hauptorte).features;
    //console.log("flussMess", flussMess)
    
        gHauptorte.selectAll(".hauptorte")
            .data(hauptorte)
            .enter().append("circle")
            .attr("class", "hauptorte")
            .attr("r", point_radius+0.2)
            .attr("fill-opacity", "1")
            .attr("fill", "black")
            .attr("stroke", "grey")
            .attr("z-index", 102)
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
    
    //loading data for infile2
    var flussMess = topojson.feature(infile2, infile2.objects.flussdaten).features;
    //console.log("flussMess", flussMess)
    
        gflussMess.selectAll(".flussMess")
            .data(flussMess)
            .enter().append("circle")
            .attr("class", "flussMess")
            .attr("r", point_radius)
            .attr("fill-opacity", "0.7")
            .attr("fill", "lightblue")
            .attr("stroke", "blue")
            .attr("z-index", 103)
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
        
            gWetter.selectAll(".wetter")
            .data(wetter)
            .enter().append("circle")
            .attr("class", "wetter")
            .attr("r", point_radius)
            .attr("fill-opacity", "0.7")
            .attr("fill", "grey")
            .attr("stroke", "black")
            .attr("z-index", 104)
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
            
    //loading data for infile5
    var hotel_eierhals = topojson.feature(infile5, infile5.objects.hotel_eierhals).features;
    //console.log("EIERHALS", hotel_eierhals)
        
        
    gEierhals.selectAll(".hotel_eierhals")
        .data(hotel_eierhals)
        .enter().append("circle")
        .attr("class", "hotel_eierhals")
        .attr("r", 4)
        .attr("z-index", 105)
        .attr("fill-opacity", "0.0000001")

        // Move this part to the layer that should be affected by eierhals shenanigans
        .on("mouseover", function(d){
            if (eiercheck){
                svg.selectAll(".eierhals")
                    .attr("display", "block")
                    console.log("Hotel Eierhals: http://www.hotel-eierhals.ch/")
                    console.log("codicolus & taetscher empfehlen Mungo: Jerry - In The Summertime")
                    console.log("https://www.youtube.com/watch?v=wvUQcnfwUUM")
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


//------------------------- EVENT LISTENERS USER INPUT ---------------------------------------    
    
function updateRender(newFile){
    d3.json(newFile, function(d){
        
    var getIt = newFile.substr(9,16);
        
    var newData = topojson.feature(d, d.objects[getIt]).features;
        
        // Read in new Data (Background)
        gIndex.selectAll(".b_index")
            .data(newData)
            .enter()
            .append("path")
            .attr("class", "b_index");
        
        // update new Data
        gIndex.selectAll(".b_index")
            .data(newData)
            .attr("d", path)
            .attr("fill", function(d,i){
                var DN = newData[i].properties.DN;
                var DN2 = DN/100;
                var DN3 = 1-DN2;
                return d3.interpolateRdYlBu(DN3)
        });
        
        // update/exit new Data
        gIndex.selectAll(".b_index")
            .data(newData)
            .exit()
            .remove();
        
        
        
        
        // same procedure as every year (foreground)
        gIndex2.selectAll(".b_index_2")
            .data(newData)
            .enter()
            .append("path")
            .attr("class", "b_index_2")
            .attr("fill-opacity", "0")
            .attr("d", path)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);;
        
        gIndex2.selectAll(".b_index_2")
            .data(newData)
            .enter().append("path")
            .attr("class", "b_index_2")
            
        
        gIndex2.selectAll(".b_index_2")
            .data(newData)
            .exit()
            .remove();
        

        });
};   

// adding event listener for slider to allow user to control spatial accuracy of Badeindex
d3.select("#BufferSlider").on("change", function(d){
    var value = this.value;
    var newFile;
    console.log("Value BufferSlider:" + value);

    if (value == 0){var newFile = "data/GIS/badeindex_vect32.json";

    } else if (value == 1){var newFile = "data/GIS/badeindex_vect44.json";

    } else {var newFile = "data/GIS/badeindex_vect55.json";}

    updateRender(newFile);

    });

// adding event listener for slider to allow for user defined calculation of Badeindex
d3.select("#IndexSlider").on("change", function(d){
    var value = this.value;
    console.log(value)
})    

// enable/disable Wettermesstationen
d3.select("#CheckLayer1").on("change",function(d){
    checked = d3.select("#CheckLayer1").property("checked")

    if (checked) {
        gWetter.selectAll(".wetter")
            .transition()
            .duration(1000)
            .attr("display", "block")

    } else {
        gWetter.selectAll(".wetter")
            .transition()
            .duration(1000)
            .attr("display", "none")
    }
    });

// enable/disable Flusstemperaturmesstationen
d3.select("#CheckLayer2").on("change",function(d){
    checked = d3.select("#CheckLayer2").property("checked")

    if (checked) {
        gflussMess.selectAll(".flussMess").transition().duration(1000).attr("display", "block")

    } else {
        gflussMess.selectAll(".flussMess").transition().duration(1000).attr("display", "none")
    }
    });