import Link from 'next/link'

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Flashcard App</h1>
      <Link href="/auth">
        <button>Go to Subscriptions</button>
      </Link>
      <Link href="/flashcards">
        <button>Go to Flashcards</button>
      </Link>
      <Link href="/sign-in">
        <button>Sign In</button>
      </Link>
    </div>
  )
}

export default HomePage