import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { get, map, isEqual } from "lodash";
import "./styles.css";
import { set } from "d3";
import source_data from "./sample_input.json";

export default function App() {
  const [data, setData] = useState({
    levels: source_data,
    nodes: [],
    nodes_index: {},
    links: [],
    bundles: [],
    layout: {}
  });
  const color = d3.scaleOrdinal(d3.schemeDark2);

  const formatLevels = (currentNode, responses, levels) => {
    let newArr = [];
    levels.forEach((level, i) => {
      if (levels.find(level, { id: currentNode.id })) {
        newArr = map(responses, response => {
          if (get(response, "properties")) {
            let targetVertexProperties = isEqual(
              get(currentNode, "name"),
              get(response, "sourceVertex.properties.name")
            )
              ? get(response, "targetVertex")
              : get(response, "sourceVertex");
            return {
              ...targetVertexProperties.properties,
              id: get(targetVertexProperties, "id"),
              name: get(targetVertexProperties, "properties.name"),
              parents: [`${get(currentNode, "id")}`],
              color:
                get(
                  this.setColor(get(targetVertexProperties, "properties.type"), ""),
                  "nodeColor"
                ) || "black",
              isOpen: false
            };
          } else {
            let sKey = get(currentNode, "sKey");
            return {
              id: get(response, "external.key"),
              name: isEqual(
                get(currentNode, "name"),
                get(response, "sourceArtifact.external.key")
              )
                ? get(response, "targetArtifact.external.key")
                : get(response, "sourceArtifact.external.key"),
              parents: [`${get(currentNode, "id")}`],
              color: get(this.setColor(sKey, ""), "nodeColor") || "black",
              isOpen: false
            };
          }
        });

        // Nasty code
        levels[i + 1] = levels[i + 1] || [];
        levels[i + 1] = [...levels[i + 1], ...newArr];
        // levels = [...levels, newArr];
        level.forEach(subLevel => {
          if (isEqual(currentNode.id, subLevel.id)) {
            subLevel.isOpen = true;
          }
        });
      }
    });
    return levels;
  };

  const compactLevels = (currentNode, levels) => {
    let newArr = [];
    map(levels, a => {
      let subArr = [];
      map(a, i => {
        subArr = [
          ...subArr,
          {
            ...i,
            name: i.name,
            id: i.id,
            parents: levels.find(i.parents, i => i === Object(i))
              ? map(i.parents, "id")
              : i.parents,
            color: i.color,
            isOpen: i.isOpen
          }
        ];
      });
      newArr = [...newArr, subArr];
    });
    return newArr;
  };

  function showTooltip(e, n) {
    //rconsole.log('CheckPt showTooltip:', n);
    let tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = n.name
      + "</br>Status: " + n.status
      + JSON.stringify(n.details, null, "</br>").replace(/[\[\]\{\}\"\\]+/g, '');
    tooltip.style.display = "block";
    tooltip.style.left = e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY + 10 + 'px';
  }
  
  function hideTooltip(e, n) {
    var tooltip = document.getElementById('tooltip');
    tooltip.style.display = "none";
  }

  const formatData = levels => {
    // precompute level depth
    levels.forEach((l, i) => l.forEach(n => (n.level = i)));

    // console.log(levels)
    var nodes = levels.reduce((a, x) => a.concat(x), []);
    var nodes_index = {};
    nodes.forEach(d => (nodes_index[d.id] = d));

    // objectification
    nodes.forEach(d => {
      d.parents = (d.parents === undefined ? [] : d.parents).map(
        p => nodes_index[p]
      );
    });

    // precompute bundles
    levels.forEach((l, i) => {
      var index = {};
      l.forEach(n => {
        if (n.parents.length === 0) {
          return;
        }

        var id = n.parents.map(d => d.id).sort().join("--");
        if (id in index) {
          index[id].parents = index[id].parents.concat(n.parents);
        } else {
          index[id] = { id: id, parents: n.parents.slice(), level: i };
        }
        n.bundle = index[id];
      });
      l.bundles = Object.keys(index).map(k => index[k]);
      l.bundles.forEach((b, i) => (b.i = i));
    });

    var links = [];
    nodes.forEach(d => {
      d.parents.forEach(p =>
        links.push({ source: d, bundle: d.bundle, target: p })
      );
    });

    var bundles = levels.reduce((a, x) => a.concat(x.bundles), []);

    // reverse pointer from parent to bundles
    bundles.forEach(b =>
      b.parents.forEach(p => {
        if (p.bundles_index === undefined) {
          p.bundles_index = {};
        }
        if (!(b.id in p.bundles_index)) {
          p.bundles_index[b.id] = [];
        }
        p.bundles_index[b.id].push(b);
      })
    );

    nodes.forEach(n => {
      if (n.bundles_index !== undefined) {
        n.bundles = Object.keys(n.bundles_index).map(k => n.bundles_index[k]);
      } else {
        n.bundles_index = {};
        n.bundles = [];
      }
      n.bundles.forEach((b, i) => (b.i = i));
    });

    links.forEach(l => {
      if (l.bundle.links === undefined) {
        l.bundle.links = [];
      }
      l.bundle.links.push(l);
    });

    // layout
    const padding = 20;
    const node_height = 25;
    const node_width = 200;
    const bundle_width = 50;
    const level_y_padding = 16;
    const metro_d = 10;
    const c = 16;
    const min_family_height = 16;

    nodes.forEach(
      n => (n.height = (Math.max(1, n.bundles.length) - 1) * metro_d)
    );

    var x_offset = padding;
    var y_offset = padding;
    levels.forEach(l => {
      x_offset += l.bundles.length * bundle_width;
      y_offset += level_y_padding;
      l.forEach((n, i) => {
        n.x = n.level * node_width + x_offset;
        n.y = node_height + y_offset + n.height / 2;

        y_offset += node_height + n.height;
      });
    });

    var i = 0;
    levels.forEach(l => {
      l.bundles.forEach(b => {
        b.x = b.parents[0].x + node_width + (l.bundles.length - 1 - b.i) * bundle_width;
        b.y = i * node_height;
      });
      i += l.length;
    });

    links.forEach(l => {
      l.xt = l.target.x;
      l.yt = l.target.y + l.target.bundles_index[l.bundle.id].i * metro_d - (l.target.bundles.length * metro_d) / 2 + metro_d / 2;
      l.xb = l.bundle.x;
      l.xs = l.source.x;
      l.ys = l.source.y;
    });

    // compress vertical space
    var y_negative_offset = 0;
    levels.forEach(l => {
      y_negative_offset += -min_family_height + d3.min(l.bundles, b => d3.min(b.links, link => link.ys - c - (link.yt + c))) || 0;
      l.forEach(n => (n.y -= y_negative_offset));
    });

    // very ugly, I know
    links.forEach(l => {
      l.yt =
        l.target.y +
        l.target.bundles_index[l.bundle.id].i * metro_d -
        (l.target.bundles.length * metro_d) / 2 +
        metro_d / 2;
      l.ys = l.source.y;
      l.c1 = l.source.level - l.target.level > 1 ? node_width + c : c;
      l.c2 = c;
    });

    var layout = {
      height: d3.max(nodes, n => n.y) + node_height / 2 + 2 * padding,
      node_height,
      node_width,
      bundle_width,
      level_y_padding,
      metro_d
    };
    console.log(nodes);
    setData({ ...data, levels, nodes, nodes_index, links, bundles, layout });
  };

  useEffect(() => {
    set({ ...data });
    formatData(data.levels);
  }, []);

  return (
    <svg width="1500" height={data.layout.height}>
      {map(get(data, "bundles"), b => {
        let d = b.links.map(l => `
          M${l.xt} ${l.yt}
          L${l.xb - l.c1} ${l.yt}
          A${l.c1} ${l.c1} 90 0 1 ${l.xb} ${l.yt + l.c1}
          L${l.xb} ${l.ys - l.c2}
          A${l.c2} ${l.c2} 90 0 0 ${l.xb + l.c2} ${l.ys}
          L${l.xs} ${l.ys}`
        ).join("");
        return (
          <path style={{fill: "none"}} d={d} stroke={color(b.id)} strokeWidth="2" key={b.u_id} />
        );
      })}

      {map(get(data, "nodes"), n => (
        <>
          <line
            style={{ strokeLinecap: "round", cursor: "pointer" }}
            stroke={n.color || "black"}
            strokeWidth="10"
            x1={n.x}
            y1={n.y - n.height / 2}
            x2={n.x}
            y2={n.y + n.height / 2}
            key={n.u_id}
          />
          <line
            style={{ strokeLinecap: "round", cursor: "pointer" }}
            stroke={n.statusColor}
            strokeWidth="5"
            x1={n.x}
            y1={n.y - n.height / 2}
            x2={n.x}
            y2={n.y + n.height / 2}
            key={n.u_id}
            //onClick={(e) => onToggle(e, n)}
            onMouseMove={(e) => showTooltip(e, n)}
            onMouseOut={(e) => hideTooltip(e, n)}
          />
          <text
            style={{ fontFamily: "sans-serif", fontSize: 11 }}
            x={n.x + 10}
            y={n.y - n.height / 2 - 4}
            key={n.u_id}
            //onClick={(e) => onToggle(e, n)}
            onMouseMove={(e) => showTooltip(e, n)}
            onMouseOut={(e) => hideTooltip(e, n)}
          >
            {n.name}
          </text>
        </>
      ))}
    </svg>
  );
}
