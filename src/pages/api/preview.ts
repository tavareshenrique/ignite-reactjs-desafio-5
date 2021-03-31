import { Document } from '@prismicio/client/types/documents';
import { getPrismicClient } from '../../services/prismic';

export function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

// eslint-disable-next-line consistent-return
const Preview = async (req, res): Promise<void> => {
  const { token: ref, documentId } = req.query;
  const redirectUrl = await getPrismicClient(req)
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { Location: `${redirectUrl}` });
  // res.write(
  //   `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
  //   <script>window.location.href = '${redirectUrl}'</script>
  //   </head>`
  // );
  res.end();
};
export default Preview;
