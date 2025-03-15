// Combined JavaScript for D3 plots

// Define common dimensions
const margin = {top: 30, right: 30, bottom: 50, left: 50};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// 1. Boxplot
const svgBox = d3.select("#plotBox").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("SocialMedia.csv").then(data => {
    data.forEach(d => d.Likes = +d.Likes);

    const sumstat = d3.rollup(data,
        v => ({q1: d3.quantile(v.map(g => g.Likes).sort(d3.ascending), .25),
            median: d3.quantile(v.map(g => g.Likes).sort(d3.ascending), .5),
            q3: d3.quantile(v.map(g => g.Likes).sort(d3.ascending), .75),
            min: d3.min(v, g => g.Likes),
            max: d3.max(v, g => g.Likes)}),
        d => d.Platform);

    const x = d3.scaleBand().range([0, width]).domain(Array.from(sumstat.keys())).paddingInner(1).paddingOuter(.5);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.Likes)]).nice().range([height, 0]);

    svgBox.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svgBox.append("g").call(d3.axisLeft(y));

    svgBox.selectAll("vertLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", d => x(d[0]))
        .attr("x2", d => x(d[0]))
        .attr("y1", d => y(d[1].min))
        .attr("y2", d => y(d[1].max))
        .attr("stroke", "black");

    svgBox.selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", d => x(d[0])-25)
        .attr("y", d => y(d[1].q3))
        .attr("height", d => y(d[1].q1)-y(d[1].q3))
        .attr("width", 50)
        .attr("stroke", "black")
        .attr("fill", "#ddd");

    svgBox.selectAll("medianLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", d => x(d[0])-25)
        .attr("x2", d => x(d[0])+25)
        .attr("y1", d => y(d[1].median))
        .attr("y2", d => y(d[1].median))
        .attr("stroke", "black");
});

// 2. Bar Plot
const svgBars = d3.select("#plotBars").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("SocialMediaAvg.csv").then(data => {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const x0 = d3.scaleBand().domain([...new Set(data.map(d => d.Platform))]).rangeRound([0, width]).paddingInner(0.1);
    const x1 = d3.scaleBand().domain([...new Set(data.map(d => d.PostType))]).rangeRound([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).nice().range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeSet2);

    svgBars.append("g")
        .selectAll("g")
        .data(data)
        .join("rect")
        .attr("x", d => x0(d.Platform) + x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    svgBars.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0));
    svgBars.append("g").call(d3.axisLeft(y));
});

// 3. Line Plot
const svgLine = d3.select("#plotLine").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("SocialMediaTime.csv").then(data => {
    data.forEach(d => {
        d.Date = new Date(d.Date);
        d.AvgLikes = +d.AvgLikes;
    });

    const x = d3.scaleTime().domain(d3.extent(data, d => d.Date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).nice().range([height, 0]);

    svgLine.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%m/%d"))).selectAll("text").attr("transform", "rotate(-25)").style("text-anchor", "end");
    svgLine.append("g").call(d3.axisLeft(y));

    svgLine.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line().curve(d3.curveNatural).x(d => x(d.Date)).y(d => y(d.AvgLikes)));
});