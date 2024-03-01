export function makeTwitterPost() {
  const tweetText = encodeURIComponent(`🪙  NōME  🪙  @nome_nft
  Just minted $NOME BRC-20 that has a utility:
  
  • Access to the NōME platform 
  • Rewarding Ordinals community
  • Discount for upcoming collections
  
  More info 👇
  https://brc20.nome.wtf/`);
  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`);
}
