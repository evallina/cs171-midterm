// --> CREATE SVG DRAWING AREA
//General Layout Variables////////////////////////////////////////////////////////////////////////////////////////////////////
var width = 1000,
    height = 500;

//VARIABLES////////////////////////////////////////////////////////////////////////////////////////////////////
var xSelect

var mapAfrica;
var allCountriesData;
var africaData;
var countryData;
var domainLegend=[];

//COLORS////////////////////////////////////////////////////////////////////////////////////////////////////
var colorSanitation="rgb(10,133,150)";
var colorWater="rgb(50,150,200)";
var colorPopulation="rgb(50,50,50)";

//CREATE TOOLTIP////////////////////////////////////////////////////////////////////////////////////////////////////

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([30, -20])

    .html(function (d) {
        var value;

        if (xSelect == "Improved_Sanitation_2015") {
            value = d.properties.value02;
            if (value) {
                return d.properties.name_sort +": "+ value+"%";
            }
            else{return d.properties.name_sort +": "+"N/A"}
        }
        else if (xSelect == "Improved_Water_2015") {
            value = d.properties.value03;
            if (value) {
                return d.properties.name_sort +": "+ value+"%";
            }
            else{return d.properties.name_sort +": "+"N/A"}
        }
        else/*( xSelect=="UN_Population")*/{
            value = d.properties.value01;
            if (value) {
                return d.properties.name_sort +": "+ formatNumber(value)+" p";
            }
            else{return d.properties.name_sort +": "+"N/A"}
        }
    })
    ;



//SVG AREA////////////////////////////////////////////////////////////////////////////////////////////////////
var svg = d3.select("#map-area").append("svg")
    .attr("width", width)
    .attr("height", height);


//TIP TO SVG////////////////////////////////////////////////////////////////////////////////////////////////////
    svg.call(tip);

//MAP PROJECTION////////////////////////////////////////////////////////////////////////////////////////////////////
var projection = d3.geo.mercator().translate([width / 2, height / 2])
    //Refining Projection to Africa
    //.center([-50,45])
        .scale(300)
        .center([60, 0])
    ;
var path = d3.geo.path().projection(projection);


// Set ordinal color scale////////////////////////////////////////////////////////////////////////////////////////////////////
var colorScale = d3.scale.category20c();



var color = d3.scale.quantize()
    .range(["rgb(237,248,233)", "rgb(186,228,179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);

var colorfade = d3.scale.linear()
        .range([0.35, 1.0])
    ;

d3.select("#data-type").on("change", function () { updateChoropleth() });

// Use the Queue.js library to read two files

queue()
    .defer(d3.json, "data/africa.topo.json")
    .defer(d3.csv, "data/global-water-sanitation-2015.csv")
    .await(function (error, mapTopJson, countryDataCSV) {

        // --> PROCESS DATA

        //Transform TopoJSON to GeoJSON
        mapAfrica = topojson.feature(mapTopJson, mapTopJson.objects.collection).features;

        //Convert Data to Float (Improved_Sanitation_2015,Improved_Water_2015,UN_Population)
        countryDataCSV.forEach(function (d) {
            d.Improved_Sanitation_2015 = +d.Improved_Sanitation_2015;
            d.Improved_Water_2015 = +d.Improved_Water_2015;
            d.UN_Population = +d.UN_Population;
        });

        allCountriesData=countryDataCSV;
        //Filter only African Countries Data
        africaData = countryDataCSV.filter(function (value, index) {
            return value.WHO_region == "African";
        })

        //Data Source Converted & Filtered
        countryData = africaData;


        // Update choropleth
        updateChoropleth();
    });


function updateChoropleth() {

    // --> Choropleth implementation

    //Scale Domain////////////////////////////////////////////////////////////////////////////////////////////////////
    //Domain max value
    xSelect = d3.select("#data-type").property("value");


    //Color Domain
    colorfade.domain([
        d3.min(countryData, function (d) {
            return d[xSelect]
        }),
        d3.max(countryData, function (d) {
            return d[xSelect]
        })
    ])

    //merge DATA into GeoJSON////////////////////////////////////////////////////////////////////////////////////////////////////
    for (var i = 0; i < countryData.length; i++) {
        //Grab Country Code
        var dataCountryCode = countryData[i].Code;
        //var countryName=mapTopJson[i].properties.adm0_a3_is;

        var dataValue01 = countryData[i].UN_Population;
        var dataValue02 = countryData[i].Improved_Sanitation_2015;
        var dataValue03 = countryData[i].Improved_Water_2015;

        //dataValue01= (countryData,function (d) { return d[xSelect]; })

        //Find the corresponding Country inside the GeoJSON
        for (var j = 0; j < mapAfrica.length; j++) {
            var jsonCountryCode = mapAfrica[j].properties.adm0_a3_is;

            if (dataCountryCode == jsonCountryCode) {
                //Copy the data value into the JSON
                mapAfrica[j].properties.value01 = dataValue01;
                mapAfrica[j].properties.value02 = dataValue02;
                mapAfrica[j].properties.value03 = dataValue03;

                //Stop looking through the JSON
                break;
            }
        }
    }

    //RENDER MAP////////////////////////////////////////////////////////////////////////////////////////////////////
    var mapAfricaContinent = svg.selectAll("path")
        .data(mapAfrica)
        .attr("class", "mapClass")

    mapAfricaContinent.enter()
        .append("path")
        .attr("class", "mapClass")
        .attr("d", path)
        .attr("id", function (d) {
            return d.properties.adm0_a3_is
        })
        .style("fill", "rgb(255,255,255)")
        .style("stroke", "rgb(255,255,255")
        .style("stroke-width", 0.5)

    mapAfricaContinent
        .on("mouseover", function(d){
            d3.select(this).transition().duration(300).style("stroke-width", 4);
            tip.show(d)
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(300).style("stroke-width", 0.5);
            tip.hide()
        })

    mapAfricaContinent.transition().duration(1200)
        //.style("fill", "rgb(50,150,200)")
        .style("fill",function(d){
            if (xSelect == "Improved_Sanitation_2015") {
                return colorSanitation;
            }
            else if (xSelect == "Improved_Water_2015") {
                return colorWater;
            }
            else/*( xSelect=="UN_Population")*/{
                return colorPopulation;
            }

        })
        .style("fill-opacity", function (d) {
            var value;

            if (xSelect == "Improved_Sanitation_2015") {
                value = d.properties.value02;
                if (value) {
                    return colorfade(value);
                }
                else {return 0.05;}
            }
            else if (xSelect == "Improved_Water_2015") {
                value = d.properties.value03;
                if (value) {
                    return colorfade(value);
                }
                else {return 0.05;}
            }
            else/*( xSelect=="UN_Population")*/{
                value = d.properties.value01;
                if (value) {
                    return colorfade(value);
                }
                else { return 0.05;}
            }
        })
    ;

    //LEGEND////////////////////////////////////////////////////////////////////////////////////////////////////
    //Exit legend text and rect
    svg.selectAll("g.legend").remove();


    var sortCountryData = countryData.sort(function (a, b) {
        return a[xSelect] - b[xSelect];
    })
    var maxLegendValue= d3.max(sortCountryData,function (d) { return d[xSelect] });
    var minLegendValue= d3.min(sortCountryData,function (d) { return d[xSelect] });
    var splitRange= (maxLegendValue-minLegendValue)/10;
    var domainPop=[];
    domainLegend=[10,20,30,40,50,60,70,80,90,100];
    var scaleLegend=d3.scale.linear()
        .domain([0,100])
        .range([0.35, 1.0]);

    for (var i=0; i<10;i++){
       if(i==0){
           domainPop.push(splitRange);
       }
       else{
           var countL=splitRange*(i+1);
           domainPop.push(countL);
       }
    }

    var xLegend = 15, yLegend = 15;

    var legend = svg.selectAll("g.legend")
        .data(domainLegend)

    legend.enter()
        .append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", 10)
        .attr("y", function(d, i){ return height-(i*(yLegend+0.5))-yLegend*2;})
        .attr("width", xLegend)
        .attr("height", yLegend)
        //.style("fill", "rgb(255,255,255)")

     legend.transition().duration(1200)
        .style("fill",function(d,i){
            if (xSelect == "Improved_Sanitation_2015") { return "rgb(10,133,150)"; }
            else if (xSelect == "Improved_Water_2015") { return "rgb(50,150,200)"; }
            else/*( xSelect=="UN_Population")*/{ return "rgb(50,50,50)"; }
        })
        .style("fill-opacity", function(d,i){
            return scaleLegend(d);
        });

    //Text
    legend.append("text")
        .attr("class","text-legend")
        .attr("text-anchor","center")
        .attr("x", 35)
        .attr("y", function(d, i){ return ((yLegend/1.5)+height)-(i*(yLegend+0.5))-yLegend*2;})
        .text(function(d, i){
            if (xSelect == "Improved_Sanitation_2015" ||xSelect == "Improved_Water_2015") {
                return 10*(i+1)+"%"; }
            else{
                if(i==0 || i==4 || i==9){ return "-- "+ formatNumber(domainPop[i]);}
                else{return " "}
        }

        });

}

function formatNumber(x) {
    var roundX= Math.round(x);
    return roundX.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
