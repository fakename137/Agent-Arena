import Link from 'next/link';

export default function BattleSelection() {
  return (
    <div className="container">
      <main className="main">
        <h1 className="title">SELECT BATTLE ARENA</h1>

        <p className="description">Choose your fight environment</p>

        <div className="grid">
          <Link href="/battles/basement" className="card">
            <h2>Basement Fight Club &rarr;</h2>
            <p>The classic underground boxing ring with industrial elements</p>
          </Link>

          <div className="card">
            <h2>Arena Championship &rarr;</h2>
            <p>Coming Soon: Professional boxing stadium</p>
          </div>

          <div className="card">
            <h2>Street Showdown &rarr;</h2>
            <p>Coming Soon: Urban street fighting environment</p>
          </div>

          <div className="card">
            <h2>Custom Arena &rarr;</h2>
            <p>Coming Soon: Create your own battle environment</p>
          </div>
        </div>

        <Link href="/" className="battle-link">
          Back to Home
        </Link>
      </main>
    </div>
  );
}
