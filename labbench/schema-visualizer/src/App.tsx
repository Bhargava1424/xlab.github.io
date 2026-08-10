import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import { entities, edges as edgeDefs, ID_FIELD_INDEX, rowHandleId } from "./lib/schema-graph";
import { computeHierarchicalLayout } from "./lib/layout";
import contentStatus from "./content-status.generated.json";
import { EntityCard, type EntityNodeData } from "./components/EntityCard";
import { DetailPanel } from "./components/DetailPanel";
import { Toolbar } from "./components/Toolbar";

const nodeTypes = { entity: EntityCard };

const counts: Record<string, number> = contentStatus.counts;

function matchesQuery(entity: (typeof entities)[number], query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (entity.label.toLowerCase().includes(q)) return true;
  return entity.fields.some(
    (f) => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q),
  );
}

// Computed once at module scope — the graph structure is static, so there's no reason
// to recompute layout on every render (or every filter toggle, which would also fight
// with the user's manual dragging).
const layoutPositions = computeHierarchicalLayout(entities, edgeDefs, "LR");

const initialNodes: Node<EntityNodeData>[] = entities.map((entity) => ({
  id: entity.id,
  type: "entity",
  position: layoutPositions[entity.id] ?? { x: 0, y: 0 },
  data: { entity, count: counts[entity.id] ?? null, dimmed: false, matched: false },
}));

function InnerApp() {
  const [query, setQuery] = useState("");
  const [showSecondary, setShowSecondary] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // useNodesState + onNodesChange is what actually makes dragging persist — React Flow
  // is a controlled component; without wiring onNodesChange back into node state,
  // drag gestures render live but snap back on the next re-render.
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<EntityNodeData>>(initialNodes);

  // Search highlighting updates node `data` in place, never touching `position` — so
  // dragged layout survives searching/filtering.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const matched = query.length > 0 && matchesQuery(n.data.entity, query);
        const dimmed = query.length > 0 && !matched;
        if (n.data.matched === matched && n.data.dimmed === dimmed) return n;
        return { ...n, data: { ...n.data, matched, dimmed } };
      }),
    );
  }, [query, setNodes]);

  const displayedNodes = useMemo(
    () => nodes.filter((n) => showSecondary || n.data.entity.tier === "core"),
    [nodes, showSecondary],
  );
  const displayedIds = useMemo(() => new Set(displayedNodes.map((n) => n.id)), [displayedNodes]);

  const flowEdges: Edge[] = useMemo(
    () =>
      edgeDefs
        .filter((e) => displayedIds.has(e.source) && displayedIds.has(e.target))
        .map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: rowHandleId(e.source, e.sourceFieldIndex, "source"),
          targetHandle: rowHandleId(e.target, ID_FIELD_INDEX, "target"),
          type: "smoothstep",
          style: { strokeWidth: 1.5, strokeDasharray: "4 3" },
          animated: false,
        })),
    [displayedIds],
  );

  const selectedEntity = selectedId ? entities.find((e) => e.id === selectedId) ?? null : null;

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);

  return (
    <div className="relative h-screen w-screen bg-[#0a0a0c]">
      <ReactFlow
        className="rf-dark"
        nodes={displayedNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const data = n.data as unknown as EntityNodeData | undefined;
            return data?.entity?.tier === "core" ? "#059669" : "#4f46e5";
          }}
          maskColor="rgba(10,10,12,0.75)"
        />
      </ReactFlow>

      <div className="pointer-events-none absolute inset-0">
        <Toolbar
          query={query}
          onQueryChange={setQuery}
          showSecondary={showSecondary}
          onToggleSecondary={() => setShowSecondary((v) => !v)}
          totalEntities={entities.length}
          visibleEntities={displayedNodes.length}
        />
        {selectedEntity && (
          <DetailPanel
            entity={selectedEntity}
            count={counts[selectedEntity.id] ?? null}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <InnerApp />
    </ReactFlowProvider>
  );
}
