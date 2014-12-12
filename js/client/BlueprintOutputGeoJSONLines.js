/* globals window, _, VIZI, d3, THREE */
(function() {
  "use strict";

/**
 * Blueprint choropleth output
 * @author Robin Hawkes - vizicities.com
 */  

  // output: {
  //   type: "BlueprintOutputGeoJSONLines",
  //   options: {
  //     colourRange: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],
  //     layer: 100
  //   }
  // }
  VIZI.BlueprintOutputGeoJSONLines = function(options) {
    var self = this;

    VIZI.BlueprintOutput.call(self, options);

    // Triggers and actions reference
    self.triggers = [
      {name: "initialised", arguments: []}
    ];

    self.actions = [
      {name: "outputGeoJSONLines", arguments: ["data"]}
    ];

    self.world;
  };

  VIZI.BlueprintOutputGeoJSONLines.prototype = Object.create( VIZI.BlueprintOutput.prototype );

  // Initialise instance and start automated processes
  VIZI.BlueprintOutputGeoJSONLines.prototype.init = function() {
    var self = this;

    self.emit("initialised");
  };

  // {
  //   outline: [],
  //   value: 123
  // }
  VIZI.BlueprintOutputGeoJSONLines.prototype.outputGeoJSONLines = function(data) {
    var self = this;

    /*var material = new THREE.MeshLambertMaterial({
      vertexColors: THREE.VertexColors,
      ambient: 0xffffff,
      emissive: 0xcccccc,
      shading: THREE.FlatShading,
      // TODO: Remove this by implementing logic to make points clockwise
      side: THREE.BackSide
    });*/

    _.each(data, function(feature) {
      var geom = new THREE.Geometry();
      _.each(feature.linecoords, function(coord, index) {
        var geoCoord = self.world.project(new VIZI.LatLon(coord[1], coord[0]));
        geom.vertices.push(new THREE.Vector3( geoCoord.x, 10, geoCoord.y ));
      });

      //var colour = new THREE.Color(0xffffff * Math.random());
      var colour = new THREE.Color(0xff0000);

      var material = new THREE.LineBasicMaterial({
        color: colour,
        //vertexColors: ,
        linewidth: 5
      });

      var line = new THREE.Line( geom, material );
      self.add(line);
    });

  };

  VIZI.BlueprintOutputGeoJSONLines.prototype.onAdd = function(world) {
    var self = this;
    self.world = world;
    self.init();
  };
}());