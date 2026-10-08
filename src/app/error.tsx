'use client';
export default function ErrorPage({reset}: {reset:()=>void}){return <main className="standalone-state"><h1>We couldn’t load this page.</h1><p>Your saved records remain in the database. Try loading the page again.</p><button className="btn btn-primary" onClick={reset}>Try again</button></main>;}
