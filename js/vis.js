

// get window size
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
// Creat zoom function 
var scale0 = (x - 1)/2/Math.PI;
var zoom = d3.behavior.zoom().translate([x/2,y/2]).scale(scale0).scaleExtent([scale0, 8 * scale0]).on('zoom', zoomed);

function zoomed() {
	projection.translate(zoom.translate()).scale(zoom.scale);
	svg.selectAll('path').attr('d'.path);
}

// ceate svg canvas
var svg = d3.select("body").style('margin','0')
		.append("svg")
        .attr({
        	"width": x,
            "height": y
        })
        .style('background','#161d54')
        ;

// detect resize window and change size accordingly
d3.select(window)
	.on('resize', function() {
		x = w.innerWidth || e.clientWidth || g.clientWidth;
    	y = w.innerHeight|| e.clientHeight|| g.clientHeight;
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
				.translate([x/2, y/2])
				.scale(750)
				.center([30,40])
			;
                       
var path = d3.geo.path().projection(projection)
			;
//add a hidden tooltip div with undefined position
var tooltip =d3.select('body').append('div')
				.attr('class','hidden tooltip')
				;

// draw world map
d3.json('d/world.json', function(err, world) {
	if (err) return console.error(err);
	var worldmap = topojson.feature(world, world.objects.worldsubunit)
	;
	svg.selectAll('.country').data(worldmap.features).enter()
		.append('path')
		.attr({
			'class': function(d) { return "country " + d.properties.NAME_LONG},
			'd': path,
			'fill':'#324489'	
		})
		.call(zoom)	  			
		;


	//draw places
	d3.json('d/c_death.json', function(err, d) {
			if (err) return console.error(err);

			// orgin places
			console.log();
	  		svg	.selectAll('.originPin').data(d).enter()
	  			.append('circle','.originPin')
	  			.attr({
	  				'r': function(d) {return Math.sqrt(d.count)},
	  				'fill': '#5471d6',
	  				'opacity': function(d) {return (d.deathLat != "NA" && d.originLat != 'NA')? 0.5:0},
	  				'transform': function(d) {return "translate(" + projection([d.originLng, d.originLat ]) + ")";}
	  			})	  			
	  			;

	  		//get travel path
			travelPath = [];
	        for(var i=0, len=d.length-1; i<len; i++){
	            // (note: loop until length - 1 since we're getting the next
	            //  item with i+1)
	            travelPath.push({
	                type: "LineString",
	                coordinates: [
						[d[i].originLng, d[i].originLat],
	  					[d[i].deathLng, d[i].deathLat]
	                ]
	            });
	        };
	  		//console.log(travelPath[4]);


			// Standard enter / update 
	        var pathArcs = svg.selectAll(".arc")
	            .data(travelPath);

	        //enter
	        pathArcs.enter()
	            .append("path").attr({
	                'class': 'arc'
	            }).style({ 
	                fill: 'none',
	            });

	        //update
	        pathArcs.attr({
	                //d is the points attribute for this path, we'll draw an arc between the points using the arc function
	                d: path
	            })
	            .style({
	                'stroke': '#697dca',
	                'stroke-width': '0.5px',
	                'opacity': '0.2'
	            })
	            ;

	        // exit
	        pathArcs.exit().remove();

	        // death places
	  		svg	.selectAll('.deathPin').data(d).enter()
	  			.append('circle','.originPin')
	  			.attr({
	  				'r': function(d) {return Math.sqrt(d.count)},
	  				'fill': '#972b38',
	  				'stroke': '#FFF',
	  				'stroke-width': '0.3',
	  				'opacity': function(d) {return (d.deathLat != "NA" && d.originLat != 'NA')? 0.7:0;},	
	  				'transform': function(d) {return 'translate(' + projection([d.deathLng,d.deathLat]) + ')'} 
	  			})
	  			// get mouse hover svg node and add tooltip
	  			.on('mousemove', function(d) {
		            var mouse = d3.mouse(svg.node()).map(function(d) {
		                return parseInt(d);
		            });
		            tooltip.classed('hidden', false)
		                .attr('style', 'left:' + (mouse[0] + 15) +
		                        'px; top:' + (mouse[1] - 35) + 'px')
		                .html('<span style="font-weight: bold"> ' + d.date + '</span>' + '<br>' + d.count + ' people ' + d['cause of death']);
		        })
		        .on('mouseout', function() {
		            tooltip.classed('hidden', true);
		        })
	  			;

	});
});