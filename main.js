const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 900;
const margin = {top: 50, right: 100, bottom: 50, left: 250};

let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 300;
let graph_3_width = (MAX_WIDTH / 2) - 10, graph_3_height = 300;

let NUM_EXAMPLES = 10;

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)     // HINT: width
    .attr("height", graph_1_height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    // HINT: transform

let countRef = svg.append("g");

d3.csv("data/video_games.csv").then(function(data) {
    data = cleanData(data, function(a,b){return parseFloat(b.Global_Sales) - parseFloat(a.Global_Sales)}, NUM_EXAMPLES);
    
    let x = d3.scaleLinear()
        .domain([0,d3.max(data, function(d) {return parseFloat(d.Global_Sales);})])
        .range([0,graph_1_width-margin.left-margin.right]);
    let y = d3.scaleBand()
        .domain(data.map(function(d){return d.Name;}))
        .range([0,graph_1_height-margin.top-margin.bottom])
        .padding(0.1);  
    
        svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    let bars = svg.selectAll("rect").data(data);
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["Name"] }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d['Name']) }) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
        .attr("x", x(0))
        .attr("y", function(d){return y(d.Name);})               // HINT: Use function(d) { return ...; } to apply styles based on the data point (d)
        .attr("width", function(d){return x(parseFloat(d.Global_Sales))})
        .attr("height",  y.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

    let counts = countRef.selectAll("text").data(data);
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d) { return x(parseFloat(d.Global_Sales))+10;})       // HINT: Add a small offset to the right edge of the bar, found by x(d.Global_Sales)
        .attr("y", function(d) { return y(d.Name) + 10;})       // HINT: Add a small offset to the top edge of the bar, found by y(d.Name)
        .style("text-anchor", "start")
        .text(function(d) { return parseFloat(d.Global_Sales);});           // HINT: Get the name of the artist

    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${(graph_1_height - margin.top - margin.bottom) + 15})`)       // HINT: Place this at the bottom middle edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .text("Total Worldwide Sales (millions)");

    svg.append("text")
        .attr("transform", `translate(${-175}, ${(graph_1_height - margin.top - margin.bottom)/2})`)       // HINT: Place this at the center left edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .text("Name");

    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Top 10 Videogames of All Time");
});


//////// GRAPH 2 //////


let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)    
    .attr("height", graph_2_height)     
    .append("g")
    .attr("transform", `translate(${margin.left+50},${margin.top+100})`);    // HINT: transform

let labelsRef2 = svg2.append("g");
let titleRef2 = svg2.append("g");

var radius = Math.min(graph_2_width, graph_2_height)/2.5; //
var color = d3.scaleOrdinal() 
    .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES)); //

let tooltip = d3.select("#graph2")    
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


function updateData2(region) {
    d3.csv("data/video_games.csv").then(function(data2) {

        data2 = cleanData2(data2, region, NUM_EXAMPLES);

        var pie = d3.pie()
            .value(function(d) {return d.value.Sales;})
            .sort(function(a,b){return d3.ascending(a.key, b.key);})

        var data_ready = pie(d3.entries(data2))
        var arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(1.05*radius)

        let mouseover = function(d) {
            let html = `${d.data.value.Genre}<br/>
                    Sales (millions): ${d.data.value.Sales.toFixed(2)}</span>`;       // HINT: Display the song here

            tooltip.html(html)
                .style("left", `${(d3.event.pageX)-30}px`)
                .style("top", `${(d3.event.pageY) - 30}px`)
                .style("box-shadow", `2px 2px 5px`)  
                .transition()
                .duration(200)
                .style("opacity", 1)
        };
    
        let mouseout = function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };

        var path = svg2.selectAll("path").data(data_ready)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', function(d){return(color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "1px")
            .style("opacity", 0.8);

        path.merge(path)
            .transition()
            .duration(1000);

        path.on("mouseover", mouseover)
            .on("mouseout", mouseout);

        labelsRef2.raise();
        let labels = labelsRef2.selectAll("text").data(data_ready);
        let title = titleRef2.selectAll("text").data(data_ready);

        labels.enter()
            .append('text')
            .merge(labels)
            .transition()
            .duration(1000)
            .text(function(d){return d.data.value.Genre})
            .attr("transform", function(d) {
                var centroid = arcGenerator.centroid(d);
                return "translate(" + [centroid[0]*1.5, centroid[1]*1.5] +")";  })
            .attr("stroke", "black")
            .style("stroke-width", "0.5px")
            .style("text-anchor", "middle")
            .style("font-size", "10px")

        region_map = {"NA_Sales": "NA Region", "EU_Sales": "EU Region", "JP_Sales": "JP Region", "Other_Sales": "Other Regions"}

        title.enter().append("text")
            .merge(title)
            .attr("transform", `translate(${(graph_2_width - margin.left - margin.right)/13}, ${-137})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .text("Top 10 Genres in "+region_map[region]);
        
        path.exit().remove();
        labels.exit().remove()
        
    });
}

//////// GRAPH 3 //////


let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)    
    .attr("height", graph_3_height)     
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    // HINT: transform


let x3 = d3.scaleLinear()
    .range([0,graph_3_width-margin.left-margin.right]);

let y3 = d3.scaleBand()
    .range([0,graph_3_height-margin.top-margin.bottom])
    .padding(0.1);  

let countRef3 = svg3.append("g");
let titleRef3 = svg3.append("g");

let y_axis_label = svg3.append("g");

let y_axis_text = svg3.append("text")
    .attr("transform", `translate(${-110}, ${(graph_3_height - margin.top - margin.bottom)/2})`)        // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

function updateData3(genre) {

    d3.csv("data/video_games.csv").then(function(data3) {

        data3 = cleanData3(data3, genre, NUM_EXAMPLES);
        max_publisher = data3[0].Publisher

        x3.domain([0,d3.max(data3, function(d) {return parseFloat(d.Global_Sales);})])
        y3.domain(data3.map(function(d){return d.Publisher;}))

        y_axis_label.call(d3.axisLeft(y3).tickSize(0).tickPadding(10));

        let bars3 = svg3.selectAll("rect").data(data3);
        let color3 = d3.scaleOrdinal()
            .domain(data3.map(function(d) { return d["Publisher"] }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

        bars3.enter()
            .append("rect")
            .merge(bars3)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color3(d['Publisher']) }) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
            .attr("x", x3(0))
            .attr("y", function(d){return y3(d.Publisher);})               // HINT: Use function(d) { return ...; } to apply styles based on the data point (d)
            .attr("width", function(d){return x3(parseFloat(d.Global_Sales))})
            .attr("height",  y3.bandwidth())       // HINT: y.bandwidth() makes a reasonable display height
            .style("opacity", function(d) {if (d.Publisher == max_publisher) {return 1} else {return 0.5}});

        let counts3 = countRef3.selectAll("text").data(data3);
        counts3.enter()
            .append("text")
            .merge(counts3)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x3(parseFloat(d.Global_Sales))+10;})       // HINT: Add a small offset to the right edge of the bar, found by x(d.Global_Sales)
            .attr("y", function(d) { return y3(d.Publisher) + 10;})       // HINT: Add a small offset to the top edge of the bar, found by y(d.Name)
            .style("text-anchor", "start")
            .text(function(d) { return (parseFloat(d.Global_Sales)).toFixed(2);});           // HINT: Get the name of the artist

        svg3.append("text")
            .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${(graph_3_height - margin.top - margin.bottom) + 15})`)       // HINT: Place this at the bottom middle edge of the graph - use translate(x, y) that we discussed earlier
            .style("text-anchor", "middle")
            .text("Total Worldwide Sales (millions)");

        y_axis_text.text(data3.Publisher)
        let title = titleRef3.selectAll("text").data(data3);

        title.enter().append("text")
            .merge(title)
            .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text("Top 10 Publishers for "+genre);

        bars3.exit().remove();
        counts3.exit().remove();
    });
    
}


function cleanData(data, comparator, numExamples) {
    return data.sort(comparator).slice(0,numExamples)
}

function cleanData2(data, region, numExamples) {
    const video_games = Object.values(data)
    var genres = {}
    for (const video_game of video_games) {
        genre = video_game.Genre
        sales = parseFloat(video_game[region])
        if (!(genre in genres)) {
            genres[genre] = {Genre: genre, Sales: parseFloat(sales)}
        } else {
            genres[genre].Sales += sales
        }
    }
    let sorted_genres = []
    for (const val of Object.values(genres)) {
        sorted_genres.push(val)
    }
    sorted_genres = sorted_genres.sort(function(a,b) {return b.Sales - a.Sales})
    return sorted_genres.slice(0, numExamples)
}

function cleanData3(data, genre, numExamples) {
    const video_games = Object.values(data)
    var publishers = {}
    for (const video_game of video_games) {
        if (video_game.Genre == genre) {
            if (video_game.Publisher in publishers) {
                publishers[video_game.Publisher].Global_Sales += parseFloat(video_game.Global_Sales)
            }
            else {
                publishers[video_game.Publisher] = {Publisher: video_game.Publisher, Global_Sales: parseFloat(video_game.Global_Sales)}
            }
        }
    }
    let sorted_publishers = []
    for (const val of Object.values(publishers)) {
        sorted_publishers.push(val)
    }
    sorted_publishers = sorted_publishers.sort(function(a,b) {return b.Global_Sales - a.Global_Sales})
    return sorted_publishers.slice(0, numExamples)
}

updateData2("NA_Sales")
updateData3("Sports")