export const metadata = { title: "Unsubscribe | Yarden", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function UnsubscribePage({ searchParams: params }: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await params;
  const token = typeof searchParams?.token === "string" && /^[a-f0-9]{64}$/.test(searchParams.token) ? searchParams.token : "";
  return <main style={{minHeight:"100vh",background:"#111",color:"#fff",fontFamily:"Arial,sans-serif",display:"grid",placeItems:"center",padding:24}}>
    <section style={{maxWidth:450,textAlign:"center"}}><p style={{letterSpacing:4}}>YARDEN / THE YARD</p><h1 style={{fontSize:38}}>Email preferences</h1>
    <p style={{lineHeight:1.7,opacity:.75}}>You can stop receiving Yarden promotional updates here. This does not remove your Yard Pass.</p>
    {token ? <form method="post" action="/api/unsubscribe"><input type="hidden" name="token" value={token}/><button type="submit" style={{padding:"14px 26px",border:0,borderRadius:8,cursor:"pointer",background:"#e3c8a1",color:"#111",fontWeight:700}}>Unsubscribe from updates</button></form> : <p>This link is missing or invalid.</p>}
    </section>
  </main>;
}
