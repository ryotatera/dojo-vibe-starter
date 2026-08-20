// このファイルが、トップページの中身です。
// Claude Code に「トップページをこう書き換えて」と頼むと、ここが書き換わります。

export default function Home() {
  return (
    <main className="container">
      <span className="eyebrow">DOJO vibeコーディング講座</span>

      <h1 className="title">
        このページは、まだ誰のものでもありません。
      </h1>

      <p className="lead">
        ここに入るのは、あなたの事業の説明です。
        まず <code>docs/01_customer.md</code> に「誰の、どんな困りごとを解くのか」を書いてから、
        Claude Code にこのページの書き換えを頼んでください。
      </p>

      <a className="button" href="#next">
        次にやること
      </a>

      <section className="card" id="next">
        <h2>次にやること</h2>
        <ol>
          <li>
            <code>docs/01_customer.md</code> を開いて、空欄を埋める
            （実在する人を1人、思い浮かべながら書く）
          </li>
          <li>
            <a href="https://claude.ai/code" target="_blank" rel="noreferrer">
              claude.ai/code
            </a>{" "}
            を開き、このリポジトリを選ぶ
          </li>
          <li>
            <code>
              docs/01_customer.md を読んで、その内容に合わせて app/page.tsx
              を書き換えてください
            </code>
            と頼む
          </li>
          <li>差分を確認して Create PR → GitHub でマージ</li>
          <li>数分待つと、自分の公開URLの中身が変わっている</li>
        </ol>
        <p className="note">
          色や余白を変えたいときは <code>app/globals.css</code> の
          一番上にある変数（<code>--color-accent</code> など）を変更するよう頼んでください。
          個別に色を指定させると、あとで全体が揃わなくなります。
        </p>
      </section>
    </main>
  );
}
