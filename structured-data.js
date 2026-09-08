const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DeFlitsbus",
  url: "https://deflitsbus.nl/",
  telephone: "+31620424220",
  email: "DeFlitsbus@outlook.com",
  areaServed: "Drenthe & omgeving",
  sameAs: [
    "https://instagram.com/deflitsbusopwielen",
    "https://facebook.com/profile.php?id=61580260239902",
    "https://wa.me/31620424220",
  ],
};

const script = document.createElement("script");
script.type = "application/ld+json";
script.text = JSON.stringify(structuredData);
document.head.appendChild(script);
