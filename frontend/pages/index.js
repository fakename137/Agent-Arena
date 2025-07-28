import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <h1 className="title">BLOCKCHAIN BRAWL CHAMPIONSHIP</h1>
      <Link href="/battles/basement">
        <button>Enter Basement Battle</button>
      </Link>
    </div>
  );
}
