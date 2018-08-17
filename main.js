var MainChart = {}

var MFilters = {"edges":{"outFlow_Min":0,"outFlow_Max":9999,"inFlow_Min":0,"inFlow_Max":9999},"nodes":{"nodeType":0,"paralysisLevel":0,"controlLevel":0}}
MainChart.width = parseInt($("#Main").css('width').split('px')[0]);
MainChart.height = parseInt($("#Main").css('height').split('px')[0]) - 10;
MainChart.click = {};
MainChart.scale = 0;

MainChart.rScale = d3.scaleLinear()
  .range([2,10])

MainChart.svg = d3.select("#Main").append("svg")
    .attr("width", MainChart.width)
    .attr("height", MainChart.height)

var color = d3.scaleOrdinal(d3.schemeCategory10);

/**是否让选择框（rect_selection框）继续绘制**/
var moveState = 0;
/**是否让点击的节点，撤销被选中的状态**/
 MainChart.nodeClickstate = 0;
/**定义点击节点后，与其相关节点的长度**/
var nodesLength= 0;
/**定义翻页的最大页数**/
var pageMax = 0;
var revokedState = 0;
/**定义选择节点的状态**/
MainChart.selectNodeState = 0;
//设置点击效果
d3.select("body").selectAll("div").on("click.f",function(){
   var id = d3.select(this).attr("id");
   if (id!="Main"&&id!="Frame"&&id!="gragh"&&id!="Panel") {
        revokedState = 1;
               MainChart.Revoked();
        MainChart.svg.selectAll(".link").attr("opacity",1)
        MainChart.svg.selectAll(".node").attr("opacity",0.7)
        MainChart.svg.selectAll(".selectedNode").attr("opacity",1)
   }

});

 d3.select("#Main").on("click.c",function(){
  if (MainChart.nodeClickstate == 1) {

        MainChart.svg.selectAll(".link").attr("opacity",1)
        MainChart.svg.selectAll(".node").attr("opacity",0.7)
        MainChart.svg.selectAll(".selectedNode").attr("opacity",1)
 
  } 
  
 });

d3.select("#revoked").on("click",function(){
  MainChart.Revoked();
})

MainChart.Revoked = function(){
   //MainChart.simulation.stop();
    MainChart.selectNodeState = 0;
     //撤销点击的node
    MainChart.nodeClickstate = 1;
    var fill_color = $("#fill_color").val()
    var stroke_color = $("#stroke_color").val()
    d3.select(".selectDetail").remove();
    d3.select("#icons").remove();
    if (revokedState == 0) {
        d3.select('.g_nodes').selectAll('.node').attr('fill',fill_color);
        d3.select('.g_links').selectAll('.link').attr('stroke',stroke_color);
    }
    
    MainChart.svg.selectAll(".node.selectedNode").classed("selectedNode",false)
    MainChart.svg.selectAll(".link.selectedLink").classed("selectedLink",false)

    MainChart.svg.selectAll(".link").attr("opacity",1)
    MainChart.svg.selectAll(".node").attr("opacity",0.7)

     //撤销选择的node
     MainChart.svg.selectAll(".mian_rect")
        .call(d3.zoom()
        .scaleExtent([0.5, 10])
        .on("zoom", function(d){
          //暂停时间条
          Timeline.pause();
          var transform = d3.event.transform;
          MainChart.scale = transform.k;
          MainChart.svg.selectAll('.node')
          .transition()
          .attr("cx", function(d){

            return transform.applyX(d.x)
          })
          .attr("cy", function(d){

            return transform.applyY(d.y)
          })
  

         MainChart.svg.selectAll('.link')
            .transition()
            .attr("x1", function(d) { return transform.applyX(d.source.x); })
            .attr("y1", function(d) { return transform.applyY(d.source.y); })
            .attr("x2", function(d) { return transform.applyX(d.target.x); })
            .attr("y2", function(d) { return transform.applyY(d.target.y); })

        }));


     MainChart.svg.on("mousedown",null)
     MainChart.svg.on("mousemove",null)
     MainChart.svg.on("mouseup",null)
     MainChart.svg.selectAll("rect.rect_selection").remove();
     revokedState = 0;
     return false;

}

d3.select('#select').on('click',function(d){

   MainChart.nodeClickstate = 1;

   //解除.mian_rect的鼠标事件
  mouseRemove =  MainChart.svg.selectAll(".mian_rect")
  mouseRemove1 = MainChart.svg;
  MainChart.removeZoom(mouseRemove);    
  MainChart.removeZoom(mouseRemove1);
  MainChart.svg.on("mousedown",function(){

  moveState = 0;
  MainChart.svg.selectAll("rect.rect_selection").remove();
 
  if (!d3.event.ctrlKey) {
    d3.selectAll(".node").classed("selectedNode",false);
    d3.selectAll(".link").classed("selectedLink",false);
  }
  var p = d3.mouse(this);

  MainChart.svg.append("rect")
         .attr("rx",6).attr("ry",6)
         .attr("class","rect_selection")
         .attr("x",p[0]).attr("y",p[1])
         .attr("width",0).attr("height",0)
         .attr('stroke','gray')
         .attr('stroke-dasharray','4px')
         .attr('stroke-opacity','0.7')
         .attr('fill','transparent')
  })
    .on("mousemove",function(){
     var s = MainChart.svg.select("rect.rect_selection");
     if (!s.empty()&&moveState==0) {

      var p = d3.mouse(this);
      var d = {
        x:parseInt(s.attr("x"),10),
        y:parseInt(s.attr("y"),10),
        width:parseInt(s.attr("width"),10),
        height:parseInt(s.attr("height"),10)
      }
      
      var move = {
        x:p[0] - d.x,
        y:p[1] - d.y
      }
       
      if (move.x < 1 || (move.x*2 < d.width)) {
          d.x = p[0];
          d.width -= move.x; 
      }else{
          d.width = move.x;
      }
     
     if (move.y < 1 || (move.y*2 < d.height)) {
         d.y = p[1];
         d.height -= move.y;
     }else{
         d.height = move.y;
     }  
      
     s.attr("x",d.x).attr("y",d.y)
      .attr("width",d.width)
      .attr("height",d.height)


      d3.selectAll(".node").each(function(data,i){
      
       var node_x = d3.select(this).attr("cx")
       var node_y = d3.select(this).attr("cy")

       if (node_x>=d.x && node_x<=(parseInt(d.x)+parseInt(d.width))&& 
           node_y>=d.y && node_y<=(parseInt(d.y)+parseInt(d.height))
        ){
          
          d3.select(this).attr("opacity",1).classed("selectedNode",true);

        }else{

          d3.select(this).attr("opacity",0.7).classed("selectedNode",false);
        }

      })
      
      d3.selectAll(".link").each(function(data,i){

         var line_x1 = d3.select(this).attr("x1");
         var line_y1 = d3.select(this).attr("y1");
         var line_x2 = d3.select(this).attr("x2");
         var line_y2 = d3.select(this).attr("y2");


       if (line_x1 >= d.x && line_x1 <= (parseInt(d.x)+parseInt(d.width))&&
           line_y1 >= d.y && line_y1 <= (parseInt(d.y)+parseInt(d.height))&&
           line_x2 >= d.x && line_x2 <= (parseInt(d.x)+parseInt(d.width))&&
           line_y2 >= d.y && line_y2 <= (parseInt(d.y)+parseInt(d.height))
          ){

          d3.select(this).classed("selectedLink",true);

        }else{

          d3.select(this).classed("selectedLink",false);

        }

      })


     } 

    })
     .on( "mouseup", function() {

          //不让其再继续绘制选择框（即rect_selection的绘制停止）
          moveState = 1;
          //删掉上次的svg
          //显示选择区域内的细节
          Select.showDetail();
          console.log("upupupupup")
          d3.select('.g_nodes').selectAll('.node').attr('fill',"none");
          d3.select('.g_links').selectAll('.link').attr('stroke',"none");

          MainChart.svg.on("mousedown",null)
          MainChart.svg.on("mousemove",null)
          MainChart.svg.on("mouseup",null)
          MainChart.svg.selectAll("rect.rect_selection").remove();
          return false;


        })

})





MainChart.svg.append("rect")
    .attr("width", MainChart.width)
    .attr("height", MainChart.height)
    .attr("class","mian_rect")
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(d3.zoom()
        .scaleExtent([0.5, 10])
        .on("zoom", function(d){

          //暂停时间条
            Timeline.pause();
         // MainChart.nodeClickstate = 1;
          var transform = d3.event.transform;
          MainChart.scale = transform.k;
          MainChart.svg.selectAll('.node')
          .transition()
          .attr("cx", function(d){

            return transform.applyX(d.x)
          })
          .attr("cy", function(d){

            return transform.applyY(d.y)
          })
  

         MainChart.svg.selectAll('.link')
            .transition()
            .attr("x1", function(d) { return transform.applyX(d.source.x); })
            .attr("y1", function(d) { return transform.applyY(d.source.y); })
            .attr("x2", function(d) { return transform.applyX(d.target.x); })
            .attr("y2", function(d) { return transform.applyY(d.target.y); })

        }));

MainChart.nodesByName = {};

MainChart.locationStore = {};

MainChart.infor = {};

MainChart.nodes = [];

MainChart.links = [];

MainChart.flow = [] ;

MainChart.distData = [];

MainChart.simulation;

MainChart.show = function(){
  d3.json("/first", function(error, data) {

    if (error) throw error;
    
    MainChart.Init(data);

 }) 
}


MainChart.Init = function(data){
  
  d3.select(".g_links").remove();
  d3.select(".g_nodes").remove();

  MainChart.nodes = [];
  MainChart.links = [];
  MainChart.flow = [];
  MainChart.nodesByName = {};

  information = data['info'];

  MainChart.infor = information;

  MainChart.flow = data['flow'];

  max = 0

  for(head in information){

    dd = information[head]

    max = max > dd[0] + dd[1] ? max : dd[0] + dd[1]

    MainChart.distData.push(dd[1] + dd[0])
  }


  MainChart.rScale.domain([1,max])

  MainChart.links = data['links']


  // Create MainChart.nodes for each unique source and target.
  MainChart.links.forEach(function(link) {
    link.source = MainChart.nodeByName(link[0]);
    link.target = MainChart.nodeByName(link[1]);
    link.count = parseInt(link[2][0]);
    link.inputFlow = parseInt(link[2][1]);
    link.outputFlow = parseInt(link[2][2]);
  });

  // Extract the array of MainChart.nodes from the map by name.

  MainChart.simulation = d3.forceSimulation(MainChart.nodes)
    .force("charge", d3.forceManyBody().strength(-15))
    .force("link", d3.forceLink(MainChart.links).distance(30).strength(1).iterations(10))
    .force("center", d3.forceCenter(MainChart.width / 2, MainChart.height / 2))
   // .force("collide",d3.forceCollide( function(d){return 5}) )
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alphaTarget(1)
    .on("tick", MainChart.ticked)
    .stop();


  for (var i = 0, n = Math.ceil(Math.log(MainChart.simulation.alphaMin()) / Math.log(1 - MainChart.simulation.alphaDecay())); i < n; ++i) {
    MainChart.simulation.tick();
  }

  MainChart.link = MainChart.svg
      .append("g")
      .attr("class","g_links")
      .selectAll(".link")
      .data(MainChart.links)
    .enter().append("line")
      .attr("class", "link")
        .attr('source', function(d){
        return d.source['id']
      })
      .attr('target', function(d){
        return d.target['id']
      })
      .attr("inputFlow",function(d){
        return d.inputFlow;
      })
      .attr("outputFlow",function(d){
        return d.outputFlow;
      })
      .attr("stroke-opacity", 0.3)
      .attr("stroke", 'grey')
      .attr('width',function(d){

        return parseInt(d.count)
      })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
   
   // MainChart.image = MainChart.svg.selectAll(".image")
   //    .data(MainChart.nodes)
   //    .enter().append("image")
   //    .attr("class","image")


  // Create the node circles.
  MainChart.node = MainChart.svg.append("g")
      .attr("class","g_nodes")
      .selectAll(".node")
      .data(MainChart.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d){

        kk = information[d.id]

        return MainChart.rScale(kk[0] + kk[1])
      })
      .attr('sourceCount', function(d){

        kk = information[d.id]
        if(kk[0] != 0 && kk[1] == 0){
          return kk[0]
        }
      })
      .attr('targetCount', function(d){

        kk = information[d.id]
        if(kk[0] == 0 && kk[1] != 0){
          return kk[1]
        }
      })
      .attr("nodeType", function(d){

        kk = information[d.id]
        return kk[3]
      })
      .attr("paralysisLevel", function(d){

        kk = information[d.id]
        return kk[4]
      })
      .attr("controlLevel", function(d){

        kk = information[d.id]
        return kk[5]
      })
      .attr("opacity", 0.7)
      .attr("fill", 'steelblue')
      .attr("cx", function(d){

        return d.x
      })
      .attr("cy", function(d){

        return d.y
      })
      .attr("id",function(d){

        return '_' + d.id
      })
      .on("mouseover", function(d) {
       // alert("over");
        var xPosition = parseFloat(d3.select(this).attr("cx"));
        var yPosition = parseFloat(d3.select(this).attr("cy"));
        
        d3.select("#tooltip")
           .style("left", xPosition + "px")
           .style("top", yPosition + "px")
           .select("#name")
           .text(information[d.id][2]);

        d3.select("#tooltip")
           .select("#indegree")
           .text(information[d.id][0]);

        d3.select("#tooltip")
           .select("#outdegree")
           .text(information[d.id][1]);

        d3.select("#tooltip")
           .select("#hostType")
           .text(function(){
             if (information[d.id][3] == 1) {
                return "Host"
             }else if (information[d.id][3] == 3) {
                return "Switch"
             }else{
                return "Server"
             }
           });
        d3.select("#tooltip")
           .select("#controlLevel")
           .text(information[d.id][4]);

        d3.select("#tooltip")
           .select("#paralysisLevel")
           .text(information[d.id][5]);




        d3.select("#tooltip").classed("hidden", false);

      })

      .on("mouseout", function() {

        d3.select("#tooltip").classed("hidden", true);
      })
      .on('click',function(n1){
        MainChart.click = {}
        nodesLength = 0;
        countFlow(MainChart.flow,information[n1.id][2])

        MainChart.svg.selectAll(".node")
        .attr('opacity',function(n2){
        
          value = 0.1

          MainChart.links.forEach(function(l) {

            if(l.source.id == n1.id && l.target.id == n2.id){
              nodesLength++;
              value = 0.7
              countFlow(MainChart.flow,information[n2.id][2])
          
              return 
            }
            else if(l.target.id == n1.id && l.source.id == n2.id){
              nodesLength++;
              value = 0.7
              countFlow(MainChart.flow,information[n2.id][2])
            
              return 
            }      
            
          });

          return value

        })

        MainChart.svg.selectAll(".link")
        .attr('opacity',function(l){
 
          if(l.source.id == n1.id || l.target.id == n1.id)
            return 0.7
          else
            return 0.1

        })

        d3.select(this).attr('opacity',0.7)
      
        pageMax = Math.ceil(nodesLength/10);
        MainChart.nodeClickstate = 0;
        $("#details")[0].style.display = "none";
        showFlowDetail(MainChart.click);
    
      })
    
    MainChart.getInfo();
    
}




 MainChart.updateForce = function() { 

  MainChart.simulation.stop();  
  var strenth = $("#strenth").val();  
  var distance = $("#distance").val();  

  MainChart.simulation
  .force("link", d3.forceLink().distance(distance).strength(strenth));      
 
  MainChart.simulation.restart();
  //MainChart.simulation.stop();
}




MainChart.Update = function(){

  d3.json("/update", function(error, operations) {

      willDelete = {'MainChart.nodes':{},'edges':{}}

      
    //  MainChart.node.each(function(d){

     //   locationStore[d.id] = {'x':d.x,'y':d.y}
     // })


      operations.edges.add.forEach(function(d){

        list = d.split('&')

        MainChart.links.push({
          'source':MainChart.nodeByName(list[0]),
          'target':MainChart.nodeByName(list[1]),
          'count':1
        })
      })

      operations.nodes.delete.forEach(function(d){

        willDelete['MainChart.nodes'][d] = 1
  
      })

      operations.edges.delete.forEach(function(d){

        list = d.split('&')
        willDelete['edges'][list[0] + '&' + list[1]] = 1
  
      })


      //MainChart.nodes = d3.values(MainChart.nodesByName);

      MainChart.simulation.nodes(MainChart.nodes)
      MainChart.simulation.force("link").links(MainChart.links)


      for (var i = 0, n = Math.ceil(Math.log(MainChart.simulation.alphaMin()) / Math.log(1 - MainChart.simulation.alphaDecay())); i < n; ++i) {
        MainChart.simulation.tick();
      }

      MainChart.nodes = MainChart.nodes.filter(function(d){
        return willDelete['MainChart.nodes'][d.id] == undefined
      })

      MainChart.node = MainChart.node.data(MainChart.nodes)

   /*   node.each(function(d){
      if (locationStore[d.id] != undefined){
          d.y = locationStore[d.id].y
          d.x = locationStore[d.id].x

          d.fx = d.x;
          d.fy = d.y;
        }
      })*/


      MainChart.node
      .exit()
      .attr('r',15)
      .transition()
      .duration(1000)
      .attr('r',0)
      .remove();


      MainChart.node = MainChart.node.enter().append("circle")
      .attr("class", "node")
      .attr("id",function(d){
        return d.id;
      })
      .attr("r", function(d){ 
        
        return 3
      })
      .attr("opacity", 0.5)
      .attr("fill", function(d){
        return 'red'

      })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .merge(MainChart.node);

      MainChart.link.style('stroke',function(d){

        if(willDelete['edges'][d.source.id + "&" + d.target.id] != undefined){
          return '#00A388'
        }

        return 'steelblue'
      })


      MainChart.link = MainChart.link.data(MainChart.links.filter(function(d){
        return willDelete['edges'][d.source.id + "&" + d.target.id] == undefined
      }), function(d) { return d.source.id + "&" + d.target.id; });


      MainChart.link
      .exit()
      .style('stroke-opacity',1)
      .transition()
      .duration(1000)
      .style('stroke-opacity',0)
      .remove();

      MainChart.link = MainChart.link.enter().append("line")
      .attr("class", "link")
      .attr("stroke-opacity", 0.3)
      .attr("stroke", function(d){
        return 'red'
      })
      .attr('width',function(d){ return parseInt(d.count)})
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .merge(MainChart.link);

      MainChart.simulation.nodes(MainChart.nodes)
      MainChart.simulation.force("link").links(MainChart.links)


      for (var i = 0, n = Math.ceil(Math.log(MainChart.simulation.alphaMin()) / Math.log(1 - MainChart.simulation.alphaDecay())); i < n; ++i) {
        MainChart.simulation.tick();
      }

      d3.timeout(function(d){
          MainChart.positionUpdate()
      },1000)


    })
}


d3.selectAll("#refresh").on("click",function(d){
  MainChart.Revoked();
  MainChart.Update();

})
MainChart.ticked = function() {

      MainChart.link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    

      MainChart.node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

  
  }

MainChart.positionUpdate = function(){

      MainChart.node.transition()
            .duration(1000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .transition()
            .attr("fill", 'steelblue')

      MainChart.link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.source.x; })
            .attr("y2", function(d) { return d.source.y; })
            .transition()
            .delay(3000)
            .duration(3000)
            .attr("stroke", 'steelblue')
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
}


MainChart.nodeByName = function(name) {

  if(MainChart.nodesByName[name]){

    return MainChart.nodesByName[name]
  }
  else{

    MainChart.nodesByName[name] = {id: name}
    MainChart.nodes.push(MainChart.nodesByName[name])

    return MainChart.nodesByName[name]

  }
   
}


//解除绑定zoom()的mouse事件
MainChart.removeZoom = function(svg){

    svg.on("mousedown.zoom", null);
    svg.on("mousemove.zoom", null);
    svg.on("dblclick.zoom", null);
    svg.on("touchstart.zoom", null);
    svg.on("wheel.zoom", null);
    svg.on("mousewheel.zoom", null);
    svg.on("MozMousePixelScroll.zoom", null);
}


MainChart.getInfo = function(){
 var NodeType = $("#NodeType").val()
 var OutFlow_Min = $("#OutFlow_Min").val()
 var OutFlow_Max = $("#OutFlow_Max").val()
 var InFlow_Min = $("#InFlow_Min").val()
 var InFlow_Max = $("#InFlow_Max").val()
 var ParalysisLevel = $("#ParalysisLevel").val()
 var ControlLevel = $("#ControlLevel").val()


 MFilters.nodes.nodeType = NodeType;
 MFilters.edges.outFlow_Min = OutFlow_Min;
 MFilters.edges.outFlow_Max = OutFlow_Max;
 MFilters.edges.inFlow_Min = InFlow_Min;
 MFilters.edges.inFlow_Max = InFlow_Max;
 MFilters.nodes.paralysisLevel = ParalysisLevel;
 MFilters.nodes.controlLevel = ControlLevel;
 
 updateforchGraphM();
}




function updateforchGraphM(){
  resetGraph()
  filtedNode = {}
  filtedEdges = {}

  //node filtration
  d3.select('.g_nodes').selectAll('.node').attr('filted',function(d){
    nodeInfo = {
    "nodeType":d3.select(this).attr('nodeType'),
    "paralysisLevel":d3.select(this).attr('paralysisLevel'),
    "controlLevel":d3.select(this).attr('controlLevel')
    }
    nodeId = d3.select(this).attr('id')
    isFilted = funcFilter('nodes',nodeInfo)
    d3.select(this).attr('filted',isFilted)
    if(isFilted == true){
      filtedNode[nodeId] = true
      d3.select(this).attr('fill','none')
    }

  })

  //edge filtration
  d3.select('.g_links').selectAll('.link').attr('filted',function(d){
    nodeInfo = {
      "inFlow": d3.select(this).attr("inputFlow"),
      "outFlow": d3.select(this).attr("outputFlow")
    }

    source = d3.select(this).attr('source')
    target = d3.select(this).attr("target")

    
    isFilted = funcFilter('edges',nodeInfo)
    
    if(isFilted == true){
      filtedEdges['_' + source] = true
      filtedEdges['_' + target] = true
      d3.select(this).attr('stroke','none')
    }
  })

  //filtrate link by node
  d3.select('.g_links').selectAll('.link').attr('filted',function(d){
    source = d3.select(this).attr('source')
    target = d3.select(this).attr("target")

    if(filtedNode['_' + source] == true || filtedNode['_' + target] == true){
      d3.select(this).attr('stroke','none')
    }
  })
  

  //filtrate node by link
  d3.select('.g_nodes').selectAll('.node').attr('filted',function(d){
    id = d3.select(this).attr('id')
    if(filtedEdges[id]){
      d3.select(this).attr('fill','none')
    }
  })
}

function funcFilter(prop,info){
  if(prop == 'nodes'){
    for(head in info){
      if(MFilters['nodes'][head] == 0){
        continue
      }
      else if(info[head] != MFilters['nodes'][head]){
        return true
      }
    }
    return false
  }
  if(prop == 'edges'){

    for(head in info){
      if(MFilters['edges'][head + "_Min"] == 0){
        continue
      }else if(MFilters['edges'][head + '_Min'] > info[head]){
        return true
      }else if(MFilters['edges'][head + '_Max'] < info[head]){
        return true
      }
    }

    for(head in info){
      if(MFilters['edges'][head + '_Max'] == 9999){
        continue
      }else if(MFilters['edges'][head + '_Min'] > info[head]){
        return true
      }else if(MFilters['edges'][head + '_Max'] < info[head]){
        return true
      }
    }
    return false
  }
}

function resetGraph(){
    var fill_color = $("#fill_color").val()
    var stroke_color = $("#stroke_color").val()
    d3.select('.g_links').selectAll('.link').attr('filted',false)
    d3.select('.g_nodes').selectAll('.node').attr('filted',false)

    d3.select('.g_nodes').selectAll('.node').attr('fill',fill_color)
    d3.select('.g_links').selectAll('.link').attr('stroke',stroke_color)

}

/**节点流量情况**/
function countFlow(data,id){
 //console.log(data)
  for (head in data){
     // alert("dddd")
    
     if (data[head]["source"] == id) {
        
        if (MainChart.click[id]) {

           MainChart.click[id]["inputFlow"].push(data[head]["inputFlow"])
           MainChart.click[id]["outputFlow"].push(data[head]["outputFlow"])

        }else{
           
           MainChart.click[id] = {"inputFlow":[],"outputFlow":[]};
           MainChart.click[id]["inputFlow"].push(data[head]["inputFlow"])
           MainChart.click[id]["outputFlow"].push(data[head]["outputFlow"])
        }
        
     }else if (data[head]["target"] == id) {
          
        if (MainChart.click[id]) {
           MainChart.click[id]["inputFlow"].push(data[head]["outputFlow"])
           MainChart.click[id]["outputFlow"].push(data[head]["inputFlow"])

        }else{
           
           MainChart.click[id] = {"inputFlow":[],"outputFlow":[]};
           MainChart.click[id]["inputFlow"].push(data[head]["outputFlow"])
           MainChart.click[id]["outputFlow"].push(data[head]["inputFlow"])
        }

     }

  }

}

/**显示点击节点后，相关节点与点击节点的详细流量情况**/
function showFlowDetail(dataflow){
   var j = 0;
   d3.select("#Panel").selectAll("svg").remove()
   d3.select("#Panel").selectAll("ul").remove()
  for (head in dataflow) {   
     if (j == 0) {   //dict中的第一个为点击选中的节点

        Data = []

        for(var i=0;i<20;i++){
           var temp = [Math.floor(Math.random() * 50),Math.floor(Math.random() * 50),Math.floor(Math.random()* 50),Math.floor(Math.random()* 50)];
           Data.push(temp);
        }

        var _his = new histogram()
         _his.Init('Panel',{divHeight:150, dictLength : 20, data: Data});

       }else{ //剩余节点为与其相关的节点
         
         Data = [] 
         for(var i=0;i<100;i++){
              var temp = [Math.floor(Math.random() * 10),Math.floor(Math.random() * 10),Math.floor(Math.random()* 10),Math.floor(Math.random()* 10)];
              Data.push(temp);
           }

          var _his = new HeatLine()
           _his.Init('Panel',{divHeight:30, dictLength : 100, data: Data, id:head ,num:j });
       }
     
      j++;
  }
  paginate(j-1)
  
}


var currentPage = 1;

//流量分页
function paginate(length){
 console.log(pageMax)
   var str = "<ul class='pager'> <li class='previous disabled'><a href='javascript:prev();'>&larr; Prev</a></li><li class='next'><a href='javascript:next();'>Next &rarr;</a></li></ul>"
   if (length > 10) {
    console.log(length)
    document.getElementById("Panel").innerHTML += str;
    
    for (var i = 11; i <= length; i++) {
      document.getElementById(""+i).style.display = "none";
    }
   }

}

function next(){
    currentPage++;

   if (currentPage > pageMax) {
      currentPage = pageMax;
      return ;
    }
     
    d3.select(".previous").classed("disabled",false);
    for (var i = 1; i <= nodesLength; i++) {
         if ((currentPage-1)*10 < i&&i <= currentPage*10) {
            document.getElementById(""+i).style.display = "block";
         }else{
            document.getElementById(""+i).style.display = "none";
         }
      }

    if (currentPage == pageMax) {
       d3.select(".next").classed("disabled",true);
    }
}

function prev(){
    currentPage--;

    if (currentPage < 1) {
      currentPage = 1;
      return ;
    }
    d3.select(".next").classed("disabled",false);
    for (var i = 1; i <= nodesLength; i++) {
         if ((currentPage-1)*10 < i&&i <= currentPage*10) {
            document.getElementById(""+i).style.display = "block";
         }else{
            document.getElementById(""+i).style.display = "none";
         }
      }

    if (currentPage == 1) {
       d3.select(".previous").classed("disabled",true);
    }
}
