import { useApp } from '../../app/store';
import { userById, type Post } from '../../data/db';
import { Avatar, AvatarStack, Icon, IconButton, Img, Tag } from '../ui';

export function PostCard({ post, compacto }: { post: Post; compacto?: boolean }) {
  const { d, go, abrir, toast } = useApp();
  const autor = userById(post.autorId);
  const comentaristas = post.comentarios
    .slice(0, 3)
    .map((c) => userById(c.autorId).avatar);

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => go('perfil', { userId: autor.id })}
          className="cursor-pointer border-0 bg-transparent p-0"
          aria-label={`Perfil de ${autor.nome}`}
        >
          <Avatar src={autor.avatar} size={40} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <button
            onClick={() => go('perfil', { userId: autor.id })}
            className="one-line cursor-pointer border-0 bg-transparent p-0 text-left text-[15px] font-semibold text-t1"
          >
            {autor.handle}
          </button>
          <span className="one-line flex items-center gap-1 text-xs text-t4">
            <Icon name="link" size={14} />
            {post.meta}
          </span>
        </div>
        <IconButton
          name="more"
          label="Mais opções da publicação"
          size={20}
          onClick={() => abrir('menu-post', { postId: post.id })}
        />
      </div>

      <p className="m-0 text-sm leading-relaxed break-words text-t2">
        {post.texto}{' '}
        {post.mencao && (
          <button
            onClick={() => toast(`Perfil de ${post.mencao} ainda não publicado`)}
            className="cursor-pointer border-0 bg-transparent p-0 font-medium text-brand-300"
          >
            {post.mencao}
          </button>
        )}{' '}
        {post.cauda}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Tag
              key={t}
              onClick={() => {
                d({ t: 'busca', valor: t.replace('#', '') });
                go('buscar');
              }}
            >
              {t}
            </Tag>
          ))}
        </div>
      )}

      <button
        onClick={() => go('post', { postId: post.id })}
        className="aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-elevated p-0"
        aria-label="Abrir publicação"
      >
        <Img src={post.media} alt={post.mediaAlt} />
      </button>

      {post.reacoes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.reacoes.map((r) => (
            <button
              key={r.emoji}
              onClick={() => abrir('reacoes', { postId: post.id })}
              aria-label={`${r.label}, ${r.count}`}
              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border bg-elevated px-2.5 text-xs text-t2 ${
                post.minhaReacao === r.emoji ? '' : 'border-line-strong'
              }`}
              style={
                post.minhaReacao === r.emoji
                  ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' }
                  : undefined
              }
            >
              <span aria-hidden>{r.emoji}</span>
              {r.count}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center">
        <button
          onClick={() => abrir('comentarios', { postId: post.id })}
          className="flex min-w-0 cursor-pointer items-center gap-2 border-0 bg-transparent p-0"
        >
          {comentaristas.length > 0 && <AvatarStack urls={comentaristas} />}
          <span className="one-line text-xs text-t3">
            {post.comentarios.length} comentários
          </span>
        </button>

        <div className="flex-1" />

        <IconButton
          name="like"
          label={post.curtido ? 'Remover curtida' : 'Curtir'}
          ativo={post.curtido}
          onClick={() => {
            d({ t: 'curtir', postId: post.id });
            if (!post.curtido) toast('Curtiu a publicação');
          }}
        />
        <IconButton
          name="chat"
          label="Comentar"
          onClick={() => abrir('comentarios', { postId: post.id })}
        />
        <IconButton
          name="share"
          label="Compartilhar"
          onClick={() => abrir('compartilhar', { postId: post.id })}
        />
        {!compacto && (
          <IconButton
            name="bookmark"
            label={post.salvo ? 'Remover dos salvos' : 'Salvar publicação'}
            ativo={post.salvo}
            onClick={() => {
              d({ t: 'salvar', postId: post.id });
              toast(post.salvo ? 'Removido dos salvos' : 'Salvo no seu perfil');
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-t4">
        <Icon name="like" size={14} />
        {post.curtidas} curtidas
      </div>
    </article>
  );
}
