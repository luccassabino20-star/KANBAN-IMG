import ThemeToggle from "../components/ThemeToggle.jsx";

const FEATURES = [
  { badge: "Q", title: "Quadro Kanban", text: "Organize tarefas em listas e cartões, e arraste e solte para mudar o andamento." },
  { badge: "T", title: "Tabela", text: "Veja todos os cartões em formato de planilha, com busca e filtro por membro." },
  { badge: "C", title: "Calendário", text: "Acompanhe prazos e datas de início dos cartões em uma visão mensal." },
  { badge: "L", title: "Linha do tempo", text: "Visualize o cronograma dos projetos período a período." },
  { badge: "P", title: "Painel", text: "Métricas e indicadores do progresso das suas equipes e quadros." },
  { badge: "M", title: "Mapa", text: "Localize tarefas com endereço cadastrado em um mapa interativo." },
  { badge: "E", title: "Matriz Eisenhower", text: "Priorize tarefas por urgência e importância de forma visual." },
  { badge: "A", title: "Atas de reunião", text: "Registre pauta, decisões e itens de ação de cada reunião da equipe." },
];

export default function LandingScreen({ onEnter }) {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <div className="landing-nav-brand">
          <span className="landing-nav-icon">IMG</span>
          <span>Kanban IMG</span>
        </div>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <button className="btn-primary btn-small" onClick={onEnter}>
            Entrar
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <h1>Organize projetos, tarefas e reuniões em um só lugar</h1>
        <p>
          O Kanban IMG reúne quadros colaborativos, agenda, prioridades e atas de reunião num sistema simples,
          rápido e feito para a sua equipe.
        </p>
        <div className="landing-hero-actions">
          <button className="btn-primary" onClick={onEnter}>
            Entrar no sistema
          </button>
        </div>
      </section>

      <section className="landing-features">
        <h2>Tudo o que a sua equipe precisa</h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div className="landing-feature-card" key={f.title}>
              <span className="landing-feature-badge">{f.badge}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-secondary">
        <div className="landing-secondary-item">
          <h3>Quadros privados e compartilhados</h3>
          <p>Separe o que é da equipe do que é só seu, com controle total de visibilidade.</p>
        </div>
        <div className="landing-secondary-item">
          <h3>Controle de usuários e papéis</h3>
          <p>Defina quem é administrador (master) e quem é membro da equipe.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <button className="btn-primary btn-small" onClick={onEnter}>
          Entrar no sistema
        </button>
      </footer>
    </div>
  );
}
