(function() {

  d3.json("input_data.json").then(function(data) {
    update(data)
  });

  function update(links) {
    console.log("CheckPt:update");
    console.log(links);

    const nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(link => {
      link.source =
        nodes[link.source] || (nodes[link.source] = { name: link.source });
      link.target =
        nodes[link.target] || (nodes[link.target] = { name: link.target });
    });

    // Compute targetDistance for each link
    for (let i = 0; i < links.length; i++) {
      if (links[i].targetDistance === -1) continue;
      links[i].targetDistance = 0;
      for (let j = i + 1; j < links.length; j++) {
        if (links[j].targetDistance === -1) continue;
        if (
          links[i].target === links[j].source &&
          links[i].source === links[j].target
        ) {
          links[i].targetDistance = 1;
          links[j].targetDistance = -1;
        }
      }
    }

    ////////////////////////////////////////////////////////////
    //// Initial Setup /////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    const width = 1200;
    const height = 800;

    const nodeRadius = 25;

    const forcePadding = nodeRadius + 10;
    const targetDistanceUnitLength = nodeRadius / 4;

    var simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(d => d.name)
          .distance(200)
          .links(links)
      )
      .force(
        "collide",
        d3
          .forceCollide()
          .radius(nodeRadius + 0.5)
          .iterations(4)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked)
      .nodes(d3.values(nodes));

    ////////////////////////////////////////////////////////////
    //// Render Chart //////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    const chartContainer = d3.select(".chart-container");

    const svg = chartContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Per-type markers, as they don't inherit styles.
    svg
      .append("defs")
      .selectAll("marker")
      .data(["rejected", "accepted", "response"])
      .enter()
      .append("marker")
      .attr("id", d => d)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("refX", nodeRadius + 8)
      .attr("refY", 4)
      .attr("orient", "auto")
      .attr("markerUnits", "userSpaceOnUse")
      .append("path")
      .attr("d", "M0,0 L0,8 L8,4 z");

    const linkPath = svg
      .append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("id", (d, i) => `link-${i}`)
      .attr("class", d => `link ${d.type}`)
      .attr("marker-end", d => `url(#${d.type})`);

    const linkLabel = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("dy", "0.31em");
    linkLabel
      .append("textPath")
      .attr("href", (d, i) => `#link-${i}`)
      .attr("startOffset", "50%")
      .text(d => d.type);

    const nodeCircle = svg
      .append("g")
      .selectAll("circle")
      .data(d3.values(nodes))
      .enter()
      .append("circle")
      .attr("r", nodeRadius)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    const nodeLabel = svg
      .append("g")
      .selectAll("text")
      .data(d3.values(nodes))
      .enter()
      .append("text")
      .attr("class", "node-label")
      .attr("y", ".31em")
      .attr("text-anchor", "middle")
      .text(function(d) {
        return d.name;
      });

    // Use elliptical arc path segments to doubly-encode directionality.
    function ticked() {
        linkPath
        .attr(
            "d",
            d => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`
        )
        .attr("transform", d => {
            const translation = calcTranslation(
            d.targetDistance * targetDistanceUnitLength,
            d.source,
            d.target
            );
            d.offsetX = translation.dx;
            d.offsetY = translation.dy;
            return `translate (${d.offsetX}, ${d.offsetY})`;
        });
        linkLabel.attr("transform", d => {
        if (d.target.x < d.source.x) {
            return (
            "rotate(180," +
            ((d.source.x + d.target.x) / 2 + d.offsetX) +
            "," +
            ((d.source.y + d.target.y) / 2 + d.offsetY) +
            ")"
            );
        } else {
            return "rotate(0)";
        }
        });
        nodeCircle.attr("transform", transform);
        nodeLabel.attr("transform", transform);
    }

    function transform(d) {
        d.x =
        d.x <= forcePadding
            ? forcePadding
            : d.x >= width - forcePadding
            ? width - forcePadding
            : d.x;
        d.y =
        d.y <= forcePadding
            ? forcePadding
            : d.y >= height - forcePadding
            ? height - forcePadding
            : d.y;
        return "translate(" + d.x + "," + d.y + ")";
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // https://bl.ocks.org/ramtob/3658a11845a89c4742d62d32afce3160
    /**
     * @param {number} targetDistance
     * @param {x,y} point0
     * @param {x,y} point1, two points that define a line segmemt
     * @returns
     * a translation {dx,dy} from the given line segment, such that the distance
     * between the given line segment and the translated line segment equals
     * targetDistance
     */
    function calcTranslation(targetDistance, point0, point1) {
        var x1_x0 = point1.x - point0.x,
        y1_y0 = point1.y - point0.y,
        x2_x0,
        y2_y0;
        if (y1_y0 === 0) {
        x2_x0 = 0;
        y2_y0 = targetDistance;
        } else {
        var angle = Math.atan(x1_x0 / y1_y0);
        x2_x0 = -targetDistance * Math.cos(angle);
        y2_y0 = targetDistance * Math.sin(angle);
        }
        return {
        dx: x2_x0,
        dy: y2_y0
        };
    }

  }

})();
