import { withUrqlClient } from 'next-urql'
import { AppBar } from '../components/AppBar'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [{ data }] = usePostsQuery()
  return (
    <div>
      <AppBar />
      {!data ? null : data.posts.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
