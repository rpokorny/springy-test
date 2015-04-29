/* global self: true, Springy:true, _:true */
self.importScripts('node_modules/springy/springy.js');
self.importScripts('node_modules/underscore/underscore.js');

//speed up the simulation by putting the minimal delay between steps
Springy.requestAnimationFrame = function(fn) {
    'use strict';

    self.setTimeout(fn, 0);
};

self.onmessage = function(message) {
    'use strict';

    var graph = new Springy.Graph(),
        nodeDefs = message.data.nodes,
        edgeDefs = message.data.edges,
        nodes = _.object(nodeDefs.map(function (def) {
            return [def.id, graph.newNode(def)];
        })),
        layout,
        renderer,
        graphResult;

    function clear() {
        graphResult = { nodes: [], edges: [] };
    }

    function drawEdge(edge, startPoint, endPoint) {
        graphResult.edges.push({
            startPoint: startPoint,
            endPoint: endPoint,
            type: edge.data.type
        });
    }

    function drawNode(node, point) {
        graphResult.nodes.push({
            point: point,
            data: node.data
        });
    }

    function renderComplete() {
        self.postMessage(graphResult);
    }

    edgeDefs.map(function(def) {
        var startNode = nodes[def.startNode],
            endNode = nodes[def.endNode];

        return graph.newEdge(startNode, endNode, def);
    });

    layout = new Springy.Layout.ForceDirected(graph, 400, 400, 0.5);
    renderer = new Springy.Renderer(layout, clear, drawEdge, drawNode, renderComplete);

    renderer.start();
};
