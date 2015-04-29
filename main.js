;(function() {
    'use strict';

    var worker = new Worker('springyWorker.js'),
        createSvgElement =
            document.createElementNS.bind(document, 'http://www.w3.org/2000/svg');

    var data = {
        nodes: [{
            id: 1,
            name: 'person 1',
            type: 'person'
        }, {
            id: 2,
            name: 'mention 1',
            type: 'mention'
        }, {
            id: 3,
            name: 'mention 2',
            type: 'mention'
        }, {
            id: 4,
            name: 'org 1',
            type: 'organization'
        }, {
            id: 5,
            name: 'person 2',
            type: 'person'
        }],
        edges: [{
            startNode: 1,
            endNode: 3,
            type: 'entityMention'
        }, {
            startNode: 4,
            endNode: 2,
            type: 'entityMention'
        }, {
            startNode: 1,
            endNode: 5,
            type: 'relation'
        }, {
            startNode: 1,
            endNode: 4,
            type: 'relation'
        }, {
            startNode: 5,
            endNode: 4,
            type: 'relation'
        }]
    };

    function getLoc(loc) { return loc * 50; }

    /**
     * Since sizing stuff in svg has to be so explicit, there is no way to automatically
     * have the node rectangles fit around the text.  Therefore we have to set their size
     * manually after they are inserted into the document
     */
    function sizeRectanglesAroundText(svg) {
        var nodes = Array.prototype.slice.call(svg.querySelectorAll('g.node')),
            padding = 5,
            dimModifier = 2 * padding,
            unit = SVGLength.SVG_LENGTHTYPE_NUMBER;

        nodes.forEach(function(g) {
            var rect = g.getElementsByTagName('rect')[0],
                text = g.getElementsByTagName('text')[0],
                rectHeight = text.clientHeight + dimModifier,
                rectWidth = text.clientWidth + dimModifier,
                rectX = -(rectWidth / 2),
                rectY = -(rectHeight / 2);

            rect.x.baseVal.newValueSpecifiedUnits(unit, rectX);
            rect.y.baseVal.newValueSpecifiedUnits(unit, rectY);
            rect.height.baseVal.newValueSpecifiedUnits(unit, rectHeight);
            rect.width.baseVal.newValueSpecifiedUnits(unit, rectWidth);
        });
    }

    /**
     * Render an svg graph based on the layout info and attach it to the document body
     */
    function renderSvg(data) {
        var svg = createSvgElement('svg'),
            nodes = data.nodes.map(function(node) {
                var text = createSvgElement('text'),
                    rect = createSvgElement('rect'),
                    g = createSvgElement('g'),
                    tspan = createSvgElement('tspan'),
                    type = node.data.type,
                    transform = svg.createSVGTransform();

                tspan.textContent = node.data.name;

                text.appendChild(tspan);

                transform.setTranslate(getLoc(node.point.x), getLoc(node.point.y));

                g.transform.baseVal.initialize(transform);
                g.classList.add('node', type);
                g.appendChild(rect);
                g.appendChild(text);

                return g;
            }),
            edges = data.edges.map(function(edge) {
                var line = createSvgElement('line');

                line.setAttribute('x1', getLoc(edge.startPoint.x));
                line.setAttribute('y1', getLoc(edge.startPoint.y));
                line.setAttribute('x2', getLoc(edge.endPoint.x));
                line.setAttribute('y2', getLoc(edge.endPoint.y));

                return line;
            }),
            nodeGroup = createSvgElement('g'),
            edgeGroup = createSvgElement('g'),
            existingSvg = document.body.querySelector('.root');

        nodeGroup.classList.add('nodes');
        edgeGroup.classList.add('edges');

        nodes.forEach(function(node) {
            nodeGroup.appendChild(node);
        });
        edges.forEach(function(edge) {
            edgeGroup.appendChild(edge);
        });

        svg.setAttribute('viewBox', "-800 -800 1600 1600");
        svg.classList.add('root');
        svg.appendChild(edgeGroup);
        svg.appendChild(nodeGroup);

        if (existingSvg) {
            document.body.replaceChild(existingSvg, svg);
        }
        else {
            document.body.appendChild(svg);
        }

        sizeRectanglesAroundText(svg);
    }

    worker.onmessage = function(message) {
        renderSvg(message.data);
    };

    worker.postMessage(data);
})();
