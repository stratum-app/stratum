"use client";

import { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { classifyTie, daysSince } from "@/lib/scoring";
import type { Contact, TieClass } from "@/types";

interface NetworkGraphProps {
  contacts: Contact[];
  onNodeClick?: (contact: Contact) => void;
  onActClick?: (contact: Contact) => void;
}

const NODE_COLORS: Record<TieClass, string> = {
  strong: "#F5F0E8",
  medium: "#888888",
  weak: "#C44820",
};

const LEGEND_ITEMS: { label: string; color: string; desc: string }[] = [
  { label: "Strong tie", color: NODE_COLORS.strong, desc: "Strength ≥ 4, contacted ≤ 60 days" },
  { label: "Medium tie", color: NODE_COLORS.medium, desc: "Everything in between" },
  { label: "Weak tie", color: NODE_COLORS.weak, desc: "Strength ≤ 2 or 90+ days dormant" },
];

// Deterministic "should connect" based on shared sector
function shouldConnect(a: Contact, b: Contact): boolean {
  return !!(a.industry && b.industry && a.industry === b.industry);
}

function buildGraph(contacts: Contact[]): { nodes: Node[]; edges: Edge[] } {
  if (!contacts.length) return { nodes: [], edges: [] };

  const cx = 500;
  const cy = 350;

  // Center "You" node
  const centerNode: Node = {
    id: "__you__",
    type: "youNode",
    position: { x: cx - 18, y: cy - 18 },
    data: {},
    draggable: false,
  };

  // Orbit radius scales with count
  const r = Math.max(180, Math.min(320, 120 + contacts.length * 15));

  const contactNodes: Node[] = contacts.map((c, i) => {
    const angle = (2 * Math.PI * i) / contacts.length - Math.PI / 2;
    const strengthBonus = ((c.tie_strength ?? 3) - 1) * 12;
    return {
      id: c.id,
      type: "contactNode",
      position: {
        x: cx + (r + strengthBonus) * Math.cos(angle),
        y: cy + (r + strengthBonus) * Math.sin(angle),
      },
      data: { contact: c },
    };
  });

  // Star edges: center → each contact
  const starEdges: Edge[] = contacts.map((c) => {
    const tie = classifyTie(c);
    return {
      id: `star-${c.id}`,
      source: "__you__",
      target: c.id,
      style: {
        stroke: NODE_COLORS[tie],
        strokeWidth: c.tie_strength >= 4 ? 1.5 : 1,
        strokeOpacity: tie === "strong" ? 0.5 : tie === "medium" ? 0.3 : 0.2,
        strokeDasharray: tie === "weak" ? "4 3" : undefined,
      },
      type: "straight",
    };
  });

  // Sector cluster edges
  const sectorEdges: Edge[] = [];
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      if (shouldConnect(contacts[i], contacts[j])) {
        sectorEdges.push({
          id: `sector-${contacts[i].id}-${contacts[j].id}`,
          source: contacts[i].id,
          target: contacts[j].id,
          style: { stroke: "#1E1E1E", strokeWidth: 1, strokeOpacity: 0.6 },
          type: "straight",
        });
      }
    }
  }

  return {
    nodes: [centerNode, ...contactNodes],
    edges: [...starEdges, ...sectorEdges],
  };
}

// ── You node ──────────────────────────────────────────────────────────
function YouNode() {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: 36,
        height: 36,
        backgroundColor: "#C44820",
        border: "1.5px solid #C44820",
        boxShadow: "0 0 16px #C4482040",
      }}
    >
      <Handle type="source" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
      <span className="text-[9px] font-medium text-[#F5F0E8] font-body">You</span>
    </div>
  );
}

// ── Contact node ──────────────────────────────────────────────────────
function ContactNode({
  data,
}: {
  data: { contact: Contact; onActClick?: (c: Contact) => void };
}) {
  const { contact } = data;
  const tie = classifyTie(contact);
  const color = NODE_COLORS[tie];
  const size = 10 + (contact.tie_strength ?? 3) * 3;
  const days = daysSince(contact.last_contact);
  const lastStr =
    days === Infinity
      ? "Never"
      : days > 365
      ? `${Math.floor(days / 365)}y ago`
      : days > 30
      ? `${Math.floor(days / 30)}mo ago`
      : `${days}d ago`;

  return (
    <div
      className="group relative flex items-center justify-center cursor-pointer"
      style={{ width: size * 2, height: size * 2 }}
    >
      <Handle type="source" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />

      {/* Node circle */}
      <div
        className="rounded-full transition-transform duration-150 group-hover:scale-125"
        style={{
          width: size * 2,
          height: size * 2,
          backgroundColor: color,
          opacity: tie === "strong" ? 0.9 : 0.7,
          boxShadow: `0 0 ${size}px ${color}30`,
        }}
      />

      {/* Hover card */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
        <div
          className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-[4px] p-3 whitespace-nowrap shadow-xl"
          style={{ minWidth: 160 }}
        >
          <p className="text-xs font-medium text-[#F5F0E8] font-body mb-0.5">{contact.name}</p>
          {contact.role && (
            <p className="text-[10px] text-[#8A8578] font-body mb-0.5">{contact.role}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {contact.industry && (
              <span className="text-[10px] bg-[#252525] text-[#4A4640] px-1.5 py-0.5 rounded-[2px] font-body">
                {contact.industry}
              </span>
            )}
            <span className="text-[10px] text-[#4A4640] font-body">{lastStr}</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-[#4A4640] font-body capitalize">
              {tie} tie · {contact.tie_strength}/5
            </span>
          </div>
        </div>
        <div className="w-px h-2 bg-[#2A2A2A] mx-auto" />
      </div>
    </div>
  );
}

// Must be module-level to avoid React Flow nodeTypes warning
const nodeTypes = {
  youNode: YouNode,
  contactNode: ContactNode,
};

export function NetworkGraph({ contacts, onNodeClick, onActClick }: NetworkGraphProps) {
  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildGraph(contacts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contacts.length]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(contacts);
    setNodes(n);
    setEdges(e);
  }, [contacts, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id === "__you__") return;
      const contact = contacts.find((c) => c.id === node.id);
      if (contact) onNodeClick?.(contact);
    },
    [contacts, onNodeClick]
  );

  if (!contacts.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A]">
        <p className="text-sm text-[#2A2A2A] font-body">No contacts to display</p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.3}
      maxZoom={2.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1A1A1A" />
      <Controls showInteractive={false} />

      {/* Legend */}
      <Panel position="bottom-left">
        <div className="bg-[#161616] border border-[#1F1F1F] rounded-[4px] p-3 space-y-1.5">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-start gap-2" title={item.desc}>
              <span
                className="w-2 h-2 rounded-full mt-0.5 shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-[#4A4640] font-body">{item.label}</span>
            </div>
          ))}
          <div className="border-t border-[#1F1F1F] pt-1.5 mt-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 border-t border-dashed border-[#4A4640]" />
              <span className="text-[10px] text-[#4A4640] font-body">Weak connection</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 border-t border-[#1E1E1E]" />
              <span className="text-[10px] text-[#4A4640] font-body">Same sector</span>
            </div>
          </div>
        </div>
      </Panel>
    </ReactFlow>
  );
}
