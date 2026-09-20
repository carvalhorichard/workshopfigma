import { useApp } from './app/store';
import { Toasts } from './components/ui';
import { Sheets } from './sheets';
import { Cadastro, Login } from './screens/Auth';
import { Home } from './screens/Home';
import { Buscar } from './screens/Buscar';
import { Criar, CriarStory } from './screens/Criar';
import { GrupoDetalhe, Grupos } from './screens/Grupos';
import { Chat, Mensagens } from './screens/Mensagens';
import { EditarPerfil, Perfil } from './screens/Perfil';
import { Configuracoes, Notificacoes, PostDetalhe } from './screens/Diversos';

export function App() {
  const { s, rota } = useApp();

  if (!s.autenticado) {
    return (
      <>
        {rota.view === 'cadastro' ? <Cadastro /> : <Login />}
        <Toasts />
      </>
    );
  }

  let tela: React.ReactNode;
  switch (rota.view) {
    case 'buscar':
      tela = <Buscar />;
      break;
    case 'criar':
      tela = <Criar />;
      break;
    case 'criar-story':
      tela = <CriarStory />;
      break;
    case 'grupos':
      tela = <Grupos />;
      break;
    case 'grupo':
      tela = <GrupoDetalhe />;
      break;
    case 'mensagens':
      tela = <Mensagens />;
      break;
    case 'chat':
      tela = <Chat />;
      break;
    case 'notificacoes':
      tela = <Notificacoes />;
      break;
    case 'perfil':
      tela = <Perfil />;
      break;
    case 'editar-perfil':
      tela = <EditarPerfil />;
      break;
    case 'config':
      tela = <Configuracoes />;
      break;
    case 'post':
      tela = <PostDetalhe />;
      break;
    default:
      tela = <Home />;
  }

  return (
    <>
      {/* a key força o scroll a voltar ao topo a cada troca de view */}
      <div key={`${rota.view}-${JSON.stringify(rota.params ?? {})}`}>{tela}</div>
      <Sheets />
      <Toasts />
    </>
  );
}
