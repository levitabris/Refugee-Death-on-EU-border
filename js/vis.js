

// get window size
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

var svg = d3.select("body").append("svg")
        .attr({
        	"width": x,
            "height": y
        })
        .style('background','#271d67')
        ;


d3.select(window)
	.on('resize', function() {
		x = w.innerWidth || e.clientWidth || g.clientWidth;
    	y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    
    	svg.attr({
    		"width": x,
    		"height": y
    	});
	});



var projection = d3.geo.mercator()
				.translate([x/2, y/2])
				.scale(750)
				.center([30,40])
			;
                       
var path = d3.geo.path().projection(projection)
			;


// draw world map
d3.json('d/world.json', function(err, world) {
	if (err) return console.error(err);
	var worldmap = topojson.feature(world, world.objects.worldsubunit)
	;


	svg.selectAll('.country').data(worldmap.features).enter()
		.append('path')
		.attr({
			'd': path,
			'fill':'#414081',
			'class': function(d) { return "country " + d.properties.NAME_LONG}
		})
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
	  				'fill': '#9093ff',
	  				'opacity': function(d) {return (d.deathLat != "NA" && d.originLat != 'NA')? 0.2:0},
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
	                //d is the points attribute for this path, we'll draw
	                //  an arc between the points using the arc function
	                d: path
	            })
	            .style({
	                'stroke': '#5c64ed',
	                'stroke-width': '0.5px',
	                'opacity': '0.3'
	            })
	            ;

	        // exit
	        pathArcs.exit().remove();

	        // death places
	  		svg	.selectAll('.deathPin').data(d).enter()
	  			.append('circle','.originPin')
	  			.attr({
	  				'r': function(d) {return Math.sqrt(d.count)},
	  				'fill': '#881722',
	  				'stroke': '#FFF',
	  				'stroke-width': '0.3',
	  				'opacity': function(d) {return (d.deathLat != "NA" && d.originLat != 'NA')? 0.5:0;},	
	  				'transform': function(d) {return 'translate(' + projection([d.deathLng,d.deathLat]) + ')'} 
	  			});

	});
});