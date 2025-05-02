// get window size
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
// Creat zoom function
var scale0 = (x - 1) / 2 / Math.PI;
var zoom = d3.behavior.zoom().translate([x / 2, y / 2]).scale(scale0).scaleExtent([scale0, 8 * scale0]).on('zoom', zoomed);

function zoomed() {
    projection.translate(zoom.translate()).scale(zoom.scale);
    svg.selectAll('path').attr('d'.path);
}

// ceate svg canvas
var svg = d3.select("body").style('margin', '0')
    .append("svg")
    .attr({
        "width": x,
        "height": y
    })


// detect resize window and change size accordingly
d3.select(window)
    .on('resize', function() {
        x = w.innerWidth || e.clientWidth || g.clientWidth;
        y = w.innerHeight || e.clientHeight || g.clientHeight;
        svg.attr({
            "width": x,
            "height": y
        });
    });

// initialize  zoom and drag interactivity
// var zoom = d3.behavior.zoom()
//     .scaleExtent([1, 10])
//     .on("zoom", zoomed);

// var drag = d3.behavior.drag()
//     .origin(function(d) { return d; })
//     .on("dragstart", dragstarted)
//     .on("drag", dragged)
//     .on("dragend", dragended);


// projection and path for map drawing
var projection = d3.geo.mercator()
    .translate([x / 2, y / 2])
    .scale(750)
    .center([30, 40]);

var path = d3.geo.path().projection(projection);
//add a hidden tooltip div with undefined position
var tooltip = d3.select('body').append('div')
    .attr('class', 'hidden tooltip');

// draw world map
d3.json('d/world.json', function(err, world) {
    if (err) return console.error(err);
    var worldmap = topojson.feature(world, world.objects.worldsubunit);
    svg.selectAll('.country').data(worldmap.features).enter()
        .append('path')
        .attr({
            'class': function(d) {
                return "country " + d.properties.NAME_LONG
            },
            'd': path,
        })
        .call(zoom)
        .on('mousemove', function(d) {
            d3.selectAll('.arc')
                .filter(function(_d) {
                    return _d.origin.trim().split('/').includes(d.properties.NAME_LONG)
                })
                .classed('hidden', false)
            var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
            })
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 15) +'px; top:' + (mouse[1] - 35) + 'px')
                .html(`<h4 style="font-weight: bold; padding: 0; margin: 0;">${d.properties.NAME_LONG}</h4>`)
         
        })
        .on('mouseout', function() {
            d3.selectAll('.arc').classed('hidden', true)
            tooltip.classed('hidden', true)
        })


    //draw places
    d3.json('d/c_death.json', function(err, d) {
        if (err) return console.error(err);

        // orgin places
        svg.selectAll('.originPin').data(d).enter()
            .append('circle')
            .attr('class', 'originPin')
            .attr({
                'r': function(d) {
                    return Math.sqrt(d.count)
                },
                'opacity': function(d) {
                    return (d.deathLat != "NA" && d.originLat != 'NA') ? 0.5 : 0
                },
                'transform': function(d) {
                    return "translate(" + projection([d.originLng, d.originLat]) + ")";
                }
            })
            .on('mousemove', function(_, i) {
                d3.selectAll('.arc')
                    .filter(function(d, _i) {
                        return i == _i;
                    })
                    .classed('hidden', false)
            })
            .on('mouseout', function() {
                d3.selectAll('.arc').classed('hidden', true)
            })

        //get travel path
        travelPath = [];
        for (var i = 0, len = d.length - 1; i < len; i++) {
            // (note: loop until length - 1 since we're getting the next
            //  item with i+1)
            travelPath.push({
                type: "LineString",
                origin: d[i].origin,
                coordinates: [
                    [d[i].originLng, d[i].originLat],
                    [d[i].deathLng, d[i].deathLat]
                ]
            });
        };

        // Standard enter / update
        var pathArcs = svg.selectAll(".arc")
            .data(travelPath).enter()
            .append("path")
            .attr('class', 'arc hidden')
            .attr('d',  path)


        // death places
        svg.selectAll('.deathPin').data(d).enter()
            .append('circle')
            .attr('class', 'deathPin')
            .attr({
                'r': function(d) {
                    return Math.sqrt(d.count)
                },
                'opacity': function(d) {
                    return (d.deathLat != "NA" && d.originLat != 'NA') ? 0.7 : 0;
                },
                'transform': function(d) {
                    return 'translate(' + projection([d.deathLng, d.deathLat]) + ')'
                }
            })
        // get mouse hover svg node and add tooltip
        .on('mousemove', function(d, i) {
            var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
            });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 15) +
                    'px; top:' + (mouse[1] - 35) + 'px')
                .html(`<h4 style="font-weight: bold">${d.date}</h4> <h6>Origin: ${d.origin}</h6>${d.count} people ${d['cause of death']}`)
            
            d3.selectAll('.arc')
               .filter(function(d, _i) {
                return i == _i;
               })
               .classed('hidden', false)
            })
            .on('mouseout', function() {
                tooltip.classed('hidden', true);
                d3.selectAll('.arc').classed('hidden', true)
            });

    });
});