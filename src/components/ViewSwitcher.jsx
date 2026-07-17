const VIEWS = [
  { id: "board", label: "Quadro" },
  { id: "table", label: "Tabela" },
  { id: "calendar", label: "Calendário" },
  { id: "timeline", label: "Linha do tempo" },
  { id: "dashboard", label: "Painel" },
  { id: "map", label: "Mapa" },
  { id: "matrix", label: "Matriz Eisenhower" },
];

export default function ViewSwitcher({ view, onChange }) {
  return (
    <nav className="view-tabs">
      {VIEWS.map((v) => (
        <button key={v.id} className={"view-tab" + (view === v.id ? " active" : "")} onClick={() => onChange(v.id)}>
          {v.label}
        </button>
      ))}
    </nav>
  );
}
