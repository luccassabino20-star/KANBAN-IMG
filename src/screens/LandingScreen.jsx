import ThemeToggle from "../components/ThemeToggle.jsx";

const FEATURES = [
  { badge: "Q", title: "Quadro Kanban", text: "Chega de tarefa perdida em print de conversa. Arraste e solte entre listas e veja o andamento real da equipe." },
  { badge: "T", title: "Tabela", text: "Todos os cartões em formato de planilha, com busca e filtro por membro — sem precisar de outra ferramenta." },
  { badge: "C", title: "Calendário", text: "Prazos e datas de início numa visão mensal, para nada passar despercebido." },
  { badge: "L", title: "Linha do tempo", text: "O cronograma inteiro do projeto num só olhar, período a período." },
  { badge: "P", title: "Painel", text: "Métricas e indicadores prontos para mostrar o progresso sem montar planilha nenhuma." },
  { badge: "M", title: "Mapa", text: "Tarefas com endereço plotadas num mapa interativo — ótimo para equipes em campo." },
  { badge: "E", title: "Matriz Eisenhower", text: "Priorize por urgência e importância e pare de trabalhar só no que grita mais alto." },
  { badge: "A", title: "Atas de reunião", text: "Pauta, decisões e itens de ação registrados — e cobrados depois." },
];

const BENEFITS = [
  { title: "Tudo num só lugar", text: "Substitua planilhas soltas, grupos de WhatsApp e ferramentas espalhadas por um único sistema." },
  { title: "Sua equipe já entende", text: "Interface simples, sem curso ou treinamento — quem já usou um quadro Kanban começa a usar em minutos." },
  { title: "Cresce com você", text: "De um time pequeno a várias áreas com quadros privados e compartilhados, controle de acessos e papéis." },
];

const PLANS = [
  {
    name: "Básico",
    price: "R$ 399",
    period: "/mês",
    tagline: "Para equipes pequenas começarem com o essencial",
    cta: "Assinar Básico",
    features: ["Até 3 usuários", "Quadros ilimitados", "Quadro Kanban, Tabela e Calendário", "Suporte por e-mail"],
  },
  {
    name: "Profissional",
    price: "R$ 799",
    period: "/usuário/mês",
    tagline: "Para equipes que querem controle total",
    cta: "Assinar Profissional",
    highlight: true,
    features: [
      "Usuários ilimitados",
      "Todas as visões (Painel, Mapa, Linha do tempo, Matriz Eisenhower)",
      "Atas de reunião",
      "Quadros privados e compartilhados",
      "Suporte prioritário",
    ],
  },
  {
    name: "Empresarial",
    price: "Sob consulta",
    period: "",
    tagline: "Para organizações com necessidades específicas",
    cta: "Falar com vendas",
    features: ["Tudo do Profissional", "Onboarding dedicado", "Suporte dedicado", "Acordo de nível de serviço (SLA)"],
  },
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
        <h1>Sua equipe organizada, sem esforço extra</h1>
        <p>
          O Kanban IMG substitui planilhas soltas e grupos de WhatsApp por um só lugar: quadros, prazos, prioridades
          e atas de reunião, sincronizados em tempo real para toda a equipe.
        </p>
        <div className="landing-hero-actions">
          <button className="btn-primary" onClick={onEnter}>
            Comece agora
          </button>
          <a className="btn-secondary landing-hero-secondary" href="#planos">
            Ver planos
          </a>
        </div>
        <p className="landing-hero-note">Sem burocracia. Cancele quando quiser.</p>
      </section>

      <section className="landing-benefits">
        {BENEFITS.map((b) => (
          <div className="landing-benefit-item" key={b.title}>
            <h3>{b.title}</h3>
            <p>{b.text}</p>
          </div>
        ))}
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

      <section className="landing-pricing" id="planos">
        <h2>Escolha o plano da sua equipe</h2>
        <p className="landing-pricing-sub">Escolha o plano ideal para sua equipe e mude quando ela crescer.</p>
        <div className="landing-pricing-grid">
          {PLANS.map((p) => (
            <div className={"landing-plan-card" + (p.highlight ? " highlight" : "")} key={p.name}>
              {p.highlight && <span className="landing-plan-badge">Mais popular</span>}
              <h3>{p.name}</h3>
              <p className="landing-plan-tagline">{p.tagline}</p>
              <div className="landing-plan-price">
                <span className="landing-plan-price-value">{p.price}</span>
                <span className="landing-plan-price-period">{p.period}</span>
              </div>
              <button className={p.highlight ? "btn-primary" : "btn-secondary"} onClick={onEnter}>
                {p.cta}
              </button>
              <ul className="landing-plan-features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
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
        <h2>Pronto para organizar sua equipe?</h2>
        <button className="btn-primary" onClick={onEnter}>
          Comece agora
        </button>
      </footer>
    </div>
  );
}
