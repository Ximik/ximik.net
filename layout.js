export default function (body, { title, description }) {
  return `
<!doctype html>
<html>
  <head>
    <title>${title}</title>
    ${description ? `<meta name="description" content="${description}">` : ""}
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/main.css">
  </head>
  <body>
    <header>
      <div class="wrapper">
        <nav><a href='/'>Home</a></nav>
      </div>
    </header>
    <main>
      <div class="wrapper">
        ${body}
      </div>
    </main>
    <footer>
      <div class="wrapper">
        &copy; 2020 Alex Tsokurov</div>
      </div>
    </footer>
  </body>
</html>
`;
}
