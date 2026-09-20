import { useApp, useAcao } from '../../app/store';
import { api } from '../../lib/api';
import type { Post } from '../../data/types';
import { Avatar, Icon, IconButton, Img, Tag } from '../ui';

export function PostCard({ post }: { post: Post }) {
  const { go, abrir, set, aplicarPost, toast } = useApp();
  const acao = useAcao();

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => go('perfil', { handle: post.autor.handle })}
          className="cursor-pointer border-0 bg-transparent p-0"
          aria-label={`Perfil de ${post.autor.nome}`}
        >
          <Avatar src={post.autor.avatar} nome={post.autor.nome} size={40} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <button
            onClick={() => go('perfil', { handle: post.autor.handle })}
            className="one-line cursor-pointer border-0 bg-transparent p-0 text-left text-[15px] font-semibold text-t1"
          >
            {post.autor.handle}
          </button>
          <span className="one-line text-xs text-t4">{post.meta}</span>
        </div>
        <IconButton
          name="more"
          label="Mais opções da publicação"
          size={20}
          onClick={() => abrir('menu-post', { postId: post.id })}
        />
      </div>

      {post.texto && (
        <p className="m-0 text-sm leading-relaxed break-words text-t2">{post.texto}</p>
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Tag
              key={t}
              onClick={() => {
                set('busca', t.replace('#', ''));
                go('buscar');
              }}
            >
              {t}
            </Tag>
          ))}
        </div>
      )}

      {post.media && (
        <button
          onClick={() => go('post', { postId: post.id })}
          className="aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-elevated p-0"
          aria-label="Abrir publicação"
        >
          <Img src={post.media} alt={post.mediaAlt} />
        </button>
      )}

      {post.reacoes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.reacoes.map((r) => (
            <button
              key={r.emoji}
              onClick={() => abrir('reacoes', { postId: post.id })}
              aria-label={`${r.emoji}, ${r.count}`}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border bg-elevated px-2.5 text-xs text-t2"
              style={
                post.minhaReacao === r.emoji
                  ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' }
                  : { borderColor: 'var(--color-line-strong)' }
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
          className="flex min-w-0 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-xs text-t3"
        >
          <Icon name="chat" size={16} />
          {post.comentarios === 0
            ? 'Comentar'
            : `${post.comentarios} comentário${post.comentarios > 1 ? 's' : ''}`}
        </button>

        <div className="flex-1" />

        <IconButton
          name="like"
          label={post.curtido ? 'Remover curtida' : 'Curtir'}
          ativo={post.curtido}
          onClick={() =>
            acao(async () => {
              const r = await api.curtir(post.id);
              aplicarPost(post.id, { curtido: r.liked, curtidas: Number(r.like_count) });
            })
          }
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
        <IconButton
          name="bookmark"
          label={post.salvo ? 'Remover dos salvos' : 'Salvar publicação'}
          ativo={post.salvo}
          onClick={() =>
            acao(async () => {
              const r = await api.salvar(post.id);
              aplicarPost(post.id, { salvo: r.bookmarked });
              toast(r.bookmarked ? 'Salvo no seu perfil' : 'Removido dos salvos');
            })
          }
        />
      </div>

      {post.curtidas > 0 && (
        <div className="flex items-center gap-1 text-xs text-t4">
          <Icon name="like" size={14} />
          {post.curtidas} {post.curtidas === 1 ? 'curtida' : 'curtidas'}
        </div>
      )}
    </article>
  );
}
