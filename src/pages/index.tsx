import { GetStaticProps } from 'next';
import Link from 'next/link';

import Prismic from '@prismicio/client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';
import HomePost from '../components/HomePost';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview?: boolean;
}

export default function Home({ postsPagination, preview = false }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [results, setResults] = useState<Post[]>(
    postsPagination.results.map(result => {
      return {
        ...result,
        first_publication_date: format(
          new Date(result.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    })
  );

  function handleNextPage(): void {
    fetch(nextPage).then(response => {
      response.json().then(responsePrismic => {
        setNextPage(responsePrismic.next_page);

        const posts = responsePrismic.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setResults([...results, ...posts]);
      });
    });
  }

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.containerHeader}>
        <Header pageTitle="Home" />
      </div>

      <main className={commonStyles.content}>
        {results.map(post => (
          <HomePost
            key={post.uid}
            slug={post.uid}
            data={post.data}
            first_publication_date={post.first_publication_date}
          />
        ))}
      </main>

      {postsPagination.next_page !== null && (
        <footer className={styles.homeFooter}>
          <button type="button" onClick={handleNextPage}>
            Carregar mais posts
          </button>
        </footer>
      )}

      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        author: post.data.author,
        subtitle: post.data.subtitle,
        title: post.data.title,
      },
    } as Post;
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
  };
};
