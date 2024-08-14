import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  if (!isLoaded || !isSignedIn) {
    router.push('/sign-in')
    return null
  }

  return <div>Welcome, {user.firstName}!</div>
}
