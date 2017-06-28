var array1 = [32,34,43,14,24,23,16,28,32,18];
$(document).ready(function(){ 	
    var d1 = [];
    for (var i = 0; i <= 10; i += 1)
        d1.push([i, array1[i]]);

    var d2 = [];
    for (var i = 0; i <= 10; i += 1)
        //d2.push([i, parseInt(Math.random() * 30)]);
        d2.push([i, array1[i]]);

    var d3 = [];
    for (var i = 0; i <= 10; i += 1)
        //d3.push([i, parseInt(Math.random() * 30)]);
        d3.push([i, array1[i]]);

    var stack = 0, bars = true, lines = false, steps = false;
    
    function plotWithOptions() {
        $.plot($("#placeholder2"), [ d1, d2, d3 ], {
            series: {
                stack: stack,
                lines: { show: lines, fill: true, steps: steps },
                bars: { show: bars, barWidth: 0.6 }
            }
        });
    }

    plotWithOptions();
    
    $(".stackControls input").click(function (e) {
        e.preventDefault();
        stack = $(this).val() == "With stacking" ? true : null;
        plotWithOptions();
    });
    $(".graphControls input").click(function (e) {
        e.preventDefault();
        bars = $(this).val().indexOf("Bars") != -1;
        lines = $(this).val().indexOf("Lines") != -1;
        steps = $(this).val().indexOf("steps") != -1;
        plotWithOptions();
    });
	
	
});

