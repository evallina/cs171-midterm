// --> CREATE SVG DRAWING AREA

//LAYOUT VARIABLES////////////////////////////////////////////////////////////////////////////////////
var margin = {top: 40, right: 0, bottom: 10, left: 60};

var width = 1000 - (margin.left + margin.right),
    height = 600 - (margin.top + margin.bottom);

var height2=height/2;
//VARIABLES///////////////////////////////////////////////////////////////////////////////////////////
var data01=[];
var xSelect2;
var xSelect3;
var colorHighlight= "rgb(200,150,25)";

//SVG AREA/////////////////////////////////////////////////////////////////////////////////////////////
var svg2 = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//SETUP SCALES/////////////////////////////////////////////////////////////////////////////////////////
var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
var y = d3.scale.linear().range([height2, 0]);
var y2 = d3.scale.linear().range([height2, 0]);
var y3 = d3.scale.linear().range([height2-100, 0]);


var valueMax;
var valueMax2;
var valueMax3;

var sortData01;
//SETUP SVG OBJECTS////////////////////////////////////////////////////////////////////////////////////



//SETUP AXIS///////////////////////////////////////////////////////////////////////////////////////////
var formatNumber = d3.format(".0f");

var xAxis = d3.svg.axis()
    .orient("bottom")
    .scale(x)
   ;

var yAxis = d3.svg.axis().orient("left").scale(y).tickFormat(function(d){return "% "+ d; });
var yAxis2 = d3.svg.axis().orient("left").scale(y3).tickFormat(formatMillions);

svg2.append("g")
    .attr("class","y-axis axis")
    .classed("minor", true);

//svg2.selectAll("g").filter(function(d) { return d; })
  //  .classed("minor", true);

svg2.append("g")
    .attr("class","y-axis2 axis")
    .classed("minor", true);

svg2.append("g")
    .attr("class", "x-axis axis")
    .attr("id","x-label")
    .attr("transform","translate(0,"+height2+")")
    //.style("color","rgb(200,200,200")
    .call(xAxis)
;

svg2.append("text")
    .attr("id","y-axis label")
    .attr("class", "axis-label")
    .attr("text-anchor","middle")
    .attr("x",-margin.left/2)
    .attr("y",-margin.top/2);

svg2.append("text")
    .attr("id","y-axis2 label2")
    .attr("class", "axis-label2")
    .attr("text-anchor","middle")
    .attr("x",-margin.left/2)
    .attr("y",-margin.top/2)

;

// INITIALIZE DATA////////////////////////////////////////////////////////////////////////////////////////
loadData();
data01 = allCountriesData;
//BOX SELECTION///////////////////////////////////////////////////////////////////////////////////////////
d3.select("#data-type2").on("change", function () { updateVisualization() });
d3.select("#data-type3").on("change", function () { updateVisualization() });
//d3.select("#btn-update").on("click", function() { updateVisualization() });

//LOAD DATA FUNCTION//////////////////////////////////////////////////////////////////////////////////////
function loadData(){

    d3.csv("data/global-water-sanitation-2015.csv", function(error, csv) {

        //CHANGE STRINGS TO FLOAT NUMBERS
        csv.forEach(function (d) {
            d.Improved_Sanitation_2015  = +d.Improved_Sanitation_2015;
            d.Improved_Water_2015       = +d.Improved_Water_2015;
            d.UN_Population             = +d.UN_Population;
        });

        // Store csv data in global variable
        //data01 = allCountriesData;
        data01=csv;

        // Draw the visualization for the first time
        updateVisualization();
    });

}

//DRAW & UPDATE VISUALIZATION /////////////////////////////////////////////////////////////////////////////
function updateVisualization(){
    console.log(data01);


    //SELECTION IN BOX/////////////////////////////////////////////////////////////////////
    xSelect2 = d3.select("#data-type2").property("value");
    xSelect3 = d3.select("#data-type3").property("value");

 //sortData01= data01.sort(function (a,b){return b[xSelect] - a[xSelect];});


    sortData01= sortingData(data01,xSelect2);

    valueMax =d3.max(data01,function(d){return d.Improved_Sanitation_2015;});
    valueMax2 =d3.max(data01,function(d){return d.Improved_Water_2015;});
    valueMax3 =d3.max(data01,function(d){return d.UN_Population;});
    /*valueShort = d3.max(sortData01, function(d){
        if (xSelect2=="Code"){return 0}
        else{ return d[xSelect2];} })
    ;*/


    //SCALES & OTHER DATA OPERATIONS///////////////////////////////////////////////////////
    //xShort.domain(sortData.map(function(d){return d.Code;}));
    //yShort.domain([valueShort,0]);

    x.domain(sortData01.map(function(d){return d.Code;}));
    y.domain([valueMax,0]);
    y2.domain([valueMax2,0]);
    y3.domain([valueMax3,0]);

    var xVariable=3;
    var chartdowOffset=40;

    //BAR CHART////////////////////////////////////////////////////////////////////////////

    var bars1 = svg2.selectAll(".bars01")
        .data(sortData01);
    var bars2 = svg2.selectAll(".bars02")
        .data(sortData01);
    var bars3 = svg2.selectAll(".bars03")
        .data(sortData01);



//SANITATION BARS
    bars1.enter()
        .append("rect")
        .attr("class", "bars01")
       // .attr("fill", colorSanitation)
    //.attr("fill-opacity", opacityX)

    bars1.transition().duration(1500)
        .attr("x", function(d) { return x(d.Code); })
        .attr("y", function(d) { return y(d.Improved_Sanitation_2015); })
        .attr("width", x.rangeBand()-5)
        .attr("height", function(d) { return height2 - y(d.Improved_Sanitation_2015); })
        .attr("fill", function(d){
            if(xSelect3=="African"){
                if(d.WHO_region=="African"){return colorHighlight}
                else{return colorWater}
            }
            else if(xSelect3=="South-East Asia"){
                if(d.WHO_region=="South-East Asia"){return colorHighlight}
                else{return colorWater}
            }
            else if(xSelect3=="European"){
                if(d.WHO_region=="European"){return colorHighlight}
                else{return colorWater}
            }

            else{ return colorWater; }
        })
    ;
    bars1.exit().remove();

    //WATER BARS
    bars2.enter()
        .append("rect")
        .attr("class", "bars02")


    bars2.transition().duration(1500)
        .attr("x", function(d) { return x(d.Code)+xVariable; })
        .attr("y", function(d) { return y2(d.Improved_Water_2015); })
        .attr("width", x.rangeBand()-5)
        .attr("height", function(d) { return height2 - y2(d.Improved_Water_2015); })
        .attr("fill", function(d){
            if(xSelect3=="African"){
                if(d.WHO_region=="African"){return colorHighlight}
                else{return colorWater}
            }
            else if(xSelect3=="South-East Asia"){
                if(d.WHO_region=="South-East Asia"){return colorHighlight}
                else{return colorWater}
            }
            else if(xSelect3=="European"){
                if(d.WHO_region=="European"){return colorHighlight}
                else{return colorWater}
            }

            else{ return colorWater; }
        })
        .attr("fill-opacity", 0.4)

    bars2.exit().remove();

    //POPULATION BARS
    bars3.enter()
        .append("rect")
        .attr("class", "bars03")


    bars3.transition().duration(1500)
        .attr("x", function(d) { return x(d.Code); })
        .attr("y", function(d) { return height2+chartdowOffset; })
        .attr("width", x.rangeBand()-5)
        .attr("height", function(d) { return y3(d.UN_Population); })
        .attr("fill", function(d){
            if(xSelect3=="African"){
                if(d.WHO_region=="African"){return colorHighlight}
                else{return colorPopulation}
            }
           else if(xSelect3=="South-East Asia"){
                if(d.WHO_region=="South-East Asia"){return colorHighlight}
                else{return colorPopulation}
            }
            else if(xSelect3=="European"){
                if(d.WHO_region=="European"){return colorHighlight}
                else{return colorPopulation}
            }

            else{ return colorPopulation; }
        })
    ;
    bars3.exit().remove();


    //UPDATE AXIS//////////////////////////////////////////////////////////////////////////
    svg2.select("g.x-axis").transition().duration(1500)
        .attr("fill",function(d){
          return "rgb(50,50,50)"
        })
        .call(xAxis)


    svg2.selectAll("text")
        .attr("y", 0)
        .attr("x", 0)
        //.attr("dy", "0em")
        .attr("transform", "rotate(90) translate("+(chartdowOffset*0.25)+",-10)")
        .style("text-anchor", "start")
    ;
    svg2.select("g.y-axis").transition().duration(1500).call(yAxis);
    svg2.select("g.y-axis2").attr("transform","translate(0,"+(height2+chartdowOffset)+")")
        .transition().duration(1500)
        .call(yAxis2);

}

function formatMillions(d) {
    var s = formatNumber(d / 1e6);
    return d === y.domain()[1]
        ? " million "+ s
        : s;
}

function sortingData(dataSet,xSelectX){
        if(xSelectX=="Improved_Water_2015"){return dataSet.sort(function (a,b){return b[xSelectX] - a[xSelectX]})}
        else if(xSelectX=="Improved_Sanitation_2015"){return dataSet.sort(function (a,b){return b[xSelectX] - a[xSelectX]})}
        else if(xSelectX=="UN_Population"){return dataSet.sort(function (a,b){return b[xSelectX] - a[xSelectX]})}
        else {return dataSet;}
}