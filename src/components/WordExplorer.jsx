import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Globe, Search, Maximize2, Info } from 'lucide-react';
import kgData from '../data/knowledge_graph.json';

const WordExplorer = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const typeColors = {
    word: '#1CB0F6',
    sense: '#CE82FF',
    sentence: '#FF4B4B',
    pos: '#58CC02',
    context: '#FFC800',
    related: '#8BA4B0',
  };

  const typeLabels = {
    word: 'Root Word',
    sense: 'Meaning / Sense',
    sentence: 'Corpus Sentence',
    pos: 'Part of Speech',
    context: 'Context Domain',
    related: 'Related Word'
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("background", "transparent");

    const g = svg.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));

    const nodes = kgData.nodes.map(d => ({ ...d }));
    const edges = kgData.edges
      .map(d => ({
        ...d,
        source: nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : d.source?.id)),
        target: nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target?.id)),
      }))
      .filter(e => e.source && e.target);

    const sizeMap = { word: 14, sense: 9, pos: 7, context: 7, sentence: 4, related: 8 };

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id(d => d.id).distance(d => d.relation === 'HAS_SENSE' ? 70 : 100))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("collide", d3.forceCollide().radius(12))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "node-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const link = g.append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", d => d.relation === 'HAS_SENSE' ? 'rgba(28,176,246,0.4)' : 'rgba(255,255,255,0.06)')
      .attr("stroke-width", d => d.relation === 'HAS_SENSE' ? 2 : 1);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag()
        .on("start", (e) => { if (!e.active) simulation.alphaTarget(0.3).restart(); e.subject.fx = e.subject.x; e.subject.fy = e.subject.y; })
        .on("drag", (e) => { e.subject.fx = e.x; e.subject.fy = e.y; })
        .on("end", (e) => { if (!e.active) simulation.alphaTarget(0); e.subject.fx = null; e.subject.fy = null; })
      )
      .on("click", (event, d) => { setSelectedNode(d); event.stopPropagation(); });

    node.append("circle")
      .attr("r", d => sizeMap[d.type] || 5)
      .attr("fill", d => typeColors[d.type] || '#8BA4B0')
      .style("filter", "url(#node-glow)")
      .attr("stroke", d => typeColors[d.type] || '#8BA4B0')
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.5);

    node.filter(d => d.type === 'word')
      .append("text")
      .text(d => d.label)
      .attr("x", 18)
      .attr("y", 5)
      .attr("fill", "#E8F0F2")
      .style("font-size", "11px")
      .style("font-family", "'Noto Sans Tamil', Inter")
      .style("font-weight", "600")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    svg.on("click", () => setSelectedNode(null));

    // Search highlight
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      node.style("opacity", d => (d.label?.toLowerCase().includes(term) || d.display?.toLowerCase().includes(term)) ? 1 : 0.08);
      link.style("opacity", 0.05);
    } else {
      node.style("opacity", 1);
      link.style("opacity", 1);
    }

    return () => simulation.stop();
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-text flex items-center gap-3">
            <Globe className="text-sky" /> Tamil Knowledge Graph
          </h2>
          <p className="text-text-muted text-sm mt-1">
            {kgData.metadata.total_words} words · {kgData.metadata.total_senses} senses · {kgData.metadata.total_nodes} nodes · {kgData.metadata.total_edges} edges
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search Tamil words..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-sky transition-colors"
          />
        </div>
      </div>

      {/* Graph + Side Panel */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: 600 }}>
        <div ref={containerRef} className="flex-1 card rounded-2xl overflow-hidden relative cursor-move" style={{ background: 'radial-gradient(circle at center, rgba(28,176,246,0.03) 0%, transparent 70%)' }}>
          <svg ref={svgRef} className="w-full h-full block" style={{ minHeight: 600 }} />
          {/* Legend */}
          <div className="absolute bottom-4 left-4 card p-3 text-xs flex flex-col gap-1.5">
            {Object.entries(typeColors).map(([type, color]) => (
              <span key={type} className="flex items-center gap-2 text-text-muted">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                {typeLabels[type]}
              </span>
            ))}
          </div>
        </div>

        {/* Inspector */}
        {selectedNode && (
          <div className="w-full lg:w-80 card p-6 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 600 }}>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: `${typeColors[selectedNode.type]}20`, color: typeColors[selectedNode.type] }}>
                {typeLabels[selectedNode.type]}
              </span>
            </div>
            <h3 className="text-2xl font-bold tamil text-text break-words">{selectedNode.label}</h3>
            {selectedNode.meaning_en && (
              <div className="p-3 rounded-xl" style={{ background: `${typeColors.sense}10`, border: `1px solid ${typeColors.sense}30` }}>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: typeColors.sense }}>English</span>
                <p className="text-sm text-text">{selectedNode.meaning_en}</p>
                {selectedNode.meaning_ta && (
                  <>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1 mt-2" style={{ color: typeColors.word }}>Tamil</span>
                    <p className="text-sm tamil text-text">{selectedNode.meaning_ta}</p>
                  </>
                )}
              </div>
            )}
            {selectedNode.example && (
              <div className="p-3 bg-bg-elevated rounded-xl border border-border">
                <span className="text-xs font-bold text-text-dim uppercase tracking-wider block mb-1">Example</span>
                <p className="text-sm tamil text-text-muted italic">"{selectedNode.example}"</p>
              </div>
            )}
            {selectedNode.type === 'sentence' && selectedNode.text && (
              <div className="p-3 bg-bg-elevated rounded-xl border border-border">
                <p className="text-sm tamil text-text-muted italic">"{selectedNode.text}"</p>
              </div>
            )}
            <p className="text-xs text-text-dim font-mono mt-auto">ID: {selectedNode.id}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordExplorer;
