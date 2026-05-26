"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Contact, TieType } from "@/types";

interface NetworkGraphProps {
  contacts: Contact[];
  onNodeClick?: (contact: Contact) => void;
}

const tieColor: Record<TieType, string> = {
  strong: "#4A8C5C",
  weak: "#C44820",
  bridge: "#4A7AA8",
};

function buildNodes(contacts: Contact[]): Node[] {
  const cx = 500;
  const cy = 350;

  return contacts.map((c, i) => {
    const angle = (2 * Math.PI * i) / contacts.length;
    const r = 220 + (c.social_capital_score / 100) * 80;

    return {
      id: c.id,
      type: "contact",
      position: {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      },
      data: { contact: c },
    };
  });
}

function buildEdges(contacts: Contact[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      if (Math.random() < 0.15) {
        const tie = contacts[i].tie_type;
        edges.push({
          id: `e-${contacts[i].id}-${contacts[j].id}`,
          source: contacts[i].id,
          target: contacts[j].id,
          style: {
            stroke: tieColor[tie],
            strokeWidth: tie === "bridge" ? 1.5 : 1,
            strokeOpacity: tie === "strong" ? 0.5 : 0.25,
          },
          type: "straight",
        });
      }
    }
  }
  return edges;
}

function ContactNode({ data }: { data: { contact: Contact } }) {
  const { contact } = data;
  const size = 8 + (contact.social_capital_score / 100) * 14;
  const color = tieColor[contact.tie_type];

  return (
    <div
      className="group relative flex items-center justify-center cursor-pointer"
      style={{ width: size * 2, height: size * 2 }}
    >
      <div
        className="rounded-full transition-all duration-150 group-hover:scale-125"
        style={{
          width: size * 2,
          height: size * 2,
          backgroundColor: color,
          opacity: 0.8,
          boxShadow: `0 0 ${size}px ${color}40`,
        }}
      />
      <div
        className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10"
      >
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-[4px] px-2.5 py-1.5 whitespace-nowrap">
          <p className="text-xs font-medium text-[#F5F0E8] font-body">{contact.name}</p>
          {contact.role && (
            <p className="text-[10px] text-[#4A4640] font-body">{contact.role}</p>
          )}
        </div>
        <div className="w-px h-1.5 bg-[#2A2A2A]" />
      </div>
    </div>
  );
}

const nodeTypes = { contact: ContactNode };

export function NetworkGraph({ contacts, onNodeClick }: NetworkGraphProps) {
  const initialNodes = useMemo(() => buildNodes(contacts), [contacts]);
  const initialEdges = useMemo(() => buildEdges(contacts), [contacts]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const contact = contacts.find((c) => c.id === node.id);
      if (contact && onNodeClick) onNodeClick(contact);
    },
    [contacts, onNodeClick]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      attributionPosition="bottom-left"
      minZoom={0.3}
      maxZoom={2.5}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="#1E1E1E"
      />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(n) => {
          const c = contacts.find((c) => c.id === n.id);
          return c ? tieColor[c.tie_type] : "#2A2A2A";
        }}
        maskColor="rgba(15,15,15,0.7)"
      />
    </ReactFlow>
  );
}
