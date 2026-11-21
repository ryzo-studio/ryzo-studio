import html from "../the-dial-page.html?raw";

// The Dial page for foundations and impact funders (src/the-dial-page.html),
// served verbatim at /The-Dial so Astro's template compiler never touches the
// hand-built document. Hidden: not linked from the site's menus, and the page
// carries a noindex tag. The investor site's Dial card links here.
export const prerender = false;

export const GET = () =>
  new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
    },
  });
