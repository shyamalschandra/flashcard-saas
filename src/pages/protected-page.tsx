import { withAuth, getAuth } from '@clerk/nextjs/server';
import { GetServerSidePropsContext } from 'next';

function ProtectedPage() {
  return <div>This is a protected page</div>
}

export const getServerSideProps = withAuth(async (context: GetServerSidePropsContext) => {
  const { userId } = getAuth(context.req);
  // Your server-side logic here
  return { props: { userId } }
});

export default ProtectedPage