import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
        type: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readTime = post.data.content.reduce((sumTotal, content) => {
    const textTime = RichText.asText(content.body).split(' ').length;
    return Math.ceil(sumTotal + textTime / 200);
  }, 0);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <div className={commonStyles.container}>
        <div className={commonStyles.containerHeader}>
          <Header pageTitle={post.data.title} />
        </div>
      </div>

      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={post.data.title}
      />

      <div className={`${commonStyles.container} ${styles.mainPost}`}>
        <main className={commonStyles.content}>
          <h1>{post.data.title}</h1>

          <section className={`${commonStyles.info} ${styles.infoPost}`}>
            <div>
              <FiCalendar color="#BBBBBB" />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
            </div>
            <div>
              <FiUser color="#BBBBBB" />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock color="#BBBBBB" />
              <span>{readTime} min</span>
            </div>
          </section>

          {post.data.content.map(content => (
            <article key={content.heading}>
              <strong>{content?.heading}</strong>

              {content.body.map((body, index) => {
                const key = index;

                return body.type === 'list-item' ? (
                  <ul key={key}>
                    <li>{body.text}</li>
                  </ul>
                ) : (
                  <p key={key}>{body.text}</p>
                );
              })}
            </article>
          ))}
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const slugs = postsResponse.results.map(slug => slug.uid);

  return {
    paths: slugs.map(slug => {
      return {
        params: { slug },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body.map(body => {
            return {
              text: body.text,
              type: body.type,
              spans: [...body.spans],
            };
          }),
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24,
  };
};
